package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.*;
import lombok.Data;

// Línea de stock de un equipo POR_CANTIDAD: cuántos hay en una
// ubicación y estado dados (ej: "Hacha de bombero: 7 en Depósito
// principal en depósito, 1 en Móvil 1 en servicio"). La cantidad total
// del equipo es la suma de sus líneas.
@Data
@Entity
@Table(name = "equipo_stock")
public class EquipoStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer cantidad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipoEstado estado = EquipoEstado.EN_DEPOSITO;

    @ManyToOne
    @JoinColumn(name = "ubicacion_id")
    private UbicacionEquipo ubicacion;
}
