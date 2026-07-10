package com.bomberos.saas_bomberos.controller;

import com.bomberos.saas_bomberos.config.PermisosCatalogo;
import com.bomberos.saas_bomberos.dto.UsuarioAdminDto;
import com.bomberos.saas_bomberos.entity.Bombero;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.service.AutorizacionService;
import com.bomberos.saas_bomberos.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
    private final AutorizacionService autorizacion;

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
                usuario.getEstado(),
                autorizacion.permisosEfectivos(usuario)
        ));
    }

    // ---------------------------------------------------------
    // Panel de administración (solo rol Administrador; la
    // verificación vive en UsuarioService / AutorizacionService).
    // ---------------------------------------------------------

    // Todas las personas registradas en el sistema, con su rol y
    // permisos extra, para el panel de administración.
    @GetMapping
    public ResponseEntity<List<UsuarioAdminDto.Response>> obtenerTodos(
            @AuthenticationPrincipal Usuario solicitante
    ) {
        return ResponseEntity.ok(usuarioService.obtenerTodosParaAdmin(solicitante));
    }

    // Catálogo de permisos que el administrador puede otorgar.
    @GetMapping("/permisos-disponibles")
    public ResponseEntity<List<UsuarioAdminDto.PermisoInfo>> permisosDisponibles() {
        return ResponseEntity.ok(PermisosCatalogo.CATALOGO.stream()
                .map(p -> new UsuarioAdminDto.PermisoInfo(p.nombre(), p.etiqueta(), p.descripcion()))
                .toList());
    }

    @GetMapping("/roles")
    public ResponseEntity<List<UsuarioAdminDto.RolInfo>> roles(@AuthenticationPrincipal Usuario solicitante) {
        return ResponseEntity.ok(usuarioService.obtenerRoles(solicitante));
    }

    // Reemplaza los permisos extra de un usuario.
    @PutMapping("/{id}/permisos")
    public ResponseEntity<UsuarioAdminDto.Response> asignarPermisos(
            @PathVariable Long id,
            @RequestBody UsuarioAdminDto.AsignarPermisosRequest request,
            @AuthenticationPrincipal Usuario solicitante
    ) {
        return ResponseEntity.ok(usuarioService.asignarPermisos(id, request.permisos(), solicitante));
    }

    // Reasigna el rol de un usuario (solo administradores; nadie puede
    // cambiar su propio rol para no dejar al sistema sin admin).
    @PutMapping("/{id}/rol")
    public ResponseEntity<UsuarioActualResponse> asignarRol(
            @PathVariable Long id,
            @RequestBody AsignarRolRequest request,
            @AuthenticationPrincipal Usuario solicitante
    ) {
        Usuario usuario = usuarioService.asignarRol(id, request.getRolId(), solicitante);
        return ResponseEntity.ok(new UsuarioActualResponse(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getBombero(),
                usuario.getRol().getNombre(),
                usuario.getEstado(),
                autorizacion.permisosEfectivos(usuario)
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
    // usuario logueado junto con su bombero, el nombre de su rol y sus
    // permisos efectivos (rol + extras; el admin tiene todos).
    @Data
    static class UsuarioActualResponse {
        private final Long id;
        private final String email;
        private final Bombero bombero;
        private final String rol;
        private final String estado;
        private final Set<String> permisos;
    }

    // Forma del JSON que el frontend manda para reasignar un rol:
    // { "rolId": 2 }
    @Data
    static class AsignarRolRequest {
        private Long rolId;
    }
}
