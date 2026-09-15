package com.bomberos.saas_bomberos.config;

import com.bomberos.saas_bomberos.entity.TipoParte;
import java.util.LinkedHashMap;
import java.util.Map;

// Título impreso y código de formulario de cada tipo de parte, en el
// orden oficial (1 a 10). No depende de la base de datos: es fijo por
// tipo, igual que en los formularios en papel.
public final class PartesCatalogo {

    public record ParteDef(TipoParte tipo, String titulo, String codigoFormulario) {}

    private static final Map<TipoParte, ParteDef> POR_TIPO = new LinkedHashMap<>();

    static {
        registrar(TipoParte.ACCIDENTE, "ACCIDENTE", "FO-01 A");
        registrar(TipoParte.INCENDIO_INDUSTRIAL, "INCENDIO INDUSTRIAL", "FO-01 B");
        registrar(TipoParte.INCENDIO_FORESTAL, "INCENDIO FORESTAL", "FO-01 B");
        registrar(TipoParte.INCENDIO_VIVIENDA, "INCENDIO VIVIENDA", "FO-01 B");
        registrar(TipoParte.INCENDIO_VEHICULAR, "INCENDIO VEHICULAR", "FO-01 B");
        registrar(TipoParte.SERVICIOS_ESPECIALES_CAPACITACION, "SERVICIOS ESPECIALES CAPACITACIÓN", "FO-01 D");
        registrar(TipoParte.RESCATE, "RESCATE (Animal, persona)", "FO-01 C");
        registrar(TipoParte.MATERIALES_PELIGROSOS, "MATERIALES PELIGROSOS (Escape, Derrame, Explosión)", "FO-01 F");
        registrar(TipoParte.SERVICIOS_ESPECIALES, "SERVICIOS ESPECIALES (Servicios Especiales, Representación, Prevención)", "FO-01 D");
        registrar(TipoParte.SERVICIOS_FALSA_ALARMA, "SERVICIOS FALSA ALARMA", "FO-01 D");
    }

    private static void registrar(TipoParte tipo, String titulo, String codigo) {
        POR_TIPO.put(tipo, new ParteDef(tipo, titulo, codigo));
    }

    public static ParteDef de(TipoParte tipo) {
        return POR_TIPO.get(tipo);
    }

    public static java.util.List<ParteDef> ordenados() {
        return java.util.List.copyOf(POR_TIPO.values());
    }

    private PartesCatalogo() {}
}
