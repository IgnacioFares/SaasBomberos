package com.bomberos.saas_bomberos.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ChecklistRegistroResponse(
        Long id,
        Long templateId,
        String templateNombre,
        String movilidadNombre,
        String realizadoPorNombre,
        List<ParticipanteResponse> participantes,
        String estado,
        LocalDateTime fecha,
        Integer duracionSegundos,
        String observacionGeneral,
        String firmadoPorNombre,
        LocalDateTime firmadoEn,
        Resumen resumen,
        List<ResultadoResponse> resultados
) {
    public record ParticipanteResponse(Long id, String nombre) {}

    // Conteos precalculados para que las tarjetas de pendientes e
    // historial muestren el estado general sin recorrer los resultados.
    public record Resumen(
            int correctos,
            int faltantes,
            int sobrantes,
            int novedades,
            int noControlados,
            int conObservacion
    ) {}

    public record ResultadoResponse(
            Long itemId,
            String itemNombre,
            String seccionNombre,
            Integer cantidadEsperada,
            Integer cantidadEncontrada,
            String estado,
            String observacion
    ) {}
}
