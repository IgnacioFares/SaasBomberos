package com.bomberos.saas_bomberos.config;

import com.bomberos.saas_bomberos.entity.Permiso;
import com.bomberos.saas_bomberos.entity.Rol;
import com.bomberos.saas_bomberos.repository.PermisoRepository;
import com.bomberos.saas_bomberos.repository.RolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

// UsuarioService.registrar() depende de que exista un rol "Usuario
// Estándar" para asignárselo a cada cuenta nueva, pero esa fila nunca
// se creaba desde código: alguien la había insertado a mano. Si la
// base se recrea o se pierde esa fila, el registro queda roto con
// "Rol por defecto no configurado". Este seeder la recrea al arrancar
// si hace falta, de forma idempotente (no hace nada si ya existe).
//
// También asegura que exista un rol "Administrador" con permisos
// ampliados, para poder promover manualmente una cuenta vía
// PUT /api/usuarios/{id}/rol.
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    public static final String ROL_ESTANDAR = "Usuario Estándar";
    public static final String ROL_ADMIN = "Administrador";

    private final RolRepository rolRepository;
    private final PermisoRepository permisoRepository;

    // Transaccional: el runner corre fuera de una request web, sin
    // sesión de Hibernate; sin esto, tocar la colección lazy
    // rol.getPermisos() lanza LazyInitializationException.
    @Override
    @Transactional
    public void run(String... args) {
        if (rolRepository.findByNombre(ROL_ESTANDAR).isEmpty()) {
            Rol rolEstandar = new Rol();
            rolEstandar.setNombre(ROL_ESTANDAR);
            rolEstandar.setDescripcion("Rol básico asignado automáticamente al registrarse");
            // HashSet mutable (no Set.of): más abajo se le agregan los
            // permisos del catálogo a la colección del rol.
            rolEstandar.setPermisos(new HashSet<>(Set.of(
                    obtenerOCrearPermiso("ver_bomberos"),
                    obtenerOCrearPermiso("ver_movilidades")
            )));
            rolRepository.save(rolEstandar);
        }

        if (rolRepository.findByNombre(ROL_ADMIN).isEmpty()) {
            Rol rolAdmin = new Rol();
            rolAdmin.setNombre(ROL_ADMIN);
            rolAdmin.setDescripcion("Acceso completo al sistema");
            rolAdmin.setPermisos(new HashSet<>(Set.of(
                    obtenerOCrearPermiso("ver_bomberos"),
                    obtenerOCrearPermiso("ver_movilidades"),
                    obtenerOCrearPermiso("administrar_bomberos"),
                    obtenerOCrearPermiso("administrar_movilidades"),
                    obtenerOCrearPermiso("administrar_usuarios"),
                    obtenerOCrearPermiso("administrar_roles")
            )));
            rolRepository.save(rolAdmin);
        }

        // Crea las filas de los permisos funcionales del catálogo (los
        // que el admin otorga por usuario desde el panel) y se los
        // asocia al rol Administrador. Idempotente.
        rolRepository.findByNombre(ROL_ADMIN).ifPresent(rolAdmin -> {
            boolean cambio = false;
            for (PermisosCatalogo.PermisoDef def : PermisosCatalogo.CATALOGO) {
                Permiso permiso = obtenerOCrearPermiso(def.nombre());
                if (rolAdmin.getPermisos().add(permiso)) {
                    cambio = true;
                }
            }
            if (cambio) {
                rolRepository.save(rolAdmin);
            }
        });
    }

    private Permiso obtenerOCrearPermiso(String nombre) {
        return permisoRepository.findByNombre(nombre)
                .orElseGet(() -> {
                    Permiso permiso = new Permiso();
                    permiso.setNombre(nombre);
                    return permisoRepository.save(permiso);
                });
    }
}
