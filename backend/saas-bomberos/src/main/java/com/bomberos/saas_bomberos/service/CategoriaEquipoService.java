package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.dto.CategoriaEquipoDto;
import com.bomberos.saas_bomberos.entity.CategoriaEquipo;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.repository.CategoriaEquipoRepository;
import com.bomberos.saas_bomberos.repository.EquipoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaEquipoService {

    private final CategoriaEquipoRepository categoriaRepository;
    private final EquipoRepository equipoRepository;

    public List<CategoriaEquipoDto.Response> obtenerTodas() {
        return categoriaRepository.findByActivoTrueOrderByNombreAsc().stream()
                .map(this::mapear)
                .toList();
    }

    public CategoriaEquipoDto.Response crear(CategoriaEquipoDto.Request request, Usuario usuario) {
        exigirPermiso(usuario, "crear");
        CategoriaEquipo categoria = new CategoriaEquipo();
        aplicar(categoria, request);
        return mapear(categoriaRepository.save(categoria));
    }

    public CategoriaEquipoDto.Response actualizar(Long id, CategoriaEquipoDto.Request request, Usuario usuario) {
        exigirPermiso(usuario, "editar");
        CategoriaEquipo categoria = obtenerEntidad(id);
        aplicar(categoria, request);
        return mapear(categoriaRepository.save(categoria));
    }

    public void eliminar(Long id, Usuario usuario) {
        exigirPermiso(usuario, "eliminar");
        CategoriaEquipo categoria = obtenerEntidad(id);

        if (equipoRepository.existsByCategoriaIdAndActivoTrue(id)
                || equipoRepository.existsBySubcategoriaIdAndActivoTrue(id)) {
            throw new RuntimeException(
                    "No se puede eliminar \"" + categoria.getNombre() + "\": hay equipos que la usan");
        }
        if (categoriaRepository.existsByPadreIdAndActivoTrue(id)) {
            throw new RuntimeException(
                    "No se puede eliminar \"" + categoria.getNombre() + "\": tiene subcategorías activas");
        }

        categoria.setActivo(false);
        categoriaRepository.save(categoria);
    }

    private void aplicar(CategoriaEquipo categoria, CategoriaEquipoDto.Request request) {
        if (request.nombre() == null || request.nombre().isBlank()) {
            throw new RuntimeException("El nombre de la categoría es obligatorio");
        }
        categoria.setNombre(request.nombre().trim());

        if (request.padreId() != null) {
            CategoriaEquipo padre = obtenerEntidad(request.padreId());
            if (padre.getPadre() != null) {
                throw new RuntimeException("Una subcategoría no puede tener subcategorías propias");
            }
            if (padre.getId().equals(categoria.getId())) {
                throw new RuntimeException("Una categoría no puede ser su propia subcategoría");
            }
            categoria.setPadre(padre);
        } else {
            categoria.setPadre(null);
        }
    }

    private CategoriaEquipo obtenerEntidad(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
    }

    // Punto único de autorización del módulo de inventario. Por decisión
    // del cuartel, por ahora cualquier usuario autenticado puede todo;
    // cuando se definan roles/permisos, la restricción se reactiva acá.
    @SuppressWarnings("unused")
    private void exigirPermiso(Usuario usuario, String accion) {
        // Sin restricciones por ahora.
    }

    private CategoriaEquipoDto.Response mapear(CategoriaEquipo c) {
        return new CategoriaEquipoDto.Response(
                c.getId(),
                c.getNombre(),
                c.getPadre() != null ? c.getPadre().getId() : null
        );
    }
}
