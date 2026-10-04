import { Bell, Clock, MapPin, Menu } from "lucide-react";
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
      <div className="flex items-center gap-2 sm:gap-3">
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

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
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
        <button 
          title="Notificaciones de Reevaluación"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
        </button>

        <RoleSwitcher />

        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
          <span className="text-xs font-bold text-slate-700">6/6 Salas</span>
        </div>
      </div>
    </header>
  );
}

