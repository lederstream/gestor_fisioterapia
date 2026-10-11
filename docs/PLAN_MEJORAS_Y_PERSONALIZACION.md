# PLAN MAESTRO DE MEJORAS, HIPER-PERSONALIZACIÓN Y ROADMAP DE EVOLUCIÓN
## Ecosistema Clínico Digital para Centros de Fisioterapia y Rehabilitación
**Caso de Aplicación:** AJ Fisioterapia (San Borja)  
**Autor y Estratega de Software:** Marco Antonio Yana (Lederstream)  
**Fecha:** Octubre 2026  
**Documento Estratégico:** Roadmap de Producto v2.0  

---

## 1. Visión Estratégica: De un Sistema de Gestión a un Ecosistema Clínico Inteligente

El sistema actual resuelve con solidez los dolores operativos primarios: control anti-solapamiento de salas físicas, agenda por turnos, cobranza multicanal, trazabilidad de paquetes de sesiones y control del hito de reevaluación.

Para transformar este producto en una **plataforma de clase mundial líder en el sector salud**, este documento traza una hoja de ruta dividida en **5 pilares estratégicos de mejora e hiper-personalización**:

```
                              ┌────────────────────────────────────────┐
                              │     ECOSISTEMA KINEFLOW ENTERPRISE     │
                              └───────────────────┬────────────────────┘
                                                  │
         ┌──────────────────┬─────────────────────┼────────────────────┬──────────────────┐
         │                  │                     │                    │                  │
         ▼                  ▼                     ▼                    ▼                  ▼
┌─────────────────┐ ┌───────────────┐ ┌───────────────────────┐ ┌──────────────┐ ┌─────────────────┐
│     PILAR 1     │ │    PILAR 2    │ │        PILAR 3        │ │   PILAR 4    │ │     PILAR 5     │
│ Hiper-Personal. │ │ Automatización│ │  Facturación SUNAT    │ │ Inteligencia │ │ Infraestructura │
│ Clínica y Body  │ │ WhatsApp CRM  │ │ Comisiones y Finanzas │ │ Artificial y │ │ Realtime, PWA y │
│  Charts Médicos │ │ & Portal PWA  │ │  Inventario Insumos   │ │ Visión Comp. │ │ Hardening CI/CD │
└─────────────────┘ └───────────────┘ └───────────────────────┘ └──────────────┘ └─────────────────┘
```

---

## 2. PILAR 1: Hiper-Personalización Clínica para Fisioterapia y Kinesiología

Actualmente, las notas de evolución permiten registrar texto y la escala EVA. El siguiente nivel de personalización requiere herramientas visuales y protocolos estandarizados por patología.

### 2.1. Body Chart Anatómico Interactivo (Mapeo Táctil de Dolor y Puntos Gatillo)
* **Problema actual:** El terapeuta describe el dolor por escrito ("dolor lumbar irradiado a pierna derecha"), lo cual es lento y dificulta comparaciones visuales rápidas.
* **Solución propuesta:**
  * Un componente interactivo en Canvas/SVG de la silueta humana (vista anterior, posterior y lateral).
  * **Capas interactivas:**
    1. **Intensidad de Dolor:** Pincel de calor (termograma de dolor con colores según EVA: verde 1-3, amarillo 4-6, rojo 7-10).
    2. **Tipo de Dolor:** Iconos para marcar dolor punzante, sordo, urente (ardor), parestesia (adormecimiento) o rigidez.
    3. **Dermatomas y Miotomas:** Resaltado automático del trayecto de raíces nerviosas (ej. Trayecto ciático L4-S1).
    4. **Puntos Gatillo Miofasciales (Trigger Points):** Marcadores específicos donde se aplicó punción seca o terapia manual instrumentalizada.
  * **Valor clínico:** En la sesión 5 (reevaluación), el sistema coloca el mapa del día 1 al lado del mapa del día 5, evidenciando gráficamente al paciente la reducción de las zonas de dolor.

### 2.2. Goniómetro Digital y Registro de Rangos de Movimiento (ROM)
* **Objetivo:** Cuantificar objetivamente la mejoría biomecánica.
* **Funcionalidad:**
  * Fichas de medición para articulaciones principales (Hombro, Rodilla, Columna Cervical, Tobillo, Cadera).
  * Registro de grados (°): Flexión, Extensión, Abducción, Rotación Interna y Externa.
  * Gráficas de barras comparativas: *Sesión Inicial (90° de flexión) vs Sesión Actual (155° de flexión) vs Rango Fisiológico Normal (180°)*.

