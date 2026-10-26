"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatTime, cn, formatCurrency } from "@/lib/utils";
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Plus, 
  User, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  MessageSquare,
  Phone,
  CreditCard,
  X,
  ExternalLink,
  ShieldAlert,
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Sparkles,
  Check,
  CalendarCheck2,
  SlidersHorizontal
} from "lucide-react";
import { NewAppointmentModal } from "./NewAppointmentModal";
import { AusentismoReportModal } from "./AusentismoReportModal";
import { useAuth } from "@/lib/auth-context";

interface MatrixGridProps {
  initialCitas: any[];
  salas: any[];
  terapeutas: any[];
  pacientes: any[];
  paquetes: any[];
  servicios: any[];
  configuracion?: any;
}

export function MatrixGrid({
  initialCitas,
  salas,
  terapeutas,
  pacientes,
  paquetes,
  servicios,
  configuracion,
}: MatrixGridProps) {
  const { currentUser, hasPermission } = useAuth();
  const canSeeFinance = hasPermission("caja:ver");
  const [citas, setCitas] = useState(initialCitas);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefilledSalaId, setPrefilledSalaId] = useState<string | undefined>(undefined);
  const [prefilledTime, setPrefilledTime] = useState<string | undefined>(undefined);
  const [selectedCitaDetail, setSelectedCitaDetail] = useState<any | null>(null);
  const [isAusentismoOpen, setIsAusentismoOpen] = useState(false);

  // Modo de Reprogramación dentro del detalle
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleSalaId, setRescheduleSalaId] = useState("");
  const [rescheduleTerapeutaId, setRescheduleTerapeutaId] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Filtros de Productividad
  const [filterTerapeuta, setFilterTerapeuta] = useState("TODOS");
  const [selectedMobileSala, setSelectedMobileSala] = useState<string>("TODAS");
  const [productivityFilter, setProductivityFilter] = useState<"TODAS" | "POR_CONFIRMAR" | "SOLO_LIBRES">("TODAS");

  // Detección del día de la semana para horarios personalizados
  const diaSemanaClave = useMemo(() => {
    if (!selectedDate) return "lunes";
    const [y, m, d] = selectedDate.split("-").map(Number);
    const day = new Date(y, m - 1, d).getDay();
    const map: Record<number, string> = {
      0: "domingo",
      1: "lunes",
      2: "martes",
      3: "miercoles",
      4: "jueves",
      5: "viernes",
      6: "sabado",
    };
    return map[day] || "lunes";
  }, [selectedDate]);

  const diaConfig = configuracion?.horariosSemana?.[diaSemanaClave];
  const isDiaCerrado = diaConfig ? !diaConfig.activo : false;

  const aperturaHour = useMemo(() => {
    if (diaConfig?.apertura) {
      return parseInt(diaConfig.apertura.split(":")[0], 10) || 8;
    }
    return parseInt((configuracion?.horaApertura || "08:00").split(":")[0], 10) || 8;
  }, [diaConfig, configuracion]);

  const cierreHour = useMemo(() => {
    if (diaConfig?.cierre) {
      return parseInt(diaConfig.cierre.split(":")[0], 10) || 20;
    }
    return parseInt((configuracion?.horaCierre || "20:00").split(":")[0], 10) || 20;
  }, [diaConfig, configuracion]);

  const intervaloMinutos = configuracion?.intervaloMinutos || 45;

  const timeSlots: string[] = useMemo(() => {
    if (isDiaCerrado) return [];
    const slots: string[] = [];
    for (let h = aperturaHour; h < cierreHour; h++) {
      slots.push(`${h.toString().padStart(2, "0")}:00`);
    }
    return slots;
  }, [aperturaHour, cierreHour, isDiaCerrado]);

  const isPausaSlot = (slot: string) => {
    if (!diaConfig?.tienePausa || !diaConfig.pausaInicio || !diaConfig.pausaFin) return false;
    const [hSlot] = slot.split(":").map(Number);
    const [hPIni] = diaConfig.pausaInicio.split(":").map(Number);
    const [hPFin] = diaConfig.pausaFin.split(":").map(Number);
    return hSlot >= hPIni && hSlot < hPFin;
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "ATENDIDA":
        return {
          bg: "bg-emerald-50 border-emerald-300 text-emerald-800",
          dot: "bg-emerald-500",
          label: "Atendida",
        };
      case "CONFIRMADA":
        return {
          bg: "bg-blue-50 border-blue-300 text-blue-800",
          dot: "bg-blue-500",
          label: "Confirmada",
        };
      case "CANCELADA":
        return {
          bg: "bg-rose-50 border-rose-300 text-rose-800",
          dot: "bg-rose-500",
          label: "Cancelada",
        };
      case "NO_ASISTIO":
        return {
          bg: "bg-amber-50 border-amber-300 text-amber-800",
          dot: "bg-amber-500",
          label: "No Asistió",
        };
      default:
        return {
          bg: "bg-indigo-50 border-indigo-200 text-indigo-800",
          dot: "bg-indigo-500",
          label: "Programada",
        };
    }
  };

  const handleOpenAddModal = (salaId?: string, timeSlot?: string) => {
    setPrefilledSalaId(salaId);
    setPrefilledTime(timeSlot);
    setIsModalOpen(true);
  };

  // Citas del día seleccionado
  const citasDelDia = useMemo(() => {
    return citas.filter((c) => {
      const dStr = new Date(c.fechaHoraInicio).toISOString().split("T")[0];
      if (dStr !== selectedDate) return false;
      if (filterTerapeuta !== "TODOS" && c.terapeutaId !== filterTerapeuta) return false;
      if (productivityFilter === "POR_CONFIRMAR" && c.estado !== "PROGRAMADA") return false;
      return true;
    });
  }, [citas, selectedDate, filterTerapeuta, productivityFilter]);

  // Métricas de Saturación y Ocupación Clínica del Día
  const citasActivasDelDia = useMemo(() => {
    return citas.filter((c) => {
      const dStr = new Date(c.fechaHoraInicio).toISOString().split("T")[0];
      return dStr === selectedDate && c.estado !== "CANCELADA";
    });
  }, [citas, selectedDate]);

  const salasDisponibles = useMemo(() => salas.filter((s) => s.estado === "DISPONIBLE"), [salas]);
  const totalCuposDelDia = (timeSlots.length || 1) * (salasDisponibles.length || 1);
  const porcentajeOcupacion = Math.min(100, Math.round((citasActivasDelDia.length / (totalCuposDelDia || 1)) * 100));

  const totalProgramadas = citasActivasDelDia.filter((c) => c.estado === "PROGRAMADA").length;
  const totalConfirmadas = citasActivasDelDia.filter((c) => c.estado === "CONFIRMADA").length;
  const totalAtendidas = citasActivasDelDia.filter((c) => c.estado === "ATENDIDA").length;

  // Detección de Horas Pico (horas con mayor cantidad de salas ocupadas)
  const ocupacionPorHora = useMemo(() => {
    return timeSlots.map((slot) => {
      const slotH = parseInt(slot.split(":")[0], 10);
      const citasSlot = citasActivasDelDia.filter((c) => {
        const cDate = new Date(c.fechaHoraInicio);
        return cDate.getHours() === slotH;
      });
      const ratio = salasDisponibles.length > 0 ? citasSlot.length / salasDisponibles.length : 0;
      return {
        slot,
        ocupadas: citasSlot.length,
        ratio: Math.round(ratio * 100),
        esPico: ratio >= 0.75,
      };
    });
  }, [timeSlots, citasActivasDelDia, salasDisponibles]);

  const horasPico = ocupacionPorHora.filter((o) => o.esPico);

  const getCitasCountPorSala = (salaId: string) => {
    return citas.filter((c) => {
      const dStr = new Date(c.fechaHoraInicio).toISOString().split("T")[0];
      return dStr === selectedDate && c.salaId === salaId && c.estado !== "CANCELADA";
    }).length;
  };

  const displayedSalas = selectedMobileSala === "TODAS" ? salas : salas.filter((s) => s.id === selectedMobileSala);
  const numSalas = displayedSalas.length;

  const gridHeaderStyle = selectedMobileSala === "TODAS"
    ? { gridTemplateColumns: `95px repeat(${numSalas}, minmax(165px, 1fr))` }
    : { gridTemplateColumns: "95px 1fr" };

  // Abrir modal de reprogramación
  const handleStartReschedule = (cita: any) => {
    const cDate = new Date(cita.fechaHoraInicio);
    const dateStr = cDate.toISOString().split("T")[0];
    const timeStr = `${cDate.getHours().toString().padStart(2, "0")}:${cDate.getMinutes().toString().padStart(2, "0")}`;
    
    setRescheduleDate(dateStr);
    setRescheduleTime(timeStr);
    setRescheduleSalaId(cita.salaId);
    setRescheduleTerapeutaId(cita.terapeutaId);
    setRescheduleError(null);
    setIsRescheduling(true);
  };

  const handleSaveReschedule = async () => {
    if (!selectedCitaDetail) return;
    setRescheduleLoading(true);
    setRescheduleError(null);

    try {
      const { reprogramarCita } = await import("@/server/actions/citas");
      const [h, m] = rescheduleTime.split(":").map(Number);
      const [y, mo, d] = rescheduleDate.split("-").map(Number);
      const nuevaFecha = new Date(y, mo - 1, d, h, m);

      const usuarioInfo = currentUser ? {
        id: currentUser.id,
        nombre: `${currentUser.nombre} (${currentUser.rol === "RECEPCION" ? "Recepción" : currentUser.rol})`,
        rol: currentUser.rol
      } : undefined;

      const res = await reprogramarCita({
        citaId: selectedCitaDetail.id,
        nuevaFechaHoraInicio: nuevaFecha,
        nuevaSalaId: rescheduleSalaId,
        nuevoTerapeutaId: rescheduleTerapeutaId,
        duracionMinutos: 45,
        usuarioInfo,
      });

      if (!res.success) {
        setRescheduleError(res.error || "Error al reprogramar la cita.");
        setRescheduleLoading(false);
        return;
      }

      const actualizada = res.data as any;
      setCitas((prev) => prev.map((c) => c.id === actualizada.id ? actualizada : c));
      setSelectedCitaDetail(actualizada);
      setIsRescheduling(false);
    } catch (err: unknown) {
      setRescheduleError(err instanceof Error ? err.message : "Error inesperado al reprogramar.");
    } finally {
      setRescheduleLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* 1. BARRA EJECUTIVA DE CAPACIDAD Y SATURACIÓN DIARIA */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Termómetro de Ocupación */}
          <div className="space-y-1.5 flex-1 w-full lg:max-w-md">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Ocupación de Citas del Día</span>
              </span>
              <span className="font-mono font-bold text-slate-700">
                {citasActivasDelDia.length} de {totalCuposDelDia} turnos ({porcentajeOcupacion}%)
              </span>
            </div>

            {/* Barra de Progreso Dinámica con Código de Color */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  porcentajeOcupacion >= 75 ? "bg-rose-500" : porcentajeOcupacion >= 40 ? "bg-amber-500" : "bg-teal-500"
                )}
                style={{ width: `${Math.max(4, porcentajeOcupacion)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className={cn(
                "font-bold px-2 py-0.5 rounded-md text-[10px]",
                porcentajeOcupacion >= 75 ? "bg-rose-50 text-rose-800 border border-rose-200" :
                porcentajeOcupacion >= 40 ? "bg-amber-50 text-amber-800 border border-amber-200" :
                "bg-emerald-50 text-emerald-800 border border-emerald-200"
              )}>
                {porcentajeOcupacion >= 75 ? "🔴 Clínica de Alta Demanda / Saturada" :
                 porcentajeOcupacion >= 40 ? "🟡 Flujo Saludable y Óptimo" :
                 "🟢 Disponibilidad Alta (Espacios Libres)"}
              </span>

              {horasPico.length > 0 && (
                <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[10px]">
                  Pico: {horasPico.map(h => h.slot).join(", ")}
                </span>
              )}
            </div>
          </div>

          {/* Tarjetas KPI de Estado de Gestión */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 w-full lg:w-auto shrink-0">
            <div className="p-2 sm:p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Citas</span>
              <span className="text-base sm:text-lg font-black text-slate-900 block leading-tight">
                {citasActivasDelDia.length}
              </span>
            </div>

            <div className="p-2 sm:p-2.5 bg-blue-50/70 rounded-xl border border-blue-200/80 text-center">
              <span className="text-[10px] text-blue-700 uppercase font-bold block">Confirmadas</span>
              <span className="text-base sm:text-lg font-black text-blue-900 block leading-tight">
                {totalConfirmadas}
              </span>
            </div>

            <div className="p-2 sm:p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/80 text-center">
              <span className="text-[10px] text-amber-800 uppercase font-bold block">Por Confirmar</span>
              <span className="text-base sm:text-lg font-black text-amber-950 block leading-tight">
                {totalProgramadas}
              </span>
            </div>

            <div className="p-2 sm:p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-center col-span-3 sm:col-span-1">
              <span className="text-[10px] text-emerald-700 uppercase font-bold block">Atendidas</span>
              <span className="text-base sm:text-lg font-black text-emerald-900 block leading-tight">
                {totalAtendidas}
              </span>
            </div>
          </div>
        </div>

        {/* Filtros Rápidos de Productividad para Recepción */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-slate-400" />
              <span>Filtro Recepción:</span>
            </span>

            <button
              onClick={() => setProductivityFilter("TODAS")}
              className={cn(
                "px-2.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer",
                productivityFilter === "TODAS"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              Todas las Citas ({citasActivasDelDia.length})
            </button>

            <button
              onClick={() => setProductivityFilter("POR_CONFIRMAR")}
              className={cn(
                "px-2.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1",
                productivityFilter === "POR_CONFIRMAR"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
              )}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Por Confirmar ({totalProgramadas})</span>
            </button>

            <button
              onClick={() => setProductivityFilter(productivityFilter === "SOLO_LIBRES" ? "TODAS" : "SOLO_LIBRES")}
              className={cn(
                "px-2.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1",
                productivityFilter === "SOLO_LIBRES"
                  ? "bg-teal-700 text-white shadow-xs"
                  : "bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200"
              )}
            >
              <Sparkles className="w-3 h-3" />
              <span>{productivityFilter === "SOLO_LIBRES" ? "Mostrando Solo Libres" : "Detectar Huecos Libres"}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-medium ml-auto">
            Actualizado en tiempo real con control de concurrencia
          </div>
        </div>
      </div>

      {/* 2. BARRA DE CONTROL Y SELECTOR DE FECHA */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl border border-teal-100 shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Control de Citas del Día por Salas
            </h2>
            <p className="text-xs text-slate-500">
              Mostrando {displayedSalas.length} de {salas.length} salas de atención ({salasDisponibles.length} operativas).
            </p>
          </div>
        </div>

        {/* Filtros y Navegación de Fecha */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro por Terapeuta */}
          <select
            value={filterTerapeuta}
            onChange={(e) => setFilterTerapeuta(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="TODOS">Todo el Personal ({terapeutas.length})</option>
            {terapeutas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre} {t.rol === "ASISTENTE" ? "• Asistente" : "• Terapeuta"}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                setSelectedDate(d.toISOString().split("T")[0]);
              }}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
              aria-label="Día anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().split("T")[0]);
              }}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
              aria-label="Día siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
            className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
          >
            Hoy
          </button>

          <button
            onClick={() => setIsAusentismoOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/90 text-xs font-bold rounded-xl transition cursor-pointer"
            title="Ver reporte semanal de ausentismo de pacientes y turnos no reasignados"
          >
            <TrendingDown className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">Reporte Ausentismo</span>
            <span className="sm:hidden">No-Show</span>
          </button>

          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition ml-auto sm:ml-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Cita</span>
          </button>
        </div>
      </div>

      {/* Selector de Salas Dinámicas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 pr-2 shrink-0 hidden sm:inline">
          Vista Sala:
        </span>
        <button
          onClick={() => setSelectedMobileSala("TODAS")}
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition shrink-0 cursor-pointer",
            selectedMobileSala === "TODAS"
              ? "bg-teal-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          )}
        >
          Todas las Salas ({salas.length})
        </button>
        {salas.map((sala) => (
          <button
            key={sala.id}
            onClick={() => setSelectedMobileSala(sala.id)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 cursor-pointer",
              selectedMobileSala === sala.id
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            <span>{sala.nombre}</span>
            <span className={cn(
              "w-2 h-2 rounded-full",
              sala.estado === "DISPONIBLE" ? "bg-emerald-500" : "bg-amber-500"
            )} />
          </button>
        ))}
      </div>

      {/* 3. MATRIZ DINÁMICA DE CITAS CON DETECTOR DE HORAS PICO Y TERMÓMETROS DE SALA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full" style={{ minWidth: selectedMobileSala === "TODAS" ? `${Math.max(900, numSalas * 165 + 95)}px` : "100%" }}>
            
            {/* Header de Salas con Termómetro de Ocupación por Sala */}
            <div 
              className="bg-slate-100/90 text-slate-800 text-xs font-bold border-b border-slate-200 sticky top-0 z-10 grid"
              style={gridHeaderStyle}
            >
              <div className="p-3 text-center border-r border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider flex flex-col justify-center items-center">
                <span>Horario</span>
                <span className="text-[9px] text-slate-400 font-normal">Saturación</span>
              </div>
              
              {displayedSalas.map((sala) => {
                const count = getCitasCountPorSala(sala.id);
                const salaPct = Math.round((count / (timeSlots.length || 1)) * 100);

                return (
                  <div key={sala.id} className="p-3 text-center border-r border-slate-200 last:border-r-0 space-y-1">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-slate-900 font-extrabold text-sm">{sala.nombre}</span>
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        sala.estado === "DISPONIBLE" ? "bg-emerald-500" : "bg-amber-500"
                      )} />
                    </div>

                    {sala.equipamiento && (
                      <span className="text-[10px] text-slate-400 block truncate font-normal">
                        {sala.equipamiento}
                      </span>
                    )}

                    {sala.estado === "DISPONIBLE" ? (
                      <div className="space-y-0.5">
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              salaPct >= 75 ? "bg-rose-500" : salaPct >= 40 ? "bg-amber-500" : "bg-teal-500"
                            )}
                            style={{ width: `${Math.max(5, salaPct)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium block">
                          {count} citas ({salaPct}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-amber-700 font-bold block">
                        ⚠️ Mantenimiento
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Filas de Horario con Detector de Saturación por Franja o Aviso de Día Cerrado */}
            {isDiaCerrado ? (
              <div className="p-12 text-center space-y-3 bg-slate-50/60">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto">
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    Clínica Cerrada el día {diaSemanaClave.charAt(0).toUpperCase() + diaSemanaClave.slice(1)}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    La configuración institucional de AJ Fisioterapia establece que este día no tiene atención clínica. Puedes seleccionar otra fecha en la barra superior o modificar los días de atención en Configuración.
                  </p>
                </div>
                <div className="pt-1">
                  <Link
                    href="/dashboard/configuracion"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-teal-700 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Ajustar Horarios de Atención</span>
                  </Link>
                </div>
              </div>
            ) : (
            <div className="divide-y divide-slate-100">
              {timeSlots.map((slot) => {
                const [slotHour] = slot.split(":").map(Number);
                const statHour = ocupacionPorHora.find((o) => o.slot === slot);
                const ocupadas = statHour?.ocupadas || 0;
                const ratio = statHour?.ratio || 0;
                const esPico = statHour?.esPico || false;
                const esPausa = isPausaSlot(slot);

                // Si el filtro "SOLO_LIBRES" está activo y este slot está al 100% de ocupación, lo oculta
                if (productivityFilter === "SOLO_LIBRES" && ocupadas >= salasDisponibles.length && salasDisponibles.length > 0) {
                  return null;
                }

                return (
                  <div 
                    key={slot} 
                    className={cn(
                      "min-h-[85px] grid transition-colors",
                      esPico ? "bg-rose-50/20" : esPausa ? "bg-amber-50/25" : ""
                    )}
                    style={gridHeaderStyle}
                  >
                    {/* Columna de Horario con Detector de Demanda */}
                    <div className={cn(
                      "p-2.5 border-r border-slate-200 text-center flex flex-col justify-between items-center",
                      esPausa ? "bg-amber-50/70" : "bg-slate-50/70"
                    )}>
                      <div>
                        <span className="text-xs font-bold text-slate-800">{slot}</span>
                        <span className="text-[10px] text-slate-400 block">{intervaloMinutos}m</span>
                      </div>

                      {/* Badge de Saturación Horaria o Refrigerio */}
                      {esPausa ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border bg-amber-100 text-amber-900 border-amber-300 block leading-tight">
                          ☕ RECESO
                        </span>
                      ) : (
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.2 rounded-md border block leading-tight",
                          esPico 
                            ? "bg-rose-100 text-rose-800 border-rose-300"
                            : ocupadas > 0 
                            ? "bg-slate-100 text-slate-600 border-slate-200" 
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        )}>
                          {esPico ? "HORA PICO" : `${ocupadas}/${salasDisponibles.length} salas`}
                        </span>
                      )}
                    </div>

                    {/* Columnas para cada sala mostrada */}
                    {displayedSalas.map((sala) => {
                      const appointment = citasDelDia.find((c) => {
                        if (c.salaId !== sala.id) return false;
                        const cDate = new Date(c.fechaHoraInicio);
                        return cDate.getHours() === slotHour;
                      });

                      const statusStyle = appointment ? getStatusBadge(appointment.estado) : null;
                      const paciente = appointment ? pacientes.find((p) => p.id === appointment.pacienteId) : null;
                      const terapeuta = appointment ? terapeutas.find((t) => t.id === appointment.terapeutaId) : null;

                      return (
                        <div
                          key={sala.id}
                          className={cn(
                            "p-1.5 border-r border-slate-200 last:border-r-0 transition-colors relative group",
                            !appointment && sala.estado === "DISPONIBLE" && "hover:bg-teal-50/40 cursor-pointer",
                            sala.estado === "MANTENIMIENTO" && "bg-slate-50/80 cursor-not-allowed"
                          )}
                          onClick={() => {
                            if (!appointment && sala.estado === "DISPONIBLE") {
                              handleOpenAddModal(sala.id, slot);
                            }
                          }}
                        >
                          {appointment ? (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCitaDetail(appointment);
                                setIsRescheduling(false);
                              }}
                              className={cn(
                                "h-full w-full p-2 rounded-lg border text-left flex flex-col justify-between shadow-xs transition hover:shadow-md cursor-pointer",
                                statusStyle?.bg
                              )}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="text-[11px] font-bold truncate flex items-center gap-1">
                                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusStyle?.dot)} />
                                    {paciente ? `${paciente.nombres} ${paciente.apellidos.split(" ")[0]}` : "Paciente"}
                                  </span>
                                  <span className="text-[10px] font-medium px-1 py-0.2 rounded bg-white/70 border border-slate-200/60 shrink-0">
                                    {formatTime(appointment.fechaHoraInicio)}
                                  </span>
                                </div>

                                <p className="text-[10px] text-slate-600 truncate flex items-center gap-1">
                                  <User className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                                  <span>{terapeuta?.nombre?.replace("Lic. ", "") || "Terapeuta"}</span>
                                </p>
                              </div>

                              {/* Alerta de Reevaluación */}
                              {appointment.esReevaluacion && (
                                <div className="mt-1.5 flex items-center gap-1 text-[9px] font-bold text-amber-900 bg-amber-200/90 border border-amber-400/80 px-1.5 py-0.5 rounded animate-pulse">
                                  <AlertTriangle className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                                  <span className="truncate">Reevaluación Fisioterapéutica</span>
                                </div>
                              )}
                            </div>
                          ) : sala.estado === "MANTENIMIENTO" ? (
                            <div className="h-full w-full rounded flex items-center justify-center text-[10px] text-amber-700 font-semibold bg-amber-50/50">
                              Mantenimiento
                            </div>
                          ) : (
                            <div className="h-full w-full rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] font-semibold text-teal-700 bg-teal-100/80 px-2 py-1 rounded flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Reservar {slot}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Agendar Cita */}
      {isModalOpen && (
        <NewAppointmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          salas={salas}
          terapeutas={terapeutas}
          pacientes={pacientes}
          paquetes={paquetes}
          prefilledSalaId={prefilledSalaId}
          prefilledDate={selectedDate}
          prefilledTime={prefilledTime}
          onCitaAgendada={(nueva) => {
            setCitas((prev) => [...prev, nueva]);
            setIsModalOpen(false);
          }}
        />
      )}

      {/* 4. MODAL INTERACTIVO CON MODO DE REPROGRAMACIÓN Y GESTIÓN RÁPIDA */}
      {selectedCitaDetail && (() => {
        const paciente = pacientes.find((p) => p.id === selectedCitaDetail.pacienteId);
        const sala = salas.find((s) => s.id === selectedCitaDetail.salaId);
        const terapeuta = terapeutas.find((t) => t.id === selectedCitaDetail.terapeutaId);
        const paquete = paquetes.find((p) => p.id === selectedCitaDetail.paqueteId);

        const cleanPhone = (paciente?.telefono || "").replace(/\D/g, "");
        const formattedDate = new Date(selectedCitaDetail.fechaHoraInicio).toLocaleDateString("es-PE", {
          weekday: "long",
          day: "numeric",
          month: "long"
        });
        const horaCita = formatTime(selectedCitaDetail.fechaHoraInicio);
        const waText = `Hola ${paciente?.nombres || "Estimado(a) paciente"}, le saludamos de AJ Fisioterapia (San Borja). Le recordamos su cita programada para el ${formattedDate} a las ${horaCita} en ${sala?.nombre || "nuestra clínica"} con ${terapeuta?.nombre || "su terapeuta"}. Por favor confírmenos su asistencia. ¡Muchas gracias!`;
        const waUrl = cleanPhone.length >= 9
          ? `https://wa.me/51${cleanPhone.startsWith("51") ? cleanPhone.slice(2) : cleanPhone}?text=${encodeURIComponent(waText)}`
          : null;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden">
            <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col overflow-hidden">
              
              {/* Encabezado */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                    <CalendarCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      {isRescheduling ? "Reprogramar Turno de Cita" : "Gestión Operativa de Cita"}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      ID: {selectedCitaDetail.id} • {selectedCitaDetail.estado}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCitaDetail(null);
                    setIsRescheduling(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                  aria-label="Cerrar modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Formulario de Reprogramación Activo */}
              {isRescheduling ? (
                <div className="overflow-y-auto flex-1 space-y-4 text-xs">
                  {rescheduleError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{rescheduleError}</span>
                    </div>
                  )}

                  <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1">
                    <span className="font-bold text-teal-900 block text-xs">
                      Paciente: {paciente?.nombres} {paciente?.apellidos}
                    </span>
                    <p className="text-[11px] text-teal-800">
                      Modifique el horario, sala o fisioterapeuta. El sistema validará automáticamente que no existan conflictos de concurrencia.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nueva Fecha *</label>
                      <input
                        type="date"
                        required
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nueva Hora *</label>
                      <input
                        type="time"
                        required
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nueva Sala Física *</label>
                      <select
                        value={rescheduleSalaId}
                        onChange={(e) => setRescheduleSalaId(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                      >
                        {salas.map((s) => (
                          <option key={s.id} value={s.id} disabled={s.estado === "MANTENIMIENTO"}>
                            {s.nombre} {s.estado === "MANTENIMIENTO" ? "(⚠️ En Mantenimiento)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Terapeuta Responsable *</label>
                      <select
                        value={rescheduleTerapeutaId}
                        onChange={(e) => setRescheduleTerapeutaId(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                      >
                        {terapeutas.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nombre} {t.rol === "ASISTENTE" ? "(Asistente)" : "(Terapeuta)"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRescheduling(false)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={rescheduleLoading}
                      onClick={handleSaveReschedule}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5", rescheduleLoading && "animate-spin")} />
                      <span>{rescheduleLoading ? "Guardando..." : "Confirmar Reprogramación"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Vista de Detalle y Acciones Rápidas */
                <div className="overflow-y-auto flex-1 space-y-3 text-xs">
                  
                  {/* Paciente y Contacto */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-start justify-between gap-3">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Paciente</span>
                      <span className="text-slate-900 font-extrabold text-sm block">
                        {paciente?.nombres} {paciente?.apellidos}
                      </span>
                      <span className="text-slate-500 block text-[11px] font-mono mt-0.5">
                        {paciente?.tipoDocumento || "DNI"}: {paciente?.dni} • Tel: {paciente?.telefono}
                      </span>
                    </div>

                    {/* Botón WhatsApp de Recordatorio Directo */}
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl flex items-center gap-1.5 shadow-xs transition shrink-0 cursor-pointer"
                        title="Enviar recordatorio automático por WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>

                  {/* Sala, Terapeuta y Horario */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Sala Asignada</span>
                      <span className="font-bold text-slate-800 block text-xs mt-0.5">
                        {sala?.nombre || "Sin Sala"}
                      </span>
                      {sala?.equipamiento && (
                        <span className="text-[10px] text-slate-500 truncate block">{sala.equipamiento}</span>
                      )}
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                        {terapeuta?.rol === "ASISTENTE" ? "Técnico Asistente" : "Terapeuta Responsable"}
                      </span>
                      <span className="font-bold text-slate-800 block text-xs mt-0.5 truncate">
                        {terapeuta?.nombre || "Personal Clínico"}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {terapeuta?.rol === "ASISTENTE" ? "Técnico Fisioterapia" : "Lic. Fisioterapia"}
                      </span>
                    </div>
                  </div>

                  {/* Horario y Fecha */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Horario Programado</span>
                      <span className="font-bold text-slate-800 text-xs">
                        {new Date(selectedCitaDetail.fechaHoraInicio).toLocaleDateString("es-PE")} • {formatTime(selectedCitaDetail.fechaHoraInicio)} a {formatTime(selectedCitaDetail.fechaHoraFin)}
                      </span>
                    </div>
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold border",
                      getStatusBadge(selectedCitaDetail.estado).bg
                    )}>
                      {getStatusBadge(selectedCitaDetail.estado).label}
                    </span>
                  </div>

                  {/* Estado del Paquete / Financiero */}
                  {paquete && (
                    <div className="bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-200 flex items-center justify-between text-indigo-950">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <span className="font-bold block text-xs">Paquete de {paquete.totalSesiones} Sesiones</span>
                          <span className="text-[10px] text-indigo-700">Consumo: {paquete.sesionesConsumidas}/{paquete.totalSesiones} sesiones</span>
                        </div>
                      </div>
                      {canSeeFinance ? (
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase",
                          paquete.estadoPago === "PAGADO" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                        )}>
                          {paquete.estadoPago}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-teal-100 text-teal-800">
                          Plan Activo
                        </span>
                      )}
                    </div>
                  )}

                  {/* Alerta de Reevaluación */}
                  {selectedCitaDetail.esReevaluacion && (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-xs">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Reevaluación Clínica Obligatoria
                      </p>
                      <p className="text-[11px] text-amber-800 leading-tight">
                        Esta sesión coincide con el hito de 5 sesiones asistidas. El terapeuta debe registrar la escala EVA y el test biomecánico antes de dar de alta.
                      </p>
                    </div>
                  )}

                  {/* Botones de Cambio de Estado Rápido y Reprogramar */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Acciones Operativas</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      
                      {/* Botón Reprogramar Turno */}
                      <button
                        type="button"
                        onClick={() => handleStartReschedule(selectedCitaDetail)}
                        className="py-2 px-2 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-xl border border-teal-200 text-center transition cursor-pointer text-xs flex items-center justify-center gap-1"
                        title="Cambiar fecha, hora o sala"
                      >
                        <RefreshCw className="w-3 h-3 text-teal-600" />
                        <span>Reprogramar</span>
                      </button>

                      {selectedCitaDetail.estado === "PROGRAMADA" && (
                        <button
                          onClick={async () => {
                            const { actualizarEstadoCita } = await import("@/server/actions/citas");
                            const usuarioInfo = currentUser ? {
                              id: currentUser.id,
                              nombre: `${currentUser.nombre} (${currentUser.rol === "RECEPCION" ? "Recepción" : currentUser.rol})`,
                              rol: currentUser.rol
                            } : undefined;
                            await actualizarEstadoCita(selectedCitaDetail.id, "CONFIRMADA", usuarioInfo);
                            const respNombre = usuarioInfo?.nombre || "Karin Palacios (Recepción)";
                            setCitas((prev) => prev.map((c) => c.id === selectedCitaDetail.id ? { ...c, estado: "CONFIRMADA", confirmadoPorNombre: respNombre } : c));
                            setSelectedCitaDetail((prev: any) => ({ ...prev, estado: "CONFIRMADA", confirmadoPorNombre: respNombre }));
                          }}
                          className="py-2 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200 text-center transition cursor-pointer text-xs"
                        >
                          Confirmar Cita
                        </button>
                      )}

                      {selectedCitaDetail.estado !== "CANCELADA" && selectedCitaDetail.estado !== "ATENDIDA" && (
                        <button
                          onClick={async () => {
                            const { actualizarEstadoCita } = await import("@/server/actions/citas");
                            await actualizarEstadoCita(selectedCitaDetail.id, "NO_ASISTIO");
                            setCitas((prev) => prev.map((c) => c.id === selectedCitaDetail.id ? { ...c, estado: "NO_ASISTIO" } : c));
                            setSelectedCitaDetail((prev: any) => ({ ...prev, estado: "NO_ASISTIO" }));
                          }}
                          className="py-2 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl border border-amber-200 text-center transition cursor-pointer text-xs"
                        >
                          No Asistió
                        </button>
                      )}

                      {selectedCitaDetail.estado !== "CANCELADA" && selectedCitaDetail.estado !== "ATENDIDA" && (
                        <button
                          onClick={async () => {
                            if (confirm("¿Está seguro de cancelar esta cita? La sala quedará libre para agendar.")) {
                              const { actualizarEstadoCita } = await import("@/server/actions/citas");
                              await actualizarEstadoCita(selectedCitaDetail.id, "CANCELADA");
                              setCitas((prev) => prev.map((c) => c.id === selectedCitaDetail.id ? { ...c, estado: "CANCELADA" } : c));
                              setSelectedCitaDetail((prev: any) => ({ ...prev, estado: "CANCELADA" }));
                            }
                          }}
                          className="py-2 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 text-center transition cursor-pointer text-xs"
                        >
                          Cancelar Cita
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Acciones Inferiores */}
                  <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                    <Link
                      href={`/dashboard/pacientes/${selectedCitaDetail.pacienteId}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ver Expediente y EVA</span>
                    </Link>

                    <button
                      onClick={() => setSelectedCitaDetail(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Modal de Reporte Tabular de Ausentismo (No-Show) */}
      <AusentismoReportModal
        isOpen={isAusentismoOpen}
        onClose={() => setIsAusentismoOpen(false)}
        citas={citas}
        terapeutas={terapeutas}
        salas={salas}
        clinicName={configuracion?.nombreComercial}
      />
    </div>
  );
}
