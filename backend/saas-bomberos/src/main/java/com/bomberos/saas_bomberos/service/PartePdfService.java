package com.bomberos.saas_bomberos.service;

import com.bomberos.saas_bomberos.dto.ConfiguracionCuerpoResponse;
import com.bomberos.saas_bomberos.dto.ParteResponse;
import com.bomberos.saas_bomberos.entity.Parte;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.stereotype.Service;
import org.thymeleaf.ITemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Map;

// Genera el PDF de un parte a partir de la plantilla Thymeleaf
// pdf/parte.html + openhtmltopdf. Se convierte el ParteResponse (records
// anidados) a un Map con Jackson antes de pasarlo a la plantilla: es la
// forma más segura de exponer ~100 campos anidados sin depender de que
// el motor de expresiones de Thymeleaf reconozca accessors de record.
// El ObjectMapper se crea acá (no se inyecta): el starter webmvc de este
// proyecto no expone un bean ObjectMapper para @Autowired, aunque Spring
// MVC sí serializa JSON de los controllers con su propio conversor interno.
@Service
public class PartePdfService {

    private static final DateTimeFormatter FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter FECHA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final ParteService parteService;
    private final ConfiguracionCuerpoService configuracionService;
    private final ITemplateEngine templateEngine;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    public PartePdfService(ParteService parteService, ConfiguracionCuerpoService configuracionService,
                            ITemplateEngine templateEngine) {
        this.parteService = parteService;
        this.configuracionService = configuracionService;
        this.templateEngine = templateEngine;
    }

    public byte[] generarPdf(Parte parteEntidad) {
        ParteResponse parte = parteService.mapear(parteEntidad);
        ConfiguracionCuerpoResponse config = configuracionService.obtener();
        Map<String, Object> parteMapa = objectMapper.convertValue(parte, new TypeReference<Map<String, Object>>() {});

        Context contexto = new Context();
        contexto.setVariable("p", parteMapa);
        contexto.setVariable("nombreCuerpo", config.nombreCuerpo());
        contexto.setVariable("jefeDeCuerpo", config.jefeDeCuerpo());
        contexto.setVariable("departamentoElaboracion", config.departamentoElaboracion());
        contexto.setVariable("creadoEnFormateado",
                parteEntidad.getCreadoEn() != null ? parteEntidad.getCreadoEn().format(FECHA_HORA) : "");
        contexto.setVariable("fechaHechoFormateada",
                parteEntidad.getFechaHecho() != null ? parteEntidad.getFechaHecho().format(FECHA) : "");
        contexto.setVariable("fechaGenerado", java.time.LocalDate.now().format(FECHA));

        String html = templateEngine.process("pdf/parte", contexto);

        ByteArrayOutputStream salida = new ByteArrayOutputStream();
        try {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.toStream(salida);
            builder.run();
        } catch (Exception e) {
            throw new RuntimeException("No se pudo generar el PDF: " + e.getMessage(), e);
        }
        return salida.toByteArray();
    }

    public String nombreArchivo(Parte parte) {
        String tipo = parte.getTipoParte().name().toLowerCase();
        String numero = parte.getNumeroParte() != null ? parte.getNumeroParte().toString() : "s-n";
        String fecha = parte.getFechaHecho() != null ? parte.getFechaHecho().toString() : "s-fecha";
        return "parte_" + tipo + "_" + sanitizar(numero) + "_" + fecha + ".pdf";
    }

    private String sanitizar(String valor) {
        return valor.replaceAll("[^a-zA-Z0-9-_]", "-");
    }
}
