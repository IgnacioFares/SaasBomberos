package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.*;
import lombok.Data;

// Fila dinámica del bloque común "Entidades que intervino". La primera
// fila es especial (filaPrincipal=true): pregunta "¿Se constató?" en vez
// de nombrar una entidad. Las siguientes son filas libres agregables.
@Data
@Entity
@Table(name = "parte_entidades_intervino")
public class ParteEntidadIntervino {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fila_principal", nullable = false)
    private Boolean filaPrincipal = false;

    // Solo aplica cuando filaPrincipal = true.
    @Column(name = "se_constato")
    private Boolean seConstato;

    // Solo aplica cuando filaPrincipal = false.
    private String entidad;

    @Column(name = "movil_nro")
    private String movilNro;

    @Column(name = "a_cargo")
    private String aCargo;

    private Integer orden;
}
