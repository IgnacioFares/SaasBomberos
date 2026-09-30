package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.config.PartesCatalogo;
import com.bomberos.saas_bomberos.config.PermisosCatalogo;
import com.bomberos.saas_bomberos.dto.ParteRequest;
import com.bomberos.saas_bomberos.dto.ParteResponse;
import com.bomberos.saas_bomberos.dto.ParteResumenResponse;
import com.bomberos.saas_bomberos.entity.*;
import com.bomberos.saas_bomberos.repository.ParteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
@RequiredArgsConstructor
public class ParteService {

    private final ParteRepository parteRepository;
    private final AutorizacionService autorizacion;

    public List<ParteResumenResponse> obtenerTodos() {
        return parteRepository.findAllByOrderByFechaHechoDescIdDesc().stream().map(this::mapearResumen).toList();
    }

    public ParteResponse obtenerPorId(Long id) {
        return mapear(obtenerEntidad(id));
    }

    public ParteResponse crear(ParteRequest request, Usuario usuario) {
        autorizacion.exigir(usuario, PermisosCatalogo.GESTIONAR_PARTES);
        validar(request);

        Parte parte = new Parte();
        parte.setCreadoPor(usuario);
        parte.setEstado(ParteEstado.BORRADOR);
        aplicar(parte, request);

        return mapear(parteRepository.save(parte));
    }

    public ParteResponse actualizar(Long id, ParteRequest request, Usuario usuario) {
        Parte parte = obtenerEntidad(id);
        exigirPuedeEditar(parte, usuario);
        validar(request);

        aplicar(parte, request);

        return mapear(parteRepository.save(parte));
    }

    public ParteResponse finalizar(Long id, Usuario usuario) {
        Parte parte = obtenerEntidad(id);
        exigirPuedeEditar(parte, usuario);
        if (parte.getEstado() != ParteEstado.BORRADOR) {
            throw new RuntimeException("El parte ya está finalizado");
        }
        if (parte.getDatosPrimordiales().getHoraSalida() == null) {
            throw new RuntimeException("La hora de salida es obligatoria para finalizar el parte");
        }
        if (parte.getNumeroParte() == null) {
            asignarNumeroParte(parte);
        }
        parte.setEstado(ParteEstado.FINALIZADO);
        return mapear(parteRepository.save(parte));
    }

    // Numeración correlativa mensual (única para todos los tipos de parte,
    // como el libro de partes físico): se reinicia en 1 cada mes según
    // fechaHecho y el orden es cronológico real del hecho (fecha + hora de
    // salida), no el orden de carga. Si se finaliza tarde un parte cuya
    // fecha/hora cae antes de otros ya numerados de ese mes, este se
    // inserta en su lugar y los posteriores se corren +1 en cascada. El
    // número se fija una sola vez, al finalizar (nunca en BORRADOR), y no
    // se toca de nuevo aunque el parte se reabra más adelante.
    private void asignarNumeroParte(Parte parte) {
        LocalDate fecha = parte.getFechaHecho();
        LocalDate inicioMes = fecha.withDayOfMonth(1);
        LocalDate finMes = fecha.withDayOfMonth(fecha.lengthOfMonth());

        List<Parte> delMes = parteRepository.findDelMesOrdenados(ParteEstado.FINALIZADO, inicioMes, finMes);

        LocalTime horaSalida = parte.getDatosPrimordiales().getHoraSalida();
        int posicion = 1;
        for (Parte existente : delMes) {
            if (esCronologicamenteAnterior(existente, fecha, horaSalida, parte.getId())) {
                posicion++;
            } else {
                existente.setNumeroParte(existente.getNumeroParte() + 1);
                parteRepository.save(existente);
            }
        }
        parte.setNumeroParte(posicion);
    }

    // true si "existente" quedó antes en el orden cronológico que
    // (fecha, horaSalida) del parte que se está finalizando; el id
    // desempata partes con la misma fecha y hora de salida exacta.
    private boolean esCronologicamenteAnterior(Parte existente, LocalDate fecha, LocalTime horaSalida, Long id) {
        int cmpFecha = existente.getFechaHecho().compareTo(fecha);
        if (cmpFecha != 0) return cmpFecha < 0;
        int cmpHora = existente.getDatosPrimordiales().getHoraSalida().compareTo(horaSalida);
        if (cmpHora != 0) return cmpHora < 0;
        return existente.getId().compareTo(id) < 0;
    }

