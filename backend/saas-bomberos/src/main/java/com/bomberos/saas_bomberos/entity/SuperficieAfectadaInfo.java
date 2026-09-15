package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

// Bloque común "Datos de la superficie afectada" (incendios y materiales
// peligrosos).
@Data
@Embeddable
public class SuperficieAfectadaInfo {

    @Column(name = "sup_no_evacuo")
    private Boolean noEvacuo;

    @Column(name = "sup_kilometros")
    private Double kilometros;

    @Column(name = "sup_metros")
    private Double metros;

    @Column(name = "sup_hectareas")
    private Double hectareas;

    @Column(name = "sup_detalle")
    private String detalle;
}
