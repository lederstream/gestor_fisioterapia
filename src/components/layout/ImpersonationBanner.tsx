"use client";

import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/permissions";
import Link from "next/link";
import { 
  Wrench, 
  Eye, 
  RotateCcw, 
  Activity, 
  ExternalLink, 
  ShieldCheck, 
  ShieldAlert,
  ChevronDown
} from "lucide-react";

const ROLES_TO_IMPERSONATE: { role: UserRole; label: string }[] = [
  { role: "ADMIN", label: "Administrador / Dueño" },
  { role: "RECEPCION", label: "Recepción / Caja" },
  { role: "TERAPEUTA", label: "Fisioterapeuta" },
  { role: "ASISTENTE", label: "Asistente Técnico" },
  { role: "PACIENTE", label: "Paciente / Cliente" },
];

export function ImpersonationBanner() {
  const { currentUser, currentRole, isImpersonating, impersonateAs, resetImpersonation } = useAuth();

  // Solo se muestra si el usuario raíz es SUPERADMIN
  if (currentUser.rol !== "SUPERADMIN") return null;

  return (
    <div className={`w-full py-2 px-4 transition-colors z-40 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
      isImpersonating
        ? "bg-amber-500 text-slate-950 border-amber-600 shadow-sm"
        : "bg-slate-900 text-slate-100 border-slate-800"
    }`}>
      <div className="flex items-center gap-2 font-bold">
        <Wrench className={`w-4 h-4 ${isImpersonating ? "text-slate-950 animate-pulse" : "text-amber-400"}`} />
        <span>
          {isImpersonating ? "MODO SOPORTE ACTIVO:" : "PANEL SUPERADMIN & SOPORTE TÉCNICO"}
        </span>
        {isImpersonating && (
          <span className="bg-slate-950 text-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider">
            Viendo como {currentRole}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 opacity-70" />
          <span className="text-[11px] opacity-80 hidden sm:inline">Simular vista:</span>
          <select
            value={isImpersonating ? currentRole : "SUPERADMIN"}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "SUPERADMIN") {
                resetImpersonation();
              } else {
                impersonateAs(val as UserRole);
              }
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
              isImpersonating
                ? "bg-white text-slate-900 border-amber-600"
                : "bg-slate-800 text-amber-300 border-slate-700"
            }`}
          >
            <option value="SUPERADMIN">👑 SUPERADMIN (Control Total)</option>
            {ROLES_TO_IMPERSONATE.map((r) => (
              <option key={r.role} value={r.role}>
                👤 {r.label}
              </option>
            ))}
          </select>
        </div>

        {isImpersonating ? (
          <button
            onClick={resetImpersonation}
            className="flex items-center gap-1 px-3 py-1 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-lg transition cursor-pointer text-xs shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Restablecer</span>
          </button>
        ) : (
          <Link
            href="/dashboard/soporte"
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg transition text-xs shadow-xs"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Diagnóstico del Sistema</span>
          </Link>
        )}
      </div>
    </div>
  );
}

