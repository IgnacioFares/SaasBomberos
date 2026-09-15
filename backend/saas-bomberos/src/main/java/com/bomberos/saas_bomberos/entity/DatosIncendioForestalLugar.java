package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

// Campos específicos adicionales de Incendio Forestal ("Característica del lugar").
@Data
@Embeddable
public class DatosIncendioForestalLugar {

    @Column(name = "if_lugar_campo")
    private Boolean lugarCampo;
    @Column(name = "if_lugar_pastizal")
    private Boolean lugarPastizal;
    @Column(name = "if_lugar_arbustal_matorral")
    private Boolean lugarArbustalMatorral;
    @Column(name = "if_lugar_interfase")
    private Boolean lugarInterfase;
    @Column(name = "if_lugar_basural")
    private Boolean lugarBasural;
    @Column(name = "if_lugar_otro")
    private Boolean lugarOtro;
    @Column(name = "if_lugar_otro_detalle")
    private String lugarOtroDetalle;
}
