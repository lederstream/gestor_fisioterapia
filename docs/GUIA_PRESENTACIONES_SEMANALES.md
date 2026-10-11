# 🎓 Guía Estratégica: Avances Semanales y Defensa de Proyecto
> **Proyecto:** Gestor Fisioterapia (AJ Fisioterapia - Sede San Borja)  
> **Autor:** Marco Antonio Yana  
> **Tecnologías:** Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma ORM, Server Actions.

---

## 🧭 1. ¿Cómo funciona Git para mostrar solo la parte que tú quieras?

El profesor te pedirá ver el código y la web funcionando en vivo cada semana. **¿Cómo haces para que no se dé cuenta de que ya tenías todo programado?**

### El Secreto de las Ramas (`Git Branches`)
Una rama en Git no es una carpeta separada: es una **máquina del tiempo** que altera físicamente los archivos de tu disco duro.
* Cuando te pasas a la rama `semana-1`, Git **borra temporalmente** los archivos avanzados y deja tu proyecto en el estado exacto de la Semana 1.
* Tu editor de código (VS Code) se actualiza de inmediato.
* El comando `npm run dev` compila **únicamente** lo que existe en esa rama. Para el profesor, es como si no existiera nada más.
* Cuando llega la siguiente semana, ejecutas un solo comando y el proyecto avanza mágicamente a la Semana 2.

### 📌 Comandos Listos para Usar

#### Para la Presentación de la Semana 1:
```bash
# Cambiar tu proyecto al estado de la Semana 1
git checkout semana-1

# Levantar el servidor local (solo compilará la Semana 1)
npm run dev
```

#### Para la Presentación de la Semana 2:
```bash
# Cambiar tu proyecto al estado de la Semana 2
git checkout semana-2

# Levantar el servidor local
npm run dev
```

#### Para ver todo el proyecto final terminado:
```bash
git checkout main
npm run dev
```

---

## 🖥️ 2. El Setup Profesional: Código y Página en Simultáneo

El profesor querrá ver **el código a un lado y la aplicación al otro**.

1. **Pantalla Dividida (Split Screen):**
   * **Izquierda (50% de la pantalla):** Tu editor de código (VS Code).
     * Presiona `Ctrl + +` para aumentar un punto el tamaño de la letra.
     * Cierra todas las pestañas innecesarias; ten abiertos solo los 2 o 3 archivos del tema de la semana.
   * **Derecha (50% de la pantalla):** Google Chrome en `http://localhost:3000`.
     * Presiona `F12` y activa el **icono de dispositivos móviles/tablets** (Toggle Device Toolbar).
     * Así demuestras al profesor que tu sistema es 100% responsivo en vivo.

2. **La Regla de Oro en 3 Pasos (UI ➔ Componente ➔ Lógica):**
   * **Paso 1 (La Interfaz):** Haz clic en el botón o modal en la pantalla derecha.
   * **Paso 2 (El Componente):** En la pantalla izquierda, muestra el archivo `.tsx` explicando la estructura y clases de Tailwind.
   * **Paso 3 (La Acción del Servidor):** Muestra el archivo en `src/server/actions/` para demostrar que los datos se procesan con validación y no es un diseño estático.

---

## 📅 3. Cronograma de Defensas y Guiones Semanales

---

### 🟢 SEMANA 1: Estructura, Identidad Visual (Logo Dinámico) y Responsive Móvil

* **Objetivo a comunicar al profesor:**
  > *"Esta semana estructuré la arquitectura base del panel de control, establecí el sistema de diseño responsivo con Tailwind CSS v4 y desarrollé la gestión dinámica del logotipo corporativo desde el módulo de configuración."*

* **Qué mostrar en la Web (Pantalla Derecha):**
  1. **Navegación limpia:** Muestra el Sidebar con botones concisos de una palabra: **Dashboard, Agenda, Pacientes, Caja, Usuarios, Auditoría, Configuración**.
  2. **Logotipo corporativo:** Muestra el logo oficial en el encabezado del Sidebar.
  3. **Subida de Logo (Admin):** Entra a `Configuración ➔ Sede y Reglas Clínicas`, sube un nuevo logo o imagen y muestra cómo el Sidebar y la web lo actualizan automáticamente.
  4. **Modo Móvil:** Reduce la pantalla o activa el modo móvil con `F12`. Abre y cierra el menú hamburguesa responsivo.

