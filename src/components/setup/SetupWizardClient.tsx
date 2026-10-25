"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Building2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  ArrowLeft,
  Check,
  X
} from "lucide-react";
import { SetupStatusResponse, inicializarAdministradorRaiz } from "@/server/actions/setup";
import { ConfiguracionClinicaItem } from "@/lib/store";

interface SetupWizardClientProps {
  status: SetupStatusResponse;
  config: ConfiguracionClinicaItem;
}

export function SetupWizardClient({ status, config }: SetupWizardClientProps) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [especialidad, setEspecialidad] = useState("Gerencia y Dirección Clínica");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tokenSeguridad, setTokenSeguridad] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const brandPrimary = config?.colorPrimario || "#0C3E37";
  const clinicName = config?.nombreComercial || "AJ Fisioterapia";

  // Medidor de fortaleza de contraseña
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const checksPassed = [hasMinLength, hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (checksPassed < 5) {
      setErrorMessage("Por favor cumpla con todos los requisitos de complejidad de la contraseña.");
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage("Las contraseñas no coinciden. Por favor verifíquelas.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await inicializarAdministradorRaiz({
        nombre,
        email,
        password,
        especialidad,
        tokenSeguridad: status.requiereTokenSeguridad ? tokenSeguridad : undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || "No se pudo inicializar el Administrador.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("¡Administrador Principal creado con éxito! Ingresando al panel...");
      setTimeout(() => {
        window.location.href = res.redirectUrl || "/dashboard";
      }, 1000);
    } catch {
      setErrorMessage("Error inesperado en la conexión con el servidor.");
      setIsLoading(false);
    }
  };

  // CASO 1: Si el sistema YA fue inicializado previamente (Puerta Sellada)
  if (status.inicializado) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] text-stone-800 flex flex-col justify-between selection:bg-[#0C3E37] selection:text-white">
        <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ir al Inicio de Sesión</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sistema Seguro & Auditado</span>
          </div>
        </header>

        <main className="max-w-lg mx-auto w-full px-4 py-12 flex flex-col items-center">
          <div className="bg-white w-full rounded-3xl shadow-xl shadow-stone-900/5 border border-stone-200/90 overflow-hidden p-8 sm:p-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Estado: Inicializado y Sellado
              </div>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                El Administrador Principal ya está Configurado
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-sm mx-auto">
                Por políticas de ciberseguridad y prevención de intrusión, la puerta de inicialización se encuentra permanentemente sellada.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-left text-xs space-y-2 text-stone-600">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-500">Clínica:</span>
                <span className="font-bold text-stone-800">{clinicName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-500">Total Administradores:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {status.totalAdmins} Activo(s)
                </span>
              </div>
              <p className="text-[11px] text-stone-400 pt-1 border-t border-stone-200 leading-relaxed">
                Si requiere registrar nuevos colaboradores (médicos, recepcionistas o terapeutas), inicie sesión con su cuenta de Administrador y diríjase al módulo de <strong>Equipo Clínico</strong>.
              </p>
            </div>

            <Link
              href="/login"
              style={{ backgroundColor: brandPrimary }}
              className="w-full py-3.5 px-4 rounded-xl text-white font-extrabold text-xs sm:text-sm shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Acceder al Portal Clínico</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>

        <footer className="max-w-7xl mx-auto w-full px-4 py-6 text-center text-xs text-stone-400">
          <p>© {new Date().getFullYear()} {clinicName}. Todos los derechos reservados.</p>
        </footer>
      </div>
    );
  }

  // CASO 2: Sistema NO inicializado -> Wizard de Creación del Administrador Raíz
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 flex flex-col justify-between selection:bg-[#0C3E37] selection:text-white">
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-sm shadow-md"
            style={{ backgroundColor: brandPrimary }}
          >
            {clinicName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-bold text-sm text-stone-900 block leading-tight">{clinicName}</span>
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block">
              Instalador & Bootstrap Inicial
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Paso 1 de 1: Configurar Administrador Raíz
        </div>
      </header>

      <main className="max-w-xl mx-auto w-full px-4 py-8 flex flex-col items-center">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Inicialización del Sistema Clínico
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1.5 max-w-md mx-auto">
            Cree la cuenta del <strong>Administrador Principal</strong>. Este usuario tendrá el control total para gestionar la clínica, el personal médico y la matriz de seguridad RBAC.
          </p>
        </div>

        <div className="bg-white w-full rounded-3xl shadow-xl shadow-stone-900/5 border border-stone-200/90 overflow-hidden p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Nombre Completo */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Nombre Completo del Administrador <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="ej. Marco Antonio Yana"
                  required
                  autoFocus
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3E37] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Correo Electrónico Institucional */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Correo Electrónico Institucional <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ej. marco.yana@ajfisioterapia.pe"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3E37] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Cargo / Especialidad */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Cargo o Título Directivo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={especialidad}
                  onChange={(e) => setEspecialidad(e.target.value)}
                  placeholder="ej. Gerencia y Dirección Clínica"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3E37] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Token de Seguridad del Servidor (si aplica) */}
            {status.requiereTokenSeguridad && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-amber-900">
                  Token Secreto de Instalación (.env) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={tokenSeguridad}
                    onChange={(e) => setTokenSeguridad(e.target.value)}
                    placeholder="SETUP_SECRET_TOKEN del servidor"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-amber-50/50 border border-amber-300 rounded-xl text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3E37] transition font-mono"
                  />
                </div>
              </div>
            )}

            {/* Contraseña Maestra */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-stone-700">
                Contraseña Maestra del Administrador <span className="text-rose-500">*</span>
              </label>
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
                  className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3E37] focus:bg-white transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Medidor visual de requisitos OWASP */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2 mt-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-stone-500">Robustez de Clave:</span>
                  <span className={checksPassed === 5 ? "text-emerald-700" : "text-amber-700"}>
                    {checksPassed === 5 ? "Excelente (OWASP)" : `${checksPassed}/5 requisitos cumplidos`}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-700 font-bold" : "text-stone-400"}`}>
                    {hasMinLength ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-stone-300" />}
                    <span>Mínimo 8 caracteres</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-700 font-bold" : "text-stone-400"}`}>
                    {hasUpper ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-stone-300" />}
                    <span>Al menos 1 mayúscula</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLower ? "text-emerald-700 font-bold" : "text-stone-400"}`}>
                    {hasLower ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-stone-300" />}
                    <span>Al menos 1 minúscula</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-700 font-bold" : "text-stone-400"}`}>
                    {hasNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-stone-300" />}
                    <span>Al menos 1 número</span>
                  </div>
                  <div className={`flex items-center gap-1.5 col-span-2 ${hasSymbol ? "text-emerald-700 font-bold" : "text-stone-400"}`}>
                    {hasSymbol ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-stone-300" />}
                    <span>Al menos 1 símbolo especial (!@#$%^&*...)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Confirmar Contraseña Maestra <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3E37] focus:bg-white transition font-mono"
                />
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <span className="text-[10px] text-rose-600 font-bold block">
                  Las contraseñas no coinciden.
                </span>
              )}
            </div>

            {/* Botón de Inicialización */}
            <button
              type="submit"
              disabled={isLoading || checksPassed < 5 || !passwordsMatch}
              style={{ backgroundColor: brandPrimary }}
              className="w-full mt-2 py-3.5 px-4 rounded-xl text-white font-extrabold text-xs sm:text-sm shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Inicializando y Cifrando Credenciales...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Crear Administrador Principal y Sellar Sistema</span>
                </>
              )}
            </button>
          </form>

          {/* Badge de Seguridad */}
          <div className="mt-5 p-3.5 bg-stone-50 border border-stone-200/80 rounded-2xl flex items-start gap-2.5 text-stone-600">
            <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-stone-500 leading-relaxed">
              <strong>Protección Criptográfica Inmediata:</strong> La clave se procesará con función unidireccional bcrypt (factor de costo 10 con sal aleatoria) antes de su almacenamiento en PostgreSQL. Nunca se guardará en texto plano.
            </p>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto w-full px-4 py-6 text-center text-xs text-stone-400">
        <p>© {new Date().getFullYear()} {clinicName}. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
