package com.bomberos.saas_bomberos.repository;

import com.bomberos.saas_bomberos.entity.Bombero;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BomberoRepository extends JpaRepository<Bombero, Long> {

    List<Bombero> findByActivoTrue();

    Optional<Bombero> findByDni(String dni);

    boolean existsByDni(String dni);

    boolean existsByEmail(String email);
}