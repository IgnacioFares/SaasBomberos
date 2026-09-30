package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

// Fila única (id=1) con datos institucionales configurables que van en
// el pie de los partes de intervención y con el punto de partida de las
// movilidades, desde el que se estiman los recorridos. Evita hardcodear
// "quién aprueba hoy" en el código; lo edita un administrador desde el
// panel.
@Data
@Entity
@Table(name = "configuracion_cuerpo")
public class ConfiguracionCuerpo {

    @Id
    private Long id = 1L;

    private String nombreCuerpo = "Cuerpo de Bomberos Voluntarios";

    private String jefeDeCuerpo = "Sub Of. Princ. Lucia Jofre";

    private String departamentoElaboracion = "Depto. Registro de Informe y Servicios";

    // Desde donde salen las movilidades salvo que vengan de otra salida.
    @Column(name = "base_nombre")
    private String baseNombre = "Cuartel de Bomberos Voluntarios de Maipú";

    @Column(name = "base_lat")
    private Double baseLat = -32.983217;

    @Column(name = "base_lng")
    private Double baseLng = -68.797060;
}
