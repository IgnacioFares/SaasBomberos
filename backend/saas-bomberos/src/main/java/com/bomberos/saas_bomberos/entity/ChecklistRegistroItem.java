package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.*;
import lombok.Data;

// Resultado de un ítem puntual dentro de un ChecklistRegistro. Es un
// snapshot: copia nombre de ítem/sección y cantidad esperada al momento
// del control, sin FK a checklist_items, para que el historial siga
// siendo legible aunque la plantilla se edite o se borre después.
@Data
@Entity
@Table(name = "checklist_registro_items")
public class ChecklistRegistroItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Referencia informativa al ítem de la plantilla (sin FK a propósito).
    @Column(name = "item_id")
    private Long itemId;

    @Column(name = "item_nombre", nullable = false)
    private String itemNombre;

    @Column(name = "seccion_nombre", nullable = false)
    private String seccionNombre;

    @Column(name = "cantidad_esperada")
    private Integer cantidadEsperada;

    @Column(name = "cantidad_encontrada")
    private Integer cantidadEncontrada;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChecklistItemEstado estado;

    private String observacion;
}
