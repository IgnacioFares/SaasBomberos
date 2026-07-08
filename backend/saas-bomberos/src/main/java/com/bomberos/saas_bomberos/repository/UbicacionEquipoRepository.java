package com.bomberos.saas_bomberos.repository;

import com.bomberos.saas_bomberos.entity.UbicacionEquipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UbicacionEquipoRepository extends JpaRepository<UbicacionEquipo, Long> {
    List<UbicacionEquipo> findByActivoTrueOrderByNombreAsc();

    Optional<UbicacionEquipo> findByNombreIgnoreCase(String nombre);
}
