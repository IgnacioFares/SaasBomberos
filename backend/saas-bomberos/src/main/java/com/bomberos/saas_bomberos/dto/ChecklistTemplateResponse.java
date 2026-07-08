package com.bomberos.saas_bomberos.dto;

import java.time.LocalDateTime;
import java.util.List;

// Se devuelve como DTO (no la entidad) para no depender de que la
// sesión de Hibernate siga abierta al serializar, y para no exponer
// el grafo completo de Usuario/Rol/Movilidad.
public record ChecklistTemplateResponse(
        Long id,
        String nombre,
        Long movilidadId,
        String movilidadNombre,
        String creadoPorNombre,
        LocalDateTime createdAt,
        Integer totalItems,
        List<SeccionResponse> secciones
) {
    public record SeccionResponse(Long id, String nombre, Integer orden, List<ItemResponse> items) {}

    public record ItemResponse(
            Long id,
            String nombre,
            String descripcion,
            Boolean requiereCantidad,
            Integer cantidadEsperada,
            Boolean obligatorio,
            Integer orden
    ) {}
}
