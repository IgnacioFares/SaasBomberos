package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

// Una "corrida" concreta de un checklist: quién lo hizo, con quiénes,
// cuándo, el resultado ítem por ítem, y la firma del encargado. La
// plantilla (ChecklistTemplate) define la estructura; esto es el
// registro permanente de que efectivamente se controló.
@Data
@Entity
@Table(name = "checklist_registros")
public class ChecklistRegistro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "template_id", nullable = false)
    private ChecklistTemplate template;

    // Responsable principal del control.
    @ManyToOne
    @JoinColumn(name = "realizado_por", nullable = false)
    private Usuario realizadoPor;

    // Otros bomberos que participaron además del responsable.
    @ManyToMany
    @JoinTable(
            name = "checklist_registro_participantes",
            joinColumns = @JoinColumn(name = "registro_id"),
            inverseJoinColumns = @JoinColumn(name = "bombero_id")
    )
    private Set<Bombero> participantes = new LinkedHashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChecklistRegistroEstado estado = ChecklistRegistroEstado.PENDIENTE_FIRMA;

    @Column(name = "observacion_general")
    private String observacionGeneral;

    // Cuánto tardó el control; lo mide el frontend desde que se abre el
    // checklist hasta que se envía.
    @Column(name = "duracion_segundos")
    private Integer duracionSegundos;

    @ManyToOne
    @JoinColumn(name = "firmado_por")
    private Usuario firmadoPor;

    @Column(name = "firmado_en")
    private LocalDateTime firmadoEn;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "registro_id")
    private List<ChecklistRegistroItem> resultados = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime fecha;

    @PrePersist
    protected void onCreate() {
        fecha = LocalDateTime.now();
    }
}
