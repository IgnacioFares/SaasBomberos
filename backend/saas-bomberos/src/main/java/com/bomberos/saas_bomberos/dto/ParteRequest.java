package com.bomberos.saas_bomberos.dto;

import com.bomberos.saas_bomberos.entity.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

// Un solo request grande porque un parte es, ni más ni menos, un
// formulario grande: cada bloque (común o específico de tipo) es un
// record anidado que refleja 1 a 1 el @Embeddable correspondiente en
// Parte. El backend ignora los bloques que no correspondan al tipoParte.
// numeroParte no viaja en el request: lo asigna el backend al finalizar
// (ver ParteService#finalizar), no lo tipea el usuario.
public record ParteRequest(
        TipoParte tipoParte,
        String numeroRuba,
        LocalDate fechaHecho,
        String cuerpoParticipante,
        String ampliatorio,
        LocalizacionRequest localizacion,
        SolicitanteRequest solicitante,
        DatosPrimordialesRequest datosPrimordiales,
        SuperficieAfectadaRequest superficieAfectada,
        DatosAccidenteRequest datosAccidente,
        DatosIncendioIndustrialRequest datosIncendioIndustrial,
        DatosIncendioForestalLugarRequest datosIncendioForestalLugar,
        DatosIncendioViviendaRequest datosIncendioVivienda,
        DatosCapacitacionRequest datosCapacitacion,
        DatosRescateRequest datosRescate,
        DatosMaterialesPeligrososRequest datosMaterialesPeligrosos,
        DatosServiciosEspecialesRequest datosServiciosEspeciales,
        DatosFalsaAlarmaRequest datosFalsaAlarma,
        List<PersonaDamnificadaRequest> personasDamnificadas,
        List<EntidadIntervinoRequest> entidadesIntervino,
        List<VehiculoRequest> vehiculos
) {
    public record LocalizacionRequest(
            String localidad, String distrito, String calleRuta, String numeroKm,
            String entreCalles, TipoZona tipoZona) {}

    public record SolicitanteRequest(String nombre, String apellido, String dni, String telefono) {}

    public record DatosPrimordialesRequest(
            Boolean participoComisionDirectiva, String participoComisionDetalle,
            LocalTime horaLlamado, LocalTime horaSalida, LocalTime horaArribo,
            LocalTime horaTerminada, LocalTime horaRegresoCuartel,
            String aCargo, String operador, String movilNro, String chofer,
            String apoyoMovilNro, String choferApoyo,
            String dotacionMovil, String dotacionApoyoMovil) {}

    public record SuperficieAfectadaRequest(
            Boolean noEvacuo, Double kilometros, Double metros, Double hectareas, String detalle) {}

    public record DatosAccidenteRequest(
            Boolean climaLluvia, Boolean climaNeblina, Boolean climaSoleado, Boolean climaVentoso,
            Boolean climaNoche, Boolean climaOtro, String climaOtroDetalle,
            Boolean causaChoque, TipoChoque tipoChoque, Boolean causaDespiste,
            Boolean causaDerrame, TipoDerrame tipoDerrame, Boolean causaVuelco) {}

    public record DatosIncendioIndustrialRequest(
            SubtipoIndustrial subtipoIndustrial, String subtipoIndustrialOtroDetalle,
            CausaIncendio causaIncendio) {}

    public record DatosIncendioForestalLugarRequest(
            Boolean lugarCampo, Boolean lugarPastizal, Boolean lugarArbustalMatorral,
            Boolean lugarInterfase, Boolean lugarBasural, Boolean lugarOtro, String lugarOtroDetalle) {}

    public record DatosIncendioViviendaRequest(
            String seguroCompania, String seguroPoliza, LocalDate seguroVencimiento,
            Boolean tipoLugarCasa, Boolean tipoLugarDepto, Boolean tipoLugarCasilla,
            Boolean tipoLugarRancho, Boolean tipoLugarMultifuncional, Boolean tipoLugarOtro, String tipoLugarOtroDetalle,
            Boolean techoMaderaPaja, Boolean techoYeso, Boolean techoTejas, Boolean techoChapaMetalica, Boolean techoChapaCarton,
            Boolean aberturaMadera, Boolean aberturaAceroHierro, Boolean aberturaAluminio,
            Boolean aberturaPlastico, Boolean aberturaOtro, String aberturaOtroDetalle) {}

    public record DatosCapacitacionRequest(
            NivelCapacitacion nivelCapacitacion, String nivelCapacitacionOtroDetalle,
            Boolean tipoIncendioEstructural, Boolean tipoIncendioForestal, Boolean tipoUsarBrec,
            Boolean tipoGrimpRtc, Boolean tipoMatPel, Boolean tipoPsicologiaEmergencia,
            Boolean tipoRescateAcuatico, Boolean tipoRescateVehicular, Boolean tipoSocorrismo,
            Boolean tipoEscuelaCadetes, Boolean tipoComandoIncidente, Boolean tipoOtra, String tipoOtraDetalle,
            String detalleLibre, Integer diasCapacitacion, Integer horasCapacitacion) {}

    public record DatosRescateRequest(
            SubtipoRescate subtipo, String subtipoOtroDetalle,
            Boolean lugarCasas, Boolean lugarEdificio, Boolean lugarArbol,
            Boolean lugarRios, Boolean lugarPileta, Boolean lugarLagos, Boolean lugarOtro, String lugarOtroDetalle) {}

    public record DatosMaterialesPeligrososRequest(
            String sustanciasInvolucradas, TipoEventoMatPeligroso tipoEvento,
            Boolean accMatQuemaControlada, Boolean accMatVenteo, Boolean accMatDilucionVapores,
            Boolean accMatTrasvase, Boolean accMatOtra, String accMatOtraDetalle,
            Boolean accPersEvacuacion, Boolean accPersDescontaminacion, Boolean accPersConfinamiento,
            Boolean accPersSinAccion, Boolean accPersOtra, String accPersOtraDetalle,
            SituacionExplosion situacionQueOcurrioPrimero) {}

    public record DatosServiciosEspecialesRequest(
            SubtipoServicioEspecial subtipo,
            Boolean servOtrasFuerzas, Boolean servEntidadesGubernamentales, Boolean servEmpresaPrivada, String servDetalle,
            Boolean repDesfile, Boolean repHonoresFunebres, Boolean repAniversarios,
            Boolean repEventosPublicos, Boolean repEventosPrivados, Boolean repCeremonias, Boolean repOtra, String repOtraDetalle,
            Boolean prevAterrizaje, Boolean prevDespegues, Boolean prevEventos, Boolean prevFiesta, Boolean prevOtra, String prevOtraDetalle) {}

    public record DatosFalsaAlarmaRequest(
            LocalTime horaComunicacion, String tipoIncendioComunicado, String calle,
            String movilPolicialNro, String aCargoDe, String movilArriboNro, LocalTime horaArribo,
            Double kilometrosRecorridos, Double litrosCombustible) {}

    public record PersonaDamnificadaRequest(
            String rol, String nombreApellido, String dni, String telefono, String domicilio) {}

    public record EntidadIntervinoRequest(
            Boolean filaPrincipal, Boolean seConstato, String entidad, String movilNro, String aCargo) {}

    public record VehiculoRequest(
            String tipo, String marca, String dominio, String modelo,
            Integer anio, String aseguradora, String poliza) {}
}
