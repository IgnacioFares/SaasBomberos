package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

// Dónde puede estar el equipamiento (ej: "Depósito principal",
// "Móvil 2", "Taller"). Administrable desde la UI.
@Data
@Entity
@Table(name = "ubicaciones_equipo")
public class UbicacionEquipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre de la ubicación es obligatorio")
    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private Boolean activo = true;
}
