package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

// Campos específicos de Materiales Peligrosos (FO-01 F).
@Data
@Embeddable
public class DatosMaterialesPeligrosos {

    @Column(name = "mp_sustancias_involucradas", columnDefinition = "TEXT")
    private String sustanciasInvolucradas;

    @Enumerated(EnumType.STRING)
    @Column(name = "mp_tipo_evento")
    private TipoEventoMatPeligroso tipoEvento;

    @Column(name = "mp_acc_mat_quema_controlada")
    private Boolean accMatQuemaControlada;
    @Column(name = "mp_acc_mat_venteo")
    private Boolean accMatVenteo;
    @Column(name = "mp_acc_mat_dilucion_vapores")
    private Boolean accMatDilucionVapores;
    @Column(name = "mp_acc_mat_trasvase")
    private Boolean accMatTrasvase;
    @Column(name = "mp_acc_mat_otra")
    private Boolean accMatOtra;
    @Column(name = "mp_acc_mat_otra_detalle")
    private String accMatOtraDetalle;

    @Column(name = "mp_acc_pers_evacuacion")
    private Boolean accPersEvacuacion;
    @Column(name = "mp_acc_pers_descontaminacion")
    private Boolean accPersDescontaminacion;
    @Column(name = "mp_acc_pers_confinamiento")
    private Boolean accPersConfinamiento;
    @Column(name = "mp_acc_pers_sin_accion")
    private Boolean accPersSinAccion;
    @Column(name = "mp_acc_pers_otra")
    private Boolean accPersOtra;
    @Column(name = "mp_acc_pers_otra_detalle")
    private String accPersOtraDetalle;

    @Enumerated(EnumType.STRING)
    @Column(name = "mp_situacion_primero")
    private SituacionExplosion situacionQueOcurrioPrimero;
}
