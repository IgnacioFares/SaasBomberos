package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.dto.ChecklistRegistroRequest;
import com.bomberos.saas_bomberos.dto.ChecklistRegistroResponse;
import com.bomberos.saas_bomberos.entity.Bombero;
import com.bomberos.saas_bomberos.entity.ChecklistItem;
import com.bomberos.saas_bomberos.entity.ChecklistItemEstado;
import com.bomberos.saas_bomberos.entity.ChecklistRegistro;
import com.bomberos.saas_bomberos.entity.ChecklistRegistroEstado;
import com.bomberos.saas_bomberos.entity.ChecklistRegistroItem;
import com.bomberos.saas_bomberos.entity.ChecklistSeccion;
import com.bomberos.saas_bomberos.entity.ChecklistTemplate;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.repository.BomberoRepository;
import com.bomberos.saas_bomberos.repository.ChecklistRegistroRepository;
import com.bomberos.saas_bomberos.repository.ChecklistTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ChecklistRegistroService {

    private final ChecklistRegistroRepository registroRepository;
    private final ChecklistTemplateRepository templateRepository;
    private final BomberoRepository bomberoRepository;

    public ChecklistRegistroResponse crear(ChecklistRegistroRequest request, Usuario realizadoPor) {
        if (request.templateId() == null) {
            throw new RuntimeException("Falta indicar qué checklist se está completando");
        }

        ChecklistTemplate template = templateRepository.findById(request.templateId())
                .orElseThrow(() -> new RuntimeException("Checklist no encontrado"));

        Map<Long, ChecklistRegistroRequest.ResultadoRequest> respuestas = new HashMap<>();
        if (request.resultados() != null) {
            request.resultados().forEach(r -> respuestas.put(r.itemId(), r));
        }

        ChecklistRegistro registro = new ChecklistRegistro();
        registro.setTemplate(template);
        registro.setRealizadoPor(realizadoPor);
        registro.setObservacionGeneral(request.observacionGeneral());
        registro.setDuracionSegundos(request.duracionSegundos());
        registro.setEstado(ChecklistRegistroEstado.PENDIENTE_FIRMA);

        // Se recorre la plantilla (no las respuestas) para snapshotear
        // todos los ítems en orden y detectar obligatorios sin controlar.
        for (ChecklistSeccion seccion : template.getSecciones()) {
            for (ChecklistItem item : seccion.getItems()) {
                registro.getResultados().add(
                        construirResultado(item, seccion.getNombre(), respuestas.get(item.getId())));
            }
        }

        agregarParticipantes(registro, request.participantesIds(), realizadoPor);

        return mapear(registroRepository.save(registro));
    }

    public ChecklistRegistroResponse firmar(Long id, Usuario firmante) {
        ChecklistRegistro registro = obtenerEntidad(id);
        if (registro.getEstado() == ChecklistRegistroEstado.FIRMADO) {
            throw new RuntimeException("Este checklist ya fue firmado");
        }

        registro.setEstado(ChecklistRegistroEstado.FIRMADO);
        registro.setFirmadoPor(firmante);
        registro.setFirmadoEn(LocalDateTime.now());

        return mapear(registroRepository.save(registro));
    }

    public List<ChecklistRegistroResponse> obtenerTodos(String estadoFiltro, Long movilidadId) {
        ChecklistRegistroEstado estado = parsearEstado(estadoFiltro);

        List<ChecklistRegistro> registros;
        if (estado != null && movilidadId != null) {
            registros = registroRepository.findByEstadoAndTemplateMovilidadIdOrderByFechaDesc(estado, movilidadId);
        } else if (estado != null) {
            registros = registroRepository.findByEstadoOrderByFechaDesc(estado);
        } else if (movilidadId != null) {
            registros = registroRepository.findByTemplateMovilidadIdOrderByFechaDesc(movilidadId);
        } else {
            registros = registroRepository.findAllByOrderByFechaDesc();
        }

        return registros.stream().map(this::mapear).toList();
    }

    public ChecklistRegistroResponse obtenerPorId(Long id) {
        return mapear(obtenerEntidad(id));
    }

    private ChecklistRegistroItem construirResultado(
            ChecklistItem item,
            String seccionNombre,
            ChecklistRegistroRequest.ResultadoRequest respuesta
    ) {
        ChecklistRegistroItem resultado = new ChecklistRegistroItem();
        resultado.setItemId(item.getId());
        resultado.setItemNombre(item.getNombre());
        resultado.setSeccionNombre(seccionNombre);
        resultado.setCantidadEsperada(item.getCantidadEsperada());

        boolean respondido = respuesta != null
                && (respuesta.ok() != null || respuesta.cantidadEncontrada() != null);

        if (!respondido) {
            if (Boolean.TRUE.equals(item.getObligatorio())) {
                throw new RuntimeException(
                        "Falta controlar el ítem obligatorio \"" + item.getNombre() + "\" (" + seccionNombre + ")");
            }
            resultado.setEstado(ChecklistItemEstado.NO_CONTROLADO);
            return resultado;
        }

        resultado.setObservacion(respuesta.observacion());

        if (Boolean.TRUE.equals(item.getRequiereCantidad())) {
            // "Correcto" sin cantidad explícita registra la esperada.
            Integer encontrada = respuesta.cantidadEncontrada() != null
                    ? respuesta.cantidadEncontrada()
                    : item.getCantidadEsperada();
            if (encontrada == null || encontrada < 0) {
                throw new RuntimeException(
                        "Cantidad inválida para el ítem \"" + item.getNombre() + "\"");
            }
            resultado.setCantidadEncontrada(encontrada);
            resultado.setEstado(compararCantidades(item.getCantidadEsperada(), encontrada));
        } else {
            resultado.setEstado(Boolean.TRUE.equals(respuesta.ok())
                    ? ChecklistItemEstado.CORRECTO
                    : ChecklistItemEstado.NOVEDAD);
        }

        return resultado;
    }

    private ChecklistItemEstado compararCantidades(Integer esperada, int encontrada) {
        if (esperada == null || encontrada == esperada) return ChecklistItemEstado.CORRECTO;
        return encontrada < esperada ? ChecklistItemEstado.FALTANTE : ChecklistItemEstado.SOBRANTE;
    }

    private void agregarParticipantes(ChecklistRegistro registro, List<Long> participantesIds, Usuario realizadoPor) {
        if (participantesIds == null || participantesIds.isEmpty()) return;

        Long bomberoResponsableId = realizadoPor.getBombero().getId();
        for (Long bomberoId : participantesIds.stream().filter(Objects::nonNull).distinct().toList()) {
            // El responsable ya queda registrado como realizadoPor.
            if (bomberoId.equals(bomberoResponsableId)) continue;
            Bombero bombero = bomberoRepository.findById(bomberoId)
                    .orElseThrow(() -> new RuntimeException("Participante no encontrado: " + bomberoId));
            registro.getParticipantes().add(bombero);
        }
    }

    private ChecklistRegistroEstado parsearEstado(String estado) {
        if (estado == null || estado.isBlank()) return null;
        try {
            return ChecklistRegistroEstado.valueOf(estado);
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Estado de checklist desconocido: " + estado);
        }
    }

    private ChecklistRegistro obtenerEntidad(Long id) {
        return registroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro de checklist no encontrado"));
    }

    private ChecklistRegistroResponse mapear(ChecklistRegistro r) {
        List<ChecklistRegistroResponse.ResultadoResponse> resultados = r.getResultados().stream()
                .map(res -> new ChecklistRegistroResponse.ResultadoResponse(
                        res.getItemId(),
                        res.getItemNombre(),
                        res.getSeccionNombre(),
                        res.getCantidadEsperada(),
                        res.getCantidadEncontrada(),
                        res.getEstado().name(),
                        res.getObservacion()
                ))
                .toList();

        List<ChecklistRegistroResponse.ParticipanteResponse> participantes = r.getParticipantes().stream()
                .map(b -> new ChecklistRegistroResponse.ParticipanteResponse(
                        b.getId(), b.getNombre() + " " + b.getApellido()))
                .toList();

        return new ChecklistRegistroResponse(
                r.getId(),
                r.getTemplate().getId(),
                r.getTemplate().getNombre(),
                r.getTemplate().getMovilidad().getNombre(),
                nombreCompleto(r.getRealizadoPor()),
                participantes,
                r.getEstado().name(),
                r.getFecha(),
                r.getDuracionSegundos(),
                r.getObservacionGeneral(),
                r.getFirmadoPor() != null ? nombreCompleto(r.getFirmadoPor()) : null,
                r.getFirmadoEn(),
                calcularResumen(r),
                resultados
        );
    }

    private ChecklistRegistroResponse.Resumen calcularResumen(ChecklistRegistro r) {
        int correctos = 0, faltantes = 0, sobrantes = 0, novedades = 0, noControlados = 0, conObservacion = 0;
        for (ChecklistRegistroItem res : r.getResultados()) {
            switch (res.getEstado()) {
                case CORRECTO -> correctos++;
                case FALTANTE -> faltantes++;
                case SOBRANTE -> sobrantes++;
                case NOVEDAD -> novedades++;
                case NO_CONTROLADO -> noControlados++;
            }
            if (res.getObservacion() != null && !res.getObservacion().isBlank()) {
                conObservacion++;
            }
        }
        return new ChecklistRegistroResponse.Resumen(
                correctos, faltantes, sobrantes, novedades, noControlados, conObservacion);
    }

    private String nombreCompleto(Usuario usuario) {
        return usuario.getBombero().getNombre() + " " + usuario.getBombero().getApellido();
    }
}
