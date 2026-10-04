"use client";

import { useState } from "react";
import { Shield, UserCheck, Stethoscope, User, ChevronDown, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UserRole, ROLE_DETAILS } from "@/lib/permissions";

const ROLE_ICONS: Record<UserRole, any> = {
  ADMIN: Shield,
  RECEPCION: UserCheck,
  TERAPEUTA: Stethoscope,
  PACIENTE: User,
};

export function RoleSwitcher() {
  const { currentRole, switchRole, roleDetails, currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const roles: UserRole[] = ["ADMIN", "RECEPCION", "TERAPEUTA", "PACIENTE"];
  const ActiveIcon = ROLE_ICONS[currentRole];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-xs ${roleDetails.color}`}
        title="Cambiar rol activo para probar permisos y medidas de seguridad"
      >
        <span className={`w-2 h-2 rounded-full ${roleDetails.dot}`} />
        <ActiveIcon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{roleDetails.label.split(" ")[0]}: {currentUser.nombre.split(" ")[0]}</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in zoom-in-95">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Control de Roles (RBAC)
            </span>
            <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              En Vivo
            </span>
          </div>
          <div className="space-y-1 mt-1.5">
            {roles.map((r) => {
              const rDetail = ROLE_DETAILS[r];
              const RIcon = ROLE_ICONS[r];
              const isSelected = currentRole === r;

              return (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                    isSelected
                      ? "bg-teal-600 text-white font-bold shadow-xs"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <RIcon className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="block text-xs font-bold leading-tight">
                        {rDetail.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className={`text-[10px] block mt-0.5 truncate ${isSelected ? "text-teal-100" : "text-slate-400"}`}>
                      {rDetail.nameExample} • {rDetail.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 px-2 text-[10px] text-slate-400 leading-relaxed">
            💡 Al cambiar de rol se actualizan en vivo los menús del sidebar, las alertas de seguridad y el acceso a caja/auditoría.
          </div>
        </div>
      )}
    </div>
  );
}

