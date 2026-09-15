package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.*;
import lombok.Data;

// Fila dinámica de la tabla "Vehículos intervinientes/afectados"
// (solo Accidente e Incendio Vehicular).
@Data
@Entity
@Table(name = "parte_vehiculos")
public class ParteVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo;
    private String marca;
    private String dominio;
    private String modelo;
    private Integer anio;
    private String aseguradora;
    private String poliza;
    private Integer orden;
}
