package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// Plantilla de checklist: la crea un administrador para una movilidad
// puntual, con secciones e ítems totalmente libres (ej: "Parte del
// conductor" -> alcohol, cinta de peligro, guía matpel).
@Data
@Entity
@Table(name = "checklist_templates")
public class ChecklistTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre del checklist es obligatorio")
    @Column(nullable = false)
    private String nombre;

    @ManyToOne
    @JoinColumn(name = "movilidad_id", nullable = false)
    private Movilidad movilidad;

    @ManyToOne
    @JoinColumn(name = "creado_por", nullable = false)
    private Usuario creadoPor;

    // Unidireccional a propósito (sin campo de vuelta en ChecklistSeccion)
    // para no arrastrar referencias circulares al serializar.
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "template_id")
    @OrderBy("orden ASC")
    private List<ChecklistSeccion> secciones = new ArrayList<>();

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
