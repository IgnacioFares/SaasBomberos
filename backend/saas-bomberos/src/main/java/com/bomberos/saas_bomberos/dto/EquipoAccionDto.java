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

    // Alta de unidades adicionales en un equipo POR_UNIDAD (ej: se
    // compraron 2 cascos más). Se numeran a continuación de la última.
    public record AgregarUnidadesRequest(Integer cantidad, String estado, Long ubicacionId, String nota) {}

    // Mueve N unidades de una línea de stock hacia otra ubicación y/o
    // estado (ej: 3 hachas del Depósito al Móvil 1, en servicio).
    public record MoverStockRequest(
            Long stockId,
            Integer cantidad,
            Long ubicacionDestinoId,
            String estadoDestino,
            String nota
    ) {}

    // Fija la cantidad absoluta de una línea (stockId) o crea/suma una
    // línea nueva (ubicacionId + estado). Cantidad 0 elimina la línea.
    public record AjustarStockRequest(
            Long stockId,
            Long ubicacionId,
            String estado,
            Integer cantidad,
            String nota
    ) {}
}
