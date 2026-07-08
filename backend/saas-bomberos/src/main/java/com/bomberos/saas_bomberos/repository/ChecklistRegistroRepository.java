package com.bomberos.saas_bomberos.repository;

import com.bomberos.saas_bomberos.entity.ChecklistRegistro;
import com.bomberos.saas_bomberos.entity.ChecklistRegistroEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChecklistRegistroRepository extends JpaRepository<ChecklistRegistro, Long> {
    List<ChecklistRegistro> findAllByOrderByFechaDesc();

    List<ChecklistRegistro> findByEstadoOrderByFechaDesc(ChecklistRegistroEstado estado);

    List<ChecklistRegistro> findByTemplateMovilidadIdOrderByFechaDesc(Long movilidadId);

    List<ChecklistRegistro> findByEstadoAndTemplateMovilidadIdOrderByFechaDesc(
            ChecklistRegistroEstado estado, Long movilidadId);
}
