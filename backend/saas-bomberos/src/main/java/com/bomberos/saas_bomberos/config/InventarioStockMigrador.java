package com.bomberos.saas_bomberos.config;

import com.bomberos.saas_bomberos.entity.Equipo;
import com.bomberos.saas_bomberos.entity.EquipoSeguimiento;
import com.bomberos.saas_bomberos.entity.EquipoStock;
import com.bomberos.saas_bomberos.repository.EquipoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

// Migración automática al modelo de stock por ubicación: los equipos
// POR_CANTIDAD creados antes del cambio guardaban una única cantidad,
// estado y ubicación en el propio equipo. Este runner los convierte en
// su primera línea de stock. Idempotente: solo toca equipos que tienen
// cantidad legada y ninguna línea todavía.
@Component
@RequiredArgsConstructor
public class InventarioStockMigrador implements CommandLineRunner {

    private final EquipoRepository equipoRepository;

    @Override
    public void run(String... args) {
        for (Equipo equipo : equipoRepository.findAll()) {
            if (equipo.getSeguimiento() != EquipoSeguimiento.POR_CANTIDAD) continue;
            if (!equipo.getStock().isEmpty()) continue;
            if (equipo.getCantidad() == null || equipo.getCantidad() <= 0) continue;

            EquipoStock linea = new EquipoStock();
            linea.setCantidad(equipo.getCantidad());
            linea.setEstado(equipo.getEstado());
            linea.setUbicacion(equipo.getUbicacion());
            equipo.getStock().add(linea);
            equipoRepository.save(equipo);
        }
    }
}
