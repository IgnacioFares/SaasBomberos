package com.bomberos.saas_bomberos.repository;

import com.bomberos.saas_bomberos.entity.Parte;
import com.bomberos.saas_bomberos.entity.ParteEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ParteRepository extends JpaRepository<Parte, Long> {

    List<Parte> findAllByOrderByFechaHechoDescIdDesc();

    // Partes ya numerados de un mes, en el mismo orden cronológico que usa
    // la numeración (ver ParteService#finalizar): por fecha del hecho y,
    // dentro del mismo día, por hora de salida.
    @Query("SELECT p FROM Parte p WHERE p.estado = :estado AND p.fechaHecho BETWEEN :inicioMes AND :finMes "
            + "ORDER BY p.fechaHecho ASC, p.datosPrimordiales.horaSalida ASC, p.id ASC")
    List<Parte> findDelMesOrdenados(@Param("estado") ParteEstado estado,
                                     @Param("inicioMes") LocalDate inicioMes,
                                     @Param("finMes") LocalDate finMes);
}
