package com.bomberos.saas_bomberos.repository;

import com.bomberos.saas_bomberos.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.Set;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);

    // Los permisos se consultan por query (no navegando las colecciones
    // lazy del principal): el Usuario que resuelve el filtro JWT queda
    // fuera de la sesión de Hibernate y explotaría al inicializarlas.
    @Query("select p.nombre from Usuario u join u.rol r join r.permisos p where u.id = :usuarioId")
    Set<String> permisosDeRol(@Param("usuarioId") Long usuarioId);

    @Query("select p.nombre from Usuario u join u.permisosExtra p where u.id = :usuarioId")
    Set<String> permisosExtra(@Param("usuarioId") Long usuarioId);
}
