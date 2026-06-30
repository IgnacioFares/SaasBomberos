package com.bomberos.saas_bomberos.repository;

import com.bomberos.saas_bomberos.entity.Permiso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PermisoRepository extends JpaRepository<Permiso, Long> {
     Optional<Permiso> findByNombre(String nombre);
}