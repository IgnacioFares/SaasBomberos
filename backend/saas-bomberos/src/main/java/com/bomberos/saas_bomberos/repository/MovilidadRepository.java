package com.bomberos.saas_bomberos.repository;

import com.bomberos.saas_bomberos.entity.Movilidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MovilidadRepository extends JpaRepository<Movilidad, Long> {

    List<Movilidad> findByActivoTrue();

    boolean existsByPatente(String patente);
}