### 2.3. Batería de Test Ortopédicos y Funcionales Estandarizados
* Incorporación de plantillas clínicas con checklists de pruebas físicas ortopédicas:
  * **Hombro:** Test de Neer, Hawkins-Kennedy, Jobe, Speed, Yergason.
  * **Rodilla:** Lachman, Cajón anterior/posterior, Pivot-Shift, McMurray.
  * **Columna y Nervios:** Lasègue, Bragard, Slump test, Spurling.
  * **Muñeca:** Test de Phalen y Tinel.
* El terapeuta solo marca **Positivo (+)** o **Negativo (-)**, generando un índice de diagnóstico clínico estructurado.

### 2.4. Módulo de Ejercicios Terapéuticos Domiciliarios (HEP - Home Exercise Program)
* **Objetivo:** Multiplicar la adherencia del paciente fuera del consultorio.
* **Funcionalidad:**
  * Biblioteca clínica de más de 200 ejercicios categorizados (estiramientos, fortalecimiento excéntrico, propiocepción, movilidad activa).
  * Cada ejercicio incluye video en bucle de 15 segundos, series, repeticiones y advertencias de postura.
  * El terapeuta selecciona los 3 o 4 ejercicios ideales para el paciente con 2 clics.
  * El sistema genera una ficha digital enviada al WhatsApp del paciente, donde puede marcar los ejercicios completados desde su celular.

### 2.5. Consentimiento Informado Digital con Firma Biométrica en Tablet
* Generación de formatos digitales de consentimiento para terapias invasivas o de alta intensidad:
  * Punción Seca (Dry Needling).
  * Fisioterapia Invasiva / Electrolisis Percutánea (EPI/EPTE).
  * Manipulación articular de alta velocidad (thrust).
* El paciente lee el documento en la recepción o en una tablet y firma con su dedo o lápiz óptico; el PDF se adjunta automáticamente a su expediente con sello de tiempo y geolocalización.

---

## 3. PILAR 2: Automatización de la Experiencia del Paciente (Patient Journey & CRM)

El mayor costo oculto de una clínica de fisioterapia es el **ausentismo (*no-show*)** y la **deserción de paquetes antes de la reevaluación**.

### 3.1. Integración con WhatsApp Business Cloud API Oficial (Meta)
Automatización completa sin intervención humana de recepción:
1. **Confirmación Inmediata de Reserva:** Tras agendar, mensaje con fecha, hora, terapeuta, dirección de San Borja y botón de "¿Cómo llegar en Waze/Google Maps?".
2. **Recordatorio Preventivo Inteligente (24h y 2h antes):**
   * Mensaje con botones interactivos: `[✅ Confirmar Asistencia]` | `[🔄 Reprogramar Turno]`.
   * Si presiona "Confirmar", la cita en el sistema cambia automáticamente a estado `CONFIRMADA` con indicador verde en la matriz de salas.
   * Si presiona "Reprogramar", abre el portal de horarios disponibles para liberar la sala de inmediato a otro paciente en lista de espera.
3. **Seguimiento Post-Sesión (1 hora después):**
   * Envío de recomendaciones personalizadas (ej: "Aplicar compresas frías por 15 min") y enlace a sus ejercicios en casa.
4. **Rescate de Pacientes Inactivos (Anti-Abandono):**
   * Si un paciente compró un paquete de 10 sesiones y no agenda cita durante 10 días continuos, el bot le envía un mensaje personalizado motivándolo a continuar para no perder el progreso alcanzado.

### 3.2. Progressive Web App (PWA) para el Paciente
* El paciente no necesita descargar una app pesada de Google Play o App Store.
* Desde el navegador de su celular presiona *"Agregar a Pantalla de Inicio"* y obtiene una app nativa con icono de AJ Fisioterapia.
* **Capacidades del portal móvil:**
  * Ver su carnet digital de sesiones consumidas (ej: 4 de 10 completadas).
  * Ver la gráfica de cómo ha bajado su dolor EVA desde el primer día.
  * Descargar sus recibos de pago y reportes médicos en PDF.
  * Notificaciones push de recordatorio.

---

