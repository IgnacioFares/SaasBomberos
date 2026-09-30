package com.bomberos.saas_bomberos.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

public record ConfiguracionCuerpoRequest(
        String nombreCuerpo,
        String jefeDeCuerpo,
        String departamentoElaboracion,

        // Punto de partida de las movilidades.
        String baseNombre,

        @DecimalMin(value = "-90.0", message = "Latitud invalida")
        @DecimalMax(value = "90.0", message = "Latitud invalida")
        Double baseLat,

        @DecimalMin(value = "-180.0", message = "Longitud invalida")
        @DecimalMax(value = "180.0", message = "Longitud invalida")
        Double baseLng
) {}
