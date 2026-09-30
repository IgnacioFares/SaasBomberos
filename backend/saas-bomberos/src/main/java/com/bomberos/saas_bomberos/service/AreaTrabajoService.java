package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.config.PermisosCatalogo;
import com.bomberos.saas_bomberos.dto.AreaTrabajoRequest;
import com.bomberos.saas_bomberos.dto.AreaTrabajoResponse;
import com.bomberos.saas_bomberos.dto.BomberoResumenDto;
import com.bomberos.saas_bomberos.entity.AreaTrabajo;
import com.bomberos.saas_bomberos.entity.Bombero;
import com.bomberos.saas_bomberos.entity.TareaAreaEstado;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.repository.AreaTrabajoRepository;
import com.bomberos.saas_bomberos.repository.BomberoRepository;
import com.bomberos.saas_bomberos.repository.TareaAreaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@Transactional
@RequiredArgsConstructor
public class AreaTrabajoService {

    private final AreaTrabajoRepository areaTrabajoRepository;
    private final BomberoRepository bomberoRepository;
    private final TareaAreaRepository tareaAreaRepository;
    private final AutorizacionService autorizacion;

    public List<AreaTrabajoResponse> obtenerTodas() {
        return areaTrabajoRepository.findByActivoTrue().stream().map(this::mapear).toList();
    }

    public AreaTrabajoResponse obtenerPorId(Long id) {
        return mapear(obtenerEntidad(id));
    }

    public AreaTrabajoResponse crear(AreaTrabajoRequest request, Usuario usuario) {
        autorizacion.exigir(usuario, PermisosCatalogo.GESTIONAR_AREAS_TRABAJO);

        if (request.nombre() == null || request.nombre().isBlank()) {
            throw new RuntimeException("El nombre del área es obligatorio");
        }
        if (areaTrabajoRepository.existsByNombre(request.nombre())) {
            throw new RuntimeException("Ya existe un área de trabajo con ese nombre");
        }

        AreaTrabajo area = new AreaTrabajo();
        area.setNombre(request.nombre());
        area.setDescripcion(request.descripcion());
        aplicarEncargadoEIntegrantes(area, request);

        return mapear(areaTrabajoRepository.save(area));
    }

    public AreaTrabajoResponse actualizar(Long id, AreaTrabajoRequest request, Usuario usuario) {
        autorizacion.exigir(usuario, PermisosCatalogo.GESTIONAR_AREAS_TRABAJO);
        AreaTrabajo area = obtenerEntidad(id);

        if (request.nombre() == null || request.nombre().isBlank()) {
            throw new RuntimeException("El nombre del área es obligatorio");
        }
        if (!area.getNombre().equals(request.nombre()) && areaTrabajoRepository.existsByNombre(request.nombre())) {
            throw new RuntimeException("Ya existe un área de trabajo con ese nombre");
        }

        area.setNombre(request.nombre());
        area.setDescripcion(request.descripcion());
        aplicarEncargadoEIntegrantes(area, request);

        return mapear(areaTrabajoRepository.save(area));
    }

    public void desactivar(Long id, Usuario usuario) {
        autorizacion.exigir(usuario, PermisosCatalogo.GESTIONAR_AREAS_TRABAJO);
        AreaTrabajo area = obtenerEntidad(id);
        area.setActivo(false);
        areaTrabajoRepository.save(area);
    }

    // Usado por TareaAreaService: solo un administrador o el encargado
    // del área en cuestión puede crear/eliminar tareas de esa área.
    public void exigirGestionDeArea(AreaTrabajo area, Usuario usuario) {
        if (autorizacion.esAdministrador(usuario)) return;
        if (usuario.getBombero() != null
                && area.getEncargado() != null
                && Objects.equals(area.getEncargado().getId(), usuario.getBombero().getId())) {
            return;
        }
        throw new AccesoDenegadoException("Solo el encargado del área o un administrador puede hacer esto");
    }

    public AreaTrabajo obtenerEntidad(Long id) {
        return areaTrabajoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Área de trabajo no encontrada"));
    }

    private void aplicarEncargadoEIntegrantes(AreaTrabajo area, AreaTrabajoRequest request) {
        if (request.encargadoId() != null) {
            Bombero encargado = bomberoRepository.findById(request.encargadoId())
                    .orElseThrow(() -> new RuntimeException("El encargado indicado no existe"));
            area.setEncargado(encargado);
        } else {
            area.setEncargado(null);
        }

        Set<Bombero> integrantes = new LinkedHashSet<>();
        if (request.integrantesIds() != null) {
            for (Long bomberoId : request.integrantesIds().stream().filter(Objects::nonNull).distinct().toList()) {
                integrantes.add(bomberoRepository.findById(bomberoId)
                        .orElseThrow(() -> new RuntimeException("Integrante no encontrado: " + bomberoId)));
            }
        }
        // El encargado siempre forma parte del área, aunque no se lo
        // incluya explícitamente en la lista de integrantes.
        if (area.getEncargado() != null) {
            integrantes.add(area.getEncargado());
        }
        area.setIntegrantes(integrantes);
    }

    private AreaTrabajoResponse mapear(AreaTrabajo area) {
        List<BomberoResumenDto> integrantes = area.getIntegrantes().stream()
                .map(this::resumen)
                .toList();
        long pendientes = area.getId() != null
                ? tareaAreaRepository.countByAreaIdAndEstado(area.getId(), TareaAreaEstado.PENDIENTE)
                : 0;

        return new AreaTrabajoResponse(
                area.getId(),
                area.getNombre(),
                area.getDescripcion(),
                area.getEncargado() != null ? resumen(area.getEncargado()) : null,
                integrantes,
                area.getActivo(),
                area.getCreadoEn(),
                pendientes
        );
    }

    private BomberoResumenDto resumen(Bombero bombero) {
        return new BomberoResumenDto(bombero.getId(), bombero.getNombre() + " " + bombero.getApellido());
    }
}
