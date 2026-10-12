"use client";

import { useState } from "react";
import Link from "next/link";
import { formatTime, cn, formatCurrency } from "@/lib/utils";
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Plus, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  MessageSquare,
  Phone,
  CreditCard,
  X,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { NewAppointmentModal } from "./NewAppointmentModal";
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
  const { currentUser } = useAuth();
  const [citas, setCitas] = useState(initialCitas);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefilledSalaId, setPrefilledSalaId] = useState<string | undefined>(undefined);
  const [prefilledTime, setPrefilledTime] = useState<string | undefined>(undefined);
  const [selectedCitaDetail, setSelectedCitaDetail] = useState<any | null>(null);

  const [filterTerapeuta, setFilterTerapeuta] = useState("TODOS");
  const [selectedMobileSala, setSelectedMobileSala] = useState<string>("TODAS");

  // Generación dinámica de ranuras horarias según la configuración de la clínica
  const aperturaHour = parseInt((configuracion?.horaApertura || "08:00").split(":")[0], 10) || 8;
  const cierreHour = parseInt((configuracion?.horaCierre || "20:00").split(":")[0], 10) || 20;
  
  const timeSlots: string[] = [];
  for (let h = aperturaHour; h < cierreHour; h++) {
    timeSlots.push(`${h.toString().padStart(2, "0")}:00`);
  }

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

  // Filtrar citas por fecha seleccionada y terapeuta
  const citasDelDia = citas.filter((c) => {
    const dStr = new Date(c.fechaHoraInicio).toISOString().split("T")[0];
    if (dStr !== selectedDate) return false;
    if (filterTerapeuta !== "TODOS" && c.terapeutaId !== filterTerapeuta) return false;
    return true;
  });

  const getCitasCountPorSala = (salaId: string) => {
    return citas.filter((c) => {
      const dStr = new Date(c.fechaHoraInicio).toISOString().split("T")[0];
      return dStr === selectedDate && c.salaId === salaId && c.estado !== "CANCELADA";
    }).length;
  };

  const displayedSalas = selectedMobileSala === "TODAS" ? salas : salas.filter((s) => s.id === selectedMobileSala);
  const numSalas = displayedSalas.length;

  // Estilo dinámico de grilla para N salas
  const gridHeaderStyle = selectedMobileSala === "TODAS"
    ? { gridTemplateColumns: `80px repeat(${numSalas}, minmax(160px, 1fr))` }
    : { gridTemplateColumns: "80px 1fr" };

  return (
    <div className="space-y-4">
      {/* Cabecera y Selector de Fecha */}
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
              Mostrando {displayedSalas.length} de {salas.length} sala(s) física(s) ({salas.filter((s) => s.estado === "DISPONIBLE").length} operativas).
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
            <option value="TODOS">Todos los Terapeutas</option>
            {terapeutas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
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
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition ml-auto sm:ml-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Cita</span>
          </button>
        </div>
      </div>

      {/* Selector Rápido de Salas Dinámicas */}
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

      {/* Leyenda de Estados */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <span className="font-bold text-slate-700">Estados:</span>
        <span className="inline-flex items-center gap-1.5 text-indigo-700 font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Programada
        </span>
        <span className="inline-flex items-center gap-1.5 text-blue-700 font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Confirmada
        </span>
        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Atendida
        </span>
        <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> No Asistió
        </span>
        <span className="inline-flex items-center gap-1.5 text-rose-700 font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Cancelada
        </span>
        <span className="inline-flex items-center gap-1.5 text-amber-900 font-bold ml-auto bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Reevaluación Obligatoria (Sesión 5)
        </span>
      </div>

      {/* Matriz 100% Dinámica de Citas por Salas con Scroll Elástico */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full" style={{ minWidth: selectedMobileSala === "TODAS" ? `${Math.max(900, numSalas * 160 + 80)}px` : "100%" }}>
            
            {/* Header Dinámico de Salas */}
            <div 
              className="bg-slate-100/90 text-slate-800 text-xs font-bold border-b border-slate-200 sticky top-0 z-10 grid"
              style={gridHeaderStyle}
            >
              <div className="p-3 text-center border-r border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                Horario
              </div>
              {displayedSalas.map((sala) => (
                <div key={sala.id} className="p-3 text-center border-r border-slate-200 last:border-r-0">
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
                  <span className="text-[11px] text-teal-700 font-semibold block mt-0.5">
                    {sala.estado === "DISPONIBLE" 
                      ? `${getCitasCountPorSala(sala.id)} citas (${Math.round((getCitasCountPorSala(sala.id) / (timeSlots.length || 1)) * 100)}%)`
                      : "⚠️ En Mantenimiento"}
                  </span>
                </div>
              ))}
            </div>

            {/* Filas Dinámicas por Horario según Configuración */}
            <div className="divide-y divide-slate-100">
              {timeSlots.map((slot) => {
                const [slotHour] = slot.split(":").map(Number);

                return (
                  <div 
                    key={slot} 
                    className="min-h-[85px] grid"
                    style={gridHeaderStyle}
                  >
                    {/* Columna de Horario */}
                    <div className="p-2.5 bg-slate-50/70 border-r border-slate-200 text-center flex flex-col justify-start items-center">
                      <span className="text-xs font-bold text-slate-700">{slot}</span>
                      <span className="text-[10px] text-slate-400">45-60m</span>
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

      {/* Modal / Panel Interactivo de Gestión Rápida de Cita */}
      {selectedCitaDetail && (() => {
        const paciente = pacientes.find((p) => p.id === selectedCitaDetail.pacienteId);
        const sala = salas.find((s) => s.id === selectedCitaDetail.salaId);
        const terapeuta = terapeutas.find((t) => t.id === selectedCitaDetail.terapeutaId);
        const paquete = paquetes.find((p) => p.id === selectedCitaDetail.paqueteId);

        // Limpiar teléfono y preparar enlace WhatsApp para recordatorio inteligente
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
            <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              
              {/* Encabezado */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      Gestión Operativa de Cita
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      ID: {selectedCitaDetail.id} • {selectedCitaDetail.estado}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCitaDetail(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                  aria-label="Cerrar modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Contenido de la Ficha */}
              <div className="space-y-3 text-xs">
                
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
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Terapeuta Responsable</span>
                    <span className="font-bold text-slate-800 block text-xs mt-0.5 truncate">
                      {terapeuta?.nombre || "Terapeuta"}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Lic. Fisioterapia</span>
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
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase",
                      paquete.estadoPago === "PAGADO" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                    )}>
                      {paquete.estadoPago}
                    </span>
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

                {/* Trazabilidad de Recepción */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Trazabilidad</span>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Agendada por:</span>
                    <span className="font-semibold text-slate-700">{selectedCitaDetail.creadoPorNombre || "Recepción AJ Fisioterapia"}</span>
                  </div>
                  {selectedCitaDetail.confirmadoPorNombre ? (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Aceptada / Confirmada por:</span>
                      <span className="font-bold text-teal-700">{selectedCitaDetail.confirmadoPorNombre}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Estado de Aceptación:</span>
                      <span className="text-slate-400 italic">Pendiente de confirmación</span>
                    </div>
                  )}
                </div>

                {/* Botones de Cambio de Estado Rápido en 1 Clic */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Acciones Rápidas</span>
                  <div className="grid grid-cols-3 gap-2">
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
              </div>

              {/* Botones Inferiores de Navegación */}
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
          </div>
        );
      })()}
    </div>
  );
}
