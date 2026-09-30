package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.config.DataSeeder;
import com.bomberos.saas_bomberos.config.PermisosCatalogo;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.Set;

// Punto único de autorización del sistema. Permisos efectivos de un
// usuario = permisos de su rol ∪ permisos extra otorgados por el
// administrador. El rol Administrador tiene todos implícitamente.
@Service
@RequiredArgsConstructor
public class AutorizacionService {

    private final UsuarioRepository usuarioRepository;

    public boolean esAdministrador(Usuario usuario) {
        return usuario != null
                && usuario.getRol() != null
                && DataSeeder.ROL_ADMIN.equals(usuario.getRol().getNombre());
    }

    public boolean tiene(Usuario usuario, String permiso) {
        if (usuario == null) return false;
        if (esAdministrador(usuario)) return true;
        return usuarioRepository.permisosExtra(usuario.getId()).contains(permiso)
                || usuarioRepository.permisosDeRol(usuario.getId()).contains(permiso);
    }

    public void exigir(Usuario usuario, String permiso) {
        if (!tiene(usuario, permiso)) {
            PermisosCatalogo.PermisoDef def = PermisosCatalogo.porNombre(permiso);
            String etiqueta = def != null ? def.etiqueta() : permiso;
            throw new AccesoDenegadoException(
                    "Necesitás el permiso \"" + etiqueta + "\". Pedíselo a un administrador.");
        }
    }

    public void exigirAdministrador(Usuario usuario) {
        if (!esAdministrador(usuario)) {
            throw new AccesoDenegadoException("Solo un administrador puede hacer esto");
        }
    }

    // Para /me y el panel: lo que el usuario puede hacer efectivamente.
    public Set<String> permisosEfectivos(Usuario usuario) {
        Set<String> permisos = new LinkedHashSet<>();
        if (esAdministrador(usuario)) {
            PermisosCatalogo.CATALOGO.forEach(p -> permisos.add(p.nombre()));
            return permisos;
        }
        permisos.addAll(usuarioRepository.permisosDeRol(usuario.getId()));
        permisos.addAll(usuarioRepository.permisosExtra(usuario.getId()));
        return permisos;
    }
}
