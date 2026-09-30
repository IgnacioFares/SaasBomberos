package com.bomberos.saas_bomberos.repository;

import com.bomberos.saas_bomberos.entity.Despacho;
import com.bomberos.saas_bomberos.entity.DespachoEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DespachoRepository extends JpaRepository<Despacho, Long> {

    List<Despacho> findByEstadoOrderByIniciadoEnDesc(DespachoEstado estado);

    List<Despacho> findAllByOrderByIniciadoEnDesc();

    // Una movilidad no puede estar despachada dos veces a la vez.
    boolean existsByMovilidadIdAndEstado(Long movilidadId, DespachoEstado estado);

    // Si otra salida encadenó con esta, la movilidad no volvió al
    // cuartel desde acá: el tramo de vuelta lo aporta aquella.
    boolean existsByDespachoAnteriorId(Long despachoId);

    // Última salida de una movilidad que terminó en un punto conocido:
    // es el origen sugerido si sale de nuevo sin pasar por el cuartel.
    Optional<Despacho> findFirstByMovilidadIdAndDestinoLatIsNotNullAndDestinoLngIsNotNullOrderByIniciadoEnDesc(
            Long movilidadId);
}