    // Reabrir un parte finalizado para corregirlo: solo un administrador
    // puede hacerlo (rol de supervisor mencionado en los requisitos).
    public ParteResponse reabrir(Long id, Usuario usuario) {
        autorizacion.exigirAdministrador(usuario);
        Parte parte = obtenerEntidad(id);
        if (parte.getEstado() != ParteEstado.FINALIZADO) {
            throw new RuntimeException("El parte no está finalizado");
        }
        parte.setEstado(ParteEstado.BORRADOR);
        return mapear(parteRepository.save(parte));
    }

    public Parte obtenerEntidad(Long id) {
        return parteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parte no encontrado"));
    }

    // Solo el creador o un administrador pueden crear/editar/finalizar; un
    // parte finalizado deja de ser editable salvo para un administrador.
    private void exigirPuedeEditar(Parte parte, Usuario usuario) {
        autorizacion.exigir(usuario, PermisosCatalogo.GESTIONAR_PARTES);
        boolean esAdmin = autorizacion.esAdministrador(usuario);
        boolean esCreador = usuario.getId() != null && Objects.equals(parte.getCreadoPor().getId(), usuario.getId());
        if (!esAdmin && !esCreador) {
            throw new AccesoDenegadoException("Solo quien creó el parte o un administrador puede editarlo");
        }
        if (!esAdmin && parte.getEstado() == ParteEstado.FINALIZADO) {
            throw new AccesoDenegadoException("El parte está finalizado; solo un administrador puede reabrirlo");
        }
    }

    private void validar(ParteRequest request) {
        if (request.tipoParte() == null) {
            throw new RuntimeException("El tipo de parte es obligatorio");
        }
        if (request.fechaHecho() == null) {
            throw new RuntimeException("La fecha del hecho es obligatoria");
        }
        if (request.tipoParte() == TipoParte.MATERIALES_PELIGROSOS
                && request.datosMaterialesPeligrosos() != null
                && request.datosMaterialesPeligrosos().tipoEvento() == TipoEventoMatPeligroso.EXPLOSION
                && request.datosMaterialesPeligrosos().situacionQueOcurrioPrimero() == null) {
            throw new RuntimeException("Indicá qué ocurrió primero cuando el evento fue una explosión");
        }
    }

    // --- Mapeo request -> entidad ------------------------------------

