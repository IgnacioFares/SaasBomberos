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

    // Legado: la cantidad de POR_CANTIDAD vive ahora en las líneas de
    // stock; este campo solo se usa para migrar datos viejos.
    private Integer cantidad;

    @Column(name = "unidad_medida")
    private String unidadMedida;

    // Estado/ubicación por defecto al dar de alta (los POR_UNIDAD los
    // copian a sus unidades; los POR_CANTIDAD a su línea de stock
    // inicial). El estado real vive en unidades/stock.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipoEstado estado = EquipoEstado.EN_DEPOSITO;

    @ManyToOne
    @JoinColumn(name = "ubicacion_id")
    private UbicacionEquipo ubicacion;

    // Stock desglosado por ubicación y estado (solo POR_CANTIDAD).
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "equipo_id")
    private List<EquipoStock> stock = new ArrayList<>();

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
