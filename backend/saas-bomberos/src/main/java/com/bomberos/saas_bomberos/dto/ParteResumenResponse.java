package com.bomberos.saas_bomberos.dto;

import com.bomberos.saas_bomberos.entity.ParteEstado;
import com.bomberos.saas_bomberos.entity.TipoParte;
import java.time.LocalDate;
import java.time.LocalDateTime;

// Fila liviana para el listado/historial (evita mandar los ~100 campos
// del detalle completo solo para armar la tabla).
public record ParteResumenResponse(
        Long id,
        TipoParte tipoParte,
        String tituloParte,
        String codigoFormulario,
        Integer numeroParte,
        String numeroRuba,
        LocalDate fechaHecho,
        ParteEstado estado,
        String creadoPorNombre,
        LocalDateTime creadoEn
) {}
