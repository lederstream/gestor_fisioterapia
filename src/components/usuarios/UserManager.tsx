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
  Send
} from "lucide-react";
import { generarClaveAleatoriaSegura } from "@/lib/crypto";

interface UserManagerProps {
  initialUsers: UserItem[];
}

export function UserManager({ initialUsers }: UserManagerProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [activeTab, setActiveTab] = useState<"usuarios" | "matriz">("usuarios");
  const [search, setSearch] = useState("");
  const [filterRol, setFilterRol] = useState<string>("TODOS");

  // Modal Nuevo Usuario (Campos Atómicos)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevoPrefijo, setNuevoPrefijo] = useState("Lic.");
  const [nuevoPrimerNombre, setNuevoPrimerNombre] = useState("");
  const [nuevoSegundoNombre, setNuevoSegundoNombre] = useState("");
  const [nuevoApellidoPaterno, setNuevoApellidoPaterno] = useState("");
  const [nuevoApellidoMaterno, setNuevoApellidoMaterno] = useState("");
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevoPassword, setNuevoPassword] = useState("");
  const [nuevoRol, setNuevoRol] = useState<UserRole>("TERAPEUTA");
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

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

  // Crear usuario con datos atómicos
  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    const nombresParts = [nuevoPrimerNombre.trim(), nuevoSegundoNombre.trim()].filter(Boolean).join(" ");
    const apellidosParts = [nuevoApellidoPaterno.trim(), nuevoApellidoMaterno.trim()].filter(Boolean).join(" ");
    const nombreCompletoGenerado = [
      nuevoPrefijo && nuevoPrefijo !== "Sin prefijo" ? nuevoPrefijo : "",
      nombresParts,
      apellidosParts,
    ].filter(Boolean).join(" ");

    const passwordFinal = nuevoPassword.trim() || generarClaveAleatoriaSegura(12);

    const res = await crearNuevoUsuario({
      nombre: nombreCompletoGenerado,
      email: nuevoEmail,
      rol: nuevoRol,
      especialidad: nuevaEspecialidad || undefined,
      estado: "ACTIVO",
      password: passwordFinal,
    });

    setLoading(false);

    if (res.success && res.data) {
      setUsers((prev) => [...prev, res.data!]);
      setIsModalOpen(false);
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
        rol: ROLE_DETAILS[res.data.rol].label,
        passwordTemporal: passwordFinal,
      });
      setCopiado(false);
    } else {
      setMensaje({ tipo: "error", texto: res.error || "Error al registrar usuario." });
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-1.5">
            <Shield className="w-3.5 h-3.5" /> Equipo y Permisos de Acceso
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gestión del Equipo
          </h1>
          <p className="text-xs text-slate-500">
            Administra al personal de la clínica, asigna sus puestos de trabajo y define a qué áreas pueden acceder.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/25 transition"
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
          className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold border-b-2 transition -mb-[1px] ${
            activeTab === "usuarios"
              ? "border-teal-600 text-teal-700 bg-teal-50/40"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuarios Registrados ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("matriz")}
          className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold border-b-2 transition -mb-[1px] ${
            activeTab === "matriz"
              ? "border-teal-600 text-teal-700 bg-teal-50/40"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Matriz de Permisos por Rol (Auditoría RBAC)</span>
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
                          {u.rol === "PACIENTE" ? (
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
                        </td>

                        <td className="py-3 px-4 text-right">
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

      {/* MODAL CREAR NUEVO USUARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl border border-teal-100">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Registrar Nuevo Usuario
                  </h3>
                  <p className="text-xs text-slate-500">
                    Asigne credenciales y perfil de seguridad
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearUsuario} className="mt-4 space-y-4 text-xs">
              {/* Nombres y Apellidos Desglosados */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
                <span className="font-bold text-slate-700 text-[11px] block uppercase tracking-wider">
                  Filiación e Identificación Oficial (Campos Separados)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Título / Grado
                    </label>
                    <select
                      value={nuevoPrefijo}
                      onChange={(e) => setNuevoPrefijo(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="Lic.">Lic. (Licenciado)</option>
                      <option value="Tec.">Tec. (Técnico)</option>
                      <option value="Dr.">Dr. (Doctor)</option>
                      <option value="Dra.">Dra. (Doctora)</option>
                      <option value="Sr.">Sr. (Señor)</option>
                      <option value="Sra.">Sra. (Señora)</option>
                      <option value="Sin prefijo">Sin prefijo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Primer Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Fernando"
                      value={nuevoPrimerNombre}
                      onChange={(e) => setNuevoPrimerNombre(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Segundo Nombre
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Gabriel"
                      value={nuevoSegundoNombre}
                      onChange={(e) => setNuevoSegundoNombre(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Apellido Paterno *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Quispe"
                      value={nuevoApellidoPaterno}
                      onChange={(e) => setNuevoApellidoPaterno(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Apellido Materno *
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

                {/* Previsualización del Nombre Registrado */}
                <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span>Nombre en el sistema:</span>
                  <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100">
                    {[
                      nuevoPrefijo && nuevoPrefijo !== "Sin prefijo" ? nuevoPrefijo : "",
                      nuevoPrimerNombre,
                      nuevoSegundoNombre,
                      nuevoApellidoPaterno,
                      nuevoApellidoMaterno,
                    ].filter(Boolean).join(" ") || "Complete los campos de filiación"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  placeholder="usuario@ajfisioterapia.pe"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Contraseña Inicial de Acceso *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const pass = generarClaveAleatoriaSegura(12);
                      setNuevoPassword(pass);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200 transition cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-teal-600" />
                    <span>⚡ Generar Clave Segura</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Mínimo 8 caracteres (o haga clic en Generar Clave)"
                  value={nuevoPassword}
                  onChange={(e) => setNuevoPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Cifrada irreversiblemente con bcrypt (factor 10). Podrá copiarla al completar el registro.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rol de Seguridad Asignado *
                </label>
                <select
                  value={nuevoRol}
                  onChange={(e) => setNuevoRol(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="TERAPEUTA">TERAPEUTA (Licenciado Colegiado / Escala EVA y Reevaluación)</option>
                  <option value="ASISTENTE">ASISTENTE (Técnico Terapéutico / Agentes Físicos y Sala)</option>
                  <option value="RECEPCION">RECEPCIÓN (Caja, Agenda y Admisión)</option>
                  <option value="ADMIN">ADMIN (Co-Administrador / Gerencia)</option>
                </select>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {ROLE_DETAILS[nuevoRol].description}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cargo o Especialidad (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Lic. Terapia Ortopédica / Recepcionista Turno Tarde"
                  value={nuevaEspecialidad}
                  onChange={(e) => setNuevaEspecialidad(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/25 transition disabled:opacity-50"
                >
                  {loading ? "Registrando..." : "Crear Usuario"}
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
                <span>{copiado ? "¡Credenciales Copiadas!" : "Copiar para el Colaborador"}</span>
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
                  {guardandoClave ? "Guardando..." : "Guardar Contraseña"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
