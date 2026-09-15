package com.bomberos.saas_bomberos.repository;

import com.bomberos.saas_bomberos.entity.ConfiguracionCuerpo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfiguracionCuerpoRepository extends JpaRepository<ConfiguracionCuerpo, Long> {
}
