package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.Embeddable;
import lombok.Data;

// Bloque común "Datos del solicitante".
@Data
@Embeddable
public class SolicitanteInfo {

    private String nombre;
    private String apellido;
    private String dni;
    private String telefono;
}
