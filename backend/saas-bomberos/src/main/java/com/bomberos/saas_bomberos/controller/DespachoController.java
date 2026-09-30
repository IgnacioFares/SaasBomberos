package com.bomberos.saas_bomberos.controller;

import com.bomberos.saas_bomberos.dto.DespachoRequest;
import com.bomberos.saas_bomberos.dto.DespachoResponse;
import com.bomberos.saas_bomberos.dto.OrigenSugeridoResponse;
import com.bomberos.saas_bomberos.dto.PosicionRequest;
import com.bomberos.saas_bomberos.dto.SeguimientoResponse;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.service.DespachoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/despachos")
@RequiredArgsConstructor
public class DespachoController {

    private final DespachoService despachoService;

    // ?enCurso=true para el tablero de salidas activas.
    @GetMapping
    public ResponseEntity<List<DespachoResponse>> obtenerTodos(
            @RequestParam(defaultValue = "false") boolean enCurso
    ) {
        return ResponseEntity.ok(despachoService.obtenerTodos(enCurso));
    }

    // Desde dónde puede salir una movilidad: el cuartel o el destino de
    // su salida anterior, si no volvió.
    @GetMapping("/origen-sugerido/{movilidadId}")
    public ResponseEntity<OrigenSugeridoResponse> origenSugerido(@PathVariable Long movilidadId) {
        return ResponseEntity.ok(despachoService.origenSugerido(movilidadId));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<DespachoResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(despachoService.obtenerPorId(id));
    }

    // Lo que consulta el mapa cada pocos segundos.
    @GetMapping("/{id:\\d+}/seguimiento")
    public ResponseEntity<SeguimientoResponse> seguimiento(@PathVariable Long id) {
        return ResponseEntity.ok(despachoService.seguimiento(id));
    }

    @PostMapping
    public ResponseEntity<DespachoResponse> crear(
            @Valid @RequestBody DespachoRequest request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(despachoService.crear(request, usuario));
    }

    // Lo llama el celular del personal mientras está en la calle.
    @PostMapping("/{id:\\d+}/ubicacion")
    public ResponseEntity<Void> registrarUbicacion(
            @PathVariable Long id,
            @Valid @RequestBody PosicionRequest request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        despachoService.registrarPosicion(id, request, usuario);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id:\\d+}/finalizar")
    public ResponseEntity<DespachoResponse> finalizar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(despachoService.finalizar(id, usuario));
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        despachoService.eliminar(id, usuario);
        return ResponseEntity.noContent().build();
    }
}
