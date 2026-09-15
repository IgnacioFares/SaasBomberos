package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

// Campos específicos de Servicios Especiales - Capacitación (FO-01 D).
@Data
@Embeddable
public class DatosCapacitacion {

    @Enumerated(EnumType.STRING)
    @Column(name = "cap_nivel")
    private NivelCapacitacion nivelCapacitacion;

    @Column(name = "cap_nivel_otro_detalle")
    private String nivelCapacitacionOtroDetalle;

    @Column(name = "cap_tipo_incendio_estructural")
    private Boolean tipoIncendioEstructural;
    @Column(name = "cap_tipo_incendio_forestal")
    private Boolean tipoIncendioForestal;
    @Column(name = "cap_tipo_usar_brec")
    private Boolean tipoUsarBrec;
    @Column(name = "cap_tipo_grimp_rtc")
    private Boolean tipoGrimpRtc;
    @Column(name = "cap_tipo_mat_pel")
    private Boolean tipoMatPel;
    @Column(name = "cap_tipo_psicologia_emergencia")
    private Boolean tipoPsicologiaEmergencia;
    @Column(name = "cap_tipo_rescate_acuatico")
    private Boolean tipoRescateAcuatico;
    @Column(name = "cap_tipo_rescate_vehicular")
    private Boolean tipoRescateVehicular;
    @Column(name = "cap_tipo_socorrismo")
    private Boolean tipoSocorrismo;
    @Column(name = "cap_tipo_escuela_cadetes")
    private Boolean tipoEscuelaCadetes;
    @Column(name = "cap_tipo_comando_incidente")
    private Boolean tipoComandoIncidente;
    @Column(name = "cap_tipo_otra")
    private Boolean tipoOtra;
    @Column(name = "cap_tipo_otra_detalle")
    private String tipoOtraDetalle;

    @Column(name = "cap_detalle_libre", columnDefinition = "TEXT")
    private String detalleLibre;

    @Column(name = "cap_dias")
    private Integer diasCapacitacion;

    @Column(name = "cap_horas")
    private Integer horasCapacitacion;
}
