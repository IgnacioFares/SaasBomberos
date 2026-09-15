package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

// Campos específicos del parte de tipo Accidente (FO-01 A).
@Data
@Embeddable
public class DatosAccidente {

    @Column(name = "acc_clima_lluvia")
    private Boolean climaLluvia;
    @Column(name = "acc_clima_neblina")
    private Boolean climaNeblina;
    @Column(name = "acc_clima_soleado")
    private Boolean climaSoleado;
    @Column(name = "acc_clima_ventoso")
    private Boolean climaVentoso;
    @Column(name = "acc_clima_noche")
    private Boolean climaNoche;
    @Column(name = "acc_clima_otro")
    private Boolean climaOtro;
    @Column(name = "acc_clima_otro_detalle")
    private String climaOtroDetalle;

    @Column(name = "acc_causa_choque")
    private Boolean causaChoque;

    @Enumerated(EnumType.STRING)
    @Column(name = "acc_tipo_choque")
    private TipoChoque tipoChoque;

    @Column(name = "acc_causa_despiste")
    private Boolean causaDespiste;

    @Column(name = "acc_causa_derrame")
    private Boolean causaDerrame;

    @Enumerated(EnumType.STRING)
    @Column(name = "acc_tipo_derrame")
    private TipoDerrame tipoDerrame;

    @Column(name = "acc_causa_vuelco")
    private Boolean causaVuelco;
}
