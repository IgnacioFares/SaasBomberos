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
import org.springframework.transaction.annotation.Transactional;
import com.bomberos.saas_bomberos.security.JwtService;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Locale;
import java.util.List;
import java.util.Set;

@Service
@Transactional
@RequiredArgsConstructor
public class UsuarioService {

    // Cuánto vale el código que se manda por mail al registrarse.
    public static final int MINUTOS_VIGENCIA_CODIGO = 15;

    // Mínimo entre dos envíos del código a la misma cuenta.
    private static final int ESPERA_REENVIO_SEGUNDOS = 60;

    private static final SecureRandom SORTEADOR = new SecureRandom();

    private final UsuarioRepository usuarioRepository;
    private final BomberoRepository bomberoRepository;
    private final RolRepository rolRepository;
    private final PermisoRepository permisoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AutorizacionService autorizacion;
    private final EmailService emailService;

    public Usuario registrar(String email, String password, Bombero bombero) {
        String emailNormalizado = normalizarEmail(email);
        if (usuarioRepository.existsByEmail(emailNormalizado)) {
            throw new RuntimeException("Ya existe un usuario con ese email");
        }
        if (bomberoRepository.existsByDni(bombero.getDni())) {
            throw new RuntimeException("Ya existe un bombero con ese DNI");
        }
        PoliticaPassword.validar(password, emailNormalizado, bombero);

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
        usuario.setEmail(emailNormalizado);
        usuario.setPassword(passwordEncoder.encode(password));
        usuario.setBombero(bomberoGuardado);
        usuario.setRol(rol);
        // Modo demo: la cuenta nace activa, sin código de verificación por
        // mail. Para volver a exigirlo: estado "PENDIENTE",
        // emailVerificado=false y llamar a generarYEnviarCodigo(usuario).
        usuario.setEstado("ACTIVO");
        usuario.setEmailVerificado(true);

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
        Usuario usuario = usuarioRepository.findByEmail(normalizarEmail(email))
                .orElseThrow(() -> new RuntimeException("Email o contraseña incorrectos"));

        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            throw new RuntimeException("Email o contraseña incorrectos");
        }

        // El mensaje es distinto a propósito: acá la contraseña ya se
        // validó, así que no se le está confirmando a un desconocido
        // que la cuenta existe.
        if (!estaVerificado(usuario)) {
            throw new EmailNoVerificadoException(
                    "Falta verificar tu email. Te mandamos un código a " + usuario.getEmail() + ".");
        }

        return jwtService.generarToken(usuario.getEmail());
    }

    // ------------------------------------------------------------------
    // Verificación de email
    // ------------------------------------------------------------------

    // Las cuentas anteriores a esta función tienen el campo en null: se
    // consideran verificadas para no dejar afuera a quien ya venía
    // usando el sistema.
    private boolean estaVerificado(Usuario usuario) {
        return !Boolean.FALSE.equals(usuario.getEmailVerificado());
    }

    public void verificarEmail(String email, String codigo) {
        Usuario usuario = usuarioRepository.findByEmail(normalizarEmail(email))
                .orElseThrow(() -> new RuntimeException("No hay ninguna cuenta con ese email"));

        if (estaVerificado(usuario)) {
            throw new RuntimeException("Esta cuenta ya está verificada. Ya podés ingresar.");
        }
        if (usuario.getCodigoVerificacion() == null || usuario.getCodigoExpiraEn() == null) {
            throw new RuntimeException("No hay un código pendiente. Pedí uno nuevo.");
        }
        if (LocalDateTime.now().isAfter(usuario.getCodigoExpiraEn())) {
            throw new RuntimeException("El código venció. Pedí uno nuevo.");
        }
        // Comparación en tiempo constante: con códigos de 6 dígitos que
        // además vencen, medir tiempos no alcanza para adivinarlos, pero
        // no cuesta nada hacerlo bien.
        if (!MessageDigest.isEqual(
                usuario.getCodigoVerificacion().getBytes(StandardCharsets.UTF_8),
                codigo.trim().getBytes(StandardCharsets.UTF_8))) {
            throw new RuntimeException("El código no es correcto");
        }

        usuario.setEmailVerificado(true);
        usuario.setEstado("ACTIVO");
        usuario.setCodigoVerificacion(null);
        usuario.setCodigoExpiraEn(null);
        usuarioRepository.save(usuario);
    }

    public void reenviarCodigo(String email) {
        Usuario usuario = usuarioRepository.findByEmail(normalizarEmail(email))
                .orElseThrow(() -> new RuntimeException("No hay ninguna cuenta con ese email"));

        if (estaVerificado(usuario)) {
            throw new RuntimeException("Esta cuenta ya está verificada. Ya podés ingresar.");
        }
        if (usuario.getCodigoEnviadoEn() != null
                && usuario.getCodigoEnviadoEn().isAfter(
                        LocalDateTime.now().minusSeconds(ESPERA_REENVIO_SEGUNDOS))) {
            throw new RuntimeException("Esperá un minuto antes de pedir otro código");
        }

        generarYEnviarCodigo(usuario);
        usuarioRepository.save(usuario);
    }

    private void generarYEnviarCodigo(Usuario usuario) {
        // 6 dígitos con ceros a la izquierda, sorteados con el generador
        // criptográfico (no con Math.random, que es predecible).
        String codigo = String.format("%06d", SORTEADOR.nextInt(1_000_000));

        usuario.setCodigoVerificacion(codigo);
        usuario.setCodigoExpiraEn(LocalDateTime.now().plusMinutes(MINUTOS_VIGENCIA_CODIGO));
        usuario.setCodigoEnviadoEn(LocalDateTime.now());

        String nombre = usuario.getBombero() != null ? usuario.getBombero().getNombre() : "";
        emailService.enviarCodigoVerificacion(usuario.getEmail(), codigo, nombre);
    }

    // Los emails se guardan en minúsculas y sin espacios: si no,
    // "Juan@X.com" y "juan@x.com" crean dos cuentas distintas.
    private String normalizarEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
