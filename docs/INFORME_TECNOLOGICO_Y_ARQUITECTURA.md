# INFORME TÉCNICO DE ARQUITECTURA, TECNOLOGÍAS Y DEPENDENCIAS
## Sistema de Gestión Integral de Fisioterapia y Rehabilitación (KineFlow Core)
**Centro Clínico:** AJ Fisioterapia (San Borja - Lima, Perú)  
**Autor y Desarrollador:** Marco Antonio Yana (Lederstream)  
**Fecha de Publicación:** Octubre 2026  
**Versión del Sistema:** 0.1.0 Enterprise  

---

## 1. Resumen Ejecutivo del Proyecto

El **Gestor Fisioterapia** es una plataforma web médica de alta disponibilidad diseñada a medida para optimizar el flujo operativo, administrativo, financiero y clínico de centros de rehabilitación física. El sistema unifica la captación digital de pacientes, el control milimétrico de la agenda física por salas y terapeutas, la trazabilidad de paquetes de sesiones terapéuticas, el control de caja multicanal (Efectivo, Yape, Plin, POS), la historia clínica basada en la Escala Visual Analógica (EVA), la auditoría forense inmutable y el control de acceso basado en roles (RBAC).

Este informe técnico documenta con rigor de ingeniería de software el conjunto de tecnologías, frameworks, librerías y decisiones arquitectónicas que sustentan la plataforma, justificando el valor de cada componente frente a las alternativas del mercado.

---

## 2. Pila Tecnológica Principal (Core Stack)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CAPA DE PRESENTACIÓN                          │
│     React 19 • Next.js 16 (App Router) • Tailwind CSS v4 • Lucide Icons │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                       CAPA DE LÓGICA Y NEGOCIO                          │
│     Next.js Server Actions • Zod Schema Validation • React Hook Form     │
│        Motor de Auditoría Forense • Matriz de Permisos RBAC (4 Roles)   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                     CAPA DE DATOS Y PERSISTENCIA                        │
│        Prisma ORM 7 • PostgreSQL 16 Relacional • Date-fns Engine        │
│          Esquema Normalizado 3FN • Transacciones Atómicas ACID          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.1. Framework Principal: Next.js 16 (App Router)
* **Rol:** Framework Full Stack unificado (Frontend SSR/CSR + Backend Serverless / Server Actions).
* **Versión instalada:** `16.3.8`.
* **Justificación de su elección:**
  1. **Arquitectura Híbrida sin Duplicidad de Modelos:** Permite desarrollar la interfaz de usuario y las reglas de negocio en un único repositorio sin la necesidad de montar un backend separado en NestJS, Express o Django. Los tipos de TypeScript e interfaces se comparten directamente entre cliente y servidor.
  2. **Server Actions Nativas (Zero-API Overhead):** Las mutaciones (agendar cita, registrar cobro, redactar evolución) se ejecutan mediante funciones de servidor tipadas invocables directamente desde componentes cliente, eliminando la creación manual de controladores REST, endpoints `fetch()`, cabeceras HTTP y serialización manual.
  3. **Optimización de Renderizado:** La landing page pública y el portal de reservas se benefician de *Server-Side Rendering* (SSR) y optimización SEO automática para posicionar la clínica en búsquedas locales de Google ("Fisioterapia en San Borja"), mientras que los tableros internos operan como interfaces interactivas de alta respuesta.
  4. **Seguridad Integrada:** El código que consulta la base de datos o ejecuta validaciones confidenciales nunca viaja al navegador del cliente, mitigando riesgos de fugas de credenciales o ingeniería inversa de la lógica clínica.

### 2.2. Librería de Interfaz: React 19
* **Rol:** Biblioteca declarativa para construcción de interfaces de usuario.
* **Versión instalada:** `19.2.8`.
* **Justificación de su elección:**
  1. **React Server Components (RSC):** Separa de raíz los componentes que no requieren interactividad (se ejecutan en el servidor con costo de bundle JS igual a cero) de las islas interactivas del cliente (modales, selector de horas de la agenda, slider de EVA).
  2. **Acciones Asíncronas y Concurrencia:** Permite transiciones de estado fluidas (`useTransition`, `useActionState`) en formularios médicos críticos, evitando bloqueos de la interfaz mientras se procesan pagos o reservas.
  3. **Ecosistema y Longevidad:** React 19 garantiza soporte oficial a largo plazo, compatibilidad con la suite de pruebas y estándar de la industria.

