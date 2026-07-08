package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.entity.Bombero;
import com.bomberos.saas_bomberos.entity.Rol;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.repository.BomberoRepository;
import com.bomberos.saas_bomberos.repository.RolRepository;
import com.bomberos.saas_bomberos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.bomberos.saas_bomberos.security.JwtService;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BomberoRepository bomberoRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public Usuario registrar(String email, String password, Bombero bombero) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new RuntimeException("Ya existe un usuario con ese email");
        }
        if (bomberoRepository.existsByDni(bombero.getDni())) {
            throw new RuntimeException("Ya existe un bombero con ese DNI");
        }

        Bombero bomberoGuardado = bomberoRepository.save(bombero);

        Rol rolEstandar = rolRepository.findByNombre("Usuario Estándar")
                .orElseThrow(() -> new RuntimeException("Rol por defecto no configurado"));

        Usuario usuario = new Usuario();
        usuario.setEmail(email);
        usuario.setPassword(passwordEncoder.encode(password));
        usuario.setBombero(bomberoGuardado);
        usuario.setRol(rolEstandar);
        usuario.setEstado("ACTIVO");

        return usuarioRepository.save(usuario);
    }

    public Usuario asignarRol(Long usuarioId, Long rolId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Rol rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        usuario.setRol(rol);
        return usuarioRepository.save(usuario);
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
