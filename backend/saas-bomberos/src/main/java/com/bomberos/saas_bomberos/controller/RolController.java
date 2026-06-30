package com.bomberos.saas_bomberos.controller;

import com.bomberos.saas_bomberos.entity.Rol;
import com.bomberos.saas_bomberos.service.RolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RolController {

    private final RolService rolService;

    @GetMapping
    public ResponseEntity<List<Rol>> obtenerTodos() {
        return ResponseEntity.ok(rolService.obtenerTodos());
    }

    @PostMapping
    public ResponseEntity<Rol> crear(@Valid @RequestBody Rol rol) {
        Rol nuevo = rolService.guardar(rol);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @PutMapping("/{id}/permisos")
    public ResponseEntity<Rol> asignarPermisos(@PathVariable Long id, @RequestBody List<Long> permisoIds) {
        return ResponseEntity.ok(rolService.asignarPermisos(id, permisoIds));
    }
}