// KineFlow Core - Repositorio de Estado en Memoria y Motor de Negocio
// AJ Fisioterapia (San Borja) - Nivel Senior con Auditoría y Configuración

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
  equipamiento?: string;
  capacidadSimultanea?: number;
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

// Entidad de Auditoría y Trazabilidad (Audit Log)
export interface AuditLogItem {
  id: string;
  usuarioId?: string | null;
  usuarioNombre: string;
  usuarioRol: "ADMIN" | "RECEPCION" | "TERAPEUTA" | "PACIENTE";
  accion: string; // CITA_CREADA, CITA_ESTADO_CAMBIADO, PAGO_REGISTRADO, ASISTENCIA_REGISTRADA, REEVALUACION_ACREDITADA, CONFIG_ACTUALIZADA, SALA_ESTADO_CAMBIADO
  modulo: "AGENDA" | "CAJA" | "HISTORIA_CLINICA" | "CONFIGURACION" | "SISTEMA";
  entidadId?: string | null;
  detalles: string;
  ipAddress?: string;
  createdAt: string;
}

// Configuración Maestra del Centro Clínico
export interface ConfiguracionClinicaItem {
  id: string;
  razonSocial: string;
  nombreComercial: string;
  ruc: string;
  direccion: string;
  telefono: string;
  whatsapp: string;
  horaApertura: string;
  horaCierre: string;
  intervaloMinutos: number;
  frecuenciaReevaluacion: number;
  bloqueoAltaReevaluacion: boolean;
  totalSalasFisicas: number;
  updatedAt: string;
}

// Semilla inicial estricta del negocio AJ Fisioterapia
const initialUsers: UserItem[] = [
  { id: "usr-admin-1", nombre: "Marco Antonio", email: "gerencia@ajfisioterapia.pe", rol: "ADMIN", especialidad: "Gerencia y Dirección Clínica", estado: "ACTIVO" },
  { id: "usr-rec-1", nombre: "Ana Ramos", email: "recepcion1@ajfisioterapia.pe", rol: "RECEPCION", estado: "ACTIVO" },
  { id: "usr-rec-2", nombre: "Laura Peña", email: "recepcion2@ajfisioterapia.pe", rol: "RECEPCION", estado: "ACTIVO" },
  { id: "usr-ter-1", nombre: "Lic. Carlos Mendoza", email: "carlos.mendoza@ajfisioterapia.pe", rol: "TERAPEUTA", especialidad: "Lic. Fisioterapia Deportiva y Readaptación", estado: "ACTIVO" },
  { id: "usr-ter-2", nombre: "Lic. Andrea Rivas", email: "andrea.rivas@ajfisioterapia.pe", rol: "TERAPEUTA", especialidad: "Lic. Terapia Manual Ortopédica y Columna", estado: "ACTIVO" },
  { id: "usr-ter-3", nombre: "Lic. Javier Ponce", email: "javier.ponce@ajfisioterapia.pe", rol: "TERAPEUTA", especialidad: "Lic. Biomecánica y Reeducación Postural", estado: "ACTIVO" },
  { id: "usr-ter-4", nombre: "Lic. Valeria Soto", email: "valeria.soto@ajfisioterapia.pe", rol: "TERAPEUTA", especialidad: "Lic. Neurorehabilitación y Adulto Mayor", estado: "ACTIVO" },
  { id: "usr-tec-1", nombre: "Tec. Miguel Torres", email: "miguel.torres@ajfisioterapia.pe", rol: "TERAPEUTA", especialidad: "Técnico en Agentes Físicos y Electroterapia", estado: "ACTIVO" },
  { id: "usr-tec-2", nombre: "Tec. Diana Paredes", email: "diana.paredes@ajfisioterapia.pe", rol: "TERAPEUTA", especialidad: "Técnico en Masoterapia y Crioterapia", estado: "ACTIVO" },
  { id: "usr-pac-1", nombre: "Renato Salazar", email: "renato.salazar@gmail.com", rol: "PACIENTE", especialidad: "Paciente / Cliente Titular", estado: "ACTIVO" },
];

