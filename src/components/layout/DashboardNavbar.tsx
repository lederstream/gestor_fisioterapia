"use client";

import Link from "next/link";
import { Bell, Search, Clock, MapPin, Menu, Globe, ArrowLeft } from "lucide-react";
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
    <header className="h-16 bg-gradient-to-r from-teal-600 via-teal-600 to-emerald-600 text-white border-b border-teal-500/40 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Button */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-xl text-white hover:bg-white/15 md:hidden transition border border-white/20"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Botón Estratégico Prominente: Volver al Sitio Web */}
        <Link
          href="/"
          title="Regresar a la página principal del sitio web"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/25 transition shadow-2xs backdrop-blur-xs group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-teal-100 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">Volver al Sitio Web</span>
          <span className="sm:hidden font-extrabold">Web</span>
        </Link>

        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-teal-50 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 backdrop-blur-xs">
          <MapPin className="w-3.5 h-3.5 text-teal-200" />
          <span>Sede San Borja (Av. Guardia Civil)</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-teal-100 capitalize">
          <Clock className="w-3.5 h-3.5 text-teal-200" />
          <span>{todayStr}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-teal-100" />
          <input
            type="text"
            placeholder="Buscar por DNI o Paciente..."
            className="pl-9 pr-4 py-1.5 text-xs bg-white/15 text-white placeholder-teal-100/75 border border-white/25 rounded-xl w-48 lg:w-56 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white transition-all font-medium backdrop-blur-xs"
          />
        </div>

        <button 
          title="Notificaciones de Reevaluación"
          className="relative p-2 rounded-xl text-white hover:bg-white/15 transition-colors border border-white/20"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-300 ring-2 ring-teal-600 animate-pulse" />
        </button>

        <RoleSwitcher />

        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/20">
          <span className="w-2 h-2 rounded-full bg-emerald-300 ring-2 ring-emerald-400/40" />
          <span className="text-xs font-bold text-white">6/6 Salas</span>
        </div>
      </div>
    </header>
  );
}

