package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// Un parte de intervención (10 tipos posibles, ver TipoParte). Los
// bloques comunes a todos los tipos (localización, solicitante, datos
// primordiales, superficie afectada) y los específicos de cada tipo se
// modelan como @Embedded: son todos columnas de "partes", null para los
// bloques que no aplican al tipo del parte. Las tablas dinámicas
// (personas damnificadas, entidades que intervino, vehículos) son listas
// hijas reales, como en ChecklistRegistro.resultados.
@Data
@Entity
@Table(name = "partes")
public class Parte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_parte", nullable = false)
    private TipoParte tipoParte;

    // Correlativo asignado automáticamente al finalizar (ver
    // ParteService#finalizar): ascendente y reiniciado cada mes según
    // fechaHecho. Null mientras el parte está en BORRADOR.
    @Column(name = "numero_parte")
    private Integer numeroParte;

    @Column(name = "numero_ruba")
    private String numeroRuba;

    @Column(name = "fecha_hecho")
    private LocalDate fechaHecho;

    @Column(name = "cuerpo_participante")
    private String cuerpoParticipante;

    // "Ampliatorio": textarea libre común a Accidente, Incendio Industrial/
    // Forestal/Vehicular, Capacitación, Rescate y Materiales Peligrosos.
    @Column(columnDefinition = "TEXT")
    private String ampliatorio;

    @ManyToOne
    @JoinColumn(name = "creado_por", nullable = false)
    private Usuario creadoPor;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParteEstado estado = ParteEstado.BORRADOR;

    @Embedded
    private LocalizacionInfo localizacion = new LocalizacionInfo();

    @Embedded
    private SolicitanteInfo solicitante = new SolicitanteInfo();

    @Embedded
    private DatosPrimordialesInfo datosPrimordiales = new DatosPrimordialesInfo();

    @Embedded
    private SuperficieAfectadaInfo superficieAfectada = new SuperficieAfectadaInfo();

    @Embedded
    private DatosAccidente datosAccidente = new DatosAccidente();

    @Embedded
    private DatosIncendioIndustrial datosIncendioIndustrial = new DatosIncendioIndustrial();

    @Embedded
    private DatosIncendioForestalLugar datosIncendioForestalLugar = new DatosIncendioForestalLugar();

    @Embedded
    private DatosIncendioVivienda datosIncendioVivienda = new DatosIncendioVivienda();

    @Embedded
    private DatosCapacitacion datosCapacitacion = new DatosCapacitacion();

    @Embedded
    private DatosRescate datosRescate = new DatosRescate();

    @Embedded
    private DatosMaterialesPeligrosos datosMaterialesPeligrosos = new DatosMaterialesPeligrosos();

    @Embedded
    private DatosServiciosEspeciales datosServiciosEspeciales = new DatosServiciosEspeciales();

    @Embedded
    private DatosFalsaAlarma datosFalsaAlarma = new DatosFalsaAlarma();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "parte_id")
    @OrderBy("orden ASC")
    private List<PartePersonaDamnificada> personasDamnificadas = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "parte_id")
    @OrderBy("orden ASC")
    private List<ParteEntidadIntervino> entidadesIntervino = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "parte_id")
    @OrderBy("orden ASC")
    private List<ParteVehiculo> vehiculos = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        creadoEn = LocalDateTime.now();
        actualizadoEn = creadoEn;
    }

    @PreUpdate
    protected void onUpdate() {
        actualizadoEn = LocalDateTime.now();
    }

    // Getters no-null para los @Embedded: cuando TODAS las columnas de un
    // embeddable están NULL en la fila, Hibernate lo hidrata como null (no
    // como un objeto con campos null), aun con el default de arriba —ese
    // default solo aplica a un "new Parte()" en memoria, no a lo leído de
    // la base. Estos overrides evitan NPE en ParteService/PDF sin tener
    // que null-chequear cada bloque en cada lugar que lo lee.
    public LocalizacionInfo getLocalizacion() {
        if (localizacion == null) localizacion = new LocalizacionInfo();
        return localizacion;
    }

    public SolicitanteInfo getSolicitante() {
        if (solicitante == null) solicitante = new SolicitanteInfo();
        return solicitante;
    }

    public DatosPrimordialesInfo getDatosPrimordiales() {
        if (datosPrimordiales == null) datosPrimordiales = new DatosPrimordialesInfo();
        return datosPrimordiales;
    }

    public SuperficieAfectadaInfo getSuperficieAfectada() {
        if (superficieAfectada == null) superficieAfectada = new SuperficieAfectadaInfo();
        return superficieAfectada;
    }

    public DatosAccidente getDatosAccidente() {
        if (datosAccidente == null) datosAccidente = new DatosAccidente();
        return datosAccidente;
    }

    public DatosIncendioIndustrial getDatosIncendioIndustrial() {
        if (datosIncendioIndustrial == null) datosIncendioIndustrial = new DatosIncendioIndustrial();
        return datosIncendioIndustrial;
    }

    public DatosIncendioForestalLugar getDatosIncendioForestalLugar() {
        if (datosIncendioForestalLugar == null) datosIncendioForestalLugar = new DatosIncendioForestalLugar();
        return datosIncendioForestalLugar;
    }

    public DatosIncendioVivienda getDatosIncendioVivienda() {
        if (datosIncendioVivienda == null) datosIncendioVivienda = new DatosIncendioVivienda();
        return datosIncendioVivienda;
    }

    public DatosCapacitacion getDatosCapacitacion() {
        if (datosCapacitacion == null) datosCapacitacion = new DatosCapacitacion();
        return datosCapacitacion;
    }

    public DatosRescate getDatosRescate() {
        if (datosRescate == null) datosRescate = new DatosRescate();
        return datosRescate;
    }

    public DatosMaterialesPeligrosos getDatosMaterialesPeligrosos() {
        if (datosMaterialesPeligrosos == null) datosMaterialesPeligrosos = new DatosMaterialesPeligrosos();
        return datosMaterialesPeligrosos;
    }

    public DatosServiciosEspeciales getDatosServiciosEspeciales() {
        if (datosServiciosEspeciales == null) datosServiciosEspeciales = new DatosServiciosEspeciales();
        return datosServiciosEspeciales;
    }

    public DatosFalsaAlarma getDatosFalsaAlarma() {
        if (datosFalsaAlarma == null) datosFalsaAlarma = new DatosFalsaAlarma();
        return datosFalsaAlarma;
    }
}
