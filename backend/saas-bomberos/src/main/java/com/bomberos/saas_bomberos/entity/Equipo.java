package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// Elemento del catálogo de inventario. Según su seguimiento es un lote
// contado en bloque (POR_CANTIDAD) o un tipo con unidades individuales
// (POR_UNIDAD), ver EquipoSeguimiento.
@Data
@Entity
@Table(name = "equipos")
public class Equipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre del equipo es obligatorio")
    @Column(nullable = false)
    private String nombre;

    @Column(name = "codigo_interno")
    private String codigoInterno;

    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    private CategoriaEquipo categoria;

    @ManyToOne
    @JoinColumn(name = "subcategoria_id")
    private CategoriaEquipo subcategoria;

    private String descripcion;

    private String marca;

    private String modelo;

    // Serie a nivel equipo: útil para POR_CANTIDAD con una sola pieza
    // serializada; en POR_UNIDAD la serie vive en cada unidad.
    @Column(name = "numero_serie")
    private String numeroSerie;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipoSeguimiento seguimiento = EquipoSeguimiento.POR_CANTIDAD;

    // Solo para POR_CANTIDAD; en POR_UNIDAD la cantidad se deriva de
    // las unidades activas.
    private Integer cantidad;

    @Column(name = "unidad_medida")
    private String unidadMedida;

    // Estado/ubicación del lote (POR_CANTIDAD). En POR_UNIDAD cada
    // unidad tiene los suyos.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipoEstado estado = EquipoEstado.EN_DEPOSITO;

    @ManyToOne
    @JoinColumn(name = "ubicacion_id")
    private UbicacionEquipo ubicacion;

    @Column(name = "fecha_compra")
    private LocalDate fechaCompra;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    private String observaciones;

    // Unidireccional a propósito (patrón del módulo de checklists) para
    // no arrastrar referencias circulares al serializar.
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "equipo_id")
    @OrderBy("numero ASC")
    private List<EquipoUnidad> unidades = new ArrayList<>();

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
