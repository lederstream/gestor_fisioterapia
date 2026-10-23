"use client";

import { useState } from "react";
import { Shield, UserCheck, Stethoscope, User, ChevronDown, LogOut, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/permissions";

const ROLE_ICONS: Record<UserRole, any> = {
  ADMIN: Shield,
  RECEPCION: UserCheck,
  TERAPEUTA: Stethoscope,
  PACIENTE: User,
};

export function RoleSwitcher() {
  const { currentRole, roleDetails, currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const ActiveIcon = ROLE_ICONS[currentRole] || User;

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

          <div className="pt-2 border-t border-slate-100">
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
    </div>
  );
}
