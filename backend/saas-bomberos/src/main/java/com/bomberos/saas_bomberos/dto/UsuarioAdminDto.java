package com.bomberos.saas_bomberos.dto;

import java.time.LocalDateTime;
import java.util.List;

// DTOs del panel de administración de usuarios y permisos.
public class UsuarioAdminDto {

    public record Response(
            Long id,
            String email,
            String estado,
            String nombre,
            String apellido,
            String rango,
            RolInfo rol,
            List<String> permisosExtra,
            LocalDateTime createdAt
    ) {}

    public record RolInfo(Long id, String nombre) {}

    public record PermisoInfo(String nombre, String etiqueta, String descripcion) {}

    public record AsignarPermisosRequest(List<String> permisos) {}
}
