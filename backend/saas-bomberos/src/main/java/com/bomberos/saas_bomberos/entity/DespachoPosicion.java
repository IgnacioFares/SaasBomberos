package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

// Un "ping" de GPS: dónde estaba una persona en un instante durante un
// despacho. Se guardan todos los pings para poder dibujar el recorrido;
// el último de cada persona es lo que se ve como marcador en el mapa.
@Data
@Entity
@Table(
        name = "despacho_posiciones",
        indexes = @Index(name = "idx_posicion_despacho", columnList = "despacho_id, registrado_en")
)
public class DespachoPosicion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "despacho_id", nullable = false)
    private Despacho despacho;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private Double latitud;

    @Column(nullable = false)
    private Double longitud;

    // Radio de error que informa el navegador, en metros.
    @Column(name = "precision_metros")
    private Double precisionMetros;

    // Metros por segundo y grados respecto al norte; el navegador los
    // manda solo cuando el dispositivo puede calcularlos.
    private Double velocidad;

    private Double rumbo;

    @Column(name = "registrado_en", nullable = false)
    private LocalDateTime registradoEn;

    @PrePersist
    protected void onCreate() {
        if (registradoEn == null) registradoEn = LocalDateTime.now();
    }
}
