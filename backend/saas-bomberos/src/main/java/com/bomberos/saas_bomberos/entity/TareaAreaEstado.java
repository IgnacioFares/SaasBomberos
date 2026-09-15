package com.bomberos.saas_bomberos.entity;

// Una tarea nace PENDIENTE (el encargado puede eliminarla) y pasa a
// REALIZADA cuando el encargado o alguno de los asignados la completa;
// a partir de ahí queda fija en el historial (no se puede eliminar).
public enum TareaAreaEstado {
    PENDIENTE,
    REALIZADA
}
