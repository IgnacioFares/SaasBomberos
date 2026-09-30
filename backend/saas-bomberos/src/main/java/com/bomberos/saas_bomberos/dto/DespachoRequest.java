package com.bomberos.saas_bomberos.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// Lo que se manda al despachar una movilidad. El destino es opcional:
// muchas veces se sale sin dirección exacta y se ajusta en camino.
public record DespachoRequest(
        @NotNull(message = "Hay que elegir una movilidad")
        Long movilidadId,

        @NotBlank(message = "El motivo es obligatorio")
        String motivo,

        String destino,

        @DecimalMin(value = "-90.0", message = "Latitud inválida")
        @DecimalMax(value = "90.0", message = "Latitud inválida")
        Double destinoLat,

        @DecimalMin(value = "-180.0", message = "Longitud inválida")
        @DecimalMax(value = "180.0", message = "Longitud inválida")
        Double destinoLng,

        // Si la movilidad sale desde donde quedó de una salida anterior
        // en vez de desde el cuartel, acá viene el id de aquella. El
        // recorrido se cuenta desde ese punto.
        Long despachoAnteriorId
) {
}
