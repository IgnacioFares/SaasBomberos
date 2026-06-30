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

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping("/registro")
    public ResponseEntity<Usuario> registrar(@Valid @RequestBody RegistroRequest request) {
        Usuario usuario = usuarioService.registrar(
                request.getEmail(),
                request.getPassword(),
                request.getBombero()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        String token = usuarioService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(new LoginResponse(token));
    }

    @Data
    static class RegistroRequest {
        private String email;
        private String password;
        private Bombero bombero;
    }

    @Data
    static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    static class LoginResponse {
        private final String token;
    }
}