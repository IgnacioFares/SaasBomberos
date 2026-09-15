package com.bomberos.saas_bomberos.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record TareaAreaResponse(
        Long id,
        Long areaId,
        String areaNombre,
        String titulo,
        String descripcion,
        List<BomberoResumenDto> asignados,
        LocalDate fechaLimite,
        LocalDateTime fechaCreacion,
        String creadaPorNombre,
        String estado,
        String completadaPorNombre,
        LocalDateTime completadaEn
) {
}
