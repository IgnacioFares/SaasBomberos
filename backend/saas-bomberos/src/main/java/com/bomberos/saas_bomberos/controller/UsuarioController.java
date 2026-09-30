package com.bomberos.saas_bomberos.controller;

import com.bomberos.saas_bomberos.config.PermisosCatalogo;
import com.bomberos.saas_bomberos.dto.UsuarioAdminDto;
import com.bomberos.saas_bomberos.entity.Bombero;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.service.AutorizacionService;
import com.bomberos.saas_bomberos.service.PoliticaPassword;
import com.bomberos.saas_bomberos.service.UsuarioService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
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
    //
    // La cuenta queda activa al instante y se devuelve el token para que
    // el frontend entre directo, sin pasar por el login.
    @PostMapping("/registro")
    public ResponseEntity<LoginResponse> registrar(@Valid @RequestBody RegistroRequest request) {
        // @RequestBody: convierte el JSON que llega en el body de la
        //   petición en un objeto Java del tipo RegistroRequest.
        // @Valid: activa las validaciones (@NotBlank, @Email, etc.)
        //   antes de seguir ejecutando el método.

        // Le pasamos al Service los tres datos que necesita para crear
        // el Usuario y el Bombero juntos.
        usuarioService.registrar(
                request.getEmail(),
                request.getPassword(),
                request.getBombero()
        );

        String token = usuarioService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.status(HttpStatus.CREATED).body(new LoginResponse(token));
    }

    // Confirma el código que llegó por mail y habilita la cuenta.
    @PostMapping("/verificar-email")
    public ResponseEntity<Void> verificarEmail(@Valid @RequestBody VerificacionRequest request) {
        usuarioService.verificarEmail(request.getEmail(), request.getCodigo());
        return ResponseEntity.noContent().build();
    }

    // Manda otro código, para cuando el primero venció o no llegó.
    @PostMapping("/reenviar-codigo")
    public ResponseEntity<Void> reenviarCodigo(@Valid @RequestBody ReenvioRequest request) {
        usuarioService.reenviarCodigo(request.getEmail());
        return ResponseEntity.noContent().build();
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
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email no tiene un formato válido")
        private String email;

        // El largo mínimo y el resto de las reglas se validan en
        // PoliticaPassword, que es donde vive la política completa y
        // puede mirar también el nombre y el email de la persona.
        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = PoliticaPassword.LARGO_MINIMO,
                message = "La contraseña debe tener al menos 10 caracteres")
        private String password;

        @NotNull(message = "Faltan los datos del bombero")
        @Valid
        private Bombero bombero;
    }

    // { "email": "...", "codigo": "123456" }
    @Data
    static class VerificacionRequest {
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email no tiene un formato válido")
        private String email;

        @NotBlank(message = "Escribí el código que te llegó por mail")
        private String codigo;
    }

    // { "email": "..." }
    @Data
    static class ReenvioRequest {
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email no tiene un formato válido")
        private String email;
    }

    // Forma del JSON que el frontend manda al loguearse:
    // { "email": "...", "password": "..." }
    @Data
    static class LoginRequest {
        @NotBlank(message = "El email es obligatorio")
        private String email;

        @NotBlank(message = "La contraseña es obligatoria")
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
