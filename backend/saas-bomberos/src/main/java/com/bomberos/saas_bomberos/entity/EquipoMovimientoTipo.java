package com.bomberos.saas_bomberos.entity;

// Tipo de evento registrado en el historial de un equipo. Base de la
// trazabilidad: a futuro se suman préstamos, asignaciones, etc.
public enum EquipoMovimientoTipo {
    ALTA,
    ACTUALIZACION,
    CAMBIO_ESTADO,
    CAMBIO_UBICACION,
    OBSERVACION,
    BAJA
}
