package com.bomberos.saas_bomberos.dto;

public record ConfiguracionCuerpoResponse(
        String nombreCuerpo,
        String jefeDeCuerpo,
        String departamentoElaboracion,
        String baseNombre,
        Double baseLat,
        Double baseLng
) {}
