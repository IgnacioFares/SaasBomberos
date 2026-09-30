package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.config.PermisosCatalogo;
import com.bomberos.saas_bomberos.entity.Bombero;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.repository.BomberoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class BomberoService {

    private final BomberoRepository bomberoRepository;
    private final AutorizacionService autorizacion;

    public List<Bombero> obtenerTodos() {
        return bomberoRepository.findByActivoTrue();
    }

    public Optional<Bombero> obtenerPorId(Long id) {
        return bomberoRepository.findById(id);
    }

    // El alta desde el registro público de cuentas NO pasa por acá
    // (UsuarioService usa el repositorio directamente); este método es
    // solo para la pantalla de Personal.
    public Bombero guardar(Bombero bombero, Usuario usuario) {
        autorizacion.exigir(usuario, PermisosCatalogo.GESTIONAR_PERSONAL);
        if (bomberoRepository.existsByDni(bombero.getDni())) {
            throw new RuntimeException("Ya existe un bombero con ese DNI");
        }
        return bomberoRepository.save(bombero);
    }

    public Bombero actualizar(Long id, Bombero bomberoActualizado, Usuario usuario) {
        autorizacion.exigir(usuario, PermisosCatalogo.GESTIONAR_PERSONAL);
        Bombero bombero = bomberoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bombero no encontrado"));

        bombero.setNombre(bomberoActualizado.getNombre());
        bombero.setApellido(bomberoActualizado.getApellido());
        bombero.setEmail(bomberoActualizado.getEmail());
        bombero.setTelefono(bomberoActualizado.getTelefono());
        bombero.setRango(bomberoActualizado.getRango());
        bombero.setFechaIngreso(bomberoActualizado.getFechaIngreso());
        bombero.setTelefonoEmergencia(bomberoActualizado.getTelefonoEmergencia());
        bombero.setObraSocial(bomberoActualizado.getObraSocial());
        bombero.setEnfermedades(bomberoActualizado.getEnfermedades());
        bombero.setGrupoSanguineo(bomberoActualizado.getGrupoSanguineo());

        return bomberoRepository.save(bombero);
    }

    public void desactivar(Long id, Usuario usuario) {
        autorizacion.exigir(usuario, PermisosCatalogo.GESTIONAR_PERSONAL);
        Bombero bombero = bomberoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bombero no encontrado"));
        bombero.setActivo(false);
        bomberoRepository.save(bombero);
    }
}