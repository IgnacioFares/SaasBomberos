package com.bomberos.saas_bomberos.entity;

// Ciclo de vida de un checklist realizado: al completarse queda
// pendiente hasta que el encargado de guardia lo firma.
public enum ChecklistRegistroEstado {
    PENDIENTE_FIRMA,
    FIRMADO
}