    private void aplicar(Parte parte, ParteRequest r) {
        parte.setTipoParte(r.tipoParte());
        parte.setNumeroRuba(r.numeroRuba());
        parte.setFechaHecho(r.fechaHecho());
        parte.setCuerpoParticipante(r.cuerpoParticipante());
        parte.setAmpliatorio(r.ampliatorio());

        parte.setLocalizacion(mapLocalizacion(r.localizacion()));
        parte.setSolicitante(mapSolicitante(r.solicitante()));
        parte.setDatosPrimordiales(mapDatosPrimordiales(r.datosPrimordiales()));
        parte.setSuperficieAfectada(mapSuperficieAfectada(r.superficieAfectada()));
        parte.setDatosAccidente(mapDatosAccidente(r.datosAccidente()));
        parte.setDatosIncendioIndustrial(mapDatosIncendioIndustrial(r.datosIncendioIndustrial()));
        parte.setDatosIncendioForestalLugar(mapDatosIncendioForestalLugar(r.datosIncendioForestalLugar()));
        parte.setDatosIncendioVivienda(mapDatosIncendioVivienda(r.datosIncendioVivienda()));
        parte.setDatosCapacitacion(mapDatosCapacitacion(r.datosCapacitacion()));
        parte.setDatosRescate(mapDatosRescate(r.datosRescate()));
        parte.setDatosMaterialesPeligrosos(mapDatosMaterialesPeligrosos(r.datosMaterialesPeligrosos()));
        parte.setDatosServiciosEspeciales(mapDatosServiciosEspeciales(r.datosServiciosEspeciales()));
        parte.setDatosFalsaAlarma(mapDatosFalsaAlarma(r.datosFalsaAlarma()));

        parte.getPersonasDamnificadas().clear();
        if (r.personasDamnificadas() != null) {
            int orden = 0;
            for (ParteRequest.PersonaDamnificadaRequest pr : r.personasDamnificadas()) {
                PartePersonaDamnificada p = new PartePersonaDamnificada();
                p.setRol(pr.rol());
                p.setNombreApellido(pr.nombreApellido());
                p.setDni(pr.dni());
                p.setTelefono(pr.telefono());
                p.setDomicilio(pr.domicilio());
                p.setOrden(orden++);
                parte.getPersonasDamnificadas().add(p);
            }
        }

        parte.getEntidadesIntervino().clear();
        if (r.entidadesIntervino() != null) {
            int orden = 0;
            for (ParteRequest.EntidadIntervinoRequest er : r.entidadesIntervino()) {
                ParteEntidadIntervino e = new ParteEntidadIntervino();
                e.setFilaPrincipal(Boolean.TRUE.equals(er.filaPrincipal()));
                e.setSeConstato(er.seConstato());
                e.setEntidad(er.entidad());
                e.setMovilNro(er.movilNro());
                e.setACargo(er.aCargo());
                e.setOrden(orden++);
                parte.getEntidadesIntervino().add(e);
            }
        }

        parte.getVehiculos().clear();
        if (r.vehiculos() != null) {
            int orden = 0;
            for (ParteRequest.VehiculoRequest vr : r.vehiculos()) {
                ParteVehiculo v = new ParteVehiculo();
                v.setTipo(vr.tipo());
                v.setMarca(vr.marca());
                v.setDominio(vr.dominio());
                v.setModelo(vr.modelo());
                v.setAnio(vr.anio());
                v.setAseguradora(vr.aseguradora());
                v.setPoliza(vr.poliza());
                v.setOrden(orden++);
                parte.getVehiculos().add(v);
            }
        }
    }

    private LocalizacionInfo mapLocalizacion(ParteRequest.LocalizacionRequest r) {
        LocalizacionInfo info = new LocalizacionInfo();
        if (r == null) return info;
        info.setLocalidad(r.localidad());
        info.setDistrito(r.distrito());
        info.setCalleRuta(r.calleRuta());
        info.setNumeroKm(r.numeroKm());
        info.setEntreCalles(r.entreCalles());
        info.setTipoZona(r.tipoZona());
        return info;
    }

    private SolicitanteInfo mapSolicitante(ParteRequest.SolicitanteRequest r) {
        SolicitanteInfo info = new SolicitanteInfo();
        if (r == null) return info;
        info.setNombre(r.nombre());
        info.setApellido(r.apellido());
        info.setDni(r.dni());
        info.setTelefono(r.telefono());
        return info;
    }

    private DatosPrimordialesInfo mapDatosPrimordiales(ParteRequest.DatosPrimordialesRequest r) {
        DatosPrimordialesInfo info = new DatosPrimordialesInfo();
        if (r == null) return info;
        info.setParticipoComisionDirectiva(r.participoComisionDirectiva());
        info.setParticipoComisionDetalle(r.participoComisionDetalle());
        info.setHoraLlamado(r.horaLlamado());
        info.setHoraSalida(r.horaSalida());
        info.setHoraArribo(r.horaArribo());
        info.setHoraTerminada(r.horaTerminada());
        info.setHoraRegresoCuartel(r.horaRegresoCuartel());
        info.setACargo(r.aCargo());
        info.setOperador(r.operador());
        info.setMovilNro(r.movilNro());
        info.setChofer(r.chofer());
        info.setApoyoMovilNro(r.apoyoMovilNro());
        info.setChoferApoyo(r.choferApoyo());
        info.setDotacionMovil(r.dotacionMovil());
        info.setDotacionApoyoMovil(r.dotacionApoyoMovil());
        return info;
    }

    private SuperficieAfectadaInfo mapSuperficieAfectada(ParteRequest.SuperficieAfectadaRequest r) {
        SuperficieAfectadaInfo info = new SuperficieAfectadaInfo();
        if (r == null) return info;
        info.setNoEvacuo(r.noEvacuo());
        info.setKilometros(r.kilometros());
        info.setMetros(r.metros());
        info.setHectareas(r.hectareas());
        info.setDetalle(r.detalle());
        return info;
    }

