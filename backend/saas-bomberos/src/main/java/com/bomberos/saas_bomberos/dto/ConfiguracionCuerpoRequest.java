package com.bomberos.saas_bomberos.dto;

public record ConfiguracionCuerpoRequest(
        String nombreCuerpo,
        String jefeDeCuerpo,
        String departamentoElaboracion
) {}
