package com.bomberos.saas_bomberos.entity;

// Cómo se gestiona el stock de un equipo:
// - POR_CANTIDAD: se cuenta en bloque (ej: 25 acoples, 300 m de manguera).
// - POR_UNIDAD: cada unidad se rastrea individualmente con su propio
//   estado, ubicación, serie y vencimiento (ej: cada ERA, cada casco).
public enum EquipoSeguimiento {
    POR_CANTIDAD,
    POR_UNIDAD
}
