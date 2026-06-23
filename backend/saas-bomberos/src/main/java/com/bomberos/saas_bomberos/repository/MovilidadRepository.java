package com.bomberos.saas_bomberos.repository;

import com.bomberos.saas_bomberos.entity.Movilidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MovilidadRepository extends JpaRepository<Movilidad, Long> {

    List<Movilidad> findByActivoTrue();

    Optional<Movilidad> findByNumeroMovil(String numeroMovil);

    boolean existsByNumeroMovil(String numeroMovil);

    boolean existsByPatente(String patente);
}