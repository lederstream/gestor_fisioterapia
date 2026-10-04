// KineFlow Core - Repositorio de Estado en Memoria y Lógica de Negocio
// AJ Fisioterapia (San Borja)

export interface UserItem {
  id: string;
  nombre: string;
  email: string;
  rol: "ADMIN" | "RECEPCION" | "TERAPEUTA" | "PACIENTE";
  especialidad?: string;
  estado: "ACTIVO" | "INACTIVO";
}

export interface SalaItem {
  id: string;
  nombre: string;
  estado: "DISPONIBLE" | "MANTENIMIENTO";
}

export interface ServicioItem {
  id: string;
  nombre: string;
  duracionMinutos: number;
  precioBase: number;
}

export interface PacienteItem {
  id: string;
  dni: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email?: string;
  fechaNacimiento: string;
  contactoEmergencia?: string;
  createdAt: string;
}

export interface TratamientoPaqueteItem {
  id: string;
  pacienteId: string;
  servicioId: string;
  totalSesiones: number; // 1, 10, 20
  sesionesConsumidas: number;
  montoTotal: number;
  montoPagado: number;
  estadoPago: "PENDIENTE" | "PARCIAL" | "PAGADO";
  createdAt: string;
}

export interface CitaItem {
  id: string;
  paqueteId?: string | null;
  terapeutaId: string;
  salaId: string;
  pacienteId: string;
  fechaHoraInicio: string; // ISO string
  fechaHoraFin: string;    // ISO string
  estado: "PROGRAMADA" | "CONFIRMADA" | "ATENDIDA" | "CANCELADA" | "NO_ASISTIO";
  esReevaluacion: boolean;
  createdAt: string;
}

export interface PagoItem {
  id: string;
  paqueteId: string;
  monto: number;
  metodoPago: "EFECTIVO" | "YAPE" | "PLIN" | "POS";
  numeroOperacion?: string | null;
  comprobanteUrl?: string | null;
  estado: "VERIFICADO" | "PENDIENTE";
  fechaPago: string;
}

export interface HistoriaEvolucionItem {
  id: string;
  citaId: string;
  terapeutaId: string;
  evaDolorInicio: number; // 0 - 10
  evaDolorFin: number;    // 0 - 10
  tratamientoAplicado: string;
  notasReevaluacion?: string | null;
  bloqueaAlta: boolean;
  createdAt: string;
}

// Semilla inicial estricta del negocio AJ Fisioterapia
const initialUsers: UserItem[] = [
  // 1 Administrador
  { id: "usr-admin-1", nombre: "Marco Antonio", email: "gerencia@ajfisioterapia.pe", rol: "ADMIN", especialidad: "Gerencia y Dirección Clínica", estado: "ACTIVO" },
  // 2 Recepcionistas
  { id: "usr-rec-1", nombre: "Ana Ramos", email: "recepcion1@ajfisioterapia.pe", rol: "RECEPCION", estado: "ACTIVO" },
  { id: "usr-rec-2", nombre: "Laura Peña", email: "recepcion2@ajfisioterapia.pe", rol: "RECEPCION", estado: "ACTIVO" },
  // 4 Licenciados
  { id: "usr-ter-1", nombre: "Lic. Carlos Mendoza", email: "carlos.mendoza@ajfisioterapia.pe", rol: "TERAPEUTA", especialidad: "Lic. Fisioterapia Deportiva y Readaptación", estado: "ACTIVO" },
  { id: "usr-ter-2", nombre: "Lic. Andrea Rivas", email: "andrea.rivas@ajfisioterapia.pe", rol: "TERAPEUTA", especialidad: "Lic. Terapia Manual Ortopédica y Columna", estado: "ACTIVO" },
  { id: "usr-ter-3", nombre: "Lic. Javier Ponce", email: "javier.ponce@ajfisioterapia.pe", rol: "TERAPEUTA", especialidad: "Lic. Biomecánica y Reeducación Postural", estado: "ACTIVO" },
  { id: "usr-ter-4", nombre: "Lic. Valeria Soto", email: "valeria.soto@ajfisioterapia.pe", rol: "TERAPEUTA", especialidad: "Lic. Neurorehabilitación y Adulto Mayor", estado: "ACTIVO" },
  // 2 Técnicos
  { id: "usr-tec-1", nombre: "Tec. Miguel Torres", email: "miguel.torres@ajfisioterapia.pe", rol: "TERAPEUTA", especialidad: "Técnico en Agentes Físicos y Electroterapia", estado: "ACTIVO" },
  { id: "usr-tec-2", nombre: "Tec. Diana Paredes", email: "diana.paredes@ajfisioterapia.pe", rol: "TERAPEUTA", especialidad: "Técnico en Masoterapia y Crioterapia", estado: "ACTIVO" },
];