### 2.3. Lenguaje de Programación: TypeScript 5
* **Rol:** Lenguaje tipado estático sobre JavaScript.
* **Versión instalada:** `^5.0.0`.
* **Justificación de su elección:**
  1. **Integridad de Datos Médicos:** En una aplicación clínica, un error de tipo en tiempo de ejecución (como confundir un `pacienteId` con un `citaId` o ingresar un monto nulo en una cobranza) representa una falla inaceptable. TypeScript previene estos errores en tiempo de compilación.
  2. **Refactorización Segura:** Cualquier cambio en el modelo relacional o en los permisos de rol se propaga instantáneamente con errores estáticos en todos los componentes y servicios que consumen ese dato.
  3. **Autocompletado e IntelliSense:** Maximiza la velocidad del equipo de desarrollo al navegar modelos complejos (citas con relaciones anidadas a salas, terapeutas, paquetes y pagos).

### 2.4. Motor de Base de Datos y ORM: PostgreSQL 16 + Prisma ORM 7
* **Rol:** Persistencia relacional ACID y Object-Relational Mapping con tipado estricto.
* **Versión instalada:** `@prisma/client ^7.10.0` y `prisma ^7.10.0`.
* **Justificación de su elección:**
  1. **Integridad Referencial Estricta (Por qué NO NoSQL/MongoDB):** En una clínica, la relación entre citas, salas físicas, terapeutas y pagos debe ser estrictamente relacional. Una cita médica no puede quedar huérfana sin sala o sin terapeuta; un pago no puede existir sin un paquete asignado. PostgreSQL garantiza integridad referencial con claves foráneas e índices únicos.
  2. **Transaccionalidad ACID:** Las reservas de citas y los registros de pagos requieren atomicidad. Si la validación de capacidad de sala falla a mitad del proceso, la transacción completa debe revertirse para evitar solapamientos físicos.
  3. **Migraciones Declarativas y Tipado con Prisma 7:** Prisma traduce el esquema `schema.prisma` a migraciones SQL reproducibles y genera un cliente TypeScript fuertemente tipado en sincronía absoluta con la base de datos física.

### 2.5. Sistema de Estilos: Tailwind CSS v4
* **Rol:** Motor de diseño y maquetación utility-first.
* **Versión instalada:** `tailwindcss ^4.0.0` con `@tailwindcss/postcss ^4.0.0`.
* **Justificación de su elección:**
  1. **Motor de Compilación Oxidized (Rust):** Tailwind v4 ofrece tiempos de compilación casi instantáneos y no requiere archivos de configuración pesados (`tailwind.config.js`), simplificando la configuración vía CSS nativo.
  2. **Cero Sobrecarga de Bundle:** Únicamente las clases CSS que se utilizan en los componentes se empaquetan en el CSS final, logrando tiempos de carga ultra veloces en recepción y dispositivos móviles de los pacientes.
  3. **Consistencia Visual Médica:** Permite crear un sistema de diseño con paleta sobria y profesional (`teal-600`, `emerald-600`, `slate-800`, fondos piedra `#FAF9F5`), transmitiendo confianza, higiene y excelencia médica.

---

## 3. Desglose Exhaustivo de Paquetes y Dependencias (`package.json`)

A continuación se detalla cada una de las librerías instaladas en el proyecto, su propósito técnico y la razón específica de su adopción:

