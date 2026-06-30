package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.entity.Permiso;
import com.bomberos.saas_bomberos.entity.Rol;
import com.bomberos.saas_bomberos.repository.PermisoRepository;
import com.bomberos.saas_bomberos.repository.RolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RolService {

    private final RolRepository rolRepository;
    private final PermisoRepository permisoRepository;

    public List<Rol> obtenerTodos() {
        return rolRepository.findAll();
    }

    public Rol guardar(Rol rol) {
        return rolRepository.save(rol);
    }

    public Rol asignarPermisos(Long rolId, List<Long> permisoIds) {
        Rol rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        Set<Permiso> permisos = new HashSet<>();
        for (Long permisoId : permisoIds) {
            Permiso permiso = permisoRepository.findById(permisoId)
                    .orElseThrow(() -> new RuntimeException("Permiso no encontrado: " + permisoId));
            permisos.add(permiso);
        }

        rol.setPermisos(permisos);
        return rolRepository.save(rol);
    }
}