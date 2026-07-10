package com.bomberos.saas_bomberos.repository;

import com.bomberos.saas_bomberos.entity.UbicacionEquipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UbicacionEquipoRepository extends JpaRepository<UbicacionEquipo, Long> {
    List<UbicacionEquipo> findByActivoTrueOrderByNombreAsc();

    // Lista (no Optional): puede haber varias filas con el mismo nombre
    // si el usuario eliminó una ubicación base y creó otra igual.
    List<UbicacionEquipo> findByNombreIgnoreCase(String nombre);
}
