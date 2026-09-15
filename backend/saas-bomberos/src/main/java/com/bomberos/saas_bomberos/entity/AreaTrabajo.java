package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.ToString;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

// Un área de trabajo interna del cuartel (mantenimiento, capacitación,
// etc.): tiene un encargado que asigna tareas a sus integrantes. El
// historial de lo realizado queda en TareaArea.
@Data
@Entity
@Table(name = "areas_trabajo")
public class AreaTrabajo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Column(nullable = false, unique = true)
    private String nombre;

    private String descripcion;

    // Quien crea y asigna las tareas del área. Nullable hasta que el
    // administrador lo designe.
    @ManyToOne
    @JoinColumn(name = "encargado_id")
    private Bombero encargado;

    // Ver el comentario equivalente en Usuario.permisosExtra: se excluye
    // del toString() para evitar problemas con colecciones lazy.
    @ToString.Exclude
    @ManyToMany
    @JoinTable(
            name = "area_trabajo_integrantes",
            joinColumns = @JoinColumn(name = "area_id"),
            inverseJoinColumns = @JoinColumn(name = "bombero_id")
    )
    private Set<Bombero> integrantes = new LinkedHashSet<>();

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;

    @PrePersist
    protected void onCreate() {
        creadoEn = LocalDateTime.now();
    }
}
