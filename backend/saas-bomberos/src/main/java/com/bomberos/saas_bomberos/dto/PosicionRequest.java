package com.bomberos.saas_bomberos.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

// Un ping de GPS tal como lo entrega el navegador del celular.
public record PosicionRequest(
        @NotNull(message = "Falta la latitud")
        @DecimalMin(value = "-90.0", message = "Latitud inválida")
        @DecimalMax(value = "90.0", message = "Latitud inválida")
        Double latitud,

        @NotNull(message = "Falta la longitud")
        @DecimalMin(value = "-180.0", message = "Longitud inválida")
        @DecimalMax(value = "180.0", message = "Longitud inválida")
        Double longitud,

        Double precisionMetros,
        Double velocidad,
        Double rumbo
) {
}
