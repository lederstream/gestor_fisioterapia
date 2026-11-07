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
  CalendarDays,
  ExternalLink,
  Plus,
  Check
} from "lucide-react";
import { formatTime } from "@/lib/utils";
import { PatientBookingModal } from "./PatientBookingModal";
import { createGoogleCalendarUrl } from "@/lib/calendar";

interface PatientCitasViewProps {
  citas: any[];
  salas: any[];
  personal: any[];
  paciente?: any;
  paquetes?: any[];
  servicios?: any[];
}

export function PatientCitasView({ 
  citas, 
  salas, 
  personal,
  paciente,
  paquetes = [],
  servicios = []
}: PatientCitasViewProps) {
  const [filter, setFilter] = useState<"proximas" | "historial">("proximas");
  const [citasList, setCitasList] = useState<any[]>(citas);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [clinicConfig, setClinicConfig] = useState({
    nombreComercial: "AJ Fisioterapia",
    whatsapp: "+51 987 654 321",
    direccion: "Av. Guardia Civil 520, San Borja, Lima",
  });

  // Sincronizar citas si cambian props
  useEffect(() => {
    setCitasList(citas);
  }, [citas]);

  // Leer configuración de la clínica
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("clinic_config");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setClinicConfig((prev) => ({ ...prev, ...parsed }));
        } catch {}
      }

      // Si viene por query param ?reservar=1 o ?action=reservar, abrir modal inmediatamente
      const params = new URLSearchParams(window.location.search);
      if (params.get("reservar") === "1" || params.get("action") === "reservar") {
        setIsBookingOpen(true);
      }

      // Escuchar evento global desde el sidebar u otros módulos
      const handleOpenBooking = () => setIsBookingOpen(true);
      const handleCitaAgendada = (e: any) => {
        if (e.detail) {
          setCitasList((prev) => [e.detail, ...prev]);
        }
      };

      window.addEventListener("open-patient-booking", handleOpenBooking);
      window.addEventListener("cita-agendada", handleCitaAgendada);

      return () => {
        window.removeEventListener("open-patient-booking", handleOpenBooking);
        window.removeEventListener("cita-agendada", handleCitaAgendada);
      };
    }
  }, []);

  const proximas = citasList.filter((c) => c.estado === "PROGRAMADA" || c.estado === "CONFIRMADA");
  const historial = citasList.filter((c) => c.estado === "ATENDIDA" || c.estado === "CANCELADA");

  const cleanWhatsapp = clinicConfig.whatsapp ? clinicConfig.whatsapp.replace(/\D/g, "") : "51987654321";

  const renderCitaCard = (cita: any) => {
    const sala = salas.find((s) => s.id === cita.salaId) || cita.sala;
    const terapeuta = personal.find((u) => u.id === cita.terapeutaId) || cita.terapeuta;
    const fechaObj = new Date(cita.fechaHoraInicio);
    const fechaTexto = fechaObj.toLocaleDateString("es-PE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const isActiva = cita.estado === "PROGRAMADA" || cita.estado === "CONFIRMADA";

    const calendarEvent = {
      title: `Sesión Fisioterapia • ${clinicConfig.nombreComercial}`,
      description: `Sesión con ${terapeuta?.nombre || "Lic. Fisioterapeuta"} en ${sala?.nombre || "Sala"}. Traer ropa deportiva cómoda.`,
      location: clinicConfig.direccion,
      startDate: cita.fechaHoraInicio,
      endDate: cita.fechaHoraFin || new Date(fechaObj.getTime() + 45 * 60000).toISOString(),
    };

    return (
      <div
        key={cita.id}
        className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
          isActiva ? "border-slate-200 shadow-xs hover:border-teal-400" : "border-slate-100 bg-slate-50/50 opacity-80"
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
            isActiva ? "bg-teal-50 text-teal-800 border-teal-200" : "bg-slate-100 text-slate-500 border-slate-200"
          }`}>
            <span className="text-[10px] font-bold uppercase">{fechaObj.toLocaleDateString("es-PE", { month: "short" })}</span>
            <span className="text-base font-black leading-none">{fechaObj.getDate()}</span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 text-xs sm:text-sm capitalize">{fechaTexto}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  cita.estado === "CONFIRMADA"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : cita.estado === "PROGRAMADA"
                    ? "bg-teal-50 text-teal-700 border-teal-200"
                    : cita.estado === "ATENDIDA"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-300"
                }`}
              >
                {cita.estado === "ATENDIDA" ? "Completada" : cita.estado}
              </span>
              {cita.esReevaluacion && isActiva && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertTriangle className="w-3 h-3 text-amber-600" /> Hito Reevaluación
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-0.5">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formatTime(cita.fechaHoraInicio)} - {formatTime(cita.fechaHoraFin || new Date(fechaObj.getTime() + 45 * 60000))}
              </span>
              <span className="inline-flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-teal-600" />
                {terapeuta?.nombre || "Lic. Asignado"}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {sala?.nombre || "Sala"}
              </span>
            </div>

            {isActiva && (
              <div className="text-[11px] text-teal-700 bg-teal-50/60 px-2.5 py-0.5 rounded-md border border-teal-100/70 inline-block mt-0.5 font-medium">
                💡 Llegar 5 minutos antes con ropa deportiva ligera.
              </div>
            )}
          </div>
        </div>

        {/* Acciones del Paciente: Solo activas si la cita está pendiente */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {isActiva ? (
            <>
              <a
                href={createGoogleCalendarUrl(calendarEvent)}
                target="_blank"
                rel="noopener noreferrer"
                title="Añadir a Google Calendar"
                className="px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 hover:border-blue-300 transition flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                <span>Calendar</span>
              </a>

              <a
                href={`https://wa.me/${cleanWhatsapp}?text=Hola,%20soy%20el%20paciente%20${encodeURIComponent(paciente?.nombres ? `${paciente.nombres} ${paciente.apellidos}` : (paciente?.nombre || "Paciente"))}%20y%20quisiera%20consultar%20sobre%20mi%20cita%20del%20${encodeURIComponent(fechaTexto)}%20a%20las%20${formatTime(cita.fechaHoraInicio)}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                title="Coordinar o consultar por WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Coordinar</span>
              </a>
            </>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
              <Check className="w-3.5 h-3.5 text-slate-400" />
              Finalizada
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
              Mis Citas
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Horarios confirmados y salas asignadas para tu recuperación.
            </p>
          </div>

          {/* Botón Reservar */}
          <button
            type="button"
            onClick={() => setIsBookingOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Reservar Cita</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setFilter("proximas")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition -mb-px flex items-center gap-2 cursor-pointer ${
              filter === "proximas"
                ? "border-teal-600 text-teal-800"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <span>Próximas Sesiones</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-50 text-teal-700 font-black">
              {proximas.length}
            </span>
          </button>
          <button
            onClick={() => setFilter("historial")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition -mb-px flex items-center gap-2 cursor-pointer ${
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
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-xs">
                  <Calendar className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">No tienes citas programadas pendientes</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    Mantén la continuidad de tu rehabilitación física para consolidar el alivio del dolor y tu fuerza muscular.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agendar Próxima Sesión Ahora</span>
                </button>
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

      {/* Modal de Reserva In-App */}
      <PatientBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        paciente={paciente}
        paquetes={paquetes}
        terapeutas={personal?.filter((u: any) => u.rol === "TERAPEUTA" || !u.rol)}
        salas={salas}
        servicios={servicios}
        onSuccess={(nuevaCita) => {
          setCitasList((prev) => [nuevaCita, ...prev]);
        }}
      />
    </>
  );
}
