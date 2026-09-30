package com.bomberos.saas_bomberos.controller;

import com.bomberos.saas_bomberos.dto.ChecklistTemplateRequest;
import com.bomberos.saas_bomberos.dto.ChecklistTemplateResponse;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.service.ChecklistTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checklists/templates")
@RequiredArgsConstructor
public class ChecklistTemplateController {

    private final ChecklistTemplateService templateService;

    @GetMapping
    public ResponseEntity<List<ChecklistTemplateResponse>> obtenerTodos() {
        return ResponseEntity.ok(templateService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChecklistTemplateResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(templateService.obtenerPorId(id));
    }

    // La autorización vive en el Service (exigirPermiso): hoy cualquier
    // usuario autenticado puede gestionar plantillas.
    @PostMapping
    public ResponseEntity<ChecklistTemplateResponse> crear(
            @RequestBody ChecklistTemplateRequest request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(templateService.crear(request, usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChecklistTemplateResponse> actualizar(
            @PathVariable Long id,
            @RequestBody ChecklistTemplateRequest request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(templateService.actualizar(id, request, usuario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        templateService.eliminar(id, usuario);
        return ResponseEntity.noContent().build();
    }
}
