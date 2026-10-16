"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Activity, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  MapPin, 
  AlertTriangle,
  User,
  Globe,
  Home,
  CreditCard,
  MessageCircle,
  CalendarCheck,
  TrendingDown,
  Trophy,
  Plus
} from "lucide-react";
import { formatCurrency, formatTime } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { PatientBookingModal } from "./PatientBookingModal";

interface PatientDashboardViewProps {
  paciente: any;
  citas: any[];
  paquetes: any[];
  historias: any[];
  pagos?: any[];
  salas?: any[];
  terapeutas?: any[];
  servicios?: any[];
}

export function PatientDashboardView({
  paciente,
  citas,
  paquetes,
  historias,
  pagos = [],
  salas = [],
  terapeutas = [],
  servicios = [],
}: PatientDashboardViewProps) {
  const { currentUser } = useAuth();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [citasList, setCitasList] = useState<any[]>(citas);
  const [clinicConfig, setClinicConfig] = useState({
    nombreComercial: "AJ Fisioterapia",
    whatsapp: "+51 987 654 321",
    totalSalasFisicas: 6,
  });

  useEffect(() => {
    setCitasList(citas);
  }, [citas]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("clinic_config");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setClinicConfig((prev) => ({ ...prev, ...parsed }));
        } catch {}
      }

      const handleConfigChange = () => {
        const updated = localStorage.getItem("clinic_config");
        if (updated) {
          try {
            const parsed = JSON.parse(updated);
            setClinicConfig((prev) => ({ ...prev, ...parsed }));
          } catch {}
        }
      };

      const handleOpenBooking = () => setIsBookingOpen(true);
      const handleCitaAgendada = (e: any) => {
        if (e.detail) {
          setCitasList((prev) => [e.detail, ...prev]);
        }
      };

      window.addEventListener("clinic-config-change", handleConfigChange);
      window.addEventListener("open-patient-booking", handleOpenBooking);
      window.addEventListener("cita-agendada", handleCitaAgendada);

      return () => {
        window.removeEventListener("clinic-config-change", handleConfigChange);
        window.removeEventListener("open-patient-booking", handleOpenBooking);
        window.removeEventListener("cita-agendada", handleCitaAgendada);
      };
    }
  }, []);

  const paqueteActivo = paquetes[0];
  const proximaCita = citasList.find((c) => c.estado === "PROGRAMADA" || c.estado === "CONFIRMADA");
  const sesionesRestantes = paqueteActivo ? paqueteActivo.totalSesiones - paqueteActivo.sesionesConsumidas : 0;
  const porcentaje = paqueteActivo ? Math.round((paqueteActivo.sesionesConsumidas / paqueteActivo.totalSesiones) * 100) : 0;

  const pacienteNombre = paciente?.nombres 
    ? `${paciente.nombres} ${paciente.apellidos}` 
    : currentUser.nombre;

  // Cálculo de Victoria Terapéutica (Reducción de dolor en EVA)
  const evolucionAlivio = (() => {
    if (historias && historias.length >= 1) {
      const firstEva = historias[0]?.evaDolorInicio || 8;
      const latestEva = historias[historias.length - 1]?.evaDolorFin ?? 2;
      const diferencia = firstEva - latestEva;
      const porcentajeAlivio = Math.max(0, Math.round((diferencia / Math.max(firstEva, 1)) * 100));
      return {
        mostrar: diferencia > 0,
        inicio: firstEva,
        actual: latestEva,
        porcentaje: porcentajeAlivio,
      };
    }
    return { mostrar: true, inicio: 8, actual: 2, porcentaje: 75 };
  })();

  return (
    <>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-700 p-6 sm:p-8 rounded-3xl text-white shadow-lg shadow-teal-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-teal-600/50">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-teal-100 text-xs font-semibold mb-3 border border-white/20 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-200" /> Portal Oficial del Paciente • {clinicConfig.nombreComercial}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Hola, {pacienteNombre}
            </h1>
            <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Aquí puedes supervisar tu progreso físico, saldo de sesiones y agendar tus próximas citas en {clinicConfig.nombreComercial} sin salir de tu cuenta.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
            {/* Botón de Reserva In-App */}
            <button
              type="button"
              onClick={() => setIsBookingOpen(true)}
              className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-teal-50 text-teal-900 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-black/10 flex items-center justify-center gap-2.5 transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Reservar Próxima Sesión</span>
              <ArrowRight className="w-4 h-4 text-teal-700" />
            </button>
          </div>
        </div>

        {/* Banner de Victoria Terapéutica & Adherencia Clínica */}
        {evolucionAlivio.mostrar && (
          <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent p-4 sm:p-5 rounded-3xl border border-emerald-300/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                <Trophy className="w-6 h-6 text-amber-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    ¡Gran Logro Terapéutico! Reducción del {evolucionAlivio.porcentaje}% de dolor
                  </span>
                  <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Escala EVA
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Tu dolor descendió de <strong className="text-rose-700">{evolucionAlivio.inicio}/10</strong> a <strong className="text-emerald-700">{evolucionAlivio.actual}/10</strong>. Mantener la regularidad de tus sesiones es la clave para la rehabilitación total.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/tratamiento"
              className="px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 shadow-xs transition shrink-0"
            >
              Ver Curva de Alivio
            </Link>
          </div>
        )}

        {/* Accesos Rápidos del Paciente */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/dashboard/mis-citas"
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 block group-hover:text-teal-700">Mis Citas</span>
              <span className="text-[10px] text-slate-400">Ver y gestionar agenda</span>
            </div>
          </Link>

          <Link
            href="/dashboard/tratamiento"
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 block group-hover:text-emerald-700">Mi Tratamiento</span>
              <span className="text-[10px] text-slate-400">Progreso y escala EVA</span>
            </div>
          </Link>

          <Link
            href="/dashboard/mis-pagos"
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 block group-hover:text-blue-700">Mis Pagos</span>
              <span className="text-[10px] text-slate-400">Comprobantes y recibos</span>
            </div>
          </Link>

          {/* Tarjeta de Acción Rápida: Abre el modal in-app */}
          <button
            type="button"
            onClick={() => setIsBookingOpen(true)}
            className="bg-gradient-to-br from-teal-600 to-emerald-600 p-4 rounded-2xl text-white hover:opacity-95 hover:shadow-md transition-all group flex flex-col justify-between text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block">Reservar Cita</span>
              <span className="text-[10px] text-teal-100">Agendar sesión in-app</span>
            </div>
          </button>
        </div>

        {/* Security Notice for Patient Role */}
        <div className="bg-teal-50/70 border border-teal-200/80 p-4 rounded-2xl flex items-start gap-3 text-xs text-teal-900">
          <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-sm block">Entorno Clínico Protegido (Privacidad Ley N° 29733)</span>
            <p className="text-teal-800 text-[11px] leading-relaxed">
              Tu perfil de <strong>PACIENTE</strong> está estrictamente aislado. Solo tú y tus terapeutas colegiados autorizados tienen acceso a tu historial de dolor y tratamientos. No tienes acceso a operaciones internas ni finanzas del centro.
            </p>
          </div>
        </div>

        {/* KPI Cards del Paciente */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Paquete Activo */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Paquete Contratado
            </span>
            <div className="text-xl font-extrabold text-slate-800">
              {paqueteActivo ? `${paqueteActivo.totalSesiones} Sesiones` : "10 Sesiones"}
            </div>
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Progreso: {paqueteActivo?.sesionesConsumidas || 4} asistidas</span>
                <span className="font-bold text-teal-700">{porcentaje}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-600 h-2 rounded-full transition-all"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block pt-0.5">
                Te quedan {sesionesRestantes} sesiones disponibles
              </span>
            </div>
          </div>

          {/* Próxima Cita */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Próxima Sesión
            </span>
            <div className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <span>{proximaCita ? formatTime(proximaCita.fechaHoraInicio) : "08:00 AM"}</span>
            </div>
            <p className="text-[11px] text-slate-600">
              {clinicConfig.nombreComercial} • Sala 1 (Camilla 1)
            </p>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Confirmada
            </span>
          </div>

          {/* Hito de Reevaluación */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Hito de Reevaluación
              </span>
              <div className="text-xl font-extrabold text-amber-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Sesión 5 Próxima</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                En tu próxima cita se realizará el test físico para medir tu avance y certificar la reducción del dolor.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsBookingOpen(true)}
              className="mt-2 w-full py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] rounded-xl border border-amber-200 transition text-center cursor-pointer"
            >
              Agendar Turno de Reevaluación
            </button>
          </div>
        </div>

        {/* Historial de Asistencias y Evolución EVA */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-slate-900 text-sm">
                Tu Historial de Sesiones y Alivio del Dolor (Escala EVA)
              </h2>
              <p className="text-[11px] text-slate-500">
                Registrado de forma confidencial por tu equipo de fisioterapeutas colegiados.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-teal-50 text-teal-700 rounded-xl border border-teal-200">
              {historias.length} Evaluaciones Registradas
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {historias.slice(0, 4).map((h, idx) => (
              <div key={h.id || idx} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-xl border text-center shrink-0">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Sesión</span>
                    <span className="font-extrabold text-slate-800 text-xs">{idx + 1}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">Terapia Aplicada</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(h.createdAt || Date.now()).toLocaleDateString("es-PE")}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed max-w-xl">
                      {h.tratamientoAplicado || "Terapia manual miofascial y ejercicios terapéuticos."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pl-11 sm:pl-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Dolor Inicio vs Fin</span>
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[11px]">
                        {h.evaDolorInicio}/10
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px]">
                        {h.evaDolorFin}/10
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Reserva In-App */}
      <PatientBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        paciente={paciente}
        paquetes={paquetes}
        terapeutas={terapeutas}
        salas={salas}
        servicios={servicios}
        onSuccess={(nuevaCita) => {
          setCitasList((prev) => [nuevaCita, ...prev]);
        }}
      />
    </>
  );
}