    private DatosAccidente mapDatosAccidente(ParteRequest.DatosAccidenteRequest r) {
        DatosAccidente d = new DatosAccidente();
        if (r == null) return d;
        d.setClimaLluvia(r.climaLluvia());
        d.setClimaNeblina(r.climaNeblina());
        d.setClimaSoleado(r.climaSoleado());
        d.setClimaVentoso(r.climaVentoso());
        d.setClimaNoche(r.climaNoche());
        d.setClimaOtro(r.climaOtro());
        d.setClimaOtroDetalle(r.climaOtroDetalle());
        d.setCausaChoque(r.causaChoque());
        d.setTipoChoque(r.tipoChoque());
        d.setCausaDespiste(r.causaDespiste());
        d.setCausaDerrame(r.causaDerrame());
        d.setTipoDerrame(r.tipoDerrame());
        d.setCausaVuelco(r.causaVuelco());
        return d;
    }

    private DatosIncendioIndustrial mapDatosIncendioIndustrial(ParteRequest.DatosIncendioIndustrialRequest r) {
        DatosIncendioIndustrial d = new DatosIncendioIndustrial();
        if (r == null) return d;
        d.setSubtipoIndustrial(r.subtipoIndustrial());
        d.setSubtipoIndustrialOtroDetalle(r.subtipoIndustrialOtroDetalle());
        d.setCausaIncendio(r.causaIncendio());
        return d;
    }

    private DatosIncendioForestalLugar mapDatosIncendioForestalLugar(ParteRequest.DatosIncendioForestalLugarRequest r) {
        DatosIncendioForestalLugar d = new DatosIncendioForestalLugar();
        if (r == null) return d;
        d.setLugarCampo(r.lugarCampo());
        d.setLugarPastizal(r.lugarPastizal());
        d.setLugarArbustalMatorral(r.lugarArbustalMatorral());
        d.setLugarInterfase(r.lugarInterfase());
        d.setLugarBasural(r.lugarBasural());
        d.setLugarOtro(r.lugarOtro());
        d.setLugarOtroDetalle(r.lugarOtroDetalle());
        return d;
    }

    private DatosIncendioVivienda mapDatosIncendioVivienda(ParteRequest.DatosIncendioViviendaRequest r) {
        DatosIncendioVivienda d = new DatosIncendioVivienda();
        if (r == null) return d;
        d.setSeguroCompania(r.seguroCompania());
        d.setSeguroPoliza(r.seguroPoliza());
        d.setSeguroVencimiento(r.seguroVencimiento());
        d.setTipoLugarCasa(r.tipoLugarCasa());
        d.setTipoLugarDepto(r.tipoLugarDepto());
        d.setTipoLugarCasilla(r.tipoLugarCasilla());
        d.setTipoLugarRancho(r.tipoLugarRancho());
        d.setTipoLugarMultifuncional(r.tipoLugarMultifuncional());
        d.setTipoLugarOtro(r.tipoLugarOtro());
        d.setTipoLugarOtroDetalle(r.tipoLugarOtroDetalle());
        d.setTechoMaderaPaja(r.techoMaderaPaja());
        d.setTechoYeso(r.techoYeso());
        d.setTechoTejas(r.techoTejas());
        d.setTechoChapaMetalica(r.techoChapaMetalica());
        d.setTechoChapaCarton(r.techoChapaCarton());
        d.setAberturaMadera(r.aberturaMadera());
        d.setAberturaAceroHierro(r.aberturaAceroHierro());
        d.setAberturaAluminio(r.aberturaAluminio());
        d.setAberturaPlastico(r.aberturaPlastico());
        d.setAberturaOtro(r.aberturaOtro());
        d.setAberturaOtroDetalle(r.aberturaOtroDetalle());
        return d;
    }

