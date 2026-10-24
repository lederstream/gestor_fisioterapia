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
  Quote, 
  Palette,
  Globe,
  ExternalLink,
  AlertCircle,
  Check
} from "lucide-react";
import { HorariosManager } from "./HorariosManager";
import { ServicioFormModal } from "./ServicioFormModal";
import { Switch } from "./Switch";
import { HorariosSemanaConfig, TestimonioItem, ServicioItem } from "@/lib/store";

interface ConfigurationManagerProps {
  initialConfig: any;
  initialSalas: any[];
  initialServicios: any[];
  initialPersonal?: any[];
}

type TabType = "identidad" | "horarios" | "salas" | "servicios" | "marketing" | "politicas";

// Función auxiliar de compresión rápida en cliente para evitar límites de tamaño en Server Actions
async function compressImageFile(file: File): Promise<string> {
  if (file.type === "image/svg+xml") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 512;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const isPng = file.type === "image/png";
        const dataUrl = canvas.toDataURL(isPng ? "image/png" : "image/webp", 0.9);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ConfigurationManager({
  initialConfig,
  initialSalas,
  initialServicios,
}: ConfigurationManagerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("identidad");

  // Estado maestro de configuración
  const [config, setConfig] = useState(initialConfig || {});
  const [salas, setSalas] = useState(initialSalas || []);
  const [servicios, setServicios] = useState(initialServicios || []);
  const [testimonios, setTestimonios] = useState<TestimonioItem[]>(
    initialConfig?.testimonios || [
      {
        id: "t1",
        nombre: "Sarah M.",
        calificacion: 5,
        comentario: "Excelente recuperación de mi lesión de hombro. 100% recomendados.",
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
      },
    ]
  );

  // Estados de carga por sección (Scoped Loading States)
  const [savingLogo, setSavingLogo] = useState(false);
  const [hasPendingLogo, setHasPendingLogo] = useState(false);
  const [savingColors, setSavingColors] = useState(false);
  const [savingDatos, setSavingDatos] = useState(false);
  const [savingMarketing, setSavingMarketing] = useState(false);
  const [savingPoliticas, setSavingPoliticas] = useState(false);
  const [updatingSalaId, setUpdatingSalaId] = useState<string | null>(null);

  // Estados modales y formularios de Salas
  const [isCreatingSala, setIsCreatingSala] = useState(false);
  const [nuevaSalaNombre, setNuevaSalaNombre] = useState("");
  const [nuevaSalaEquip, setNuevaSalaEquip] = useState("");
  const [editingSalaId, setEditingSalaId] = useState<string | null>(null);
  const [editSalaNombre, setEditSalaNombre] = useState("");
  const [editSalaEquip, setEditSalaEquip] = useState("");

  // Estados para Modal de Servicio (Crear y Editar)
  const [isServicioModalOpen, setIsServicioModalOpen] = useState(false);
  const [servicioParaEditar, setServicioParaEditar] = useState<ServicioItem | null>(null);

  // Estados de Testimonios
  const [isCreatingTestimonio, setIsCreatingTestimonio] = useState(false);
  const [nuevoTestNombre, setNuevoTestNombre] = useState("");
  const [nuevoTestCalif, setNuevoTestCalif] = useState(5);
  const [nuevoTestComent, setNuevoTestComent] = useState("");
  const [nuevoTestAvatar, setNuevoTestAvatar] = useState("");

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // ── SECCIÓN 1: IDENTIDAD VISUAL (LOGOTIPO) ──────────────────────────────────
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("El archivo no debe exceder los 4MB.");
      return;
    }

    try {
      setSavingLogo(true);
      const compressed = await compressImageFile(file);
      setConfig((prev: any) => ({ ...prev, logoUrl: compressed }));
      setHasPendingLogo(true);
      setSavingLogo(false);
      showToast("Logo procesado. Haz clic en 'Guardar Logotipo' para confirmar.");
    } catch {
      setSavingLogo(false);
      alert("Error al procesar la imagen seleccionada.");
    }
  };

  const handleSaveLogoOnly = async () => {
    if (!config.logoUrl) return;
    setSavingLogo(true);
    const res = await guardarConfiguracionClinica({ logoUrl: config.logoUrl });
    setSavingLogo(false);

    if (res.success && res.data) {
      setHasPendingLogo(false);
      if (typeof window !== "undefined") {
        localStorage.setItem("clinic_logo", res.data.logoUrl || "/images/logo-clinica.svg");
        window.dispatchEvent(new Event("clinic-logo-change"));
      }
      showToast("Logotipo institucional guardado y sincronizado.");
    } else {
      alert("No se pudo guardar el logotipo: " + (res.error || "Error de red"));
    }
  };

  const handleResetLogoOnly = async () => {
    if (!confirm("¿Deseas restablecer el logotipo al isotipo institucional original?")) return;
    setSavingLogo(true);
    const defaultLogo = "/images/logo-clinica.svg";
    setConfig((prev: any) => ({ ...prev, logoUrl: defaultLogo }));
    const res = await guardarConfiguracionClinica({ logoUrl: defaultLogo });
    setSavingLogo(false);

    if (res.success) {
      setHasPendingLogo(false);
      if (typeof window !== "undefined") {
        localStorage.setItem("clinic_logo", defaultLogo);
        window.dispatchEvent(new Event("clinic-logo-change"));
      }
      showToast("Logotipo restablecido al valor original.");
    }
  };

  // ── SECCIÓN 2: PALETA DE COLORES ───────────────────────────────────────────
  const handleSaveColorsOnly = async () => {
    setSavingColors(true);
    const res = await guardarConfiguracionClinica({
      colorPrimario: config.colorPrimario || "#0C3E37",
      colorSecundario: config.colorSecundario || "#E07052",
      colorAcento: config.colorAcento || "#0D9488",
    });
    setSavingColors(false);

    if (res.success && res.data) {
      if (typeof window !== "undefined") {
        document.documentElement.style.setProperty("--brand-primary", res.data.colorPrimario || "#0C3E37");
        document.documentElement.style.setProperty("--brand-secondary", res.data.colorSecundario || "#E07052");
        document.documentElement.style.setProperty("--brand-accent", res.data.colorAcento || "#0D9488");
        localStorage.setItem("clinic_config", JSON.stringify(res.data));
        window.dispatchEvent(new Event("clinic-config-change"));
      }
      showToast("Colores institucionales actualizados.");
    }
  };

  // ── SECCIÓN 3: DATOS INSTITUCIONALES Y CONTACTO ─────────────────────────────
  const handleSaveDatosClinica = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDatos(true);

    const dirCalculada = [
      [config.direccionAvenidaCalle, config.direccionNumero].filter(Boolean).join(" "),
      config.direccionDistrito,
      config.direccionCiudad,
    ].filter(Boolean).join(", ") + (config.direccionReferencia ? ` (Ref: ${config.direccionReferencia})` : "") || config.direccion;

    const res = await guardarConfiguracionClinica({
      razonSocial: config.razonSocial,
      nombreComercial: config.nombreComercial,
      slogan: config.slogan || "REHABILITACIÓN & BIENESTAR",
      ruc: config.ruc,
      telefono: config.telefono,
      whatsapp: config.whatsapp,
      googleMapsUrl: config.googleMapsUrl,
      direccionAvenidaCalle: config.direccionAvenidaCalle,
      direccionNumero: config.direccionNumero,
      direccionDistrito: config.direccionDistrito,
      direccionCiudad: config.direccionCiudad,
      direccionReferencia: config.direccionReferencia,
      direccion: dirCalculada,
    });
    setSavingDatos(false);

    if (res.success && res.data) {
      setConfig((prev: any) => ({ ...prev, ...res.data, direccion: dirCalculada }));
      if (typeof window !== "undefined") {
        localStorage.setItem("clinic_config", JSON.stringify(res.data));
        window.dispatchEvent(new Event("clinic-config-change"));
      }
      showToast("Datos de la clínica y canales de contacto actualizados.");
    }
  };

  // ── SECCIÓN 4: HORARIOS Y AGENDA ───────────────────────────────────────────
  const handleSaveHorarios = async (
    horariosSemana: HorariosSemanaConfig,
    intervaloMinutos: number
  ): Promise<boolean> => {
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
      showToast("Horarios semanales y turnos sincronizados con la web.");
      return true;
    }
    return false;
  };

  // ── SECCIÓN 5: MARKETING & PORTADA WEB ───────────────────────────────────────
  const handleSaveMarketing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMarketing(true);

    const res = await guardarConfiguracionClinica({
      tituloHero: config.tituloHero || "Vuelve a moverte.",
      subtituloHero: config.subtituloHero || "Vuelve a sentirte tú.",
      descripcionHero: config.descripcionHero || "Fisioterapia especializada y humana para recuperar tu bienestar, paso a paso.",
      heroImageUrl: config.heroImageUrl || "/images/hero-physio.jpg",
      totalPacientesMes: config.totalPacientesMes || "+1,100",
      ratingPromedio: Number(config.ratingPromedio || 4.9),
    });
    setSavingMarketing(false);

    if (res.success && res.data) {
      setConfig((prev: any) => ({ ...prev, ...res.data }));
      showToast("Textos y portada de la página web actualizados.");
    }
  };

  // Testimonios Web
  const handleSaveTestimonios = async (updatedList: TestimonioItem[]) => {
    setTestimonios(updatedList);
    const res = await guardarConfiguracionClinica({ testimonios: updatedList });
    if (res.success) {
      showToast("Testimonios de pacientes actualizados.");
    }
  };

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

  const handleDeleteTestimonio = async (id: string) => {
    const updated = testimonios.filter((t) => t.id !== id);
    await handleSaveTestimonios(updated);
  };

  // ── SECCIÓN 6: POLÍTICAS MÉDICAS ───────────────────────────────────────────
  const handleSavePoliticas = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPoliticas(true);

    const res = await guardarConfiguracionClinica({
      frecuenciaReevaluacion: Number(config.frecuenciaReevaluacion),
      bloqueoAltaReevaluacion: Boolean(config.bloqueoAltaReevaluacion),
    });

    setSavingPoliticas(false);
    if (res.success && res.data) {
      setConfig((prev: any) => ({ ...prev, ...res.data }));
      showToast("Reglas de reevaluación EVA y alta médica guardadas.");
    }
  };

  // ── SALAS Y BOXES ───────────────────────────────────────────────────────────
  const handleToggleSala = async (salaId: string, currentEstado: string) => {
    const nuevoEstado = currentEstado === "DISPONIBLE" ? "MANTENIMIENTO" : "DISPONIBLE";
    setUpdatingSalaId(salaId);

    const res = await cambiarEstadoSala(salaId, nuevoEstado);
    setUpdatingSalaId(null);

    if (res.success) {
      setSalas((prev) =>
        prev.map((s) => (s.id === salaId ? { ...s, estado: nuevoEstado } : s))
      );
      showToast(`Box físico en estado: ${nuevoEstado}.`);
    }
  };

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
      showToast("Datos del box actualizados.");
    }
  };

  const handleDeleteSala = async (salaId: string, nombre: string) => {
    if (!confirm(`¿Eliminar la "${nombre}"? Esta acción inhabilitará el box.`)) return;

    const res = await eliminarSala(salaId);
    if (res.success) {
      setSalas((prev) => prev.filter((s) => s.id !== salaId));
      showToast(`"${nombre}" eliminada correctamente.`);
    } else {
      alert(res.error || "No se pudo eliminar la sala.");
    }
  };

  // ── SERVICIOS Y ARANCELES (MANEJADOR UNIFICADO DE MODAL) ────────────────────
  const handleSaveServicioModal = async (data: {
    id?: string;
    nombre: string;
    categoriaTag: string;
    descripcion: string;
    duracionMinutos: number;
    precioBase: number;
    precioPromocional?: number;
    textoPromocion?: string;
    mostrarEnWeb: boolean;
  }) => {
    if (data.id) {
      // Modificar servicio existente
      const res = await modificarServicio(data.id, data.precioBase, data.duracionMinutos, {
        nombre: data.nombre,
        categoriaTag: data.categoriaTag,
        descripcion: data.descripcion,
        precioPromocional: data.precioPromocional,
        textoPromocion: data.textoPromocion,
        mostrarEnWeb: data.mostrarEnWeb,
      });
      if (res.success && res.data) {
        const updated = res.data as any;
        setServicios((prev) => prev.map((s) => (s.id === data.id ? { ...s, ...updated } : s)));
        showToast("Servicio y aranceles actualizados con éxito.");
      } else {
        throw new Error(res.error || "No se pudo actualizar el servicio.");
      }
    } else {
      // Crear nuevo servicio
      const res = await crearNuevoServicio(data.nombre, data.precioBase, data.duracionMinutos, {
        categoriaTag: data.categoriaTag,
        descripcion: data.descripcion,
        precioPromocional: data.precioPromocional,
        textoPromocion: data.textoPromocion,
        mostrarEnWeb: data.mostrarEnWeb,
      });
      if (res.success && res.data) {
        const nuevo = res.data as any;
        setServicios((prev) => [...prev, nuevo]);
        showToast(`Servicio "${nuevo.nombre || data.nombre}" agregado al catálogo.`);
      } else {
        throw new Error(res.error || "No se pudo registrar el nuevo servicio.");
      }
    }
  };

  const handleDeleteServicio = async (servicioId: string, nombre: string) => {
    if (!confirm(`¿Eliminar el servicio "${nombre}" del catálogo?`)) return;

    const res = await eliminarServicio(servicioId);
    if (res.success) {
      setServicios((prev) => prev.filter((s) => s.id !== servicioId));
      showToast(`Servicio "${nombre}" eliminado del catálogo.`);
    }
  };

  // Definición de Pestañas
  const TABS: { id: TabType; label: string; icon: any; badge?: string }[] = [
    { id: "identidad", label: "Marca e Identidad", icon: Building2 },
    { id: "horarios", label: "Horarios y Agenda", icon: Clock },
    { id: "salas", label: "Salas y Boxes", icon: Layers, badge: `${salas.length}` },
    { id: "servicios", label: "Servicios y Precios", icon: DollarSign, badge: `${servicios.length}` },
    { id: "marketing", label: "Página Web & Reseñas", icon: Globe, badge: `${testimonios.length}` },
    { id: "politicas", label: "Políticas Clínicas", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Pestañas de Navegación de Configuración */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200/80 scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-slate-200/80"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? "bg-teal-700/60 text-white"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* PESTAÑA 1: MARCA E IDENTIDAD (CON GUARDADO INDEPENDIENTE POR TARJETA)       */}
      {/* ========================================================================= */}
      {activeTab === "identidad" && (
        <div className="space-y-6">
          {/* Tarjeta 1: Identidad Visual y Logotipo */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>Identidad Visual & Logotipo</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Logotipo oficial visible en el menú lateral, navbar, comprobantes y landing pública.
                </p>
              </div>

              {hasPendingLogo && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full animate-pulse">
                  Cambio sin guardar
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-18 h-18 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex items-center justify-center p-2.5 overflow-hidden shrink-0">
                  {config.logoUrl ? (
                    <img
                      src={config.logoUrl}
                      alt="Logo Clínica"
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
                    PNG transparente o SVG (Optimización automática)
                  </span>
                  <span className="text-[10px] text-teal-600 font-medium block mt-1">
                    ✓ Se sincroniza con la web y todos los dispositivos
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label
                  htmlFor="clinic-logo-input"
                  className="flex-1 sm:flex-initial px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition text-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-teal-600" />
                  <span>Seleccionar Archivo</span>
                </label>
                <input
                  id="clinic-logo-input"
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={handleSaveLogoOnly}
                  disabled={savingLogo || !hasPendingLogo}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer text-xs"
                  title="Guardar el nuevo logotipo en la base de datos"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingLogo ? "Guardando..." : "Guardar Logotipo"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetLogoOnly}
                  disabled={savingLogo}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer border border-slate-200"
                  title="Restablecer logotipo al original"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Paleta de Colores y Marca Blanca */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Palette className="w-4 h-4 text-teal-600" />
                  <span>Paleta de Colores y Marca Blanca</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Personaliza los tonos corporativos para adaptar el portal y la landing page a tu imagen.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveColorsOnly}
                disabled={savingColors}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingColors ? "Aplicando..." : "Guardar Colores"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Color Primario</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.colorPrimario || "#0C3E37"}
                    onChange={(e) => setConfig({ ...config, colorPrimario: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 shrink-0"
                  />
                  <input
                    type="text"
                    value={config.colorPrimario || "#0C3E37"}
                    onChange={(e) => setConfig({ ...config, colorPrimario: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Color Secundario (Acento Cálido)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.colorSecundario || "#E07052"}
                    onChange={(e) => setConfig({ ...config, colorSecundario: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 shrink-0"
                  />
                  <input
                    type="text"
                    value={config.colorSecundario || "#E07052"}
                    onChange={(e) => setConfig({ ...config, colorSecundario: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Color Terciario (Detalles)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.colorAcento || "#0D9488"}
                    onChange={(e) => setConfig({ ...config, colorAcento: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 shrink-0"
                  />
                  <input
                    type="text"
                    value={config.colorAcento || "#0D9488"}
                    onChange={(e) => setConfig({ ...config, colorAcento: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Presets de 1 Clic */}
            <div className="pt-2 flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">Estilos predefinidos:</span>
              <button
                type="button"
                onClick={() => setConfig({ ...config, colorPrimario: "#0C3E37", colorSecundario: "#E07052", colorAcento: "#0D9488" })}
                className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
              >
                Esmeralda Clínico
              </button>
              <button
                type="button"
                onClick={() => setConfig({ ...config, colorPrimario: "#0F3E6D", colorSecundario: "#F27A54", colorAcento: "#1084B9" })}
                className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-100 transition cursor-pointer"
              >
                Océano Médico
              </button>
              <button
                type="button"
                onClick={() => setConfig({ ...config, colorPrimario: "#1E293B", colorSecundario: "#0EA5E9", colorAcento: "#10B981" })}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                Modern Slate
              </button>
            </div>
          </div>

          {/* Tarjeta 3: Datos de la Clínica y Ubicación */}
          <form onSubmit={handleSaveDatosClinica} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Datos Institucionales, Canales y Ubicación</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Información legal, dirección física para comprobantes y medios de contacto para pacientes.
                </p>
              </div>

              <button
                type="submit"
                disabled={savingDatos}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer text-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingDatos ? "Guardando..." : "Guardar Datos Institucionales"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  value={config.nombreComercial || ""}
                  onChange={(e) => setConfig({ ...config, nombreComercial: e.target.value })}
                  placeholder="AJ Fisioterapia"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Razón Social</label>
                <input
                  type="text"
                  value={config.razonSocial || ""}
                  onChange={(e) => setConfig({ ...config, razonSocial: e.target.value })}
                  placeholder="AJ Fisioterapia S.A.C."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">RUC Tributario</label>
                <input
                  type="text"
                  value={config.ruc || ""}
                  onChange={(e) => setConfig({ ...config, ruc: e.target.value })}
                  placeholder="20608912345"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Slogan</label>
                <input
                  type="text"
                  value={config.slogan || ""}
                  onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
                  placeholder="REHABILITACIÓN & BIENESTAR"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Canales de Contacto */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>Central Telefónica</span>
                </label>
                <input
                  type="text"
                  value={config.telefono || ""}
                  onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
                  placeholder="(01) 475-2010"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp de Admisión</span>
                </label>
                <input
                  type="text"
                  value={config.whatsapp || ""}
                  onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                  placeholder="+51 987 654 321"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Enlace Google Maps (URL)</span>
                </label>
                <input
                  type="text"
                  value={config.googleMapsUrl || ""}
                  onChange={(e) => setConfig({ ...config, googleMapsUrl: e.target.value })}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-[11px]"
                />
              </div>
            </div>

            {/* Dirección Desglosada */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <span className="text-[11px] font-bold text-slate-700 block">Dirección de la Sede Física</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Avenida / Calle</label>
                  <input
                    type="text"
                    value={config.direccionAvenidaCalle || ""}
                    onChange={(e) => setConfig({ ...config, direccionAvenidaCalle: e.target.value })}
                    placeholder="Av. Guardia Civil"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Número / Int.</label>
                  <input
                    type="text"
                    value={config.direccionNumero || ""}
                    onChange={(e) => setConfig({ ...config, direccionNumero: e.target.value })}
                    placeholder="520"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Distrito</label>
                  <input
                    type="text"
                    value={config.direccionDistrito || ""}
                    onChange={(e) => setConfig({ ...config, direccionDistrito: e.target.value })}
                    placeholder="San Borja"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={config.direccionCiudad || ""}
                    onChange={(e) => setConfig({ ...config, direccionCiudad: e.target.value })}
                    placeholder="Lima"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Referencia</label>
                <input
                  type="text"
                  value={config.direccionReferencia || ""}
                  onChange={(e) => setConfig({ ...config, direccionReferencia: e.target.value })}
                  placeholder="A dos cuadras de Av. Javier Prado Este"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  <strong>Dirección armada para comprobantes:</strong>{" "}
                  {[
                    [config.direccionAvenidaCalle, config.direccionNumero].filter(Boolean).join(" "),
                    config.direccionDistrito,
                    config.direccionCiudad,
                  ].filter(Boolean).join(", ") + (config.direccionReferencia ? ` (Ref: ${config.direccionReferencia})` : "") || config.direccion || "No definida"}
                </span>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: HORARIOS Y AGENDA (COMPONENTE HORARIOSMANAGER)                  */}
      {/* ========================================================================= */}
      {activeTab === "horarios" && (
        <HorariosManager
          initialHorarios={config.horariosSemana}
          initialIntervalo={config.intervaloMinutos}
          onSave={handleSaveHorarios}
        />
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 3: SALAS Y BOXES FÍSICOS                                          */}
      {/* ========================================================================= */}
      {activeTab === "salas" && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>Infraestructura Física: Salas y Boxes Clínicos</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Camillas y espacios físicos para agendamiento simultáneo. Poner en mantenimiento inactiva el agendamiento sin borrar historias.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreatingSala(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer text-xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nueva Sala</span>
            </button>
          </div>

          {/* Formulario Nueva Sala */}
          {isCreatingSala && (
            <form onSubmit={handleCreateSala} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">Alta de Nueva Sala Física</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <input
                  type="text"
                  placeholder="Nombre de la Sala (Ej: Sala 7)"
                  value={nuevaSalaNombre}
                  onChange={(e) => setNuevaSalaNombre(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  required
                />
                <input
                  type="text"
                  placeholder="Equipamiento (Ej: Camilla electroterapia, ultrasonido)"
                  value={nuevaSalaEquip}
                  onChange={(e) => setNuevaSalaEquip(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingSala(false)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-teal-700"
                >
                  Confirmar Sala
                </button>
              </div>
            </form>
          )}

          {/* Lista de Salas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {salas.map((sala) => {
              const isEditing = editingSalaId === sala.id;
              const isUpdating = updatingSalaId === sala.id;
              const isDisponible = sala.estado === "DISPONIBLE";

              return (
                <div
                  key={sala.id}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                    isDisponible
                      ? "bg-white border-slate-200/90 shadow-2xs"
                      : "bg-amber-50/40 border-amber-200/70"
                  }`}
                >
                  <div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editSalaNombre}
                          onChange={(e) => setEditSalaNombre(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                        />
                        <input
                          type="text"
                          value={editSalaEquip}
                          onChange={(e) => setEditSalaEquip(e.target.value)}
                          placeholder="Equipamiento"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                        <div className="flex justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingSalaId(null)}
                            className="px-2 py-1 text-[11px] bg-slate-100 rounded-lg font-semibold"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditSala(sala.id)}
                            className="px-2.5 py-1 text-[11px] bg-teal-600 text-white rounded-lg font-bold"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-sm">{sala.nombre}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isDisponible
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {isDisponible ? "Disponible" : "Mantenimiento"}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-1">
                          {sala.equipamiento || "Camilla clínica estándar"}
                        </span>
                      </>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Switch
                          checked={isDisponible}
                          onChange={() => handleToggleSala(sala.id, sala.estado)}
                          disabled={isUpdating}
                        />
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {isDisponible ? "Activa" : "Pausada"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSalaId(sala.id);
                            setEditSalaNombre(sala.nombre);
                            setEditSalaEquip(sala.equipamiento || "");
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          title="Editar nombre"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSala(sala.id, sala.nombre)}
                          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Eliminar sala"
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
      {/* PESTAÑA 4: SERVICIOS Y ARANCELES (GESTIONADOS VÍA MODAL)                  */}
      {/* ========================================================================= */}
      {activeTab === "servicios" && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-teal-600" />
                <span>Catálogo de Servicios y Aranceles ({servicios.length})</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Define tarifas base, precios de promoción, etiquetas y duración para el agendamiento y la web.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setServicioParaEditar(null);
                setIsServicioModalOpen(true);
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer text-xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Servicio</span>
            </button>
          </div>

          {/* Lista Limpia de Servicios Sin Layout Shifts */}
          <div className="space-y-3">
            {servicios.map((s) => (
              <div
                key={s.id}
                className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-teal-500/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{s.nombre}</span>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full uppercase">
                      {s.categoriaTag || "CLÍNICO"}
                    </span>
                    {s.mostrarEnWeb === false && (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                        Oculto en web
                      </span>
                    )}
                    {s.precioPromocional && Number(s.precioPromocional) < Number(s.precioBase) && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        -{Math.round(((Number(s.precioBase) - Number(s.precioPromocional)) / Number(s.precioBase)) * 100)}% Dscto.
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl line-clamp-2">
                    {s.descripcion || "Tratamiento personalizado enfocado en recuperación y movilidad."}
                  </p>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400 block">{s.duracionMinutos} min</span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {s.precioPromocional ? (
                        <>
                          <span className="line-through text-slate-400 text-xs mr-1.5">{formatCurrency(s.precioBase)}</span>
                          <span className="text-emerald-700">{formatCurrency(s.precioPromocional)}</span>
                        </>
                      ) : (
                        formatCurrency(s.precioBase)
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 border-l border-slate-100 pl-3">
                    <button
                      type="button"
                      onClick={() => {
                        setServicioParaEditar(s);
                        setIsServicioModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                      title="Editar servicio"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteServicio(s.id, s.nombre)}
                      className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Eliminar servicio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 5: PÁGINA WEB & TESTIMONIOS (MARKETING UNIFICADO)                  */}
      {/* ========================================================================= */}
      {activeTab === "marketing" && (
        <div className="space-y-6">
          {/* Tarjeta de Portada y Títulos Hero */}
          <form onSubmit={handleSaveMarketing} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-teal-600" />
                  <span>Portada Principal de la Página Web (Hero Section)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Modifica los títulos, subtítulos, métricas sociales e imagen principal de bienvenida.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  target="_blank"
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl border border-slate-200 text-xs flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver Web en Vivo</span>
                </Link>

                <button
                  type="submit"
                  disabled={savingMarketing}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingMarketing ? "Guardando..." : "Guardar Portada"}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título Principal (H1)</label>
                <input
                  type="text"
                  value={config.tituloHero || ""}
                  onChange={(e) => setConfig({ ...config, tituloHero: e.target.value })}
                  placeholder="Vuelve a moverte."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtítulo Cursivo (H2)</label>
                <input
                  type="text"
                  value={config.subtituloHero || ""}
                  onChange={(e) => setConfig({ ...config, subtituloHero: e.target.value })}
                  placeholder="Vuelve a sentirte tú."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-serif text-sm"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-700 mb-1">Párrafo Descriptivo</label>
              <textarea
                value={config.descripcionHero || ""}
                onChange={(e) => setConfig({ ...config, descripcionHero: e.target.value })}
                placeholder="Fisioterapia especializada y humana para recuperar tu bienestar..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl h-20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rating Promedio (Estrellas)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={config.ratingPromedio || 4.9}
                  onChange={(e) => setConfig({ ...config, ratingPromedio: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Métrica Pacientes al Mes</label>
                <input
                  type="text"
                  value={config.totalPacientesMes || "+1,100"}
                  onChange={(e) => setConfig({ ...config, totalPacientesMes: e.target.value })}
                  placeholder="+1,100 pacientes"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Imagen Hero Portada (URL)</label>
                <input
                  type="text"
                  value={config.heroImageUrl || "/images/hero-physio.jpg"}
                  onChange={(e) => setConfig({ ...config, heroImageUrl: e.target.value })}
                  placeholder="/images/hero-physio.jpg"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </form>

          {/* Tarjeta de Testimonios de Pacientes */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Testimonios y Reseñas Web ({testimonios.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Reseñas de pacientes visibles en el carrusel interactivo de la página de inicio.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreatingTestimonio(true)}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Reseña</span>
              </button>
            </div>

            {/* Formulario Nuevo Testimonio */}
            {isCreatingTestimonio && (
              <form onSubmit={handleAddTestimonio} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">Nueva Reseña de Paciente</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Nombre del Paciente (Ej: Carlos V. • San Borja)"
                      value={nuevoTestNombre}
                      onChange={(e) => setNuevoTestNombre(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                      required
                    />
                  </div>
                  <div>
                    <select
                      value={nuevoTestCalif}
                      onChange={(e) => setNuevoTestCalif(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 Estrellas)</option>
                      <option value="4">⭐⭐⭐⭐ (4 Estrellas)</option>
                    </select>
                  </div>
                </div>

                <textarea
                  placeholder="Comentario sobre su recuperación y experiencia clínica..."
                  value={nuevoTestComent}
                  onChange={(e) => setNuevoTestComent(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs h-20"
                  required
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingTestimonio(false)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-teal-700"
                  >
                    Guardar Testimonio
                  </button>
                </div>
              </form>
            )}

            {/* Lista de Testimonios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {testimonios.map((t) => (
                <div
                  key={t.id}
                  className="p-4 bg-slate-50/60 rounded-2xl border border-slate-200/90 flex flex-col justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800">{t.nombre}</span>
                      <div className="flex text-amber-500">
                        {Array.from({ length: t.calificacion || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed italic">
                      "{t.comentario}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteTestimonio(t.id)}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      title="Eliminar testimonio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 6: POLÍTICAS MÉDICAS Y REGLAS CLÍNICAS                           */}
      {/* ========================================================================= */}
      {activeTab === "politicas" && (
        <form onSubmit={handleSavePoliticas} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Reglas Médicas y Políticas Clínicas Institucionales</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Parámetros médico-legales de reevaluación EVA y control estricto de alta de tratamiento.
              </p>
            </div>

            <button
              type="submit"
              disabled={savingPoliticas}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingPoliticas ? "Guardando..." : "Guardar Políticas"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="block font-bold text-slate-800">
                Frecuencia Obligatoria de Reevaluación (Sesiones)
              </label>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Cada cuántas sesiones de evolución el sistema exige al terapeuta registrar una ficha de reevaluación clínica obligatoria con escala EVA.
              </p>
              <input
                type="number"
                min="1"
                max="20"
                value={config.frecuenciaReevaluacion || 5}
                onChange={(e) => setConfig({ ...config, frecuenciaReevaluacion: Number(e.target.value) })}
                className="w-32 px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <label className="block font-bold text-slate-800">
                  Bloqueo de Alta sin Reevaluación Final
                </label>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                  Impide emitir el alta terapéutica final si el paciente no cuenta con su última reevaluación registrada, protegiendo a la clínica ante auditorías.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={config.bloqueoAltaReevaluacion !== false}
                  onChange={(val) => setConfig({ ...config, bloqueoAltaReevaluacion: val })}
                />
                <span className="font-bold text-xs text-slate-700">
                  {config.bloqueoAltaReevaluacion !== false ? "Bloqueo Activo (Recomendado)" : "Permitir Alta Directa"}
                </span>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Modal Dedicado para Crear y Editar Servicios */}
      <ServicioFormModal
        isOpen={isServicioModalOpen}
        onClose={() => {
          setIsServicioModalOpen(false);
          setServicioParaEditar(null);
        }}
        onSave={handleSaveServicioModal}
        servicioParaEditar={servicioParaEditar}
      />
    </div>
  );
}
