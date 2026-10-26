import { z } from "zod";

export const agendarCitaSchema = z.object({
  pacienteId: z.string().min(1, "Debe seleccionar un paciente"),
  paqueteId: z.string().optional().nullable(),
  terapeutaId: z.string().min(1, "Debe asignar un terapeuta"),
  salaId: z.string().min(1, "Debe seleccionar una sala física"),
  fechaHoraInicio: z.string().or(z.date()).transform((val) => new Date(val)),
  duracionMinutos: z.number().int().min(30).max(120).optional().default(45),
  esReevaluacion: z.boolean().optional().default(false),
  notasCita: z.string().optional().nullable(),
});

export type AgendarCitaInput = z.infer<typeof agendarCitaSchema>;

// Validación para registrar asistencia y evolución clínica
export const registrarAsistenciaYEvolucionSchema = z.object({
  citaId: z.string().min(1, "Identificador de cita requerido"),
  terapeutaId: z.string().min(1, "Terapeuta responsable requerido"),
  evaDolorInicio: z.number().int().min(0).max(10, "La escala EVA debe estar entre 0 y 10"),
  evaDolorFin: z.number().int().min(0).max(10, "La escala EVA debe estar entre 0 y 10"),
  tratamientoAplicado: z.string().min(10, "El tratamiento aplicado debe tener al menos 10 caracteres"),
  notasReevaluacion: z.string().optional().nullable(),
  completarReevaluacion: z.boolean().default(false),
});

export type RegistrarAsistenciaYEvolucionInput = z.infer<typeof registrarAsistenciaYEvolucionSchema>;

// Validación para registrar pagos y cobranzas
export const registrarPagoSchema = z.object({
  paqueteId: z.string().min(1, "Debe seleccionar el paquete o tratamiento a pagar"),
  monto: z.number().positive("El monto debe ser mayor a 0"),
  metodoPago: z.enum(["EFECTIVO", "YAPE", "PLIN", "POS"]),
  numeroOperacion: z.string().optional().nullable(),
  comprobanteUrl: z.string().url("URL de comprobante no válida").optional().nullable(),
  estado: z.enum(["VERIFICADO", "PENDIENTE"]).default("VERIFICADO"),
});

export type RegistrarPagoInput = z.infer<typeof registrarPagoSchema>;

// Validación para crear nuevo paciente
export const crearPacienteSchema = z.object({
  tipoDocumento: z.enum(["DNI", "CE", "PASAPORTE", "CEDULA", "OTRO"]).default("DNI").optional(),
  dni: z.string().min(5, "El documento debe tener al menos 5 caracteres").max(20, "Máximo 20 caracteres"),
  primerNombre: z.string().optional(),
  segundoNombre: z.string().optional().nullable(),
  apellidoPaterno: z.string().optional(),
  apellidoMaterno: z.string().optional().nullable(),
  nombres: z.string().optional(),
  apellidos: z.string().optional(),
  telefono: z.string().min(9, "El teléfono debe tener al menos 9 dígitos"),
  email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
  fechaNacimiento: z.string().or(z.date()).transform((val) => new Date(val)),
  contactoEmergenciaNombre: z.string().optional().nullable(),
  contactoEmergenciaParentesco: z.string().optional().nullable(),
  contactoEmergenciaTelefono: z.string().optional().nullable(),
  contactoEmergencia: z.string().optional().nullable(),
});

export type CrearPacienteInput = z.infer<typeof crearPacienteSchema>;

// Validación para el portal de reservas públicas
export const reservaPublicaSchema = z.object({
  dni: z.string().regex(/^\d{8}$/, "El DNI debe tener 8 dígitos"),
  primerNombre: z.string().optional(),
  segundoNombre: z.string().optional().nullable(),
  apellidoPaterno: z.string().optional(),
  apellidoMaterno: z.string().optional().nullable(),
  nombres: z.string().optional(),
  apellidos: z.string().optional(),
  telefono: z.string().regex(/^9\d{8}$/, "Número de celular peruano válido (ej. 987654321)"),
  email: z.string().email("Correo electrónico válido").optional().or(z.literal("")),
  servicioId: z.string().min(1, "Seleccione el servicio requerido"),
  fechaDeseada: z.string().min(1, "Seleccione una fecha"),
  horarioPreferente: z.string().min(1, "Seleccione un horario preferente"),
  motivoConsulta: z.string().min(5, "Breve descripción de su molestia o lesión"),
});

export type ReservaPublicaInput = z.infer<typeof reservaPublicaSchema>;
