"use client";

import { useState, useEffect } from "react";
import { Bell, Clock, MapPin, Menu, Sparkles, HeartHandshake } from "lucide-react";
import { RoleSwitcher } from "./RoleSwitcher";
import { useAuth } from "@/lib/auth-context";

interface DashboardNavbarProps {
  onToggleMobileMenu?: () => void;
}

export function DashboardNavbar({ onToggleMobileMenu }: DashboardNavbarProps) {
  const { currentRole } = useAuth();
  const [clinicConfig, setClinicConfig] = useState({
    nombreComercial: "AJ Fisioterapia",
    sedeNombre: "Sede San Borja",
    direccion: "Av. Guardia Civil 520, San Borja, Lima",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("clinic_config");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setClinicConfig((prev) => ({
            ...prev,
            ...parsed,
          }));
        } catch {
          // ignore error
        }
      }

      const handleConfigChange = () => {
        const updated = localStorage.getItem("clinic_config");
        if (updated) {
          try {
            const parsed = JSON.parse(updated);
            setClinicConfig((prev) => ({
              ...prev,
              ...parsed,
            }));
          } catch {}
        }
      };

      window.addEventListener("clinic-config-change", handleConfigChange);
      return () => window.removeEventListener("clinic-config-change", handleConfigChange);
    }
  }, []);

  const todayStr = new Intl.DateTimeFormat("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date());

  const isPatient = currentRole === "PACIENTE";
  const shortAddress = clinicConfig.direccion ? clinicConfig.direccion.split(",")[0] : "Av. Guardia Civil";

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

        {/* Dynamic Branch or Patient Portal Badge */}
        {isPatient ? (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">Portal Oficial del Paciente • {clinicConfig.nombreComercial}</span>
            <span className="sm:hidden">Portal Paciente</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="hidden sm:inline">
              {clinicConfig.sedeNombre} ({shortAddress})
            </span>
            <span className="sm:hidden">{clinicConfig.sedeNombre}</span>
          </div>
        )}

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 capitalize">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{todayStr}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button 
          title={isPatient ? "Avisos de citas y evolución" : "Notificaciones de Reevaluación"}
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
        </button>

        <RoleSwitcher />
      </div>
    </header>
  );
}

