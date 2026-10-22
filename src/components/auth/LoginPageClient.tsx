"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  User,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Building2,
  AlertCircle,
  Eye,
  EyeOff,
  Activity,
  HeartPulse,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/permissions";
import { ConfiguracionClinicaItem } from "@/lib/store";

interface LoginPageClientProps {
  config: ConfiguracionClinicaItem;
}

const DEMO_PROFILES: {
  role: UserRole;
  name: string;
  email: string;
  dni: string;
  title: string;
  badge: string;
  targetUrl: string;
  targetName: string;
  icon: any;
  accentColor: string;
  borderHover: string;
  badgeBg: string;
  bgIcon: string;
}[] = [
  {
    role: "ADMIN",
    name: "Marco Yana",
    email: "marco.yana@ajfisioterapia.pe",
    dni: "41982033",
    title: "Dirección Clínica y Gerencia General",
    badge: "Control Total & Métricas",
    targetUrl: "/dashboard",
    targetName: "Dashboard de Gerencia",
    icon: Shield,
    accentColor: "text-purple-700",
    borderHover: "hover:border-purple-500 hover:bg-purple-50/40",
    badgeBg: "bg-purple-100 text-purple-800",
    bgIcon: "bg-purple-100 text-purple-700",
  },
  {
    role: "RECEPCION",
    name: "Karin Palacios",
    email: "karin.palacios@ajfisioterapia.pe",
    dni: "47291054",
    title: "Admisión & Coordinación San Borja",
    badge: "Matriz 6 Salas & Caja",
    targetUrl: "/dashboard/agenda",
    targetName: "Agenda Matriz y Caja",
    icon: UserCheck,
    accentColor: "text-blue-700",
    borderHover: "hover:border-blue-500 hover:bg-blue-50/40",
    badgeBg: "bg-blue-100 text-blue-800",
    bgIcon: "bg-blue-100 text-blue-700",
  },
  {
    role: "TERAPEUTA",
    name: "Lic. Jeiser Vasquez",
    email: "jeiser.vasquez@ajfisioterapia.pe",
    dni: "44890211",
    title: "Lic. Fisioterapia Deportiva (CTMP 12480)",
    badge: "Agenda & Ficha EVA",
    targetUrl: "/dashboard/agenda",
    targetName: "Panel Clínico de Terapia",
    icon: Stethoscope,
    accentColor: "text-teal-700",
    borderHover: "hover:border-teal-500 hover:bg-teal-50/40",
    badgeBg: "bg-teal-100 text-teal-800",
    bgIcon: "bg-teal-100 text-teal-700",
  },
  {
    role: "PACIENTE",
    name: "Alexander Saavedra",
    email: "alexander.saavedra@gmail.com",
    dni: "45892011",
    title: "Paciente Titular • DNI 45892011",
    badge: "Mis Citas y Paquetes",
    targetUrl: "/dashboard",
    targetName: "Portal Privado del Paciente",
    icon: User,
    accentColor: "text-emerald-700",
    borderHover: "hover:border-emerald-500 hover:bg-emerald-50/40",
    badgeBg: "bg-emerald-100 text-emerald-800",
    bgIcon: "bg-emerald-100 text-emerald-700",
  },
];

