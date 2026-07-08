package com.bomberos.saas_bomberos.dto;

import java.time.LocalDateTime;

public record EquipoMovimientoResponse(
        Long id,
        String tipo,
        String detalle,
        Integer unidadNumero,
        String realizadoPorNombre,
        LocalDateTime fecha
) {}
