"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  MessageCircle, 
  Sparkles,
  CalendarDays
} from "lucide-react";
import { formatTime } from "@/lib/utils";

interface PatientCitasViewProps {
  citas: any[];
  salas: any[];
  personal: any[];
}

export function PatientCitasView({ citas, salas, personal }: PatientCitasViewProps) {
  const [filter, setFilter] = useState<"proximas" | "historial">("proximas");
  const [clinicConfig, setClinicConfig] = useState({
    nombreComercial: "AJ Fisioterapia",
    sedeNombre: "Sede San Borja",
    whatsapp: "+51 987 654 321",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("clinic_config");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setClinicConfig((prev) => ({ ...prev, ...parsed }));
        } catch {}
      }
    }
  }, []);

  const proximas = citas.filter((c) => c.estado === "PROGRAMADA" || c.estado === "CONFIRMADA");
  const historial = citas.filter((c) => c.estado === "ATENDIDA" || c.estado === "CANCELADA");

  const cleanWhatsapp = clinicConfig.whatsapp ? clinicConfig.whatsapp.replace(/\D/g, "") : "51987654321";

  const renderCitaCard = (cita: any) => {
    const sala = salas.find((s) => s.id === cita.salaId);
    const terapeuta = personal.find((u) => u.id === cita.terapeutaId);
    const fechaObj = new Date(cita.fechaHoraInicio);
    const fechaTexto = fechaObj.toLocaleDateString("es-PE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <div
        key={cita.id}
        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex flex-col items-center justify-center shrink-0 border border-teal-100">
            <span className="text-[10px] font-bold uppercase">{fechaObj.toLocaleDateString("es-PE", { month: "short" })}</span>
            <span className="text-base font-black leading-none">{fechaObj.getDate()}</span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 text-sm capitalize">{fechaTexto}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  cita.estado === "CONFIRMADA"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : cita.estado === "PROGRAMADA"
                    ? "bg-teal-50 text-teal-700 border-teal-200"
                    : cita.estado === "ATENDIDA"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {cita.estado}
              </span>
              {cita.esReevaluacion && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertTriangle className="w-3 h-3 text-amber-600" /> Hito Reevaluación (Sesión 5)
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formatTime(cita.fechaHoraInicio)} - {formatTime(cita.fechaHoraFin)}
              </span>
              <span className="inline-flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-teal-600" />
                {terapeuta?.nombre || "Lic. Fisioterapeuta asignado"}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {clinicConfig.sedeNombre} • {sala?.nombre || "Sala Principal"}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <a
            href={`https://wa.me/${cleanWhatsapp}?text=Hola,%20quisiera%20consultar%20o%20reprogramar%20mi%20cita%20del%20${fechaTexto}%20a%20las%20${formatTime(cita.fechaHoraInicio)}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 hover:border-emerald-300 transition flex items-center gap-1.5"
            title="Reprogramar o consultar por WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Coordinar</span>
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-teal-600" />
            Mis Citas de Terapia
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Consulta los horarios confirmados, terapeuta a cargo y sede asignada para tu tratamiento.
          </p>
        </div>

        <Link
          href="/reservas"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Reservar Nueva Cita</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setFilter("proximas")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition -mb-px flex items-center gap-2 ${
            filter === "proximas"
              ? "border-teal-600 text-teal-800"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <span>Próximas Sesiones</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-50 text-teal-700">
            {proximas.length}
          </span>
        </button>
        <button
          onClick={() => setFilter("historial")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition -mb-px flex items-center gap-2 ${
            filter === "historial"
              ? "border-teal-600 text-teal-800"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <span>Historial de Atenciones</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
            {historial.length}
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {filter === "proximas" ? (
          proximas.length > 0 ? (
            proximas.map(renderCitaCard)
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">No tienes citas programadas pendientes</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Coordina tu próxima sesión de fisioterapia para no interrumpir tu proceso de recuperación.
              </p>
              <Link
                href="/reservas"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition"
              >
                <span>Agendar Ahora</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )
        ) : (
          historial.length > 0 ? (
            historial.map(renderCitaCard)
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              Aún no registras citas atendidas pasadas en este periodo.
            </div>
          )
        )}
      </div>
    </div>
  );
}
