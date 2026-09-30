package com.bomberos.saas_bomberos.service;

// Distancia entre dos puntos del mapa por la fórmula del haversine.
//
// Es la distancia en línea recta ("a vuelo de pájaro"), no la que marca
// el cuentakilómetros: el recorrido real por calles siempre da algo
// más. Sirve como referencia comparable entre salidas, no para liquidar
// combustible.
public final class Distancias {

    private static final double RADIO_TIERRA_KM = 6371.0088;

    public static Double entre(Double latA, Double lngA, Double latB, Double lngB) {
        if (latA == null || lngA == null || latB == null || lngB == null) return null;

        double difLat = Math.toRadians(latB - latA);
        double difLng = Math.toRadians(lngB - lngA);
        double a = Math.sin(difLat / 2) * Math.sin(difLat / 2)
                + Math.cos(Math.toRadians(latA)) * Math.cos(Math.toRadians(latB))
                * Math.sin(difLng / 2) * Math.sin(difLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return redondear(RADIO_TIERRA_KM * c);
    }

    // Dos decimales: más precisión que eso es ruido para una estimación
    // en línea recta.
    public static double redondear(double kilometros) {
        return Math.round(kilometros * 100.0) / 100.0;
    }

    private Distancias() {}
}
