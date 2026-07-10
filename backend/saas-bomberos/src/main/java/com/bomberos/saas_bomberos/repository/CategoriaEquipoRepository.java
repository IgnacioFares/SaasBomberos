package com.bomberos.saas_bomberos.repository;

import com.bomberos.saas_bomberos.entity.CategoriaEquipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoriaEquipoRepository extends JpaRepository<CategoriaEquipo, Long> {
    List<CategoriaEquipo> findByActivoTrueOrderByNombreAsc();

    // Lista (no Optional): puede haber varias filas con el mismo nombre
    // si el usuario eliminó una categoría base y creó otra igual.
    List<CategoriaEquipo> findByNombreIgnoreCaseAndPadreIsNull(String nombre);

    boolean existsByPadreIdAndActivoTrue(Long padreId);
}