    private DatosCapacitacion mapDatosCapacitacion(ParteRequest.DatosCapacitacionRequest r) {
        DatosCapacitacion d = new DatosCapacitacion();
        if (r == null) return d;
        d.setNivelCapacitacion(r.nivelCapacitacion());
        d.setNivelCapacitacionOtroDetalle(r.nivelCapacitacionOtroDetalle());
        d.setTipoIncendioEstructural(r.tipoIncendioEstructural());
        d.setTipoIncendioForestal(r.tipoIncendioForestal());
        d.setTipoUsarBrec(r.tipoUsarBrec());
        d.setTipoGrimpRtc(r.tipoGrimpRtc());
        d.setTipoMatPel(r.tipoMatPel());
        d.setTipoPsicologiaEmergencia(r.tipoPsicologiaEmergencia());
        d.setTipoRescateAcuatico(r.tipoRescateAcuatico());
        d.setTipoRescateVehicular(r.tipoRescateVehicular());
        d.setTipoSocorrismo(r.tipoSocorrismo());
        d.setTipoEscuelaCadetes(r.tipoEscuelaCadetes());
        d.setTipoComandoIncidente(r.tipoComandoIncidente());
        d.setTipoOtra(r.tipoOtra());
        d.setTipoOtraDetalle(r.tipoOtraDetalle());
        d.setDetalleLibre(r.detalleLibre());
        d.setDiasCapacitacion(r.diasCapacitacion());
        d.setHorasCapacitacion(r.horasCapacitacion());
        return d;
    }

    private DatosRescate mapDatosRescate(ParteRequest.DatosRescateRequest r) {
        DatosRescate d = new DatosRescate();
        if (r == null) return d;
        d.setSubtipo(r.subtipo());
        d.setSubtipoOtroDetalle(r.subtipoOtroDetalle());
        d.setLugarCasas(r.lugarCasas());
        d.setLugarEdificio(r.lugarEdificio());
        d.setLugarArbol(r.lugarArbol());
        d.setLugarRios(r.lugarRios());
        d.setLugarPileta(r.lugarPileta());
        d.setLugarLagos(r.lugarLagos());
        d.setLugarOtro(r.lugarOtro());
        d.setLugarOtroDetalle(r.lugarOtroDetalle());
        return d;
    }

    private DatosMaterialesPeligrosos mapDatosMaterialesPeligrosos(ParteRequest.DatosMaterialesPeligrososRequest r) {
        DatosMaterialesPeligrosos d = new DatosMaterialesPeligrosos();
        if (r == null) return d;
        d.setSustanciasInvolucradas(r.sustanciasInvolucradas());
        d.setTipoEvento(r.tipoEvento());
        d.setAccMatQuemaControlada(r.accMatQuemaControlada());
        d.setAccMatVenteo(r.accMatVenteo());
        d.setAccMatDilucionVapores(r.accMatDilucionVapores());
        d.setAccMatTrasvase(r.accMatTrasvase());
        d.setAccMatOtra(r.accMatOtra());
        d.setAccMatOtraDetalle(r.accMatOtraDetalle());
        d.setAccPersEvacuacion(r.accPersEvacuacion());
        d.setAccPersDescontaminacion(r.accPersDescontaminacion());
        d.setAccPersConfinamiento(r.accPersConfinamiento());
        d.setAccPersSinAccion(r.accPersSinAccion());
        d.setAccPersOtra(r.accPersOtra());
        d.setAccPersOtraDetalle(r.accPersOtraDetalle());
        d.setSituacionQueOcurrioPrimero(r.situacionQueOcurrioPrimero());
        return d;
    }

    private DatosServiciosEspeciales mapDatosServiciosEspeciales(ParteRequest.DatosServiciosEspecialesRequest r) {
        DatosServiciosEspeciales d = new DatosServiciosEspeciales();
        if (r == null) return d;
        d.setSubtipo(r.subtipo());
        d.setServOtrasFuerzas(r.servOtrasFuerzas());
        d.setServEntidadesGubernamentales(r.servEntidadesGubernamentales());
        d.setServEmpresaPrivada(r.servEmpresaPrivada());
        d.setServDetalle(r.servDetalle());
        d.setRepDesfile(r.repDesfile());
        d.setRepHonoresFunebres(r.repHonoresFunebres());
        d.setRepAniversarios(r.repAniversarios());
        d.setRepEventosPublicos(r.repEventosPublicos());
        d.setRepEventosPrivados(r.repEventosPrivados());
        d.setRepCeremonias(r.repCeremonias());
        d.setRepOtra(r.repOtra());
        d.setRepOtraDetalle(r.repOtraDetalle());
        d.setPrevAterrizaje(r.prevAterrizaje());
        d.setPrevDespegues(r.prevDespegues());
        d.setPrevEventos(r.prevEventos());
        d.setPrevFiesta(r.prevFiesta());
        d.setPrevOtra(r.prevOtra());
        d.setPrevOtraDetalle(r.prevOtraDetalle());
        return d;
    }

