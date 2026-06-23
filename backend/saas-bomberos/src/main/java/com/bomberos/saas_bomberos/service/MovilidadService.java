package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.entity.Movilidad;
import com.bomberos.saas_bomberos.repository.MovilidadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MovilidadService {

    private final MovilidadRepository movilidadRepository;

    public List<Movilidad> obtenerTodas() {
        return movilidadRepository.findByActivoTrue();
    }

    public Optional<Movilidad> obtenerPorId(Long id) {
        return movilidadRepository.findById(id);
    }

    public Movilidad guardar(Movilidad movilidad) {
        if (movilidadRepository.existsByNumeroMovil(movilidad.getNumeroMovil())) {
            throw new RuntimeException("Ya existe una movilidad con ese número");
        }
        if (movilidadRepository.existsByPatente(movilidad.getPatente())) {
            throw new RuntimeException("Ya existe una movilidad con esa patente");
        }
        return movilidadRepository.save(movilidad);
    }

    public Movilidad actualizar(Long id, Movilidad movilidadActualizada) {
        Movilidad movilidad = movilidadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movilidad no encontrada"));

        movilidad.setNumeroMovil(movilidadActualizada.getNumeroMovil());
        movilidad.setPatente(movilidadActualizada.getPatente());
        movilidad.setModelo(movilidadActualizada.getModelo());
        movilidad.setMarca(movilidadActualizada.getMarca());
        movilidad.setDescripcion(movilidadActualizada.getDescripcion());

        return movilidadRepository.save(movilidad);
    }

    public void desactivar(Long id) {
        Movilidad movilidad = movilidadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movilidad no encontrada"));
        movilidad.setActivo(false);
        movilidadRepository.save(movilidad);
    }
}