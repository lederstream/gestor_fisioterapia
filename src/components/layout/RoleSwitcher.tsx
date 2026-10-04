"use client";

import { useState } from "react";
import { Shield, UserCheck, Stethoscope, ChevronDown } from "lucide-react";

export function RoleSwitcher() {
  const [currentRole, setCurrentRole] = useState<"ADMIN" | "RECEPCION" | "TERAPEUTA">("ADMIN");
  const [isOpen, setIsOpen] = useState(false);

  const roles = [
    {
      id: "ADMIN",
      label: "Administrador (Gerencia)",
      name: "Marco Antonio",
      icon: Shield,
      color: "bg-purple-50 text-purple-700 border-purple-200",
      dot: "bg-purple-600",
    },
    {
      id: "RECEPCION",
      label: "Recepción (Admisión/Caja)",
      name: "Ana Ramos",
      icon: UserCheck,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-600",
    },
    {
      id: "TERAPEUTA",
      label: "Fisioterapeuta Clínico",
      name: "Lic. Carlos Mendoza",
      icon: Stethoscope,
      color: "bg-teal-50 text-teal-700 border-teal-200",
      dot: "bg-teal-600",
    },
  ];

  const active = roles.find((r) => r.id === currentRole) || roles[0];
  const Icon = active.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${active.color}`}
      >
        <span className={`w-2 h-2 rounded-full ${active.dot}`} />
        <Icon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Rol: {active.name}</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in zoom-in-95">
          <div className="px-2.5 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Simulador de Roles (RBAC)
          </div>
          <div className="space-y-1 mt-1">
            {roles.map((r) => {
              const RIcon = r.icon;
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setCurrentRole(r.id as any);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                    currentRole === r.id
                      ? "bg-slate-900 text-white font-bold"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <RIcon className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="block text-xs leading-none">{r.label}</span>
                    <span className="text-[10px] opacity-70 block mt-0.5">{r.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
