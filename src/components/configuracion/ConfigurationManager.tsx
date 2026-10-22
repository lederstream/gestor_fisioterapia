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
  FileText,
  Star,
  Quote
} from "lucide-react";
import { HorariosManager } from "./HorariosManager";
import { Switch } from "./Switch";
import { HorariosSemanaConfig, TestimonioItem } from "@/lib/store";

interface ConfigurationManagerProps {
  initialConfig: any;
  initialSalas: any[];
  initialServicios: any[];
  initialPersonal?: any[];
}

type TabType = "general" | "horarios" | "salas" | "servicios" | "testimonios" | "politicas";

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
  const [servicioNombre, setServicioNombre] = useState<string>("");
  const [servicioPrecio, setServicioPrecio] = useState<number>(0);
  const [servicioDuracion, setServicioDuracion] = useState<number>(45);
  const [servicioTag, setServicioTag] = useState<string>("DOLOR & MOVILIDAD");
  const [servicioDesc, setServicioDesc] = useState<string>("");
  const [servicioPromo, setServicioPromo] = useState<number | undefined>(undefined);
  const [servicioTextoPromo, setServicioTextoPromo] = useState<string>("");
  const [servicioMostrarWeb, setServicioMostrarWeb] = useState<boolean>(true);

  const [isCreatingServicio, setIsCreatingServicio] = useState(false);
  const [nuevoServicioNombre, setNuevoServicioNombre] = useState("");
  const [nuevoServicioPrecio, setNuevoServicioPrecio] = useState<number>(40);
  const [nuevoServicioDuracion, setNuevoServicioDuracion] = useState<number>(45);
  const [nuevoServicioTag, setNuevoServicioTag] = useState("DOLOR & MOVILIDAD");
  const [nuevoServicioDesc, setNuevoServicioDesc] = useState("");
  const [nuevoServicioPromo, setNuevoServicioPromo] = useState<number | undefined>(undefined);
  const [nuevoServicioTextoPromo, setNuevoServicioTextoPromo] = useState("");
  const [nuevoServicioWeb, setNuevoServicioWeb] = useState(true);

  // State Testimonios (Patient Stories)
  const [testimonios, setTestimonios] = useState<TestimonioItem[]>(config.testimonios || []);
  const [isCreatingTestimonio, setIsCreatingTestimonio] = useState(false);
  const [nuevoTestNombre, setNuevoTestNombre] = useState("");
  const [nuevoTestCalif, setNuevoTestCalif] = useState(5);
  const [nuevoTestComent, setNuevoTestComent] = useState("");
  const [nuevoTestAvatar, setNuevoTestAvatar] = useState("");

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

  // Guardar datos generales de la clínica
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
      slogan: config.slogan || "REHABILITACIÓN & BIENESTAR",
      tituloHero: config.tituloHero || "Vuelve a moverte.",
      subtituloHero: config.subtituloHero || "Vuelve a sentirte tú.",
      descripcionHero: config.descripcionHero || "Fisioterapia especializada y humana para recuperar tu bienestar, paso a paso.",
      ratingPromedio: Number(config.ratingPromedio || 4.9),
      totalPacientesMes: config.totalPacientesMes || "+1,100",
      googleMapsUrl: config.googleMapsUrl,
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
      heroImageUrl: config.heroImageUrl || "/images/hero-physio.jpg",
      testimonios: testimonios,
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
      showToast("Datos de la clínica y marca guardados correctamente.");
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

  // Servicios: Modificar existente con todos los campos comerciales
  const handleSaveServicio = async (servicioId: string) => {
    const res = await modificarServicio(
      servicioId, 
      servicioPrecio, 
      servicioDuracion,
      {
        nombre: servicioNombre,
        categoriaTag: servicioTag,
        descripcion: servicioDesc,
        precioPromocional: servicioPromo,
        textoPromocion: servicioTextoPromo,
        mostrarEnWeb: servicioMostrarWeb,
      }
    );
    if (res.success && res.data) {
      const updated = res.data as any;
      setServicios((prev) =>
        prev.map((s) => (s.id === servicioId ? { ...s, ...updated } : s))
      );
      setEditingServicioId(null);
      showToast("Servicio y promociones actualizadas.");
    }
  };

  // Servicios: Crear nuevo con categorías y descuentos
  const handleCreateServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoServicioNombre.trim()) return;

    const res = await crearNuevoServicio(
      nuevoServicioNombre.trim(),
      Number(nuevoServicioPrecio),
      Number(nuevoServicioDuracion),
      {
        categoriaTag: nuevoServicioTag,
        descripcion: nuevoServicioDesc,
        precioPromocional: nuevoServicioPromo,
        textoPromocion: nuevoServicioTextoPromo,
        mostrarEnWeb: nuevoServicioWeb,
      }
    );
    if (res.success && res.data) {
      const nuevo = res.data as any;
      setServicios((prev) => [...prev, nuevo]);
      setNuevoServicioNombre("");
      setNuevoServicioPrecio(40);
      setNuevoServicioDuracion(45);
      setNuevoServicioTag("DOLOR & MOVILIDAD");
      setNuevoServicioDesc("");
      setNuevoServicioPromo(undefined);
      setNuevoServicioTextoPromo("");
      setNuevoServicioWeb(true);
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

  // Testimonios: Guardar lista
  const handleSaveTestimonios = async (updatedList: TestimonioItem[]) => {
    setTestimonios(updatedList);
    const res = await guardarConfiguracionClinica({ testimonios: updatedList });
    if (res.success) {
      showToast("Testimonios de pacientes actualizados.");
    }
  };

  // Testimonios: Crear nuevo
  const handleAddTestimonio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTestNombre.trim() || !nuevoTestComent.trim()) return;

    const nuevo: TestimonioItem = {
      id: `test-${Date.now()}`,
      nombre: nuevoTestNombre.trim(),
      calificacion: Number(nuevoTestCalif),
      comentario: nuevoTestComent.trim(),
      avatarUrl: nuevoTestAvatar.trim() || `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80`,
    };

    const updated = [...testimonios, nuevo];
    await handleSaveTestimonios(updated);
    setNuevoTestNombre("");
    setNuevoTestCalif(5);
    setNuevoTestComent("");
    setNuevoTestAvatar("");
    setIsCreatingTestimonio(false);
  };

  // Testimonios: Eliminar
  const handleDeleteTestimonio = async (id: string) => {
    const updated = testimonios.filter((t) => t.id !== id);
    await handleSaveTestimonios(updated);
  };

  const TABS: { id: TabType; label: string; icon: any; badge?: string }[] = [
    { id: "general", label: "Marca e Identidad", icon: Building2 },
    { id: "horarios", label: "Horarios y Agenda", icon: Clock },
    { id: "salas", label: "Salas y Boxes", icon: Layers, badge: `${salas.length}` },
    { id: "servicios", label: "Servicios y Promociones", icon: DollarSign, badge: `${servicios.length}` },
    { id: "testimonios", label: "Testimonios Web", icon: Star, badge: `${testimonios.length}` },
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
      {/* PESTAÑA 1: DATOS DE LA CLÍNICA                                             */}
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
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

              <div className="sm:col-span-4">
                <label className="block font-bold text-slate-700 mb-1">Enlace o Mapa de Google Maps (Ubicación)</label>
                <input
                  type="text"
                  placeholder="https://maps.google.com/?q=..."
                  value={config.googleMapsUrl || ""}
                  onChange={(e) => setConfig({ ...config, googleMapsUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tarjeta 4: Textos y Promoción en Landing Page (Marca Blanca) */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Textos y Branding de la Landing Page Pública
                </h3>
                <p className="text-[11px] text-slate-500">
                  Personaliza cómo se presenta la clínica al público y pacientes sin tocar código.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-[10px] font-bold">
                100% Dinámico
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Slogan / Categoría Superior</label>
                <input
                  type="text"
                  placeholder="Ej. REHABILITACIÓN & BIENESTAR"
                  value={config.slogan || ""}
                  onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-semibold uppercase tracking-wider"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Título Hero (Línea 1)</label>
                <input
                  type="text"
                  placeholder="Ej. Vuelve a moverte."
                  value={config.tituloHero || ""}
                  onChange={(e) => setConfig({ ...config, tituloHero: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtítulo Hero (Cursiva Elegante)</label>
                <input
                  type="text"
                  placeholder="Ej. Vuelve a sentirte tú."
                  value={config.subtituloHero || ""}
                  onChange={(e) => setConfig({ ...config, subtituloHero: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-serif italic"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-slate-700 mb-1">Descripción del Hero</label>
                <textarea
                  rows={2}
                  placeholder="Ej. Fisioterapia especializada y humana para recuperar tu bienestar, paso a paso."
                  value={config.descripcionHero || ""}
                  onChange={(e) => setConfig({ ...config, descripcionHero: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Calificación Promedio (Google/Web)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  placeholder="4.9"
                  value={config.ratingPromedio || 4.9}
                  onChange={(e) => setConfig({ ...config, ratingPromedio: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Métrica de Pacientes Atendidos</label>
                <input
                  type="text"
                  placeholder="+1,100 pacientes"
                  value={config.totalPacientesMes || "+1,100"}
                  onChange={(e) => setConfig({ ...config, totalPacientesMes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Imagen Principal de Portada (URL)</label>
                <input
                  type="text"
                  placeholder="/images/hero-physio.jpg"
                  value={config.heroImageUrl || "/images/hero-physio.jpg"}
                  onChange={(e) => setConfig({ ...config, heroImageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
              <span>{savingConfig ? "Guardando..." : "Guardar Cambios"}</span>
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
              <h3 className="font-extrabold text-slate-800 text-sm">Catálogo de Procedimientos y Promociones</h3>
              <p className="text-[11px] text-slate-500">
                Precios regulares, descuentos promocionales y visibilidad pública en el Landing Page.
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
                  Agregar Procedimiento Clínico & Promoción
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
                    placeholder="Ej. Terapia física"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoría / Etiqueta Web</label>
                  <input
                    type="text"
                    value={nuevoServicioTag}
                    onChange={(e) => setNuevoServicioTag(e.target.value)}
                    placeholder="Ej. DOLOR & MOVILIDAD"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none uppercase font-semibold text-orange-700"
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

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">Descripción Breve (para Landing)</label>
                  <input
                    type="text"
                    value={nuevoServicioDesc}
                    onChange={(e) => setNuevoServicioDesc(e.target.value)}
                    placeholder="Ej. Alivia dolores agudos y crónicos, recupera la movilidad articular y muscular."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Precio Base / Regular (S/.) *</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">Precio Promocional (S/.) (Opcional)</label>
                  <input
                    type="number"
                    min={0}
                    value={nuevoServicioPromo || ""}
                    onChange={(e) => setNuevoServicioPromo(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Ej. 30"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Texto de Promoción (Etiqueta Roja)</label>
                  <input
                    type="text"
                    value={nuevoServicioTextoPromo}
                    onChange={(e) => setNuevoServicioTextoPromo(e.target.value)}
                    placeholder="Ej. PROMOCION DSCTO S/ 30 por sesión"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-rose-600 font-bold"
                  />
                </div>

                <div className="sm:col-span-3 flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="nuevo-servicio-web"
                    checked={nuevoServicioWeb}
                    onChange={(e) => setNuevoServicioWeb(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="nuevo-servicio-web" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Mostrar este servicio públicamente en el Landing Page
                  </label>
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
                <div key={s.id} className="py-4 space-y-3">
                  {isEditing ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                      <div className="font-bold text-slate-800">Editando {s.nombre}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Nombre</label>
                          <input
                            type="text"
                            value={servicioNombre}
                            onChange={(e) => setServicioNombre(e.target.value)}
                            className="w-full px-2.5 py-1.5 border rounded-xl bg-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Categoría Tag</label>
                          <input
                            type="text"
                            value={servicioTag}
                            onChange={(e) => setServicioTag(e.target.value)}
                            className="w-full px-2.5 py-1.5 border rounded-xl bg-white uppercase font-semibold text-orange-700"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Duración (min)</label>
                          <input
                            type="number"
                            value={servicioDuracion}
                            onChange={(e) => setServicioDuracion(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 border rounded-xl bg-white"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Descripción</label>
                          <input
                            type="text"
                            value={servicioDesc}
                            onChange={(e) => setServicioDesc(e.target.value)}
                            className="w-full px-2.5 py-1.5 border rounded-xl bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Precio Base (S/.)</label>
                          <input
                            type="number"
                            value={servicioPrecio}
                            onChange={(e) => setServicioPrecio(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 border rounded-xl bg-white font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Precio Promo (S/.)</label>
                          <input
                            type="number"
                            value={servicioPromo || ""}
                            onChange={(e) => setServicioPromo(e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full px-2.5 py-1.5 border rounded-xl bg-white font-mono font-bold text-emerald-700"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Texto Promoción (Rojo)</label>
                          <input
                            type="text"
                            value={servicioTextoPromo}
                            onChange={(e) => setServicioTextoPromo(e.target.value)}
                            className="w-full px-2.5 py-1.5 border rounded-xl bg-white text-rose-600 font-bold"
                          />
                        </div>

                        <div className="sm:col-span-3 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`edit-web-${s.id}`}
                            checked={servicioMostrarWeb}
                            onChange={(e) => setServicioMostrarWeb(e.target.checked)}
                            className="rounded text-teal-600"
                          />
                          <label htmlFor={`edit-web-${s.id}`} className="font-semibold text-slate-700">
                            Mostrar en el Landing Page público
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingServicioId(null)}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveServicio(s.id)}
                          className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                        >
                          Guardar Cambios
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-slate-800 text-sm">{s.nombre}</h4>
                          {s.categoriaTag && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              {s.categoriaTag}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.mostrarEnWeb !== false
                              ? "bg-teal-50 text-teal-700 border border-teal-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}>
                            {s.mostrarEnWeb !== false ? "Visible en Web" : "Oculto en Web"}
                          </span>
                        </div>
                        {s.descripcion && (
                          <p className="text-xs text-slate-500 max-w-xl">{s.descripcion}</p>
                        )}
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>Duración: <strong className="text-slate-600">{s.duracionMinutos} min</strong></span>
                          {s.textoPromocion && (
                            <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                              {s.textoPromocion}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="text-base font-black text-slate-800 block">
                            {formatCurrency(s.precioBase)}
                          </span>
                          {s.precioPromocional ? (
                            <span className="text-xs font-bold text-rose-600">
                              Promo: {formatCurrency(s.precioPromocional)}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingServicioId(s.id);
                              setServicioNombre(s.nombre);
                              setServicioPrecio(s.precioBase);
                              setServicioDuracion(s.duracionMinutos);
                              setServicioTag(s.categoriaTag || "DOLOR & MOVILIDAD");
                              setServicioDesc(s.descripcion || "");
                              setServicioPromo(s.precioPromocional);
                              setServicioTextoPromo(s.textoPromocion || "");
                              setServicioMostrarWeb(s.mostrarEnWeb !== false);
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 5: TESTIMONIOS (PATIENT STORIES)                                   */}
      {/* ========================================================================= */}
      {activeTab === "testimonios" && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                <Quote className="w-4 h-4 text-teal-600" />
                Historias y Testimonios de Pacientes (Patient Stories)
              </h3>
              <p className="text-[11px] text-slate-500">
                Reseñas mostradas con 5 estrellas en la sección pública para generar confianza inmediata.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingTestimonio(true)}
              className="flex items-center justify-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Testimonio</span>
            </button>
          </div>

          {/* Formulario nuevo testimonio */}
          {isCreatingTestimonio && (
            <form onSubmit={handleAddTestimonio} className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-teal-900 text-xs flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Agregar Testimonio de Paciente
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingTestimonio(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre del Paciente *</label>
                  <input
                    type="text"
                    required
                    value={nuevoTestNombre}
                    onChange={(e) => setNuevoTestNombre(e.target.value)}
                    placeholder="Ej. Sarah M."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Calificación (Estrellas 1-5)</label>
                  <select
                    value={nuevoTestCalif}
                    onChange={(e) => setNuevoTestCalif(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Estrellas)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Estrellas)</option>
                    <option value={3}>⭐⭐⭐ (3 Estrellas)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Avatar / Foto URL (Opcional)</label>
                  <input
                    type="text"
                    value={nuevoTestAvatar}
                    onChange={(e) => setNuevoTestAvatar(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">Comentario del Paciente *</label>
                  <textarea
                    rows={3}
                    required
                    value={nuevoTestComent}
                    onChange={(e) => setNuevoTestComent(e.target.value)}
                    placeholder="Ej. Llegué con un dolor lumbar severo que me impedía trabajar. En solo 4 sesiones el progreso fue extraordinario..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingTestimonio(false)}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Guardar Testimonio
                </button>
              </div>
            </form>
          )}

          {/* Grid de Testimonios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {testimonios.map((t) => (
              <div key={t.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={t.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"}
                        alt={t.nombre}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{t.nombre}</h4>
                        <div className="flex items-center text-amber-500 text-[10px]">
                          {Array.from({ length: t.calificacion }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTestimonio(t.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Eliminar testimonio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 italic">"{t.comentario}"</p>
                </div>
              </div>
            ))}
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
