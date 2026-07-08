package com.bomberos.saas_bomberos.entity;

// Resultado de un ítem controlado. Para ítems con cantidad lo calcula
// el backend comparando esperada vs encontrada; para el resto depende
// de si el bombero lo marcó correcto o con novedad.
public enum ChecklistItemEstado {
    CORRECTO,
    FALTANTE,
    SOBRANTE,
    NOVEDAD,
    NO_CONTROLADO
}
