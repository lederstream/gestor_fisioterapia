"use client";

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
  Home
} from "lucide-react";
import { formatCurrency, formatTime } from "@/lib/utils";

interface PatientDashboardViewProps {
  paciente: any;
  citas: any[];
  paquetes: any[];
  historias: any[];
}

export function PatientDashboardView({
  paciente,
  citas,
  paquetes,
  historias,
}: PatientDashboardViewProps) {
  const paqueteActivo = paquetes[0];
  const proximaCita = citas.find((c) => c.estado === "PROGRAMADA" || c.estado === "CONFIRMADA");
  const sesionesRestantes = paqueteActivo ? paqueteActivo.totalSesiones - paqueteActivo.sesionesConsumidas : 0;
  const porcentaje = paqueteActivo ? Math.round((paqueteActivo.sesionesConsumidas / paqueteActivo.totalSesiones) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-700 p-6 sm:p-8 rounded-3xl text-white shadow-lg shadow-teal-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-teal-600/50">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-teal-100 text-xs font-semibold mb-3 border border-white/20 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-200" /> Portal Oficial del Paciente • Sede San Borja
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hola, {paciente?.nombres || "Renato"} {paciente?.apellidos || "Salazar"}
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            Aquí puedes consultar el avance de tu tratamiento fisioterapéutico, saldo de sesiones y horarios programados con tu terapeuta.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <Link
            href="/"
            className="w-full sm:w-auto px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center justify-center gap-2 transition backdrop-blur-xs"
            title="Ir a la portada del sitio web"
          >
            <Globe className="w-4 h-4 text-teal-200" />
            <span>Volver a la Web</span>
          </Link>
          <Link
            href="/reservas"
            className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-teal-50 text-teal-900 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition"
          >
            <span>Reservar Nueva Sesión</span>
            <ArrowRight className="w-4 h-4 text-teal-700" />
          </Link>
        </div>
      </div>

      {/* Security Notice for Patient Role */}
      <div className="bg-teal-50/70 border border-teal-200/80 p-4 rounded-2xl flex items-start gap-3 text-xs text-teal-900">
        <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-sm block">Entorno Clínico Protegido (Privacidad Ley N° 29733)</span>
          <p className="text-teal-800 text-[11px] leading-relaxed">
            Tu perfil de <strong>PACIENTE</strong> está estrictamente aislado. Solo tú y tus terapeutas autorizados en San Borja tienen acceso a tu historial de dolor y tratamientos. No tienes acceso a operaciones internas ni finanzas del centro.
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
            Sede San Borja • Sala 1 (Camilla 1)
          </p>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Confirmada
          </span>
        </div>

        {/* Hito de Reevaluación */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Hito de Reevaluación
          </span>
          <div className="text-xl font-extrabold text-amber-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Sesión 5 Próxima</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            En tu próxima cita se realizará el test físico para medir tu avance y certificar la reducción del dolor.
          </p>
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
  );
}
