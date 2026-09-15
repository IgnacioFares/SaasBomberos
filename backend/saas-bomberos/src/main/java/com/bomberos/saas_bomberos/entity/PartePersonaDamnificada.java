package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.*;
import lombok.Data;

// Fila dinámica del bloque común "Personas damnificadas".
@Data
@Entity
@Table(name = "parte_personas_damnificadas")
public class PartePersonaDamnificada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Ej: "Propietario", "Víctima" (filas fijas sugeridas) o texto libre.
    private String rol;

    @Column(name = "nombre_apellido")
    private String nombreApellido;

    private String dni;
    private String telefono;
    private String domicilio;
    private Integer orden;
}