const initialSalas: SalaItem[] = [
  { id: "sala-1", nombre: "Sala 1", estado: "DISPONIBLE", equipamiento: "Camilla hidráulica, TENS, Ultrasonido terapéutico", capacidadSimultanea: 1 },
  { id: "sala-2", nombre: "Sala 2", estado: "DISPONIBLE", equipamiento: "Camilla quiropráctica, Láser de alta intensidad", capacidadSimultanea: 1 },
  { id: "sala-3", nombre: "Sala 3", estado: "DISPONIBLE", equipamiento: "Gimnasio funcional, Espalderas, Balones bobath", capacidadSimultanea: 1 },
  { id: "sala-4", nombre: "Sala 4", estado: "DISPONIBLE", equipamiento: "Crioterapia compresiva Game Ready, Magnetoterapia", capacidadSimultanea: 1 },
  { id: "sala-5", nombre: "Sala 5", estado: "DISPONIBLE", equipamiento: "Tracción cervical y lumbar computarizada", capacidadSimultanea: 1 },
  { id: "sala-6", nombre: "Sala 6", estado: "DISPONIBLE", equipamiento: "Punción seca, Ondas de choque focales", capacidadSimultanea: 1 },
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
  { id: "paq-1", pacienteId: "pac-1", servicioId: "serv-1", totalSesiones: 10, sesionesConsumidas: 4, montoTotal: 700.00, montoPagado: 400.00, estadoPago: "PARCIAL", createdAt: new Date(Date.now() - 25 * 86400000).toISOString() },
  { id: "paq-2", pacienteId: "pac-2", servicioId: "serv-2", totalSesiones: 20, sesionesConsumidas: 5, montoTotal: 1400.00, montoPagado: 1400.00, estadoPago: "PAGADO", createdAt: new Date(Date.now() - 18 * 86400000).toISOString() },
  { id: "paq-3", pacienteId: "pac-3", servicioId: "serv-3", totalSesiones: 10, sesionesConsumidas: 1, montoTotal: 950.00, montoPagado: 0.00, estadoPago: "PENDIENTE", createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: "paq-4", pacienteId: "pac-4", servicioId: "serv-4", totalSesiones: 1, sesionesConsumidas: 0, montoTotal: 90.00, montoPagado: 90.00, estadoPago: "PAGADO", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
];

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
  { id: "cita-1", paqueteId: "paq-1", terapeutaId: "usr-ter-1", salaId: "sala-1", pacienteId: "pac-1", fechaHoraInicio: getTodaySlot(8, 0), fechaHoraFin: getTodaySlotEnd(8, 45), estado: "CONFIRMADA", esReevaluacion: true, createdAt: new Date().toISOString() },
  { id: "cita-2", paqueteId: "paq-2", terapeutaId: "usr-ter-2", salaId: "sala-2", pacienteId: "pac-2", fechaHoraInicio: getTodaySlot(9, 0), fechaHoraFin: getTodaySlotEnd(9, 45), estado: "PROGRAMADA", esReevaluacion: false, createdAt: new Date().toISOString() },
  { id: "cita-3", paqueteId: "paq-3", terapeutaId: "usr-ter-4", salaId: "sala-3", pacienteId: "pac-3", fechaHoraInicio: getTodaySlot(10, 0), fechaHoraFin: getTodaySlotEnd(10, 60), estado: "ATENDIDA", esReevaluacion: false, createdAt: new Date().toISOString() },
  { id: "cita-4", paqueteId: "paq-4", terapeutaId: "usr-tec-1", salaId: "sala-4", pacienteId: "pac-4", fechaHoraInicio: getTodaySlot(11, 0), fechaHoraFin: getTodaySlotEnd(11, 45), estado: "CONFIRMADA", esReevaluacion: false, createdAt: new Date().toISOString() },
  { id: "cita-5", paqueteId: null, terapeutaId: "usr-ter-3", salaId: "sala-5", pacienteId: "pac-5", fechaHoraInicio: getTodaySlot(15, 0), fechaHoraFin: getTodaySlotEnd(15, 45), estado: "PROGRAMADA", esReevaluacion: false, createdAt: new Date().toISOString() },
  { id: "cita-6", paqueteId: "paq-2", terapeutaId: "usr-ter-1", salaId: "sala-1", pacienteId: "pac-2", fechaHoraInicio: getTodaySlot(16, 0), fechaHoraFin: getTodaySlotEnd(16, 45), estado: "PROGRAMADA", esReevaluacion: false, createdAt: new Date().toISOString() },
];

