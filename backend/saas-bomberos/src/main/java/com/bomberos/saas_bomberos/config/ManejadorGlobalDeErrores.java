package com.bomberos.saas_bomberos.config;

import com.bomberos.saas_bomberos.service.AccesoDenegadoException;
import com.bomberos.saas_bomberos.service.EmailNoVerificadoException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

// Punto único de traducción de errores a respuestas HTTP. Antes cada
// controller repetía su propio @ExceptionHandler idéntico; además,
// Map.of() no admite valores null, así que cualquier excepción sin
// mensaje (un NullPointerException, por ejemplo) hacía fallar al propio
// manejador y el cliente recibía un 500 sin explicación.
//
// Todas las respuestas tienen la forma { "mensaje": "..." }, que es lo
// que lee el frontend en utils/http.ts (extraerMensajeError).
@RestControllerAdvice
public class ManejadorGlobalDeErrores {

    // Falta de permisos: 403, para distinguirlo de un dato mal cargado.
    @ExceptionHandler(AccesoDenegadoException.class)
    public ResponseEntity<Map<String, String>> manejarAccesoDenegado(AccesoDenegadoException ex) {
        return respuesta(HttpStatus.FORBIDDEN, ex.getMessage(), "No tenés permiso para hacer esto");
    }

    // Login válido pero con el email sin confirmar. Lleva un código
    // aparte del mensaje para que el frontend pueda ofrecer el paso de
    // verificación en vez de un error sin salida.
    @ExceptionHandler(EmailNoVerificadoException.class)
    public ResponseEntity<Map<String, String>> manejarEmailNoVerificado(EmailNoVerificadoException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "mensaje", ex.getMessage(),
                "codigo", "EMAIL_NO_VERIFICADO"));
    }

    // Validaciones de @Valid sobre los DTO de entrada: se devuelve el
    // primer mensaje legible en lugar del cuerpo por defecto de Spring,
    // que el frontend no sabe leer.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> manejarValidacion(MethodArgumentNotValidException ex) {
        String mensaje = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getDefaultMessage())
                .filter(m -> m != null && !m.isBlank())
                .findFirst()
                .orElse(null);
        return respuesta(HttpStatus.BAD_REQUEST, mensaje, "Revisá los datos ingresados");
    }

    // Errores de negocio de los services (DNI duplicado, parte ya
    // finalizado, stock insuficiente, etc.).
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> manejarErrorDeNegocio(RuntimeException ex) {
        return respuesta(HttpStatus.BAD_REQUEST, ex.getMessage(),
                "No se pudo completar la operación");
    }

    private ResponseEntity<Map<String, String>> respuesta(HttpStatus estado, String mensaje, String porDefecto) {
        String texto = (mensaje == null || mensaje.isBlank()) ? porDefecto : mensaje;
        return ResponseEntity.status(estado).body(Map.of("mensaje", texto));
    }
}
