package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

// Campos específicos de Servicios Especiales (Servicio/Representación/
// Prevención) — FO-01 D. El subtipo determina qué sub-bloque se muestra.
@Data
@Embeddable
public class DatosServiciosEspeciales {

    @Enumerated(EnumType.STRING)
    @Column(name = "se_subtipo")
    private SubtipoServicioEspecial subtipo;

    // Subtipo = Servicio
    @Column(name = "se_serv_otras_fuerzas")
    private Boolean servOtrasFuerzas;
    @Column(name = "se_serv_entidades_gubernamentales")
    private Boolean servEntidadesGubernamentales;
    @Column(name = "se_serv_empresa_privada")
    private Boolean servEmpresaPrivada;
    @Column(name = "se_serv_detalle", columnDefinition = "TEXT")
    private String servDetalle;

    // Subtipo = Representación
    @Column(name = "se_rep_desfile")
    private Boolean repDesfile;
    @Column(name = "se_rep_honores_funebres")
    private Boolean repHonoresFunebres;
    @Column(name = "se_rep_aniversarios")
    private Boolean repAniversarios;
    @Column(name = "se_rep_eventos_publicos")
    private Boolean repEventosPublicos;
    @Column(name = "se_rep_eventos_privados")
    private Boolean repEventosPrivados;
    @Column(name = "se_rep_ceremonias")
    private Boolean repCeremonias;
    @Column(name = "se_rep_otra")
    private Boolean repOtra;
    @Column(name = "se_rep_otra_detalle")
    private String repOtraDetalle;

    // Subtipo = Prevención
    @Column(name = "se_prev_aterrizaje")
    private Boolean prevAterrizaje;
    @Column(name = "se_prev_despegues")
    private Boolean prevDespegues;
    @Column(name = "se_prev_eventos")
    private Boolean prevEventos;
    @Column(name = "se_prev_fiesta")
    private Boolean prevFiesta;
    @Column(name = "se_prev_otra")
    private Boolean prevOtra;
    @Column(name = "se_prev_otra_detalle")
    private String prevOtraDetalle;
}
