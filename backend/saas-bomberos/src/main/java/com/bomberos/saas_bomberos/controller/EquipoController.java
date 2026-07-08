package com.bomberos.saas_bomberos.controller;

import com.bomberos.saas_bomberos.dto.EquipoAccionDto;
import com.bomberos.saas_bomberos.dto.EquipoMovimientoResponse;
import com.bomberos.saas_bomberos.dto.EquipoRequest;
import com.bomberos.saas_bomberos.dto.EquipoResponse;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.service.EquipoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventario/equipos")
@RequiredArgsConstructor
public class EquipoController {

    private final EquipoService equipoService;

    @GetMapping
    public ResponseEntity<List<EquipoResponse>> obtenerTodos() {
        return ResponseEntity.ok(equipoService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipoResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(equipoService.obtenerPorId(id));
    }

    @GetMapping("/{id}/movimientos")
    public ResponseEntity<List<EquipoMovimientoResponse>> obtenerMovimientos(@PathVariable Long id) {
        return ResponseEntity.ok(equipoService.obtenerMovimientos(id));
    }

    @PostMapping
    public ResponseEntity<EquipoResponse> crear(
            @RequestBody EquipoRequest request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(equipoService.crear(request, usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipoResponse> actualizar(
            @PathVariable Long id,
            @RequestBody EquipoRequest request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(equipoService.actualizar(id, request, usuario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        equipoService.eliminar(id, usuario);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/estado")
    public ResponseEntity<EquipoResponse> cambiarEstado(
            @PathVariable Long id,
            @RequestBody EquipoAccionDto.CambioEstadoRequest request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(equipoService.cambiarEstado(id, request, usuario));
    }

    @PostMapping("/{id}/ubicacion")
    public ResponseEntity<EquipoResponse> cambiarUbicacion(
            @PathVariable Long id,
            @RequestBody EquipoAccionDto.CambioUbicacionRequest request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(equipoService.cambiarUbicacion(id, request, usuario));
    }

    @PostMapping("/{id}/observaciones")
    public ResponseEntity<EquipoResponse> agregarObservacion(
            @PathVariable Long id,
            @RequestBody EquipoAccionDto.ObservacionRequest request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(equipoService.agregarObservacion(id, request, usuario));
    }

    @PutMapping("/{id}/unidades/{unidadId}")
    public ResponseEntity<EquipoResponse> actualizarUnidad(
            @PathVariable Long id,
            @PathVariable Long unidadId,
            @RequestBody EquipoAccionDto.UnidadUpdateRequest request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(equipoService.actualizarUnidad(id, unidadId, request, usuario));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> manejarErrorDeNegocio(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("mensaje", ex.getMessage()));
    }
}
