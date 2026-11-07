"use client";

import { useState, useEffect } from "react";
import { Clock, MapPin, Menu, Sparkles, HeartHandshake } from "lucide-react";
import { RoleSwitcher } from "./RoleSwitcher";
import { useAuth } from "@/lib/auth-context";

import { ConfiguracionClinicaItem } from "@/lib/store";

interface DashboardNavbarProps {
  onToggleMobileMenu?: () => void;
  initialConfig?: ConfiguracionClinicaItem;
}

export function DashboardNavbar({ onToggleMobileMenu, initialConfig }: DashboardNavbarProps) {
  const { currentRole } = useAuth();
  const [clinicConfig, setClinicConfig] = useState({
    nombreComercial: initialConfig?.nombreComercial || "AJ Fisioterapia",
    direccion: initialConfig?.direccion || "Av. Guardia Civil 520, San Borja, Lima",
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

  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateFormatted = new Intl.DateTimeFormat("es-PE", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "America/Lima",
      }).format(now);
      const timeFormatted = new Intl.DateTimeFormat("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "America/Lima",
      }).format(now);

      setDateStr(dateFormatted);
      setTimeStr(timeFormatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
              {clinicConfig.nombreComercial} • {shortAddress}
            </span>
            <span className="sm:hidden">{clinicConfig.nombreComercial}</span>
          </div>
        )}

        {/* Reloj y Fecha Sincronizada con Hora de Perú (America/Lima) */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span className="capitalize font-medium">{dateStr || "Hoy"}</span>
          <span className="text-slate-300">•</span>
          <span className="font-mono font-bold text-slate-900">{timeStr || "--:--:--"}</span>
          <span className="text-[9px] text-teal-700 font-extrabold bg-teal-100/70 px-1.5 py-0.5 rounded border border-teal-200">
            PERÚ (UTC-5)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <RoleSwitcher />
      </div>
    </header>
  );
}

