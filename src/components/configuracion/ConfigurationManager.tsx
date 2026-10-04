"use client";

import { useState } from "react";
import { 
  guardarConfiguracionClinica, 
  cambiarEstadoSala, 
  modificarServicio, 
  cambiarEstadoPersonal 
} from "@/server/actions/configuracion";
import { formatCurrency } from "@/lib/utils";
import { 
  Building2, 
  Layers, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Save, 
  Wrench,
  Sparkles
} from "lucide-react";

interface ConfigurationManagerProps {
  initialConfig: any;
  initialSalas: any[];
  initialServicios: any[];
  initialPersonal: any[];
}

export function ConfigurationManager({
  initialConfig,
  initialSalas,
  initialServicios,
  initialPersonal,
}: ConfigurationManagerProps) {
  const [activeTab, setActiveTab] = useState<"general" | "salas" | "servicios" | "personal">("general");

  // State Config General
  const [config, setConfig] = useState(initialConfig);
  const [savingConfig, setSavingConfig] = useState(false);
  const [msgConfig, setMsgConfig] = useState<string | null>(null);

  // State Salas
  const [salas, setSalas] = useState(initialSalas);
  const [updatingSalaId, setUpdatingSalaId] = useState<string | null>(null);

  // State Servicios
  const [servicios, setServicios] = useState(initialServicios);
  const [editingServicioId, setEditingServicioId] = useState<string | null>(null);
  const [servicioPrecio, setServicioPrecio] = useState<number>(0);
  const [servicioDuracion, setServicioDuracion] = useState<number>(45);

  // State Personal
  const [personal, setPersonal] = useState(initialPersonal);

  // Guardar configuración general
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setMsgConfig(null);

    const res = await guardarConfiguracionClinica({
      razonSocial: config.razonSocial,
      nombreComercial: config.nombreComercial,
      ruc: config.ruc,
      direccion: config.direccion,
      telefono: config.telefono,
      whatsapp: config.whatsapp,
      horaApertura: config.horaApertura,
      horaCierre: config.horaCierre,
      frecuenciaReevaluacion: Number(config.frecuenciaReevaluacion),
      bloqueoAltaReevaluacion: Boolean(config.bloqueoAltaReevaluacion),
    });

    setSavingConfig(false);
    if (res.success && res.data) {
      setConfig(res.data);
      setMsgConfig("Configuración clínica actualizada y registrada en la auditoría con éxito.");
    }
  };

  // Cambiar estado de sala (Disponible / Mantenimiento)
  const handleToggleSala = async (salaId: string, currentEstado: string) => {
    setUpdatingSalaId(salaId);
    const nuevoEstado = currentEstado === "DISPONIBLE" ? "MANTENIMIENTO" : "DISPONIBLE";
    const res = await cambiarEstadoSala(salaId, nuevoEstado, "Ajuste manual desde panel de configuración");
    setUpdatingSalaId(null);

    if (res.success) {
      setSalas((prev) =>
        prev.map((s) => (s.id === salaId ? { ...s, estado: nuevoEstado } : s))
      );
    }
  };

  // Modificar Servicio
  const handleSaveServicio = async (servicioId: string) => {
    const res = await modificarServicio(servicioId, servicioPrecio, servicioDuracion);
    if (res.success) {
      setServicios((prev) =>
        prev.map((s) =>
          s.id === servicioId
            ? { ...s, precioBase: servicioPrecio, duracionMinutos: servicioDuracion }
            : s
        )
      );
      setEditingServicioId(null);
    }
  };

  // Toggle estado personal
  const handleTogglePersonal = async (userId: string, currentEstado: string) => {
    const nuevoEstado = currentEstado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    const res = await cambiarEstadoPersonal(userId, nuevoEstado);
    if (res.success) {
      setPersonal((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, estado: nuevoEstado } : u))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 bg-white px-6 rounded-2xl shadow-xs">
        {[
          { id: "general", label: "Sede y Reglas Clínicas", icon: Building2 },
          { id: "salas", label: "Gestión 6 Salas Físicas", icon: Layers, badge: "6 Salas" },
          { id: "servicios", label: "Servicios y Tarifas (S/.)", icon: DollarSign },
          { id: "personal", label: "Equipo y Terapeutas", icon: Users, badge: `${personal.length}` },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-4 text-xs font-bold border-b-2 transition -mb-[1px] ${
                isActive
                  ? "border-teal-600 text-teal-700 bg-teal-50/30"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Sede y Reglas Clínicas */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveGeneral} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Parámetros Operativos del Centro Clínico</h3>
              <p className="text-[11px] text-slate-500">Datos institucionales y políticas médicas automatizadas.</p>
            </div>
            {msgConfig && (
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> {msgConfig}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Razón Social</label>
              <input
                type="text"
                value={config.razonSocial}
                onChange={(e) => setConfig({ ...config, razonSocial: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre Comercial</label>
              <input
                type="text"
                value={config.nombreComercial}
                onChange={(e) => setConfig({ ...config, nombreComercial: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">RUC</label>
              <input
                type="text"
                value={config.ruc}
                onChange={(e) => setConfig({ ...config, ruc: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dirección de Sede (San Borja)</label>
              <input
                type="text"
                value={config.direccion}
                onChange={(e) => setConfig({ ...config, direccion: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Teléfono Central</label>
              <input
                type="text"
                value={config.telefono}
                onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp de Recepción</label>
              <input
                type="text"
                value={config.whatsapp}
                onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Horarios y Reglas Clínicas */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Reglas Clínicas y Horario de Atención
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hora de Apertura</label>
                <input
                  type="time"
                  value={config.horaApertura}
                  onChange={(e) => setConfig({ ...config, horaApertura: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hora de Cierre</label>
                <input
                  type="time"
                  value={config.horaCierre}
                  onChange={(e) => setConfig({ ...config, horaCierre: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Frecuencia de Reevaluación (Sesiones)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={config.frecuenciaReevaluacion}
                  onChange={(e) => setConfig({ ...config, frecuenciaReevaluacion: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Por defecto: cada 5 sesiones asistidas.</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-amber-900 block text-xs">Bloqueo de Alta Médica hasta Acreditar Reevaluación</span>
                <span className="text-amber-800 text-[11px]">Impide el cierre de expediente si el paciente tiene pendiente el test biomecánico de 5 sesiones.</span>
              </div>
              <input
                type="checkbox"
                checked={config.bloqueoAltaReevaluacion}
                onChange={(e) => setConfig({ ...config, bloqueoAltaReevaluacion: e.target.checked })}
                className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingConfig}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/25 flex items-center gap-2 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingConfig ? "Guardando..." : "Guardar Cambios y Auditar"}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Control de las 6 Salas Físicas */}
      {activeTab === "salas" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Capacidad Operativa: 6 Salas Simultáneas</h3>
              <p className="text-[11px] text-slate-500">
                Poner en mantenimiento bloquea de inmediato nuevas citas en la matriz de agenda con registro de auditoría.
              </p>
            </div>
            <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-xl border border-teal-200">
              {salas.filter((s) => s.estado === "DISPONIBLE").length} / 6 Salas Activas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salas.map((sala) => (
              <div
                key={sala.id}
                className={`p-4 rounded-2xl border transition-all ${
                  sala.estado === "DISPONIBLE"
                    ? "bg-slate-50/60 border-slate-200"
                    : "bg-amber-50/60 border-amber-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sm text-slate-800">{sala.nombre}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      sala.estado === "DISPONIBLE"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}
                  >
                    {sala.estado}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mb-4 min-h-[32px]">
                  <strong>Equipamiento:</strong> {sala.equipamiento || "Camilla clínica estándar"}
                </p>

                <button
                  onClick={() => handleToggleSala(sala.id, sala.estado)}
                  disabled={updatingSalaId === sala.id}
                  className={`w-full py-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                    sala.estado === "DISPONIBLE"
                      ? "bg-white text-amber-800 border-amber-300 hover:bg-amber-100"
                      : "bg-teal-600 text-white border-teal-600 hover:bg-teal-700"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>
                    {sala.estado === "DISPONIBLE"
                      ? "Poner en Mantenimiento"
                      : "Habilitar Sala (Disponible)"}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Catálogo de Servicios y Precios */}
      {activeTab === "servicios" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Servicios Clínicos y Tarifas en Soles (S/.)</h3>
              <p className="text-[11px] text-slate-500">
                Precios base y duración para citas individuales y paquetes de 10 y 20 sesiones.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {servicios.map((s) => {
              const isEditing = editingServicioId === s.id;

              return (
                <div key={s.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{s.nombre}</h4>
                    <span className="text-[11px] text-slate-500">
                      Duración oficial: {s.duracionMinutos} min • Paquete 10 ses: {formatCurrency(s.precioBase * 10 * 0.85)} (Desc. aplicado)
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-24">
                        <label className="text-[10px] text-slate-400 block">Precio (S/.)</label>
                        <input
                          type="number"
                          value={servicioPrecio}
                          onChange={(e) => setServicioPrecio(Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs border rounded-lg bg-slate-50 font-bold"
                        />
                      </div>
                      <div className="w-20">
                        <label className="text-[10px] text-slate-400 block">Minutos</label>
                        <input
                          type="number"
                          value={servicioDuracion}
                          onChange={(e) => setServicioDuracion(Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs border rounded-lg bg-slate-50"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveServicio(s.id)}
                        className="mt-3.5 px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingServicioId(null)}
                        className="mt-3.5 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-slate-800">
                        {formatCurrency(s.precioBase)}
                      </span>
                      <button
                        onClick={() => {
                          setEditingServicioId(s.id);
                          setServicioPrecio(s.precioBase);
                          setServicioDuracion(s.duracionMinutos);
                        }}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200"
                      >
                        Editar Tarifa
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: Equipo y Terapeutas */}
      {activeTab === "personal" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Equipo Clínico y Administrativo (RBAC)</h3>
              <p className="text-[11px] text-slate-500">
                8 terapeutas (4 Licenciados, 2 Técnicos), 2 recepcionistas y 1 administrador.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {personal.map((p) => (
              <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                    {p.nombre.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">{p.nombre}</span>
                    <span className="text-[11px] text-slate-500">
                      {p.especialidad || p.email} • <strong className="text-teal-700">{p.rol}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      p.estado === "ACTIVO"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {p.estado}
                  </span>
                  <button
                    onClick={() => handleTogglePersonal(p.id, p.estado)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                  >
                    {p.estado === "ACTIVO" ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
