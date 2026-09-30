package com.bomberos.saas_bomberos.repository;

import com.bomberos.saas_bomberos.entity.DespachoPosicion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DespachoPosicionRepository extends JpaRepository<DespachoPosicion, Long> {

    // Todo el recorrido del despacho, en orden cronológico. Se agrupa
    // por persona en el service para armar la respuesta del mapa.
    List<DespachoPosicion> findByDespachoIdOrderByRegistradoEnAsc(Long despachoId);

    // Último ping de una persona: se usa para descartar pings demasiado
    // seguidos y no llenar la tabla.
    Optional<DespachoPosicion> findFirstByDespachoIdAndUsuarioIdOrderByRegistradoEnDesc(
            Long despachoId, Long usuarioId);

    // Cuánta gente está transmitiendo ahora mismo en un despacho.
    @Query("select count(distinct p.usuario.id) from DespachoPosicion p "
            + "where p.despacho.id = :despachoId and p.registradoEn >= :desde")
    long contarEnVivo(@Param("despachoId") Long despachoId, @Param("desde") LocalDateTime desde);

    void deleteByDespachoId(Long despachoId);
}
