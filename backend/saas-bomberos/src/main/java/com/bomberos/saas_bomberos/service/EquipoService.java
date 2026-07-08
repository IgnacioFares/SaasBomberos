package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.dto.EquipoAccionDto;
import com.bomberos.saas_bomberos.dto.EquipoMovimientoResponse;
import com.bomberos.saas_bomberos.dto.EquipoRequest;
import com.bomberos.saas_bomberos.dto.EquipoResponse;
import com.bomberos.saas_bomberos.entity.CategoriaEquipo;
import com.bomberos.saas_bomberos.entity.Equipo;
import com.bomberos.saas_bomberos.entity.EquipoEstado;
import com.bomberos.saas_bomberos.entity.EquipoMovimiento;
import com.bomberos.saas_bomberos.entity.EquipoMovimientoTipo;
import com.bomberos.saas_bomberos.entity.EquipoSeguimiento;
import com.bomberos.saas_bomberos.entity.EquipoUnidad;
import com.bomberos.saas_bomberos.entity.UbicacionEquipo;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.repository.CategoriaEquipoRepository;
import com.bomberos.saas_bomberos.repository.EquipoMovimientoRepository;
import com.bomberos.saas_bomberos.repository.EquipoRepository;
import com.bomberos.saas_bomberos.repository.UbicacionEquipoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EquipoService {

    private static final int DIAS_ALERTA_VENCIMIENTO = 30;

    private final EquipoRepository equipoRepository;
    private final CategoriaEquipoRepository categoriaRepository;
    private final UbicacionEquipoRepository ubicacionRepository;
    private final EquipoMovimientoRepository movimientoRepository;

    // ------------------------------------------------------------------
    // Consultas
    // ------------------------------------------------------------------

    public List<EquipoResponse> obtenerTodos() {
        return equipoRepository.findByActivoTrueOrderByNombreAsc().stream()
                .map(this::mapear)
                .toList();
    }

    public EquipoResponse obtenerPorId(Long id) {
        return mapear(obtenerEntidad(id));
    }

    public List<EquipoMovimientoResponse> obtenerMovimientos(Long id) {
        obtenerEntidad(id);
        return movimientoRepository.findByEquipoIdOrderByFechaDescIdDesc(id).stream()
                .map(m -> new EquipoMovimientoResponse(
                        m.getId(),
                        m.getTipo().name(),
                        m.getDetalle(),
                        m.getUnidadNumero(),
                        nombreCompleto(m.getRealizadoPor()),
                        m.getFecha()))
                .toList();
    }

    // ------------------------------------------------------------------
    // Alta / edición / baja
    // ------------------------------------------------------------------

    public EquipoResponse crear(EquipoRequest request, Usuario usuario) {
        exigirPermiso(usuario, "crear");

        Equipo equipo = new Equipo();
        EquipoSeguimiento seguimiento = parsearSeguimiento(request.seguimiento());
        equipo.setSeguimiento(seguimiento);
        aplicarDatos(equipo, request);

        String detalleAlta = "Alta de equipo";
        if (seguimiento == EquipoSeguimiento.POR_UNIDAD) {
            Integer cantidadUnidades = request.cantidadUnidades();
            if (cantidadUnidades == null || cantidadUnidades < 1) {
                throw new RuntimeException("Indicá cuántas unidades se dan de alta (mínimo 1)");
            }
            for (int i = 1; i <= cantidadUnidades; i++) {
                EquipoUnidad unidad = new EquipoUnidad();
                unidad.setNumero(i);
                unidad.setEstado(equipo.getEstado());
                unidad.setUbicacion(equipo.getUbicacion());
                equipo.getUnidades().add(unidad);
            }
            detalleAlta += " con " + cantidadUnidades + " unidades";
        }

        Equipo guardado = equipoRepository.save(equipo);
        registrar(guardado, null, EquipoMovimientoTipo.ALTA, detalleAlta, usuario);
        return mapear(guardado);
    }

    public EquipoResponse actualizar(Long id, EquipoRequest request, Usuario usuario) {
        exigirPermiso(usuario, "editar");
        Equipo equipo = obtenerEntidad(id);

        if (request.seguimiento() != null
                && parsearSeguimiento(request.seguimiento()) != equipo.getSeguimiento()) {
            throw new RuntimeException("El tipo de seguimiento no puede cambiarse después del alta");
        }

        // Los cambios de estado/ubicación hechos desde el formulario de
        // edición también quedan en el historial, igual que las acciones
        // rápidas, para que la trazabilidad no tenga agujeros.
        EquipoEstado estadoAnterior = equipo.getEstado();
        UbicacionEquipo ubicacionAnterior = equipo.getUbicacion();
        Integer cantidadAnterior = equipo.getCantidad();

        aplicarDatos(equipo, request);
        Equipo guardado = equipoRepository.save(equipo);

        if (equipo.getSeguimiento() == EquipoSeguimiento.POR_CANTIDAD) {
            if (estadoAnterior != guardado.getEstado()) {
                registrar(guardado, null, EquipoMovimientoTipo.CAMBIO_ESTADO,
                        etiqueta(estadoAnterior) + " → " + etiqueta(guardado.getEstado()), usuario);
            }
            if (!mismaUbicacion(ubicacionAnterior, guardado.getUbicacion())) {
                registrar(guardado, null, EquipoMovimientoTipo.CAMBIO_UBICACION,
                        nombreUbicacion(ubicacionAnterior) + " → " + nombreUbicacion(guardado.getUbicacion()),
                        usuario);
            }
        }

        String detalle = "Datos actualizados";
        if (equipo.getSeguimiento() == EquipoSeguimiento.POR_CANTIDAD
                && cantidadAnterior != null
                && !cantidadAnterior.equals(guardado.getCantidad())) {
            detalle = "Cantidad: " + cantidadAnterior + " → " + guardado.getCantidad();
        }
        registrar(guardado, null, EquipoMovimientoTipo.ACTUALIZACION, detalle, usuario);

        return mapear(guardado);
    }

    public void eliminar(Long id, Usuario usuario) {
        exigirPermiso(usuario, "eliminar");
        Equipo equipo = obtenerEntidad(id);
        equipo.setActivo(false);
        equipoRepository.save(equipo);
        registrar(equipo, null, EquipoMovimientoTipo.BAJA, "Equipo dado de baja del inventario", usuario);
    }

    // ------------------------------------------------------------------
    // Acciones rápidas (equipo o unidad puntual)
    // ------------------------------------------------------------------

    public EquipoResponse cambiarEstado(Long id, EquipoAccionDto.CambioEstadoRequest request, Usuario usuario) {
        exigirPermiso(usuario, "editar");
        Equipo equipo = obtenerEntidad(id);
        EquipoEstado nuevo = parsearEstado(request.estado());
        if (nuevo == null) {
            throw new RuntimeException("Indicá el nuevo estado");
        }

        if (request.unidadId() != null) {
            EquipoUnidad unidad = obtenerUnidad(equipo, request.unidadId());
            EquipoEstado anterior = unidad.getEstado();
            unidad.setEstado(nuevo);
            equipoRepository.save(equipo);
            registrar(equipo, unidad.getNumero(), EquipoMovimientoTipo.CAMBIO_ESTADO,
                    conNota(etiqueta(anterior) + " → " + etiqueta(nuevo), request.nota()), usuario);
        } else {
            exigirEquipoPorCantidad(equipo, "el estado");
            EquipoEstado anterior = equipo.getEstado();
            equipo.setEstado(nuevo);
            equipoRepository.save(equipo);
            registrar(equipo, null, EquipoMovimientoTipo.CAMBIO_ESTADO,
                    conNota(etiqueta(anterior) + " → " + etiqueta(nuevo), request.nota()), usuario);
        }
        return mapear(equipo);
    }

    public EquipoResponse cambiarUbicacion(Long id, EquipoAccionDto.CambioUbicacionRequest request, Usuario usuario) {
        exigirPermiso(usuario, "editar");
        Equipo equipo = obtenerEntidad(id);
        UbicacionEquipo nueva = request.ubicacionId() != null ? obtenerUbicacion(request.ubicacionId()) : null;
        if (nueva == null) {
            throw new RuntimeException("Indicá la nueva ubicación");
        }

        if (request.unidadId() != null) {
            EquipoUnidad unidad = obtenerUnidad(equipo, request.unidadId());
            UbicacionEquipo anterior = unidad.getUbicacion();
            unidad.setUbicacion(nueva);
            equipoRepository.save(equipo);
            registrar(equipo, unidad.getNumero(), EquipoMovimientoTipo.CAMBIO_UBICACION,
                    conNota(nombreUbicacion(anterior) + " → " + nueva.getNombre(), request.nota()), usuario);
        } else {
            exigirEquipoPorCantidad(equipo, "la ubicación");
            UbicacionEquipo anterior = equipo.getUbicacion();
            equipo.setUbicacion(nueva);
            equipoRepository.save(equipo);
            registrar(equipo, null, EquipoMovimientoTipo.CAMBIO_UBICACION,
                    conNota(nombreUbicacion(anterior) + " → " + nueva.getNombre(), request.nota()), usuario);
        }
        return mapear(equipo);
    }

    public EquipoResponse agregarObservacion(Long id, EquipoAccionDto.ObservacionRequest request, Usuario usuario) {
        exigirPermiso(usuario, "editar");
        Equipo equipo = obtenerEntidad(id);
        if (request.observacion() == null || request.observacion().isBlank()) {
            throw new RuntimeException("La observación no puede estar vacía");
        }
        String texto = request.observacion().trim();

        Integer unidadNumero = null;
        if (request.unidadId() != null) {
            EquipoUnidad unidad = obtenerUnidad(equipo, request.unidadId());
            unidad.setObservacion(texto);
            unidadNumero = unidad.getNumero();
        } else {
            equipo.setObservaciones(texto);
        }
        equipoRepository.save(equipo);
        registrar(equipo, unidadNumero, EquipoMovimientoTipo.OBSERVACION, texto, usuario);
        return mapear(equipo);
    }

    public EquipoResponse actualizarUnidad(Long id, Long unidadId,
                                           EquipoAccionDto.UnidadUpdateRequest request, Usuario usuario) {
        exigirPermiso(usuario, "editar");
        Equipo equipo = obtenerEntidad(id);
        EquipoUnidad unidad = obtenerUnidad(equipo, unidadId);
        unidad.setNumeroSerie(vacioANull(request.numeroSerie()));
        unidad.setFechaVencimiento(request.fechaVencimiento());
        equipoRepository.save(equipo);
        registrar(equipo, unidad.getNumero(), EquipoMovimientoTipo.ACTUALIZACION,
                "Datos de la unidad actualizados", usuario);
        return mapear(equipo);
    }

    // ------------------------------------------------------------------
    // Internos
    // ------------------------------------------------------------------

    private void aplicarDatos(Equipo equipo, EquipoRequest request) {
        if (request.nombre() == null || request.nombre().isBlank()) {
            throw new RuntimeException("El nombre del equipo es obligatorio");
        }
        if (request.categoriaId() == null) {
            throw new RuntimeException("Tenés que elegir una categoría");
        }

        CategoriaEquipo categoria = categoriaRepository.findById(request.categoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        if (categoria.getPadre() != null) {
            throw new RuntimeException("La categoría principal no puede ser una subcategoría");
        }

        CategoriaEquipo subcategoria = null;
        if (request.subcategoriaId() != null) {
            subcategoria = categoriaRepository.findById(request.subcategoriaId())
                    .orElseThrow(() -> new RuntimeException("Subcategoría no encontrada"));
            if (subcategoria.getPadre() == null
                    || !subcategoria.getPadre().getId().equals(categoria.getId())) {
                throw new RuntimeException("La subcategoría no pertenece a la categoría elegida");
            }
        }

        if (equipo.getSeguimiento() == EquipoSeguimiento.POR_CANTIDAD) {
            if (request.cantidad() == null || request.cantidad() < 0) {
                throw new RuntimeException("Indicá una cantidad válida (0 o más)");
            }
            equipo.setCantidad(request.cantidad());
        }

        equipo.setNombre(request.nombre().trim());
        equipo.setCodigoInterno(vacioANull(request.codigoInterno()));
        equipo.setCategoria(categoria);
        equipo.setSubcategoria(subcategoria);
        equipo.setDescripcion(vacioANull(request.descripcion()));
        equipo.setMarca(vacioANull(request.marca()));
        equipo.setModelo(vacioANull(request.modelo()));
        equipo.setNumeroSerie(vacioANull(request.numeroSerie()));
        equipo.setUnidadMedida(vacioANull(request.unidadMedida()));
        EquipoEstado estado = parsearEstado(request.estado());
        if (estado != null) {
            equipo.setEstado(estado);
        }
        equipo.setUbicacion(request.ubicacionId() != null ? obtenerUbicacion(request.ubicacionId()) : null);
        equipo.setFechaCompra(request.fechaCompra());
        equipo.setFechaVencimiento(request.fechaVencimiento());
        equipo.setObservaciones(vacioANull(request.observaciones()));
    }

    private void registrar(Equipo equipo, Integer unidadNumero, EquipoMovimientoTipo tipo,
                           String detalle, Usuario usuario) {
        EquipoMovimiento movimiento = new EquipoMovimiento();
        movimiento.setEquipo(equipo);
        movimiento.setUnidadNumero(unidadNumero);
        movimiento.setTipo(tipo);
        movimiento.setDetalle(detalle);
        movimiento.setRealizadoPor(usuario);
        movimientoRepository.save(movimiento);
    }

    private Equipo obtenerEntidad(Long id) {
        return equipoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));
    }

    private EquipoUnidad obtenerUnidad(Equipo equipo, Long unidadId) {
        return equipo.getUnidades().stream()
                .filter(u -> u.getId().equals(unidadId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Unidad no encontrada en este equipo"));
    }

    private UbicacionEquipo obtenerUbicacion(Long id) {
        return ubicacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ubicación no encontrada"));
    }

    private void exigirEquipoPorCantidad(Equipo equipo, String que) {
        if (equipo.getSeguimiento() == EquipoSeguimiento.POR_UNIDAD) {
            throw new RuntimeException(
                    "Este equipo se gestiona por unidades: indicá a qué unidad cambiarle " + que);
        }
    }

    private EquipoSeguimiento parsearSeguimiento(String valor) {
        if (valor == null || valor.isBlank()) return EquipoSeguimiento.POR_CANTIDAD;
        try {
            return EquipoSeguimiento.valueOf(valor);
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Tipo de seguimiento desconocido: " + valor);
        }
    }

    private EquipoEstado parsearEstado(String valor) {
        if (valor == null || valor.isBlank()) return null;
        try {
            return EquipoEstado.valueOf(valor);
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Estado desconocido: " + valor);
        }
    }

    // Ver comentario en CategoriaEquipoService: autorización deshabilitada
    // a propósito por ahora, punto único para reactivarla.
    @SuppressWarnings("unused")
    private void exigirPermiso(Usuario usuario, String accion) {
        // Sin restricciones por ahora.
    }

    // ------------------------------------------------------------------
    // Mapeo a DTO
    // ------------------------------------------------------------------

    private EquipoResponse mapear(Equipo e) {
        boolean porUnidad = e.getSeguimiento() == EquipoSeguimiento.POR_UNIDAD;

        List<EquipoUnidad> unidadesActivas = e.getUnidades().stream()
                .filter(EquipoUnidad::getActivo)
                .toList();

        Integer cantidad;
        Map<String, Integer> unidadesPorEstado = null;
        if (porUnidad) {
            cantidad = (int) unidadesActivas.stream()
                    .filter(u -> u.getEstado() != EquipoEstado.DADO_DE_BAJA)
                    .count();
            unidadesPorEstado = new LinkedHashMap<>();
            for (EquipoUnidad u : unidadesActivas) {
                unidadesPorEstado.merge(u.getEstado().name(), 1, Integer::sum);
            }
        } else {
            cantidad = e.getCantidad();
        }

        // Peor caso entre el vencimiento del equipo y el de sus unidades,
        // para que la tabla alerte sin abrir el detalle.
        String estadoVencimiento = estadoVencimiento(e.getFechaVencimiento());
        List<EquipoResponse.UnidadResponse> unidades = new ArrayList<>();
        for (EquipoUnidad u : unidadesActivas) {
            String estadoVencimientoUnidad = estadoVencimiento(u.getFechaVencimiento());
            estadoVencimiento = peorVencimiento(estadoVencimiento, estadoVencimientoUnidad);
            unidades.add(new EquipoResponse.UnidadResponse(
                    u.getId(),
                    u.getNumero(),
                    u.getNumeroSerie(),
                    u.getEstado().name(),
                    u.getUbicacion() != null ? u.getUbicacion().getId() : null,
                    u.getUbicacion() != null ? u.getUbicacion().getNombre() : null,
                    u.getFechaVencimiento(),
                    estadoVencimientoUnidad,
                    u.getObservacion()));
        }

        return new EquipoResponse(
                e.getId(),
                e.getNombre(),
                e.getCodigoInterno(),
                e.getCategoria().getId(),
                e.getCategoria().getNombre(),
                e.getSubcategoria() != null ? e.getSubcategoria().getId() : null,
                e.getSubcategoria() != null ? e.getSubcategoria().getNombre() : null,
                e.getDescripcion(),
                e.getMarca(),
                e.getModelo(),
                e.getNumeroSerie(),
                e.getSeguimiento().name(),
                cantidad,
                e.getUnidadMedida(),
                e.getEstado().name(),
                e.getUbicacion() != null ? e.getUbicacion().getId() : null,
                e.getUbicacion() != null ? e.getUbicacion().getNombre() : null,
                e.getFechaCompra(),
                e.getFechaVencimiento(),
                estadoVencimiento,
                e.getObservaciones(),
                unidadesPorEstado,
                unidades,
                e.getCreatedAt()
        );
    }

    private String estadoVencimiento(LocalDate fecha) {
        if (fecha == null) return "SIN_VENCIMIENTO";
        LocalDate hoy = LocalDate.now();
        if (fecha.isBefore(hoy)) return "VENCIDO";
        if (!fecha.isAfter(hoy.plusDays(DIAS_ALERTA_VENCIMIENTO))) return "POR_VENCER";
        return "VIGENTE";
    }

    // VENCIDO > POR_VENCER > VIGENTE > SIN_VENCIMIENTO
    private String peorVencimiento(String a, String b) {
        List<String> orden = List.of("SIN_VENCIMIENTO", "VIGENTE", "POR_VENCER", "VENCIDO");
        return orden.indexOf(a) >= orden.indexOf(b) ? a : b;
    }

    private String etiqueta(EquipoEstado estado) {
        return switch (estado) {
            case EN_SERVICIO -> "En servicio";
            case EN_DEPOSITO -> "En depósito";
            case EN_MANTENIMIENTO -> "En mantenimiento";
            case EN_REPARACION -> "En reparación";
            case FUERA_DE_SERVICIO -> "Fuera de servicio";
            case DADO_DE_BAJA -> "Dado de baja";
        };
    }

    private String nombreUbicacion(UbicacionEquipo ubicacion) {
        return ubicacion != null ? ubicacion.getNombre() : "Sin ubicación";
    }

    private boolean mismaUbicacion(UbicacionEquipo a, UbicacionEquipo b) {
        Long idA = a != null ? a.getId() : null;
        Long idB = b != null ? b.getId() : null;
        return idA == null ? idB == null : idA.equals(idB);
    }

    private String conNota(String detalle, String nota) {
        return (nota != null && !nota.isBlank()) ? detalle + " — " + nota.trim() : detalle;
    }

    private String vacioANull(String valor) {
        return (valor == null || valor.isBlank()) ? null : valor.trim();
    }

    private String nombreCompleto(Usuario usuario) {
        return usuario.getBombero().getNombre() + " " + usuario.getBombero().getApellido();
    }
}
