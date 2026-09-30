package com.bomberos.saas_bomberos.controller;

import com.bomberos.saas_bomberos.dto.TareaAreaRequest;
import com.bomberos.saas_bomberos.dto.TareaAreaResponse;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.service.TareaAreaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// Las tareas siempre cuelgan de un área (por eso alta y listado van
// anidados bajo /api/areas-trabajo/{areaId}/tareas); eliminar y
// completar identifican la tarea directamente.
@RestController
@RequiredArgsConstructor
public class TareaAreaController {

    private final TareaAreaService tareaAreaService;

    @GetMapping("/api/areas-trabajo/{areaId}/tareas")
    public ResponseEntity<List<TareaAreaResponse>> obtenerPorArea(@PathVariable Long areaId) {
        return ResponseEntity.ok(tareaAreaService.obtenerPorArea(areaId));
    }

    // Requiere ser el encargado del área o administrador.
    @PostMapping("/api/areas-trabajo/{areaId}/tareas")
    public ResponseEntity<TareaAreaResponse> crear(
            @PathVariable Long areaId,
            @RequestBody TareaAreaRequest request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        TareaAreaResponse nueva = tareaAreaService.crear(areaId, request, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    }

    // Solo si está pendiente; una vez realizada queda en el historial.
    @DeleteMapping("/api/tareas-area/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        tareaAreaService.eliminar(id, usuario);
        return ResponseEntity.noContent().build();
    }

    // La puede completar el encargado del área, un administrador, o
    // cualquier integrante al que se le haya asignado la tarea.
    @PatchMapping("/api/tareas-area/{id}/completar")
    public ResponseEntity<TareaAreaResponse> marcarRealizada(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(tareaAreaService.marcarRealizada(id, usuario));
    }
}
