"use client";

import { useState } from "react";
import { 
  UserItem 
} from "@/lib/store";
import { 
  UserRole, 
  ROLE_DETAILS, 
  ROLE_PERMISSIONS, 
  Permission 
} from "@/lib/permissions";
import { 
  crearNuevoUsuario, 
  modificarRolUsuario, 
  cambiarEstadoUsuario, 
  eliminarUsuarioSistema,
  cambiarPasswordUsuarioDesdeAdmin
} from "@/server/actions/usuarios";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Lock, 
  Trash2, 
  KeyRound,
  Layers,
  Sparkles,
  Check,
  X,
  Copy,
  CheckCheck,
  Send,
  Eye,
  EyeOff,
  UserCheck,
  Stethoscope,
  Activity,
  Mail,
  Briefcase
} from "lucide-react";
import { generarClaveAleatoriaSegura } from "@/lib/password-generator";

interface UserManagerProps {
  initialUsers: UserItem[];
}

export function UserManager({ initialUsers }: UserManagerProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [activeTab, setActiveTab] = useState<"usuarios" | "matriz">("usuarios");
  const [search, setSearch] = useState("");
  const [filterRol, setFilterRol] = useState<string>("TODOS");

  // Modal Nuevo Usuario (Diseño Modular y Responsivo)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevoPrefijo, setNuevoPrefijo] = useState("Lic.");
  const [nuevoPrimerNombre, setNuevoPrimerNombre] = useState("");
  const [nuevoSegundoNombre, setNuevoSegundoNombre] = useState("");
  const [nuevoApellidoPaterno, setNuevoApellidoPaterno] = useState("");
  const [nuevoApellidoMaterno, setNuevoApellidoMaterno] = useState("");
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevoPassword, setNuevoPassword] = useState("");
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [nuevoRol, setNuevoRol] = useState<UserRole>("TERAPEUTA");
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Modal de entrega de credenciales recién creadas para el colaborador
  const [credencialesCreadas, setCredencialesCreadas] = useState<{
    nombre: string;
    email: string;
    rol: string;
    passwordTemporal: string;
  } | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Modal Cambiar Contraseña de Usuario por Admin
  const [passwordModalUser, setPasswordModalUser] = useState<UserItem | null>(null);
  const [nuevaClaveAdmin, setNuevaClaveAdmin] = useState("");
  const [guardandoClave, setGuardandoClave] = useState(false);

  const handleGuardarNuevaPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || !nuevaClaveAdmin) return;
    setGuardandoClave(true);
    const res = await cambiarPasswordUsuarioDesdeAdmin(passwordModalUser.id, nuevaClaveAdmin);
    setGuardandoClave(false);

    if (res.success) {
      setMensaje({
        tipo: "exito",
        texto: `Contraseña actualizada exitosamente para "${passwordModalUser.nombre}". Ya puede iniciar sesión con su nueva clave.`,
      });
      setPasswordModalUser(null);
      setNuevaClaveAdmin("");
    } else {
      setMensaje({
        tipo: "error",
        texto: res.error || "No se pudo actualizar la contraseña.",
      });
    }
  };

  // Filtrado de usuarios
  const filteredUsers = users.filter((u) => {
    if (filterRol !== "TODOS" && u.rol !== filterRol) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = u.nombre.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchEsp = (u.especialidad || "").toLowerCase().includes(q);
      return matchName || matchEmail || matchEsp;
    }
    return true;
  });

  // Cambiar rol dinámicamente
  const handleCambiarRol = async (userId: string, nuevoRol: UserRole) => {
    setLoading(true);
    setMensaje(null);
    const res = await modificarRolUsuario(userId, nuevoRol);
    setLoading(false);

    if (res.success && res.data) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, rol: nuevoRol } : u)));
      setMensaje({
        tipo: "exito",
        texto: `Rol de "${res.data.nombre}" actualizado a [${ROLE_DETAILS[nuevoRol].label}]. Permisos aplicados en tiempo real.`,
      });
    } else {
      setMensaje({ tipo: "error", texto: res.error || "Error al actualizar rol." });
    }
  };

  // Toggle estado Activo/Inactivo
  const handleToggleEstado = async (userId: string, estadoActual: "ACTIVO" | "INACTIVO") => {
    const nuevoEstado = estadoActual === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    const res = await cambiarEstadoUsuario(userId, nuevoEstado);
    if (res.success) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, estado: nuevoEstado } : u)));
      setMensaje({
        tipo: "exito",
        texto: `Estado del usuario modificado a [${nuevoEstado}].`,
      });
    }
  };

  // Eliminar usuario
  const handleEliminar = async (userId: string, nombre: string) => {
    if (!confirm(`¿Está seguro de eliminar al usuario "${nombre}" del sistema? Esta acción quedará registrada en auditoría.`)) {
      return;
    }

    const res = await eliminarUsuarioSistema(userId);
    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setMensaje({
        tipo: "exito",
        texto: `Usuario "${nombre}" desvinculado del sistema.`,
      });
    }
  };

  // Crear usuario con datos atómicos y validación amigable
  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const nombresParts = [nuevoPrimerNombre.trim(), nuevoSegundoNombre.trim()].filter(Boolean).join(" ");
    const apellidosParts = [nuevoApellidoPaterno.trim(), nuevoApellidoMaterno.trim()].filter(Boolean).join(" ");

    if (!nuevoPrimerNombre.trim() || !nuevoApellidoPaterno.trim()) {
      setModalError("Por favor ingrese al menos el Primer Nombre y Apellido Paterno del colaborador.");
      return;
    }

    const cleanEmail = nuevoEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setModalError("Por favor ingrese un correo electrónico institucional válido (ej. nombre@ajfisioterapia.pe).");
      return;
    }

    const passwordFinal = nuevoPassword.trim() || generarClaveAleatoriaSegura(12);

    if (passwordFinal.length < 8) {
      setModalError("La contraseña inicial debe contener al menos 8 caracteres por seguridad criptográfica.");
      return;
    }

    setLoading(true);

    const nombreCompletoGenerado = [
      nuevoPrefijo && nuevoPrefijo !== "Sin prefijo" ? nuevoPrefijo : "",
      nombresParts,
      apellidosParts,
    ].filter(Boolean).join(" ");

    const res = await crearNuevoUsuario({
      nombre: nombreCompletoGenerado,
      email: cleanEmail,
      rol: nuevoRol,
      especialidad: nuevaEspecialidad.trim() || undefined,
      estado: "ACTIVO",
      password: passwordFinal,
    });

    setLoading(false);

    if (res.success && res.data) {
      setUsers((prev) => [...prev, res.data!]);
      setIsModalOpen(false);
      setModalError(null);
      setNuevoPrimerNombre("");
      setNuevoSegundoNombre("");
      setNuevoApellidoPaterno("");
      setNuevoApellidoMaterno("");
      setNuevoEmail("");
      setNuevoPassword("");
      setNuevaEspecialidad("");
      setCredencialesCreadas({
        nombre: res.data.nombre,
        email: res.data.email,
        rol: ROLE_DETAILS[res.data.rol]?.label || res.data.rol,
        passwordTemporal: passwordFinal,
      });
      setCopiado(false);
    } else {
      setModalError(res.error || "No se pudo registrar el usuario en el sistema.");
    }
  };

  // Lista de permisos clave para la matriz
  const permisosMatriz: { modulo: string; permiso: Permission; label: string }[] = [
    { modulo: "Agenda de Salas", permiso: "agenda:ver", label: "Ver disponibilidad y matriz de 6 salas" },
    { modulo: "Agenda de Salas", permiso: "agenda:agendar", label: "Reservar, reprogramar o cancelar citas" },
    { modulo: "Caja y Cobranzas", permiso: "caja:ver", label: "Ver balance monetario del turno y recaudación" },
    { modulo: "Caja y Cobranzas", permiso: "caja:cobrar", label: "Cobrar con Yape, Plin, POS y Efectivo" },
    { modulo: "Caja y Cobranzas", permiso: "caja:arqueo", label: "Realizar arqueo físico y sellado de turno" },
    { modulo: "Pacientes", permiso: "pacientes:ver", label: "Consultar directorio general de pacientes" },
    { modulo: "Pacientes", permiso: "pacientes:crear", label: "Registrar nuevos pacientes y expedientes" },
    { modulo: "Pacientes", permiso: "pacientes:paquetes", label: "Contratar paquetes de 10 y 20 sesiones" },
    { modulo: "Ficha Médica & EVA", permiso: "clinica:evolucion", label: "Registrar escala EVA antes y después de terapia" },
    { modulo: "Ficha Médica & EVA", permiso: "clinica:reevaluacion", label: "Acreditar examen de 5 sesiones y desbloquear alta" },
    { modulo: "Ficha Médica & EVA", permiso: "clinica:reporte", label: "Emitir informe médico oficial membretado" },
    { modulo: "Auditoría & Logs", permiso: "auditoria:ver", label: "Ver bitácora inmutable de eventos con IP y fecha" },
    { modulo: "Configuración", permiso: "config:modificar", label: "Modificar tarifas, salas y reglas de San Borja" },
    { modulo: "Seguridad & RBAC", permiso: "usuarios:gestionar", label: "Crear usuarios y cambiar roles dinámicamente" },
    { modulo: "Portal Paciente", permiso: "portal:mis_citas", label: "Portal privado de consultas sin acceso administrativo" },
  ];

  return (
    <div className="space-y-6">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-1">
            <Shield className="w-3.5 h-3.5" /> Equipo y Permisos
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Equipo
          </h1>
          <p className="text-xs text-slate-500">
            Personal clínico, roles y permisos de acceso.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/25 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Alerta de Notificación */}
      {mensaje && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
            mensaje.tipo === "exito"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {mensaje.tipo === "exito" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{mensaje.texto}</span>
          </div>
          <button
            onClick={() => setMensaje(null)}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tarjetas de Políticas de Seguridad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(ROLE_DETAILS).map((role) => (
          <div
            key={role.id}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${role.badge}`}>
                {role.id}
              </span>
              <span className={`w-2.5 h-2.5 rounded-full ${role.dot}`} />
            </div>
            <h4 className="font-extrabold text-slate-800 text-xs">{role.label}</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
              {role.description}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab("usuarios")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition -mb-[1px] cursor-pointer ${
            activeTab === "usuarios"
              ? "border-teal-600 text-teal-700 bg-teal-50/40"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuarios ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("matriz")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition -mb-[1px] cursor-pointer ${
            activeTab === "matriz"
              ? "border-teal-600 text-teal-700 bg-teal-50/40"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Permisos (RBAC)</span>
        </button>
      </div>

      {/* TAB 1: TABLA DE USUARIOS Y ROLES */}
      {activeTab === "usuarios" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-5">
          {/* Barra de Filtros */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, correo o cargo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterRol}
                onChange={(e) => setFilterRol(e.target.value)}
                className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
              >
                <option value="TODOS">Todos los Roles</option>
                <option value="ADMIN">ADMIN (Gerencia)</option>
                <option value="RECEPCION">RECEPCIÓN (Caja/Admisión)</option>
                <option value="TERAPEUTA">TERAPEUTA (Clínico)</option>
                <option value="ASISTENTE">ASISTENTE (Técnico / Salas)</option>
                <option value="PACIENTE">PACIENTE (Cliente)</option>
              </select>
            </div>
          </div>

          {/* Tabla de Usuarios */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Usuario / Personal</th>
                  <th className="py-3 px-4 font-semibold">Correo Electrónico</th>
                  <th className="py-3 px-4 font-semibold">Rol Asignado (Dinámico)</th>
                  <th className="py-3 px-4 font-semibold">Cargo / Especialidad</th>
                  <th className="py-3 px-4 font-semibold">Estado</th>
                  <th className="py-3 px-4 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No se encontraron usuarios con los criterios aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const roleInfo = ROLE_DETAILS[u.rol] || ROLE_DETAILS.TERAPEUTA;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                              {u.nombre.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {u.nombre}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          {u.email}
                        </td>

                        {/* SELECTOR DE ROL DINÁMICO (PROTEGIDO) */}
                        <td className="py-3 px-4">
                          {u.rol === "SUPERADMIN" ? (
                            <span 
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black rounded-lg border bg-slate-900 text-amber-400 border-amber-500/40 shadow-xs"
                              title="Cuenta raíz protegida por el proveedor SaaS (Inmutable por la clínica)"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                              <span>SUPERADMIN</span>
                            </span>
                          ) : u.rol === "PACIENTE" ? (
                            <span 
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs"
                              title="Rol blindado por seguridad médica RBAC (No escalable a personal administrativo)"
                            >
                              <Lock className="w-3 h-3 text-emerald-600" />
                              <span>PACIENTE</span>
                            </span>
                          ) : (
                            <select
                              value={u.rol}
                              disabled={loading}
                              onChange={(e) => handleCambiarRol(u.id, e.target.value as UserRole)}
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg border focus:outline-none transition cursor-pointer ${roleInfo.badge}`}
                            >
                              <option value="ADMIN">ADMIN</option>
                              <option value="RECEPCION">RECEPCIÓN</option>
                              <option value="TERAPEUTA">TERAPEUTA</option>
                              <option value="ASISTENTE">ASISTENTE</option>
                            </select>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-600 text-[11px]">
                          {u.especialidad || "—"}
                        </td>

                        <td className="py-3 px-4">
                          {u.rol === "SUPERADMIN" ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-300">
                              Protegido
                            </span>
                          ) : (
                            <button
                              onClick={() => handleToggleEstado(u.id, u.estado)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
                                u.estado === "ACTIVO"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200"
                              }`}
                            >
                              {u.estado === "ACTIVO" ? "Activo" : "Suspendido"}
                            </button>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          {u.rol === "SUPERADMIN" ? (
                            <span className="text-[10px] text-slate-400 font-semibold px-2 py-1">
                              Cuenta Raíz
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setPasswordModalUser(u);
                                  setNuevaClaveAdmin("");
                                }}
                                className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-teal-50 transition cursor-pointer"
                                title="Asignar / Cambiar Contraseña"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleEliminar(u.id, u.nombre)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MATRIZ AUDITABLE DE PERMISOS (RBAC) */}
      {activeTab === "matriz" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Matriz Comparativa de Permisos y Medidas de Seguridad
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervisión de restricciones por perfil para cumplimiento de buenas prácticas médicas y financieras.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Módulo Funcional</th>
                  <th className="py-3 px-4">Capacidad / Acción</th>
                  <th className="py-3 px-3 text-center bg-purple-50/80 text-purple-900">ADMIN</th>
                  <th className="py-3 px-3 text-center bg-blue-50/80 text-blue-900">RECEPCIÓN</th>
                  <th className="py-3 px-3 text-center bg-teal-50/80 text-teal-900">TERAPEUTA</th>
                  <th className="py-3 px-3 text-center bg-emerald-50/80 text-emerald-900">PACIENTE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permisosMatriz.map((item, idx) => {
                  const adminHas = ROLE_PERMISSIONS.ADMIN.includes(item.permiso);
                  const recHas = ROLE_PERMISSIONS.RECEPCION.includes(item.permiso);
                  const terHas = ROLE_PERMISSIONS.TERAPEUTA.includes(item.permiso);
                  const pacHas = ROLE_PERMISSIONS.PACIENTE.includes(item.permiso);

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {item.modulo}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.label}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {adminHas ? (
                          <span className="inline-flex p-1 rounded-md bg-emerald-50 text-emerald-600">
                            <Check className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex p-1 rounded-md bg-rose-50 text-rose-500">
                            <X className="w-4 h-4" />
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {recHas ? (
                          <span className="inline-flex p-1 rounded-md bg-emerald-50 text-emerald-600">
                            <Check className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex p-1 rounded-md bg-rose-50 text-rose-500">
                            <X className="w-4 h-4" />
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {terHas ? (
                          <span className="inline-flex p-1 rounded-md bg-emerald-50 text-emerald-600">
                            <Check className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex p-1 rounded-md bg-rose-50 text-rose-500">
                            <X className="w-4 h-4" />
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {pacHas ? (
                          <span className="inline-flex p-1 rounded-md bg-emerald-50 text-emerald-600">
                            <Check className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex p-1 rounded-md bg-rose-50 text-rose-500">
                            <X className="w-4 h-4" />
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CREAR NUEVO USUARIO (MODULAR, RESPONSIVO Y AMIGABLE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200/80 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Fijo */}
            <div className="px-6 py-4 sm:px-8 sm:py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/80 flex items-center justify-center shadow-xs">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    Nuevo Usuario
                  </h3>
                  <p className="text-xs text-slate-500">
                    Alta de personal clínico o administrativo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setModalError(null);
                }}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario con Body Scrolleable */}
            <form onSubmit={handleCrearUsuario} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 text-xs">
              {/* Alerta de Error dentro del Modal */}
              {modalError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800 animate-in fade-in duration-150">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{modalError}</span>
                </div>
              )}

              {/* BLOQUE 1: Filiación e Información Personal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-black text-[10px] flex items-center justify-center">
                      1
                    </span>
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                      Datos Personales y Colegiatura
                    </h4>
                  </div>
                  {/* Vista previa en tiempo real */}
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 max-w-[240px] truncate hidden sm:inline-block">
                    {[
                      nuevoPrefijo !== "Sin prefijo" ? nuevoPrefijo : "",
                      nuevoPrimerNombre,
                      nuevoApellidoPaterno
                    ].filter(Boolean).join(" ") || "Nombre preliminar"}
                  </span>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Título / Grado
                      </label>
                      <select
                        value={nuevoPrefijo}
                        onChange={(e) => setNuevoPrefijo(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      >
                        <option value="Lic.">Lic. (Licenciado Colegiado)</option>
                        <option value="Tec.">Tec. (Técnico en Terapia)</option>
                        <option value="Dr.">Dr. (Doctor)</option>
                        <option value="Dra.">Dra. (Doctora)</option>
                        <option value="Sr.">Sr. (Señor)</option>
                        <option value="Sra.">Sra. (Señora)</option>
                        <option value="Sin prefijo">Sin prefijo</option>
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Primer Nombre <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Carlos"
                        value={nuevoPrimerNombre}
                        onChange={(e) => setNuevoPrimerNombre(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Segundo Nombre <span className="text-slate-400 font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Enrique"
                        value={nuevoSegundoNombre}
                        onChange={(e) => setNuevoSegundoNombre(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Apellido Paterno <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Mendoza"
                        value={nuevoApellidoPaterno}
                        onChange={(e) => setNuevoApellidoPaterno(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Apellido Materno <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Huamán"
                        value={nuevoApellidoMaterno}
                        onChange={(e) => setNuevoApellidoMaterno(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Especialidad o Cargo Clínico
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Lic. Fisioterapia Deportiva y Readaptación"
                      value={nuevaEspecialidad}
                      onChange={(e) => setNuevaEspecialidad(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                    {/* Sugerencias Rápidas en chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-400 self-center">Sugerencias:</span>
                      {[
                        "Fisioterapia Deportiva",
                        "Terapia Manual y Columna",
                        "Rehabilitación Neurológica",
                        "Técnico en Agentes Físicos",
                        "Admisión y Caja"
                      ].map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setNuevaEspecialidad(sug)}
                          className="px-2 py-0.5 rounded-lg bg-white hover:bg-teal-50 text-slate-600 hover:text-teal-700 text-[10px] font-semibold border border-slate-200 hover:border-teal-300 transition cursor-pointer"
                        >
                          + {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOQUE 2: Selección de Rol y Nivel de Acceso (Tarjetas Interactivas) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-black text-[10px] flex items-center justify-center">
                    2
                  </span>
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                    Rol de Seguridad y Permisos
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* TERAPEUTA */}
                  <div
                    onClick={() => setNuevoRol("TERAPEUTA")}
                    className={`p-3 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 ${
                      nuevoRol === "TERAPEUTA"
                        ? "border-teal-600 bg-teal-50/60 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${nuevoRol === "TERAPEUTA" ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-700"}`}>
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">TERAPEUTA</span>
                        {nuevoRol === "TERAPEUTA" && <Check className="w-4 h-4 text-teal-700" />}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                        Licenciado Colegiado. Registra escala EVA, evolución médica y reevaluaciones.
                      </p>
                    </div>
                  </div>

                  {/* RECEPCION */}
                  <div
                    onClick={() => setNuevoRol("RECEPCION")}
                    className={`p-3 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 ${
                      nuevoRol === "RECEPCION"
                        ? "border-blue-600 bg-blue-50/60 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${nuevoRol === "RECEPCION" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700"}`}>
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">RECEPCIÓN</span>
                        {nuevoRol === "RECEPCION" && <Check className="w-4 h-4 text-blue-700" />}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                        Admisión y Caja. Gestiona agenda de salas, pre-reservas web y cobros Yape/POS.
                      </p>
                    </div>
                  </div>

                  {/* ASISTENTE */}
                  <div
                    onClick={() => setNuevoRol("ASISTENTE")}
                    className={`p-3 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 ${
                      nuevoRol === "ASISTENTE"
                        ? "border-amber-600 bg-amber-50/60 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${nuevoRol === "ASISTENTE" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-700"}`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">ASISTENTE</span>
                        {nuevoRol === "ASISTENTE" && <Check className="w-4 h-4 text-amber-700" />}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                        Técnico Clínico. Apoyo en salas y aplicación de agentes físicos (TENS/calor).
                      </p>
                    </div>
                  </div>

                  {/* ADMIN */}
                  <div
                    onClick={() => setNuevoRol("ADMIN")}
                    className={`p-3 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 ${
                      nuevoRol === "ADMIN"
                        ? "border-purple-600 bg-purple-50/60 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${nuevoRol === "ADMIN" ? "bg-purple-600 text-white" : "bg-purple-50 text-purple-700"}`}>
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">ADMINISTRADOR</span>
                        {nuevoRol === "ADMIN" && <Check className="w-4 h-4 text-purple-700" />}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                        Dirección y Gerencia. Control total: finanzas, auditoría y usuarios.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOQUE 3: Credenciales de Inicio de Sesión */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-black text-[10px] flex items-center justify-center">
                    3
                  </span>
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                    Credenciales de Acceso al Sistema
                  </h4>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Correo Institucional <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="nombre.apellido@ajfisioterapia.pe"
                          value={nuevoEmail}
                          onChange={(e) => setNuevoEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700">
                          Contraseña Inicial <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const gen = generarClaveAleatoriaSegura(12);
                            setNuevoPassword(gen);
                            setShowModalPassword(true);
                          }}
                          className="text-[10px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-lg border border-teal-200 transition cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-teal-600" />
                          <span>⚡ Generar Clave</span>
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type={showModalPassword ? "text" : "password"}
                          required
                          placeholder="Mínimo 8 caracteres"
                          value={nuevoPassword}
                          onChange={(e) => setNuevoPassword(e.target.value)}
                          className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono font-bold text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowModalPassword(!showModalPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400">
                    🔒 La contraseña se cifrará con algoritmo bcrypt. Podrás copiarla al completar el registro para entregársela al colaborador.
                  </p>
                </div>
              </div>

              {/* Footer Fijo con botones */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setModalError(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md shadow-teal-600/25 transition disabled:opacity-50 cursor-pointer flex items-center gap-2 text-xs"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Crear Usuario</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Entrega Segura de Credenciales al Colaborador */}
      {credencialesCreadas && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-emerald-200 animate-in fade-in zoom-in-95 duration-150 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                ¡Colaborador Registrado con Éxito!
              </h3>
              <p className="text-xs text-slate-500">
                Entregue estas credenciales iniciales al colaborador para su primer ingreso.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Nombre:</span>
                <span className="font-bold text-slate-800">{credencialesCreadas.nombre}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Rol Asignado:</span>
                <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {credencialesCreadas.rol}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Usuario / Correo:</span>
                <span className="font-mono font-bold text-slate-800">{credencialesCreadas.email}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Contraseña Inicial:</span>
                <span className="font-mono font-black text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-300 text-sm tracking-wider select-all">
                  {credencialesCreadas.passwordTemporal}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              🔒 Por seguridad, la contraseña ha sido cifrada mediante hash criptográfico bcrypt y nunca se expone en texto plano en la base de datos.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const texto = `¡Hola ${credencialesCreadas.nombre}! Se ha creado tu acceso al sistema clínico de AJ Fisioterapia:\n\n• Portal de Acceso: ${window.location.origin}/login\n• Usuario: ${credencialesCreadas.email}\n• Contraseña Inicial: ${credencialesCreadas.passwordTemporal}\n• Rol: ${credencialesCreadas.rol}\n\nPor seguridad médica y trazabilidad, podrás actualizar tu contraseña desde tu perfil al ingresar.`;
                  navigator.clipboard.writeText(texto);
                  setCopiado(true);
                  setTimeout(() => setCopiado(false), 2500);
                }}
                className="flex-1 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-teal-600/20"
              >
                {copiado ? <CheckCheck className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiado ? "¡Copiado!" : "Copiar Credenciales"}</span>
              </button>

              <button
                type="button"
                onClick={() => setCredencialesCreadas(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar / Cambiar Contraseña */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Asignar Contraseña
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {passwordModalUser.nombre} ({passwordModalUser.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarNuevaPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nueva Contraseña de Acceso *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mínimo 6 caracteres (ej. Staff2026!)"
                  value={nuevaClaveAdmin}
                  onChange={(e) => setNuevaClaveAdmin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  El colaborador podrá ingresar inmediatamente con esta contraseña y su correo o usuario.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoClave}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {guardandoClave ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
