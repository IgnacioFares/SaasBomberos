package com.bomberos.saas_bomberos.dto;

import java.util.List;

// Forma del JSON para crear/editar un área de trabajo:
// { "nombre": "Mantenimiento", "descripcion": "...",
//   "encargadoId": 4, "integrantesIds": [4, 7, 9] }
public record AreaTrabajoRequest(
        String nombre,
        String descripcion,
        Long encargadoId,
        List<Long> integrantesIds
) {
}