// 6 Salas Físicas
const initialSalas: SalaItem[] = [
  { id: "sala-1", nombre: "Sala 1", estado: "DISPONIBLE" },
  { id: "sala-2", nombre: "Sala 2", estado: "DISPONIBLE" },
  { id: "sala-3", nombre: "Sala 3", estado: "DISPONIBLE" },
  { id: "sala-4", nombre: "Sala 4", estado: "DISPONIBLE" },
  { id: "sala-5", nombre: "Sala 5", estado: "DISPONIBLE" },
  { id: "sala-6", nombre: "Sala 6", estado: "DISPONIBLE" },
];

const initialServicios: ServicioItem[] = [
  { id: "serv-1", nombre: "Fisioterapia Traumatológica y Deportiva", duracionMinutos: 45, precioBase: 85.00 },
  { id: "serv-2", nombre: "Terapia Manual Ortopédica y Columna", duracionMinutos: 45, precioBase: 95.00 },
  { id: "serv-3", nombre: "Rehabilitación Neurológica Especializada", duracionMinutos: 60, precioBase: 120.00 },
  { id: "serv-4", nombre: "Descarga Muscular y Readaptación Funcional", duracionMinutos: 45, precioBase: 90.00 },
];

const initialPacientes: PacienteItem[] = [
  { id: "pac-1", dni: "45892011", nombres: "Renato", apellidos: "Salazar Castillo", telefono: "987123456", email: "renato.salazar@gmail.com", fechaNacimiento: "1991-04-12", contactoEmergencia: "Esposa - 987999111", createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: "pac-2", dni: "72109483", nombres: "Camila", apellidos: "Vargas Flores", telefono: "976543210", email: "camila.vargas@hotmail.com", fechaNacimiento: "1998-09-24", contactoEmergencia: "Madre - 976000222", createdAt: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: "pac-3", dni: "10492837", nombres: "Jorge", apellidos: "Alvarez Benavides", telefono: "951234876", email: "jorge.alvarez@outlook.com", fechaNacimiento: "1975-11-05", contactoEmergencia: "Hija - 951111333", createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: "pac-4", dni: "48201934", nombres: "Mariana", apellidos: "Quispe Romero", telefono: "998877665", email: "mariana.quispe@gmail.com", fechaNacimiento: "1994-02-18", contactoEmergencia: "Hermano - 998000444", createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: "pac-5", dni: "08927163", nombres: "Guillermo", apellidos: "Navarro Prado", telefono: "964789123", email: "g.navarro@empresa.pe", fechaNacimiento: "1968-07-30", contactoEmergencia: "Esposa - 964555666", createdAt: new Date(Date.now() - 40 * 86400000).toISOString() },
];

