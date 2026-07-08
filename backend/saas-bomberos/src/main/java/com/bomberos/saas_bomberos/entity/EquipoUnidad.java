package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

// Unidad individual de un Equipo con seguimiento POR_UNIDAD (ej:
// "Casco N°3"). Tiene estado, ubicación, serie y vencimiento propios,
// lo que a futuro habilita mantenimientos y asignaciones por unidad.
@Data
@Entity
@Table(name = "equipo_unidades")
public class EquipoUnidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Correlativo dentro del equipo (1, 2, 3...) para nombrarla:
    // "Casco N°3". No se reutiliza al dar de baja una unidad.
    @Column(nullable = false)
    private Integer numero;

    @Column(name = "numero_serie")
    private String numeroSerie;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipoEstado estado = EquipoEstado.EN_DEPOSITO;

    @ManyToOne
    @JoinColumn(name = "ubicacion_id")
    private UbicacionEquipo ubicacion;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    private String observacion;

    @Column(nullable = false)
    private Boolean activo = true;
}
