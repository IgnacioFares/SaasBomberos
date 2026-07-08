package com.bomberos.saas_bomberos.controller;

import com.bomberos.saas_bomberos.entity.Bombero;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

// Le dice a Spring: "esta clase es un controlador REST, recibe peticiones
// HTTP y devuelve respuestas en formato JSON automáticamente".
@RestController

// Define la ruta base para TODOS los endpoints de esta clase.
// Cualquier método de acá abajo va a empezar con /api/usuarios.
@RequestMapping("/api/usuarios")

// Lombok genera automáticamente el constructor que recibe los campos
// "final" de la clase (en este caso, usuarioService) para que Spring
// se lo inyecte solo, sin que lo escribamos a mano.
@RequiredArgsConstructor
public class UsuarioController {

    // El Service que contiene toda la lógica de negocio (registrar,
    // hacer login, etc.). El Controller nunca hace la lógica él mismo,
    // solo la delega acá.
    private final UsuarioService usuarioService;

    // Escucha peticiones POST a /api/usuarios/registro
    @PostMapping("/registro")
    public ResponseEntity<Usuario> registrar(@Valid @RequestBody RegistroRequest request) {
        // @RequestBody: convierte el JSON que llega en el body de la
        //   petición en un objeto Java del tipo RegistroRequest.
        // @Valid: activa las validaciones (@NotBlank, @Email, etc.)
        //   antes de seguir ejecutando el método.

        // Le pasamos al Service los tres datos que necesita para crear
        // el Usuario y el Bombero juntos.
        Usuario usuario = usuarioService.registrar(
                request.getEmail(),
                request.getPassword(),
                request.getBombero()
        );

        // Devolvemos código 201 CREATED (se creó un recurso nuevo)
        // junto con el usuario recién creado en el body de la respuesta.
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    // Escucha peticiones POST a /api/usuarios/login
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        // Le pedimos al Service que verifique el email y la contraseña.
        // Si son correctos, el Service nos devuelve un token JWT (String).
        // Si son incorrectos, el Service lanza una excepción antes de
        // llegar a esta línea.
        String token = usuarioService.login(request.getEmail(), request.getPassword());

        // Envolvemos el token dentro de un objeto LoginResponse y lo
        // devolvemos con código 200 OK.
        return ResponseEntity.ok(new LoginResponse(token));
    }

    // Escucha peticiones GET a /api/usuarios/me
    // Devuelve los datos del usuario autenticado (a partir del JWT
    // enviado en el header Authorization). El JwtAuthenticationFilter
    // ya se encarga de resolver el Usuario y dejarlo como principal.
    //
    // Se arma un DTO en lugar de devolver la entidad Usuario tal cual:
    // el filtro JWT resuelve el usuario fuera del ciclo de vida normal
    // de la request, así que las colecciones @ManyToMany (lazy) como
    // Rol.permisos o Usuario.permisosExtra ya no tienen sesión de
    // Hibernate disponible para inicializarse al serializar.
    @GetMapping("/me")
    public ResponseEntity<UsuarioActualResponse> me(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(new UsuarioActualResponse(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getBombero(),
                usuario.getRol().getNombre(),
                usuario.getEstado()
        ));
    }

    // Escucha peticiones PUT a /api/usuarios/{id}/rol
    // Reasigna el rol de un usuario existente. Por ahora no está
    // restringido a administradores (todavía no hay autorización por
    // rol/permiso en SecurityConfig, solo autenticación), así que
    // cualquier usuario logueado puede usarlo.
    @PutMapping("/{id}/rol")
    public ResponseEntity<UsuarioActualResponse> asignarRol(
            @PathVariable Long id,
            @RequestBody AsignarRolRequest request
    ) {
        Usuario usuario = usuarioService.asignarRol(id, request.getRolId());
        return ResponseEntity.ok(new UsuarioActualResponse(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getBombero(),
                usuario.getRol().getNombre(),
                usuario.getEstado()
        ));
    }

    // Traduce los RuntimeException de negocio del Service (email/DNI
    // duplicado, credenciales incorrectas, etc.) a una respuesta 400
    // con el mensaje real, en lugar del 500 genérico que devolvía
    // Spring por defecto (que además no expone el mensaje al cliente).
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> manejarErrorDeNegocio(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("mensaje", ex.getMessage()));
    }

    // ---------------------------------------------------------
    // Clases DTO (Data Transfer Object): representan la FORMA
    // del JSON que entra o sale por la API. No son entidades de
    // la base de datos, solo existen para este Controller.
    // Van "static" porque viven adentro de UsuarioController y
    // no se usan en ningún otro lugar del proyecto.
    // ---------------------------------------------------------

    // Forma del JSON que el frontend manda al registrarse:
    // { "email": "...", "password": "...", "bombero": { ... } }
    @Data
    static class RegistroRequest {
        private String email;
        private String password;
        private Bombero bombero;
    }

    // Forma del JSON que el frontend manda al loguearse:
    // { "email": "...", "password": "..." }
    @Data
    static class LoginRequest {
        private String email;
        private String password;
    }

    // Forma del JSON que el backend devuelve después de un login
    // exitoso: { "token": "eyJhbGc..." }
    // "final" porque el token se asigna una sola vez, al crear el
    // objeto, y nunca cambia después.
    @Data
    static class LoginResponse {
        private final String token;
    }

    // Forma del JSON que devuelve /api/usuarios/me: los datos del
    // usuario logueado junto con su bombero y el nombre de su rol.
    @Data
    static class UsuarioActualResponse {
        private final Long id;
        private final String email;
        private final Bombero bombero;
        private final String rol;
        private final String estado;
    }

    // Forma del JSON que el frontend manda para reasignar un rol:
    // { "rolId": 2 }
    @Data
    static class AsignarRolRequest {
        private Long rolId;
    }
}
