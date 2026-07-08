package com.bomberos.saas_bomberos.dto;

public class UbicacionEquipoDto {

    public record Request(String nombre) {}

    public record Response(Long id, String nombre) {}
}
