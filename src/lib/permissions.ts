// KineFlow Core - Matriz de Permisos y Control de Acceso Basado en Roles (RBAC)
// AJ Fisioterapia (San Borja)

export type UserRole = "ADMIN" | "RECEPCION" | "TERAPEUTA" | "PACIENTE";

export type Permission =
  // Agenda
  | "agenda:ver"
  | "agenda:agendar"
  | "agenda:modificar"
  // Caja y Cobranzas
  | "caja:ver"
  | "caja:cobrar"
  | "caja:arqueo"
  | "caja:exportar"
  // Directorio de Pacientes
  | "pacientes:ver"
  | "pacientes:crear"
  | "pacientes:paquetes"
  // Ficha Clínica y EVA
  | "clinica:ver"
  | "clinica:evolucion"
  | "clinica:reevaluacion"
  | "clinica:reporte"
  // Auditoría y Trazabilidad
  | "auditoria:ver"
  | "auditoria:exportar"
  // Configuración y Administración del Sistema
  | "config:ver"
  | "config:modificar"
  | "usuarios:gestionar"
  // Portal Privado del Paciente
  | "portal:reservas"
  | "portal:mis_citas"
  | "portal:mi_progreso";

// Matriz estricta de permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    "agenda:ver", "agenda:agendar", "agenda:modificar",
    "caja:ver", "caja:cobrar", "caja:arqueo", "caja:exportar",
    "pacientes:ver", "pacientes:crear", "pacientes:paquetes",
    "clinica:ver", "clinica:evolucion", "clinica:reevaluacion", "clinica:reporte",
    "auditoria:ver", "auditoria:exportar",
    "config:ver", "config:modificar", "usuarios:gestionar",
    "portal:reservas", "portal:mis_citas", "portal:mi_progreso"
  ],
  RECEPCION: [
    "agenda:ver", "agenda:agendar", "agenda:modificar",
    "caja:ver", "caja:cobrar", "caja:arqueo", "caja:exportar",
    "pacientes:ver", "pacientes:crear", "pacientes:paquetes",
    "clinica:ver",
    "portal:reservas"
  ],
  TERAPEUTA: [
    "agenda:ver",
    "pacientes:ver",
    "clinica:ver", "clinica:evolucion", "clinica:reevaluacion", "clinica:reporte",
  ],
  PACIENTE: [
    "portal:reservas", "portal:mis_citas", "portal:mi_progreso"
  ]
};

export interface RoleDetail {
  id: UserRole;
  label: string;
  nameExample: string;
  title: string;
  description: string;
  color: string;
  badge: string;
  dot: string;
}

export const ROLE_DETAILS: Record<UserRole, RoleDetail> = {
  ADMIN: {
    id: "ADMIN",
    label: "Administrador (Gerencia)",
    nameExample: "Marco Antonio",
    title: "Dirección Clínica y Gerencia",
    description: "Acceso total e irrestricto al sistema: administración de usuarios, auditoría, finanzas, configuración y salas.",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    badge: "bg-purple-100 text-purple-800 border-purple-300",
    dot: "bg-purple-600",
  },
  RECEPCION: {
    id: "RECEPCION",
    label: "Recepción (Admisión/Caja)",
    nameExample: "Ana Ramos",
    title: "Admisión, Agenda y Caja",
    description: "Gestión de agenda, asignación de citas, cobranzas en caja (Yape/Plin/POS/Efectivo) y alta de pacientes.",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    badge: "bg-blue-100 text-blue-800 border-blue-300",
    dot: "bg-blue-600",
  },
  TERAPEUTA: {
    id: "TERAPEUTA",
    label: "Fisioterapeuta Clínico",
    nameExample: "Lic. Carlos Mendoza",
    title: "Fisioterapia y Rehabilitación",
    description: "Atención médica, registro de evolución y escala EVA, protocolo de reevaluación e informes médicos.",
    color: "bg-teal-50 text-teal-700 border-teal-200",
    badge: "bg-teal-100 text-teal-800 border-teal-300",
    dot: "bg-teal-600",
  },
  PACIENTE: {
    id: "PACIENTE",
    label: "Paciente / Cliente",
    nameExample: "Renato Salazar",
    title: "Usuario / Paciente Clínico",
    description: "Portal privado para consultar citas, sesiones contratadas y avance terapéutico. Restringido de áreas administrativas.",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    dot: "bg-emerald-600",
  },
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}
