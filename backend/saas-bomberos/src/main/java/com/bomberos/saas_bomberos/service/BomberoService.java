package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.entity.Bombero;
import com.bomberos.saas_bomberos.repository.BomberoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BomberoService {

    private final BomberoRepository bomberoRepository;

    public List<Bombero> obtenerTodos() {
        return bomberoRepository.findByActivoTrue();
    }

    public Optional<Bombero> obtenerPorId(Long id) {
        return bomberoRepository.findById(id);
    }

    public Bombero guardar(Bombero bombero) {
        if (bomberoRepository.existsByDni(bombero.getDni())) {
            throw new RuntimeException("Ya existe un bombero con ese DNI");
        }
        return bomberoRepository.save(bombero);
    }

    public Bombero actualizar(Long id, Bombero bomberoActualizado) {
        Bombero bombero = bomberoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bombero no encontrado"));

        bombero.setNombre(bomberoActualizado.getNombre());
        bombero.setApellido(bomberoActualizado.getApellido());
        bombero.setEmail(bomberoActualizado.getEmail());
        bombero.setTelefono(bomberoActualizado.getTelefono());
        bombero.setRango(bomberoActualizado.getRango());
        bombero.setFechaIngreso(bomberoActualizado.getFechaIngreso());

        return bomberoRepository.save(bombero);
    }

    public void desactivar(Long id) {
        Bombero bombero = bomberoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bombero no encontrado"));
        bombero.setActivo(false);
        bomberoRepository.save(bombero);
    }
}