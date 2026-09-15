package com.bomberos.saas_bomberos.repository;

import com.bomberos.saas_bomberos.entity.AreaTrabajo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AreaTrabajoRepository extends JpaRepository<AreaTrabajo, Long> {

    List<AreaTrabajo> findByActivoTrue();

    boolean existsByNombre(String nombre);

    List<AreaTrabajo> findByEncargadoId(Long encargadoId);
}
