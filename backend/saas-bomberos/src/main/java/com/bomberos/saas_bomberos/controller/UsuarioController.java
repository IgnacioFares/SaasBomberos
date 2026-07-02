package com.bomberos.saas_bomberos.controller;

import com.bomberos.saas_bomberos.entity.Bombero;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}