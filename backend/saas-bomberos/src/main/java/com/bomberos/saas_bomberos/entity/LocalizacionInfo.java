package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

// Bloque común "Localización", reutilizado por los 10 tipos de parte.
@Data
@Embeddable
public class LocalizacionInfo {

    private String localidad;
    private String distrito;

    @Column(name = "calle_ruta")
    private String calleRuta;

    @Column(name = "numero_km")
    private String numeroKm;

    @Column(name = "entre_calles")
    private String entreCalles;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_zona")
    private TipoZona tipoZona;
}
