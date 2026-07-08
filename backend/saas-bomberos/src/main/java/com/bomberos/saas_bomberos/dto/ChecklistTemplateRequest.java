package com.bomberos.saas_bomberos.dto;

import java.util.List;

// Forma del JSON para crear o actualizar una plantilla de checklist:
// { "nombre": "Check del Móvil 2", "movilidadId": 3,
//   "secciones": [ { "nombre": "Dotación",
//                    "items": [ {"nombre": "Máscaras", "requiereCantidad": true,
//                                "cantidadEsperada": 4, "obligatorio": true,
//                                "descripcion": null}, ... ] }, ... ] }
public record ChecklistTemplateRequest(
        String nombre,
        Long movilidadId,
        List<SeccionRequest> secciones
) {
    public record SeccionRequest(String nombre, List<ItemRequest> items) {}

    public record ItemRequest(
            String nombre,
            String descripcion,
            Boolean requiereCantidad,
            Integer cantidadEsperada,
            Boolean obligatorio
    ) {}
}
