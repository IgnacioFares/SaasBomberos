package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.config.PermisosCatalogo;
import com.bomberos.saas_bomberos.dto.DespachoRequest;
import com.bomberos.saas_bomberos.dto.DespachoResponse;
import com.bomberos.saas_bomberos.dto.OrigenSugeridoResponse;
import com.bomberos.saas_bomberos.dto.PosicionRequest;
import com.bomberos.saas_bomberos.dto.SeguimientoResponse;
import com.bomberos.saas_bomberos.entity.ConfiguracionCuerpo;
import com.bomberos.saas_bomberos.entity.Despacho;
import com.bomberos.saas_bomberos.entity.DespachoEstado;
import com.bomberos.saas_bomberos.entity.DespachoPosicion;
import com.bomberos.saas_bomberos.entity.Movilidad;
import com.bomberos.saas_bomberos.entity.Usuario;
import com.bomberos.saas_bomberos.repository.DespachoPosicionRepository;
import com.bomberos.saas_bomberos.repository.DespachoRepository;
import com.bomberos.saas_bomberos.repository.MovilidadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class DespachoService {

    // Si no llega un ping en este tiempo se considera que la persona
    // dejó de transmitir (cerró la pestaña, se quedó sin señal, etc.).
    private static final Duration VENTANA_EN_VIVO = Duration.ofSeconds(90);

    // El celular puede disparar el watchPosition varias veces por
    // segundo; se descartan los pings demasiado seguidos.
    private static final Duration INTERVALO_MINIMO = Duration.ofSeconds(5);

    // Tope de puntos por persona que se mandan al mapa: más que esto no
    // se distingue a simple vista y solo engorda la respuesta.
    private static final int MAX_PUNTOS_RECORRIDO = 300;

    private final DespachoRepository despachoRepository;
    private final DespachoPosicionRepository posicionRepository;
    private final MovilidadRepository movilidadRepository;
    private final ConfiguracionCuerpoService configuracionService;
    private final AutorizacionService autorizacion;

    @Transactional(readOnly = true)
    public List<DespachoResponse> obtenerTodos(boolean soloEnCurso) {
        List<Despacho> despachos = soloEnCurso
                ? despachoRepository.findByEstadoOrderByIniciadoEnDesc(DespachoEstado.EN_CURSO)
                : despachoRepository.findAllByOrderByIniciadoEnDesc();
        ConfiguracionCuerpo config = configuracionService.obtenerEntidad();
        return despachos.stream().map(d -> mapear(d, config)).toList();
    }

    @Transactional(readOnly = true)
    public DespachoResponse obtenerPorId(Long id) {
        return mapear(buscar(id), configuracionService.obtenerEntidad());
    }

    // Las dos opciones de punto de partida que se le ofrecen a quien
    // despacha: el cuartel o, si la movilidad viene de otra salida, el
    // destino de aquella.
    @Transactional(readOnly = true)
    public OrigenSugeridoResponse origenSugerido(Long movilidadId) {
        ConfiguracionCuerpo config = configuracionService.obtenerEntidad();
        OrigenSugeridoResponse.Punto base = new OrigenSugeridoResponse.Punto(
                null, config.getBaseNombre(), config.getBaseLat(), config.getBaseLng());

        OrigenSugeridoResponse.Punto ultimoDestino = despachoRepository
                .findFirstByMovilidadIdAndDestinoLatIsNotNullAndDestinoLngIsNotNullOrderByIniciadoEnDesc(movilidadId)
                .map(anterior -> new OrigenSugeridoResponse.Punto(
                        anterior.getId(),
                        anterior.getDestino() != null ? anterior.getDestino() : anterior.getMotivo(),
                        anterior.getDestinoLat(),
                        anterior.getDestinoLng()))
                .orElse(null);

        return new OrigenSugeridoResponse(base, ultimoDestino);
    }

    public DespachoResponse crear(DespachoRequest request, Usuario usuario) {
        autorizacion.exigir(usuario, PermisosCatalogo.DESPACHAR_MOVILIDADES);

        Movilidad movilidad = movilidadRepository.findById(request.movilidadId())
                .orElseThrow(() -> new RuntimeException("Movilidad no encontrada"));
        if (Boolean.FALSE.equals(movilidad.getActivo())) {
            throw new RuntimeException("Esa movilidad ya no forma parte de la flota");
        }
        if (Boolean.FALSE.equals(movilidad.getEnServicio())) {
            throw new RuntimeException(comillas(movilidad.getNombre()) + " está fuera de servicio");
        }
        if (despachoRepository.existsByMovilidadIdAndEstado(movilidad.getId(), DespachoEstado.EN_CURSO)) {
            throw new RuntimeException(comillas(movilidad.getNombre()) + " ya está despachada");
        }

        Despacho despacho = new Despacho();
        despacho.setMovilidad(movilidad);
        despacho.setMotivo(request.motivo());
        despacho.setDestino(request.destino());
        despacho.setDestinoLat(request.destinoLat());
        despacho.setDestinoLng(request.destinoLng());
        despacho.setDespachadoPor(usuario);
        despacho.setEstado(DespachoEstado.EN_CURSO);
        asignarOrigen(despacho, request, movilidad);

        return mapear(despachoRepository.save(despacho), configuracionService.obtenerEntidad());
    }

    // El origen queda congelado en el despacho: si mañana se corrige la
    // dirección del cuartel, los recorridos ya calculados no cambian.
    private void asignarOrigen(Despacho despacho, DespachoRequest request, Movilidad movilidad) {
        if (request.despachoAnteriorId() != null) {
            Despacho anterior = despachoRepository.findById(request.despachoAnteriorId())
                    .orElseThrow(() -> new RuntimeException("No se encontró la salida anterior"));
            if (!anterior.getMovilidad().getId().equals(movilidad.getId())) {
                throw new RuntimeException("La salida anterior es de otra movilidad");
            }
            if (anterior.getDestinoLat() == null || anterior.getDestinoLng() == null) {
                throw new RuntimeException("La salida anterior no tiene el destino ubicado en el mapa");
            }
            despacho.setDespachoAnterior(anterior);
            despacho.setOrigenNombre(anterior.getDestino() != null ? anterior.getDestino() : anterior.getMotivo());
            despacho.setOrigenLat(anterior.getDestinoLat());
            despacho.setOrigenLng(anterior.getDestinoLng());
            return;
        }

        ConfiguracionCuerpo config = configuracionService.obtenerEntidad();
        despacho.setOrigenNombre(config.getBaseNombre());
        despacho.setOrigenLat(config.getBaseLat());
        despacho.setOrigenLng(config.getBaseLng());
    }

    public DespachoResponse finalizar(Long id, Usuario usuario) {
        autorizacion.exigir(usuario, PermisosCatalogo.DESPACHAR_MOVILIDADES);
        Despacho despacho = buscar(id);
        if (despacho.getEstado() == DespachoEstado.FINALIZADO) {
            throw new RuntimeException("El despacho ya está finalizado");
        }
        despacho.setEstado(DespachoEstado.FINALIZADO);
        despacho.setFinalizadoEn(LocalDateTime.now());
        return mapear(despachoRepository.save(despacho), configuracionService.obtenerEntidad());
    }

    public void eliminar(Long id, Usuario usuario) {
        autorizacion.exigir(usuario, PermisosCatalogo.DESPACHAR_MOVILIDADES);
        Despacho despacho = buscar(id);
        if (despachoRepository.existsByDespachoAnteriorId(despacho.getId())) {
            throw new RuntimeException(
                    "No se puede eliminar: otra salida arranca donde termina esta");
        }
        posicionRepository.deleteByDespachoId(despacho.getId());
        despachoRepository.delete(despacho);
    }

    // El personal en la calle manda su posición. No hace falta permiso:
    // alcanza con estar logueado y que el despacho siga en curso.
    public void registrarPosicion(Long id, PosicionRequest request, Usuario usuario) {
        Despacho despacho = buscar(id);
        if (despacho.getEstado() != DespachoEstado.EN_CURSO) {
            throw new RuntimeException("El despacho ya está finalizado: no se puede seguir rastreando");
        }

        LocalDateTime ahora = LocalDateTime.now();
        Optional<DespachoPosicion> ultima = posicionRepository
                .findFirstByDespachoIdAndUsuarioIdOrderByRegistradoEnDesc(id, usuario.getId());
        boolean demasiadoSeguido = ultima.isPresent()
                && Duration.between(ultima.get().getRegistradoEn(), ahora).compareTo(INTERVALO_MINIMO) < 0;
        if (demasiadoSeguido) {
            return;
        }

        DespachoPosicion posicion = new DespachoPosicion();
        posicion.setDespacho(despacho);
        posicion.setUsuario(usuario);
        posicion.setLatitud(request.latitud());
        posicion.setLongitud(request.longitud());
        posicion.setPrecisionMetros(request.precisionMetros());
        posicion.setVelocidad(request.velocidad());
        posicion.setRumbo(request.rumbo());
        posicion.setRegistradoEn(ahora);
        posicionRepository.save(posicion);
    }

    // Ida: del origen al destino. Vuelta: del destino al cuartel, pero
    // solo si la movilidad volvió desde acá. Si encadenó con otra
    // salida, ese tramo es la ida de la siguiente y contarlo también
    // acá sería duplicarlo.
    private DespachoResponse.Recorrido recorridoDe(Despacho despacho, ConfiguracionCuerpo config) {
        // Las salidas anteriores a que existiera el punto de partida no
        // tienen origen guardado: se asume que salieron del cuartel,
        // que es lo que pasaba hasta ahora.
        Double origenLat = despacho.getOrigenLat() != null ? despacho.getOrigenLat() : config.getBaseLat();
        Double origenLng = despacho.getOrigenLng() != null ? despacho.getOrigenLng() : config.getBaseLng();

        Double ida = Distancias.entre(
                origenLat, origenLng,
                despacho.getDestinoLat(), despacho.getDestinoLng());
        if (ida == null) return DespachoResponse.Recorrido.DESCONOCIDO;

        boolean encadenoConOtra = despachoRepository.existsByDespachoAnteriorId(despacho.getId());
        Double vuelta = encadenoConOtra
                ? 0.0
                : Distancias.entre(
                        despacho.getDestinoLat(), despacho.getDestinoLng(),
                        config.getBaseLat(), config.getBaseLng());
        if (vuelta == null) return new DespachoResponse.Recorrido(ida, null, ida);

        return new DespachoResponse.Recorrido(ida, vuelta, Distancias.redondear(ida + vuelta));
    }

    @Transactional(readOnly = true)
    public SeguimientoResponse seguimiento(Long id) {
        Despacho despacho = buscar(id);
        List<DespachoPosicion> posiciones = posicionRepository.findByDespachoIdOrderByRegistradoEnAsc(id);

        // Se agrupa por persona conservando el orden cronológico, así el
        // recorrido de cada una queda listo para dibujar.
        Map<Long, List<DespachoPosicion>> porUsuario = new LinkedHashMap<>();
        for (DespachoPosicion p : posiciones) {
            porUsuario.computeIfAbsent(p.getUsuario().getId(), k -> new ArrayList<>()).add(p);
        }

        LocalDateTime limite = LocalDateTime.now().minus(VENTANA_EN_VIVO);
        List<SeguimientoResponse.Participante> participantes = porUsuario.values().stream()
                .map(puntos -> aParticipante(puntos, limite))
                // Los que están transmitiendo ahora, primero.
                .sorted(Comparator
                        .comparing(SeguimientoResponse.Participante::enVivo).reversed()
                        .thenComparing(SeguimientoResponse.Participante::ultimaSenal, Comparator.reverseOrder()))
                .toList();

        long enVivo = participantes.stream().filter(SeguimientoResponse.Participante::enVivo).count();
        ConfiguracionCuerpo config = configuracionService.obtenerEntidad();
        return new SeguimientoResponse(
                DespachoResponse.desde(despacho, enVivo, recorridoDe(despacho, config)),
                participantes);
    }

    private SeguimientoResponse.Participante aParticipante(List<DespachoPosicion> puntos, LocalDateTime limite) {
        DespachoPosicion ultima = puntos.get(puntos.size() - 1);
        return new SeguimientoResponse.Participante(
                ultima.getUsuario().getId(),
                nombreDe(ultima.getUsuario()),
                ultima.getLatitud(),
                ultima.getLongitud(),
                ultima.getPrecisionMetros(),
                ultima.getVelocidad(),
                ultima.getRumbo(),
                ultima.getRegistradoEn(),
                ultima.getRegistradoEn().isAfter(limite),
                adelgazar(puntos)
        );
    }

    // Deja como mucho MAX_PUNTOS_RECORRIDO tomando uno cada N, y siempre
    // el último, que es donde se dibuja el marcador.
    private List<SeguimientoResponse.Punto> adelgazar(List<DespachoPosicion> puntos) {
        int paso = Math.max(1, puntos.size() / MAX_PUNTOS_RECORRIDO);
        List<SeguimientoResponse.Punto> resultado = new ArrayList<>();
        for (int i = 0; i < puntos.size(); i += paso) {
            resultado.add(aPunto(puntos.get(i)));
        }
        if ((puntos.size() - 1) % paso != 0) {
            resultado.add(aPunto(puntos.get(puntos.size() - 1)));
        }
        return resultado;
    }

    private SeguimientoResponse.Punto aPunto(DespachoPosicion p) {
        return new SeguimientoResponse.Punto(p.getLatitud(), p.getLongitud(), p.getRegistradoEn());
    }

    private DespachoResponse mapear(Despacho despacho, ConfiguracionCuerpo config) {
        return DespachoResponse.desde(despacho, contarEnVivo(despacho), recorridoDe(despacho, config));
    }

    private long contarEnVivo(Despacho despacho) {
        if (despacho.getEstado() != DespachoEstado.EN_CURSO) return 0;
        return posicionRepository.contarEnVivo(despacho.getId(), LocalDateTime.now().minus(VENTANA_EN_VIVO));
    }

    private Despacho buscar(Long id) {
        return despachoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Despacho no encontrado"));
    }

    private String nombreDe(Usuario usuario) {
        if (usuario.getBombero() == null) return usuario.getEmail();
        return usuario.getBombero().getNombre() + " " + usuario.getBombero().getApellido();
    }

    private String comillas(String texto) {
        return "\"" + texto + "\"";
    }
}
