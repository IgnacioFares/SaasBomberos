package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.entity.Permiso;
import com.bomberos.saas_bomberos.repository.PermisoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PermisoService {

    private final PermisoRepository permisoRepository;

    public List<Permiso> obtenerTodos() {
        return permisoRepository.findAll();
    }

    public Permiso guardar(Permiso permiso) {
        return permisoRepository.save(permiso);
    }
}