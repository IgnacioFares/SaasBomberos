package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.dto.ChecklistTemplateRequest;
import com.bomberos.saas_bomberos.dto.ChecklistTemplateResponse;
import com.bomberos.saas_bomberos.entity.ChecklistItem;
import com.bomberos.saas_bomberos.entity.ChecklistSeccion;
import com.bomberos.saas_bomberos.entity.ChecklistTemplate;
import com.bomberos.saas_bomberos.entity.Movilidad;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.repository.ChecklistTemplateRepository;
import com.bomberos.saas_bomberos.repository.MovilidadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChecklistTemplateService {

    private final ChecklistTemplateRepository templateRepository;
    private final MovilidadRepository movilidadRepository;

    public ChecklistTemplateResponse crear(ChecklistTemplateRequest request, Usuario usuario) {
        exigirPermiso(usuario, "crear");

        ChecklistTemplate template = new ChecklistTemplate();
        template.setCreadoPor(usuario);
        aplicarRequest(template, request);

        return mapear(templateRepository.save(template));
    }

    public ChecklistTemplateResponse actualizar(Long id, ChecklistTemplateRequest request, Usuario usuario) {
        exigirPermiso(usuario, "editar");

        ChecklistTemplate template = obtenerEntidad(id);
        // Reemplazar secciones/items es seguro: los registros históricos
        // guardan snapshots (nombre y cantidades) y no referencian por FK.
        aplicarRequest(template, request);

        return mapear(templateRepository.save(template));
    }

    public List<ChecklistTemplateResponse> obtenerTodos() {
        return templateRepository.findByActivoTrue().stream().map(this::mapear).toList();
    }

    public ChecklistTemplateResponse obtenerPorId(Long id) {
        return mapear(obtenerEntidad(id));
    }

    public void eliminar(Long id, Usuario usuario) {
        exigirPermiso(usuario, "eliminar");
        ChecklistTemplate template = obtenerEntidad(id);
        template.setActivo(false);
        templateRepository.save(template);
    }

    private void aplicarRequest(ChecklistTemplate template, ChecklistTemplateRequest request) {
        if (request.nombre() == null || request.nombre().isBlank()) {
            throw new RuntimeException("El nombre del checklist es obligatorio");
        }
        if (request.movilidadId() == null) {
            throw new RuntimeException("Tenés que elegir una movilidad");
        }
        if (request.secciones() == null || request.secciones().isEmpty()) {
            throw new RuntimeException("El checklist necesita al menos una sección");
        }

        Movilidad movilidad = movilidadRepository.findById(request.movilidadId())
                .orElseThrow(() -> new RuntimeException("Movilidad no encontrada"));

        template.setNombre(request.nombre());
        template.setMovilidad(movilidad);

        List<ChecklistSeccion> secciones = new ArrayList<>();
        int ordenSeccion = 0;
        for (ChecklistTemplateRequest.SeccionRequest seccionReq : request.secciones()) {
            if (seccionReq.nombre() == null || seccionReq.nombre().isBlank()) {
                throw new RuntimeException("Todas las secciones necesitan un nombre");
            }
            if (seccionReq.items() == null || seccionReq.items().isEmpty()) {
                throw new RuntimeException("La sección \"" + seccionReq.nombre() + "\" necesita al menos un ítem");
            }

            ChecklistSeccion seccion = new ChecklistSeccion();
            seccion.setNombre(seccionReq.nombre());
            seccion.setOrden(ordenSeccion++);

            int ordenItem = 0;
            for (ChecklistTemplateRequest.ItemRequest itemReq : seccionReq.items()) {
                seccion.getItems().add(construirItem(itemReq, ordenItem++));
            }
            secciones.add(seccion);
        }

        // clear + addAll (y no un setSecciones con lista nueva) para que
        // orphanRemoval borre las secciones/items viejos al editar.
        template.getSecciones().clear();
        template.getSecciones().addAll(secciones);
    }

    private ChecklistItem construirItem(ChecklistTemplateRequest.ItemRequest itemReq, int orden) {
        if (itemReq.nombre() == null || itemReq.nombre().isBlank()) {
            throw new RuntimeException("Todos los ítems necesitan un nombre");
        }

        boolean requiereCantidad = Boolean.TRUE.equals(itemReq.requiereCantidad());
        if (requiereCantidad && (itemReq.cantidadEsperada() == null || itemReq.cantidadEsperada() < 0)) {
            throw new RuntimeException(
                    "El ítem \"" + itemReq.nombre() + "\" requiere una cantidad esperada válida");
        }

        ChecklistItem item = new ChecklistItem();
        item.setNombre(itemReq.nombre());
        item.setDescripcion(itemReq.descripcion());
        item.setRequiereCantidad(requiereCantidad);
        item.setCantidadEsperada(requiereCantidad ? itemReq.cantidadEsperada() : null);
        item.setObligatorio(itemReq.obligatorio() == null || itemReq.obligatorio());
        item.setOrden(orden);
        return item;
    }

    private ChecklistTemplate obtenerEntidad(Long id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Checklist no encontrado"));
    }

    // Punto único de autorización del módulo. Por decisión del cuartel,
    // por ahora cualquier usuario autenticado puede gestionar plantillas;
    // cuando se definan roles/permisos definitivos, la restricción se
    // reactiva acá sin tocar el resto del servicio.
    @SuppressWarnings("unused")
    private void exigirPermiso(Usuario usuario, String accion) {
        // Sin restricciones por ahora.
    }

    private ChecklistTemplateResponse mapear(ChecklistTemplate t) {
        List<ChecklistTemplateResponse.SeccionResponse> secciones = t.getSecciones().stream()
                .map(s -> new ChecklistTemplateResponse.SeccionResponse(
                        s.getId(),
                        s.getNombre(),
                        s.getOrden(),
                        s.getItems().stream()
                                .map(i -> new ChecklistTemplateResponse.ItemResponse(
                                        i.getId(),
                                        i.getNombre(),
                                        i.getDescripcion(),
                                        i.getRequiereCantidad(),
                                        i.getCantidadEsperada(),
                                        i.getObligatorio(),
                                        i.getOrden()))
                                .toList()
                ))
                .toList();

        int totalItems = t.getSecciones().stream().mapToInt(s -> s.getItems().size()).sum();

        return new ChecklistTemplateResponse(
                t.getId(),
                t.getNombre(),
                t.getMovilidad().getId(),
                t.getMovilidad().getNombre(),
                t.getCreadoPor().getBombero().getNombre() + " " + t.getCreadoPor().getBombero().getApellido(),
                t.getCreatedAt(),
                totalItems,
                secciones
        );
    }
}
