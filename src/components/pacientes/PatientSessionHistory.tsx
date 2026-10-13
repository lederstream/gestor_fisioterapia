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
  Sparkles,
  FileText,
  Printer,
  TrendingDown,
  AlertTriangle,
  Stethoscope,
  MapPin,
  Check,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  X,
  Columns,
  Table as TableIcon
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
  const [density, setDensity] = useState<"comoda" | "compacta">("compacta");
  const [viewMode, setViewMode] = useState<"tabla" | "split">("tabla");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

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
  
  // Reducción promedio de dolor EVA
  const evolucionesValidas = citas.filter((c) => c.evolucion && c.evolucion.evaDolorInicio !== undefined);
  const reduccionPromedioEva = useMemo(() => {
    if (evolucionesValidas.length === 0) return null;
    const deltas = evolucionesValidas.map((c) => c.evolucion.evaDolorInicio - c.evolucion.evaDolorFin);
    const suma = deltas.reduce((acc, curr) => acc + curr, 0);
    return (suma / evolucionesValidas.length).toFixed(1);
  }, [evolucionesValidas]);

  // Filtrado de citas
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

  // Sesión actualmente seleccionada para inspección
  const activeSessionIndex = citasFiltradas.findIndex((c) => c.id === selectedSessionId);
  const activeSession = activeSessionIndex !== -1 
    ? citasFiltradas[activeSessionIndex] 
    : (citasFiltradas.length > 0 ? citasFiltradas[0] : null);

  const handleSelectSession = (id: string) => {
    setSelectedSessionId(id);
    if (viewMode === "tabla") {
      setIsDrawerOpen(true);
    }
  };

  const handlePrevSession = () => {
    if (activeSessionIndex > 0) {
      setSelectedSessionId(citasFiltradas[activeSessionIndex - 1].id);
    }
  };

  const handleNextSession = () => {
    if (activeSessionIndex < citasFiltradas.length - 1) {
      setSelectedSessionId(citasFiltradas[activeSessionIndex + 1].id);
    }
  };

  // Formateadores compactos
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
    const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    return dias[d.getDay()];
  };

  const getEvaColorClass = (val: number) => {
    if (val === 0) return "bg-emerald-500 text-white";
    if (val <= 3) return "bg-teal-500 text-white";
    if (val <= 6) return "bg-amber-500 text-white";
    if (val <= 8) return "bg-orange-500 text-white";
    return "bg-rose-600 text-white";
  };

  const getEvaLabel = (val: number) => {
    if (val === 0) return "Sin Dolor";
    if (val <= 3) return "Leve";
    if (val <= 6) return "Moderado";
    if (val <= 8) return "Severo";
    return "Intenso";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4">
      {/* Cabecera Ejecutiva: Título y Métricas Clave */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200">
              <CalendarDays className="w-3 h-3 text-teal-600" />
              <span>Cronología Multianual</span>
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              {citasFiltradas.length} de {totalSesiones} registradas
            </span>
          </div>
          <h2 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span>Historial Clínico de Sesiones</span>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50/80 px-2 py-0.5 rounded-lg border border-teal-100">
              {pacienteNombre}
            </span>
          </h2>
        </div>

        {/* Tarjetas KPI compactas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto shrink-0">
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-center">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Total</span>
            <span className="text-sm font-black text-slate-800">{totalSesiones}</span>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-2.5 py-1.5 text-center">
            <span className="text-[9px] uppercase font-bold text-emerald-700 block tracking-wider">Atendidas</span>
            <span className="text-sm font-black text-emerald-800">{sesionesAtendidas}</span>
          </div>
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl px-2.5 py-1.5 text-center">
            <span className="text-[9px] uppercase font-bold text-blue-700 block tracking-wider">Pendientes</span>
            <span className="text-sm font-black text-blue-800">{sesionesPendientes}</span>
          </div>
          <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl px-2.5 py-1.5 text-center">
            <span className="text-[9px] uppercase font-bold text-teal-700 block tracking-wider">Alivio EVA</span>
            <span className="text-sm font-black text-teal-800">
              {reduccionPromedioEva ? `-${reduccionPromedioEva} pts` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros, Vistas y Densidad */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Selector de Años */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-bold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Año:</span>
          </span>
          <button
            onClick={() => setSelectedYear("TODOS")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
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
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
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
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-hidden"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="ATENDIDA">Solo Atendidas ({sesionesAtendidas})</option>
            <option value="CONFIRMADA">Confirmadas</option>
            <option value="PROGRAMADA">Programadas</option>
            <option value="REEVALUACION">Reevaluaciones Hito 5</option>
            <option value="CANCELADA">Canceladas</option>
            <option value="NO_ASISTIO">No Asistió</option>
          </select>

          {/* Buscador Rápido */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar técnica, terapeuta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
            />
          </div>

          {/* Alternar Vista: Tabla Completa vs Vista Dividida (Split) */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode("tabla")}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === "tabla" ? "bg-white text-teal-800 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Vista de Tabla Completa con Inspector Lateral"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setViewMode("split");
                if (!selectedSessionId && citasFiltradas.length > 0) {
                  setSelectedSessionId(citasFiltradas[0].id);
                }
              }}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === "split" ? "bg-white text-teal-800 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Vista Dividida (Master-Detail): Tabla + Ficha de Sesión al costado"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Selector de Densidad */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-0.5 text-[11px] font-bold text-slate-600">
            <button
              onClick={() => setDensity("comoda")}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                density === "comoda" ? "bg-white text-teal-800 shadow-2xs font-bold" : "hover:text-slate-900"
              }`}
            >
              Cómoda
            </button>
            <button
              onClick={() => setDensity("compacta")}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                density === "compacta" ? "bg-teal-600 text-white shadow-2xs font-bold" : "hover:text-slate-900"
              }`}
            >
              Compacta
            </button>
          </div>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL: SEGÚN MODO TABLA O SPLIT VIEW */}
      <div className={`grid gap-4 ${viewMode === "split" ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"}`}>
        
        {/* PANEL IZQUIERDO: TABLA DE SESIONES (ESTABLE, SIN SALTOS VERTICALES) */}
        <div className={`border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs ${viewMode === "split" ? "lg:col-span-7" : "w-full"}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px] select-none">
                <tr>
                  <th className="py-2.5 px-3"># / Estado</th>
                  <th className="py-2.5 px-3">Fecha y Hora</th>
                  <th className="py-2.5 px-3">Especialista & Box</th>
                  <th className="py-2.5 px-3 text-center">Dolor EVA</th>
                  {viewMode === "tabla" && (
                    <th className="py-2.5 px-3">Tratamiento Clínico</th>
                  )}
                  <th className="py-2.5 px-3 text-right">Ficha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {citasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={viewMode === "tabla" ? 6 : 5} className="py-12 text-center text-slate-400 text-xs space-y-1">
                      <AlertCircle className="w-6 h-6 mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-500">No se encontraron sesiones registradas</p>
                      <p className="text-[11px] text-slate-400">
                        Pruebe cambiando los filtros de año o estado.
                      </p>
                    </td>
                  </tr>
                ) : (
                  citasFiltradas.map((c, index) => {
                    const ev = c.evolucion;
                    const isSelected = selectedSessionId === c.id;
                    const correlativo = citasFiltradas.length - index;
                    const terapeutaNombre = c.terapeuta?.nombre || "Terapeuta Clínico";
                    const salaNombre = c.sala?.nombre || "Box Clínico";
                    const rowPad = density === "compacta" ? "py-2 px-3" : "py-3 px-3";

                    return (
                      <tr
                        key={c.id}
                        onClick={() => handleSelectSession(c.id)}
                        className={`transition-colors cursor-pointer group ${
                          isSelected 
                            ? "bg-teal-50/60 font-medium" 
                            : "hover:bg-slate-50/80"
                        }`}
                      >
                        {/* Columna 1: Sesión & Estado */}
                        <td className={rowPad}>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-slate-900 text-xs">
                              #{correlativo}
                            </span>
                            {c.esReevaluacion && (
                              <span className="px-1 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                H5
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5">
                            {c.estado === "ATENDIDA" && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Atendida
                              </span>
                            )}
                            {c.estado === "CONFIRMADA" && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-md border border-blue-200">
                                Confirmada
                              </span>
                            )}
                            {c.estado === "PROGRAMADA" && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded-md border border-indigo-200">
                                Programada
                              </span>
                            )}
                            {c.estado === "CANCELADA" && (
                              <span className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded-md border border-rose-200">
                                Cancelada
                              </span>
                            )}
                            {c.estado === "NO_ASISTIO" && (
                              <span className="inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded-md border border-amber-200">
                                No Asistió
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Columna 2: Fecha y Horario */}
                        <td className={rowPad}>
                          <span className="font-bold text-slate-800 block text-xs whitespace-nowrap">
                            {formatearFechaCorta(c.fechaHoraInicio)}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5 font-medium">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{formatTime(c.fechaHoraInicio)}</span>
                            <span className="text-slate-300">•</span>
                            <span>{obtenerDiaSemana(c.fechaHoraInicio)}</span>
                          </div>
                        </td>

                        {/* Columna 3: Especialista y Sala */}
                        <td className={rowPad}>
                          <span className="font-semibold text-slate-800 block text-xs truncate max-w-[130px]" title={terapeutaNombre}>
                            {terapeutaNombre}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {salaNombre}
                          </span>
                        </td>

                        {/* Columna 4: Dolor EVA */}
                        <td className={`${rowPad} text-center`}>
                          {ev ? (
                            <div className="inline-flex items-center gap-1 justify-center">
                              <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shadow-2xs ${getEvaColorClass(
                                  ev.evaDolorInicio
                                )}`}
                                title={`EVA Inicial: ${ev.evaDolorInicio}/10 (${getEvaLabel(ev.evaDolorInicio)})`}
                              >
                                {ev.evaDolorInicio}
                              </span>
                              <span className="text-slate-400 font-bold text-[10px]">→</span>
                              <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shadow-2xs ${getEvaColorClass(
                                  ev.evaDolorFin
                                )}`}
                                title={`EVA Final: ${ev.evaDolorFin}/10 (${getEvaLabel(ev.evaDolorFin)})`}
                              >
                                {ev.evaDolorFin}
                              </span>
                              {ev.evaDolorInicio > ev.evaDolorFin && (
                                <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                                  -{ev.evaDolorInicio - ev.evaDolorFin}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              {c.estado === "PROGRAMADA" || c.estado === "CONFIRMADA"
                                ? "Pendiente"
                                : "—"}
                            </span>
                          )}
                        </td>

                        {/* Columna 5: Tratamiento Clínico (Visible en Vista Tabla) */}
                        {viewMode === "tabla" && (
                          <td className={rowPad}>
                            {ev ? (
                              <p className="text-[11px] text-slate-700 line-clamp-1 max-w-[280px]" title={ev.tratamientoAplicado}>
                                {ev.tratamientoAplicado}
                              </p>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">
                                {c.estado === "PROGRAMADA" || c.estado === "CONFIRMADA"
                                  ? "Esperando ejecución"
                                  : "Sin registro"}
                              </span>
                            )}
                          </td>
                        )}

                        {/* Columna 6: Acción / Ficha */}
                        <td className={`${rowPad} text-right`}>
                          <button
                            type="button"
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-teal-600 text-white"
                                : "bg-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-700"
                            }`}
                            title="Ver detalles clínicos completos"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-slate-50/60 px-3 py-1.5 border-t border-slate-200/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span>{citasFiltradas.length} sesiones en este rango</span>
            <span>Haga clic en cualquier fila para inspeccionar la ficha clínica</span>
          </div>
        </div>

        {/* PANEL DERECHO: DETALLE EN VISTA DIVIDIDA (SPLIT VIEW) */}
        {viewMode === "split" && (
          <div className="hidden lg:block lg:col-span-5 border border-slate-200 rounded-2xl bg-white shadow-2xs p-4 sticky top-4 self-start space-y-3.5 max-h-[85vh] overflow-y-auto">
            {activeSession ? (
              <ClinicalDetailCard
                session={activeSession}
                onPrev={handlePrevSession}
                onNext={handleNextSession}
                canPrev={activeSessionIndex > 0}
                canNext={activeSessionIndex < citasFiltradas.length - 1}
                getEvaColorClass={getEvaColorClass}
                getEvaLabel={getEvaLabel}
                formatearFechaCorta={formatearFechaCorta}
              />
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Seleccione una sesión en la tabla para ver su detalle.
              </div>
            )}
          </div>
        )}
      </div>

      {/* DRAWER / SLIDE-OVER LATERAL (Para cuando el usuario está en modo Tabla o en pantallas pequeñas) */}
      {isDrawerOpen && activeSession && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Drawer */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-sm">
                  Ficha de Sesión #{citasFiltradas.length - activeSessionIndex}
                </span>
                {activeSession.esReevaluacion && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                    Hito 5 Reevaluación
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido scrolleable del Drawer */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <ClinicalDetailCard
                session={activeSession}
                onPrev={handlePrevSession}
                onNext={handleNextSession}
                canPrev={activeSessionIndex > 0}
                canNext={activeSessionIndex < citasFiltradas.length - 1}
                getEvaColorClass={getEvaColorClass}
                getEvaLabel={getEvaLabel}
                formatearFechaCorta={formatearFechaCorta}
              />
            </div>

            {/* Footer del Drawer */}
            <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Sesión {activeSessionIndex + 1} de {citasFiltradas.length}
              </span>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponente reutilizable: Tarjeta de Ficha Clínica Detallada
interface ClinicalDetailCardProps {
  session: any;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  getEvaColorClass: (val: number) => string;
  getEvaLabel: (val: number) => string;
  formatearFechaCorta: (iso: string) => string;
}

function ClinicalDetailCard({
  session,
  onPrev,
  onNext,
  canPrev,
  canNext,
  getEvaColorClass,
  getEvaLabel,
  formatearFechaCorta,
}: ClinicalDetailCardProps) {
  const ev = session.evolucion;
  const terapeutaNombre = session.terapeuta?.nombre || "Terapeuta Clínico";
  const salaNombre = session.sala?.nombre || "Sala de Atención";

  return (
    <div className="space-y-4 text-xs">
      {/* Navegación Rápida entre Sesiones */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-800">
            {formatearFechaCorta(session.fechaHoraInicio)} • {formatTime(session.fechaHoraInicio)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            disabled={!canPrev}
            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            title="Sesión anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onNext}
            disabled={!canNext}
            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            title="Sesión siguiente"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 1. Evaluación del Dolor EVA */}
      <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 space-y-2">
        <span className="font-bold text-[10px] uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-teal-600" />
          <span>Escala Visual Analógica (EVA)</span>
        </span>

        {ev ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Pre-Sesión</span>
                <span className="text-base font-black text-slate-800">{ev.evaDolorInicio}/10</span>
                <span className="text-[10px] text-slate-500 block">{getEvaLabel(ev.evaDolorInicio)}</span>
              </div>
              <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <span className="text-[9px] text-emerald-600 font-bold block uppercase">Post-Sesión</span>
                <span className="text-base font-black text-emerald-800">{ev.evaDolorFin}/10</span>
                <span className="text-[10px] text-emerald-600 block">{getEvaLabel(ev.evaDolorFin)}</span>
              </div>
            </div>
            <div className="text-[11px] bg-white p-2 rounded-lg text-slate-600 flex items-center justify-between border border-slate-200/60">
              <span>Alivio terapéutico:</span>
              <span className="font-black text-emerald-700">
                {ev.evaDolorInicio - ev.evaDolorFin > 0 
                  ? `Reducción de ${ev.evaDolorInicio - ev.evaDolorFin} puntos`
                  : "Dolor estable"}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-slate-400 italic text-[11px] py-1">
            Sin medición de dolor registrada para esta sesión.
          </p>
        )}
      </div>

      {/* 2. Tratamiento Clínico y Procedimientos */}
      <div className="space-y-1.5">
        <span className="font-bold text-[10px] uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
          <span>Técnica & Tratamiento Aplicado</span>
        </span>
        <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-800 text-xs leading-relaxed whitespace-pre-wrap shadow-2xs">
          {ev?.tratamientoAplicado || (
            <span className="text-slate-400 italic">
              {session.estado === "PROGRAMADA" || session.estado === "CONFIRMADA"
                ? "Sesión pendiente de atención clínica."
                : "No se detalló procedimiento para esta sesión."}
            </span>
          )}
        </div>
      </div>

      {/* 3. Reevaluación Funcional / Hito 5 */}
      {ev?.notasReevaluacion && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 space-y-1">
          <span className="text-[10px] font-black uppercase block tracking-wider text-amber-800 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Reevaluación Funcional (Hito 5)</span>
          </span>
          <p className="text-[11px] leading-relaxed font-medium">
            {ev.notasReevaluacion}
          </p>
        </div>
      )}

      {/* 4. Trazabilidad Operativa */}
      <div className="space-y-1.5 pt-1">
        <span className="font-bold text-[10px] uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Trazabilidad en Clínica</span>
        </span>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] space-y-1.5 text-slate-600">
          <div className="flex items-center justify-between">
            <span>Fisioterapeuta:</span>
            <span className="font-bold text-slate-800">{terapeutaNombre}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Espacio asignado:</span>
            <span className="font-semibold text-slate-700">{salaNombre}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Confirmado por:</span>
            <span className="font-semibold text-teal-700">
              {session.confirmadoPorNombre || session.creadoPorNombre || "Recepción San Borja"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
