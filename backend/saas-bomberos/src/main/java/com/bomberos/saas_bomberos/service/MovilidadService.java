package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.config.PermisosCatalogo;
import com.bomberos.saas_bomberos.entity.Movilidad;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.repository.MovilidadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class MovilidadService {

    private final MovilidadRepository movilidadRepository;
    private final AutorizacionService autorizacion;

    public List<Movilidad> obtenerTodas() {
        return movilidadRepository.findByActivoTrue();
    }

    public Optional<Movilidad> obtenerPorId(Long id) {
        return movilidadRepository.findById(id);
    }

    public Movilidad guardar(Movilidad movilidad, Usuario usuario) {
        autorizacion.exigir(usuario, PermisosCatalogo.GESTIONAR_MOVILIDADES);
        if (movilidad.getPatente() != null && !movilidad.getPatente().isBlank()
                && movilidadRepository.existsByPatente(movilidad.getPatente())) {
            throw new RuntimeException("Ya existe una movilidad con esa patente");
        }
        return movilidadRepository.save(movilidad);
    }

    public Movilidad actualizar(Long id, Movilidad movilidadActualizada, Usuario usuario) {
        autorizacion.exigir(usuario, PermisosCatalogo.GESTIONAR_MOVILIDADES);
        Movilidad movilidad = movilidadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movilidad no encontrada"));

        String patente = movilidadActualizada.getPatente();
        if (patente != null && !patente.isBlank()
                && movilidadRepository.existsByPatenteAndIdNot(patente, id)) {
            throw new RuntimeException("Ya existe otra movilidad con esa patente");
        }

        movilidad.setNombre(movilidadActualizada.getNombre());
        movilidad.setPatente(movilidadActualizada.getPatente());
        movilidad.setModelo(movilidadActualizada.getModelo());
        movilidad.setMarca(movilidadActualizada.getMarca());
        movilidad.setKilometraje(movilidadActualizada.getKilometraje());
        movilidad.setEnServicio(movilidadActualizada.getEnServicio());
        movilidad.setDescripcion(movilidadActualizada.getDescripcion());

        return movilidadRepository.save(movilidad);
    }

    public void desactivar(Long id, Usuario usuario) {
        autorizacion.exigir(usuario, PermisosCatalogo.GESTIONAR_MOVILIDADES);
        Movilidad movilidad = movilidadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movilidad no encontrada"));
        movilidad.setActivo(false);
        movilidadRepository.save(movilidad);
    }
}