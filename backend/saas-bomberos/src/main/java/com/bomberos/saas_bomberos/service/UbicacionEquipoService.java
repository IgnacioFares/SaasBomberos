package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.dto.UbicacionEquipoDto;
import com.bomberos.saas_bomberos.entity.UbicacionEquipo;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.repository.UbicacionEquipoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UbicacionEquipoService {

    private final UbicacionEquipoRepository ubicacionRepository;

    public List<UbicacionEquipoDto.Response> obtenerTodas() {
        return ubicacionRepository.findByActivoTrueOrderByNombreAsc().stream()
                .map(this::mapear)
                .toList();
    }

    public UbicacionEquipoDto.Response crear(UbicacionEquipoDto.Request request, Usuario usuario) {
        exigirPermiso(usuario, "crear");
        validarNombre(request, null);
        UbicacionEquipo ubicacion = new UbicacionEquipo();
        ubicacion.setNombre(request.nombre().trim());
        return mapear(ubicacionRepository.save(ubicacion));
    }

    public UbicacionEquipoDto.Response actualizar(Long id, UbicacionEquipoDto.Request request, Usuario usuario) {
        exigirPermiso(usuario, "editar");
        UbicacionEquipo ubicacion = obtenerEntidad(id);
        validarNombre(request, id);
        ubicacion.setNombre(request.nombre().trim());
        return mapear(ubicacionRepository.save(ubicacion));
    }

    // Baja lógica: la ubicación deja de ofrecerse para equipos nuevos,
    // pero los equipos que ya la referencian siguen mostrando su nombre.
    public void eliminar(Long id, Usuario usuario) {
        exigirPermiso(usuario, "eliminar");
        UbicacionEquipo ubicacion = obtenerEntidad(id);
        ubicacion.setActivo(false);
        ubicacionRepository.save(ubicacion);
    }

    private void validarNombre(UbicacionEquipoDto.Request request, Long idActual) {
        if (request.nombre() == null || request.nombre().isBlank()) {
            throw new RuntimeException("El nombre de la ubicación es obligatorio");
        }
        boolean duplicada = ubicacionRepository.findByNombreIgnoreCase(request.nombre().trim()).stream()
                .filter(existente -> !existente.getId().equals(idActual))
                .anyMatch(UbicacionEquipo::getActivo);
        if (duplicada) {
            throw new RuntimeException("Ya existe una ubicación con ese nombre");
        }
    }

    private UbicacionEquipo obtenerEntidad(Long id) {
        return ubicacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ubicación no encontrada"));
    }

    // Ver comentario en CategoriaEquipoService: autorización deshabilitada
    // a propósito por ahora, punto único para reactivarla.
    @SuppressWarnings("unused")
    private void exigirPermiso(Usuario usuario, String accion) {
        // Sin restricciones por ahora.
    }

    private UbicacionEquipoDto.Response mapear(UbicacionEquipo u) {
        return new UbicacionEquipoDto.Response(u.getId(), u.getNombre());
    }
}
