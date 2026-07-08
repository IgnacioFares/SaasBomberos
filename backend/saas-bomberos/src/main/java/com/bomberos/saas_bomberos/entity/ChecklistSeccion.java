package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

// Sección de una plantilla de checklist (ej: "Parte del conductor",
// "Dotación", "Parte izquierda del móvil"). El encabezado es libre,
// lo define quien arma el checklist.
@Data
@Entity
@Table(name = "checklist_secciones")
public class ChecklistSeccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre de la sección es obligatorio")
    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private Integer orden = 0;

    // Unidireccional a propósito, ver comentario en ChecklistTemplate.
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "seccion_id")
    @OrderBy("orden ASC")
    private List<ChecklistItem> items = new ArrayList<>();
}
