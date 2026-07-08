package com.bomberos.saas_bomberos.dto;

import java.time.LocalDate;

// Acciones puntuales sobre un equipo o sobre una unidad específica
// (si unidadId viene informado). Cada una queda registrada en el
// historial de movimientos.
public class EquipoAccionDto {

    public record CambioEstadoRequest(String estado, Long unidadId, String nota) {}

    public record CambioUbicacionRequest(Long ubicacionId, Long unidadId, String nota) {}

    public record ObservacionRequest(String observacion, Long unidadId) {}

    // Edición de los datos propios de una unidad individual.
    public record UnidadUpdateRequest(String numeroSerie, LocalDate fechaVencimiento) {}
}
