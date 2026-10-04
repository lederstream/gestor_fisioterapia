"use client";

import Link from "next/link";
import { Bell, Search, Clock, MapPin, Menu, Globe } from "lucide-react";
import { RoleSwitcher } from "./RoleSwitcher";

interface DashboardNavbarProps {
  onToggleMobileMenu?: () => void;
}

export function DashboardNavbar({ onToggleMobileMenu }: DashboardNavbarProps) {
  const todayStr = new Intl.DateTimeFormat("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date());

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden transition border border-slate-200"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
          <MapPin className="w-3.5 h-3.5 text-teal-600" />
          <span className="hidden sm:inline">Sede San Borja (Av. Guardia Civil)</span>
          <span className="sm:hidden">San Borja</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 capitalize">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{todayStr}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/"
          title="Ver página de inicio del sitio web"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 hover:bg-teal-50/70 rounded-xl border border-slate-200 transition"
        >
          <Globe className="w-3.5 h-3.5 text-teal-600" />
          <span>Ver Web</span>
        </Link>

        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por DNI o Paciente..."
            className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl w-48 lg:w-56 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
          />
        </div>

        <button 
          title="Notificaciones de Reevaluación"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
        </button>

        <RoleSwitcher />

        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-slate-700">6/6 Salas</span>
        </div>
      </div>
    </header>
  );
}

