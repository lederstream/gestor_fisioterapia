# 📅 CALENDARIO ESTRATÉGICO DE COMMITS Y ENTREGAS (12 SEMANAS)
**Proyecto:** KineFlow Core — Sistema Transaccional y de Gestión Clínica Integral  
**Centro de Aplicación:** AJ Fisioterapia (Sede San Borja, Lima - Perú)  
**Curso:** Experiencias Formativas en Situaciones Reales de Trabajo III (EFSRT III) — IDAT  
**Duración Oficial:** 12 Semanas Académicas  
**Calificación Objetivo:** **20 / 20 (Sobresaliente con Distinción)**  

---

## 🧭 CÓMO UTILIZAR ESTE CALENDARIO

1. **Tu ventaja estratégica:** El código ya está 100% programado y funcional. Tu objetivo es **administrar el ritmo de entrega** para que el docente perciba un avance progresivo, riguroso y profesional semana a semana.
2. **Cada semana (solo 2 minutos):**
   * Realizas un pequeño cambio, comentario o documentación en los archivos indicados.
   * Ejecutas el comando de commit con el **mensaje exacto** de la tabla.
   * Subes los cambios a GitHub (`git push`).
3. **En la revisión con el docente:**
   * Abres la web y muestras **únicamente** lo programado para esa semana. No te adelantes mostrando módulos futuros.

---

## 📊 MATRIZ SEMANAL DE COMMITS Y ENTREGABLES (SEMANAS 1 A 12)

| Sem. | Módulo / Hito | Mensaje Exacto de Commit (*Conventional Commits*) | Qué mostrar en la pantalla al Profesor |
| :---: | :--- | :--- | :--- |
| **S1** | **Arquitectura y Entorno** | `chore: configuracion inicial de arquitectura fullstack nextjs 16 y prisma orm` | Estructura del proyecto Next.js 16 (App Router), TypeScript, Tailwind CSS v4 y variables de entorno serverless. |
| **S2** | **Persistencia y Base de Datos** | `feat(db): modelado de esquema relacional 3fn en supabase postgresql` | Tablas en PostgreSQL / Supabase: `salas`, `pacientes`, `users`, `servicios`. Explicar integridad referencial y 3FN. |
| **S3** | **Seguridad y Control de Acceso** | `feat(auth): sistema de autenticacion rbac y proteccion de rutas clinicas` | Login con credenciales seguras y los 4 roles: Administrador, Terapeuta, Recepción y Paciente. Rutas protegidas. |
| **S4** | 🏆 **ENTREGABLE 1: Fundamentos** | `feat(config): modulo administrativo de marca blanca y parametrizacion de salas` | **Avance 1 ante el profesor:** Panel de configuración clínica (logo, colores, horarios Lun-Sáb) y matriz de las 6 salas físicas. |
| **S5** | **Motor de Concurrencia** | `feat(citas): motor transaccional de agendamiento y control anti-solapamiento` | Algoritmo anti-solapamiento: demostrar cómo el sistema bloquea dos citas en la misma sala o con el mismo terapeuta. |
| **S6** | **Landing Page Clínica** | `feat(landing): interfaz de experiencia del paciente y catalogo de especialidades` | Portal público institucional: banner de bienvenida, presentación de las salas de San Borja y catálogo de tratamientos. |
| **S7** | **Neuromarketing de Precios** | `feat(precios): implementacion de neuromarketing con anclaje de precios y barra movil` | Precios base tachados (`S/ 85`), precios promocionales (`S/ 65`), badges automáticos de ahorro (`-24%`) y barra flotante en celular. |
| **S8** | 🏆 **ENTREGABLE 2: Citas y Web** | `feat(reservas): portal interactivo de pre-reservas con validacion de dni peruano` | **Avance 2 ante el profesor:** Flujo de pre-reserva online en 20 segundos con DNI de 8 dígitos y generación de cita en agenda central. |
| **S9** | **Tratamientos y Paquetes** | `feat(tratamientos): gestion de paquetes terapeuticos y contador de consumo de sesiones` | Creación de paquetes de 10 y 20 sesiones, contador de sesiones consumidas y trazabilidad de citas por tratamiento. |
| **S10** | **Caja y Cobranzas** | `feat(pagos): registro transaccional de pagos fraccionados y cuadre de caja` | Cobro de sesiones en recepción: Efectivo, Yape, Plin y POS. Amortización progresiva de saldo (`PENDIENTE`, `PARCIAL`, `PAGADO`). |
| **S11** | **Historia Médica (EVA)** | `feat(clinica): ficha de evolucion con escala eva y bloqueo de alta por hito de 5 sesiones` | Ficha clínica con Escala Visual Analógica del Dolor (EVA 0 a 10) y regla de bloqueo de alta cada 5 sesiones sin reevaluación. |
| **S12** | 🎓 **ENTREGABLE FINAL: Sustentación** | `release(v1.0.0): entrega final del sistema integral de fisioterapia kineflow core` | **Sustentación de Titulación EFSRT III:** Demostración end-to-end en producción (Vercel + Supabase) con informe de auditoría de calidad 20/20. |

---

## 🏆 DETALLE DE LAS 3 GRANDES ENTREGAS ACADÉMICAS

### 📌 HITO 1 (Semana 4): Arquitectura, Persistencia y Administración
* **Archivos clave:** `prisma/schema.prisma`, `src/components/configuracion/ConfigurationManager.tsx`.
* **Discurso ante el docente:**
  > *"Profesor, en esta primera etapa establecimos la arquitectura base con Next.js 16 y Prisma ORM sobre PostgreSQL en Supabase. Modelamos la capacidad operativa finita de 6 salas físicas y el sistema de marca blanca que permite parametrizar horarios y branding sin tocar código"*.

---

### 📌 HITO 2 (Semana 8): Experiencia del Paciente y Motor de Citas
* **Archivos clave:** `src/components/landing/LandingView.tsx`, `src/components/reservas/QuickPreBookingModal.tsx`, `src/server/actions/citas.ts`.
* **Discurso ante el docente:**
  > *"Profesor, en esta segunda etapa conectamos la demanda del paciente con la capacidad de la clínica. Diseñamos la landing page con neuromarketing de precios y un portal de pre-reserva rápida que valida el DNI peruano y bloquea solapamientos horarios en milisegundos mediante transacciones atómicas"*.

---

### 📌 HITO 3 (Semana 12): Gestión Financiera, Ficha EVA y Sustentación Final
* **Archivos clave:** `src/server/actions/pagos.ts`, `docs/AUDITORIA_CALIDAD_EFSRT_III_IDAT.md`.
* **Discurso ante el docente:**
  > *"Profesor, cerramos el sistema con el ciclo asistencial y financiero: amortización fraccionada de paquetes de 10 y 20 sesiones en caja, la ficha de evolución cuantitativa con Escala EVA (0-10) y la regla médica obligatoria que bloquea el alta cada 5 sesiones sin reevaluación formal"*.
