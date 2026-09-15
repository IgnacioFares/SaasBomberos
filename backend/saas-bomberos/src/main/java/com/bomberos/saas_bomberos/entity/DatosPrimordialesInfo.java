package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;
import java.time.LocalTime;

// Bloque común "Datos primordiales".
@Data
@Embeddable
public class DatosPrimordialesInfo {

    @Column(name = "participo_comision_directiva")
    private Boolean participoComisionDirectiva;

    @Column(name = "participo_comision_detalle")
    private String participoComisionDetalle;

    @Column(name = "hora_llamado")
    private LocalTime horaLlamado;

    @Column(name = "hora_salida")
    private LocalTime horaSalida;

    @Column(name = "hora_arribo")
    private LocalTime horaArribo;

    @Column(name = "hora_terminada")
    private LocalTime horaTerminada;

    @Column(name = "hora_regreso_cuartel")
    private LocalTime horaRegresoCuartel;

    @Column(name = "a_cargo")
    private String aCargo;

    private String operador;

    @Column(name = "movil_nro")
    private String movilNro;

    private String chofer;

    @Column(name = "apoyo_movil_nro")
    private String apoyoMovilNro;

    @Column(name = "chofer_apoyo")
    private String choferApoyo;

    @Column(name = "dotacion_movil", columnDefinition = "TEXT")
    private String dotacionMovil;

    @Column(name = "dotacion_apoyo_movil", columnDefinition = "TEXT")
    private String dotacionApoyoMovil;
}
