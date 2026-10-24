# 📋 REGISTRO DE DECISIONES DE NEGOCIO Y PREGUNTAS CLAVE PARA EL CLIENTE
**Proyecto:** KineFlow Core — Sistema de Gestión Clínica y Transaccional  
**Institución:** AJ Fisioterapia (Sede San Borja, Lima - Perú)  
**Módulo:** Portal Web de Pacientes y Agendamiento de Citas  
**Fecha de Actualización:** Octubre 2026  

---

## 🎯 1. REGLAS DE NEGOCIO: ¿QUIÉN PUEDE SACAR CITAS Y BAJO QUÉ CONDICIONES?

Para proteger la operatividad de las **6 salas físicas simultáneas** y mantener un índice de ausentismo (*no-shows*) inferior al 5%, se definen las siguientes reglas clínicas:

### 1.1 Perfil de Usuarios Autorizados
1. **Pacientes Nuevos (Primera Cita / Evaluación Integral):**
   * **Requisitos obligatorios:** Documento Nacional de Identidad (DNI peruano de 8 dígitos numéricos válidos), Nombres y Apellidos completos, y número de celular / WhatsApp de contacto activo.
   * **Efecto en el sistema:** Crea automáticamente la ficha de paciente en la base de datos PostgreSQL, dejando el historial clínico listo para la primera evaluación fisioterapéutica.
2. **Pacientes Continuadores (Con tratamiento en curso):**
   * Al ingresar su DNI, el sistema detecta si ya cuenta con un **Tratamiento o Paquete activo (10 o 20 sesiones)**.
   * La cita se vincula a su paquete, descontando la sesión consumida al completarse y respetando la regla clínica de reevaluación obligatoria cada 5 sesiones.

---

### 1.2 Condiciones Operativas y Restricciones Clínicas
* **⏰ Anticipación Mínima (Regla Anti-Improvisación):**
  * Ninguna cita puede ser solicitada con menos de **2 horas de anticipación**. Esto permite a recepción organizar el terapeuta colegiado y desinfectar la sala correspondiente.
* **📅 Respeto del Calendario Clínico:**
  * **Lunes a Viernes:** 08:00 – 20:00 (última sesión inicia a las 19:00).
  * **Sábados:** 08:00 – 14:00 (última sesión inicia a las 13:00).
  * **Domingos:** Cerrado (bloqueo automático en calendario).
* **🔒 Capacidad Física Finita (Anti-Solapamiento):**
  * Máximo **6 sesiones concurrentes** en San Borja (1 por cada sala física). Si las 6 salas están ocupadas en una hora dada, el sistema oculta o bloquea ese bloque horario.
* **🛡️ Modelo de Pre-Reserva con Confirmación:**
  * La solicitud ingresa con estado **`PROGRAMADA`** y recepción valida la disponibilidad o envía confirmación automática por WhatsApp.
  * Si el paciente no confirma su asistencia 3 horas antes, recepción puede liberar la sala para pacientes en lista de espera.

---

## 🗺️ 2. MOMENTOS DE CONVERSIÓN EN LA LANDING PAGE

El paciente experimenta diferentes necesidades según su momento de navegación:

```
[ MOMENTO 1: INMEDIATO ]        ➔   [ MOMENTO 2: COMPARATIVO ]    ➔   [ MOMENTO 3: CIERRE / ACCESIBILIDAD ]
Navbar Sticky + Hero Principal        Tarjetas de Servicios                Barra Flotante Móvil + Banner Final
"Vengo decidido o tengo dolor"        "Comparo precios y dolor"             "Navego en celular o leí todo"
```

1. **Momento 1 (Top of Page / Primeros 5 segundos):**
   * Para pacientes referidos o recurrentes que ya conocen la clínica.
   * Botón visible en el Navbar superior (*"Reservar cita"*) y en el Hero principal (*"Reservar evaluación"*).
