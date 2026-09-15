package com.bomberos.saas_bomberos.dto;

import com.bomberos.saas_bomberos.entity.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public record ParteResponse(
        Long id,
        TipoParte tipoParte,
        String tituloParte,
        String codigoFormulario,
        Integer numeroParte,
        String numeroRuba,
        LocalDate fechaHecho,
        String cuerpoParticipante,
        String ampliatorio,
        ParteEstado estado,
        Long creadoPorId,
        String creadoPorNombre,
        LocalDateTime creadoEn,
        LocalDateTime actualizadoEn,
        boolean puedeEditar,
        LocalizacionResponse localizacion,
        SolicitanteResponse solicitante,
        DatosPrimordialesResponse datosPrimordiales,
        SuperficieAfectadaResponse superficieAfectada,
        DatosAccidenteResponse datosAccidente,
        DatosIncendioIndustrialResponse datosIncendioIndustrial,
        DatosIncendioForestalLugarResponse datosIncendioForestalLugar,
        DatosIncendioViviendaResponse datosIncendioVivienda,
        DatosCapacitacionResponse datosCapacitacion,
        DatosRescateResponse datosRescate,
        DatosMaterialesPeligrososResponse datosMaterialesPeligrosos,
        DatosServiciosEspecialesResponse datosServiciosEspeciales,
        DatosFalsaAlarmaResponse datosFalsaAlarma,
        String textoFalsaAlarmaGenerado,
        List<PersonaDamnificadaResponse> personasDamnificadas,
        List<EntidadIntervinoResponse> entidadesIntervino,
        List<VehiculoResponse> vehiculos
) {
    public record LocalizacionResponse(
            String localidad, String distrito, String calleRuta, String numeroKm,
            String entreCalles, TipoZona tipoZona) {}

    public record SolicitanteResponse(String nombre, String apellido, String dni, String telefono) {}

    public record DatosPrimordialesResponse(
            Boolean participoComisionDirectiva, String participoComisionDetalle,
            LocalTime horaLlamado, LocalTime horaSalida, LocalTime horaArribo,
            LocalTime horaTerminada, LocalTime horaRegresoCuartel,
            String aCargo, String operador, String movilNro, String chofer,
            String apoyoMovilNro, String choferApoyo,
            String dotacionMovil, String dotacionApoyoMovil) {}

    public record SuperficieAfectadaResponse(
            Boolean noEvacuo, Double kilometros, Double metros, Double hectareas, String detalle) {}

    public record DatosAccidenteResponse(
            Boolean climaLluvia, Boolean climaNeblina, Boolean climaSoleado, Boolean climaVentoso,
            Boolean climaNoche, Boolean climaOtro, String climaOtroDetalle,
            Boolean causaChoque, TipoChoque tipoChoque, Boolean causaDespiste,
            Boolean causaDerrame, TipoDerrame tipoDerrame, Boolean causaVuelco) {}

    public record DatosIncendioIndustrialResponse(
            SubtipoIndustrial subtipoIndustrial, String subtipoIndustrialOtroDetalle,
            CausaIncendio causaIncendio) {}

    public record DatosIncendioForestalLugarResponse(
            Boolean lugarCampo, Boolean lugarPastizal, Boolean lugarArbustalMatorral,
            Boolean lugarInterfase, Boolean lugarBasural, Boolean lugarOtro, String lugarOtroDetalle) {}

    public record DatosIncendioViviendaResponse(
            String seguroCompania, String seguroPoliza, LocalDate seguroVencimiento,
            Boolean tipoLugarCasa, Boolean tipoLugarDepto, Boolean tipoLugarCasilla,
            Boolean tipoLugarRancho, Boolean tipoLugarMultifuncional, Boolean tipoLugarOtro, String tipoLugarOtroDetalle,
            Boolean techoMaderaPaja, Boolean techoYeso, Boolean techoTejas, Boolean techoChapaMetalica, Boolean techoChapaCarton,
            Boolean aberturaMadera, Boolean aberturaAceroHierro, Boolean aberturaAluminio,
            Boolean aberturaPlastico, Boolean aberturaOtro, String aberturaOtroDetalle) {}

    public record DatosCapacitacionResponse(
            NivelCapacitacion nivelCapacitacion, String nivelCapacitacionOtroDetalle,
            Boolean tipoIncendioEstructural, Boolean tipoIncendioForestal, Boolean tipoUsarBrec,
            Boolean tipoGrimpRtc, Boolean tipoMatPel, Boolean tipoPsicologiaEmergencia,
            Boolean tipoRescateAcuatico, Boolean tipoRescateVehicular, Boolean tipoSocorrismo,
            Boolean tipoEscuelaCadetes, Boolean tipoComandoIncidente, Boolean tipoOtra, String tipoOtraDetalle,
            String detalleLibre, Integer diasCapacitacion, Integer horasCapacitacion) {}

    public record DatosRescateResponse(
            SubtipoRescate subtipo, String subtipoOtroDetalle,
            Boolean lugarCasas, Boolean lugarEdificio, Boolean lugarArbol,
            Boolean lugarRios, Boolean lugarPileta, Boolean lugarLagos, Boolean lugarOtro, String lugarOtroDetalle) {}

    public record DatosMaterialesPeligrososResponse(
            String sustanciasInvolucradas, TipoEventoMatPeligroso tipoEvento,
            Boolean accMatQuemaControlada, Boolean accMatVenteo, Boolean accMatDilucionVapores,
            Boolean accMatTrasvase, Boolean accMatOtra, String accMatOtraDetalle,
            Boolean accPersEvacuacion, Boolean accPersDescontaminacion, Boolean accPersConfinamiento,
            Boolean accPersSinAccion, Boolean accPersOtra, String accPersOtraDetalle,
            SituacionExplosion situacionQueOcurrioPrimero) {}

    public record DatosServiciosEspecialesResponse(
            SubtipoServicioEspecial subtipo,
            Boolean servOtrasFuerzas, Boolean servEntidadesGubernamentales, Boolean servEmpresaPrivada, String servDetalle,
            Boolean repDesfile, Boolean repHonoresFunebres, Boolean repAniversarios,
            Boolean repEventosPublicos, Boolean repEventosPrivados, Boolean repCeremonias, Boolean repOtra, String repOtraDetalle,
            Boolean prevAterrizaje, Boolean prevDespegues, Boolean prevEventos, Boolean prevFiesta, Boolean prevOtra, String prevOtraDetalle) {}

    public record DatosFalsaAlarmaResponse(
            LocalTime horaComunicacion, String tipoIncendioComunicado, String calle,
            String movilPolicialNro, String aCargoDe, String movilArriboNro, LocalTime horaArribo,
            Double kilometrosRecorridos, Double litrosCombustible) {}

    public record PersonaDamnificadaResponse(
            Long id, String rol, String nombreApellido, String dni, String telefono, String domicilio) {}

    public record EntidadIntervinoResponse(
            Long id, Boolean filaPrincipal, Boolean seConstato, String entidad, String movilNro, String aCargo) {}

    public record VehiculoResponse(
            Long id, String tipo, String marca, String dominio, String modelo,
            Integer anio, String aseguradora, String poliza) {}
}
