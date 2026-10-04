"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Activity, 
  Home, 
  ShieldCheck, 
  Sparkles,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Resumen General", href: "/dashboard", icon: Home },
  { name: "Agenda (6 Salas)", href: "/dashboard/agenda", icon: Calendar, badge: "6 Salas" },
  { name: "Caja y Cobranzas", href: "/dashboard/caja", icon: CreditCard },
  { name: "Directorio Pacientes", href: "/dashboard/pacientes", icon: Users },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950/60">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 font-bold text-lg">
          KF
        </div>
        <div>
          <span className="font-semibold tracking-tight text-white text-base block leading-none">
            KineFlow Core
          </span>
          <span className="text-[11px] text-teal-400 font-medium tracking-wide">
            AJ Fisioterapia • San Borja
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Módulos Clínicos
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Portal Público
        </div>
        <Link
          href="/reservas"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-teal-300 bg-teal-950/40 hover:bg-teal-900/50 border border-teal-800/40 transition-colors"
        >
          <Sparkles className="w-5 h-5 text-teal-400" />
          <span className="flex-1">Portal Paciente</span>
          <ExternalLink className="w-3.5 h-3.5 text-teal-400/80" />
        </Link>
      </nav>

      {/* Clinic Operational Badge */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 m-3 rounded-xl border">
        <div className="flex items-center gap-2 mb-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-white">Cumplimiento Clínico</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Regla activa: Reevaluación física obligatoria cada 5 sesiones asistidas. Privacidad estricta sin multimedia.
        </p>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-semibold text-xs text-white">
          MA
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white truncate">Marco Antonio</p>
          <p className="text-[11px] text-teal-400 truncate">Administrador (RBAC: ADMIN)</p>
        </div>
      </div>
    </aside>
  );
}
