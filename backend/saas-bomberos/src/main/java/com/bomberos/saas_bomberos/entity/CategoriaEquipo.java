package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

// Categoría de equipamiento administrable desde la UI (ej: "EPP",
// "Herramientas de Rescate"). Autoreferenciada: si tiene padre es una
// subcategoría (árbol de dos niveles: Cascos → padre EPP).
@Data
@Entity
@Table(name = "categorias_equipo")
public class CategoriaEquipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Column(nullable = false)
    private String nombre;

    @ManyToOne
    @JoinColumn(name = "padre_id")
    private CategoriaEquipo padre;

    @Column(nullable = false)
    private Boolean activo = true;
}
