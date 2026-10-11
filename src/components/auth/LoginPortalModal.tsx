"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Shield,
  Stethoscope,
  UserCheck,
  User,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UserRole, ROLE_DETAILS } from "@/lib/permissions";

interface LoginPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_PROFILES: {
  role: UserRole;
  name: string;
  email: string;
  title: string;
  badge: string;
  targetUrl: string;
  targetName: string;
  icon: any;
  accentColor: string;
  borderHover: string;
  badgeBg: string;
}[] = [
  {
    role: "PACIENTE",
    name: "Alexander Saavedra",
    email: "alexander.saavedra@gmail.com",
    title: "Paciente Titular • DNI 45892011",
    badge: "Mis Citas y Paquetes",
    targetUrl: "/reservas",
    targetName: "Portal de Citas y Sesiones",
    icon: User,
    accentColor: "text-emerald-700",
    borderHover: "hover:border-emerald-500 hover:bg-emerald-50/50",
    badgeBg: "bg-emerald-100 text-emerald-800",
  },
  {
    role: "TERAPEUTA",
    name: "Lic. Jeiser Vasquez",
    email: "jeiser.vasquez@ajfisioterapia.pe",
    title: "Lic. Fisioterapia Deportiva (CTMP 12480)",
    badge: "Agenda & Ficha EVA",
    targetUrl: "/dashboard/agenda",
    targetName: "Panel Clínico de Terapia",
    icon: Stethoscope,
    accentColor: "text-teal-700",
    borderHover: "hover:border-teal-500 hover:bg-teal-50/50",
    badgeBg: "bg-teal-100 text-teal-800",
  },
  {
    role: "RECEPCION",
    name: "Karin Palacios",
    email: "karin.palacios@ajfisioterapia.pe",
    title: "Admisión & Coordinación San Borja",
    badge: "6 Salas & Caja",
    targetUrl: "/dashboard/agenda",
    targetName: "Matriz 6 Salas y Caja",
    icon: UserCheck,
    accentColor: "text-blue-700",
    borderHover: "hover:border-blue-500 hover:bg-blue-50/50",
    badgeBg: "bg-blue-100 text-blue-800",
  },
  {
    role: "ADMIN",
    name: "Marco Yana",
    email: "marco.yana@ajfisioterapia.pe",
    title: "Dirección Clínica y Gerencia",
    badge: "Control Total & Auditoría",
    targetUrl: "/dashboard",
    targetName: "Dashboard de Gerencia",
    icon: Shield,
    accentColor: "text-purple-700",
    borderHover: "hover:border-purple-500 hover:bg-purple-50/50",
    badgeBg: "bg-purple-100 text-purple-800",
  },
];

export function LoginPortalModal({ isOpen, onClose }: LoginPortalModalProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectRole = (profile: typeof DEMO_PROFILES[0]) => {
    setLoadingRole(profile.role);
    setRedirectMessage(`Ingresando como ${profile.name}... Redirigiendo a ${profile.targetName}`);
    
    // Iniciar sesión y guardar estado
    login(profile.role);

    setTimeout(() => {
      onClose();
      router.push(profile.targetUrl);
    }, 700);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Identificar si coincide con algún perfil o asignar ADMIN por defecto
    const lower = emailInput.toLowerCase().trim();
    let selectedProfile = DEMO_PROFILES.find((p) => p.email.toLowerCase() === lower || lower.includes("alexander") || lower === "45892011");
    if (!selectedProfile) {
      if (lower.includes("jeiser") || lower.includes("terapeuta")) {
        selectedProfile = DEMO_PROFILES[1];
      } else if (lower.includes("karin") || lower.includes("recepcion")) {
        selectedProfile = DEMO_PROFILES[2];
      } else if (lower.includes("marco") || lower.includes("admin")) {
        selectedProfile = DEMO_PROFILES[3];
      } else {
        selectedProfile = DEMO_PROFILES[0]; // Paciente por defecto
      }
    }
    handleSelectRole(selectedProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200 text-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-[#0C3E37] text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white text-[#0C3E37] flex items-center justify-center font-bold text-sm shadow-sm">
              AJ
            </div>
            <div>
              <span className="font-bold text-white text-base block leading-tight">
                AJ Fisioterapia
              </span>
              <span className="text-[10px] tracking-wider uppercase text-emerald-200 font-semibold block">
                PORTAL CLÍNICO Y DE PACIENTES
              </span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white mt-3">
            Acceso a Mi Portal
          </h2>
          <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-lg leading-relaxed">
            Ingresa a tu espacio privado según tu rol. El sistema te redireccionará automáticamente a tus citas, agenda o panel de control.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Mensaje de redirección / carga */}
          {redirectMessage ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#E2EEE7] text-[#145347] flex items-center justify-center animate-spin">
                <Sparkles className="w-6 h-6 text-[#0C3E37]" />
              </div>
              <p className="font-bold text-sm text-[#0B2E28]">
                {redirectMessage}
              </p>
              <p className="text-xs text-stone-400">
                Verificando credenciales y permisos RBAC...
              </p>
            </div>
          ) : (
            <>
              {/* Formulario Formal de Credenciales */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      DNI o Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Ej. 45892011 o usuario@..."
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0C3E37]/30 focus:border-[#0C3E37] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0C3E37]/30 focus:border-[#0C3E37] transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-stone-500 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-stone-300 text-[#0C3E37] focus:ring-[#0C3E37]" />
                    <span>Recordar mi sesión</span>
                  </label>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#0C3E37] hover:bg-[#072B26] text-white text-xs sm:text-sm font-bold px-6 py-2.5 flex items-center gap-2 shadow-sm transition"
                  >
                    <span>Ingresar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Separador */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                    O elige un perfil de evaluación en 1 clic
                  </span>
                </div>
              </div>

              {/* 4 Perfiles de Demostración con los nombres solicitados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {DEMO_PROFILES.map((profile) => {
                  const Icon = profile.icon;
                  const isLoading = loadingRole === profile.role;

                  return (
                    <button
                      key={profile.role}
                      type="button"
                      disabled={loadingRole !== null}
                      onClick={() => handleSelectRole(profile)}
                      className={`text-left p-3.5 rounded-2xl border border-stone-200 bg-white transition-all flex items-start gap-3.5 shadow-2xs group cursor-pointer ${profile.borderHover}`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${profile.accentColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-[#0C3E37] transition-colors truncate">
                            {profile.name}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${profile.badgeBg}`}>
                            {profile.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {profile.title}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-1 font-medium">
                          <span>Destino:</span>
                          <span className="font-semibold text-stone-600 underline decoration-stone-200">
                            {profile.targetName}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-[11px] text-stone-500 leading-relaxed flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0C3E37] shrink-0" />
                <span>
                  <strong>Control de Acceso (RBAC):</strong> Cada perfil ingresa con restricciones automáticas de seguridad y trazabilidad.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
