package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

// Evento del historial de un equipo: qué pasó, sobre qué unidad (si
// aplica), quién lo hizo y cuándo. Lo escribe automáticamente el
// EquipoService en cada mutación; nunca se edita ni se borra.
@Data
@Entity
@Table(name = "equipo_movimientos")
public class EquipoMovimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "equipo_id", nullable = false)
    private Equipo equipo;

    // Número de la unidad afectada, si el movimiento fue sobre una
    // unidad puntual (ej: "Casco N°3").
    @Column(name = "unidad_numero")
    private Integer unidadNumero;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipoMovimientoTipo tipo;

    // Descripción legible del cambio (ej: "En depósito → En servicio").
    @Column(nullable = false)
    private String detalle;

    @ManyToOne
    @JoinColumn(name = "realizado_por", nullable = false)
    private Usuario realizadoPor;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @PrePersist
    protected void onCreate() {
        fecha = LocalDateTime.now();
    }
}
