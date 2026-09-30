package com.bomberos.saas_bomberos.dto;

import com.bomberos.saas_bomberos.entity.Despacho;
import com.bomberos.saas_bomberos.entity.DespachoEstado;
import java.time.LocalDateTime;

// Vista de un despacho para las listas y el encabezado del mapa.
// "enVivo" es cuánta gente está transmitiendo su ubicación ahora.
//
// Los kilómetros son estimados en línea recta entre origen y destino
// (ver Distancias). La vuelta solo se cuenta si la movilidad volvió al
// cuartel desde acá: si encadenó con otra salida, ese tramo lo aporta
// la salida siguiente y acá va en cero, para no contarlo dos veces.
public record DespachoResponse(
        Long id,
        Long movilidadId,
        String movilidadNombre,
        String movilidadPatente,
        String motivo,
        String destino,
        Double destinoLat,
        Double destinoLng,
        String origenNombre,
        Double origenLat,
        Double origenLng,
        Long despachoAnteriorId,
        DespachoEstado estado,
        String despachadoPor,
        LocalDateTime iniciadoEn,
        LocalDateTime finalizadoEn,
        long enVivo,
        Double idaKm,
        Double vueltaKm,
        Double recorridoKm
) {
    public static DespachoResponse desde(Despacho d, long enVivo, Recorrido recorrido) {
        return new DespachoResponse(
                d.getId(),
                d.getMovilidad() != null ? d.getMovilidad().getId() : null,
                d.getMovilidad() != null ? d.getMovilidad().getNombre() : null,
                d.getMovilidad() != null ? d.getMovilidad().getPatente() : null,
                d.getMotivo(),
                d.getDestino(),
                d.getDestinoLat(),
                d.getDestinoLng(),
                d.getOrigenNombre(),
                d.getOrigenLat(),
                d.getOrigenLng(),
                d.getDespachoAnterior() != null ? d.getDespachoAnterior().getId() : null,
                d.getEstado(),
                nombreDe(d),
                d.getIniciadoEn(),
                d.getFinalizadoEn(),
                enVivo,
                recorrido.ida(),
                recorrido.vuelta(),
                recorrido.total()
        );
    }

    // Los tres tramos quedan en null cuando no se puede calcular: sin
    // destino ubicado en el mapa no hay recorrido que estimar.
    public record Recorrido(Double ida, Double vuelta, Double total) {
        public static final Recorrido DESCONOCIDO = new Recorrido(null, null, null);
    }

    private static String nombreDe(Despacho d) {
        if (d.getDespachadoPor() == null || d.getDespachadoPor().getBombero() == null) return null;
        var b = d.getDespachadoPor().getBombero();
        return b.getNombre() + " " + b.getApellido();
    }
}
