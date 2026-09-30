package com.bomberos.saas_bomberos.controller;

import com.bomberos.saas_bomberos.dto.ParteRequest;
import com.bomberos.saas_bomberos.dto.ParteResponse;
import com.bomberos.saas_bomberos.dto.ParteResumenResponse;
import com.bomberos.saas_bomberos.entity.Parte;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.service.ParteService;
import com.bomberos.saas_bomberos.service.PartePdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/partes")
@RequiredArgsConstructor
public class ParteController {

    private final ParteService parteService;
    private final PartePdfService partePdfService;

    @GetMapping
    public ResponseEntity<List<ParteResumenResponse>> obtenerTodos() {
        return ResponseEntity.ok(parteService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParteResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(parteService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<ParteResponse> crear(
            @RequestBody ParteRequest request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(parteService.crear(request, usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParteResponse> actualizar(
            @PathVariable Long id,
            @RequestBody ParteRequest request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(parteService.actualizar(id, request, usuario));
    }

    @PatchMapping("/{id}/finalizar")
    public ResponseEntity<ParteResponse> finalizar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(parteService.finalizar(id, usuario));
    }

    @PatchMapping("/{id}/reabrir")
    public ResponseEntity<ParteResponse> reabrir(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(parteService.reabrir(id, usuario));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> descargarPdf(@PathVariable Long id) {
        Parte parte = parteService.obtenerEntidad(id);
        byte[] pdf = partePdfService.generarPdf(parte);
        String nombreArchivo = partePdfService.nombreArchivo(parte);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                org.springframework.http.ContentDisposition.attachment()
                        .filename(nombreArchivo, StandardCharsets.UTF_8)
                        .build());
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}
