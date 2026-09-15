package com.bomberos.saas_bomberos.controller;

import com.bomberos.saas_bomberos.dto.AreaTrabajoRequest;
import com.bomberos.saas_bomberos.dto.AreaTrabajoResponse;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.service.AreaTrabajoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/areas-trabajo")
@RequiredArgsConstructor
public class AreaTrabajoController {

    private final AreaTrabajoService areaTrabajoService;

    @GetMapping
    public ResponseEntity<List<AreaTrabajoResponse>> obtenerTodas() {
        return ResponseEntity.ok(areaTrabajoService.obtenerTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AreaTrabajoResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(areaTrabajoService.obtenerPorId(id));
    }

    // Requiere el permiso "gestionar_areas_trabajo" (ver AutorizacionService).
    @PostMapping
    public ResponseEntity<AreaTrabajoResponse> crear(
            @RequestBody AreaTrabajoRequest request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        AreaTrabajoResponse nueva = areaTrabajoService.crear(request, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AreaTrabajoResponse> actualizar(
            @PathVariable Long id,
            @RequestBody AreaTrabajoRequest request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(areaTrabajoService.actualizar(id, request, usuario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        areaTrabajoService.desactivar(id, usuario);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> manejarErrorDeNegocio(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("mensaje", ex.getMessage()));
    }
}
