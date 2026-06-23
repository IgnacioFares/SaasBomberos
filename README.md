# 🚒 SaaS Bomberos

Sistema de gestión integral para cuarteles de bomberos voluntarios. Permite administrar el personal, las movilidades (vehículos) y los checklists de equipamiento que se realizan en cada guardia, con un sistema de roles y permisos configurable.

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

## 📋 Sobre el proyecto

En las guardias de un cuartel de bomberos, cada movilidad (vehículo) requiere un control periódico de su equipamiento: herramientas de rescate, elementos de protección personal, mangueras, botiquines de trauma, radios de comunicación, entre otros. Este sistema digitaliza ese proceso, permitiendo:

- Registrar el personal del cuartel y sus datos.
- Administrar las movilidades disponibles.
- Configurar checklists de equipamiento por sección de cada vehículo.
- Registrar quién realizó cada check, cuándo, y quién lo validó como encargado de guardia.
- Detectar de forma simple si falta o sobra equipamiento respecto a lo esperado.
- Controlar el acceso al sistema mediante roles y permisos administrados por un usuario administrador.

---

## 🧩 Funcionalidades principales

- **Gestión de personal:** alta, edición y baja de bomberos.
- **Gestión de movilidades:** alta, edición y baja de vehículos del cuartel.
- **Checklists configurables:** secciones e ítems editables según el equipamiento real de cada móvil.
- **Control de cantidades:** cada ítem registra cantidad esperada vs. cantidad real, identificando faltantes o sobrantes.
- **Registro y autenticación:** los bomberos se registran y quedan pendientes de aprobación.
- **Roles y permisos:** un administrador aprueba cuentas, asigna roles y puede otorgar permisos individuales adicionales por usuario.
- **Auditoría:** se registra quién creó o modificó cada dato relevante, y cuándo.

---

## 🏗️ Arquitectura

El proyecto está dividido en dos partes independientes que se comunican mediante una API REST:

```
saas-bomberos/
├── backend/     → API REST con Spring Boot
└── frontend/    → Interfaz de usuario con React + TypeScript
```

### Backend

Construido en capas siguiendo las convenciones de Spring Boot:

```
entity/       → modelos de datos (Bombero, Movilidad, Usuario, Rol, Permiso...)
repository/   → acceso a la base de datos (Spring Data JPA)
service/      → lógica de negocio y validaciones
controller/   → endpoints REST
config/       → configuración de seguridad y CORS
```

### Frontend

Organizado con una arquitectura *feature-based*, donde cada módulo agrupa sus propios componentes, hooks, servicios y tipos:

```
src/
├── features/
│   ├── bomberos/
│   ├── movilidades/
│   └── auth/
├── components/   → componentes globales reutilizables
├── services/     → cliente HTTP base (axios)
├── types/        → tipos compartidos
└── hooks/        → hooks globales reutilizables
```

---

## 🔐 Seguridad y datos sensibles

Este repositorio **no incluye** archivos de configuración con credenciales reales (`application.properties`). Dichos archivos están excluidos mediante `.gitignore` y deben configurarse de forma local antes de ejecutar el proyecto.

---

## 🚧 Estado del proyecto

Proyecto en desarrollo activo. Módulos actuales:

- [x] Gestión de Bomberos (CRUD completo)
- [x] Gestión de Movilidades (CRUD completo)
- [ ] Secciones e ítems de checklist
- [ ] Registro de checklists realizados
- [ ] Autenticación con JWT
- [ ] Sistema de roles y permisos
- [ ] Panel de administración de usuarios

---

## 👤 Autor

Proyecto desarrollado de forma individual como parte de un proceso de aprendizaje full-stack, aplicado a un caso real de gestión para cuarteles de bomberos.
