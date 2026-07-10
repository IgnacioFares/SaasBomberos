package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.config.DataSeeder;
import com.bomberos.saas_bomberos.config.PermisosCatalogo;
import com.bomberos.saas_bomberos.dto.UsuarioAdminDto;
import com.bomberos.saas_bomberos.entity.Bombero;
import com.bomberos.saas_bomberos.entity.Permiso;
import com.bomberos.saas_bomberos.entity.Rol;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.repository.BomberoRepository;
import com.bomberos.saas_bomberos.repository.PermisoRepository;
import com.bomberos.saas_bomberos.repository.RolRepository;
import com.bomberos.saas_bomberos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.bomberos.saas_bomberos.security.JwtService;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BomberoRepository bomberoRepository;
    private final RolRepository rolRepository;
    private final PermisoRepository permisoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AutorizacionService autorizacion;

    public Usuario registrar(String email, String password, Bombero bombero) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new RuntimeException("Ya existe un usuario con ese email");
        }
        if (bomberoRepository.existsByDni(bombero.getDni())) {
            throw new RuntimeException("Ya existe un bombero con ese DNI");
        }

        Bombero bomberoGuardado = bomberoRepository.save(bombero);

        // Bootstrap del sistema: la PRIMERA cuenta que se registra en una
        // base vacía queda como Administrador (si no, nadie podría entrar
        // al panel para otorgar permisos). Las siguientes nacen estándar.
        String nombreRol = usuarioRepository.count() == 0
                ? DataSeeder.ROL_ADMIN
                : DataSeeder.ROL_ESTANDAR;
        Rol rol = rolRepository.findByNombre(nombreRol)
                .orElseThrow(() -> new RuntimeException("Rol por defecto no configurado"));

        Usuario usuario = new Usuario();
        usuario.setEmail(email);
        usuario.setPassword(passwordEncoder.encode(password));
        usuario.setBombero(bomberoGuardado);
        usuario.setRol(rol);
        usuario.setEstado("ACTIVO");

        return usuarioRepository.save(usuario);
    }

    public Usuario asignarRol(Long usuarioId, Long rolId, Usuario solicitante) {
        autorizacion.exigirAdministrador(solicitante);
        if (solicitante.getId().equals(usuarioId)) {
            // Evita que el último administrador se degrade a sí mismo y
            // el sistema quede sin nadie que pueda administrar.
            throw new RuntimeException("No podés cambiar tu propio rol");
        }
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Rol rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        usuario.setRol(rol);
        return usuarioRepository.save(usuario);
    }

    // ------------------------------------------------------------------
    // Panel de administración
    // ------------------------------------------------------------------

    public List<UsuarioAdminDto.Response> obtenerTodosParaAdmin(Usuario solicitante) {
        autorizacion.exigirAdministrador(solicitante);
        return usuarioRepository.findAll().stream()
                .map(u -> new UsuarioAdminDto.Response(
                        u.getId(),
                        u.getEmail(),
                        u.getEstado(),
                        u.getBombero().getNombre(),
                        u.getBombero().getApellido(),
                        u.getBombero().getRango(),
                        new UsuarioAdminDto.RolInfo(u.getRol().getId(), u.getRol().getNombre()),
                        u.getPermisosExtra().stream().map(Permiso::getNombre).sorted().toList(),
                        u.getCreatedAt()))
                .toList();
    }

    public UsuarioAdminDto.Response asignarPermisos(Long usuarioId, List<String> permisos, Usuario solicitante) {
        autorizacion.exigirAdministrador(solicitante);
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Set<Permiso> nuevos = new HashSet<>();
        if (permisos != null) {
            for (String nombre : permisos) {
                if (PermisosCatalogo.porNombre(nombre) == null) {
                    throw new RuntimeException("Permiso desconocido: " + nombre);
                }
                nuevos.add(permisoRepository.findByNombre(nombre)
                        .orElseThrow(() -> new RuntimeException("Permiso no configurado: " + nombre)));
            }
        }
        usuario.setPermisosExtra(nuevos);
        Usuario guardado = usuarioRepository.save(usuario);

        return new UsuarioAdminDto.Response(
                guardado.getId(),
                guardado.getEmail(),
                guardado.getEstado(),
                guardado.getBombero().getNombre(),
                guardado.getBombero().getApellido(),
                guardado.getBombero().getRango(),
                new UsuarioAdminDto.RolInfo(guardado.getRol().getId(), guardado.getRol().getNombre()),
                guardado.getPermisosExtra().stream().map(Permiso::getNombre).sorted().toList(),
                guardado.getCreatedAt());
    }

    public List<UsuarioAdminDto.RolInfo> obtenerRoles(Usuario solicitante) {
        autorizacion.exigirAdministrador(solicitante);
        return rolRepository.findAll().stream()
                .map(r -> new UsuarioAdminDto.RolInfo(r.getId(), r.getNombre()))
                .toList();
    }

    public String login(String email, String password) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email o contraseña incorrectos"));

        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            throw new RuntimeException("Email o contraseña incorrectos");
        }

        return jwtService.generarToken(usuario.getEmail());
    }
}
