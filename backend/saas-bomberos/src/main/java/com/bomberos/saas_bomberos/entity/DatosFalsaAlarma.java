package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;
import java.time.LocalTime;

// Campos específicos de Servicios Falsa Alarma (FO-01 D). El párrafo
// "Ampliatorio" se genera a partir de estos campos (ver PartePdfService /
// ParteService#generarTextoFalsaAlarma), no se persiste.
@Data
@Embeddable
public class DatosFalsaAlarma {

    @Column(name = "fa_hora_comunicacion")
    private LocalTime horaComunicacion;

    @Column(name = "fa_tipo_incendio_comunicado")
    private String tipoIncendioComunicado;

    private String calle;

    @Column(name = "fa_movil_policial_nro")
    private String movilPolicialNro;

    @Column(name = "fa_a_cargo_de")
    private String aCargoDe;

    @Column(name = "fa_movil_arribo_nro")
    private String movilArriboNro;

    @Column(name = "fa_hora_arribo")
    private LocalTime horaArribo;

    @Column(name = "fa_kilometros_recorridos")
    private Double kilometrosRecorridos;

    @Column(name = "fa_litros_combustible")
    private Double litrosCombustible;
}
