package com.bomberos.saas_bomberos.service;

// Login correcto pero con el email sin confirmar. Va aparte del error
// genérico para que el frontend pueda ofrecer "reenviar el código" en
// lugar de mostrar un cartel rojo sin salida (ver
// ManejadorGlobalDeErrores: responde 403 con un código propio).
public class EmailNoVerificadoException extends RuntimeException {
    public EmailNoVerificadoException(String mensaje) {
        super(mensaje);
    }
}
