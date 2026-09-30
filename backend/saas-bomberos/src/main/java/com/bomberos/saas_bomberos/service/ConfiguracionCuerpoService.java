package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.dto.ConfiguracionCuerpoRequest;
import com.bomberos.saas_bomberos.dto.ConfiguracionCuerpoResponse;
import com.bomberos.saas_bomberos.entity.ConfiguracionCuerpo;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.repository.ConfiguracionCuerpoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Fila única de configuración institucional (jefe de cuerpo actual,
// etc.) que va en el pie de los partes de intervención. Se crea con
// valores por defecto la primera vez que se pide.
@Service
@Transactional
@RequiredArgsConstructor
public class ConfiguracionCuerpoService {

    private static final Long ID_UNICO = 1L;

    private final ConfiguracionCuerpoRepository repository;
    private final AutorizacionService autorizacion;

    public ConfiguracionCuerpo obtenerEntidad() {
        ConfiguracionCuerpo config = repository.findById(ID_UNICO)
                .orElseGet(() -> repository.save(new ConfiguracionCuerpo()));
        completarBasePorDefecto(config);
        return config;
    }

    // La fila de configuración puede venir de antes de que existiera el
    // punto de partida: en la base de datos esas columnas quedan en
    // null y sin ellas no se puede estimar ningún recorrido. Se
    // completan con el cuartel por defecto, que es lo que valía hasta
    // que alguien lo cambie desde el panel.
    private void completarBasePorDefecto(ConfiguracionCuerpo config) {
        if (config.getBaseLat() != null && config.getBaseLng() != null) return;
        ConfiguracionCuerpo valoresPorDefecto = new ConfiguracionCuerpo();
        if (config.getBaseNombre() == null || config.getBaseNombre().isBlank()) {
            config.setBaseNombre(valoresPorDefecto.getBaseNombre());
        }
        config.setBaseLat(valoresPorDefecto.getBaseLat());
        config.setBaseLng(valoresPorDefecto.getBaseLng());
    }

    public ConfiguracionCuerpoResponse obtener() {
        return mapear(obtenerEntidad());
    }

    public ConfiguracionCuerpoResponse actualizar(ConfiguracionCuerpoRequest request, Usuario usuario) {
        autorizacion.exigirAdministrador(usuario);
        ConfiguracionCuerpo config = obtenerEntidad();
        config.setNombreCuerpo(request.nombreCuerpo());
        config.setJefeDeCuerpo(request.jefeDeCuerpo());
        config.setDepartamentoElaboracion(request.departamentoElaboracion());
        // El punto de partida es opcional en el request: si no viene, se
        // conserva el que ya estaba en vez de dejar la base sin ubicar.
        if (request.baseNombre() != null) config.setBaseNombre(request.baseNombre());
        if (request.baseLat() != null) config.setBaseLat(request.baseLat());
        if (request.baseLng() != null) config.setBaseLng(request.baseLng());
        return mapear(repository.save(config));
    }

    private ConfiguracionCuerpoResponse mapear(ConfiguracionCuerpo config) {
        return new ConfiguracionCuerpoResponse(
                config.getNombreCuerpo(),
                config.getJefeDeCuerpo(),
                config.getDepartamentoElaboracion(),
                config.getBaseNombre(),
                config.getBaseLat(),
                config.getBaseLng());
    }
}
