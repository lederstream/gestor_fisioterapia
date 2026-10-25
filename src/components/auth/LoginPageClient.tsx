"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Building2,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { ConfiguracionClinicaItem } from "@/lib/store";
import { iniciarSesion } from "@/server/actions/auth";

interface LoginPageClientProps {
  config: ConfiguracionClinicaItem;
}

export function LoginPageClient({ config }: LoginPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const brandPrimary = config?.colorPrimario || "#0C3E37";
  const clinicName = config?.nombreComercial || "AJ Fisioterapia";
  const clinicSlogan = config?.slogan || "REHABILITACIÓN & BIENESTAR";

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim()) {
      setErrorMessage("Por favor ingresa tu correo electrónico, usuario o DNI.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Por favor ingresa tu contraseña de acceso.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await iniciarSesion(identifier, password);

      if (!res.success) {
        setErrorMessage(res.error || "Credenciales inválidas.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage(`Bienvenido, ${res.data?.user.nombre}. Accediendo al portal...`);
      const destination = redirectParam || res.data?.user.targetUrl || "/dashboard";

      setTimeout(() => {
        window.location.href = destination;
      }, 300);
    } catch {
      setErrorMessage("Ocurrió un error inesperado al conectar con el servidor. Inténtalo de nuevo.");
      setIsLoading(false);
    }
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
          <span>Volver a la página principal</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span className="hidden sm:inline">¿Eres paciente nuevo y deseas agendar?</span>
          <Link
            href="/reservas"
            className="font-bold underline decoration-stone-300 hover:text-[#0C3E37] transition"
          >
            Reservar cita aquí
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto w-full px-4 sm:px-6 py-8 flex flex-col items-center">
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
            Portal Clínico y Administrativo
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1.5 max-w-sm mx-auto">
            Acceso seguro para el personal médico, administrativo y pacientes de la clínica.
          </p>
        </div>

        {/* Card Principal de Login */}
        <div className="bg-white w-full rounded-3xl shadow-xl shadow-stone-900/5 border border-stone-200/90 overflow-hidden p-6 sm:p-8">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-semibold">{successMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Correo Electrónico, Usuario o DNI
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="ej. admin o correo@clinica.pe"
                  required
                  autoFocus
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3E37] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-700">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3E37] focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: brandPrimary }}
              className="w-full mt-2 py-3 px-4 rounded-xl text-white font-extrabold text-xs sm:text-sm shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Cuentas registradas para evaluación y auditoría RBAC (Sin contraseñas en código cliente) */}
          <div className="mt-5 pt-4 border-t border-stone-150">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                Perfiles de Demostración (Seleccionar Usuario)
              </span>
              <span className="text-[9px] text-[#0C3E37] bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                RBAC Auditado
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIdentifier("marco.yana@ajfisioterapia.pe");
                  setErrorMessage(null);
                }}
                className="text-left p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-[#0C3E37] transition text-xs cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-stone-800 text-[11px] group-hover:text-[#0C3E37]">ADMIN</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                </div>
                <span className="text-[10px] text-stone-500 block truncate mt-0.5">Marco Yana (Gerencia)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIdentifier("alexander.saavedra@gmail.com");
                  setErrorMessage(null);
                }}
                className="text-left p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 hover:border-emerald-500 transition text-xs cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-950 text-[11px] group-hover:text-emerald-700">PACIENTE</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                </div>
                <span className="text-[10px] text-emerald-800 block truncate mt-0.5">A. Saavedra (Portal Paciente)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIdentifier("karin.palacios@ajfisioterapia.pe");
                  setErrorMessage(null);
                }}
                className="text-left p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-[#0C3E37] transition text-xs cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-stone-800 text-[11px] group-hover:text-[#0C3E37]">RECEPCIÓN</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                </div>
                <span className="text-[10px] text-stone-500 block truncate mt-0.5">Karin P. (Caja / Agenda)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIdentifier("jeiser.vasquez@ajfisioterapia.pe");
                  setErrorMessage(null);
                }}
                className="text-left p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-[#0C3E37] transition text-xs cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-stone-800 text-[11px] group-hover:text-[#0C3E37]">TERAPEUTA</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                </div>
                <span className="text-[10px] text-stone-500 block truncate mt-0.5">Lic. Jeiser (Ficha EVA)</span>
              </button>
            </div>

            {/* Enlace al Asistente de Inicialización Segura (Setup Bootstrap) */}
            <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
              <span className="text-stone-400">¿Nuevo despliegue?</span>
              <Link
                href="/setup"
                className="font-bold text-[#0C3E37] hover:underline inline-flex items-center gap-1 transition"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Asistente de Inicialización de Administrador →</span>
              </Link>
            </div>
          </div>

            {/* Indicador de Seguridad Institucional (Ciberseguridad OWASP) */}
            <div className="mt-5 p-3.5 bg-stone-50 border border-stone-200/80 rounded-2xl flex items-start gap-2.5 text-stone-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-stone-800 block">
                  Autenticación Criptográfica Segura
                </span>
                <p className="text-[10px] text-stone-500 leading-relaxed">
                  Canal protegido con cifrado TLS 1.3, hashing unidireccional bcrypt y cookies HTTP-only. Todo intento de acceso queda auditado.
                </p>
              </div>
            </div>
          </div>
        </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-stone-400">
        <p>
          © {new Date().getFullYear()} {clinicName}. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
