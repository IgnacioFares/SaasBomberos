package com.bomberos.saas_bomberos.repository;

import com.bomberos.saas_bomberos.entity.EquipoMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EquipoMovimientoRepository extends JpaRepository<EquipoMovimiento, Long> {
    List<EquipoMovimiento> findByEquipoIdOrderByFechaDescIdDesc(Long equipoId);
}
