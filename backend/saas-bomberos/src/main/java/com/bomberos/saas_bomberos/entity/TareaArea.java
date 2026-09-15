package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.ToString;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

// Una tarea asignada por el encargado de un área a uno o más de sus
// integrantes. Es el registro permanente de control del área: quién la
// creó, a quién se la asignó, el límite de tiempo y, una vez
// realizada, quién la completó y cuándo.
@Data
@Entity
@Table(name = "tareas_area")
public class TareaArea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "area_id", nullable = false)
    private AreaTrabajo area;

    @NotBlank(message = "El título de la tarea es obligatorio")
    @Column(nullable = false)
    private String titulo;

    private String descripcion;

    @ToString.Exclude
    @ManyToMany
    @JoinTable(
            name = "tarea_area_asignados",
            joinColumns = @JoinColumn(name = "tarea_id"),
            inverseJoinColumns = @JoinColumn(name = "bombero_id")
    )
    private Set<Bombero> asignados = new LinkedHashSet<>();

    @Column(name = "fecha_limite", nullable = false)
    private LocalDate fechaLimite;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @ManyToOne
    @JoinColumn(name = "creada_por", nullable = false)
    private Usuario creadaPor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TareaAreaEstado estado = TareaAreaEstado.PENDIENTE;

    @ManyToOne
    @JoinColumn(name = "completada_por")
    private Usuario completadaPor;

    @Column(name = "completada_en")
    private LocalDateTime completadaEn;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
}
