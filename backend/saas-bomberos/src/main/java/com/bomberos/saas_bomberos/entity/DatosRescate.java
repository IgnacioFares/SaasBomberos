package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

// Campos específicos de Rescate (FO-01 C).
@Data
@Embeddable
public class DatosRescate {

    @Enumerated(EnumType.STRING)
    @Column(name = "res_subtipo")
    private SubtipoRescate subtipo;

    @Column(name = "res_subtipo_otro_detalle")
    private String subtipoOtroDetalle;

    @Column(name = "res_lugar_casas")
    private Boolean lugarCasas;
    @Column(name = "res_lugar_edificio")
    private Boolean lugarEdificio;
    @Column(name = "res_lugar_arbol")
    private Boolean lugarArbol;
    @Column(name = "res_lugar_rios")
    private Boolean lugarRios;
    @Column(name = "res_lugar_pileta")
    private Boolean lugarPileta;
    @Column(name = "res_lugar_lagos")
    private Boolean lugarLagos;
    @Column(name = "res_lugar_otro")
    private Boolean lugarOtro;
    @Column(name = "res_lugar_otro_detalle")
    private String lugarOtroDetalle;
}
