"use client";

import { useState, useMemo } from "react";
import { formatTime } from "@/lib/utils";
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
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Printer,
  TrendingDown,
  AlertTriangle,
  Stethoscope,
  MapPin,
  Check,
  Maximize2,
  Minimize2
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
  const [expandedSessionIds, setExpandedSessionIds] = useState<Set<string>>(new Set());

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

  // Contadores y métricas globales para visión ejecutiva
  const totalSesiones = citas.length;
  const sesionesAtendidas = citas.filter((c) => c.estado === "ATENDIDA").length;
  const sesionesPendientes = citas.filter((c) => c.estado === "PROGRAMADA" || c.estado === "CONFIRMADA").length;
  
  // Cálculo de reducción promedio de dolor EVA
  const evolucionesValidas = citas.filter((c) => c.evolucion && c.evolucion.evaDolorInicio !== undefined);
  const reduccionPromedioEva = useMemo(() => {
    if (evolucionesValidas.length === 0) return null;
    const deltas = evolucionesValidas.map((c) => c.evolucion.evaDolorInicio - c.evolucion.evaDolorFin);
    const suma = deltas.reduce((acc, curr) => acc + curr, 0);
    return (suma / evolucionesValidas.length).toFixed(1);
  }, [evolucionesValidas]);

  // Filtrado de citas con búsqueda instantánea
  const citasFiltradas = useMemo(() => {
    return citas.filter((c) => {
      const d = new Date(c.fechaHoraInicio);
      const year = d.getFullYear().toString();

      if (selectedYear !== "TODOS" && year !== selectedYear) return false;
      
      if (selectedStatus !== "TODOS") {
        if (selectedStatus === "REEVALUACION") {
          if (!c.esReevaluacion) return false;
        } else if (c.estado !== selectedStatus) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const terapeutaMatch = (c.terapeuta?.nombre || "").toLowerCase().includes(q);
        const especialidadMatch = (c.terapeuta?.especialidad || "").toLowerCase().includes(q);
        const salaMatch = (c.sala?.nombre || "").toLowerCase().includes(q);
        const tratamientoMatch = (c.evolucion?.tratamientoAplicado || "").toLowerCase().includes(q);
        const notasMatch = (c.evolucion?.notasReevaluacion || "").toLowerCase().includes(q);
        const recepcionMatch = (c.creadoPorNombre || "").toLowerCase().includes(q) || (c.confirmadoPorNombre || "").toLowerCase().includes(q);
        return terapeutaMatch || especialidadMatch || salaMatch || tratamientoMatch || notasMatch || recepcionMatch;
      }

      return true;
    });
  }, [citas, selectedYear, selectedStatus, searchQuery]);

  // Manejo de expansión individual y masiva
  const toggleRow = (id: string) => {
    setExpandedSessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set(citasFiltradas.map((c) => c.id));
    setExpandedSessionIds(allIds);
  };

  const collapseAll = () => {
    setExpandedSessionIds(new Set());
  };

  const allExpanded = citasFiltradas.length > 0 && expandedSessionIds.size >= citasFiltradas.length;

  // Formateadores de fecha compactos
  const formatearFechaCorta = (iso: string) => {
    const d = new Date(iso);
    const dia = d.getDate().toString().padStart(2, "0");
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"];
    const mes = meses[d.getMonth()];
    const anio = d.getFullYear();
    return `${dia} ${mes} ${anio}`;
  };

  const obtenerDiaSemana = (iso: string) => {
    const d = new Date(iso);
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return dias[d.getDay()];
  };

  // Helper de colores EVA para visualización inmediata
  const getEvaColorClass = (val: number) => {
    if (val === 0) return "bg-emerald-500 text-white";
    if (val <= 3) return "bg-teal-500 text-white";
    if (val <= 6) return "bg-amber-500 text-white";
    if (val <= 8) return "bg-orange-500 text-white";
    return "bg-rose-600 text-white";
  };

  const getEvaLabel = (val: number) => {
    if (val === 0) return "Sin Dolor";
    if (val <= 3) return "Dolor Leve";
    if (val <= 6) return "Moderado";
    if (val <= 8) return "Severo";
    return "Máximo";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6 space-y-5">
      {/* Cabecera Ejecutiva: Título y Métricas Clave */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200">
              <CalendarDays className="w-3 h-3 text-teal-600" />
              <span>Cronología Multianual</span>
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              {citasFiltradas.length} de {totalSesiones} registradas
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span>Historial Clínico de Sesiones</span>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50/80 px-2 py-0.5 rounded-lg border border-teal-100">
              {pacienteNombre}
            </span>
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Monitoreo continuo de asistencia, evolución del dolor (EVA), técnicas aplicadas y trazabilidad operativa.
          </p>
        </div>

        {/* Tarjetas KPI compactas para dueños y terapeutas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto shrink-0">
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl px-3 py-2 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total</span>
            <span className="text-base font-black text-slate-800">{totalSesiones}</span>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-3 py-2 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">Atendidas</span>
            <span className="text-base font-black text-emerald-800">{sesionesAtendidas}</span>
          </div>
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl px-3 py-2 text-center">
            <span className="text-[10px] uppercase font-bold text-blue-700 block tracking-wider">Pendientes</span>
            <span className="text-base font-black text-blue-800">{sesionesPendientes}</span>
          </div>
          <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl px-3 py-2 text-center">
            <span className="text-[10px] uppercase font-bold text-teal-700 block tracking-wider">Alivio EVA</span>
            <span className="text-base font-black text-teal-800">
              {reduccionPromedioEva ? `-${reduccionPromedioEva} pts` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros Inteligente: Año, Estado, Búsqueda y Expansión Masiva */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
        {/* Selector de Años */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Año:</span>
          </span>
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
                {yr} ({countYear})
              </button>
            );
          })}
        </div>

        {/* Acciones y Filtros Rápidos */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro de Estado */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="ATENDIDA">Solo Atendidas ({sesionesAtendidas})</option>
            <option value="CONFIRMADA">Confirmadas</option>
            <option value="PROGRAMADA">Programadas</option>
            <option value="REEVALUACION">Reevaluaciones Obligatorias</option>
            <option value="CANCELADA">Canceladas</option>
            <option value="NO_ASISTIO">No Asistió</option>
          </select>

          {/* Buscador Rápido */}
          <div className="relative flex-1 sm:w-52">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar técnica, terapeuta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Toggle Expandir / Colapsar Todo */}
          <button
            onClick={allExpanded ? collapseAll : expandAll}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            title={allExpanded ? "Colapsar todas las filas" : "Expandir todas las filas"}
          >
            {allExpanded ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Colapsar</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Expandir Todo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* TABLA OPTIMIZADA: DISEÑADA PARA CABER AL 100% EN PANTALLA SIN SCROLL HORIZONTAL */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
        <div className="w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3 w-[15%]">Sesión / Estado</th>
                <th className="py-3 px-3 w-[18%]">Fecha y Horario</th>
                <th className="py-3 px-3 w-[20%]">Especialista & Sala</th>
                <th className="py-3 px-3 w-[15%] text-center">Dolor EVA</th>
                <th className="py-3 px-3 w-[24%]">Tratamiento Clínico</th>
                <th className="py-3 px-3 w-[8%] text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {citasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs space-y-1">
                    <AlertCircle className="w-6 h-6 mx-auto text-slate-300" />
                    <p className="font-semibold text-slate-500">No se encontraron sesiones registradas</p>
                    <p className="text-[11px] text-slate-400">
                      Pruebe cambiando los filtros de año o estado ({selectedYear !== "TODOS" ? `Año ${selectedYear}` : "Todos los años"}).
                    </p>
                  </td>
                </tr>
              ) : (
                citasFiltradas.map((c, index) => {
                  const ev = c.evolucion;
                  const isExpanded = expandedSessionIds.has(c.id);
                  const correlativo = citasFiltradas.length - index;
                  const terapeutaNombre = c.terapeuta?.nombre || "Terapeuta Clínico";
                  const salaNombre = c.sala?.nombre || "Sala de Atención";

                  return (
                    <tr
                      key={c.id}
                      className={`group transition-colors ${
                        isExpanded ? "bg-teal-50/30" : "hover:bg-slate-50/70"
                      }`}
                    >
                      <td colSpan={6} className="p-0">
                        {/* Fila Principal Resumen (Siempre visible en 1 pantalla) */}
                        <div 
                          onClick={() => toggleRow(c.id)}
                          className="flex items-center py-3 px-3 cursor-pointer select-none"
                        >
                          {/* Columna 1: Sesión & Estado (15%) */}
                          <div className="w-[15%] pr-2 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-slate-900 text-xs tracking-tight">
                                #{correlativo}
                              </span>
                              {c.esReevaluacion && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                                  Hito 5
                                </span>
                              )}
                            </div>
                            <div>
                              {c.estado === "ATENDIDA" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Atendida
                                </span>
                              )}
                              {c.estado === "CONFIRMADA" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  Confirmada
                                </span>
                              )}
                              {c.estado === "PROGRAMADA" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                  Programada
                                </span>
                              )}
                              {c.estado === "CANCELADA" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                  Cancelada
                                </span>
                              )}
                              {c.estado === "NO_ASISTIO" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                  No Asistió
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Columna 2: Fecha y Horario (18%) */}
                          <div className="w-[18%] pr-2">
                            <span className="font-bold text-slate-800 block text-xs">
                              {formatearFechaCorta(c.fechaHoraInicio)}
                            </span>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 font-medium">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>
                                {formatTime(c.fechaHoraInicio)}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-[10px] text-slate-400">{obtenerDiaSemana(c.fechaHoraInicio).slice(0, 3)}</span>
                            </div>
                          </div>

                          {/* Columna 3: Especialista y Sala (20%) */}
                          <div className="w-[20%] pr-2">
                            <span className="font-semibold text-slate-800 block text-xs truncate" title={terapeutaNombre}>
                              {terapeutaNombre}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                                {salaNombre}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="truncate">{c.terapeuta?.especialidad || "Fisioterapia"}</span>
                            </div>
                          </div>

                          {/* Columna 4: Dolor EVA (15%) - Impacto Visual Directo */}
                          <div className="w-[15%] pr-2 flex flex-col items-center justify-center">
                            {ev ? (
                              <div className="flex items-center gap-1.5">
                                <div className="flex items-center gap-1">
                                  <span
                                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shadow-2xs ${getEvaColorClass(
                                      ev.evaDolorInicio
                                    )}`}
                                    title={`EVA Inicial: ${ev.evaDolorInicio}/10 (${getEvaLabel(ev.evaDolorInicio)})`}
                                  >
                                    {ev.evaDolorInicio}
                                  </span>
                                  <span className="text-slate-400 font-bold text-xs">→</span>
                                  <span
                                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shadow-2xs ${getEvaColorClass(
                                      ev.evaDolorFin
                                    )}`}
                                    title={`EVA Final: ${ev.evaDolorFin}/10 (${getEvaLabel(ev.evaDolorFin)})`}
                                  >
                                    {ev.evaDolorFin}
                                  </span>
                                </div>
                                {ev.evaDolorInicio > ev.evaDolorFin && (
                                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100">
                                    -{ev.evaDolorInicio - ev.evaDolorFin}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                {c.estado === "PROGRAMADA" || c.estado === "CONFIRMADA"
                                  ? "Pendiente"
                                  : "Sin registro"}
                              </span>
                            )}
                          </div>

                          {/* Columna 5: Tratamiento Clínico (24%) */}
                          <div className="w-[24%] pr-2">
                            {ev ? (
                              <div>
                                <p className="text-[11px] text-slate-700 line-clamp-2 leading-relaxed" title={ev.tratamientoAplicado}>
                                  {ev.tratamientoAplicado}
                                </p>
                                {ev.notasReevaluacion && (
                                  <span className="inline-block mt-0.5 text-[9px] font-bold text-amber-800 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                                    Con notas clínicas
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                {c.estado === "PROGRAMADA" || c.estado === "CONFIRMADA"
                                  ? "Esperando inicio de sesión"
                                  : "No se aplicó tratamiento"}
                              </span>
                            )}
                          </div>

                          {/* Columna 6: Detalle / Acordeón (8%) */}
                          <div className="w-[8%] text-right flex items-center justify-end gap-1.5">
                            <span className="text-[10px] font-bold text-teal-700 hidden sm:inline">
                              {isExpanded ? "Cerrar" : "Ver"}
                            </span>
                            <div className={`p-1 rounded-lg transition-transform duration-200 ${isExpanded ? "bg-teal-100 text-teal-800 rotate-180" : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"}`}>
                              <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>

                        {/* PANEL EXPANDIBLE DE DETALLE PROFUNDO (Cuando el usuario desea inspeccionar notas completas) */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 bg-gradient-to-b from-teal-50/40 to-slate-50/80 border-t border-teal-100/60 animate-in fade-in duration-150">
                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              
                              {/* 1. Evolución de Dolor EVA & Métricas */}
                              <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-100 pb-3 md:pb-0 md:pr-4">
                                <span className="font-extrabold text-[11px] text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                                  <span>Evaluación del Dolor (EVA)</span>
                                </span>
                                
                                {ev ? (
                                  <div className="space-y-2.5 pt-1">
                                    <div className="grid grid-cols-2 gap-2 text-center">
                                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Pre-Sesión</span>
                                        <span className="text-base font-black text-slate-800">{ev.evaDolorInicio}/10</span>
                                        <span className="text-[10px] text-slate-500 block">{getEvaLabel(ev.evaDolorInicio)}</span>
                                      </div>
                                      <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200/80">
                                        <span className="text-[10px] text-emerald-600 font-bold block uppercase">Post-Sesión</span>
                                        <span className="text-base font-black text-emerald-800">{ev.evaDolorFin}/10</span>
                                        <span className="text-[10px] text-emerald-600 block">{getEvaLabel(ev.evaDolorFin)}</span>
                                      </div>
                                    </div>
                                    <div className="text-[11px] bg-slate-50 p-2 rounded-lg text-slate-600 flex items-center justify-between">
                                      <span>Alivio inmediato:</span>
                                      <span className="font-bold text-emerald-700">
                                        {ev.evaDolorInicio - ev.evaDolorFin > 0 
                                          ? `Reducción de ${ev.evaDolorInicio - ev.evaDolorFin} puntos`
                                          : "Dolor estable"}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-slate-400 italic text-[11px] pt-1">
                                    Sin mediciones registradas para esta sesión.
                                  </p>
                                )}
                              </div>

                              {/* 2. Tratamiento Aplicado y Reevaluación */}
                              <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-100 pb-3 md:pb-0 md:pr-4">
                                <span className="font-extrabold text-[11px] text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                                  <span>Tratamiento y Técnicas</span>
                                </span>
                                
                                {ev ? (
                                  <div className="space-y-2 pt-1">
                                    <div>
                                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Técnica aplicada:</span>
                                      <p className="text-slate-700 text-xs leading-relaxed mt-0.5 whitespace-pre-wrap">
                                        {ev.tratamientoAplicado}
                                      </p>
                                    </div>

                                    {ev.notasReevaluacion && (
                                      <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-lg text-amber-900">
                                        <span className="text-[10px] font-black uppercase block tracking-wider text-amber-800">
                                          Evaluación Funcional / Hito 5:
                                        </span>
                                        <p className="text-[11px] mt-0.5 leading-relaxed font-medium">
                                          {ev.notasReevaluacion}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-slate-400 italic text-[11px] pt-1">
                                    Tratamiento pendiente de ejecución.
                                  </p>
                                )}
                              </div>

                              {/* 3. Trazabilidad Operativa y Recepción */}
                              <div className="space-y-2">
                                <span className="font-extrabold text-[11px] text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                                  <span>Trazabilidad y Sede</span>
                                </span>

                                <div className="space-y-2 pt-1 text-[11px]">
                                  <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-lg">
                                    <span>Especialista asignado:</span>
                                    <span className="font-bold text-slate-800">{terapeutaNombre}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-lg">
                                    <span>Espacio físico:</span>
                                    <span className="font-semibold text-slate-700">{salaNombre}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-lg">
                                    <span>Gestión / Recepción:</span>
                                    <span className="font-semibold text-teal-700">
                                      {c.confirmadoPorNombre || c.creadoPorNombre || "Recepción Principal"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </div>
                        )}
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
