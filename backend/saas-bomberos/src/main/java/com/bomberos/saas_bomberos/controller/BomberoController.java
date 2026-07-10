package com.bomberos.saas_bomberos.controller;

import com.bomberos.saas_bomberos.entity.Bombero;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.service.BomberoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bomberos")
@RequiredArgsConstructor
public class BomberoController {

    private final BomberoService bomberoService;

    @GetMapping
    public ResponseEntity<List<Bombero>> obtenerTodos() {
        return ResponseEntity.ok(bomberoService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bombero> obtenerPorId(@PathVariable Long id) {
        return bomberoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Requieren el permiso "gestionar_personal" (ver AutorizacionService).
    @PostMapping
    public ResponseEntity<Bombero> crear(
            @Valid @RequestBody Bombero bombero,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Bombero nuevo = bomberoService.guardar(bombero, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bombero> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Bombero bombero,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(bomberoService.actualizar(id, bombero, usuario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        bomberoService.desactivar(id, usuario);
        return ResponseEntity.noContent().build();
    }

    // Traduce los RuntimeException de negocio del Service (DNI
    // duplicado, bombero no encontrado) a un 400 con el mensaje real.
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> manejarErrorDeNegocio(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("mensaje", ex.getMessage()));
    }
}
