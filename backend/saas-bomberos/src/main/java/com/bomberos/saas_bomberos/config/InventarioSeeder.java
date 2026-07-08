package com.bomberos.saas_bomberos.config;

import com.bomberos.saas_bomberos.entity.CategoriaEquipo;
import com.bomberos.saas_bomberos.entity.UbicacionEquipo;
import com.bomberos.saas_bomberos.repository.CategoriaEquipoRepository;
import com.bomberos.saas_bomberos.repository.UbicacionEquipoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

// Siembra la configuración base del inventario (categorías y
// ubicaciones) de forma idempotente: solo crea lo que falta y respeta
// lo que el usuario haya renombrado o eliminado (las bajas lógicas no
// se recrean). Los equipos los carga siempre el usuario desde la UI.
@Component
@RequiredArgsConstructor
public class InventarioSeeder implements CommandLineRunner {

    private final CategoriaEquipoRepository categoriaRepository;
    private final UbicacionEquipoRepository ubicacionRepository;

    @Override
    public void run(String... args) {
        seedCategorias();
        seedUbicaciones();
    }

    private void seedCategorias() {
        List<String> raices = List.of(
                "Equipos de Protección Personal",
                "Equipos de Respiración Autónoma",
                "Herramientas Forestales",
                "Herramientas de Rescate",
                "Equipos Hidráulicos",
                "Equipamiento Médico",
                "Equipos de Comunicación",
                "Mangueras",
                "Lanzas",
                "Acoples",
                "Equipos Eléctricos",
                "Iluminación",
                "Ventilación",
                "Logística",
                "Otros"
        );
        raices.forEach(this::obtenerOCrearCategoria);

        CategoriaEquipo epp = obtenerOCrearCategoria("Equipos de Protección Personal");
        for (String sub : List.of("Cascos", "Botas", "Guantes", "Chaquetones", "Pantalones")) {
            crearSubcategoriaSiFalta(sub, epp);
        }
    }

    private void seedUbicaciones() {
        for (String nombre : List.of(
                "Depósito principal", "Sala de equipos", "Taller", "Oficina", "Móvil 1", "Móvil 2")) {
            if (ubicacionRepository.findByNombreIgnoreCase(nombre).isEmpty()) {
                UbicacionEquipo ubicacion = new UbicacionEquipo();
                ubicacion.setNombre(nombre);
                ubicacionRepository.save(ubicacion);
            }
        }
    }

    private CategoriaEquipo obtenerOCrearCategoria(String nombre) {
        return categoriaRepository.findByNombreIgnoreCaseAndPadreIsNull(nombre)
                .orElseGet(() -> {
                    CategoriaEquipo categoria = new CategoriaEquipo();
                    categoria.setNombre(nombre);
                    return categoriaRepository.save(categoria);
                });
    }

    private void crearSubcategoriaSiFalta(String nombre, CategoriaEquipo padre) {
        boolean existe = categoriaRepository.findAll().stream()
                .anyMatch(c -> c.getPadre() != null
                        && c.getPadre().getId().equals(padre.getId())
                        && c.getNombre().equalsIgnoreCase(nombre));
        if (!existe) {
            CategoriaEquipo sub = new CategoriaEquipo();
            sub.setNombre(nombre);
            sub.setPadre(padre);
            categoriaRepository.save(sub);
        }
    }
}
