package com.bomberos.saas_bomberos.controller;

import com.bomberos.saas_bomberos.dto.ChecklistRegistroRequest;
import com.bomberos.saas_bomberos.dto.ChecklistRegistroResponse;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.service.ChecklistRegistroService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checklists/registros")
@RequiredArgsConstructor
public class ChecklistRegistroController {

    private final ChecklistRegistroService registroService;

    // Filtros opcionales: ?estado=PENDIENTE_FIRMA|FIRMADO&movilidadId=3
    @GetMapping
    public ResponseEntity<List<ChecklistRegistroResponse>> obtenerTodos(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Long movilidadId
    ) {
        return ResponseEntity.ok(registroService.obtenerTodos(estado, movilidadId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChecklistRegistroResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(registroService.obtenerPorId(id));
    }

    // Cualquier usuario autenticado puede completar un checklist; queda
    // en estado PENDIENTE_FIRMA hasta que el encargado lo firme.
    @PostMapping
    public ResponseEntity<ChecklistRegistroResponse> crear(
            @RequestBody ChecklistRegistroRequest request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(registroService.crear(request, usuario));
    }

    @PostMapping("/{id}/firmar")
    public ResponseEntity<ChecklistRegistroResponse> firmar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(registroService.firmar(id, usuario));
    }
}
