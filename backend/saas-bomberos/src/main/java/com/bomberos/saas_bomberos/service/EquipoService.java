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
import com.bomberos.saas_bomberos.entity.EquipoStock;
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
import java.util.Objects;

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

        EquipoEstado estadoInicial = parsearEstado(request.estado());
        if (estadoInicial == null) estadoInicial = EquipoEstado.EN_DEPOSITO;
        equipo.setEstado(estadoInicial);
        UbicacionEquipo ubicacionInicial =
                request.ubicacionId() != null ? obtenerUbicacion(request.ubicacionId()) : null;
        equipo.setUbicacion(ubicacionInicial);

        String detalleAlta = "Alta de equipo";
        if (seguimiento == EquipoSeguimiento.POR_UNIDAD) {
            Integer cantidadUnidades = request.cantidadUnidades();
            if (cantidadUnidades == null || cantidadUnidades < 1) {
                throw new RuntimeException("Indicá cuántas unidades se dan de alta (mínimo 1)");
            }
            for (int i = 1; i <= cantidadUnidades; i++) {
                EquipoUnidad unidad = new EquipoUnidad();
                unidad.setNumero(i);
                unidad.setEstado(estadoInicial);
                unidad.setUbicacion(ubicacionInicial);
                equipo.getUnidades().add(unidad);
            }
            detalleAlta += " con " + cantidadUnidades + " unidades";
        } else {
            if (request.cantidad() == null || request.cantidad() < 0) {
                throw new RuntimeException("Indicá una cantidad válida (0 o más)");
            }
            // El stock arranca en una única línea; después se reparte
            // entre ubicaciones con "mover stock".
            if (request.cantidad() > 0) {
                EquipoStock linea = new EquipoStock();
                linea.setCantidad(request.cantidad());
                linea.setEstado(estadoInicial);
                linea.setUbicacion(ubicacionInicial);
                equipo.getStock().add(linea);
            }
            detalleAlta += " con " + request.cantidad() + " en "
                    + nombreUbicacion(ubicacionInicial);
        }

        Equipo guardado = equipoRepository.save(equipo);
        registrar(guardado, null, EquipoMovimientoTipo.ALTA, detalleAlta, usuario);
        return mapear(guardado);
    }

    // Solo edita los datos descriptivos: el stock (POR_CANTIDAD) y las
    // unidades (POR_UNIDAD) se gestionan con sus propias acciones para
    // que todo cambio quede en el historial.
    public EquipoResponse actualizar(Long id, EquipoRequest request, Usuario usuario) {
        exigirPermiso(usuario, "editar");
        Equipo equipo = obtenerEntidad(id);

        if (request.seguimiento() != null
                && parsearSeguimiento(request.seguimiento()) != equipo.getSeguimiento()) {
            throw new RuntimeException("El tipo de seguimiento no puede cambiarse después del alta");
        }

        aplicarDatos(equipo, request);
        Equipo guardado = equipoRepository.save(equipo);
        registrar(guardado, null, EquipoMovimientoTipo.ACTUALIZACION, "Datos actualizados", usuario);
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
    // Stock por ubicación (POR_CANTIDAD)
    // ------------------------------------------------------------------

    public EquipoResponse moverStock(Long id, EquipoAccionDto.MoverStockRequest request, Usuario usuario) {
        exigirPermiso(usuario, "editar");
        Equipo equipo = obtenerPorCantidad(id);

        EquipoStock origen = obtenerLinea(equipo, request.stockId());
        if (request.cantidad() == null || request.cantidad() < 1) {
            throw new RuntimeException("Indicá cuántos querés mover (mínimo 1)");
        }
        if (request.cantidad() > origen.getCantidad()) {
            throw new RuntimeException(
                    "No hay suficiente stock en el origen (hay " + origen.getCantidad() + ")");
        }

        UbicacionEquipo ubicacionDestino = request.ubicacionDestinoId() != null
                ? obtenerUbicacion(request.ubicacionDestinoId())
                : origen.getUbicacion();
        EquipoEstado estadoDestino = parsearEstado(request.estadoDestino());
        if (estadoDestino == null) estadoDestino = origen.getEstado();

        if (mismaUbicacion(origen.getUbicacion(), ubicacionDestino) && origen.getEstado() == estadoDestino) {
            throw new RuntimeException("El destino es igual al origen: no hay nada que mover");
        }

        String desde = nombreUbicacion(origen.getUbicacion()) + " (" + etiqueta(origen.getEstado()) + ")";
        String hacia = nombreUbicacion(ubicacionDestino) + " (" + etiqueta(estadoDestino) + ")";

        origen.setCantidad(origen.getCantidad() - request.cantidad());
        if (origen.getCantidad() == 0) {
            equipo.getStock().remove(origen);
        }
        sumarALinea(equipo, ubicacionDestino, estadoDestino, request.cantidad());

        equipoRepository.save(equipo);

        EquipoMovimientoTipo tipo = mismaUbicacion(origen.getUbicacion(), ubicacionDestino)
                ? EquipoMovimientoTipo.CAMBIO_ESTADO
                : EquipoMovimientoTipo.CAMBIO_UBICACION;
        registrar(equipo, null, tipo,
                conNota(request.cantidad() + " movidos: " + desde + " → " + hacia, request.nota()), usuario);
        return mapear(equipo);
    }

    public EquipoResponse ajustarStock(Long id, EquipoAccionDto.AjustarStockRequest request, Usuario usuario) {
        exigirPermiso(usuario, "editar");
        Equipo equipo = obtenerPorCantidad(id);

        if (request.cantidad() == null || request.cantidad() < 0) {
            throw new RuntimeException("Indicá una cantidad válida (0 o más)");
        }

        String detalle;
        if (request.stockId() != null) {
            EquipoStock linea = obtenerLinea(equipo, request.stockId());
            detalle = nombreUbicacion(linea.getUbicacion()) + " (" + etiqueta(linea.getEstado()) + "): "
                    + linea.getCantidad() + " → " + request.cantidad();
            if (request.cantidad() == 0) {
                equipo.getStock().remove(linea);
            } else {
                linea.setCantidad(request.cantidad());
            }
        } else {
            if (request.cantidad() == 0) {
                throw new RuntimeException("Indicá una cantidad mayor a 0 para agregar stock");
            }
            UbicacionEquipo ubicacion = request.ubicacionId() != null
                    ? obtenerUbicacion(request.ubicacionId())
                    : null;
            EquipoEstado estado = parsearEstado(request.estado());
            if (estado == null) estado = EquipoEstado.EN_DEPOSITO;
            sumarALinea(equipo, ubicacion, estado, request.cantidad());
            detalle = "+" + request.cantidad() + " en " + nombreUbicacion(ubicacion)
                    + " (" + etiqueta(estado) + ")";
        }

        equipoRepository.save(equipo);
        registrar(equipo, null, EquipoMovimientoTipo.ACTUALIZACION,
                conNota("Stock ajustado: " + detalle, request.nota()), usuario);
        return mapear(equipo);
    }

    // ------------------------------------------------------------------
    // Acciones sobre unidades individuales (POR_UNIDAD)
    // ------------------------------------------------------------------

    public EquipoResponse cambiarEstado(Long id, EquipoAccionDto.CambioEstadoRequest request, Usuario usuario) {
        exigirPermiso(usuario, "editar");
        Equipo equipo = obtenerEntidad(id);
        EquipoEstado nuevo = parsearEstado(request.estado());
        if (nuevo == null) {
            throw new RuntimeException("Indicá el nuevo estado");
        }
        EquipoUnidad unidad = obtenerUnidadRequerida(equipo, request.unidadId(), "el estado");

        EquipoEstado anterior = unidad.getEstado();
        unidad.setEstado(nuevo);
        equipoRepository.save(equipo);
        registrar(equipo, unidad.getNumero(), EquipoMovimientoTipo.CAMBIO_ESTADO,
                conNota(etiqueta(anterior) + " → " + etiqueta(nuevo), request.nota()), usuario);
        return mapear(equipo);
    }

    public EquipoResponse cambiarUbicacion(Long id, EquipoAccionDto.CambioUbicacionRequest request, Usuario usuario) {
        exigirPermiso(usuario, "editar");
        Equipo equipo = obtenerEntidad(id);
        if (request.ubicacionId() == null) {
            throw new RuntimeException("Indicá la nueva ubicación");
        }
        UbicacionEquipo nueva = obtenerUbicacion(request.ubicacionId());
        EquipoUnidad unidad = obtenerUnidadRequerida(equipo, request.unidadId(), "la ubicación");

        UbicacionEquipo anterior = unidad.getUbicacion();
        unidad.setUbicacion(nueva);
        equipoRepository.save(equipo);
        registrar(equipo, unidad.getNumero(), EquipoMovimientoTipo.CAMBIO_UBICACION,
                conNota(nombreUbicacion(anterior) + " → " + nueva.getNombre(), request.nota()), usuario);
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

    public EquipoResponse agregarUnidades(Long id, EquipoAccionDto.AgregarUnidadesRequest request, Usuario usuario) {
        exigirPermiso(usuario, "editar");
        Equipo equipo = obtenerEntidad(id);
        if (equipo.getSeguimiento() != EquipoSeguimiento.POR_UNIDAD) {
            throw new RuntimeException(
                    "Este equipo se gestiona por stock: usá \"Ajustar stock\" para sumar cantidad");
        }
        if (request.cantidad() == null || request.cantidad() < 1) {
            throw new RuntimeException("Indicá cuántas unidades agregar (mínimo 1)");
        }

        EquipoEstado estado = parsearEstado(request.estado());
        if (estado == null) estado = EquipoEstado.EN_DEPOSITO;
        UbicacionEquipo ubicacion = request.ubicacionId() != null
                ? obtenerUbicacion(request.ubicacionId())
                : null;

        int siguienteNumero = equipo.getUnidades().stream()
                .mapToInt(EquipoUnidad::getNumero)
                .max()
                .orElse(0) + 1;
        for (int i = 0; i < request.cantidad(); i++) {
            EquipoUnidad unidad = new EquipoUnidad();
            unidad.setNumero(siguienteNumero + i);
            unidad.setEstado(estado);
            unidad.setUbicacion(ubicacion);
            equipo.getUnidades().add(unidad);
        }

        equipoRepository.save(equipo);
        registrar(equipo, null, EquipoMovimientoTipo.ALTA,
                conNota("Se agregaron " + request.cantidad() + " unidades en "
                        + nombreUbicacion(ubicacion) + " (" + etiqueta(estado) + ")", request.nota()),
                usuario);
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

        equipo.setNombre(request.nombre().trim());
        equipo.setCodigoInterno(vacioANull(request.codigoInterno()));
        equipo.setCategoria(categoria);
        equipo.setSubcategoria(subcategoria);
        equipo.setDescripcion(vacioANull(request.descripcion()));
        equipo.setMarca(vacioANull(request.marca()));
        equipo.setModelo(vacioANull(request.modelo()));
        equipo.setNumeroSerie(vacioANull(request.numeroSerie()));
        equipo.setUnidadMedida(vacioANull(request.unidadMedida()));
        equipo.setFechaCompra(request.fechaCompra());
        equipo.setFechaVencimiento(request.fechaVencimiento());
        equipo.setObservaciones(vacioANull(request.observaciones()));
    }

    // Suma cantidad a la línea (ubicación, estado); la crea si no existe.
    private void sumarALinea(Equipo equipo, UbicacionEquipo ubicacion, EquipoEstado estado, int cantidad) {
        EquipoStock destino = equipo.getStock().stream()
                .filter(l -> mismaUbicacion(l.getUbicacion(), ubicacion) && l.getEstado() == estado)
                .findFirst()
                .orElse(null);
        if (destino == null) {
            destino = new EquipoStock();
            destino.setUbicacion(ubicacion);
            destino.setEstado(estado);
            destino.setCantidad(0);
            equipo.getStock().add(destino);
        }
        destino.setCantidad(destino.getCantidad() + cantidad);
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

    private Equipo obtenerPorCantidad(Long id) {
        Equipo equipo = obtenerEntidad(id);
        if (equipo.getSeguimiento() != EquipoSeguimiento.POR_CANTIDAD) {
            throw new RuntimeException(
                    "Este equipo se gestiona por unidades individuales, no por stock");
        }
        return equipo;
    }

    private EquipoStock obtenerLinea(Equipo equipo, Long stockId) {
        if (stockId == null) {
            throw new RuntimeException("Indicá desde qué línea de stock operar");
        }
        return equipo.getStock().stream()
                .filter(l -> l.getId() != null && l.getId().equals(stockId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Línea de stock no encontrada en este equipo"));
    }

    private EquipoUnidad obtenerUnidad(Equipo equipo, Long unidadId) {
        return equipo.getUnidades().stream()
                .filter(u -> u.getId().equals(unidadId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Unidad no encontrada en este equipo"));
    }

    private EquipoUnidad obtenerUnidadRequerida(Equipo equipo, Long unidadId, String que) {
        if (unidadId == null) {
            if (equipo.getSeguimiento() == EquipoSeguimiento.POR_CANTIDAD) {
                throw new RuntimeException(
                        "Este equipo se gestiona por stock: usá \"Mover stock\" para cambiar " + que);
            }
            throw new RuntimeException("Indicá a qué unidad cambiarle " + que);
        }
        return obtenerUnidad(equipo, unidadId);
    }

    private UbicacionEquipo obtenerUbicacion(Long id) {
        return ubicacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ubicación no encontrada"));
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

        Map<String, Integer> cantidadPorEstado = new LinkedHashMap<>();
        Integer cantidad;
        List<EquipoResponse.StockResponse> stock = new ArrayList<>();
        if (porUnidad) {
            cantidad = (int) unidadesActivas.stream()
                    .filter(u -> u.getEstado() != EquipoEstado.DADO_DE_BAJA)
                    .count();
            for (EquipoUnidad u : unidadesActivas) {
                cantidadPorEstado.merge(u.getEstado().name(), 1, Integer::sum);
            }
        } else {
            cantidad = e.getStock().stream().mapToInt(EquipoStock::getCantidad).sum();
            for (EquipoStock linea : e.getStock()) {
                cantidadPorEstado.merge(linea.getEstado().name(), linea.getCantidad(), Integer::sum);
                stock.add(new EquipoResponse.StockResponse(
                        linea.getId(),
                        linea.getUbicacion() != null ? linea.getUbicacion().getId() : null,
                        linea.getUbicacion() != null ? linea.getUbicacion().getNombre() : null,
                        linea.getEstado().name(),
                        linea.getCantidad()));
            }
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
                cantidadPorEstado,
                stock,
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
        return Objects.equals(idA, idB);
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
