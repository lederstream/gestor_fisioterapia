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
  eliminarUsuarioSistema 
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
  X
} from "lucide-react";

interface UserManagerProps {
  initialUsers: UserItem[];
}

export function UserManager({ initialUsers }: UserManagerProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [activeTab, setActiveTab] = useState<"usuarios" | "matriz">("usuarios");
  const [search, setSearch] = useState("");
  const [filterRol, setFilterRol] = useState<string>("TODOS");

  // Modal Nuevo Usuario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevoRol, setNuevoRol] = useState<UserRole>("TERAPEUTA");
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

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

  // Crear usuario
  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    const res = await crearNuevoUsuario({
      nombre: nuevoNombre,
      email: nuevoEmail,
      rol: nuevoRol,
      especialidad: nuevaEspecialidad || undefined,
      estado: "ACTIVO",
    });

    setLoading(false);

    if (res.success && res.data) {
      setUsers((prev) => [...prev, res.data!]);
      setIsModalOpen(false);
      setNuevoNombre("");
      setNuevoEmail("");
      setNuevaEspecialidad("");
      setMensaje({
        tipo: "exito",
        texto: `Usuario "${res.data.nombre}" registrado exitosamente con rol [${ROLE_DETAILS[res.data.rol].label}].`,
      });
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold mb-1.5">
            <Shield className="w-3.5 h-3.5" /> Seguridad y Control de Acceso (RBAC)
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gestión Dinámica de Usuarios y Roles
          </h1>
          <p className="text-xs text-slate-500">
            Administre personal, asigne permisos segmentados y garantice la separación entre clínica, finanzas y clientes.
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
                    const roleInfo = ROLE_DETAILS[u.rol];
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

                        {/* SELECTOR DE ROL DINÁMICO */}
                        <td className="py-3 px-4">
                          <select
                            value={u.rol}
                            disabled={loading}
                            onChange={(e) => handleCambiarRol(u.id, e.target.value as UserRole)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg border focus:outline-none transition cursor-pointer ${roleInfo.badge}`}
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="RECEPCION">RECEPCIÓN</option>
                            <option value="TERAPEUTA">TERAPEUTA</option>
                            <option value="PACIENTE">PACIENTE</option>
                          </select>
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
                          <button
                            onClick={() => handleEliminar(u.id, u.nombre)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Lic. Fernando Quispe"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
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
                <label className="block font-semibold text-slate-700 mb-1">
                  Rol de Seguridad Asignado *
                </label>
                <select
                  value={nuevoRol}
                  onChange={(e) => setNuevoRol(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="ADMIN">ADMIN (Gerencia y Control Total)</option>
                  <option value="RECEPCION">RECEPCIÓN (Caja, Agenda y Admisión)</option>
                  <option value="TERAPEUTA">TERAPEUTA (Atención Médica y Escala EVA)</option>
                  <option value="PACIENTE">PACIENTE (Portal Privado de Consultas)</option>
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
    </div>
  );
}
