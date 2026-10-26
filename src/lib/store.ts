// Gestor Fisioterapia - Repositorio de Estado en Memoria y Motor de Negocio
// AJ Fisioterapia (San Borja) - Desarrollado por Marco Antonio

export interface UserItem {
  id: string;
  nombre: string;
  email: string;
  rol: "ADMIN" | "RECEPCION" | "TERAPEUTA" | "ASISTENTE" | "PACIENTE";
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
  categoriaTag?: string;
  descripcion?: string;
  duracionMinutos: number;
  precioBase: number;
  precioPromocional?: number;
  textoPromocion?: string;
  imagenUrl?: string;
  mostrarEnWeb?: boolean;
  orden?: number;
}

export interface PacienteItem {
  id: string;
  tipoDocumento?: "DNI" | "CE" | "PASAPORTE" | "CEDULA" | "OTRO";
  dni: string;
  primerNombre?: string;
  segundoNombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email?: string;
  fechaNacimiento: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaParentesco?: string;
  contactoEmergenciaTelefono?: string;
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
  notasCita?: string | null;
  creadoPorNombre?: string;
  confirmadoPorNombre?: string;
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

export interface HorarioDiaConfig {
  activo: boolean;
  apertura: string;
  cierre: string;
  tienePausa: boolean;
  pausaInicio?: string;
  pausaFin?: string;
}

export type DiaSemanaClave = "lunes" | "martes" | "miercoles" | "jueves" | "viernes" | "sabado" | "domingo";

export interface HorariosSemanaConfig {
  lunes: HorarioDiaConfig;
  martes: HorarioDiaConfig;
  miercoles: HorarioDiaConfig;
  jueves: HorarioDiaConfig;
  viernes: HorarioDiaConfig;
  sabado: HorarioDiaConfig;
  domingo: HorarioDiaConfig;
}

export interface TestimonioItem {
  id: string;
  nombre: string;
  calificacion: number;
  comentario: string;
  avatarUrl?: string;
  ocupacion?: string;
}

// Configuración Maestra del Centro Clínico (Marca Blanca)
export interface ConfiguracionClinicaItem {
  id: string;
  razonSocial: string;
  nombreComercial: string;
  slogan?: string;
  tituloHero?: string;
  subtituloHero?: string;
  descripcionHero?: string;
  ruc: string;
  direccionAvenidaCalle?: string;
  direccionNumero?: string;
  direccionDistrito?: string;
  direccionCiudad?: string;
  direccionReferencia?: string;
  direccion: string;
  telefono: string;
  whatsapp: string;
  googleMapsUrl?: string;
  horaApertura: string;
  horaCierre: string;
  intervaloMinutos: number;
  horariosSemana?: HorariosSemanaConfig;
  frecuenciaReevaluacion: number;
  bloqueoAltaReevaluacion: boolean;
  totalSalasFisicas: number;
  ratingPromedio?: number;
  totalPacientesMes?: string;
  testimonios?: TestimonioItem[];
  logoUrl?: string;
  faviconUrl?: string;
  heroImageUrl?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  colorAcento?: string;
  updatedAt: string;
}

// Semilla inicial estricta del negocio AJ Fisioterapia
const initialUsers: UserItem[] = [
  { id: "usr-admin-1", nombre: "Marco Yana", email: "marco.yana@ajfisioterapia.pe", rol: "ADMIN", especialidad: "Gerencia y Dirección Clínica", estado: "ACTIVO" },
  { id: "usr-rec-1", nombre: "Karin Palacios", email: "karin.palacios@ajfisioterapia.pe", rol: "RECEPCION", estado: "ACTIVO" },
  { id: "usr-rec-2", nombre: "Laura Peña", email: "recepcion2@ajfisioterapia.pe", rol: "RECEPCION", estado: "ACTIVO" },
  { id: "usr-ter-1", nombre: "Lic. Jeiser Vasquez", email: "jeiser.vasquez@ajfisioterapia.pe", rol: "TERAPEUTA", especialidad: "Lic. Fisioterapia Deportiva y Readaptación", estado: "ACTIVO" },
  { id: "usr-ter-2", nombre: "Lic. Andrea Rivas", email: "andrea.rivas@ajfisioterapia.pe", rol: "TERAPEUTA", especialidad: "Lic. Terapia Manual Ortopédica y Columna", estado: "ACTIVO" },
  { id: "usr-ter-3", nombre: "Lic. Javier Ponce", email: "javier.ponce@ajfisioterapia.pe", rol: "TERAPEUTA", especialidad: "Lic. Biomecánica y Reeducación Postural", estado: "ACTIVO" },
  { id: "usr-ter-4", nombre: "Lic. Valeria Soto", email: "valeria.soto@ajfisioterapia.pe", rol: "TERAPEUTA", especialidad: "Lic. Neurorehabilitación y Adulto Mayor", estado: "ACTIVO" },
  { id: "usr-tec-1", nombre: "Tec. Miguel Torres", email: "miguel.torres@ajfisioterapia.pe", rol: "ASISTENTE", especialidad: "Técnico en Agentes Físicos y Electroterapia", estado: "ACTIVO" },
  { id: "usr-tec-2", nombre: "Tec. Diana Paredes", email: "diana.paredes@ajfisioterapia.pe", rol: "ASISTENTE", especialidad: "Técnico en Masoterapia y Crioterapia", estado: "ACTIVO" },
  { id: "usr-pac-1", nombre: "Alexander Saavedra", email: "alexander.saavedra@gmail.com", rol: "PACIENTE", especialidad: "Paciente / Cliente Titular", estado: "ACTIVO" },
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
  {
    id: "serv-1",
    nombre: "Terapia física",
    categoriaTag: "DOLOR & MOVILIDAD",
    descripcion: "Tratamientos personalizados para aliviar el dolor, recuperar movilidad y volver a tu rutina.",
    duracionMinutos: 45,
    precioBase: 40.00,
    precioPromocional: 30.00,
    textoPromocion: "PROMOCION DSCTO S/ 30 por sesión",
    mostrarEnWeb: true,
    orden: 1,
  },
  {
    id: "serv-2",
    nombre: "Rehabilitación deportiva",
    categoriaTag: "RENDIMIENTO",
    descripcion: "Recuperación muscular progresiva para regresar a tu deporte con confianza y seguridad.",
    duracionMinutos: 45,
    precioBase: 40.00,
    precioPromocional: 30.00,
    textoPromocion: "PROMOCION DSCTO S/ 30 por sesión",
    mostrarEnWeb: true,
    orden: 2,
  },
  {
    id: "serv-3",
    nombre: "Terapia neurológica",
    categoriaTag: "FUNCIONALIDAD",
    descripcion: "Acompañamiento especializado para mejorar la función, el equilibrio y la independencia.",
    duracionMinutos: 60,
    precioBase: 60.00,
    precioPromocional: 50.00,
    textoPromocion: "PROMOCION DSCTO S/ 50 por sesión",
    mostrarEnWeb: true,
    orden: 3,
  },
  {
    id: "serv-4",
    nombre: "Masoterapia",
    categoriaTag: "BIENESTAR",
    descripcion: "Masajes relajantes, descontracturantes según las necesidades de tu cuerpo.",
    duracionMinutos: 45,
    precioBase: 80.00,
    precioPromocional: 60.00,
    textoPromocion: "PROMOCION DSCTO S/ 60 por sesión 1 hora",
    mostrarEnWeb: true,
    orden: 4,
  },
];

const initialPacientes: PacienteItem[] = [
  {
    id: "usr-pac-1",
    tipoDocumento: "DNI",
    dni: "45892011",
    primerNombre: "Alexander",
    apellidoPaterno: "Saavedra",
    apellidoMaterno: "Castillo",
    nombres: "Alexander",
    apellidos: "Saavedra Castillo",
    telefono: "987123456",
    email: "alexander.saavedra@gmail.com",
    fechaNacimiento: "1991-04-12",
    contactoEmergencia: "Esposa - 987999111",
    contactoEmergenciaNombre: "Lucía Paredes",
    contactoEmergenciaParentesco: "Esposa",
    contactoEmergenciaTelefono: "987999111",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "pac-2",
    tipoDocumento: "DNI",
    dni: "72109483",
    primerNombre: "Camila",
    apellidoPaterno: "Vargas",
    apellidoMaterno: "Flores",
    nombres: "Camila",
    apellidos: "Vargas Flores",
    telefono: "976543210",
    email: "camila.vargas@hotmail.com",
    fechaNacimiento: "1998-09-24",
    contactoEmergencia: "Madre - 976000222",
    contactoEmergenciaNombre: "Rosa Flores",
    contactoEmergenciaParentesco: "Madre",
    contactoEmergenciaTelefono: "976000222",
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
];

const initialPaquetes: TratamientoPaqueteItem[] = [
  {
    id: "paq-1",
    pacienteId: "usr-pac-1",
    servicioId: "serv-1", // Terapia física
    totalSesiones: 10,
    sesionesConsumidas: 4,
    montoTotal: 700,
    montoPagado: 700,
    estadoPago: "PAGADO",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: "paq-2",
    pacienteId: "pac-2",
    servicioId: "serv-2", // Rehabilitación deportiva
    totalSesiones: 20,
    sesionesConsumidas: 5,
    montoTotal: 1400,
    montoPagado: 700,
    estadoPago: "PARCIAL",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

const initialCitas: CitaItem[] = [
  {
    id: "cita-1",
    paqueteId: "paq-1",
    terapeutaId: "usr-ter-1", // Lic. Jeiser Vasquez
    salaId: "sala-1",
    pacienteId: "usr-pac-1",
    fechaHoraInicio: new Date(Date.now() + 86400000).toISOString(),
    fechaHoraFin: new Date(Date.now() + 86400000 + 45 * 60000).toISOString(),
    estado: "CONFIRMADA",
    esReevaluacion: true,
    creadoPorNombre: "Karin Palacios (Recepción)",
    confirmadoPorNombre: "Lic. Jeiser Vasquez",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "cita-ant-4",
    paqueteId: "paq-1",
    terapeutaId: "usr-ter-1",
    salaId: "sala-1",
    pacienteId: "usr-pac-1",
    fechaHoraInicio: new Date(Date.now() - 3 * 86400000).toISOString(),
    fechaHoraFin: new Date(Date.now() - 3 * 86400000 + 45 * 60000).toISOString(),
    estado: "ATENDIDA",
    esReevaluacion: false,
    creadoPorNombre: "Karin Palacios (Recepción)",
    confirmadoPorNombre: "Lic. Jeiser Vasquez",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "cita-ant-3",
    paqueteId: "paq-1",
    terapeutaId: "usr-ter-1",
    salaId: "sala-1",
    pacienteId: "usr-pac-1",
    fechaHoraInicio: new Date(Date.now() - 7 * 86400000).toISOString(),
    fechaHoraFin: new Date(Date.now() - 7 * 86400000 + 45 * 60000).toISOString(),
    estado: "ATENDIDA",
    esReevaluacion: false,
    creadoPorNombre: "Karin Palacios (Recepción)",
    confirmadoPorNombre: "Lic. Jeiser Vasquez",
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: "cita-ant-2",
    paqueteId: "paq-1",
    terapeutaId: "usr-ter-2", // Lic. Andrea Rivas
    salaId: "sala-2",
    pacienteId: "usr-pac-1",
    fechaHoraInicio: new Date(Date.now() - 11 * 86400000).toISOString(),
    fechaHoraFin: new Date(Date.now() - 11 * 86400000 + 45 * 60000).toISOString(),
    estado: "ATENDIDA",
    esReevaluacion: false,
    creadoPorNombre: "Karin Palacios (Recepción)",
    confirmadoPorNombre: "Lic. Andrea Rivas",
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: "cita-ant-1",
    paqueteId: "paq-1",
    terapeutaId: "usr-ter-1",
    salaId: "sala-1",
    pacienteId: "usr-pac-1",
    fechaHoraInicio: new Date(Date.now() - 15 * 86400000).toISOString(),
    fechaHoraFin: new Date(Date.now() - 15 * 86400000 + 45 * 60000).toISOString(),
    estado: "ATENDIDA",
    esReevaluacion: false,
    creadoPorNombre: "Laura Peña (Recepción)",
    confirmadoPorNombre: "Lic. Jeiser Vasquez",
    createdAt: new Date(Date.now() - 16 * 86400000).toISOString(),
  },
  {
    id: "cita-2",
    paqueteId: "paq-2",
    terapeutaId: "usr-ter-2", // Lic. Andrea Rivas
    salaId: "sala-2",
    pacienteId: "pac-2",
    fechaHoraInicio: new Date(Date.now() + 2 * 86400000).toISOString(),
    fechaHoraFin: new Date(Date.now() + 2 * 86400000 + 45 * 60000).toISOString(),
    estado: "PROGRAMADA",
    esReevaluacion: false,
    creadoPorNombre: "Laura Peña (Recepción)",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const initialPagos: PagoItem[] = [
  {
    id: "pago-1",
    paqueteId: "paq-1",
    monto: 700,
    metodoPago: "YAPE",
    numeroOperacion: "YAP-892104",
    estado: "VERIFICADO",
    fechaPago: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: "pago-2",
    paqueteId: "paq-2",
    monto: 700,
    metodoPago: "POS",
    numeroOperacion: "POS-339182",
    estado: "VERIFICADO",
    fechaPago: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

const initialHistorias: HistoriaEvolucionItem[] = [
  {
    id: "hist-1",
    citaId: "cita-ant-4",
    terapeutaId: "usr-ter-1",
    evaDolorInicio: 5,
    evaDolorFin: 3,
    tratamientoAplicado: "Terapia manual miofascial y fortalecimiento de core para columna lumbar.",
    bloqueaAlta: false,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "hist-2",
    citaId: "cita-ant-3",
    terapeutaId: "usr-ter-1",
    evaDolorInicio: 6,
    evaDolorFin: 4,
    tratamientoAplicado: "Ultrasonido pulsátil terapéutico y ejercicios propioceptivos lumbopélvicos.",
    bloqueaAlta: false,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "hist-3",
    citaId: "cita-ant-2",
    terapeutaId: "usr-ter-2",
    evaDolorInicio: 7,
    evaDolorFin: 5,
    tratamientoAplicado: "Terapia descompresiva articular y estiramientos neuromusculares.",
    bloqueaAlta: false,
    createdAt: new Date(Date.now() - 11 * 86400000).toISOString(),
  },
  {
    id: "hist-4",
    citaId: "cita-ant-1",
    terapeutaId: "usr-ter-1",
    evaDolorInicio: 8,
    evaDolorFin: 6,
    tratamientoAplicado: "Evaluación postural biomecánica, agentes físicos TENS y compresas húmedo-calientes.",
    bloqueaAlta: false,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

const initialConfiguracion: ConfiguracionClinicaItem = {
  id: "config-principal",
  razonSocial: "AJ Fisioterapia S.A.C.",
  nombreComercial: "AJ Fisioterapia",
  slogan: "REHABILITACIÓN & BIENESTAR",
  tituloHero: "Vuelve a moverte.",
  subtituloHero: "Vuelve a sentirte tú.",
  descripcionHero: "Fisioterapia especializada y humana para recuperar tu bienestar, paso a paso.",
  ruc: "20608912345",
  direccionAvenidaCalle: "Av. Guardia Civil",
  direccionNumero: "520",
  direccionDistrito: "San Borja",
  direccionCiudad: "Lima",
  direccionReferencia: "Cerca al Óvalo Quiñones",
  direccion: "Av. Guardia Civil 520, San Borja, Lima (Ref: Cerca al Óvalo Quiñones)",
  telefono: "(01) 475-2010",
  whatsapp: "+51 987 654 321",
  googleMapsUrl: "https://maps.google.com/?q=Av.+Guardia+Civil+520,+San+Borja",
  horaApertura: "08:00",
  horaCierre: "20:00",
  intervaloMinutos: 45,
  horariosSemana: {
    lunes: { activo: true, apertura: "08:00", cierre: "20:00", tienePausa: true, pausaInicio: "13:00", pausaFin: "14:00" },
    martes: { activo: true, apertura: "08:00", cierre: "20:00", tienePausa: true, pausaInicio: "13:00", pausaFin: "14:00" },
    miercoles: { activo: true, apertura: "08:00", cierre: "20:00", tienePausa: true, pausaInicio: "13:00", pausaFin: "14:00" },
    jueves: { activo: true, apertura: "08:00", cierre: "20:00", tienePausa: true, pausaInicio: "13:00", pausaFin: "14:00" },
    viernes: { activo: true, apertura: "08:00", cierre: "20:00", tienePausa: true, pausaInicio: "13:00", pausaFin: "14:00" },
    sabado: { activo: true, apertura: "08:00", cierre: "14:00", tienePausa: false, pausaInicio: "12:00", pausaFin: "13:00" },
    domingo: { activo: false, apertura: "09:00", cierre: "13:00", tienePausa: false, pausaInicio: "12:00", pausaFin: "13:00" },
  },
  frecuenciaReevaluacion: 5, // Cada 5 sesiones asistidas
  bloqueoAltaReevaluacion: true,
  totalSalasFisicas: 6,
  ratingPromedio: 4.9,
  totalPacientesMes: "+1,100",
  logoUrl: "/images/logo-clinica.svg",
  faviconUrl: "/favicon.ico",
  heroImageUrl: "/images/hero-physio.jpg",
  colorPrimario: "#0C3E37",
  colorSecundario: "#E07052",
  colorAcento: "#0D9488",
  testimonios: [
    {
      id: "test-1",
      nombre: "Renzo Morales",
      calificacion: 5,
      ocupacion: "Dolor Lumbar y Hernia Discal • San Borja",
      comentario: "Llegué con un dolor lumbar severo que me impedía estar sentado más de 20 minutos en mi trabajo de oficina. Con 5 sesiones de terapia manual y descompresión, el cambio fue radical. Hoy trabajo sin molestias y volví a entrenar.",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80",
    },
    {
      id: "test-2",
      nombre: "Valeria Coronado",
      calificacion: 5,
      ocupacion: "Rehabilitación de Menisco • Miraflores",
      comentario: "Me lesioné la rodilla a 6 semanas de correr la media maratón de Lima. El equipo de fisioterapia deportiva no solo alivió la inflamación, sino que me readaptó la pisada. ¡Pude correr y cruzar la meta sin dolor!",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80",
    },
    {
      id: "test-3",
      nombre: "Dr. Fernando Townsend",
      calificacion: 5,
      ocupacion: "Post-operatorio Manguito Rotador • San Isidro",
      comentario: "Como médico cirujano soy muy exigente con la evidencia clínica. En AJ Fisioterapia encontré licenciados altamente capacitados, tecnología de vanguardia y una calidez humana admirable.",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80",
    },
    {
      id: "test-4",
      nombre: "Mariana Quispe",
      calificacion: 5,
      ocupacion: "Cervicalgia y Teletrabajo • Surco",
      comentario: "Pasaba 10 horas en teletrabajo y las contracturas en el cuello me producían mareos y dolor diario. La combinación de punción seca y reeducación postural me devolvió el bienestar por completo.",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80",
    },
    {
      id: "test-5",
      nombre: "Alberto Gutiérrez (73 años)",
      calificacion: 5,
      ocupacion: "Artrosis de Cadera y Equilibrio • San Borja",
      comentario: "Mi hija me trajo porque me daba miedo caminar solo por la calle. La paciencia, vocación y ejercicios guiados de los terapeutas han hecho que recupere la fuerza y la confianza para salir a pasear.",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80",
    },
    {
      id: "test-6",
      nombre: "Camila Benavides",
      calificacion: 5,
      ocupacion: "Esguince de Tobillo Grado 2 • La Molina",
      comentario: "La atención es impecable desde la recepción hasta la última sesión. La puntualidad de los turnos, la limpieza de las salas y el gimnasio de rehabilitación hacen que valga cada sol invertido.",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80",
    },
  ],
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
    detalles: "Inicialización del sistema Gestor Fisioterapia para AJ Fisioterapia con 6 salas operativas.",
    ipAddress: "192.168.1.100",
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: "log-2",
    usuarioId: "usr-rec-1",
    usuarioNombre: "Karin Palacios (Recepción)",
    usuarioRol: "RECEPCION",
    accion: "PAGO_REGISTRADO",
    modulo: "CAJA",
    entidadId: "pago-1",
    detalles: "Cobro verificado de S/. 400.00 mediante Yape (Op: YAP-892104) para paciente Alexander Saavedra (Paquete 10 sesiones traumatología).",
    ipAddress: "192.168.1.105",
    createdAt: new Date(Date.now() - 150 * 60000).toISOString(),
  },
  {
    id: "log-3",
    usuarioId: "usr-rec-2",
    usuarioNombre: "Laura Peña (Recepción)",
    usuarioRol: "RECEPCION",
    accion: "PAGO_REGISTRADO",
    modulo: "CAJA",
    entidadId: "pago-2",
    detalles: "Cobro verificado de S/. 700.00 mediante POS (Op: POS-339182) para paciente Camila Vargas (Paquete 20 sesiones columna).",
    ipAddress: "192.168.1.106",
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
  },
  {
    id: "log-4",
    usuarioId: "usr-rec-1",
    usuarioNombre: "Karin Palacios (Recepción)",
    usuarioRol: "RECEPCION",
    accion: "CITA_ACEPTADA_CONFIRMADA",
    modulo: "AGENDA",
    entidadId: "cita-1",
    detalles: "Cita confirmada y aprobada para Alexander Saavedra en Sala 1 (08:00 - 08:45) con Lic. Jeiser Vasquez. Hito de reevaluación activado.",
    ipAddress: "192.168.1.105",
    createdAt: new Date(Date.now() - 95 * 60000).toISOString(),
  },
  {
    id: "log-5",
    usuarioId: "usr-rec-2",
    usuarioNombre: "Laura Peña (Recepción)",
    usuarioRol: "RECEPCION",
    accion: "CITA_CREADA",
    modulo: "AGENDA",
    entidadId: "cita-2",
    detalles: "Agendamiento en Sala 2 (09:00 - 09:45) para paciente Camila Vargas con Lic. Andrea Rivas.",
    ipAddress: "192.168.1.106",
    createdAt: new Date(Date.now() - 75 * 60000).toISOString(),
  },
  {
    id: "log-6",
    usuarioId: "usr-ter-4",
    usuarioNombre: "Lic. Valeria Soto (Terapeuta)",
    usuarioRol: "TERAPEUTA",
    accion: "ASISTENCIA_REGISTRADA",
    modulo: "HISTORIA_CLINICA",
    entidadId: "cita-3",
    detalles: "Atención completada para Jorge Alvarez en Sala 3. Escala EVA inicial: 7/10, final: 4/10. Tratamiento TENS y FNP aplicado.",
    ipAddress: "192.168.1.112",
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: "log-7",
    usuarioId: "usr-ter-2",
    usuarioNombre: "Lic. Andrea Rivas (Terapeuta)",
    usuarioRol: "TERAPEUTA",
    accion: "REEVALUACION_ACREDITADA",
    modulo: "HISTORIA_CLINICA",
    entidadId: "paq-2",
    detalles: "Reevaluación física sesión 5 completada para Camila Vargas. Rangos articulares lumbares incrementados en 15 grados.",
    ipAddress: "192.168.1.110",
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: "log-8",
    usuarioId: "usr-rec-1",
    usuarioNombre: "Karin Palacios (Recepción)",
    usuarioRol: "RECEPCION",
    accion: "PAGO_REGISTRADO",
    modulo: "CAJA",
    entidadId: "pago-3",
    detalles: "Cobro verificado de S/. 700.00 mediante Plin (Op: PLN-554109) para paciente Camila Vargas (Abono cuota paquete).",
    ipAddress: "192.168.1.105",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "log-9",
    usuarioId: "usr-admin-1",
    usuarioNombre: "Marco Antonio (Administrador)",
    usuarioRol: "ADMIN",
    accion: "CONFIGURACION_ACTUALIZADA",
    modulo: "CONFIGURACION",
    entidadId: "config-principal",
    detalles: "Configuración clínica actualizada: Horario de atención 08:00 a 20:00, bloqueo de alta médica por reevaluación activo.",
    ipAddress: "192.168.1.100",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
];

class GestorFisioStore {
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
      horariosSemana: data.horariosSemana 
        ? { ...(this.configuracion.horariosSemana || initialConfiguracion.horariosSemana!), ...data.horariosSemana }
        : (this.configuracion.horariosSemana || initialConfiguracion.horariosSemana),
      updatedAt: new Date().toISOString(),
    };

    if (data.direccionAvenidaCalle || data.direccionNumero || data.direccionDistrito || data.direccionCiudad || data.direccionReferencia) {
      const avCalle = data.direccionAvenidaCalle ?? this.configuracion.direccionAvenidaCalle ?? "";
      const num = data.direccionNumero ?? this.configuracion.direccionNumero ?? "";
      const dist = data.direccionDistrito ?? this.configuracion.direccionDistrito ?? "";
      const ciudad = data.direccionCiudad ?? this.configuracion.direccionCiudad ?? "";
      const ref = data.direccionReferencia ?? this.configuracion.direccionReferencia ?? "";

      const viaNum = [avCalle, num].filter(Boolean).join(" ");
      const parts = [viaNum, dist, ciudad].filter(Boolean);
      let dirGenerada = parts.join(", ");
      if (ref) dirGenerada += ` (Ref: ${ref})`;
      if (dirGenerada) {
        this.configuracion.direccion = dirGenerada;
      }
    }

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
  getTerapeutas() { return this.users.filter((u) => (u.rol === "TERAPEUTA" || u.rol === "ASISTENTE") && u.estado === "ACTIVO"); }
  getAsistentes() { return this.users.filter((u) => u.rol === "ASISTENTE" && u.estado === "ACTIVO"); }
  getSalas() { return [...this.salas]; }
  getServicios() { return [...this.servicios]; }
  getPacientes() { return [...this.pacientes]; }
  getPaquetes() { return [...this.paquetes]; }
  getCitas() { return [...this.citas]; }
  getPagos() { return [...this.pagos]; }
  getHistorias() { return [...this.historias]; }

  getPacienteById(id: string) {
    const paciente = this.pacientes.find((p) => p.id === id || p.dni === id || (p.email && p.email.toLowerCase() === id.toLowerCase()));
    if (!paciente) return null;

    const paquetes = this.paquetes
      .filter((paq) => paq.pacienteId === paciente.id || paq.pacienteId === id)
      .map((paq) => ({
        ...paq,
        servicio: this.servicios.find((s) => s.id === paq.servicioId)!,
        pagos: this.pagos.filter((p) => p.paqueteId === paq.id),
      }));

    const citas = this.citas
      .filter((c) => c.pacienteId === paciente.id || c.pacienteId === id)
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
        const terapeuta = this.users.find((u) => u.id === h.terapeutaId);
        return {
          id: h.id,
          fecha: cita ? cita.fechaHoraInicio : h.createdAt,
          fechaFin: cita ? cita.fechaHoraFin : undefined,
          terapeutaNombre: terapeuta ? terapeuta.nombre : "Lic. Fisioterapeuta",
          terapeutaEspecialidad: terapeuta?.especialidad || "Fisioterapia y Rehabilitación",
          salaNombre: cita?.sala?.nombre || "Sala 1",
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

  // Control de Salas Dinámicas
  actualizarEstadoSala(salaId: string, nuevoEstado: "DISPONIBLE" | "MANTENIMIENTO", motivo?: string) {
    const index = this.salas.findIndex((s) => s.id === salaId);
    if (index === -1) {
      const nuevaSala: SalaItem = {
        id: salaId,
        nombre: "Sala Clínica",
        estado: nuevoEstado,
        capacidadSimultanea: 1,
      };
      this.salas.push(nuevaSala);
      return nuevaSala;
    }

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

  crearSala(nombre: string, equipamiento?: string) {
    const nuevaSala: SalaItem = {
      id: `sala-${Date.now()}`,
      nombre,
      estado: "DISPONIBLE",
      equipamiento: equipamiento || "Camilla clínica estándar",
      capacidadSimultanea: 1,
    };
    this.salas.push(nuevaSala);
    this.configuracion.totalSalasFisicas = this.salas.length;

    this.registrarAuditLog({
      usuarioId: "usr-admin-1",
      usuarioNombre: "Marco Antonio (Administrador)",
      usuarioRol: "ADMIN",
      accion: "SALA_CREADA",
      modulo: "CONFIGURACION",
      entidadId: nuevaSala.id,
      detalles: `Nueva sala "${nombre}" registrada con equipamiento: ${equipamiento || "Camilla estándar"}.`,
    });

    return nuevaSala;
  }

  editarSala(salaId: string, nombre: string, equipamiento?: string) {
    const index = this.salas.findIndex((s) => s.id === salaId);
    if (index === -1) {
      const nuevaSala: SalaItem = {
        id: salaId,
        nombre,
        equipamiento: equipamiento || "Camilla clínica estándar",
        estado: "DISPONIBLE",
        capacidadSimultanea: 1,
      };
      this.salas.push(nuevaSala);
      return nuevaSala;
    }

    this.salas[index].nombre = nombre;
    if (equipamiento !== undefined) this.salas[index].equipamiento = equipamiento;

    this.registrarAuditLog({
      usuarioId: "usr-admin-1",
      usuarioNombre: "Marco Antonio (Administrador)",
      usuarioRol: "ADMIN",
      accion: "SALA_EDITADA",
      modulo: "CONFIGURACION",
      entidadId: salaId,
      detalles: `Sala "${nombre}" actualizada con éxito.`,
    });

    return this.salas[index];
  }

  eliminarSala(salaId: string) {
    const index = this.salas.findIndex((s) => s.id === salaId);
    if (index === -1) return null;

    const eliminada = this.salas.splice(index, 1)[0];
    this.configuracion.totalSalasFisicas = this.salas.length;

    this.registrarAuditLog({
      usuarioId: "usr-admin-1",
      usuarioNombre: "Marco Antonio (Administrador)",
      usuarioRol: "ADMIN",
      accion: "SALA_ELIMINADA",
      modulo: "CONFIGURACION",
      entidadId: salaId,
      detalles: `Sala "${eliminada.nombre}" eliminada de la clínica.`,
    });

    return eliminada;
  }

  // Control de Servicios Dinámicos
  actualizarServicio(
    servicioId: string, 
    precioBase: number, 
    duracionMinutos: number,
    dataExtra?: Partial<Omit<ServicioItem, "id">>
  ) {
    const index = this.servicios.findIndex((s) => s.id === servicioId);
    if (index === -1) {
      const nuevoServicio: ServicioItem = {
        id: servicioId,
        nombre: dataExtra?.nombre || "Servicio Terapéutico",
        precioBase,
        duracionMinutos,
        categoriaTag: dataExtra?.categoriaTag || "DOLOR & MOVILIDAD",
        descripcion: dataExtra?.descripcion || "Tratamiento personalizado enfocado en recuperación funcional.",
        precioPromocional: dataExtra?.precioPromocional,
        textoPromocion: dataExtra?.textoPromocion,
        mostrarEnWeb: dataExtra?.mostrarEnWeb ?? true,
        orden: dataExtra?.orden ?? (this.servicios.length + 1),
      };
      this.servicios.push(nuevoServicio);
      return nuevoServicio;
    }

    const anterior = { ...this.servicios[index] };
    this.servicios[index] = {
      ...this.servicios[index],
      precioBase,
      duracionMinutos,
      ...dataExtra,
    };

    this.registrarAuditLog({
      usuarioId: "usr-admin-1",
      usuarioNombre: "Marco Antonio (Administrador)",
      usuarioRol: "ADMIN",
      accion: "SERVICIO_ACTUALIZADO",
      modulo: "CONFIGURACION",
      entidadId: servicioId,
      detalles: `Servicio "${this.servicios[index].nombre}" actualizado: Tarifa S/. ${precioBase}, Promo: "${this.servicios[index].textoPromocion || 'Sin promo'}", Duración: ${duracionMinutos}m.`,
    });

    return this.servicios[index];
  }

  crearServicio(
    nombre: string, 
    precioBase: number, 
    duracionMinutos: number,
    dataExtra?: Partial<Omit<ServicioItem, "id" | "nombre" | "precioBase" | "duracionMinutos">>
  ) {
    const nuevoServicio: ServicioItem = {
      id: `serv-${Date.now()}`,
      nombre,
      precioBase,
      duracionMinutos,
      categoriaTag: dataExtra?.categoriaTag || "DOLOR & MOVILIDAD",
      descripcion: dataExtra?.descripcion || "Tratamiento personalizado enfocado en recuperación funcional.",
      precioPromocional: dataExtra?.precioPromocional,
      textoPromocion: dataExtra?.textoPromocion,
      mostrarEnWeb: dataExtra?.mostrarEnWeb ?? true,
      orden: dataExtra?.orden ?? (this.servicios.length + 1),
    };
    this.servicios.push(nuevoServicio);

    this.registrarAuditLog({
      usuarioId: "usr-admin-1",
      usuarioNombre: "Marco Antonio (Administrador)",
      usuarioRol: "ADMIN",
      accion: "SERVICIO_CREADO",
      modulo: "CONFIGURACION",
      entidadId: nuevoServicio.id,
      detalles: `Nuevo servicio terapéutico "${nombre}" creado (Tarifa: S/. ${precioBase}, Promo: "${nuevoServicio.textoPromocion || 'Ninguna'}", Duración: ${duracionMinutos}m).`,
    });

    return nuevoServicio;
  }

  eliminarServicio(servicioId: string) {
    const index = this.servicios.findIndex((s) => s.id === servicioId);
    if (index === -1) {
      return { id: servicioId, nombre: "Servicio Eliminado" } as any;
    }

    const eliminado = this.servicios.splice(index, 1)[0];

    this.registrarAuditLog({
      usuarioId: "usr-admin-1",
      usuarioNombre: "Marco Antonio (Administrador)",
      usuarioRol: "ADMIN",
      accion: "SERVICIO_ELIMINADO",
      modulo: "CONFIGURACION",
      entidadId: servicioId,
      detalles: `Servicio "${eliminado.nombre}" eliminado del catálogo.`,
    });

    return eliminado;
  }

  // Control de Personal
  actualizarUsuario(usuarioId: string, estado: "ACTIVO" | "INACTIVO", especialidad?: string) {
    const index = this.users.findIndex((u) => u.id === usuarioId);
    if (index === -1) {
      const nuevoUser: UserItem = {
        id: usuarioId,
        nombre: "Usuario del Sistema",
        email: `user-${usuarioId.slice(0, 8)}@ajfisioterapia.pe`,
        rol: "TERAPEUTA",
        estado,
        especialidad,
      };
      this.users.push(nuevoUser);
      return nuevoUser;
    }

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
      rol: "ADMIN" | "RECEPCION" | "TERAPEUTA" | "ASISTENTE" | "PACIENTE";
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
    nuevoRol: "ADMIN" | "RECEPCION" | "TERAPEUTA" | "ASISTENTE" | "PACIENTE",
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
    notasCita?: string | null;
    usuarioAuditoria?: { id?: string; nombre: string; rol: any };
    ipAddress?: string;
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
      notasCita: params.notasCita || undefined,
      creadoPorNombre: params.usuarioAuditoria?.nombre || "Recepción AJ Fisioterapia",
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
      detalles: `Cita agendada por ${params.usuarioAuditoria?.nombre || "Recepción"} para ${paciente?.nombres} ${paciente?.apellidos} en ${sala.nombre} con ${terapeuta?.nombre} para el ${new Date(nuevaCita.fechaHoraInicio).toLocaleDateString("es-PE")} (${new Date(nuevaCita.fechaHoraInicio).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}). ${esReevaluacionFlag ? "[HITO REEVALUACIÓN OBLIGATORIA]" : ""}`,
      ipAddress: params.ipAddress || "192.168.1.105",
    });

    return nuevaCita;
  }

  // Cambio de estado de cita con auditoría
  actualizarEstadoCita(
    citaId: string, 
    nuevoEstado: "PROGRAMADA" | "CONFIRMADA" | "ATENDIDA" | "CANCELADA" | "NO_ASISTIO",
    usuarioInfo?: { id?: string; nombre: string; rol: any; ipAddress?: string }
  ) {
    const index = this.citas.findIndex((c) => c.id === citaId);
    if (index === -1) throw new Error("Cita no encontrada.");

    const cita = this.citas[index];
    const estadoAnterior = cita.estado;
    const confirmadoPorNombre = (nuevoEstado === "CONFIRMADA") 
      ? (usuarioInfo?.nombre || "Karin Palacios (Recepción)") 
      : cita.confirmadoPorNombre;

    this.citas[index] = { 
      ...cita, 
      estado: nuevoEstado,
      confirmadoPorNombre,
    };

    // Actualización automática de sesiones consumidas del paquete (Regla 10)
    if (cita.paqueteId) {
      const paqIndex = this.paquetes.findIndex((p) => p.id === cita.paqueteId);
      if (paqIndex !== -1) {
        if (nuevoEstado === "ATENDIDA" && estadoAnterior !== "ATENDIDA") {
          this.paquetes[paqIndex].sesionesConsumidas = Math.min(
            this.paquetes[paqIndex].totalSesiones,
            this.paquetes[paqIndex].sesionesConsumidas + 1
          );
        } else if (estadoAnterior === "ATENDIDA" && nuevoEstado !== "ATENDIDA") {
          this.paquetes[paqIndex].sesionesConsumidas = Math.max(
            0,
            this.paquetes[paqIndex].sesionesConsumidas - 1
          );
        }
      }
    }

    const paciente = this.pacientes.find((p) => p.id === cita.pacienteId);
    const responsableNombre = usuarioInfo?.nombre || "Karin Palacios (Recepción)";
    const responsableRol = usuarioInfo?.rol || "RECEPCION";

    this.registrarAuditLog({
      usuarioId: usuarioInfo?.id || "usr-rec-1",
      usuarioNombre: responsableNombre,
      usuarioRol: responsableRol,
      accion: nuevoEstado === "CONFIRMADA" ? "CITA_ACEPTADA_CONFIRMADA" : "CITA_ESTADO_CAMBIADO",
      modulo: "AGENDA",
      entidadId: cita.id,
      detalles: `Cita de ${paciente?.nombres} ${paciente?.apellidos} cambió de ${estadoAnterior} a ${nuevoEstado} [Aceptada/Procesada por: ${responsableNombre}].`,
      ipAddress: usuarioInfo?.ipAddress || "192.168.1.106",
    });

    return this.citas[index];
  }

  // Reprogramación / Edición de Cita con validación de conflictos y auditoría
  reprogramarCita(params: {
    citaId: string;
    nuevaFechaHoraInicio: Date;
    nuevaSalaId: string;
    nuevoTerapeutaId: string;
    duracionMinutos?: number;
    usuarioAuditoria?: { id?: string; nombre: string; rol: any };
    ipAddress?: string;
  }) {
    const index = this.citas.findIndex((c) => c.id === params.citaId);
    if (index === -1) throw new Error("Cita no encontrada.");

    const citaActual = this.citas[index];
    const duracion = params.duracionMinutos || 45;
    const inicio = new Date(params.nuevaFechaHoraInicio);
    const fin = new Date(inicio.getTime() + duracion * 60000);

    const sala = this.salas.find((s) => s.id === params.nuevaSalaId);
    if (!sala) throw new Error("La sala seleccionada no existe.");
    if (sala.estado === "MANTENIMIENTO") {
      throw new Error(`La ${sala.nombre} se encuentra temporalmente en MANTENIMIENTO.`);
    }

    const terapeuta = this.users.find((u) => u.id === params.nuevoTerapeutaId);
    if (!terapeuta) throw new Error("Terapeuta no encontrado.");

    // Validar conflicto de sala (excluyendo la misma cita)
    const conflictoSala = this.citas.find((c) => {
      if (c.id === params.citaId) return false;
      if (c.salaId !== params.nuevaSalaId) return false;
      if (c.estado === "CANCELADA") return false;
      const cInicio = new Date(c.fechaHoraInicio).getTime();
      const cFin = new Date(c.fechaHoraFin).getTime();
      return inicio.getTime() < cFin && fin.getTime() > cInicio;
    });

    if (conflictoSala) {
      const pac = this.pacientes.find((p) => p.id === conflictoSala.pacienteId);
      throw new Error(`Conflicto de Horario en Sala: La ${sala.nombre} ya está reservada en ese horario para el paciente ${pac?.nombres || ""}.`);
    }

    // Validar conflicto de terapeuta (excluyendo la misma cita)
    const conflictoTerapeuta = this.citas.find((c) => {
      if (c.id === params.citaId) return false;
      if (c.terapeutaId !== params.nuevoTerapeutaId) return false;
      if (c.estado === "CANCELADA") return false;
      const cInicio = new Date(c.fechaHoraInicio).getTime();
      const cFin = new Date(c.fechaHoraFin).getTime();
      return inicio.getTime() < cFin && fin.getTime() > cInicio;
    });

    if (conflictoTerapeuta) {
      throw new Error(`Conflicto de Terapeuta: El profesional ${terapeuta.nombre} ya tiene otra atención asignada en ese bloque horario.`);
    }

    const anteriorStr = `${new Date(citaActual.fechaHoraInicio).toLocaleDateString("es-PE")} ${new Date(citaActual.fechaHoraInicio).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    const nuevoStr = `${inicio.toLocaleDateString("es-PE")} ${inicio.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    this.citas[index] = {
      ...citaActual,
      fechaHoraInicio: inicio.toISOString(),
      fechaHoraFin: fin.toISOString(),
      salaId: params.nuevaSalaId,
      terapeutaId: params.nuevoTerapeutaId,
      estado: "CONFIRMADA", // al reprogramar por recepción se confirma el nuevo turno
    };

    const paciente = this.pacientes.find((p) => p.id === citaActual.pacienteId);

    this.registrarAuditLog({
      usuarioId: params.usuarioAuditoria?.id || "usr-rec-1",
      usuarioNombre: params.usuarioAuditoria?.nombre || "Recepción AJ Fisioterapia",
      usuarioRol: params.usuarioAuditoria?.rol || "RECEPCION",
      accion: "CITA_REPROGRAMADA",
      modulo: "AGENDA",
      entidadId: citaActual.id,
      detalles: `Cita de ${paciente?.nombres} ${paciente?.apellidos} reprogramada de [${anteriorStr}] a [${nuevoStr} en ${sala.nombre} con ${terapeuta.nombre}].`,
      ipAddress: params.ipAddress || "192.168.1.108",
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
    ipAddress?: string;
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
      ipAddress: params.ipAddress || "192.168.1.112",
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
    ipAddress?: string;
  }) {
    const paqIndex = this.paquetes.findIndex((p) => p.id === params.paqueteId);
    if (paqIndex === -1) throw new Error("Paquete o tratamiento no encontrado.");
    const paq = this.paquetes[paqIndex];

    const estadoPagoVerif = params.estado || "VERIFICADO";

    // Validar unicidad estricta del número de operación (anti-duplicidad en Yape/Plin/POS)
    const numOpFinal = params.numeroOperacion?.trim() || null;
    if (numOpFinal) {
      const existeOp = this.pagos.find(
        (p) => p.numeroOperacion && p.numeroOperacion.trim().toLowerCase() === numOpFinal.toLowerCase()
      );
      if (existeOp) {
        throw new Error(
          `Duplicidad de comprobante: El número de operación "${numOpFinal}" ya fue registrado previamente en una cobranza el ${new Date(existeOp.fechaPago).toLocaleDateString("es-PE")}.`
        );
      }
    }

    const nuevoPago: PagoItem = {
      id: `pago-${Date.now()}`,
      paqueteId: params.paqueteId,
      monto: params.monto,
      metodoPago: params.metodoPago,
      numeroOperacion: numOpFinal || `${params.metodoPago}-${Date.now().toString().slice(-6)}`,
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
      ipAddress: params.ipAddress || "192.168.1.105",
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

    const primerNombre = data.primerNombre?.trim();
    const segundoNombre = data.segundoNombre?.trim();
    const apellidoPaterno = data.apellidoPaterno?.trim();
    const apellidoMaterno = data.apellidoMaterno?.trim();

    const nombres = data.nombres || [primerNombre, segundoNombre].filter(Boolean).join(" ");
    const apellidos = data.apellidos || [apellidoPaterno, apellidoMaterno].filter(Boolean).join(" ");

    let contactoEmergencia = data.contactoEmergencia;
    if (!contactoEmergencia && data.contactoEmergenciaNombre) {
      contactoEmergencia = `${data.contactoEmergenciaNombre}${
        data.contactoEmergenciaParentesco ? ` (${data.contactoEmergenciaParentesco})` : ""
      }${data.contactoEmergenciaTelefono ? ` - Tel: ${data.contactoEmergenciaTelefono}` : ""}`;
    }

    const nuevo: PacienteItem = {
      ...data,
      nombres,
      apellidos,
      contactoEmergencia,
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

  // Actualización de datos de paciente con auditoría
  actualizarPaciente(id: string, data: Partial<Omit<PacienteItem, "id" | "createdAt">>) {
    const index = this.pacientes.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Paciente no encontrado");

    const current = this.pacientes[index];
    const primerNombre = data.primerNombre !== undefined ? data.primerNombre.trim() : current.primerNombre;
    const segundoNombre = data.segundoNombre !== undefined ? data.segundoNombre?.trim() : current.segundoNombre;
    const apellidoPaterno = data.apellidoPaterno !== undefined ? data.apellidoPaterno.trim() : current.apellidoPaterno;
    const apellidoMaterno = data.apellidoMaterno !== undefined ? data.apellidoMaterno?.trim() : current.apellidoMaterno;

    let nombres = data.nombres ?? current.nombres;
    if (data.primerNombre !== undefined || data.segundoNombre !== undefined) {
      nombres = [primerNombre, segundoNombre].filter(Boolean).join(" ");
    }

    let apellidos = data.apellidos ?? current.apellidos;
    if (data.apellidoPaterno !== undefined || data.apellidoMaterno !== undefined) {
      apellidos = [apellidoPaterno, apellidoMaterno].filter(Boolean).join(" ");
    }

    let contactoEmergencia = data.contactoEmergencia ?? current.contactoEmergencia;
    if (data.contactoEmergenciaNombre !== undefined || data.contactoEmergenciaParentesco !== undefined || data.contactoEmergenciaTelefono !== undefined) {
      const nombreC = data.contactoEmergenciaNombre ?? current.contactoEmergenciaNombre ?? "";
      const parC = data.contactoEmergenciaParentesco ?? current.contactoEmergenciaParentesco ?? "";
      const telC = data.contactoEmergenciaTelefono ?? current.contactoEmergenciaTelefono ?? "";
      contactoEmergencia = `${nombreC}${parC ? ` (${parC})` : ""}${telC ? ` - Tel: ${telC}` : ""}`;
    }

    this.pacientes[index] = {
      ...this.pacientes[index],
      ...data,
      nombres,
      apellidos,
      contactoEmergencia,
    };

    const actualizado = this.pacientes[index];
    this.registrarAuditLog({
      usuarioId: "usr-rec-1",
      usuarioNombre: "Recepción AJ Fisioterapia",
      usuarioRol: "RECEPCION",
      accion: "PACIENTE_ACTUALIZADO",
      modulo: "HISTORIA_CLINICA",
      entidadId: actualizado.id,
      detalles: `Datos actualizados para ${actualizado.nombres} ${actualizado.apellidos} (DNI: ${actualizado.dni}, Tel: ${actualizado.telefono}).`,
    });

    return actualizado;
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

const globalForStore = globalThis as unknown as { gestorFisioStore?: GestorFisioStore };
export const dbStore = globalForStore.gestorFisioStore ?? new GestorFisioStore();
if (process.env.NODE_ENV !== "production") globalForStore.gestorFisioStore = dbStore;
