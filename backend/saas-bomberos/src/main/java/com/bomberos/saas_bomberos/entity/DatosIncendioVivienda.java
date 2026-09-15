package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;
import java.time.LocalDate;

// Campos específicos de Incendio Vivienda (FO-01 B).
@Data
@Embeddable
public class DatosIncendioVivienda {

    @Column(name = "iv_seguro_compania")
    private String seguroCompania;
    @Column(name = "iv_seguro_poliza")
    private String seguroPoliza;
    @Column(name = "iv_seguro_vencimiento")
    private LocalDate seguroVencimiento;

    @Column(name = "iv_tipo_lugar_casa")
    private Boolean tipoLugarCasa;
    @Column(name = "iv_tipo_lugar_depto")
    private Boolean tipoLugarDepto;
    @Column(name = "iv_tipo_lugar_casilla")
    private Boolean tipoLugarCasilla;
    @Column(name = "iv_tipo_lugar_rancho")
    private Boolean tipoLugarRancho;
    @Column(name = "iv_tipo_lugar_multifuncional")
    private Boolean tipoLugarMultifuncional;
    @Column(name = "iv_tipo_lugar_otro")
    private Boolean tipoLugarOtro;
    @Column(name = "iv_tipo_lugar_otro_detalle")
    private String tipoLugarOtroDetalle;

    @Column(name = "iv_techo_madera_paja")
    private Boolean techoMaderaPaja;
    @Column(name = "iv_techo_yeso")
    private Boolean techoYeso;
    @Column(name = "iv_techo_tejas")
    private Boolean techoTejas;
    @Column(name = "iv_techo_chapa_metalica")
    private Boolean techoChapaMetalica;
    @Column(name = "iv_techo_chapa_carton")
    private Boolean techoChapaCarton;

    @Column(name = "iv_abertura_madera")
    private Boolean aberturaMadera;
    @Column(name = "iv_abertura_acero_hierro")
    private Boolean aberturaAceroHierro;
    @Column(name = "iv_abertura_aluminio")
    private Boolean aberturaAluminio;
    @Column(name = "iv_abertura_plastico")
    private Boolean aberturaPlastico;
    @Column(name = "iv_abertura_otro")
    private Boolean aberturaOtro;
    @Column(name = "iv_abertura_otro_detalle")
    private String aberturaOtroDetalle;
}
