package com.bomberos.saas_bomberos.repository;

import com.bomberos.saas_bomberos.entity.TareaArea;
import com.bomberos.saas_bomberos.entity.TareaAreaEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TareaAreaRepository extends JpaRepository<TareaArea, Long> {

    List<TareaArea> findByAreaIdOrderByFechaCreacionDesc(Long areaId);

    long countByAreaIdAndEstado(Long areaId, TareaAreaEstado estado);

    // Para una futura vista "mis tareas": todo lo asignado a un bombero,
    // en cualquier área.
    List<TareaArea> findByAsignados_IdOrderByFechaCreacionDesc(Long bomberoId);
}
