package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.dto.BomberoResumenDto;
import com.bomberos.saas_bomberos.dto.TareaAreaRequest;
import com.bomberos.saas_bomberos.dto.TareaAreaResponse;
import com.bomberos.saas_bomberos.entity.AreaTrabajo;
import com.bomberos.saas_bomberos.entity.Bombero;
import com.bomberos.saas_bomberos.entity.TareaArea;
import com.bomberos.saas_bomberos.entity.TareaAreaEstado;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.repository.BomberoRepository;
import com.bomberos.saas_bomberos.repository.TareaAreaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class TareaAreaService {

    private final TareaAreaRepository tareaAreaRepository;
    private final BomberoRepository bomberoRepository;
    private final AreaTrabajoService areaTrabajoService;

    public List<TareaAreaResponse> obtenerPorArea(Long areaId) {
        // Valida que el área exista antes de listar (404 si no).
        areaTrabajoService.obtenerEntidad(areaId);
        return tareaAreaRepository.findByAreaIdOrderByFechaCreacionDesc(areaId).stream()
                .map(this::mapear)
                .toList();
    }

    public TareaAreaResponse crear(Long areaId, TareaAreaRequest request, Usuario usuario) {
        AreaTrabajo area = areaTrabajoService.obtenerEntidad(areaId);
        areaTrabajoService.exigirGestionDeArea(area, usuario);

        if (request.titulo() == null || request.titulo().isBlank()) {
            throw new RuntimeException("El título de la tarea es obligatorio");
        }
        if (request.fechaLimite() == null) {
            throw new RuntimeException("La fecha límite es obligatoria");
        }
        if (request.asignadosIds() == null || request.asignadosIds().isEmpty()) {
            throw new RuntimeException("Hay que asignar la tarea a al menos un integrante del área");
        }

        Set<Long> integrantesIds = area.getIntegrantes().stream().map(Bombero::getId).collect(Collectors.toSet());
        Set<Bombero> asignados = new LinkedHashSet<>();
        for (Long bomberoId : request.asignadosIds().stream().filter(Objects::nonNull).distinct().toList()) {
            if (!integrantesIds.contains(bomberoId)) {
                throw new RuntimeException("Solo se puede asignar la tarea a integrantes del área");
            }
            asignados.add(bomberoRepository.findById(bomberoId)
                    .orElseThrow(() -> new RuntimeException("Integrante no encontrado: " + bomberoId)));
        }

        TareaArea tarea = new TareaArea();
        tarea.setArea(area);
        tarea.setTitulo(request.titulo());
        tarea.setDescripcion(request.descripcion());
        tarea.setFechaLimite(request.fechaLimite());
        tarea.setAsignados(asignados);
        tarea.setCreadaPor(usuario);
        tarea.setEstado(TareaAreaEstado.PENDIENTE);

        return mapear(tareaAreaRepository.save(tarea));
    }

    public void eliminar(Long id, Usuario usuario) {
        TareaArea tarea = obtenerEntidad(id);
        areaTrabajoService.exigirGestionDeArea(tarea.getArea(), usuario);
        if (tarea.getEstado() == TareaAreaEstado.REALIZADA) {
            throw new RuntimeException("No se puede eliminar una tarea ya realizada: queda en el historial");
        }
        tareaAreaRepository.delete(tarea);
    }

    public TareaAreaResponse marcarRealizada(Long id, Usuario usuario) {
        TareaArea tarea = obtenerEntidad(id);
        exigirPuedeCompletar(tarea, usuario);
        if (tarea.getEstado() == TareaAreaEstado.REALIZADA) {
            throw new RuntimeException("Esta tarea ya fue marcada como realizada");
        }

        tarea.setEstado(TareaAreaEstado.REALIZADA);
        tarea.setCompletadaPor(usuario);
        tarea.setCompletadaEn(LocalDateTime.now());

        return mapear(tareaAreaRepository.save(tarea));
    }

    // Puede completar una tarea el administrador, el encargado del área
    // o cualquier integrante al que se le haya asignado.
    private void exigirPuedeCompletar(TareaArea tarea, Usuario usuario) {
        boolean esAsignado = usuario.getBombero() != null && tarea.getAsignados().stream()
                .anyMatch(b -> Objects.equals(b.getId(), usuario.getBombero().getId()));
        if (esAsignado) return;
        areaTrabajoService.exigirGestionDeArea(tarea.getArea(), usuario);
    }

    private TareaArea obtenerEntidad(Long id) {
        return tareaAreaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));
    }

    private TareaAreaResponse mapear(TareaArea t) {
        List<BomberoResumenDto> asignados = t.getAsignados().stream()
                .map(b -> new BomberoResumenDto(b.getId(), b.getNombre() + " " + b.getApellido()))
                .toList();

        return new TareaAreaResponse(
                t.getId(),
                t.getArea().getId(),
                t.getArea().getNombre(),
                t.getTitulo(),
                t.getDescripcion(),
                asignados,
                t.getFechaLimite(),
                t.getFechaCreacion(),
                nombreCompleto(t.getCreadaPor()),
                t.getEstado().name(),
                t.getCompletadaPor() != null ? nombreCompleto(t.getCompletadaPor()) : null,
                t.getCompletadaEn()
        );
    }

    private String nombreCompleto(Usuario usuario) {
        return usuario.getBombero().getNombre() + " " + usuario.getBombero().getApellido();
    }
}
