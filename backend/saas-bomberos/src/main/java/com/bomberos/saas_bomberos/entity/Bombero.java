package com.bomberos.saas_bomberos.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "bomberos")
public class Bombero {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @NotBlank(message = "El nombre es obligatorio")
 @Column(nullable = false)
 private String nombre;

 @NotBlank(message = "El apellido es obligatorio")
 @Column(nullable = false)
 private String apellido;

 @NotBlank(message = "El DNI es obligatorio")
 @Column(nullable = false, unique = true)
 private String dni;

 @NotBlank(message = "El email es obligatorio")
 @Email(message = "El email debe ser válido")
 @Column(nullable = false, unique = true)
 private String email;

 @NotBlank(message = "El teléfono es obligatorio")
 @Column(nullable = false)
 private String telefono;

 @NotBlank(message = "El rango es obligatorio")
 @Column(nullable = false)
 private String rango;

 @Column(name = "fecha_ingreso")
 private LocalDate fechaIngreso;

 // Datos médicos y de emergencia (opcionales, se cargan al registrarse).
 @Column(name = "telefono_emergencia")
 private String telefonoEmergencia;

 @Column(name = "obra_social")
 private String obraSocial;

 private String enfermedades;

 @Column(name = "grupo_sanguineo")
 private String grupoSanguineo;

 @Column(nullable = false)
 private Boolean activo = true;
}