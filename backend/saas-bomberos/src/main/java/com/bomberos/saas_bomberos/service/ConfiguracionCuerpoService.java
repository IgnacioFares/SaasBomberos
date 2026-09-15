package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.dto.ConfiguracionCuerpoRequest;
import com.bomberos.saas_bomberos.dto.ConfiguracionCuerpoResponse;
import com.bomberos.saas_bomberos.entity.ConfiguracionCuerpo;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.repository.ConfiguracionCuerpoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

// Fila única de configuración institucional (jefe de cuerpo actual,
// etc.) que va en el pie de los partes de intervención. Se crea con
// valores por defecto la primera vez que se pide.
@Service
@RequiredArgsConstructor
public class ConfiguracionCuerpoService {

    private static final Long ID_UNICO = 1L;

    private final ConfiguracionCuerpoRepository repository;
    private final AutorizacionService autorizacion;

    public ConfiguracionCuerpo obtenerEntidad() {
        return repository.findById(ID_UNICO).orElseGet(() -> repository.save(new ConfiguracionCuerpo()));
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
        return mapear(repository.save(config));
    }

    private ConfiguracionCuerpoResponse mapear(ConfiguracionCuerpo config) {
        return new ConfiguracionCuerpoResponse(
                config.getNombreCuerpo(), config.getJefeDeCuerpo(), config.getDepartamentoElaboracion());
    }
}
