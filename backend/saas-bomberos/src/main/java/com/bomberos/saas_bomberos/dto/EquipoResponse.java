package com.bomberos.saas_bomberos.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record EquipoResponse(
        Long id,
        String nombre,
        String codigoInterno,
        Long categoriaId,
        String categoriaNombre,
        Long subcategoriaId,
        String subcategoriaNombre,
        String descripcion,
        String marca,
        String modelo,
        String numeroSerie,
        String seguimiento,
        // Cantidad efectiva: la cargada (POR_CANTIDAD) o las unidades
        // activas no dadas de baja (POR_UNIDAD).
        Integer cantidad,
        String unidadMedida,
        String estado,
        Long ubicacionId,
        String ubicacionNombre,
        LocalDate fechaCompra,
        LocalDate fechaVencimiento,
        // SIN_VENCIMIENTO | VIGENTE | POR_VENCER | VENCIDO. Para
        // POR_UNIDAD se agrega el peor caso entre equipo y unidades.
        String estadoVencimiento,
        String observaciones,
        // Solo POR_UNIDAD: conteo por estado para resumir en la tabla
        // (ej: {EN_SERVICIO: 3, EN_REPARACION: 1}).
        Map<String, Integer> unidadesPorEstado,
        List<UnidadResponse> unidades,
        LocalDateTime createdAt
) {
    public record UnidadResponse(
            Long id,
            Integer numero,
            String numeroSerie,
            String estado,
            Long ubicacionId,
            String ubicacionNombre,
            LocalDate fechaVencimiento,
            String estadoVencimiento,
            String observacion
    ) {}
}
