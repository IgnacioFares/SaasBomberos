package com.bomberos.saas_bomberos.controller;

import com.bomberos.saas_bomberos.dto.UbicacionEquipoDto;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.service.UbicacionEquipoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario/ubicaciones")
@RequiredArgsConstructor
public class UbicacionEquipoController {

    private final UbicacionEquipoService ubicacionService;

    @GetMapping
    public ResponseEntity<List<UbicacionEquipoDto.Response>> obtenerTodas() {
        return ResponseEntity.ok(ubicacionService.obtenerTodas());
    }

    @PostMapping
    public ResponseEntity<UbicacionEquipoDto.Response> crear(
            @RequestBody UbicacionEquipoDto.Request request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ubicacionService.crear(request, usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UbicacionEquipoDto.Response> actualizar(
            @PathVariable Long id,
            @RequestBody UbicacionEquipoDto.Request request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(ubicacionService.actualizar(id, request, usuario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        ubicacionService.eliminar(id, usuario);
        return ResponseEntity.noContent().build();
    }
}