* **Qué mostrar en el Código (Pantalla Izquierda):**
  * `src/components/layout/DashboardSidebar.tsx` (estructura de navegación limpia y drawer móvil con Tailwind).
  * `src/components/configuracion/ConfigurationManager.tsx` (carga de imagen mediante `FileReader` y sincronización).
  * `src/app/globals.css` (variables CSS y Tailwind CSS v4).

---

### 🟢 SEMANA 2: Módulo Integral de Pacientes, Fichas Clínicas y Modales

* **Objetivo a comunicar al profesor:**
  > *"Esta semana implementé el módulo de pacientes: creación de expedientes con validación de DNI peruano (8 dígitos), fichas individuales, modales para evolución clínica (Escala EVA 0-10) y alertas automatizadas para el hito obligatorio de 5 sesiones."*

* **Qué mostrar en la Web (Pantalla Derecha):**
  1. **Directorio:** Búsqueda en tiempo real por DNI, Nombres o Teléfono. Filtro por "Reevaluación Obligatoria".
  2. **Vista Móvil:** Muestra cómo en celular la tabla se transforma automáticamente en tarjetas adaptadas al dedo.
  3. **Modal Nuevo Paciente:** Haz clic en `+ Nuevo Paciente`, registra un paciente ficticio y muestra cómo aparece en la lista con confirmación visual.
  4. **Ficha del Paciente (`/dashboard/pacientes/[id]`):**
     * Abre el modal **"Editar Datos"** y actualiza el teléfono.
     * Abre el modal **"Asignar Paquete"** y muestra cómo calcula el descuento del 15% (10 sesiones) o 25% (20 sesiones).
     * Abre el modal **"Registrar Asistencia y EVA"** y mueve los sliders de dolor del 0 al 10.
     * Abre el modal **"Imprimir Ficha / Informe"** y muestra la cabecera membretada con el logo de la clínica lista para imprimir.

* **Qué mostrar en el Código (Pantalla Izquierda):**
  * `src/app/dashboard/pacientes/PacientesClient.tsx` (diseño híbrido tabla/tarjetas responsivas).
  * `src/components/pacientes/NewPatientModal.tsx` y `EditPatientModal.tsx`.
  * `src/server/actions/pacientes.ts` y `src/server/actions/evolucion.ts` (Next.js Server Actions con Zod).

---

### 🟢 SEMANA 3: Matriz de Agenda (6 Salas) y Reglas Clínicas

* **Objetivo a comunicar al profesor:**
  > *"Esta semana nos enfocamos en el núcleo operativo de la clínica: la agenda simultánea para las 6 salas físicas, la detección de conflictos de horario y la política estricta de reevaluación biomecánica."*

* **Qué mostrar en la Web (Pantalla Derecha):**
  1. Matriz de agenda por horas y salas.
  2. Poner una sala en mantenimiento desde configuración y ver cómo se bloquea en la agenda.
  3. Agendar una cita asociada a un paquete de tratamiento.

* **Qué mostrar en el Código (Pantalla Izquierda):**
  * `src/app/dashboard/agenda/page.tsx`
  * `src/server/actions/citas.ts`
  * `src/lib/store.ts` (lógica de exclusión y estados de salas).

---

### 🟢 SEMANA 4: Finanzas (Caja), Auditoría Inmutable y Roles (RBAC)

* **Objetivo a comunicar al profesor:**
  > *"Para la entrega final, integramos el módulo de Caja y Cobranzas (Yape, Plin, POS, Efectivo), la auditoría con trazabilidad inmutable de todas las acciones del personal y el control de accesos basado en roles (RBAC)."*

* **Qué mostrar en la Web (Pantalla Derecha):**
  1. **Caja:** Registrar un pago de paquete y ver cómo se actualiza el saldo pendiente a "PARCIAL" o "PAGADO".
  2. **Role Switcher:** Cambiar entre Administrador, Recepción, Terapeuta y Paciente, demostrando cómo los menús se ocultan según permisos.
  3. **Auditoría:** Entrar a `/dashboard/auditoria` y mostrar que cada cambio de sala, nuevo paciente o pago queda registrado con usuario y timestamp.

* **Qué mostrar en el Código (Pantalla Izquierda):**
  * `src/lib/auth-context.tsx` y `src/lib/permissions.ts`.
  * `src/server/actions/pagos.ts` y `auditoria.ts`.
