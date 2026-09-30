package com.bomberos.saas_bomberos.service;

// Se lanza cuando el usuario está autenticado pero no tiene el permiso
// necesario. ManejadorGlobalDeErrores la traduce a un 403, para que no
// se confunda con un error de datos (400).
public class AccesoDenegadoException extends RuntimeException {

    public AccesoDenegadoException(String mensaje) {
        super(mensaje);
    }
}
