package com.bomberos.saas_bomberos.entity;

// Ciclo de vida de un despacho: mientras está EN_CURSO el personal
// puede compartir su ubicación y la dotación se ve en el mapa; al
// finalizarlo el recorrido queda congelado como historial.
public enum DespachoEstado {
    EN_CURSO,
    FINALIZADO
}
