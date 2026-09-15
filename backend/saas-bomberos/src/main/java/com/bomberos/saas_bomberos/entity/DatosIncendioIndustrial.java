package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

// Campos específicos compartidos por Incendio Industrial e Incendio
// Forestal (ambos FO-01 B). Forestal agrega además DatosIncendioForestalLugar.
@Data
@Embeddable
public class DatosIncendioIndustrial {

    @Enumerated(EnumType.STRING)
    @Column(name = "ii_subtipo_industrial")
    private SubtipoIndustrial subtipoIndustrial;

    @Column(name = "ii_subtipo_industrial_otro")
    private String subtipoIndustrialOtroDetalle;

    @Enumerated(EnumType.STRING)
    @Column(name = "ii_causa_incendio")
    private CausaIncendio causaIncendio;
}