export function LoginPageClient({ config }: LoginPageClientProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<"credenciales" | "rapido">("rapido");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const brandPrimary = config?.colorPrimario || "#0C3E37";
  const brandSecondary = config?.colorSecundario || "#E07052";
  const clinicName = config?.nombreComercial || "AJ Fisioterapia";
  const clinicSlogan = config?.slogan || "REHABILITACIÓN & BIENESTAR";

  const executeLogin = (profile: typeof DEMO_PROFILES[0]) => {
    setLoadingRole(profile.role);
    setRedirectMessage(`Ingresando como ${profile.name}... Redirigiendo a ${profile.targetName}`);
    setErrorMessage(null);

    login(profile.role);

    setTimeout(() => {
      router.push(profile.targetUrl);
    }, 700);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage("Por favor ingresa tu DNI o correo electrónico.");
      return;
    }

    const clean = identifier.toLowerCase().trim();

    // Match con perfiles conocidos
    let matchedProfile = DEMO_PROFILES.find(
      (p) =>
        p.email.toLowerCase() === clean ||
        p.dni === clean ||
        clean.includes(p.name.split(" ")[0].toLowerCase())
    );

    if (!matchedProfile) {
      if (clean.includes("admin") || clean.includes("gerencia") || clean.includes("marco")) {
        matchedProfile = DEMO_PROFILES[0];
      } else if (clean.includes("recepcion") || clean.includes("karin")) {
        matchedProfile = DEMO_PROFILES[1];
      } else if (clean.includes("terapeuta") || clean.includes("lic") || clean.includes("jeiser")) {
        matchedProfile = DEMO_PROFILES[2];
      } else {
        matchedProfile = DEMO_PROFILES[3]; // Paciente por defecto
      }
    }

    executeLogin(matchedProfile);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 flex flex-col justify-between selection:bg-[#0C3E37] selection:text-white">
      {/* Top Bar Navigation */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Volver al inicio</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span className="hidden sm:inline">¿Necesitas agendar tu primera cita?</span>
          <Link
            href="/reservas"
            className="font-bold underline decoration-stone-300 hover:text-[#0C3E37] transition"
          >
            Reservar aquí
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col items-center">
        {/* Brand Card Header */}
        <div className="w-full text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3.5 group mb-4">
            <div
              className="w-14 h-14 rounded-2xl text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform overflow-hidden p-2"
              style={{ backgroundColor: brandPrimary }}
            >
              {config.logoUrl && config.logoUrl !== "/images/logo-clinica.svg" ? (
                <img
                  src={config.logoUrl}
                  alt={clinicName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span>{clinicName.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="text-left">
              <span className="font-extrabold text-2xl sm:text-3xl text-[#0B2E28] block tracking-tight leading-tight">
                {clinicName}
              </span>
              <span className="text-[10px] sm:text-xs tracking-wider uppercase text-stone-400 font-bold block">
                {clinicSlogan}
              </span>
            </div>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Iniciar Sesión en el Portal Clínico
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1.5 max-w-md mx-auto">
            Accede a tus citas, historia de evolución, matriz de 6 salas o panel directivo según tus credenciales.
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-white w-full rounded-3xl shadow-xl shadow-stone-900/5 border border-stone-200/90 overflow-hidden">
          {/* Tabs Selector */}
          <div className="grid grid-cols-2 border-b border-stone-200 text-xs sm:text-sm font-bold bg-stone-50/70">
            <button
              type="button"
              onClick={() => setActiveTab("rapido")}
              className={`py-3.5 px-4 text-center transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "rapido"
                  ? "bg-white text-[#0B2E28] border-b-2 border-[#0C3E37] shadow-2xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Acceso Rápido por Perfil (1 clic)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("credenciales")}
              className={`py-3.5 px-4 text-center transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "credenciales"
                  ? "bg-white text-[#0B2E28] border-b-2 border-[#0C3E37] shadow-2xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <Lock className="w-4 h-4 text-stone-500" />
              <span>Con DNI / Contraseña</span>
            </button>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8">
            {redirectMessage ? (
              <div className="py-14 flex flex-col items-center justify-center text-center space-y-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center animate-spin text-white shadow-lg"
                  style={{ backgroundColor: brandPrimary }}
                >
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-stone-900">
                    {redirectMessage}
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Cargando entorno seguro bajo la Ley N.° 29733...
                  </p>
                </div>
              </div>
            ) : activeTab === "rapido" ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Selecciona un rol para ingresar al instante:
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Entorno de Demostración Activo
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Haz clic en el profesional o paciente para evaluar los módulos de la clínica con sus permisos RBAC configurados.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {DEMO_PROFILES.map((profile) => {
                    const Icon = profile.icon;
                    const isLoading = loadingRole === profile.role;

                    return (
                      <button
                        key={profile.role}
                        type="button"
                        disabled={loadingRole !== null}
                        onClick={() => executeLogin(profile)}
                        className={`text-left p-4 rounded-2xl border border-stone-200/90 bg-white transition-all flex items-start gap-3.5 shadow-2xs group cursor-pointer ${profile.borderHover}`}
                      >
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${profile.bgIcon}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-sm text-stone-900 group-hover:text-[#0C3E37] transition-colors truncate">
                              {profile.name}
                            </span>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${profile.badgeBg}`}>
                              {profile.role}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 truncate mt-0.5">
                            {profile.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-2 font-medium">
                            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 group-hover:text-[#0C3E37] transition" />
                            <span>Módulo:</span>
                            <span className="font-semibold text-stone-700 underline decoration-stone-200">
                              {profile.targetName}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5 max-w-lg mx-auto">
                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    DNI o Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="Ej. 45892011 o usuario@ajfisioterapia.pe"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0C3E37]/20 focus:border-[#0C3E37] transition"
                    />
                  </div>
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Pacientes ingresan con su DNI de 8 dígitos; el personal con su email institucional.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0C3E37]/20 focus:border-[#0C3E37] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-stone-300 text-[#0C3E37] focus:ring-[#0C3E37]"
                    />
                    <span>Recordar mi sesión en este dispositivo</span>
                  </label>
                  <a
                    href={
                      config.whatsapp
                        ? `https://wa.me/${config.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Hola, olvidé mi clave de acceso al portal de ${clinicName}.`
                          )}`
                        : "https://wa.me/51987654321"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-stone-600 hover:text-[#0C3E37] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backgroundColor: brandPrimary }}
                >
                  <span>Iniciar Sesión en el Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Sello de Seguridad y Ley N.° 29733 */}
            <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-200/80">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="text-[11px] font-semibold">
                  Confidencialidad y Protección de Datos Médicos bajo la <strong>Ley N.° 29733</strong>
                </span>
              </div>

              <span className="text-[11px] text-stone-400">
                Sede Central: {config.direccionAvenidaCalle || "Av. Guardia Civil"} {config.direccionNumero || "520"}, {config.direccionDistrito || "San Borja"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-stone-400 text-xs text-center mt-6">
          © {new Date().getFullYear()} {clinicName}. Todos los derechos reservados.
        </p>
      </main>

      <div />
    </div>
  );
}
