package com.bomberos.saas_bomberos.controller;

import com.bomberos.saas_bomberos.entity.Bombero;
import com.bomberos.saas_bomberos.service.BomberoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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

    @PostMapping
    public ResponseEntity<Bombero> crear(@Valid @RequestBody Bombero bombero) {
        Bombero nuevo = bomberoService.guardar(bombero);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bombero> actualizar(@PathVariable Long id, @Valid @RequestBody Bombero bombero) {
        return ResponseEntity.ok(bomberoService.actualizar(id, bombero));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        bomberoService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}