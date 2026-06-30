package com.bomberos.saas_bomberos.controller;

import com.bomberos.saas_bomberos.entity.Permiso;
import com.bomberos.saas_bomberos.service.PermisoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/permisos")
@RequiredArgsConstructor
public class PermisoController {

    private final PermisoService permisoService;

    @GetMapping
    public ResponseEntity<List<Permiso>> obtenerTodos() {
        return ResponseEntity.ok(permisoService.obtenerTodos());
    }

    @PostMapping
    public ResponseEntity<Permiso> crear(@Valid @RequestBody Permiso permiso) {
        Permiso nuevo = permisoService.guardar(permiso);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }
}