package com.bomberos.saas_bomberos.dto;

// Vista mínima de un bombero para no serializar la entidad completa
// (ni arrastrar sus colecciones lazy) en respuestas que solo necesitan
// mostrar quién es: encargado, integrantes, asignados de una tarea.
public record BomberoResumenDto(Long id, String nombreCompleto) {
}
