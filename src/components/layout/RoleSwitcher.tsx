"use client";

import { useState } from "react";
import { Shield, UserCheck, Stethoscope, User, ChevronDown, LogOut, CheckCircle2, Activity, KeyRound, X, Eye, EyeOff, Wrench } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/permissions";
import { cambiarPassword } from "@/server/actions/auth";

const ROLE_ICONS: Record<UserRole, any> = {
  SUPERADMIN: Wrench,
  ADMIN: Shield,
  RECEPCION: UserCheck,
  TERAPEUTA: Stethoscope,
  ASISTENTE: Activity,
  PACIENTE: User,
};

export function RoleSwitcher() {
  const { currentRole, roleDetails, currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);
  const [passFeedback, setPassFeedback] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

  const ActiveIcon = ROLE_ICONS[currentRole] || User;

  const handleCambiarMiPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) return;
    setLoadingPass(true);
    setPassFeedback(null);

    const res = await cambiarPassword(currentPass, newPass);
    setLoadingPass(false);

    if (res.success) {
      setPassFeedback({
        tipo: "exito",
        texto: "¡Tu contraseña ha sido actualizada con éxito! Ya está protegida con cifrado bcrypt.",
      });
      setCurrentPass("");
      setNewPass("");
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPassFeedback(null);
      }, 2500);
    } else {
      setPassFeedback({
        tipo: "error",
        texto: res.error || "No se pudo actualizar la contraseña. Revisa tus datos.",
      });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-xs cursor-pointer ${roleDetails.color}`}
        title="Perfil del usuario activo"
      >
        <span className={`w-2 h-2 rounded-full ${roleDetails.dot}`} />
        <ActiveIcon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline font-bold">
          {currentUser.nombre.split(" ")[0]} ({roleDetails.label.split(" ")[0]})
        </span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-xs animate-in fade-in zoom-in-95">
          <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Sesión Activa
              </span>
              <span className="font-extrabold text-slate-800 text-xs truncate block mt-0.5">
                {currentUser.nombre}
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleDetails.badge}`}>
              {roleDetails.label}
            </span>
          </div>

          <div className="py-2.5 space-y-1.5 text-slate-600">
            <div className="text-[11px] flex items-center gap-1.5">
              <span className="text-slate-400">Email:</span>
              <span className="font-semibold text-slate-700 truncate">{currentUser.email}</span>
            </div>
            {currentUser.especialidad && (
              <div className="text-[11px] flex items-start gap-1.5">
                <span className="text-slate-400 shrink-0">Cargo:</span>
                <span className="text-slate-700 font-medium leading-tight">{currentUser.especialidad}</span>
              </div>
            )}
            <div className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Autenticación Criptográfica Activa</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsPasswordModalOpen(true);
                setPassFeedback(null);
                setCurrentPass("");
                setNewPass("");
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-teal-700 hover:bg-teal-50 font-bold text-xs transition cursor-pointer border border-teal-100"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Cambiar Mi Contraseña</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión Segura</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal para Cambiar Contraseña del Usuario Autenticado */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Cambiar Mi Contraseña
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  passFeedback.tipo === "exito"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {passFeedback.texto}
              </div>
            )}

            <form onSubmit={handleCambiarMiPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña Actual *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Tu contraseña actual"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nueva Contraseña (mínimo 8 caracteres) *
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-3 py-2 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingPass}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {loadingPass ? "Actualizando..." : "Actualizar Contraseña"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
