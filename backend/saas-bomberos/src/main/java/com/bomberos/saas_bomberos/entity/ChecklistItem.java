package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

// Ítem individual dentro de una sección de checklist (ej: "Alcohol",
// "Cinta de peligro", "Máscaras de respiración").
@Data
@Entity
@Table(name = "checklist_items")
public class ChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre del ítem es obligatorio")
    @Column(nullable = false)
    private String nombre;

    // Nota aclaratoria opcional definida en la plantilla (ej: "Verificar
    // presión de los cilindros").
    private String descripcion;

    // Si es true, al realizar el checklist se compara la cantidad
    // encontrada contra la esperada para detectar faltantes/sobrantes.
    @Column(name = "requiere_cantidad", nullable = false)
    private Boolean requiereCantidad = false;

    @Column(name = "cantidad_esperada")
    private Integer cantidadEsperada;

    // Los ítems obligatorios bloquean el envío del checklist si no se
    // controlaron; los opcionales pueden quedar como NO_CONTROLADO.
    @Column(nullable = false)
    private Boolean obligatorio = true;

    @Column(nullable = false)
    private Integer orden = 0;
}
