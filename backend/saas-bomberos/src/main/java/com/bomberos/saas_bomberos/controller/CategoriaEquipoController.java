package com.bomberos.saas_bomberos.controller;

import com.bomberos.saas_bomberos.dto.CategoriaEquipoDto;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.service.CategoriaEquipoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario/categorias")
@RequiredArgsConstructor
public class CategoriaEquipoController {

    private final CategoriaEquipoService categoriaService;

    @GetMapping
    public ResponseEntity<List<CategoriaEquipoDto.Response>> obtenerTodas() {
        return ResponseEntity.ok(categoriaService.obtenerTodas());
    }

    @PostMapping
    public ResponseEntity<CategoriaEquipoDto.Response> crear(
            @RequestBody CategoriaEquipoDto.Request request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoriaService.crear(request, usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaEquipoDto.Response> actualizar(
            @PathVariable Long id,
            @RequestBody CategoriaEquipoDto.Request request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(categoriaService.actualizar(id, request, usuario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        categoriaService.eliminar(id, usuario);
        return ResponseEntity.noContent().build();
    }
}
