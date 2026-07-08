package com.bomberos.saas_bomberos.dto;

// Request y response de categorías de equipamiento. La lista se
// devuelve plana (con padreId); el frontend arma el árbol de dos
// niveles categoría → subcategorías.
public class CategoriaEquipoDto {

    public record Request(String nombre, Long padreId) {}

    public record Response(Long id, String nombre, Long padreId) {}
}
