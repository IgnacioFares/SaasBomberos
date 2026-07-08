package com.bomberos.saas_bomberos.repository;

import com.bomberos.saas_bomberos.entity.CategoriaEquipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaEquipoRepository extends JpaRepository<CategoriaEquipo, Long> {
    List<CategoriaEquipo> findByActivoTrueOrderByNombreAsc();

    Optional<CategoriaEquipo> findByNombreIgnoreCaseAndPadreIsNull(String nombre);

    boolean existsByPadreIdAndActivoTrue(Long padreId);
}
