package com.bomberos.saas_bomberos.dto;

// Opciones de punto de partida al despachar una movilidad: el cuartel
// o, si viene de otra salida, el destino de aquella.
public record OrigenSugeridoResponse(
        Punto base,
        Punto ultimoDestino
) {
    // "despachoId" solo viene en el ultimo destino: es el despacho con
    // el que se encadena la nueva salida.
    public record Punto(Long despachoId, String nombre, Double lat, Double lng) {}
}