## 4. PILAR 3: Finanzas Avanzadas, Facturación SUNAT e Inventario

Para escalar la clínica o abrir segundas sedes, la administración financiera debe ser completamente autónoma y transparente.

### 4.1. Facturación Electrónica Automática SUNAT (Perú)
* **Integración API con Proveedor de Servicios Electrónicos (PSE / OSE):** Conexión vía API REST con plataformas como Nubefact, ApisPeru o Facturador SUNAT.
* **Flujo Operativo:**
  1. Recepción registra el cobro en caja (por ejemplo: "Paquete 10 Sesiones Lumbalgia - S/ 750").
  2. Si el cliente solicita **Boleta de Venta**: Ingreso de DNI con consulta automática a RENIEC para autocompletar nombres.
  3. Si solicita **Factura**: Ingreso de RUC con consulta automática a SUNAT para autocompletar Razón Social y Dirección Fiscal.
  4. El sistema timbra electrónicamente el comprobante, almacena el CDR (Constancia de Recepción de SUNAT) y envía el PDF y XML al WhatsApp del cliente al instante.

### 4.2. Módulo de Comisiones y Rendimiento de Fisioterapeutas
* En los centros de fisioterapia, los terapeutas frecuentemente perciben honorarios variables según su producción.
* **Mecanismos configurables por usuario:**
  * **Comisión Fija:** Ej. S/ 25.00 por cada sesión efectivamente atendida.
  * **Comisión Porcentual:** Ej. 35% o 40% del valor facturado del servicio.
  * **Incentivo por Reevaluación Exitosa:** Bono adicional si el paciente completa su paquete de 10 o 20 sesiones.
* **Tablero para el Terapeuta:** Puede ver en su pantalla su saldo acumulado en tiempo real sin tener que consultar a administración.
* **Cierre de Planilla Quincenal:** Reporte consolidado para gerencia con un clic.

### 4.3. Control de Inventario y Kárdex de Insumos Clínicos
* Cada sesión de fisioterapia consume insumos desechables y terapéuticos con costo directo:
  * Metros de Kinesiotape (venda neuromuscular).
  * Pares de electrodos autoadhesivos para TENS / EMS.
  * Agujas de punción seca estériles.
  * Frascos de gel conductor y cremas desinflamantes.
* **Descuento Automático:** Al marcar la cita como atendida con el tratamiento aplicado, el sistema descuenta automáticamente del inventario los insumos vinculados al protocolo.
* Alerta visual cuando un insumo está por debajo del stock mínimo de seguridad.

---

## 5. PILAR 4: Inteligencia Artificial y Visión por Computadora

La incorporación de IA no es estética: debe ahorrar hasta 2 horas diarias de trabajo administrativo a cada fisioterapeuta.

### 5.1. Asistente de Dictado Médico y Estructuración SOAP con IA (Whisper + Gemini)
* **Flujo del Fisioterapeuta:**
  * Al terminar los 45 minutos de terapia, el profesional presiona el botón del micrófono y habla durante 40 segundos en lenguaje coloquial:
    > *"Hoy vino Don Carlos con dolor de cuello mucho menor, EVA 2. Le aplicamos terapia manual en trapecio superior, corrientes interferenciales por 15 minutos y completó ejercicios isométricos sin molestia. Ya puede iniciar la fase de fortalecimiento la próxima semana."*
  * **Procesamiento de IA:** El modelo procesa el audio y genera instantáneamente la ficha clínica formal bajo el estándar internacional **SOAP**:
    * **S (Subjetivo):** Paciente refiere mejoría sintomática notable en región cervical; dolor calificado en EVA 2/10.
    * **O (Objetivo):** Trapecio superior normotónico tras movilización manual; sin signos de radiculopatía activa.
    * **A (Análisis):** Evolución clínica altamente favorable de cervicalgia mecánica en sesión 4.
    * **P (Plan):** Continuar fortalecimiento isométrico y progresar a cargas resistidas en sesión 5 (reevaluación programada).

### 5.2. Análisis Postural por Visión Artificial (MediaPipe / Pose Estimation)
* Utilizando la cámara de una tablet o smartphone en recepción o sala de evaluación:
* El paciente se coloca frente a una pared cuadriculada.
* El algoritmo de visión por computadora detecta puntos clave articulares (*landmarks*) en 3 vistas (frente, perfil, espalda) y calcula automáticamente:
  * Ángulo de cabeza adelantada (antepulsión cervical).
  * Desnivel de hombros en grados (°).
  * Báscula y rotación pélvica.
  * Ángulo Q y valgo/varo de rodilla.
