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
  X,
  ShieldCheck,
  MapPin,
  Phone,
  FileText
} from "lucide-react";
import { HorariosManager } from "./HorariosManager";
import { Switch } from "./Switch";
import { HorariosSemanaConfig } from "@/lib/store";

interface ConfigurationManagerProps {
  initialConfig: any;
  initialSalas: any[];
  initialServicios: any[];
  initialPersonal?: any[];
}

type TabType = "general" | "horarios" | "salas" | "servicios" | "politicas";

export function ConfigurationManager({
  initialConfig,
  initialSalas,
  initialServicios,
}: ConfigurationManagerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("general");

  // State Configuración General y Políticas
  const [config, setConfig] = useState(initialConfig);
  const [savingConfig, setSavingConfig] = useState(false);

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
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Cargar logotipo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("El archivo excede el tamaño máximo permitido (2MB).");
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

  // Guardar datos generales de la sede
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);

    const dirCalculada = [
      [config.direccionAvenidaCalle, config.direccionNumero].filter(Boolean).join(" "),
      config.direccionDistrito,
      config.direccionCiudad,
    ].filter(Boolean).join(", ") + (config.direccionReferencia ? ` (Ref: ${config.direccionReferencia})` : "") || config.direccion;

    const payload = {
      razonSocial: config.razonSocial,
      nombreComercial: config.nombreComercial,
      sedeNombre: config.sedeNombre || "Sede San Borja",
      ruc: config.ruc,
      direccionAvenidaCalle: config.direccionAvenidaCalle,
      direccionNumero: config.direccionNumero,
      direccionDistrito: config.direccionDistrito,
      direccionCiudad: config.direccionCiudad,
      direccionReferencia: config.direccionReferencia,
      direccion: dirCalculada,
      telefono: config.telefono,
      whatsapp: config.whatsapp,
      logoUrl: config.logoUrl || "/images/logo-clinica.svg",
    };

    const res = await guardarConfiguracionClinica(payload);
    setSavingConfig(false);

    if (res.success && res.data) {
      setConfig((prev: any) => ({ ...prev, ...res.data }));
      if (typeof window !== "undefined") {
        localStorage.setItem("clinic_logo", res.data.logoUrl || "/images/logo-clinica.svg");
        localStorage.setItem("clinic_config", JSON.stringify(res.data));
        window.dispatchEvent(new Event("clinic-logo-change"));
        window.dispatchEvent(new Event("clinic-config-change"));
      }
      showToast("Datos de sede e identidad guardados correctamente.");
    }
  };

  // Guardar horarios de atención desde HorariosManager
  const handleSaveHorarios = async (
    horariosSemana: HorariosSemanaConfig,
    intervaloMinutos: number
  ): Promise<boolean> => {
    // Calcular apertura más temprana y cierre más tardío para retrocompatibilidad
    const diasActivos = Object.values(horariosSemana).filter((d) => d.activo);
    const horaApertura = diasActivos.length > 0 
      ? diasActivos.reduce((min, d) => d.apertura < min ? d.apertura : min, diasActivos[0].apertura)
      : "08:00";
    const horaCierre = diasActivos.length > 0 
      ? diasActivos.reduce((max, d) => d.cierre > max ? d.cierre : max, diasActivos[0].cierre)
      : "20:00";

    const res = await guardarConfiguracionClinica({
      horariosSemana,
      intervaloMinutos,
      horaApertura,
      horaCierre,
    });

    if (res.success && res.data) {
      setConfig((prev: any) => ({ ...prev, ...res.data }));
      if (typeof window !== "undefined") {
        localStorage.setItem("clinic_config", JSON.stringify(res.data));
        window.dispatchEvent(new Event("clinic-config-change"));
      }
      showToast("Horarios semanales e intervalos sincronizados.");
      return true;
    }
    return false;
  };

  // Guardar políticas clínicas
  const handleSavePoliticas = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);

    const res = await guardarConfiguracionClinica({
      frecuenciaReevaluacion: Number(config.frecuenciaReevaluacion),
      bloqueoAltaReevaluacion: Boolean(config.bloqueoAltaReevaluacion),
    });

    setSavingConfig(false);
    if (res.success && res.data) {
      setConfig((prev: any) => ({ ...prev, ...res.data }));
      showToast("Políticas médicas y reglas de alta guardadas.");
    }
  };

  // Salas: Alternar disponibilidad
  const handleToggleSala = async (salaId: string, currentEstado: string) => {
    const nuevoEstado = currentEstado === "DISPONIBLE" ? "MANTENIMIENTO" : "DISPONIBLE";
    setUpdatingSalaId(salaId);

    const res = await cambiarEstadoSala(salaId, nuevoEstado);
    setUpdatingSalaId(null);

    if (res.success) {
      setSalas((prev) =>
        prev.map((s) => (s.id === salaId ? { ...s, estado: nuevoEstado } : s))
      );
      showToast(`Sala ahora en estado ${nuevoEstado}.`);
    }
  };

  // Salas: Crear nueva
  const handleCreateSala = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaSalaNombre.trim()) return;

    const res = await crearNuevaSala(nuevaSalaNombre.trim(), nuevaSalaEquip.trim());
    if (res.success && res.data) {
      const nueva = res.data as any;
      setSalas((prev) => [...prev, nueva]);
      setNuevaSalaNombre("");
      setNuevaSalaEquip("");
      setIsCreatingSala(false);
      showToast(`"${nueva.nombre || nuevaSalaNombre}" registrada con éxito.`);
    }
  };

  // Salas: Editar existente
  const handleSaveEditSala = async (salaId: string) => {
    if (!editSalaNombre.trim()) return;

    const res = await editarDatosSala(salaId, editSalaNombre.trim(), editSalaEquip.trim());
    if (res.success) {
      setSalas((prev) =>
        prev.map((s) =>
          s.id === salaId
            ? { ...s, nombre: editSalaNombre.trim(), equipamiento: editSalaEquip.trim() }
            : s
        )
      );
      setEditingSalaId(null);
      showToast("Datos de sala actualizados.");
    }
  };

  // Salas: Eliminar
  const handleDeleteSala = async (salaId: string, nombre: string) => {
    if (!confirm(`¿Eliminar la "${nombre}"? Esta acción no se puede deshacer.`)) return;

    const res = await eliminarSala(salaId);
    if (res.success) {
      setSalas((prev) => prev.filter((s) => s.id !== salaId));
      showToast(`"${nombre}" eliminada correctamente.`);
    }
  };

  // Servicios: Modificar existente
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
      showToast("Tarifa de servicio actualizada.");
    }
  };

  // Servicios: Crear nuevo
  const handleCreateServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoServicioNombre.trim()) return;

    const res = await crearNuevoServicio(
      nuevoServicioNombre.trim(),
      Number(nuevoServicioPrecio),
      Number(nuevoServicioDuracion)
    );
    if (res.success && res.data) {
      const nuevo = res.data as any;
      setServicios((prev) => [...prev, nuevo]);
      setNuevoServicioNombre("");
      setNuevoServicioPrecio(100);
      setNuevoServicioDuracion(45);
      setIsCreatingServicio(false);
      showToast(`Servicio "${nuevo.nombre || nuevoServicioNombre}" agregado al catálogo.`);
    }
  };

  // Servicios: Eliminar
  const handleDeleteServicio = async (servicioId: string, nombre: string) => {
    if (!confirm(`¿Eliminar el servicio "${nombre}" del catálogo?`)) return;

    const res = await eliminarServicio(servicioId);
    if (res.success) {
      setServicios((prev) => prev.filter((s) => s.id !== servicioId));
      showToast(`Servicio "${nombre}" eliminado del catálogo.`);
    }
  };

  const TABS: { id: TabType; label: string; icon: any; badge?: string }[] = [
    { id: "general", label: "Clínica y Sede", icon: Building2 },
    { id: "horarios", label: "Horarios y Agenda", icon: Clock },
    { id: "salas", label: "Salas y Boxes", icon: Layers, badge: `${salas.length}` },
    { id: "servicios", label: "Servicios y Tarifas", icon: DollarSign, badge: `${servicios.length}` },
    { id: "politicas", label: "Políticas Clínicas", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Navegación Modular por Pestañas */}
      <div className="flex border-b border-slate-200 bg-white px-2 sm:px-6 rounded-2xl shadow-xs overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-3 sm:px-4 text-xs font-bold border-b-2 transition whitespace-nowrap -mb-[1px] cursor-pointer ${
                isActive
                  ? "border-teal-600 text-teal-700 bg-teal-50/40"
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

      {/* Atajo Rápido al Módulo Equipo (Limpio y Discreto) */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white text-teal-700 rounded-xl border border-slate-200 shadow-2xs">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800">
              ¿Deseas gestionar terapeutas, recepcionistas o accesos?
            </span>
            <span className="text-slate-500 text-[11px] block">
              El personal clínico y credenciales de usuario se gestionan en el módulo dedicado.
            </span>
          </div>
        </div>
        <Link
          href="/dashboard/usuarios"
          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-teal-700 font-bold rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 transition shrink-0 cursor-pointer text-xs"
        >
          <span>Ir a Equipo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* PESTAÑA 1: CLÍNICA Y SEDE                                                  */}
      {/* ========================================================================= */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveGeneral} className="space-y-5">
          {/* Tarjeta 1: Identidad y Logotipo */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Identidad Visual</h3>
                <p className="text-[11px] text-slate-500">Logotipo oficial que aparece en el menú, navbar y comprobantes.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex items-center justify-center p-2 overflow-hidden shrink-0">
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
                    Logotipo Institucional
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    PNG transparente o SVG (Máx. 2MB)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="clinic-logo-input"
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2 cursor-pointer transition text-xs"
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
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  title="Restablecer logo original"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Datos Fiscales e Institucionales */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 text-sm">Datos Institucionales</h3>
              <p className="text-[11px] text-slate-500">Información comercial y tributaria de la clínica.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  value={config.nombreComercial}
                  onChange={(e) => setConfig({ ...config, nombreComercial: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Razón Social</label>
                <input
                  type="text"
                  value={config.razonSocial}
                  onChange={(e) => setConfig({ ...config, razonSocial: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">RUC (11 dígitos)</label>
                <input
                  type="text"
                  maxLength={11}
                  value={config.ruc}
                  onChange={(e) => setConfig({ ...config, ruc: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre de Sede</label>
                <input
                  type="text"
                  value={config.sedeNombre || ""}
                  onChange={(e) => setConfig({ ...config, sedeNombre: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="Sede San Borja"
                />
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Dirección y Canales de Contacto */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 text-sm">Ubicación y Canales de Contacto</h3>
              <p className="text-[11px] text-slate-500">Dirección para los pacientes y canales oficiales de atención.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Avenida / Calle</label>
                <input
                  type="text"
                  placeholder="Ej. Av. Guardia Civil"
                  value={config.direccionAvenidaCalle || ""}
                  onChange={(e) => setConfig({ ...config, direccionAvenidaCalle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Número / Interior</label>
                <input
                  type="text"
                  placeholder="Ej. 520"
                  value={config.direccionNumero || ""}
                  onChange={(e) => setConfig({ ...config, direccionNumero: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Distrito</label>
                <input
                  type="text"
                  placeholder="Ej. San Borja"
                  value={config.direccionDistrito || ""}
                  onChange={(e) => setConfig({ ...config, direccionDistrito: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ciudad</label>
                <input
                  type="text"
                  placeholder="Ej. Lima"
                  value={config.direccionCiudad || ""}
                  onChange={(e) => setConfig({ ...config, direccionCiudad: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-slate-700 mb-1">Referencia</label>
                <input
                  type="text"
                  placeholder="Ej. Cerca al Óvalo Quiñones"
                  value={config.direccionReferencia || ""}
                  onChange={(e) => setConfig({ ...config, direccionReferencia: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Central Telefónica</label>
                <input
                  type="text"
                  value={config.telefono}
                  onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">WhatsApp de Recepción</label>
                <input
                  type="text"
                  value={config.whatsapp}
                  onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold text-teal-800"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingConfig}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/25 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer text-xs"
            >
              <Save className="w-4 h-4" />
              <span>{savingConfig ? "Guardando..." : "Guardar Cambios de Sede"}</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: HORARIOS Y AGENDA (NUEVO COMPONENTE DEDICADO)                   */}
      {/* ========================================================================= */}
      {activeTab === "horarios" && (
        <HorariosManager
          initialHorarios={config.horariosSemana}
          initialIntervalo={config.intervaloMinutos}
          onSave={handleSaveHorarios}
        />
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 3: SALAS Y BOXES                                                  */}
      {/* ========================================================================= */}
      {activeTab === "salas" && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Capacidad Operativa de Salas</h3>
              <p className="text-[11px] text-slate-500">
                Gestiona la disponibilidad y mantenimiento de las salas y boxes físicos.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsCreatingSala(true)}
                className="flex items-center justify-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Sala</span>
              </button>
              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200">
                {salas.filter((s) => s.estado === "DISPONIBLE").length} / {salas.length} Activas
              </span>
            </div>
          </div>

          {/* Formulario para crear nueva sala */}
          {isCreatingSala && (
            <form onSubmit={handleCreateSala} className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-teal-900 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Agregar Sala o Box Clínico
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
                    placeholder="Ej. Sala 7 - Magnetoterapia & Láser"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Equipamiento Asignado</label>
                  <input
                    type="text"
                    value={nuevaSalaEquip}
                    onChange={(e) => setNuevaSalaEquip(e.target.value)}
                    placeholder="Ej. Camilla eléctrica, presoterapia"
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
                      ? "bg-slate-50/70 border-slate-200 hover:border-slate-300"
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
                              : "Habilitar Sala"}
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

      {/* ========================================================================= */}
      {/* PESTAÑA 4: SERVICIOS Y TARIFAS                                            */}
      {/* ========================================================================= */}
      {activeTab === "servicios" && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Catálogo de Procedimientos y Tarifas (S/.)</h3>
              <p className="text-[11px] text-slate-500">
                Precios unitarios por sesión y duración oficial para agendamiento.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsCreatingServicio(true)}
                className="flex items-center justify-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Servicio</span>
              </button>
              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200">
                {servicios.length} Procedimientos
              </span>
            </div>
          </div>

          {/* Formulario nuevo servicio */}
          {isCreatingServicio && (
            <form onSubmit={handleCreateServicio} className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-teal-900 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Agregar Procedimiento Clínico
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
                    placeholder="Ej. Terapia Combinada & Láser"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Precio Base (S/.) *</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">Duración (Minutos) *</label>
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
                <div key={s.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{s.nombre}</h4>
                    <span className="text-[11px] text-slate-500">
                      Duración: <strong>{s.duracionMinutos} min</strong> • Paquete 10 ses: {formatCurrency(s.precioBase * 10 * 0.85)} (15% desc.)
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

      {/* ========================================================================= */}
      {/* PESTAÑA 5: POLÍTICAS CLÍNICAS                                             */}
      {/* ========================================================================= */}
      {activeTab === "politicas" && (
        <form onSubmit={handleSavePoliticas} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-800 text-sm">Políticas Médicas y Reglas de Alta</h3>
            <p className="text-[11px] text-slate-500">
              Reglas de evolución biomecánica y control de calidad clínica.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="max-w-xl">
                <span className="font-bold text-slate-800 text-xs block">
                  Frecuencia de Reevaluación Biomecánica
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Número de sesiones consecutivas tras las cuales se exige un test de progreso para el paciente.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={config.frecuenciaReevaluacion}
                  onChange={(e) => setConfig({ ...config, frecuenciaReevaluacion: Number(e.target.value) })}
                  className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-center focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-xs font-semibold text-slate-600">sesiones</span>
              </div>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-amber-950 text-xs block">
                  Bloqueo de Alta Médica sin Reevaluación
                </span>
                <span className="text-[11px] text-amber-800 block mt-0.5">
                  Impide cerrar el expediente médico si el paciente no tiene acreditada su evaluación periódica.
                </span>
              </div>
              <Switch
                checked={Boolean(config.bloqueoAltaReevaluacion)}
                onChange={(checked) => setConfig({ ...config, bloqueoAltaReevaluacion: checked })}
                id="switch-bloqueo-alta"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingConfig}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/25 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer text-xs"
            >
              <Save className="w-4 h-4" />
              <span>{savingConfig ? "Guardando..." : "Guardar Políticas"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
