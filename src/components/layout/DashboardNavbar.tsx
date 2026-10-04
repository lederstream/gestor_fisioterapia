"use client";

import { Bell, Search, Clock, MapPin } from "lucide-react";

export function DashboardNavbar() {
  const todayStr = new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/80">
          <MapPin className="w-3.5 h-3.5 text-teal-600" />
          <span>Sede San Borja (Av. Guardia Civil)</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 capitalize">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{todayStr}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por DNI o Paciente..."
            className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>

        <button 
          title="Notificaciones de Reevaluación"
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-slate-700">6/6 Salas Operativas</span>
        </div>
      </div>
    </header>
  );
}