2. **Momento 2 (Middle of Page / Tarjetas de Servicios):**
   * Para pacientes que buscan la solución a su dolencia específica (columna, rehabilitación deportiva, terapia articular).
   * Cada tarjeta cuenta con un **único botón de acción destacado** (*"Reservar este Servicio"*), con precio regular tachado y precio promocional anclado.
3. **Momento 3 (Dispositivos Móviles / Scroll Profundo):**
   * **Barra Flotante Inferior (Sticky Bar):** En celulares, al hacer scroll desaparece el menú superior. Una barra flotante fijada al borde inferior permite agendar con un solo toque del pulgar sin perder tiempo.
4. **Momento 4 (Bottom of Page / Pre-Footer):**
   * Para usuarios que leyeron la experiencia clínica, dirección en San Borja y testimonios. Un banner de cierre refuerza la decisión (*"Reservar mi evaluación"*).

---

## 🖲️ 3. MATRIZ DE BOTONES Y REDIRECCIÓN EN LA WEB

| Ubicación | Texto del Botón | Estilo / Componente | Acción Ejecutada |
| :--- | :--- | :--- | :--- |
| **Navbar Superior (Desktop)** | `Reservar cita` | Botón verde institucional con flecha | Abre el **Modal de Pre-Reserva Rápida** en la misma página. |
| **Menú Móvil Desplegable** | `Reservar cita` | Botón verde institucional | Cierra el menú y abre el **Modal de Pre-Reserva Rápida**. |
| **Hero Principal** | `Reservar evaluación` | Botón cápsula grande de alto impacto | Abre el **Modal de Pre-Reserva Rápida**. |
| **Hero (Contacto secundario)** | `Teléfono / WhatsApp` | Enlace con icono de teléfono | Redirige al WhatsApp oficial de recepción. |
| **Tarjeta de Servicio (Grid)** | `Reservar este Servicio` | Botón unificado a lo ancho con icono calendario | Abre el Modal con el **servicio pre-seleccionado**. |
| **Tarjeta de Servicio (Esquina)** | Flecha `↗` | Círculo sutil en borde superior | Enlace directo a la página completa `/reservas?servicio=id`. |
| **Barra Flotante Móvil** | `Reservar Cita` | Píldora fija inferior en smartphones | Abre el **Modal de Pre-Reserva Rápida** al instante. |
| **Banner Pre-Footer** | `Reservar mi evaluación` | Botón blanco destacado con icono calendario | Abre el **Modal de Pre-Reserva Rápida**. |

---

## ❓ 4. PREGUNTAS ESTRATÉGICAS PARA VALIDAR CON LA DIRECCIÓN DE LA CLÍNICA

A continuación se detallan las preguntas recomendadas para la próxima reunión con la dirección de AJ Fisioterapia:

1. **Modalidad de Cobranza de la Primera Cita:**
   * ¿Se cobrará el 100% de la sesión de evaluación en la recepción física al momento de llegar, o se planea integrar una pasarela de pago (Culqi/MercadoPago) para adelantar un abono de reserva de S/ 20?
2. **Política de Tolerancia y Cancelación:**
   * ¿Cuántos minutos de tolerancia tiene el paciente antes de marcar la cita como inasistencia / ausente (ej. 15 minutos)?
   * ¿Con cuántas horas de anticipación se permite al paciente cancelar o reprogramar sin penalidad?
3. **Pacientes de Aseguradoras / EPS:**
   * ¿El centro trabaja exclusivamente con particulares o atiende pacientes con carta de garantía de Pacífico, Rímac o Mapfre? (Esto determinaría si solicitamos campo de aseguradora en el formulario de citas).
4. **Asignación Automática de Terapeutas:**
   * Actualmente el sistema asigna automáticamente la primera sala física disponible y el terapeuta colegiado de turno. ¿Se prefiere que el paciente pueda elegir a su terapeuta de preferencia o que recepción asigne internamente según la especialidad del diagnóstico?
