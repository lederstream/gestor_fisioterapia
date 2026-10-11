"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  guardarConfiguracionClinica, 
  cambiarEstadoSala, 
  modificarServicio, 
  crearNuevaSala,
  editarDatosSala,
  eliminarSala,
  crearNuevoServicio,
  eliminarServicio
} from "@/server/actions/configuracion";
import { formatCurrency } from "@/lib/utils";
import { 
  Building2, 
  Layers, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Save, 
  Wrench,
  Sparkles,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  ArrowRight,
  X
} from "lucide-react";

interface ConfigurationManagerProps {
  initialConfig: any;
  initialSalas: any[];
  initialServicios: any[];
  initialPersonal?: any[];
}

export function ConfigurationManager({
  initialConfig,
  initialSalas,
  initialServicios,
}: ConfigurationManagerProps) {
  const [activeTab, setActiveTab] = useState<"general" | "salas" | "servicios">("general");

  // State Configuración General
  const [config, setConfig] = useState(initialConfig);
  const [savingConfig, setSavingConfig] = useState(false);
  const [msgConfig, setMsgConfig] = useState<string | null>(null);

  // State Salas
  const [salas, setSalas] = useState(initialSalas);
  const [updatingSalaId, setUpdatingSalaId] = useState<string | null>(null);
  const [isCreatingSala, setIsCreatingSala] = useState(false);
  const [nuevaSalaNombre, setNuevaSalaNombre] = useState("");
  const [nuevaSalaEquip, setNuevaSalaEquip] = useState("");
  const [editingSalaId, setEditingSalaId] = useState<string | null>(null);
  const [editSalaNombre, setEditSalaNombre] = useState("");
  const [editSalaEquip, setEditSalaEquip] = useState("");

  // State Servicios
  const [servicios, setServicios] = useState(initialServicios);
  const [editingServicioId, setEditingServicioId] = useState<string | null>(null);
  const [servicioPrecio, setServicioPrecio] = useState<number>(0);
  const [servicioDuracion, setServicioDuracion] = useState<number>(45);
  const [isCreatingServicio, setIsCreatingServicio] = useState(false);
  const [nuevoServicioNombre, setNuevoServicioNombre] = useState("");
  const [nuevoServicioPrecio, setNuevoServicioPrecio] = useState<number>(100);
  const [nuevoServicioDuracion, setNuevoServicioDuracion] = useState<number>(45);

  // Feedback Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Cargar logotipo de la empresa
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("El archivo excede el tamaño máximo recomendado (2MB).");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setConfig((prev: any) => ({ ...prev, logoUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    setConfig((prev: any) => ({ ...prev, logoUrl: "/images/logo-clinica.svg" }));
  };

  // Guardar configuración general
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setMsgConfig(null);

    const res = await guardarConfiguracionClinica({
      razonSocial: config.razonSocial,
      nombreComercial: config.nombreComercial,
      sedeNombre: config.sedeNombre || "Sede San Borja",
      ruc: config.ruc,
      direccion: config.direccion,
      telefono: config.telefono,
      whatsapp: config.whatsapp,
      horaApertura: config.horaApertura,
      horaCierre: config.horaCierre,
      frecuenciaReevaluacion: Number(config.frecuenciaReevaluacion),
      bloqueoAltaReevaluacion: Boolean(config.bloqueoAltaReevaluacion),
      logoUrl: config.logoUrl || "/images/logo-clinica.svg",
    });

    setSavingConfig(false);

    if (res.success) {
      if (typeof window !== "undefined") {
        localStorage.setItem("clinic_logo", res.data?.logoUrl || "/images/logo-clinica.svg");
        localStorage.setItem("clinic_config", JSON.stringify(res.data));
        window.dispatchEvent(new Event("clinic-logo-change"));
        window.dispatchEvent(new Event("clinic-config-change"));
      }
      setMsgConfig("Configuración clínica y parámetros de sede actualizados con éxito.");
      showToast("Datos de la clínica y sede guardados correctamente.");
    }
  };

  // Cambiar estado de sala (Disponible / Mantenimiento)
  const handleToggleSala = async (salaId: string, currentEstado: string) => {
    setUpdatingSalaId(salaId);
    const nuevoEstado = currentEstado === "DISPONIBLE" ? "MANTENIMIENTO" : "DISPONIBLE";
    const res = await cambiarEstadoSala(salaId, nuevoEstado, "Ajuste desde panel de ajustes");
    setUpdatingSalaId(null);

    if (res.success) {
      setSalas((prev) =>
        prev.map((s) => (s.id === salaId ? { ...s, estado: nuevoEstado } : s))
      );
      showToast(
        nuevoEstado === "DISPONIBLE"
          ? "Sala habilitada para asignación de citas."
          : "Sala puesta en mantenimiento (bloqueada en agenda)."
      );
    }
  };

  // Crear nueva sala
  const handleCreateSala = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaSalaNombre.trim()) return;

    const res = await crearNuevaSala(nuevaSalaNombre.trim(), nuevaSalaEquip.trim() || undefined);
    if (res.success && res.data) {
      const salaCreada = res.data as any;
      setSalas((prev) => [...prev, salaCreada]);
      setNuevaSalaNombre("");
      setNuevaSalaEquip("");
      setIsCreatingSala(false);
      showToast(`Sala "${salaCreada.nombre || nuevaSalaNombre}" creada y disponible en agenda.`);
    } else {
      alert(res.error || "Error al crear nueva sala.");
    }
  };

  // Editar datos de sala
  const handleSaveEditSala = async (salaId: string) => {
    if (!editSalaNombre.trim()) return;
    const res = await editarDatosSala(salaId, editSalaNombre.trim(), editSalaEquip.trim() || undefined);
    if (res.success && res.data) {
      setSalas((prev) =>
        prev.map((s) =>
          s.id === salaId
            ? { ...s, nombre: editSalaNombre.trim(), equipamiento: editSalaEquip.trim() }
            : s
        )
      );
      setEditingSalaId(null);
      showToast("Datos de la sala actualizados con éxito.");
    } else {
      alert(res.error || "Error al editar sala.");
    }
  };

  // Eliminar sala
  const handleDeleteSala = async (salaId: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar la "${nombre}"? Esta acción no se puede deshacer.`)) return;

    const res = await eliminarSala(salaId);
    if (res.success) {
      setSalas((prev) => prev.filter((s) => s.id !== salaId));
      showToast(`"${nombre}" eliminada correctamente.`);
    } else {
      alert(res.error || "Error al eliminar sala.");
    }
  };

  // Modificar servicio existente
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
      showToast("Tarifa y duración del servicio actualizadas.");
    }
  };

  // Crear nuevo servicio
  const handleCreateServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoServicioNombre.trim()) return;

    const res = await crearNuevoServicio(
      nuevoServicioNombre.trim(),
      Number(nuevoServicioPrecio),
      Number(nuevoServicioDuracion)
    );
    if (res.success && res.data) {
      const servicioCreado = res.data as any;
      setServicios((prev) => [...prev, servicioCreado]);
      setNuevoServicioNombre("");
      setNuevoServicioPrecio(100);
      setNuevoServicioDuracion(45);
      setIsCreatingServicio(false);
      showToast(`Servicio "${servicioCreado.nombre || nuevoServicioNombre}" agregado al catálogo.`);
    } else {
      alert(res.error || "Error al registrar nuevo servicio.");
    }
  };

  // Eliminar servicio
  const handleDeleteServicio = async (servicioId: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar el servicio "${nombre}" del catálogo?`)) return;

    const res = await eliminarServicio(servicioId);
    if (res.success) {
      setServicios((prev) => prev.filter((s) => s.id !== servicioId));
      showToast(`Servicio "${nombre}" eliminado del catálogo.`);
    } else {
      alert(res.error || "Error al eliminar servicio.");
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Barra de Tabs amigable y scroleable */}
      <div className="flex border-b border-slate-200 bg-white px-4 sm:px-6 rounded-2xl shadow-xs overflow-x-auto">
        {[
          { id: "general", label: "Sede y Empresa", icon: Building2 },
          { id: "salas", label: "Salas e Infraestructura", icon: Layers, badge: `${salas.length}` },
          { id: "servicios", label: "Servicios y Tarifas (S/.)", icon: DollarSign, badge: `${servicios.length}` },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-3 sm:px-4 text-xs font-bold border-b-2 transition whitespace-nowrap -mb-[1px] cursor-pointer ${
                isActive
                  ? "border-teal-600 text-teal-700 bg-teal-50/30"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Banner Informativo RBAC: Optimización y Cero Redundancias */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800 block">
              Gestión de Terapeutas, Personal y Accesos RBAC
            </span>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Para registrar nuevos fisioterapeutas colegiados (CTMP), recepcionistas y credenciales del sistema, utiliza el módulo especializado de <strong>Equipo</strong>.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/usuarios"
          className="px-3.5 py-2 bg-white hover:bg-slate-100 text-teal-700 font-bold rounded-xl border border-teal-200 shadow-2xs flex items-center gap-1.5 transition shrink-0 cursor-pointer text-xs"
        >
          <span>Ir al Módulo Equipo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* TAB 1: Sede, Datos de la Empresa y Reglas Clínicas */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveGeneral} className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Parámetros Operativos del Centro Clínico</h3>
              <p className="text-[11px] text-slate-500">Datos institucionales, identidad de marca y políticas médicas de San Borja.</p>
            </div>
            {msgConfig && (
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> {msgConfig}
              </span>
            )}
          </div>

          {/* Identidad Visual y Logotipo de la Empresa */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center p-2 overflow-hidden shrink-0">
                {config.logoUrl ? (
                  <img
                    src={config.logoUrl}
                    alt="Logo Empresa"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-teal-600 text-white font-black flex items-center justify-center text-lg">
                    AJ
                  </div>
                )}
              </div>
              <div>
                <span className="font-bold text-slate-800 text-xs block">
                  Logotipo Oficial de la Empresa
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Se reflejará en el Sidebar, Navbar, Informes Clínicos e Impresión oficial.
                </p>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Formatos recomendados: PNG transparente o SVG (Máx. 2MB).
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label
                htmlFor="clinic-logo-input"
                className="flex-1 sm:flex-initial px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition text-xs"
              >
                <Upload className="w-3.5 h-3.5 text-teal-600" />
                <span>Subir Logo</span>
              </label>
              <input
                id="clinic-logo-input"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={handleResetLogo}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
                title="Restablecer logotipo predeterminado"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Razón Social</label>
              <input
                type="text"
                value={config.razonSocial}
                onChange={(e) => setConfig({ ...config, razonSocial: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre Comercial</label>
              <input
                type="text"
                value={config.nombreComercial}
                onChange={(e) => setConfig({ ...config, nombreComercial: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">RUC</label>
              <input
                type="text"
                value={config.ruc}
                onChange={(e) => setConfig({ ...config, ruc: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono font-medium text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre de la Sede</label>
              <input
                type="text"
                value={config.sedeNombre || ""}
                placeholder="Ej. Sede San Borja"
                onChange={(e) => setConfig({ ...config, sedeNombre: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium text-xs"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-1">
              <label className="block font-semibold text-slate-700 mb-1">Dirección Física de la Sede</label>
              <input
                type="text"
                value={config.direccion}
                onChange={(e) => setConfig({ ...config, direccion: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Teléfono Central</label>
              <input
                type="text"
                value={config.telefono}
                onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp de Recepción</label>
              <input
                type="text"
                value={config.whatsapp}
                onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium text-xs"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hora de Cierre</label>
                <input
                  type="time"
                  value={config.horaCierre}
                  onChange={(e) => setConfig({ ...config, horaCierre: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold text-xs"
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
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/25 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer text-xs"
            >
              <Save className="w-4 h-4" />
              <span>{savingConfig ? "Guardando..." : "Guardar Cambios Institucionales"}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Control Dinámico de Salas Físicas */}
      {activeTab === "salas" && (
        <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Capacidad Operativa e Infraestructura</h3>
              <p className="text-[11px] text-slate-500">
                Administra cabinas, boxes y salas de fisioterapia. Agrega salas, edita su equipamiento o suspéndelas por mantenimiento.
              </p>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setIsCreatingSala(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Sala</span>
              </button>
              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200">
                {salas.filter((s) => s.estado === "DISPONIBLE").length} / {salas.length} Activas
              </span>
            </div>
          </div>

          {/* Formulario / Modal para crear nueva sala */}
          {isCreatingSala && (
            <form onSubmit={handleCreateSala} className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-teal-900 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Registrar Nueva Sala o Cabina Clínica
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingSala(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre de la Sala *</label>
                  <input
                    type="text"
                    required
                    value={nuevaSalaNombre}
                    onChange={(e) => setNuevaSalaNombre(e.target.value)}
                    placeholder="Ej: Sala 7 - Magnetoterapia & Láser"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Equipamiento Asignado</label>
                  <input
                    type="text"
                    value={nuevaSalaEquip}
                    onChange={(e) => setNuevaSalaEquip(e.target.value)}
                    placeholder="Ej: Camilla eléctrica, láser de alta potencia, presoterapia"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingSala(false)}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Guardar Sala
                </button>
              </div>
            </form>
          )}

          {/* Grid de Salas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salas.map((sala) => {
              const isEditing = editingSalaId === sala.id;

              return (
                <div
                  key={sala.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    sala.estado === "DISPONIBLE"
                      ? "bg-slate-50/60 border-slate-200 hover:border-slate-300"
                      : "bg-amber-50/60 border-amber-300"
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nombre</label>
                        <input
                          type="text"
                          value={editSalaNombre}
                          onChange={(e) => setEditSalaNombre(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Equipamiento</label>
                        <input
                          type="text"
                          value={editSalaEquip}
                          onChange={(e) => setEditSalaEquip(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingSalaId(null)}
                          className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditSala(sala.id)}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs shadow-2xs"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-sm text-slate-800">{sala.nombre}</span>
                        <div className="flex items-center gap-1.5">
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
                      </div>

                      <p className="text-[11px] text-slate-500 mb-3 min-h-[32px]">
                        <strong className="text-slate-700">Equipamiento:</strong>{" "}
                        {sala.equipamiento || "Camilla clínica estándar"}
                      </p>

                      <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
                        <button
                          onClick={() => handleToggleSala(sala.id, sala.estado)}
                          disabled={updatingSalaId === sala.id}
                          className={`w-full py-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer ${
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

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => {
                              setEditingSalaId(sala.id);
                              setEditSalaNombre(sala.nombre);
                              setEditSalaEquip(sala.equipamiento || "");
                            }}
                            className="py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Editar</span>
                          </button>

                          <button
                            onClick={() => handleDeleteSala(sala.id, sala.nombre)}
                            className="py-1.5 px-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Catálogo Dinámico de Servicios y Tarifas */}
      {activeTab === "servicios" && (
        <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Servicios Clínicos y Tarifas en Soles (S/.)</h3>
              <p className="text-[11px] text-slate-500">
                Precios base y duración para citas individuales y paquetes de 10 y 20 sesiones.
              </p>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setIsCreatingServicio(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Servicio</span>
              </button>
              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200">
                {servicios.length} Procedimientos
              </span>
            </div>
          </div>

          {/* Formulario para registrar nuevo servicio */}
          {isCreatingServicio && (
            <form onSubmit={handleCreateServicio} className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-teal-900 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Agregar Procedimiento o Terapia al Catálogo
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingServicio(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre del Servicio *</label>
                  <input
                    type="text"
                    required
                    value={nuevoServicioNombre}
                    onChange={(e) => setNuevoServicioNombre(e.target.value)}
                    placeholder="Ej: Punción Seca & Electroacupuntura"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Precio Base Unitario (S/.) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={nuevoServicioPrecio}
                    onChange={(e) => setNuevoServicioPrecio(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duración Oficial (Minutos) *</label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    step={15}
                    required
                    value={nuevoServicioDuracion}
                    onChange={(e) => setNuevoServicioDuracion(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingServicio(false)}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Crear Servicio
                </button>
              </div>
            </form>
          )}

          {/* Lista de Servicios */}
          <div className="divide-y divide-slate-100">
            {servicios.map((s) => {
              const isEditing = editingServicioId === s.id;

              return (
                <div key={s.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{s.nombre}</h4>
                    <span className="text-[11px] text-slate-500">
                      Duración: <strong>{s.duracionMinutos} min</strong> • Paquete 10 ses: {formatCurrency(s.precioBase * 10 * 0.85)} (15% desc. oficial)
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
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
                        className="mt-3.5 px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingServicioId(null)}
                        className="mt-3.5 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-sm font-extrabold text-slate-800">
                        {formatCurrency(s.precioBase)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingServicioId(s.id);
                            setServicioPrecio(s.precioBase);
                            setServicioDuracion(s.duracionMinutos);
                          }}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 cursor-pointer transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteServicio(s.id, s.nombre)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg border border-rose-200 cursor-pointer transition"
                          title="Eliminar procedimiento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
