package com.bomberos.saas_bomberos.config;

import java.util.List;

// Catálogo de permisos funcionales del sistema. El administrador los
// otorga o quita por usuario desde el panel de administración; el rol
// Administrador los tiene todos implícitamente (ver AutorizacionService).
public final class PermisosCatalogo {

    public record PermisoDef(String nombre, String etiqueta, String descripcion) {}

    public static final String GESTIONAR_MOVILIDADES = "gestionar_movilidades";
    public static final String CREAR_CHECKLISTS = "crear_checklists";
    public static final String FIRMAR_CHECKLISTS = "firmar_checklists";
    public static final String GESTIONAR_INVENTARIO = "gestionar_inventario";
    public static final String MOVER_STOCK = "mover_stock";
    public static final String GESTIONAR_PERSONAL = "gestionar_personal";

    public static final List<PermisoDef> CATALOGO = List.of(
            new PermisoDef(GESTIONAR_MOVILIDADES, "Gestionar movilidades",
                    "Crear, editar y eliminar movilidades del cuartel"),
            new PermisoDef(CREAR_CHECKLISTS, "Crear checklists",
                    "Crear, editar y eliminar plantillas de checklist"),
            new PermisoDef(FIRMAR_CHECKLISTS, "Firmar checklists",
                    "Firmar los checklists realizados como encargado"),
            new PermisoDef(GESTIONAR_INVENTARIO, "Gestionar inventario",
                    "Dar de alta, editar y eliminar equipos, categorías y ubicaciones"),
            new PermisoDef(MOVER_STOCK, "Operar stock y unidades",
                    "Mover y ajustar stock, agregar unidades y cambiar sus estados/ubicaciones"),
            new PermisoDef(GESTIONAR_PERSONAL, "Gestionar personal",
                    "Dar de alta, editar y eliminar bomberos del cuartel")
    );

    public static PermisoDef porNombre(String nombre) {
        return CATALOGO.stream()
                .filter(p -> p.nombre().equals(nombre))
                .findFirst()
                .orElse(null);
    }

    private PermisosCatalogo() {}
}
