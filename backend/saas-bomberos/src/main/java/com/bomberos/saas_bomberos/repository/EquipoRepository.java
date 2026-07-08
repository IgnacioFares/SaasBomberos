package com.bomberos.saas_bomberos.repository;

import com.bomberos.saas_bomberos.entity.Equipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EquipoRepository extends JpaRepository<Equipo, Long> {
    List<Equipo> findByActivoTrueOrderByNombreAsc();

    boolean existsByCategoriaIdAndActivoTrue(Long categoriaId);

    boolean existsBySubcategoriaIdAndActivoTrue(Long subcategoriaId);
}