const initialPagos: PagoItem[] = [
  { id: "pago-1", paqueteId: "paq-1", monto: 400.00, metodoPago: "YAPE", numeroOperacion: "YAP-892104", comprobanteUrl: null, estado: "VERIFICADO", fechaPago: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: "pago-2", paqueteId: "paq-2", monto: 700.00, metodoPago: "POS", numeroOperacion: "POS-339182", comprobanteUrl: null, estado: "VERIFICADO", fechaPago: new Date(Date.now() - 18 * 86400000).toISOString() },
  { id: "pago-3", paqueteId: "paq-2", monto: 700.00, metodoPago: "PLIN", numeroOperacion: "PLN-554109", comprobanteUrl: null, estado: "VERIFICADO", fechaPago: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: "pago-4", paqueteId: "paq-4", monto: 90.00, metodoPago: "EFECTIVO", numeroOperacion: "EFE-REC-0012", comprobanteUrl: null, estado: "VERIFICADO", fechaPago: new Date(Date.now() - 2 * 86400000).toISOString() },
];

const initialHistorias: HistoriaEvolucionItem[] = [
  { id: "evo-1", citaId: "cita-3", terapeutaId: "usr-ter-4", evaDolorInicio: 7, evaDolorFin: 4, tratamientoAplicado: "Movilización pasiva de extremidad inferior derecha, facilitación neuromuscular propioceptiva y electroestimulación TENS 20 min.", notasReevaluacion: null, bloqueaAlta: false, createdAt: new Date().toISOString() },
  { id: "evo-2", citaId: "hist-cita-prev-1", terapeutaId: "usr-ter-1", evaDolorInicio: 6, evaDolorFin: 3, tratamientoAplicado: "Punción seca en gemelo medial y estiramientos miofasciales de cadena posterior.", notasReevaluacion: "Paciente refiere notable alivio tras descarga. Próxima sesión (5ta) requiere prueba de dinamometría obligatoria.", bloqueaAlta: false, createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "evo-3", citaId: "hist-cita-prev-2", terapeutaId: "usr-ter-2", evaDolorInicio: 5, evaDolorFin: 2, tratamientoAplicado: "Reevaluación de rangos articulares en columna lumbar. Test de Schober mejorado en 2cm. Fortalecimiento de transverso abdominal.", notasReevaluacion: "REEVALUACIÓN COMPLETA SESIÓN 5: Rango de flexión aumentó 15°. Autorizado paso a fase 2 de tonificación.", bloqueaAlta: false, createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
];

const initialConfiguracion: ConfiguracionClinicaItem = {
  id: "config-principal",
  razonSocial: "AJ Fisioterapia S.A.C.",
  nombreComercial: "AJ Fisioterapia",
  ruc: "20608912345",
  direccion: "Av. Guardia Civil 520, San Borja, Lima",
  telefono: "(01) 475-2010",
  whatsapp: "+51 987 654 321",
  horaApertura: "08:00",
  horaCierre: "20:00",
  intervaloMinutos: 45,
  frecuenciaReevaluacion: 5, // Cada 5 sesiones asistidas
  bloqueoAltaReevaluacion: true,
  totalSalasFisicas: 6,
  updatedAt: new Date().toISOString(),
};

const initialAuditLogs: AuditLogItem[] = [
  {
    id: "log-1",
    usuarioId: "usr-admin-1",
    usuarioNombre: "Marco Antonio (Administrador)",
    usuarioRol: "ADMIN",
    accion: "SISTEMA_INICIALIZADO",
    modulo: "SISTEMA",
    entidadId: "core-setup",
    detalles: "Inicialización del sistema KineFlow Core para AJ Fisioterapia Sede San Borja con 6 salas operativas.",
    ipAddress: "192.168.1.100",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "log-2",
    usuarioId: "usr-rec-1",
    usuarioNombre: "Ana Ramos (Recepción)",
    usuarioRol: "RECEPCION",
    accion: "PAGO_REGISTRADO",
    modulo: "CAJA",
    entidadId: "pago-1",
    detalles: "Cobro verificado de S/. 400.00 mediante Yape (Op: YAP-892104) para paciente Renato Salazar (Paquete 10 sesiones).",
    ipAddress: "192.168.1.105",
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    id: "log-3",
    usuarioId: "usr-rec-2",
    usuarioNombre: "Laura Peña (Recepción)",
    usuarioRol: "RECEPCION",
    accion: "CITA_CREADA",
    modulo: "AGENDA",
    entidadId: "cita-1",
    detalles: "Agendamiento en Sala 1 (08:00 - 08:45) para paciente Renato Salazar con Lic. Carlos Mendoza. Bandera de Reevaluación activa.",
    ipAddress: "192.168.1.106",
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: "log-4",
    usuarioId: "usr-ter-4",
    usuarioNombre: "Lic. Valeria Soto (Terapeuta)",
    usuarioRol: "TERAPEUTA",
    accion: "ASISTENCIA_REGISTRADA",
    modulo: "HISTORIA_CLINICA",
    entidadId: "cita-3",
    detalles: "Atención completada para Jorge Alvarez en Sala 3. Escala EVA inicial: 7/10, final: 4/10. Tratamiento TENS y FNP aplicado.",
    ipAddress: "192.168.1.112",
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: "log-5",
    usuarioId: "usr-ter-2",
    usuarioNombre: "Lic. Andrea Rivas (Terapeuta)",
    usuarioRol: "TERAPEUTA",
    accion: "REEVALUACION_ACREDITADA",
    modulo: "HISTORIA_CLINICA",
    entidadId: "paq-2",
    detalles: "Reevaluación física sesión 5 completada para Camila Vargas. Rangos articulares lumbares incrementados en 15 grados.",
    ipAddress: "192.168.1.110",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
];

class KineFlowStore {
  private users: UserItem[] = [...initialUsers];
  private salas: SalaItem[] = [...initialSalas];
  private servicios: ServicioItem[] = [...initialServicios];
  private pacientes: PacienteItem[] = [...initialPacientes];
  private paquetes: TratamientoPaqueteItem[] = [...initialPaquetes];
  private citas: CitaItem[] = [...initialCitas];
  private pagos: PagoItem[] = [...initialPagos];
  private historias: HistoriaEvolucionItem[] = [...initialHistorias];
  private auditLogs: AuditLogItem[] = [...initialAuditLogs];
  private configuracion: ConfiguracionClinicaItem = { ...initialConfiguracion };

  // Auditoría
  getAuditLogs() {
    return [...this.auditLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  registrarAuditLog(log: Omit<AuditLogItem, "id" | "createdAt">) {
    const nuevoLog: AuditLogItem = {
      ...log,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(nuevoLog);
    return nuevoLog;
  }

  // Configuración
  getConfiguracion() {
    return { ...this.configuracion };
  }

  actualizarConfiguracion(data: Partial<ConfiguracionClinicaItem>, usuarioInfo?: { id: string; nombre: string; rol: any }) {
    this.configuracion = {
      ...this.configuracion,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.registrarAuditLog({
      usuarioId: usuarioInfo?.id || "usr-admin-1",
      usuarioNombre: usuarioInfo?.nombre || "Marco Antonio (Administrador)",
      usuarioRol: usuarioInfo?.rol || "ADMIN",
      accion: "CONFIGURACION_ACTUALIZADA",
      modulo: "CONFIGURACION",
      entidadId: "config-principal",
      detalles: `Configuración clínica actualizada: Horario ${this.configuracion.horaApertura}-${this.configuracion.horaCierre}, Reevaluación cada ${this.configuracion.frecuenciaReevaluacion} sesiones, Bloqueo de alta: ${this.configuracion.bloqueoAltaReevaluacion ? "ACTIVO" : "INACTIVO"}.`,
    });

    return { ...this.configuracion };
  }

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

  // Control de Salas
  actualizarEstadoSala(salaId: string, nuevoEstado: "DISPONIBLE" | "MANTENIMIENTO", motivo?: string) {
    const index = this.salas.findIndex((s) => s.id === salaId);
    if (index === -1) throw new Error("Sala no encontrada.");

    this.salas[index].estado = nuevoEstado;

    this.registrarAuditLog({
      usuarioId: "usr-admin-1",
      usuarioNombre: "Marco Antonio (Administrador)",
      usuarioRol: "ADMIN",
      accion: "SALA_ESTADO_CAMBIADO",
      modulo: "CONFIGURACION",
      entidadId: salaId,
      detalles: `La ${this.salas[index].nombre} pasó al estado ${nuevoEstado}. Motivo: ${motivo || "Operación regular"}.`,
    });

    return this.salas[index];
  }

  // Control de Servicios
  actualizarServicio(servicioId: string, precioBase: number, duracionMinutos: number) {
    const index = this.servicios.findIndex((s) => s.id === servicioId);
    if (index === -1) throw new Error("Servicio no encontrado.");

    const anterior = { ...this.servicios[index] };
    this.servicios[index].precioBase = precioBase;
    this.servicios[index].duracionMinutos = duracionMinutos;

    this.registrarAuditLog({
      usuarioId: "usr-admin-1",
      usuarioNombre: "Marco Antonio (Administrador)",
      usuarioRol: "ADMIN",
      accion: "SERVICIO_ACTUALIZADO",
      modulo: "CONFIGURACION",
      entidadId: servicioId,
      detalles: `Servicio "${anterior.nombre}" actualizado: Precio S/. ${precioBase} (antes S/. ${anterior.precioBase}), Duración ${duracionMinutos}m.`,
    });

    return this.servicios[index];
  }

  // Control de Personal
  actualizarUsuario(usuarioId: string, estado: "ACTIVO" | "INACTIVO", especialidad?: string) {
    const index = this.users.findIndex((u) => u.id === usuarioId);
    if (index === -1) throw new Error("Usuario no encontrado.");

    this.users[index].estado = estado;
    if (especialidad !== undefined) this.users[index].especialidad = especialidad;

    this.registrarAuditLog({
      usuarioId: "usr-admin-1",
      usuarioNombre: "Marco Antonio (Administrador)",
      usuarioRol: "ADMIN",
      accion: "PERSONAL_ACTUALIZADO",
      modulo: "CONFIGURACION",
      entidadId: usuarioId,
      detalles: `Personal ${this.users[index].nombre} (${this.users[index].rol}) actualizado a estado ${estado}.`,
    });

    return this.users[index];
  }

  // Crear Usuario dinámicamente con Rol asignado
  crearUsuario(
    data: {
      nombre: string;
      email: string;
      rol: "ADMIN" | "RECEPCION" | "TERAPEUTA" | "PACIENTE";
      especialidad?: string;
      estado?: "ACTIVO" | "INACTIVO";
    },
    auditUser?: { id: string; nombre: string; rol: any }
  ) {
    if (!data.nombre || !data.email) throw new Error("Nombre y correo electrónico son requeridos.");
    if (this.users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error("Ya existe un usuario registrado con este correo.");
    }

    const nuevo: UserItem = {
      id: `usr-${Date.now()}`,
      nombre: data.nombre,
      email: data.email,
      rol: data.rol,
      especialidad: data.especialidad || undefined,
      estado: data.estado || "ACTIVO",
    };

    this.users.push(nuevo);

    this.registrarAuditLog({
      usuarioId: auditUser?.id || "usr-admin-1",
      usuarioNombre: auditUser?.nombre || "Marco Antonio (Administrador)",
      usuarioRol: auditUser?.rol || "ADMIN",
      accion: "USUARIO_CREADO",
      modulo: "CONFIGURACION",
      entidadId: nuevo.id,
      detalles: `Usuario "${nuevo.nombre}" creado exitosamente con rol [${nuevo.rol}] y estado [${nuevo.estado}].`,
    });

    return nuevo;
  }

  // Actualizar Rol de Usuario Dinámicamente
  actualizarRolUsuario(
    usuarioId: string, 
    nuevoRol: "ADMIN" | "RECEPCION" | "TERAPEUTA" | "PACIENTE",
    auditUser?: { id: string; nombre: string; rol: any }
  ) {
    const index = this.users.findIndex((u) => u.id === usuarioId);
    if (index === -1) throw new Error("Usuario no encontrado.");

    const rolAnterior = this.users[index].rol;
    this.users[index].rol = nuevoRol;

    this.registrarAuditLog({
      usuarioId: auditUser?.id || "usr-admin-1",
      usuarioNombre: auditUser?.nombre || "Marco Antonio (Administrador)",
      usuarioRol: auditUser?.rol || "ADMIN",
      accion: "USUARIO_ROL_CAMBIADO",
      modulo: "CONFIGURACION",
      entidadId: usuarioId,
      detalles: `Se modificó el rol de "${this.users[index].nombre}" de [${rolAnterior}] a [${nuevoRol}]. Permisos actualizados en tiempo real.`,
    });

    return this.users[index];
  }

  // Eliminar / Desvincular Usuario del Sistema
  eliminarUsuario(usuarioId: string, auditUser?: { id: string; nombre: string; rol: any }) {
    const index = this.users.findIndex((u) => u.id === usuarioId);
    if (index === -1) throw new Error("Usuario no encontrado.");
    const eliminado = this.users[index];
    this.users.splice(index, 1);

    this.registrarAuditLog({
      usuarioId: auditUser?.id || "usr-admin-1",
      usuarioNombre: auditUser?.nombre || "Marco Antonio (Administrador)",
      usuarioRol: auditUser?.rol || "ADMIN",
      accion: "USUARIO_ELIMINADO",
      modulo: "CONFIGURACION",
      entidadId: usuarioId,
      detalles: `Se eliminó al usuario "${eliminado.nombre}" con rol [${eliminado.rol}] del sistema.`,
    });

    return eliminado;
  }

  // REGLA 1: agendarCita() atómica con auditoría
  agendarCita(params: {
    pacienteId: string;
    paqueteId?: string | null;
    terapeutaId: string;
    salaId: string;
    fechaHoraInicio: Date;
    duracionMinutos?: number;
    esReevaluacion?: boolean;
    usuarioAuditoria?: { id?: string; nombre: string; rol: any };
  }) {
    const duracion = params.duracionMinutos || 45;
    const inicio = new Date(params.fechaHoraInicio);
    const fin = new Date(inicio.getTime() + duracion * 60000);

    const inicioIso = inicio.toISOString();
    const finIso = fin.toISOString();

    const sala = this.salas.find((s) => s.id === params.salaId);
    if (!sala) throw new Error("La sala seleccionada no existe.");
    if (sala.estado === "MANTENIMIENTO") {
      throw new Error(`La ${sala.nombre} se encuentra temporalmente en MANTENIMIENTO.`);
    }

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

    let esReevaluacionFlag = params.esReevaluacion || false;
    if (params.paqueteId) {
      const paquete = this.paquetes.find((p) => p.id === params.paqueteId);
      if (!paquete) throw new Error("El paquete de sesiones especificado no existe.");

      const citasDelPaquete = this.citas.filter(
        (c) => c.paqueteId === params.paqueteId && c.estado !== "CANCELADA"
      );

      if (citasDelPaquete.length >= paquete.totalSesiones) {
        throw new Error(
          `Saldo de sesiones agotado: El paquete cuenta con ${paquete.totalSesiones} sesiones contratadas y ya tiene ${citasDelPaquete.length} sesiones registradas o programadas.`
        );
      }

      const numeroCitaProyectada = citasDelPaquete.length + 1;
      if (numeroCitaProyectada % this.configuracion.frecuenciaReevaluacion === 0) {
        esReevaluacionFlag = true;
      }
    }

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

    const paciente = this.pacientes.find((p) => p.id === params.pacienteId);
    const terapeuta = this.users.find((u) => u.id === params.terapeutaId);

    // Registro de Auditoría
    this.registrarAuditLog({
      usuarioId: params.usuarioAuditoria?.id || "usr-rec-1",
      usuarioNombre: params.usuarioAuditoria?.nombre || "Recepción AJ Fisioterapia",
      usuarioRol: params.usuarioAuditoria?.rol || "RECEPCION",
      accion: "CITA_CREADA",
      modulo: "AGENDA",
      entidadId: nuevaCita.id,
      detalles: `Cita agendada para ${paciente?.nombres} ${paciente?.apellidos} en ${sala.nombre} con ${terapeuta?.nombre} para el ${new Date(nuevaCita.fechaHoraInicio).toLocaleDateString("es-PE")} (${new Date(nuevaCita.fechaHoraInicio).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}). ${esReevaluacionFlag ? "[HITO REEVALUACIÓN OBLIGATORIA]" : ""}`,
    });

    return nuevaCita;
  }

  // Cambio de estado de cita con auditoría
  actualizarEstadoCita(
    citaId: string, 
    nuevoEstado: "PROGRAMADA" | "CONFIRMADA" | "ATENDIDA" | "CANCELADA" | "NO_ASISTIO",
    usuarioInfo?: { id?: string; nombre: string; rol: any }
  ) {
    const index = this.citas.findIndex((c) => c.id === citaId);
    if (index === -1) throw new Error("Cita no encontrada.");

    const cita = this.citas[index];
    const estadoAnterior = cita.estado;
    this.citas[index] = { ...cita, estado: nuevoEstado };

    const paciente = this.pacientes.find((p) => p.id === cita.pacienteId);

    this.registrarAuditLog({
      usuarioId: usuarioInfo?.id || "usr-rec-1",
      usuarioNombre: usuarioInfo?.nombre || "Recepción AJ Fisioterapia",
      usuarioRol: usuarioInfo?.rol || "RECEPCION",
      accion: "CITA_ESTADO_CAMBIADO",
      modulo: "AGENDA",
      entidadId: cita.id,
      detalles: `Cita de ${paciente?.nombres} ${paciente?.apellidos} cambió de ${estadoAnterior} a ${nuevoEstado}.`,
    });

    return this.citas[index];
  }

  // REGLA 2: registrarAsistenciaYEvolucion() con auditoría
  registrarAsistenciaYEvolucion(params: {
    citaId: string;
    terapeutaId: string;
    evaDolorInicio: number;
    evaDolorFin: number;
    tratamientoAplicado: string;
    notasReevaluacion?: string | null;
    completarReevaluacion?: boolean;
    usuarioAuditoria?: { id?: string; nombre: string; rol: any };
  }) {
    const citaIndex = this.citas.findIndex((c) => c.id === params.citaId);
    if (citaIndex === -1) throw new Error("Cita no encontrada.");
    const cita = this.citas[citaIndex];

    this.citas[citaIndex] = { ...cita, estado: "ATENDIDA" };

    let nuevoConsumo = 0;
    let requiereReevaluacion = false;

    if (cita.paqueteId) {
      const paqIndex = this.paquetes.findIndex((p) => p.id === cita.paqueteId);
      if (paqIndex !== -1) {
        const paq = this.paquetes[paqIndex];
        nuevoConsumo = paq.sesionesConsumidas + 1;
        this.paquetes[paqIndex] = {
          ...paq,
          sesionesConsumidas: nuevoConsumo,
        };

        if (nuevoConsumo % this.configuracion.frecuenciaReevaluacion === 0) {
          requiereReevaluacion = true;

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

    const bloqueaAlta = requiereReevaluacion && !params.completarReevaluacion && this.configuracion.bloqueoAltaReevaluacion;

    const nuevaEvolucion: HistoriaEvolucionItem = {
      id: `evo-${Date.now()}`,
      citaId: cita.id,
      terapeutaId: params.terapeutaId,
      evaDolorInicio: params.evaDolorInicio,
      evaDolorFin: params.evaDolorFin,
      tratamientoAplicado: params.tratamientoAplicado,
      notasReevaluacion: params.notasReevaluacion || (requiereReevaluacion ? `Reevaluación de ${this.configuracion.frecuenciaReevaluacion} sesiones requerida.` : null),
      bloqueaAlta,
      createdAt: new Date().toISOString(),
    };

    this.historias.push(nuevaEvolucion);

    const terapeuta = this.users.find((u) => u.id === params.terapeutaId);
    const paciente = this.pacientes.find((p) => p.id === cita.pacienteId);

    this.registrarAuditLog({
      usuarioId: params.usuarioAuditoria?.id || terapeuta?.id || "usr-ter-1",
      usuarioNombre: params.usuarioAuditoria?.nombre || terapeuta?.nombre || "Terapeuta Clínico",
      usuarioRol: "TERAPEUTA",
      accion: "ASISTENCIA_REGISTRADA",
      modulo: "HISTORIA_CLINICA",
      entidadId: cita.id,
      detalles: `Asistencia y evolución clínica para ${paciente?.nombres} ${paciente?.apellidos}. EVA Inicial: ${params.evaDolorInicio}/10, Final: ${params.evaDolorFin}/10. Sesión consumida: ${nuevoConsumo}. ${requiereReevaluacion ? "[HITO DE REEVALUACIÓN PERIÓDICA]" : ""} ${bloqueaAlta ? "[BLOQUEO DE ALTA ACTIVADO]" : ""}`,
    });

    if (requiereReevaluacion && params.completarReevaluacion) {
      this.registrarAuditLog({
        usuarioId: terapeuta?.id,
        usuarioNombre: terapeuta?.nombre || "Terapeuta Clínico",
        usuarioRol: "TERAPEUTA",
        accion: "REEVALUACION_ACREDITADA",
        modulo: "HISTORIA_CLINICA",
        entidadId: cita.id,
        detalles: `Reevaluación física acreditada formalmente para ${paciente?.nombres} ${paciente?.apellidos}. Alta médica desbloqueada.`,
      });
    }

    return {
      cita: this.citas[citaIndex],
      evolucion: nuevaEvolucion,
      nuevoConsumo,
      requiereReevaluacion,
      bloqueaAlta,
    };
  }

  // REGLA 3: registrarPago() con auditoría
  registrarPago(params: {
    paqueteId: string;
    monto: number;
    metodoPago: "EFECTIVO" | "YAPE" | "PLIN" | "POS";
    numeroOperacion?: string | null;
    comprobanteUrl?: string | null;
    estado?: "VERIFICADO" | "PENDIENTE";
    usuarioAuditoria?: { id?: string; nombre: string; rol: any };
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

    const paciente = this.pacientes.find((p) => p.id === paq.pacienteId);

    this.registrarAuditLog({
      usuarioId: params.usuarioAuditoria?.id || "usr-rec-1",
      usuarioNombre: params.usuarioAuditoria?.nombre || "Caja AJ Fisioterapia",
      usuarioRol: "RECEPCION",
      accion: "PAGO_REGISTRADO",
      modulo: "CAJA",
      entidadId: nuevoPago.id,
      detalles: `Cobranza de S/. ${params.monto.toFixed(2)} (${params.metodoPago}, Op: ${nuevoPago.numeroOperacion}) para ${paciente?.nombres} ${paciente?.apellidos}. Estado paquete: ${this.paquetes[paqIndex].estadoPago}.`,
    });

    return {
      pago: nuevoPago,
      paquete: this.paquetes[paqIndex],
    };
  }

  // Registro de nuevo paciente con auditoría
  crearPaciente(data: Omit<PacienteItem, "id" | "createdAt">) {
    const existe = this.pacientes.find((p) => p.dni === data.dni);
    if (existe) throw new Error(`Ya existe un paciente registrado con el DNI ${data.dni}`);

    const nuevo: PacienteItem = {
      ...data,
      id: `pac-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.pacientes.push(nuevo);

    this.registrarAuditLog({
      usuarioId: "usr-rec-1",
      usuarioNombre: "Recepción AJ Fisioterapia",
      usuarioRol: "RECEPCION",
      accion: "PACIENTE_CREADO",
      modulo: "HISTORIA_CLINICA",
      entidadId: nuevo.id,
      detalles: `Expediente clínico creado para ${nuevo.nombres} ${nuevo.apellidos} (DNI: ${nuevo.dni}, Tel: ${nuevo.telefono}).`,
    });

    return nuevo;
  }

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

    const paciente = this.pacientes.find((p) => p.id === params.pacienteId);
    const servicio = this.servicios.find((s) => s.id === params.servicioId);

    this.registrarAuditLog({
      usuarioId: "usr-rec-1",
      usuarioNombre: "Recepción AJ Fisioterapia",
      usuarioRol: "RECEPCION",
      accion: "PAQUETE_CREADO",
      modulo: "CAJA",
      entidadId: nuevoPaq.id,
      detalles: `Paquete de ${params.totalSesiones} sesiones de "${servicio?.nombre}" asignado a ${paciente?.nombres} ${paciente?.apellidos}. Monto: S/. ${params.montoTotal.toFixed(2)}.`,
    });

    return nuevoPaq;
  }
}

const globalForStore = globalThis as unknown as { kineFlowStore?: KineFlowStore };
export const dbStore = globalForStore.kineFlowStore ?? new KineFlowStore();
if (process.env.NODE_ENV !== "production") globalForStore.kineFlowStore = dbStore;
