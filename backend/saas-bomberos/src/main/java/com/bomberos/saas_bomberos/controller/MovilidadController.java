package com.bomberos.saas_bomberos.controller;

import com.bomberos.saas_bomberos.entity.Movilidad;
import com.bomberos.saas_bomberos.service.MovilidadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/movilidades")
@RequiredArgsConstructor
public class MovilidadController {

    private final MovilidadService movilidadService;

    @GetMapping
    public ResponseEntity<List<Movilidad>> obtenerTodas() {
        return ResponseEntity.ok(movilidadService.obtenerTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movilidad> obtenerPorId(@PathVariable Long id) {
        return movilidadService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Movilidad> crear(@Valid @RequestBody Movilidad movilidad) {
        Movilidad nueva = movilidadService.guardar(movilidad);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Movilidad> actualizar(@PathVariable Long id, @Valid @RequestBody Movilidad movilidad) {
        return ResponseEntity.ok(movilidadService.actualizar(id, movilidad));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        movilidadService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}