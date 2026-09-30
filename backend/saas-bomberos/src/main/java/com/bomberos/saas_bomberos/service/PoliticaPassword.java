package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.entity.Bombero;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

// Reglas de contraseña del sistema, en un solo lugar para que el
// backend y el formulario de registro digan exactamente lo mismo.
//
// La idea es que sea larga y que no sea adivinable a partir de datos
// de la persona, que es lo que realmente protege una cuenta; no se
// exigen símbolos raros, que en la práctica terminan en papelitos
// pegados al monitor.
public final class PoliticaPassword {

    public static final int LARGO_MINIMO = 10;

    // BCrypt solo considera los primeros 72 bytes: más allá de eso el
    // resto de la contraseña no protege nada, así que se corta antes.
    public static final int LARGO_MAXIMO = 64;

    // Contraseñas y patrones que aparecen en cualquier lista de las más
    // usadas: no importa cuán larga sea, si es una de estas no sirve.
    private static final List<String> PROHIBIDAS = List.of(
            "password", "contrasena", "contraseña", "qwerty", "123456", "1234567890",
            "bomberos", "bombero", "cuartel", "admin", "administrador", "iloveyou",
            "abc123", "111111", "000000", "asdasd", "zxcvbnm", "letmein"
    );

    public static void validar(String password, String email, Bombero bombero) {
        if (password == null || password.isBlank()) {
            throw new RuntimeException("La contraseña es obligatoria");
        }
        if (password.length() < LARGO_MINIMO) {
            throw new RuntimeException("La contraseña tiene que tener al menos "
                    + LARGO_MINIMO + " caracteres");
        }
        if (password.length() > LARGO_MAXIMO) {
            throw new RuntimeException("La contraseña no puede superar los "
                    + LARGO_MAXIMO + " caracteres");
        }
        if (password.chars().noneMatch(Character::isLowerCase)) {
            throw new RuntimeException("La contraseña tiene que incluir una letra minúscula");
        }
        if (password.chars().noneMatch(Character::isUpperCase)) {
            throw new RuntimeException("La contraseña tiene que incluir una letra mayúscula");
        }
        if (password.chars().noneMatch(Character::isDigit)) {
            throw new RuntimeException("La contraseña tiene que incluir un número");
        }
        if (password.chars().allMatch(Character::isWhitespace)) {
            throw new RuntimeException("La contraseña no puede ser solo espacios");
        }

        String normalizada = normalizar(password);
        for (String prohibida : PROHIBIDAS) {
            if (normalizada.contains(normalizar(prohibida))) {
                throw new RuntimeException("Esa contraseña es demasiado común. Elegí otra.");
            }
        }

        // Una contraseña armada con el propio email o nombre es lo
        // primero que prueba quien conoce a la persona.
        for (String dato : datosPersonales(email, bombero)) {
            if (dato.length() >= 4 && normalizada.contains(dato)) {
                throw new RuntimeException(
                        "La contraseña no puede contener tu nombre, tu email ni tu DNI");
            }
        }
    }

    private static List<String> datosPersonales(String email, Bombero bombero) {
        String usuarioDelEmail = email != null && email.contains("@")
                ? email.substring(0, email.indexOf('@'))
                : email;
        if (bombero == null) {
            return List.of(normalizar(usuarioDelEmail));
        }
        return List.of(
                normalizar(usuarioDelEmail),
                normalizar(bombero.getNombre()),
                normalizar(bombero.getApellido()),
                normalizar(bombero.getDni())
        );
    }

    // Se compara sin acentos, sin mayúsculas y sin espacios, para que
    // "Bombéros " no pase por ser distinta de "bomberos".
    private static String normalizar(String texto) {
        if (texto == null) return "";
        return Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replace(" ", "");
    }

    private PoliticaPassword() {}
}