    private DatosFalsaAlarma mapDatosFalsaAlarma(ParteRequest.DatosFalsaAlarmaRequest r) {
        DatosFalsaAlarma d = new DatosFalsaAlarma();
        if (r == null) return d;
        d.setHoraComunicacion(r.horaComunicacion());
        d.setTipoIncendioComunicado(r.tipoIncendioComunicado());
        d.setCalle(r.calle());
        d.setMovilPolicialNro(r.movilPolicialNro());
        d.setACargoDe(r.aCargoDe());
        d.setMovilArriboNro(r.movilArriboNro());
        d.setHoraArribo(r.horaArribo());
        d.setKilometrosRecorridos(r.kilometrosRecorridos());
        d.setLitrosCombustible(r.litrosCombustible());
        return d;
    }

    // --- Mapeo entidad -> response ------------------------------------

    private ParteResumenResponse mapearResumen(Parte p) {
        PartesCatalogo.ParteDef def = PartesCatalogo.de(p.getTipoParte());
        return new ParteResumenResponse(
                p.getId(), p.getTipoParte(), def.titulo(), def.codigoFormulario(),
                p.getNumeroParte(), p.getNumeroRuba(), p.getFechaHecho(), p.getEstado(),
                nombreCompleto(p.getCreadoPor()), p.getCreadoEn());
    }