* Genera una lámina visual de "Antes y Después" para entregar al paciente, reforzando el valor tangible del servicio.

### 5.3. Modelo Predictivo de Abandono (Machine Learning Churn Prediction)
* Algoritmo de clasificación que detecta patrones en los datos históricos:
  * Pacientes cuyo EVA no se reduce en las primeras 3 sesiones.
  * Pacientes que cancelan o reprograman más de 2 veces consecutivas.
  * Pacientes con intervalos mayores a 5 días entre sesiones continuas.
* El sistema enciende un indicador de **"Riesgo de Abandono"** en el panel de recepción para que la administradora tome contacto proactivo y preserve al paciente.

---

## 6. PILAR 5: Mejoras Técnicas, Arquitectura y Calidad de Software

Para llevar el código a nivel bancario/médico de misión crítica:

| Área Técnica | Situación Actual | Mejora Propuesta | Impacto Técnico |
| :--- | :--- | :--- | :--- |
| **Tiempo Real (Realtime)** | Actualización bajo petición (recarga de página) | Integración con **Supabase Realtime / WebSockets** | Cuando Recepción 1 mueve o cancela una cita, las pantallas de Recepción 2 y de las salas de los terapeutas se actualizan al milisegundo sin recargar. |
| **Generación de PDFs** | Impresión nativa del navegador vía CSS `@media print` | Motor headless **`@react-pdf/renderer`** en el servidor | Generación de PDFs perfectos con diseño corporativo inmutable, firma digital con código QR de verificación médica y envío directo por correo o WhatsApp. |
| **Autenticación y Seguridad** | Simulación en contexto de pruebas y estado | Implementación de **NextAuth v5 (Auth.js) / Supabase Auth** con 2FA | Autenticación real con JWT cifrados, soporte para Google Workspace institucional, bloqueo por intentos fallidos y tokens revocables. |
| **Testing Automatizado** | Pruebas manuales | Suite de pruebas unitarias con **Vitest** y pruebas end-to-end con **Playwright** | Automatización de pruebas de regresión: verificación de que nunca se permita agendar dos citas en la misma sala física ni cobrar montos negativos. |
| **Arquitectura Multi-Sede** | Datos vinculados a la sede central de San Borja | Campo `sedeId` en todas las tablas con selector global | Permite abrir nuevas sucursales (Miraflores, Surco, Camacho) compartiendo expedientes de pacientes y centralizando la contabilidad. |

---

## 7. Cronograma Sugerido de Implementación (Roadmap por Fases)

```
FASE 1 (Mes 1 - Fundamentos Críticos)
├── Sincronización en tiempo real (WebSockets para agenda multi-recepción)
├── Integración de WhatsApp Business Cloud API para confirmación y recordatorios
└── Autenticación real con NextAuth / Supabase Auth y control de sesiones activas

FASE 2 (Mes 2 - Potencia Clínica y Facturación)
├── Facturación electrónica SUNAT (Boletas y Facturas automáticas)
├── Body Chart interactivo (mapeo táctil de dolor y puntos gatillo)
└── Módulo de liquidación y comisiones por terapeuta

FASE 3 (Mes 3 - Experiencia y Retención)
├── Portal PWA para el paciente con carnet digital y curva de dolor EVA
├── Biblioteca de Ejercicios Terapéuticos Domiciliarios (HEP en video)
└── Control de inventario de insumos clínicos con descuento automático

FASE 4 (Mes 4 - Inteligencia Artificial Avanzada)
├── Dictado por voz a formato SOAP con IA generativa
├── Análisis postural con visión artificial por cámara
└── Reportes ejecutivos para dirección con proyección de ingresos y retención
```

---

## 8. Conclusión

El Gestor de Fisioterapia cuenta con una base arquitectónica robusta y moderna. Al implementar las mejoras detalladas en este plan maestro, la clínica no solo resolverá el 100% de su operativa diaria, sino que construirá una ventaja competitiva diferencial insuperable: **reducción del ausentismo a menos del 3%, retención superior al 85% de los pacientes y cero fricciones en la facturación y auditoría médica.**
