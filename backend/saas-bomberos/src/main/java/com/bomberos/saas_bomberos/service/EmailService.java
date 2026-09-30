package com.bomberos.saas_bomberos.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Optional;

// Envío del código de verificación.
//
// Si no hay servidor de correo configurado (MAIL_HOST vacío, que es lo
// normal en desarrollo), el código se escribe en el log del backend en
// vez de mandarse por mail: así se puede probar el registro completo
// sin depender de una casilla, y nadie queda encerrado afuera si el
// SMTP se cae.
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final Optional<JavaMailSender> mailSender;

    @Value("${app.mail.remitente:}")
    private String remitente;

    @Value("${spring.mail.host:}")
    private String host;

    public void enviarCodigoVerificacion(String destinatario, String codigo, String nombre) {
        String asunto = "Tu código de verificación - SaaS Bomberos";
        String cuerpo = """
                Hola %s:

                Tu código para verificar la cuenta es:

                    %s

                Vence en %d minutos. Si no te registraste en el sistema del
                cuartel, ignorá este mensaje.
                """.formatted(nombre, codigo, UsuarioService.MINUTOS_VIGENCIA_CODIGO);

        enviar(destinatario, asunto, cuerpo, codigo);
    }

    private void enviar(String destinatario, String asunto, String cuerpo, String codigo) {
        if (mailSender.isEmpty() || host == null || host.isBlank()) {
            log.warn("""
                    Sin servidor de correo configurado (MAIL_HOST). \
                    Código de verificación para {}: {}""", destinatario, codigo);
            return;
        }

        try {
            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setTo(destinatario);
            mensaje.setSubject(asunto);
            mensaje.setText(cuerpo);
            if (remitente != null && !remitente.isBlank()) {
                mensaje.setFrom(remitente);
            }
            mailSender.get().send(mensaje);
        } catch (Exception e) {
            // Que falle el correo no puede tumbar el registro: la cuenta
            // ya quedó creada y el código se puede reenviar.
            log.error("No se pudo enviar el código de verificación a {}: {}",
                    destinatario, e.getMessage());
            throw new RuntimeException(
                    "No se pudo enviar el correo de verificación. Probá de nuevo en un momento.");
        }
    }
}