    public ParteResponse mapear(Parte p) {
        PartesCatalogo.ParteDef def = PartesCatalogo.de(p.getTipoParte());
        boolean puedeEditar = p.getEstado() == ParteEstado.BORRADOR;

        LocalizacionInfo loc = p.getLocalizacion();
        SolicitanteInfo sol = p.getSolicitante();
        DatosPrimordialesInfo dp = p.getDatosPrimordiales();
        SuperficieAfectadaInfo sup = p.getSuperficieAfectada();
        DatosAccidente da = p.getDatosAccidente();
        DatosIncendioIndustrial dii = p.getDatosIncendioIndustrial();
        DatosIncendioForestalLugar difl = p.getDatosIncendioForestalLugar();
        DatosIncendioVivienda div = p.getDatosIncendioVivienda();
        DatosCapacitacion dc = p.getDatosCapacitacion();
        DatosRescate dr = p.getDatosRescate();
        DatosMaterialesPeligrosos dmp = p.getDatosMaterialesPeligrosos();
        DatosServiciosEspeciales dse = p.getDatosServiciosEspeciales();
        DatosFalsaAlarma dfa = p.getDatosFalsaAlarma();

        return new ParteResponse(
                p.getId(), p.getTipoParte(), def.titulo(), def.codigoFormulario(),
                p.getNumeroParte(), p.getNumeroRuba(), p.getFechaHecho(), p.getCuerpoParticipante(),
                p.getAmpliatorio(), p.getEstado(),
                p.getCreadoPor().getId(), nombreCompleto(p.getCreadoPor()), p.getCreadoEn(), p.getActualizadoEn(),
                puedeEditar,
                new ParteResponse.LocalizacionResponse(loc.getLocalidad(), loc.getDistrito(), loc.getCalleRuta(),
                        loc.getNumeroKm(), loc.getEntreCalles(), loc.getTipoZona()),
                new ParteResponse.SolicitanteResponse(sol.getNombre(), sol.getApellido(), sol.getDni(), sol.getTelefono()),
                new ParteResponse.DatosPrimordialesResponse(dp.getParticipoComisionDirectiva(), dp.getParticipoComisionDetalle(),
                        dp.getHoraLlamado(), dp.getHoraSalida(), dp.getHoraArribo(), dp.getHoraTerminada(), dp.getHoraRegresoCuartel(),
                        dp.getACargo(), dp.getOperador(), dp.getMovilNro(), dp.getChofer(), dp.getApoyoMovilNro(), dp.getChoferApoyo(),
                        dp.getDotacionMovil(), dp.getDotacionApoyoMovil()),
                new ParteResponse.SuperficieAfectadaResponse(sup.getNoEvacuo(), sup.getKilometros(), sup.getMetros(),
                        sup.getHectareas(), sup.getDetalle()),
                new ParteResponse.DatosAccidenteResponse(da.getClimaLluvia(), da.getClimaNeblina(), da.getClimaSoleado(),
                        da.getClimaVentoso(), da.getClimaNoche(), da.getClimaOtro(), da.getClimaOtroDetalle(),
                        da.getCausaChoque(), da.getTipoChoque(), da.getCausaDespiste(), da.getCausaDerrame(),
                        da.getTipoDerrame(), da.getCausaVuelco()),
                new ParteResponse.DatosIncendioIndustrialResponse(dii.getSubtipoIndustrial(),
                        dii.getSubtipoIndustrialOtroDetalle(), dii.getCausaIncendio()),
                new ParteResponse.DatosIncendioForestalLugarResponse(difl.getLugarCampo(), difl.getLugarPastizal(),
                        difl.getLugarArbustalMatorral(), difl.getLugarInterfase(), difl.getLugarBasural(),
                        difl.getLugarOtro(), difl.getLugarOtroDetalle()),
                new ParteResponse.DatosIncendioViviendaResponse(div.getSeguroCompania(), div.getSeguroPoliza(),
                        div.getSeguroVencimiento(), div.getTipoLugarCasa(), div.getTipoLugarDepto(), div.getTipoLugarCasilla(),
                        div.getTipoLugarRancho(), div.getTipoLugarMultifuncional(), div.getTipoLugarOtro(), div.getTipoLugarOtroDetalle(),
                        div.getTechoMaderaPaja(), div.getTechoYeso(), div.getTechoTejas(), div.getTechoChapaMetalica(), div.getTechoChapaCarton(),
                        div.getAberturaMadera(), div.getAberturaAceroHierro(), div.getAberturaAluminio(),
                        div.getAberturaPlastico(), div.getAberturaOtro(), div.getAberturaOtroDetalle()),
                new ParteResponse.DatosCapacitacionResponse(dc.getNivelCapacitacion(), dc.getNivelCapacitacionOtroDetalle(),
                        dc.getTipoIncendioEstructural(), dc.getTipoIncendioForestal(), dc.getTipoUsarBrec(), dc.getTipoGrimpRtc(),
                        dc.getTipoMatPel(), dc.getTipoPsicologiaEmergencia(), dc.getTipoRescateAcuatico(), dc.getTipoRescateVehicular(),
                        dc.getTipoSocorrismo(), dc.getTipoEscuelaCadetes(), dc.getTipoComandoIncidente(), dc.getTipoOtra(),
                        dc.getTipoOtraDetalle(), dc.getDetalleLibre(), dc.getDiasCapacitacion(), dc.getHorasCapacitacion()),
                new ParteResponse.DatosRescateResponse(dr.getSubtipo(), dr.getSubtipoOtroDetalle(), dr.getLugarCasas(),
                        dr.getLugarEdificio(), dr.getLugarArbol(), dr.getLugarRios(), dr.getLugarPileta(), dr.getLugarLagos(),
                        dr.getLugarOtro(), dr.getLugarOtroDetalle()),
                new ParteResponse.DatosMaterialesPeligrososResponse(dmp.getSustanciasInvolucradas(), dmp.getTipoEvento(),
                        dmp.getAccMatQuemaControlada(), dmp.getAccMatVenteo(), dmp.getAccMatDilucionVapores(), dmp.getAccMatTrasvase(),
                        dmp.getAccMatOtra(), dmp.getAccMatOtraDetalle(), dmp.getAccPersEvacuacion(), dmp.getAccPersDescontaminacion(),
                        dmp.getAccPersConfinamiento(), dmp.getAccPersSinAccion(), dmp.getAccPersOtra(), dmp.getAccPersOtraDetalle(),
                        dmp.getSituacionQueOcurrioPrimero()),
                new ParteResponse.DatosServiciosEspecialesResponse(dse.getSubtipo(), dse.getServOtrasFuerzas(),
                        dse.getServEntidadesGubernamentales(), dse.getServEmpresaPrivada(), dse.getServDetalle(),
                        dse.getRepDesfile(), dse.getRepHonoresFunebres(), dse.getRepAniversarios(), dse.getRepEventosPublicos(),
                        dse.getRepEventosPrivados(), dse.getRepCeremonias(), dse.getRepOtra(), dse.getRepOtraDetalle(),
                        dse.getPrevAterrizaje(), dse.getPrevDespegues(), dse.getPrevEventos(), dse.getPrevFiesta(),
                        dse.getPrevOtra(), dse.getPrevOtraDetalle()),
                new ParteResponse.DatosFalsaAlarmaResponse(dfa.getHoraComunicacion(), dfa.getTipoIncendioComunicado(),
                        dfa.getCalle(), dfa.getMovilPolicialNro(), dfa.getACargoDe(), dfa.getMovilArriboNro(),
                        dfa.getHoraArribo(), dfa.getKilometrosRecorridos(), dfa.getLitrosCombustible()),
                generarTextoFalsaAlarma(p),
                p.getPersonasDamnificadas().stream()
                        .map(x -> new ParteResponse.PersonaDamnificadaResponse(x.getId(), x.getRol(), x.getNombreApellido(),
                                x.getDni(), x.getTelefono(), x.getDomicilio()))
                        .toList(),
                p.getEntidadesIntervino().stream()
                        .map(x -> new ParteResponse.EntidadIntervinoResponse(x.getId(), x.getFilaPrincipal(),
                                x.getSeConstato(), x.getEntidad(), x.getMovilNro(), x.getACargo()))
                        .toList(),
                p.getVehiculos().stream()
                        .map(x -> new ParteResponse.VehiculoResponse(x.getId(), x.getTipo(), x.getMarca(), x.getDominio(),
                                x.getModelo(), x.getAnio(), x.getAseguradora(), x.getPoliza()))
                        .toList()
        );
    }

