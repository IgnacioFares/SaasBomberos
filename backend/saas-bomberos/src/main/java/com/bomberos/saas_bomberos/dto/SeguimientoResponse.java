package com.bomberos.saas_bomberos.dto;

import java.time.LocalDateTime;
import java.util.List;

// Todo lo que el mapa necesita para dibujarse: el despacho y, por cada
// persona que está (o estuvo) compartiendo ubicación, su última
// posición y el recorrido que hizo.
public record SeguimientoResponse(
        DespachoResponse despacho,
        List<Participante> participantes
) {
    public record Punto(Double latitud, Double longitud, LocalDateTime registradoEn) {}

    public record Participante(
            Long usuarioId,
            String nombreCompleto,
            Double latitud,
            Double longitud,
            Double precisionMetros,
            Double velocidad,
            Double rumbo,
            LocalDateTime ultimaSenal,
            // Transmitió hace poco: si no, el marcador se muestra apagado.
            boolean enVivo,
            List<Punto> recorrido
    ) {}
}
