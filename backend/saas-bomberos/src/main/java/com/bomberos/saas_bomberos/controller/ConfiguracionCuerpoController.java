package com.bomberos.saas_bomberos.controller;

import com.bomberos.saas_bomberos.dto.ConfiguracionCuerpoRequest;
import com.bomberos.saas_bomberos.dto.ConfiguracionCuerpoResponse;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.service.ConfiguracionCuerpoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/configuracion")
@RequiredArgsConstructor
public class ConfiguracionCuerpoController {

    private final ConfiguracionCuerpoService service;

    @GetMapping
    public ResponseEntity<ConfiguracionCuerpoResponse> obtener() {
        return ResponseEntity.ok(service.obtener());
    }

    // Requiere ser administrador (ver AutorizacionService.exigirAdministrador).
    @PutMapping
    public ResponseEntity<ConfiguracionCuerpoResponse> actualizar(
            @RequestBody ConfiguracionCuerpoRequest request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(service.actualizar(request, usuario));
    }
}
