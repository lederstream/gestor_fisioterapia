"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { iniciarSesion } from "@/server/actions/auth";

interface LoginPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginPortalModal({ isOpen, onClose }: LoginPortalModalProps) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage("Por favor ingresa tu correo electrónico/DNI y tu contraseña.");
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

      setSuccessMessage(`Bienvenido, ${res.data?.user.nombre}. Accediendo...`);

      setTimeout(() => {
        onClose();
        window.location.href = res.data?.user.targetUrl || "/dashboard";
      }, 300);
    } catch {
      setErrorMessage("Error de conexión al autenticar. Inténtalo nuevamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200 text-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-[#0C3E37] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] tracking-wider uppercase text-emerald-200 font-bold block">
              PORTAL OFICIAL
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            Iniciar Sesión
          </h2>
          <p className="text-xs text-stone-200 mt-1 max-w-sm leading-relaxed">
            Ingresa con tu correo o DNI y contraseña asignada para acceder al sistema.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-semibold">{successMessage}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">
                Correo Electrónico o DNI
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="ej. gerencia@clinica.pe o DNI"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0C3E37]/30 focus:border-[#0C3E37] transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0C3E37]/30 focus:border-[#0C3E37] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0C3E37] hover:bg-[#0a332d] text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-[10px] text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Acceso seguro protegido con tokens de sesión y hash bcrypt.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
