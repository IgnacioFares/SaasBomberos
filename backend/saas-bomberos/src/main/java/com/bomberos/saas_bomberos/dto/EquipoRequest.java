package com.bomberos.saas_bomberos.dto;

import java.time.LocalDate;

// Alta/edición de un equipo del inventario.
// - seguimiento POR_CANTIDAD: usa cantidad + unidadMedida + estado + ubicacionId.
// - seguimiento POR_UNIDAD: usa cantidadUnidades (solo en el alta) para
//   generar las unidades autonumeradas; estado/ubicacionId actúan como
//   valores iniciales de esas unidades. Después cada unidad se gestiona
//   individualmente. El seguimiento no puede cambiarse una vez creado.
public record EquipoRequest(
        String nombre,
        String codigoInterno,
        Long categoriaId,
        Long subcategoriaId,
        String descripcion,
        String marca,
        String modelo,
        String numeroSerie,
        String seguimiento,
        Integer cantidad,
        Integer cantidadUnidades,
        String unidadMedida,
        String estado,
        Long ubicacionId,
        LocalDate fechaCompra,
        LocalDate fechaVencimiento,
        String observaciones
) {}