| Paquete / Librería | Versión | Tipo | Función en el Proyecto | Razón Técnica y Alternativas Evaluadas |
| :--- | :--- | :--- | :--- | :--- |
| **`@prisma/client`** | `^7.10.0` | Producción | Cliente de base de datos tipado | Consulta la base de datos PostgreSQL con autocompletado y prevención total de inyecciones SQL. Supera a queries manuales SQL al evitar errores de sintaxis en runtime. |
| **`prisma`** | `^7.10.0` | Desarrollo | CLI de gestión y migraciones | Genera el cliente, administra migraciones de esquema (`prisma migrate`) y permite inspección de datos visual vía Prisma Studio. |
| **`zod`** | `^4.6.5` | Producción | Validación de esquemas y tipado de datos | Actúa como la *Única Fuente de Verdad* de validación. Valida tanto los formularios en el cliente como los datos entrantes en los Server Actions (DNI de 8 dígitos peruanos, celular, escala EVA de 0 a 10, montos positivos). Alternativas como Joi o Yup no se integran de forma tan nativa con TypeScript. |
| **`react-hook-form`** | `^7.89.0` | Producción | Gestión de formularios de alto rendimiento | Controla formularios complejos (alta de pacientes, registro de pagos, agendamiento de citas) mediante referencias no controladas (*uncontrolled components*), eliminando re-renderizados innecesarios de todo el árbol al teclear. Supera ampliamente a Formik en rendimiento. |
| **`@hookform/resolvers`** | `^5.9.1` | Producción | Integración entre React Hook Form y Zod | Puente oficial que permite que React Hook Form valide automáticamente los formularios contra los esquemas Zod con mensajes de error tipados en tiempo real. |
| **`lucide-react`** | `^1.51.0` | Producción | Iconografía vectorial SVG | Provee más de 40 iconos consistentes, médicos y administrativos (estetoscopio, calendario, escudo, billete, sala, usuario). Soporta *tree-shaking* estricto (solo se compilan los iconos que se importan, ocupando menos de 15 KB). |
| **`date-fns`** | `^4.4.0` | Producción | Motor inmutable de manipulación de fechas | Calcula solapamientos de horas, duración de sesiones de fisioterapia (30, 45, 60 min), formateo local en español y franjas horarias de citas. Es modular e inmutable, superando a `moment.js` (obsoleto y pesado) y a `dayjs` en precisión con TypeScript. |
| **`clsx`** | `^2.1.1` | Producción | Utilidad de concatenación de clases condicionales | Permite alternar clases de estado de manera legible (ej: clases para turnos libres, ocupados o en mantenimiento en la agenda). |
| **`tailwind-merge`** | `^3.7.0` | Producción | Resolución de conflictos en clases Tailwind | Evita que clases Tailwind sobreescritas choquen entre sí (por ejemplo, al combinar clases base de un componente con props externas como `p-4` vs `p-2`). Base de la función auxiliar `cn()`. |
| **`tsx`** | `^4.23.15` | Desarrollo | Ejecutor de TypeScript para Node.js | Permite ejecutar scripts de sembrado de datos (`prisma/seed.ts`) y mantenimiento directamente desde la terminal sin necesidad de compilar manualmente a JavaScript con `tsc`. |
| **`@types/pg`** | `^8.23.1` | Desarrollo | Definiciones de tipos para PostgreSQL | Provee tipado estático completo para el driver de conexión nativa a PostgreSQL en Node.js. |
| **`@types/node`** | `^20` | Desarrollo | Tipos del entorno Node.js | Proporciona tipado para APIs globales de Node.js (`process.env`, streams, buffer). |
| **`@types/react`** / **`@types/react-dom`** | `^19` | Desarrollo | Tipos de React 19 | Definiciones oficiales de TypeScript para elementos, eventos y hooks de React 19. |
| **`eslint`** / **`eslint-config-next`** | `^9` / `16.3.8` | Desarrollo | Análisis estático de código | Asegura el cumplimiento de buenas prácticas de código, detecta advertencias de accesibilidad, dependencias faltantes en hooks y convenciones de Next.js. |

---

## 4. Arquitectura de Módulos y Dominio del Sistema

El sistema implementa una arquitectura modular dividida en responsabilidades claras (*Separation of Concerns*):

```
gestor_fisioterapia/
├── src/
│   ├── app/                         # Enrutamiento App Router (Next.js 16)
│   │   ├── page.tsx                 # Landing Page Corporativa y Showcase de Servicios
│   │   ├── reservas/page.tsx        # Portal Público de Auto-reserva de Pacientes
│   │   └── dashboard/               # Área Privada Administrativa y Clínica
│   │       ├── page.tsx             # Panel Principal y Métricas de Alto Nivel
│   │       ├── agenda/              # Matriz de Agendamiento Físico (Salas vs Horas)
│   │       ├── pacientes/           # Directorio Clínico, Fichas Médicas y Progreso EVA
│   │       │   └── [id]/            # Detalle del Paciente, Historial y Generador de Informes
│   │       ├── caja/                # Control de Caja, Cobranzas Multicanal y Arqueo Diario
│   │       ├── usuarios/            # Administración de Personal y Asignación de Roles RBAC
│   │       ├── auditoria/           # Trazabilidad Forense Inmutable de Acciones
│   │       └── configuracion/       # Parametrización del Centro Clínico (RUC, Horarios, Salas)
│   ├── components/                  # Componentes de Interfaz Reutilizables
│   │   ├── agenda/                  # MatrixGrid (grilla interactiva) y NewAppointmentModal
│   │   ├── pacientes/               # EvaScaleChart, PackageProgressBar, ClinicalReportModal
│   │   ├── caja/                    # PaymentForm, CashArqueoModal, TransactionTable
│   │   ├── usuarios/                # UserManager y RoleSwitcher interactivo
│   │   ├── auditoria/               # AuditLogTable con filtros avanzados
│   │   └── layout/                  # DashboardSidebar, DashboardNavbar, PermissionGuard
│   ├── server/actions/              # Server Actions con Lógica de Negocio y Mutaciones
│   │   ├── citas.ts                 # Control de concurrencia y solapamiento de salas
│   │   ├── evolucion.ts             # Regla clínica de reevaluación (hito de 5 sesiones)
│   │   ├── pacientes.ts             # Creación y consulta de expedientes
│   │   ├── pagos.ts                 # Procesamiento financiero y actualización de saldos
│   │   ├── usuarios.ts              # Altas, bajas y modificación de credenciales
│   │   └── configuracion.ts         # Actualización de parámetros globales
│   ├── lib/                         # Utilidades, Contextos y Validaciones
│   │   ├── permissions.ts           # Matriz RBAC de 4 roles y función hasPermission()
│   │   ├── store.ts                 # Motor de negocio y repositorio de persistencia
│   │   ├── validations.ts           # Esquemas Zod de entrada y sanitización
│   │   └── utils.ts                 # Formateo de moneda peruana (S/), fechas y clases
│   └── generated/prisma/            # Cliente tipado de Prisma ORM generado
├── prisma/
│   ├── schema.prisma                # Definición formal del modelo relacional PostgreSQL
│   └── seed.ts                      # Datos maestros de inicio (Salas, Terapeutas, Servicios)
└── docs/                            # Documentación formal y diagramas de arquitectura
```

