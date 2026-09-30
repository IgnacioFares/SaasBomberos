package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

// Una salida concreta de una movilidad: a qué fue, adónde y desde
// cuándo. Es el "contenedor" del rastreo: el personal que sale con esa
// movilidad comparte su ubicación contra el despacho y así se lo puede
// seguir en el mapa desde el cuartel.
@Data
@Entity
@Table(name = "despachos")
public class Despacho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "movilidad_id", nullable = false)
    private Movilidad movilidad;

    @Column(nullable = false)
    private String motivo;

    // Dirección del destino en texto libre, tal como la dicta quien llama.
    private String destino;

    // Coordenadas del destino, si se marcan en el mapa al despachar.
    @Column(name = "destino_lat")
    private Double destinoLat;

    @Column(name = "destino_lng")
    private Double destinoLng;

    // Desde dónde salió: normalmente el cuartel, pero si la movilidad
    // venía de otra salida es el destino de aquella. Se copia al crear
    // el despacho para que el recorrido no cambie si después se edita
    // la dirección del cuartel.
    @Column(name = "origen_nombre")
    private String origenNombre;

    @Column(name = "origen_lat")
    private Double origenLat;

    @Column(name = "origen_lng")
    private Double origenLng;

    // La salida de la que viene encadenada, si la movilidad fue de un
    // servicio a otro sin pasar por el cuartel.
    @ManyToOne
    @JoinColumn(name = "despacho_anterior_id")
    private Despacho despachoAnterior;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DespachoEstado estado = DespachoEstado.EN_CURSO;

    @ManyToOne
    @JoinColumn(name = "despachado_por", nullable = false)
    private Usuario despachadoPor;

    @Column(name = "iniciado_en", nullable = false)
    private LocalDateTime iniciadoEn;

    @Column(name = "finalizado_en")
    private LocalDateTime finalizadoEn;

    @PrePersist
    protected void onCreate() {
        iniciadoEn = LocalDateTime.now();
    }
}
