package com.bomberos.saas_bomberos.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.ToString;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El email es obligatorio")
    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @NotBlank(message = "La contraseña es obligatoria")
    @Column(nullable = false)
    private String password;

    @OneToOne
    @JoinColumn(name = "bombero_id", nullable = false, unique = true)
    private Bombero bombero;

    @ManyToOne
    @JoinColumn(name = "rol_id", nullable = false)
    private Rol rol;

    // Excluida del toString() generado por Lombok: al ser lazy, Spring
    // Security intenta loguear el principal autenticado (toString) fuera
    // del ciclo de vida de la sesión de Hibernate, lo que dispara un
    // LazyInitializationException en cualquier request autenticado.
    @ToString.Exclude
    @ManyToMany
    @JoinTable(
            name = "usuarios_permisos_extra",
            joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "permiso_id")
    )
    private Set<Permiso> permisosExtra = new HashSet<>();

    @Column(nullable = false)
    private String estado = "PENDIENTE";

    // Verificación del email. Es Boolean (admite null) a propósito: las
    // cuentas creadas antes de que existiera la verificación quedan en
    // null y se consideran verificadas, para no dejar afuera a nadie
    // que ya venía usando el sistema. Las nuevas nacen en false.
    @Column(name = "email_verificado")
    private Boolean emailVerificado;

    @JsonIgnore
    @Column(name = "codigo_verificacion")
    private String codigoVerificacion;

    @JsonIgnore
    @Column(name = "codigo_expira_en")
    private LocalDateTime codigoExpiraEn;

    // Cuándo se mandó el último código, para no permitir reenviarlo a
    // repetición ni convertir el registro en un enviador de spam.
    @JsonIgnore
    @Column(name = "codigo_enviado_en")
    private LocalDateTime codigoEnviadoEn;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
