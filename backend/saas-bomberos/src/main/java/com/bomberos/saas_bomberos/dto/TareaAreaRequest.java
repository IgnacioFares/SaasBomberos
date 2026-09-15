package com.bomberos.saas_bomberos.dto;

import java.time.LocalDate;
import java.util.List;

// Forma del JSON para crear una tarea dentro de un área (el areaId va
// en la URL, no acá):
// { "titulo": "Revisar mangueras", "descripcion": "...",
//   "asignadosIds": [4, 7], "fechaLimite": "2026-09-30" }
public record TareaAreaRequest(
        String titulo,
        String descripcion,
        List<Long> asignadosIds,
        LocalDate fechaLimite
) {
}