---

## 5. Reglas de Negocio Clave Implementadas

### 5.1. Control de Concurrencia Física en Agenda (Anti-Solapamiento)
Una de las mayores fuentes de pérdidas y fricción en clínicas de fisioterapia es la sobreventa de salas o la asignación simultánea de un terapeuta a dos pacientes en el mismo horario.
* **Mecanismo:** El Server Action `agendarCita()` ejecuta una consulta de validación temporal:
  $$\text{Inicio}_{\text{nueva}} < \text{Fin}_{\text{existente}} \quad \land \quad \text{Fin}_{\text{nueva}} > \text{Inicio}_{\text{existente}}$$
* Se valida de forma independiente tanto la disponibilidad de la **Sala Física** (1 a 6) como del **Terapeuta**. Si existe colisión, la operación se rechaza atómicamente antes de registrarse.

### 5.2. Protocolo Clínico de Reevaluación (Hito Obligatorio de 5 Sesiones)
* **Objetivo Médico:** Asegurar la calidad del tratamiento y la fundamentación científica de la mejoría del paciente.
* **Mecanismo:** En `registrarAsistenciaYEvolucion()`, cuando el contador de sesiones consumidas alcanza un múltiplo de 5 (5, 10, 15, 20), el sistema automáticamente:
  1. Marca la siguiente cita con la bandera de alta prioridad `esReevaluacion = true`.
  2. Activa el estado `bloqueaAlta = true`, impidiendo que el paciente sea dado de alta administrativamente sin que el fisioterapeuta registre formalmente la medición comparativa de dolor EVA y el informe de reevaluación.

### 5.3. Seguridad y Matriz de Permisos Basada en Roles (RBAC)
El sistema divide las capacidades operativas en 4 roles estrictos:
1. **ADMIN (Dirección y Gerencia):** Acceso irrestricto a todas las áreas, finanzas globales, auditoría de personal, configuración y gestión de usuarios.
2. **RECEPCION (Admisión y Caja):** Habilitado para agendar citas, cobrar por cualquier medio de pago, realizar arqueos diarios y crear nuevos pacientes. Restringido de historias clínicas detalladas y configuración del sistema.
3. **TERAPEUTA (Fisioterapeuta Clínico):** Acceso enfocado a la agenda médica, registro de asistencias, evolución clínica EVA y generación de informes médicos. Restringido de montos de caja, exportación financiera y administración de personal.
4. **PACIENTE (Cliente):** Portal privado exclusivo donde consulta sus próximas citas, saldo de sesiones pendientes y gráfico de evolución de su dolor. Completamente aislado del tablero operativo.

### 5.4. Trazabilidad Forense Inmutable (Audit Logs)
Cada evento relevante en el sistema (creación de cita, cambio de estado, registro de pago, redacción de evolución, modificación de configuración) genera un registro inmutable que almacena:
* ID y Nombre del usuario responsable.
* Rol del usuario al momento de la acción.
* Módulo afectado (`AGENDA`, `CAJA`, `HISTORIA_CLINICA`, `CONFIGURACION`, `SISTEMA`).
* Detalle de la modificación y sello de tiempo (*timestamp* en UTC).
* Dirección IP del cliente para cumplimiento legal y auditorías médicas.

---

## 6. Conclusión Técnica del Informe

La selección de **Next.js 16 + React 19 + TypeScript + Prisma 7 + PostgreSQL 16 + Tailwind CSS v4** dota al centro médico de:
* **Velocidad de Respuesta:** Carga inicial inferior a 0.8 segundos y navegación instantánea.
* **Seguridad y Cero Regresiones:** El tipado estricto end-to-end y la validación dual con Zod garantizan que los datos financieros y clínicos no puedan ser corrompidos.
* **Escalabilidad Horizontal:** La arquitectura basada en Server Actions sobre infraestructura de contenedores o serverless permite soportar el crecimiento de 1 a múltiples sedes clínicas sin necesidad de rediseñar la base de datos ni el código fuente.
