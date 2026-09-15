package com.bomberos.saas_bomberos.dto;

import java.time.LocalDateTime;
import java.util.List;

public record AreaTrabajoResponse(
        Long id,
        String nombre,
        String descripcion,
        BomberoResumenDto encargado,
        List<BomberoResumenDto> integrantes,
        boolean activo,
        LocalDateTime creadoEn,
        long tareasPendientes
) {
}