    private String nombreCompleto(Usuario usuario) {
        if (usuario == null) return null;
        if (usuario.getBombero() != null) {
            return (usuario.getBombero().getNombre() + " " + usuario.getBombero().getApellido()).trim();
        }
        return usuario.getEmail();
    }

    // Arma el párrafo autogenerado de "Servicios Falsa Alarma" a partir de
    // los campos estructurados (no se persiste, se calcula al mostrar/exportar).
    public String generarTextoFalsaAlarma(Parte p) {
        if (p.getTipoParte() != TipoParte.SERVICIOS_FALSA_ALARMA) return null;
        DatosFalsaAlarma d = p.getDatosFalsaAlarma();
        DateTimeFormatter hf = DateTimeFormatter.ofPattern("HH:mm");
        return String.format(
                "Por el presente informo que, siendo las %s el CEO comunica sobre un incendio de %s en calle %s, "
                        + "verificado por la movilidad policial n° %s, a cargo %s. Al arribar la movilidad n° %s a las %s hs, "
                        + "confirmamos que no habría ningún incendio. Se regresa al cuartel tras haber informado al CEO dicha "
                        + "novedad, con un recorrido de %s Km y un consumo de %s lts. de combustible.",
                formatearHora(d.getHoraComunicacion(), hf), vacioSiNulo(d.getTipoIncendioComunicado()),
                vacioSiNulo(d.getCalle()), vacioSiNulo(d.getMovilPolicialNro()), vacioSiNulo(d.getACargoDe()),
                vacioSiNulo(d.getMovilArriboNro()), formatearHora(d.getHoraArribo(), hf),
                vacioSiNulo(d.getKilometrosRecorridos()), vacioSiNulo(d.getLitrosCombustible()));
    }

    private String formatearHora(java.time.LocalTime hora, DateTimeFormatter f) {
        return hora != null ? hora.format(f) : "____";
    }

    private String vacioSiNulo(Object valor) {
        return valor != null ? valor.toString() : "____";
    }
}
