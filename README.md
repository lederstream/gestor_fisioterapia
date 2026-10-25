# KineFlow Core — Gestor Integral de Fisioterapia & Rehabilitación
> **Software Clínico Multi-Rol en Marca Blanca (White-Label)**  
> Preparado para Producción con **Next.js 16 (App Router)**, **PostgreSQL (Supabase)**, **Prisma ORM** y despliegue serverless en **Vercel**.

---

## 🌟 Características Destacadas y Marca Blanca (White-Label)

Este sistema está concebido para ser adquirido por cualquier dueño de centro de salud o clínica de fisioterapia, permitiendo **personalizar el 100% de la identidad visual y operativa** desde el módulo de administración (`/dashboard/configuracion`) sin tocar una sola línea de código:

- 🎨 **Paleta de Colores Dinámica**: Colores Primario, Secundario y de Acento con inyección de variables CSS (`--brand-primary`, etc.) en tiempo real.
- 🏢 **Identidad Corporativa**: Razón Social, Nombre Comercial, RUC, Slogan, Títulos y Subtítulos Hero, Logo oficial y Favicon.
- 📍 **Sede y Canales de Atención**: Dirección física (ej. Av. Guardia Civil 520, San Borja), teléfonos, WhatsApp directo e integración con Google Maps.
- 🕒 **Horarios Flexibles**: Horarios por día de la semana (Lunes a Domingo), horas de refrigerio/pausa e intervalo de turnos (ej. 45 min).
- 🏷️ **Catálogo Maestro de Servicios**: Creación, edición y eliminación de terapias físicas, deportivas, neurológicas y masoterapia, con tarifas base, precios promocionales y visibilidad web.
- 🚪 **Administración de Salas Físicas**: Configuración del estado operativo de las 6 salas clínicas (DISPONIBLE / MANTENIMIENTO) y equipamiento.

---

## 📋 Cumplimiento de Requerimientos de Usuario (20 / 20)

| N° | Requerimiento de Usuario | Estado | Módulo / Ubicación |
|---|---|---|---|
| **1** | Landing Page pública con catálogo de servicios (terapias físicas, deportivas, neurológicas y masoterapia), precios, duración (45 min) y botón de reserva rápida. | ✅ Cumplido | `/` (LandingView + QuickPreBookingModal) |
| **2** | Sección informativa con ubicación en San Borja (Av. Guardia Civil 520), canales de atención y horarios. | ✅ Cumplido | `/` (Header, Footer y mapa interactivo) |
| **3** | Registrar y actualizar catálogo maestro de servicios clínicos, tarifas (individuales y paquetes) y duración (45 min). | ✅ Cumplido | `/dashboard/configuracion` (Tab Servicios) |
| **4** | Registrar, modificar y dar de baja al personal clínico y administrativo (Licenciados, Técnicos, Recepción y Gerencia). | ✅ Cumplido | `/dashboard/usuarios` (UserManager) |
| **5** | Configurar y administrar el estado operativo de las 6 salas físicas de atención de la sede San Borja. | ✅ Cumplido | `/dashboard/configuracion` (Tab Salas) |
| **6** | Registrar solicitudes de pre-reserva desde el modal web ingresando DNI, nombres, WhatsApp, servicio, fecha y turno (Mañana/Tarde). | ✅ Cumplido | Modal web en `/` y formulario `/reservas` |
| **7** | Recepción confirma y agenda citas asignando hora exacta, sala física (1 a 6) y fisioterapeuta a cargo. | ✅ Cumplido | `/dashboard/agenda` (NewAppointmentModal + MatrixGrid) |
| **8** | Registrar abonos y comprobantes de pago (Yape, Plin, POS o efectivo) con código de referencia y boleta. | ✅ Cumplido | `/dashboard/caja` (PaymentForm + Voucher) |
| **9** | Control de concurrencia ACID para evitar solapamiento de horarios en la misma sala o con el mismo terapeuta. | ✅ Cumplido | `src/server/actions/citas.ts` y restricciones Prisma |
| **10** | Cálculo y descuento automático de sesiones consumidas de paquetes (10 o 20 sesiones) con saldo y avance %. | ✅ Cumplido | `src/lib/store.ts` y `citas.ts` al registrar atención |
| **11** | Registro y graficado de evolución clínica del dolor mediante Escala Visual Analógica (EVA 0-10). | ✅ Cumplido | `/dashboard/pacientes/[id]` y `/dashboard/tratamiento` |
| **12** | Matriz visual de la agenda del día para recepción con filtros interactivos por estado. | ✅ Cumplido | `/dashboard/agenda` (MatrixGrid) |
| **13** | Directorio clínico consolidado de pacientes con fichas integrales, teléfonos, paquetes y sesiones acumuladas. | ✅ Cumplido | `/dashboard/pacientes` |
| **14** | Listado de atenciones diarias asignadas por fisioterapeuta y por sala física para control operativo. | ✅ Cumplido | `/dashboard/agenda` (Vistas por Sala y Terapeuta) |
| **15** | Reporte tabular de la tasa de ausentismo semanal (no-show) de pacientes y turnos no reasignados. | ✅ Cumplido | `/dashboard/agenda` y `/dashboard` (AusentismoReportModal) |
| **16** | Portal privado del paciente con próxima cita (sala 1-6 y terapeuta), historial de comprobantes y boletas. | ✅ Cumplido | `/dashboard` (con rol PACIENTE), `/dashboard/mis-pagos` |
| **17** | Matriz de ocupación en tiempo real y detección de espacios libres (Detectar Huecos Libres) en las 6 salas. | ✅ Cumplido | `/dashboard/agenda` (Filtro "Detectar Huecos Libres") |
| **18** | Dashboard gerencial con métricas de caja en tiempo real, ingresos totales y recaudación por método. | ✅ Cumplido | `/dashboard` (DashboardPageClient) |
| **19** | Control de acceso basado en roles RBAC (ADMIN, RECEPCION, TERAPEUTA, PACIENTE) y Ley N.° 29733. | ✅ Cumplido | `permissions.ts`, `auth-context.tsx`, PermissionGuard |
| **20** | Exportación de registros de auditoría, comprobantes de pago e informes a formatos estándar (Excel, CSV y PDF). | ✅ Cumplido | Botones en `/dashboard/auditoria`, `/dashboard/caja` y `/dashboard/agenda` |

