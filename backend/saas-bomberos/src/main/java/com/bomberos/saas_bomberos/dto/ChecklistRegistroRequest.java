package com.bomberos.saas_bomberos.dto;

import java.util.List;

// Forma del JSON que se manda al completar un checklist:
// { "templateId": 5, "observacionGeneral": "...", "duracionSegundos": 340,
//   "participantesIds": [2, 7],
//   "resultados": [ {"itemId": 12, "ok": true},
//                   {"itemId": 13, "cantidadEncontrada": 3, "observacion": "Falta una"} ] }
//
// Para ítems con cantidad se puede mandar "ok": true (registra la
// esperada) o una cantidadEncontrada explícita; el backend calcula el
// estado (CORRECTO / FALTANTE / SOBRANTE / NOVEDAD).
public record ChecklistRegistroRequest(
        Long templateId,
        String observacionGeneral,
        Integer duracionSegundos,
        List<Long> participantesIds,
        List<ResultadoRequest> resultados
) {
    public record ResultadoRequest(
            Long itemId,
            Boolean ok,
            Integer cantidadEncontrada,
            String observacion
    ) {}
}