const initialPaquetes: TratamientoPaqueteItem[] = [
  // Renato: Paquete de 10 sesiones, 4 asistidas (la sesión 5 será reevaluación)
  { id: "paq-1", pacienteId: "pac-1", servicioId: "serv-1", totalSesiones: 10, sesionesConsumidas: 4, montoTotal: 700.00, montoPagado: 400.00, estadoPago: "PARCIAL", createdAt: new Date(Date.now() - 25 * 86400000).toISOString() },
  // Camila: Paquete de 20 sesiones, 5 consumidas (requiere reevaluación)
  { id: "paq-2", pacienteId: "pac-2", servicioId: "serv-2", totalSesiones: 20, sesionesConsumidas: 5, montoTotal: 1400.00, montoPagado: 1400.00, estadoPago: "PAGADO", createdAt: new Date(Date.now() - 18 * 86400000).toISOString() },
  // Jorge: Paquete de 10 sesiones, 0 consumidas, pendiente
  { id: "paq-3", pacienteId: "pac-3", servicioId: "serv-3", totalSesiones: 10, sesionesConsumidas: 1, montoTotal: 950.00, montoPagado: 0.00, estadoPago: "PENDIENTE", createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  // Mariana: 1 sesión individual pagada
  { id: "paq-4", pacienteId: "pac-4", servicioId: "serv-4", totalSesiones: 1, sesionesConsumidas: 0, montoTotal: 90.00, montoPagado: 90.00, estadoPago: "PAGADO", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
];

// Generar citas de demostración en fecha de hoy (año actual de simulación)
function getTodaySlot(hour: number, minute: number = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function getTodaySlotEnd(hour: number, durationMinutes: number = 45): string {
  const d = new Date();
  d.setHours(hour, durationMinutes, 0, 0);
  return d.toISOString();
}

const initialCitas: CitaItem[] = [
  // Sala 1: Renato Salazar con Lic. Carlos Mendoza (Sesión 5: REEVALUACIÓN)
  { id: "cita-1", paqueteId: "paq-1", terapeutaId: "usr-ter-1", salaId: "sala-1", pacienteId: "pac-1", fechaHoraInicio: getTodaySlot(8, 0), fechaHoraFin: getTodaySlotEnd(8, 45), estado: "CONFIRMADA", esReevaluacion: true, createdAt: new Date().toISOString() },
  // Sala 2: Camila Vargas con Lic. Andrea Rivas
  { id: "cita-2", paqueteId: "paq-2", terapeutaId: "usr-ter-2", salaId: "sala-2", pacienteId: "pac-2", fechaHoraInicio: getTodaySlot(9, 0), fechaHoraFin: getTodaySlotEnd(9, 45), estado: "PROGRAMADA", esReevaluacion: false, createdAt: new Date().toISOString() },
  // Sala 3: Jorge Alvarez con Lic. Valeria Soto (Neurológica 60m)
  { id: "cita-3", paqueteId: "paq-3", terapeutaId: "usr-ter-4", salaId: "sala-3", pacienteId: "pac-3", fechaHoraInicio: getTodaySlot(10, 0), fechaHoraFin: getTodaySlotEnd(10, 60), estado: "ATENDIDA", esReevaluacion: false, createdAt: new Date().toISOString() },
  // Sala 4: Mariana Quispe con Tec. Miguel Torres
  { id: "cita-4", paqueteId: "paq-4", terapeutaId: "usr-tec-1", salaId: "sala-4", pacienteId: "pac-4", fechaHoraInicio: getTodaySlot(11, 0), fechaHoraFin: getTodaySlotEnd(11, 45), estado: "CONFIRMADA", esReevaluacion: false, createdAt: new Date().toISOString() },
  // Sala 5: Guillermo Navarro con Lic. Javier Ponce
  { id: "cita-5", paqueteId: null, terapeutaId: "usr-ter-3", salaId: "sala-5", pacienteId: "pac-5", fechaHoraInicio: getTodaySlot(15, 0), fechaHoraFin: getTodaySlotEnd(15, 45), estado: "PROGRAMADA", esReevaluacion: false, createdAt: new Date().toISOString() },
  // Sala 1 tarde: Camila Vargas segunda cita
  { id: "cita-6", paqueteId: "paq-2", terapeutaId: "usr-ter-1", salaId: "sala-1", pacienteId: "pac-2", fechaHoraInicio: getTodaySlot(16, 0), fechaHoraFin: getTodaySlotEnd(16, 45), estado: "PROGRAMADA", esReevaluacion: false, createdAt: new Date().toISOString() },
];

const initialPagos: PagoItem[] = [
  { id: "pago-1", paqueteId: "paq-1", monto: 400.00, metodoPago: "YAPE", numeroOperacion: "YAP-892104", comprobanteUrl: null, estado: "VERIFICADO", fechaPago: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: "pago-2", paqueteId: "paq-2", monto: 700.00, metodoPago: "POS", numeroOperacion: "POS-339182", comprobanteUrl: null, estado: "VERIFICADO", fechaPago: new Date(Date.now() - 18 * 86400000).toISOString() },
  { id: "pago-3", paqueteId: "paq-2", monto: 700.00, metodoPago: "PLIN", numeroOperacion: "PLN-554109", comprobanteUrl: null, estado: "VERIFICADO", fechaPago: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: "pago-4", paqueteId: "paq-4", monto: 90.00, metodoPago: "EFECTIVO", numeroOperacion: "EFE-REC-0012", comprobanteUrl: null, estado: "VERIFICADO", fechaPago: new Date(Date.now() - 2 * 86400000).toISOString() },
];

const initialHistorias: HistoriaEvolucionItem[] = [
  // Historia para Jorge Alvarez (cita-3 atendida hoy)
  { id: "evo-1", citaId: "cita-3", terapeutaId: "usr-ter-4", evaDolorInicio: 7, evaDolorFin: 4, tratamientoAplicado: "Movilización pasiva de extremidad inferior derecha, facilitación neuromuscular propioceptiva y electroestimulación TENS 20 min.", notasReevaluacion: null, bloqueaAlta: false, createdAt: new Date().toISOString() },
  // Evolución previa Renato sesión 4
  { id: "evo-2", citaId: "hist-cita-prev-1", terapeutaId: "usr-ter-1", evaDolorInicio: 6, evaDolorFin: 3, tratamientoAplicado: "Punción seca en gemelo medial y estiramientos miofasciales de cadena posterior.", notasReevaluacion: "Paciente refiere notable alivio tras descarga. Próxima sesión (5ta) requiere prueba de dinamometría obligatoria.", bloqueaAlta: false, createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  // Evolución previa Camila sesión 5 (reevaluación)
  { id: "evo-3", citaId: "hist-cita-prev-2", terapeutaId: "usr-ter-2", evaDolorInicio: 5, evaDolorFin: 2, tratamientoAplicado: "Reevaluación de rangos articulares en columna lumbar. Test de Schober mejorado en 2cm. Fortalecimiento de transverso abdominal.", notasReevaluacion: "REEVALUACIÓN COMPLETA SESIÓN 5: Rango de flexión aumentó 15°. Autorizado paso a fase 2 de tonificación.", bloqueaAlta: false, createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
];

// Clase gestora en memoria con operaciones atómicas seguras
class KineFlowStore {
  private users: UserItem[] = [...initialUsers];
  private salas: SalaItem[] = [...initialSalas];
  private servicios: ServicioItem[] = [...initialServicios];
  private pacientes: PacienteItem[] = [...initialPacientes];
  private paquetes: TratamientoPaqueteItem[] = [...initialPaquetes];
  private citas: CitaItem[] = [...initialCitas];
  private pagos: PagoItem[] = [...initialPagos];
  private historias: HistoriaEvolucionItem[] = [...initialHistorias];

  // Métodos de lectura
  getUsers() { return [...this.users]; }
  getTerapeutas() { return this.users.filter((u) => u.rol === "TERAPEUTA" && u.estado === "ACTIVO"); }
  getSalas() { return [...this.salas]; }
  getServicios() { return [...this.servicios]; }
  getPacientes() { return [...this.pacientes]; }
  getPaquetes() { return [...this.paquetes]; }
  getCitas() { return [...this.citas]; }
  getPagos() { return [...this.pagos]; }
  getHistorias() { return [...this.historias]; }

  getPacienteById(id: string) {
    const paciente = this.pacientes.find((p) => p.id === id);
    if (!paciente) return null;

    const paquetes = this.paquetes
      .filter((paq) => paq.pacienteId === id)
      .map((paq) => ({
        ...paq,
        servicio: this.servicios.find((s) => s.id === paq.servicioId)!,
        pagos: this.pagos.filter((p) => p.paqueteId === paq.id),
      }));

    const citas = this.citas
      .filter((c) => c.pacienteId === id)
      .map((c) => ({
        ...c,
        sala: this.salas.find((s) => s.id === c.salaId)!,
        terapeuta: this.users.find((u) => u.id === c.terapeutaId)!,
        evolucion: this.historias.find((h) => h.citaId === c.id) || null,
      }))
      .sort((a, b) => new Date(b.fechaHoraInicio).getTime() - new Date(a.fechaHoraInicio).getTime());

    // Historial EVA
    const historialEva = this.historias
      .filter((h) => citas.some((c) => c.id === h.citaId))
      .map((h) => {
        const cita = citas.find((c) => c.id === h.citaId);
        return {
          id: h.id,
          fecha: cita ? cita.fechaHoraInicio : h.createdAt,
          evaInicio: h.evaDolorInicio,
          evaFin: h.evaDolorFin,
          tratamiento: h.tratamientoAplicado,
          notas: h.notasReevaluacion,
          bloqueaAlta: h.bloqueaAlta,
        };
      })
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    return {
      paciente,
      paquetes,
      citas,
      historialEva,
    };
  }

  // REGLA 1: agendarCita() atómica con validación en tiempo real
  agendarCita(params: {
    pacienteId: string;
    paqueteId?: string | null;
    terapeutaId: string;
    salaId: string;
    fechaHoraInicio: Date;
    duracionMinutos?: number;
    esReevaluacion?: boolean;
  }) {
    const duracion = params.duracionMinutos || 45;
    const inicio = new Date(params.fechaHoraInicio);
    const fin = new Date(inicio.getTime() + duracion * 60000);

    const inicioIso = inicio.toISOString();
    const finIso = fin.toISOString();

    // 1. Validar sala física disponible (no en mantenimiento)
    const sala = this.salas.find((s) => s.id === params.salaId);
    if (!sala) throw new Error("La sala seleccionada no existe.");
    if (sala.estado === "MANTENIMIENTO") {
      throw new Error(`La ${sala.nombre} se encuentra temporalmente en MANTENIMIENTO.`);
    }

    // 2. Control de concurrencia: Validar solapamiento de la SALA
    // Condición de solapamiento: (inicio < existente.fin) && (fin > existente.inicio)
    const solapamientoSala = this.citas.find((c) => {
      if (c.salaId !== params.salaId) return false;
      if (c.estado === "CANCELADA") return false;
      const cInicio = new Date(c.fechaHoraInicio).getTime();
      const cFin = new Date(c.fechaHoraFin).getTime();
      return inicio.getTime() < cFin && fin.getTime() > cInicio;
    });

    if (solapamientoSala) {
      const pacienteSolapado = this.pacientes.find((p) => p.id === solapamientoSala.pacienteId);
      throw new Error(
        `Conflicto de Horario en Sala: La ${sala.nombre} ya tiene una cita reservada (${new Date(solapamientoSala.fechaHoraInicio).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(solapamientoSala.fechaHoraFin).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}) para el paciente ${pacienteSolapado?.nombres || ""}.`
      );
    }

    // 3. Control de concurrencia: Validar solapamiento del TERAPEUTA
    const solapamientoTerapeuta = this.citas.find((c) => {
      if (c.terapeutaId !== params.terapeutaId) return false;
      if (c.estado === "CANCELADA") return false;
      const cInicio = new Date(c.fechaHoraInicio).getTime();
      const cFin = new Date(c.fechaHoraFin).getTime();
      return inicio.getTime() < cFin && fin.getTime() > cInicio;
    });

    if (solapamientoTerapeuta) {
      const terapeuta = this.users.find((u) => u.id === params.terapeutaId);
      throw new Error(
        `Conflicto de Terapeuta: El profesional ${terapeuta?.nombre} ya cuenta con otra atención asignada en ese bloque horario.`
      );
    }

    // 4. Validar saldo del paquete (si se vincula a paquete)
    let esReevaluacionFlag = params.esReevaluacion || false;
    if (params.paqueteId) {
      const paquete = this.paquetes.find((p) => p.id === params.paqueteId);
      if (!paquete) throw new Error("El paquete de sesiones especificado no existe.");

      // Citas activas programadas o atendidas en este paquete
      const citasDelPaquete = this.citas.filter(
        (c) => c.paqueteId === params.paqueteId && c.estado !== "CANCELADA"
      );

      if (citasDelPaquete.length >= paquete.totalSesiones) {
        throw new Error(
          `Saldo de sesiones agotado: El paquete cuenta con ${paquete.totalSesiones} sesiones contratadas y ya tiene ${citasDelPaquete.length} sesiones registradas o programadas.`
        );
      }

      // Regla de reevaluación: Si esta es la 5ta, 10ma, 15va o 20va cita
      const numeroCitaProyectada = citasDelPaquete.length + 1;
      if (numeroCitaProyectada % 5 === 0) {
        esReevaluacionFlag = true;
      }
    }

    // 5. Crear la cita atómicamente
    const nuevaCita: CitaItem = {
      id: `cita-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      paqueteId: params.paqueteId || null,
      terapeutaId: params.terapeutaId,
      salaId: params.salaId,
      pacienteId: params.pacienteId,
      fechaHoraInicio: inicioIso,
      fechaHoraFin: finIso,
      estado: "PROGRAMADA",
      esReevaluacion: esReevaluacionFlag,
      createdAt: new Date().toISOString(),
    };

    this.citas.push(nuevaCita);
    return nuevaCita;
  }

  // REGLA 2: registrarAsistenciaYEvolucion()
  registrarAsistenciaYEvolucion(params: {
    citaId: string;
    terapeutaId: string;
    evaDolorInicio: number;
    evaDolorFin: number;
    tratamientoAplicado: string;
    notasReevaluacion?: string | null;
    completarReevaluacion?: boolean;
  }) {
    const citaIndex = this.citas.findIndex((c) => c.id === params.citaId);
    if (citaIndex === -1) throw new Error("Cita no encontrada.");
    const cita = this.citas[citaIndex];

    // Marcar cita como atendida
    this.citas[citaIndex] = { ...cita, estado: "ATENDIDA" };

    let nuevoConsumo = 0;
    let requiereReevaluacion = false;

    // Actualizar paquete si aplica
    if (cita.paqueteId) {
      const paqIndex = this.paquetes.findIndex((p) => p.id === cita.paqueteId);
      if (paqIndex !== -1) {
        const paq = this.paquetes[paqIndex];
        nuevoConsumo = paq.sesionesConsumidas + 1;
        this.paquetes[paqIndex] = {
          ...paq,
          sesionesConsumidas: nuevoConsumo,
        };

        // Regla clínica estricta: Cada 5 sesiones asistidas se activa reevaluación física obligatoria
        if (nuevoConsumo % 5 === 0) {
          requiereReevaluacion = true;

          // Buscar la siguiente cita programada del paquete para marcarla con esReevaluacion = true
          const siguienteCita = this.citas
            .filter((c) => c.paqueteId === paq.id && c.estado === "PROGRAMADA")
            .sort((a, b) => new Date(a.fechaHoraInicio).getTime() - new Date(b.fechaHoraInicio).getTime())[0];

          if (siguienteCita) {
            const sigIndex = this.citas.findIndex((c) => c.id === siguienteCita.id);
            if (sigIndex !== -1) {
              this.citas[sigIndex] = { ...this.citas[sigIndex], esReevaluacion: true };
            }
          }
        }
      }
    }

    // Si requiere reevaluación y no se proporcionaron notas completas, se activa bloqueo de alta médica
    const bloqueaAlta = requiereReevaluacion && !params.completarReevaluacion;

    const nuevaEvolucion: HistoriaEvolucionItem = {
      id: `evo-${Date.now()}`,
      citaId: cita.id,
      terapeutaId: params.terapeutaId,
      evaDolorInicio: params.evaDolorInicio,
      evaDolorFin: params.evaDolorFin,
      tratamientoAplicado: params.tratamientoAplicado,
      notasReevaluacion: params.notasReevaluacion || (requiereReevaluacion ? "Reevaluación obligatoria de 5 sesiones requerida." : null),
      bloqueaAlta,
      createdAt: new Date().toISOString(),
    };

    this.historias.push(nuevaEvolucion);

    return {
      cita: this.citas[citaIndex],
      evolucion: nuevaEvolucion,
      nuevoConsumo,
      requiereReevaluacion,
      bloqueaAlta,
    };
  }

  // REGLA 3: registrarPago()
  registrarPago(params: {
    paqueteId: string;
    monto: number;
    metodoPago: "EFECTIVO" | "YAPE" | "PLIN" | "POS";
    numeroOperacion?: string | null;
    comprobanteUrl?: string | null;
    estado?: "VERIFICADO" | "PENDIENTE";
  }) {
    const paqIndex = this.paquetes.findIndex((p) => p.id === params.paqueteId);
    if (paqIndex === -1) throw new Error("Paquete o tratamiento no encontrado.");
    const paq = this.paquetes[paqIndex];

    const estadoPagoVerif = params.estado || "VERIFICADO";

    const nuevoPago: PagoItem = {
      id: `pago-${Date.now()}`,
      paqueteId: params.paqueteId,
      monto: params.monto,
      metodoPago: params.metodoPago,
      numeroOperacion: params.numeroOperacion || `${params.metodoPago}-${Date.now().toString().slice(-6)}`,
      comprobanteUrl: params.comprobanteUrl || null,
      estado: estadoPagoVerif,
      fechaPago: new Date().toISOString(),
    };

    this.pagos.push(nuevoPago);

    // Si está verificado, actualizar el acumulado y el estado de cobranza
    if (estadoPagoVerif === "VERIFICADO") {
      const nuevoMontoPagado = Number((paq.montoPagado + params.monto).toFixed(2));
      let nuevoEstadoPago: "PENDIENTE" | "PARCIAL" | "PAGADO" = "PENDIENTE";

      if (nuevoMontoPagado >= paq.montoTotal) {
        nuevoEstadoPago = "PAGADO";
      } else if (nuevoMontoPagado > 0) {
        nuevoEstadoPago = "PARCIAL";
      }

      this.paquetes[paqIndex] = {
        ...paq,
        montoPagado: nuevoMontoPagado,
        estadoPago: nuevoEstadoPago,
      };
    }

    return {
      pago: nuevoPago,
      paquete: this.paquetes[paqIndex],
    };
  }

  // Registro de nuevo paciente
  crearPaciente(data: Omit<PacienteItem, "id" | "createdAt">) {
    const existe = this.pacientes.find((p) => p.dni === data.dni);
    if (existe) throw new Error(`Ya existe un paciente registrado con el DNI ${data.dni}`);

    const nuevo: PacienteItem = {
      ...data,
      id: `pac-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.pacientes.push(nuevo);
    return nuevo;
  }

  // Creación de paquete para paciente
  crearPaquete(params: {
    pacienteId: string;
    servicioId: string;
    totalSesiones: number;
    montoTotal: number;
  }) {
    const nuevoPaq: TratamientoPaqueteItem = {
      id: `paq-${Date.now()}`,
      pacienteId: params.pacienteId,
      servicioId: params.servicioId,
      totalSesiones: params.totalSesiones,
      sesionesConsumidas: 0,
      montoTotal: params.montoTotal,
      montoPagado: 0,
      estadoPago: "PENDIENTE",
      createdAt: new Date().toISOString(),
    };
    this.paquetes.push(nuevoPaq);
    return nuevoPaq;
  }
}

// Instancia singleton global para desarrollo y persistencia en tiempo de ejecución
const globalForStore = globalThis as unknown as { kineFlowStore?: KineFlowStore };
export const dbStore = globalForStore.kineFlowStore ?? new KineFlowStore();
if (process.env.NODE_ENV !== "production") globalForStore.kineFlowStore = dbStore;