---

## 🔐 Autenticación, Asistente de Inicialización y Ciberseguridad

El sistema sigue los más estrictos estándares de la industria (OWASP ASVS 4.0, NIST SP 800-63B y Ley N.° 29733 de Protección de Datos Personales):

### 1. Asistente de Arranque Inicial (`/setup`)
* **Puerta de Enlace de Única Inicialización (Once-Only Bootstrap Gate)**: Al desplegar la clínica por primera vez, el sistema permite configurar al **Administrador Principal (Root Admin)** con nombre, correo institucional, cargo y contraseña maestra de alta entropía.
* **Sellado Permanente Post-Inicialización**: Una vez creado el Administrador, la ruta `/setup` queda sellada irreversiblemente contra intrusos y cualquier intento posterior es bloqueado y auditado con IP y timestamp en la bitácora forense de PostgreSQL.

### 2. Aprovisionamiento de Usuarios y Asignación de Roles por el Administrador
* Únicamente el Administrador autenticado con permiso `usuarios:gestionar` puede dar de alta nuevos colaboradores médicos y administrativos desde `/dashboard/usuarios`.
* **Generación Criptográfica de Claves**: El panel incluye un generador aleatorio de claves seguras (`crypto.randomBytes`) y una herramienta de copia formateada para entregar las credenciales directamente al colaborador sin exponerlas en texto plano en la base de datos.
* **Separación Estricta de Funciones**: Los perfiles de Paciente están blindados y no pueden ser escalados a roles de personal clínico ni viceversa.

### 3. Principios de Ciberseguridad Activa (Zero Plaintext Passwords)
* **Hashing Unidireccional bcrypt**: Todas las contraseñas se almacenan con factor de costo 10 y sal criptográfica individualizada (`$2b$10$...`). Nadie que acceda o descargue un dump de la base de datos puede obtener contraseñas en texto plano.
* **Cifrado en Reposo AES-256-GCM** ([src/lib/crypto.ts](file:///d:/PROYECTOS%20DEVELOPER/gestor_fisioterapia/src/lib/crypto.ts)): Cifrado simétrico de nivel militar para notas médicas confidenciales y datos sensibles.
* **Tokens de Sesión HTTP-Only**: Tokens JWT firmados con HMAC-SHA256 y emitidos en cookies con atributos `httpOnly`, `sameSite: lax` y `secure` para mitigar ataques XSS y CSRF.
* **Trazabilidad Forense Inmutable**: Todo intento de acceso (exitoso o fallido), cambio de rol o creación de usuario se registra en `audit_logs` con dirección IP validada.

---

## 🚀 Despliegue en Producción (Supabase + Vercel)

### 1. Configuración de Base de Datos en Supabase
1. Ingresa a [supabase.com](https://supabase.com) y crea un nuevo proyecto.
2. En **Project Settings > Database**, copia la URL de conexión en modo **Transaction Pooler** (puerto `6543`) y **Session Pooler / Direct** (puerto `5432`).
3. Agrega la variable en tu archivo `.env` o en Vercel:
   ```bash
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
   DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
   ```
4. Para inicializar las tablas en Supabase, ejecuta una sola vez:
   ```bash
   node scripts/migrate-supabase.mjs
   ```

### 2. Despliegue en Vercel
1. Sube el repositorio a GitHub o GitLab.
2. Importa el proyecto en [vercel.com](https://vercel.com).
3. En la sección **Environment Variables**, añade:
   - `DATABASE_URL`: Tu cadena de conexión Supabase con pooler (puerto 6543).
   - `DIRECT_URL`: Tu cadena de conexión directa Supabase (puerto 5432).
   - `NEXT_PUBLIC_APP_URL`: La URL asignada por Vercel (ej. `https://mi-clinica.vercel.app`).
4. Haz clic en **Deploy**. El comando de build optimizado (`prisma generate && next build`) ejecutará la compilación sin errores.

---

## 💻 Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Generar cliente Prisma
npx prisma generate

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Probar compilación de producción
npm run build
```

Accede a [http://localhost:3000](http://localhost:3000) para la landing page o a [http://localhost:3000/login](http://localhost:3000/login) para el portal de acceso.
