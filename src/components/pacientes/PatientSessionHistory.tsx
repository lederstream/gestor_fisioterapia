"use client";

import { useState, useMemo } from "react";
import { formatDateTime, formatDate, formatTime } from "@/lib/utils";
import { 
  Calendar, 
  Clock, 
  User, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  CalendarDays, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  BadgeCheck, 
  Sparkles 
} from "lucide-react";

interface PatientSessionHistoryProps {
  citas: any[];
  historialEva?: any[];
  pacienteNombre: string;
}

export function PatientSessionHistory({
  citas,
  historialEva = [],
  pacienteNombre,
}: PatientSessionHistoryProps) {
  const [selectedYear, setSelectedYear] = useState<string>("TODOS");
  const [selectedStatus, setSelectedStatus] = useState<string>("TODOS");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extraer todos los años presentes en las citas
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    citas.forEach((c) => {
      if (c.fechaHoraInicio) {
        const y = new Date(c.fechaHoraInicio).getFullYear().toString();
        if (!isNaN(Number(y))) yearsSet.add(y);
      }
    });
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [citas]);

  // Contadores y métricas globales
  const totalSesiones = citas.length;
  const sesionesAtendidas = citas.filter((c) => c.estado === "ATENDIDA").length;
  const sesionesPendientes = citas.filter((c) => c.estado === "PROGRAMADA" || c.estado === "CONFIRMADA").length;
  
  // Lista única de especialistas que han atendido o tienen cita con el paciente
  const especialistas = useMemo(() => {
    const map = new Map<string, { nombre: string; especialidad?: string; totalAtenciones: number }>();
    citas.forEach((c) => {
      const nombre = c.terapeuta?.nombre || "Terapeuta Clínico";
      const esp = c.terapeuta?.especialidad || "Lic. Fisioterapia";
      if (!map.has(nombre)) {
        map.set(nombre, { nombre, especialidad: esp, totalAtenciones: 1 });
      } else {
        map.get(nombre)!.totalAtenciones += 1;
      }
    });
    return Array.from(map.values());
  }, [citas]);

  // Filtrado de citas
  const citasFiltradas = useMemo(() => {
    return citas.filter((c) => {
      const d = new Date(c.fechaHoraInicio);
      const year = d.getFullYear().toString();

      if (selectedYear !== "TODOS" && year !== selectedYear) return false;
      if (selectedStatus !== "TODOS" && c.estado !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const terapeutaMatch = (c.terapeuta?.nombre || "").toLowerCase().includes(q);
        const especialidadMatch = (c.terapeuta?.especialidad || "").toLowerCase().includes(q);
        const salaMatch = (c.sala?.nombre || "").toLowerCase().includes(q);
        const tratamientoMatch = (c.evolucion?.tratamientoAplicado || "").toLowerCase().includes(q);
        const recepcionMatch = (c.creadoPorNombre || "").toLowerCase().includes(q) || (c.confirmadoPorNombre || "").toLowerCase().includes(q);
        return terapeutaMatch || especialidadMatch || salaMatch || tratamientoMatch || recepcionMatch;
      }

      return true;
    });
  }, [citas, selectedYear, selectedStatus, searchQuery]);

  // Helpers de visualización de estados
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "ATENDIDA":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Atendida
          </span>
        );
      case "CONFIRMADA":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Confirmada
          </span>
        );
      case "PROGRAMADA":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Programada
          </span>
        );
      case "CANCELADA":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Cancelada
          </span>
        );
      case "NO_ASISTIO":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            No Asistió
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            {estado}
          </span>
        );
    }
  };

  const formatearFechaCompleta = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-PE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
      {/* Título y Resumen */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
            <CalendarDays className="w-3.5 h-3.5 text-teal-600" />
            <span>Historial Clínico Multianual Oficial</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
            Historial Cronológico de Sesiones ({pacienteNombre})
          </h2>
          <p className="text-xs text-slate-500">
            Registro continuo y detallado a lo largo de todos los años con fecha, horario exacto, especialista tratante y evolución biomecánica.
          </p>
        </div>

        {/* Tarjetas de métricas rápidas */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full md:w-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center min-w-[90px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Sesiones</span>
            <span className="text-xl font-black text-slate-800">{totalSesiones}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center min-w-[90px]">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Atendidas</span>
            <span className="text-xl font-black text-emerald-800">{sesionesAtendidas}</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center min-w-[90px]">
            <span className="text-[10px] uppercase font-bold text-blue-700 block">Pendientes</span>
            <span className="text-xl font-black text-blue-800">{sesionesPendientes}</span>
          </div>
        </div>
      </div>

      {/* Especialistas que han atendido al paciente */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-teal-600" />
          Especialistas Médicos Tratantes a lo largo del tiempo:
        </span>
        <div className="flex flex-wrap gap-2 pt-1">
          {especialistas.map((esp, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2 shadow-2xs"
            >
              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-[10px]">
                {esp.nombre.replace("Lic. ", "").replace("Tec. ", "").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-slate-800 block text-xs">{esp.nombre}</span>
                <span className="text-[10px] text-slate-500">{esp.especialidad} • ({esp.totalAtenciones} cita/s)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Barra de Filtros por Año, Estado y Búsqueda */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2">
        {/* Selector de Años */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs font-bold text-slate-500 shrink-0 mr-1">Filtrar Año:</span>
          <button
            onClick={() => setSelectedYear("TODOS")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              selectedYear === "TODOS"
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Todos ({totalSesiones})
          </button>
          {availableYears.map((yr) => {
            const countYear = citas.filter((c) => new Date(c.fechaHoraInicio).getFullYear().toString() === yr).length;
            return (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  selectedYear === yr
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Año {yr} ({countYear})
              </button>
            );
          })}
        </div>

        {/* Búsqueda y Estado */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro de Estado */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="ATENDIDA">Solo Atendidas</option>
            <option value="CONFIRMADA">Confirmadas</option>
            <option value="PROGRAMADA">Programadas</option>
            <option value="CANCELADA">Canceladas</option>
            <option value="NO_ASISTIO">No Asistió</option>
          </select>

          {/* Búsqueda por texto */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar especialista, sala..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Sesiones Detalladas */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3.5"># Sesión</th>
                <th className="py-3 px-3.5">Fecha Completa y Año</th>
                <th className="py-3 px-3.5">Horario</th>
                <th className="py-3 px-3.5">Especialista / Fisioterapeuta</th>
                <th className="py-3 px-3.5">Sala</th>
                <th className="py-3 px-3.5">Estado</th>
                <th className="py-3 px-3.5">Evolución Clínica / Tratamiento</th>
                <th className="py-3 px-3.5">Recepción / Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {citasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No se encontraron sesiones para los filtros seleccionados ({selectedYear !== "TODOS" ? `Año ${selectedYear}` : "Todos los años"}).
                  </td>
                </tr>
              ) : (
                citasFiltradas.map((c, index) => {
                  const ev = c.evolucion;
                  const fechaObj = new Date(c.fechaHoraInicio);
                  const anio = fechaObj.getFullYear();

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Correlativo */}
                      <td className="py-3.5 px-3.5 font-bold text-teal-700 whitespace-nowrap">
                        Sesión #{citasFiltradas.length - index}
                      </td>

                      {/* Fecha y Año */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-800 capitalize block">
                          {formatearFechaCompleta(c.fechaHoraInicio)}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-teal-100">
                          Año {anio}
                        </span>
                      </td>

                      {/* Horario */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-semibold text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {formatTime(c.fechaHoraInicio)} - {formatTime(c.fechaHoraFin)}
                          </span>
                        </div>
                      </td>

                      {/* Terapeuta */}
                      <td className="py-3.5 px-3.5">
                        <div className="space-y-0.5 min-w-[160px]">
                          <span className="font-bold text-slate-800 block">
                            {c.terapeuta?.nombre || "Lic. Fisioterapia"}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {c.terapeuta?.especialidad || "Fisioterapia y Rehabilitación"}
                          </span>
                        </div>
                      </td>

                      {/* Sala */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 font-semibold text-slate-700 text-[11px] border border-slate-200">
                          {c.sala?.nombre || "Sala"}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        {getEstadoBadge(c.estado)}
                        {c.esReevaluacion && (
                          <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Reevaluación
                          </span>
                        )}
                      </td>

                      {/* Evolución Clínica */}
                      <td className="py-3.5 px-3.5 min-w-[220px]">
                        {ev ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-800">
                                EVA: {ev.evaDolorInicio}/10 → {ev.evaDolorFin}/10
                              </span>
                              {ev.evaDolorInicio > ev.evaDolorFin && (
                                <span className="text-[10px] font-bold text-emerald-600">
                                  (-{ev.evaDolorInicio - ev.evaDolorFin} pts)
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-2" title={ev.tratamientoAplicado}>
                              {ev.tratamientoAplicado}
                            </p>
                            {ev.notasReevaluacion && (
                              <p className="text-[10px] text-amber-800 italic bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block">
                                {ev.notasReevaluacion}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">
                            {c.estado === "PROGRAMADA" || c.estado === "CONFIRMADA"
                              ? "Evolución pendiente de sesión"
                              : "Sin evolución registrada"}
                          </span>
                        )}
                      </td>

                      {/* Recepcionista / Trazabilidad */}
                      <td className="py-3.5 px-3.5 text-[11px] whitespace-nowrap">
                        <div className="space-y-0.5 text-slate-600">
                          {c.confirmadoPorNombre ? (
                            <div>
                              <span className="text-[10px] text-slate-400 block">Aceptada por:</span>
                              <span className="font-semibold text-teal-700 block">{c.confirmadoPorNombre}</span>
                            </div>
                          ) : c.creadoPorNombre ? (
                            <div>
                              <span className="text-[10px] text-slate-400 block">Agendada por:</span>
                              <span className="font-semibold text-slate-700 block">{c.creadoPorNombre}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">Recepción Sede</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
