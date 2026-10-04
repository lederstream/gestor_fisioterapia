"use client";

import { useState } from "react";
import { formatTime, cn } from "@/lib/utils";
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Plus, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from "lucide-react";
import { NewAppointmentModal } from "./NewAppointmentModal";

interface MatrixGridProps {
  initialCitas: any[];
  salas: any[];
  terapeutas: any[];
  pacientes: any[];
  paquetes: any[];
  servicios: any[];
}

// Horarios de atención: 08:00 a 20:00 (bloques de 45-60 min)
const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

export function MatrixGrid({
  initialCitas,
  salas,
  terapeutas,
  pacientes,
  paquetes,
  servicios,
}: MatrixGridProps) {
  const [citas, setCitas] = useState(initialCitas);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefilledSalaId, setPrefilledSalaId] = useState<string | undefined>(undefined);
  const [prefilledTime, setPrefilledTime] = useState<string | undefined>(undefined);
  const [selectedCitaDetail, setSelectedCitaDetail] = useState<any | null>(null);

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

  const [filterTerapeuta, setFilterTerapeuta] = useState("TODOS");
  const [selectedMobileSala, setSelectedMobileSala] = useState<string>("TODAS");

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

  return (
    <div className="space-y-4">
      {/* Action Header & Date Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl border border-teal-100">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Matriz Operativa de Salas Físicas
            </h2>
            <p className="text-xs text-slate-500">
              6 salas simultáneas • Capacidad 30-50 pacientes diarios
            </p>
          </div>
        </div>

        {/* Filters and Date Navigator */}
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
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
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
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
              aria-label="Día siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
            className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
          >
            Hoy
          </button>

          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Cita</span>
          </button>
        </div>
      </div>

      {/* Selector de Salas para Móviles y Tablet */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 pr-2 shrink-0 hidden sm:inline">
          Vista Sala:
        </span>
        <button
          onClick={() => setSelectedMobileSala("TODAS")}
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition shrink-0",
            selectedMobileSala === "TODAS"
              ? "bg-teal-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          )}
        >
          Todas las Salas (6)
        </button>
        {salas.map((sala) => (
          <button
            key={sala.id}
            onClick={() => setSelectedMobileSala(sala.id)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0",
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

      {/* Matriz Interactiva de Salas (Daylight Theme) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className={selectedMobileSala === "TODAS" ? "min-w-[960px]" : "w-full"}>
            {/* Header Daylight de Salas */}
            <div 
              className={cn(
                "bg-slate-100/90 text-slate-800 text-xs font-bold border-b border-slate-200 sticky top-0 z-10",
                selectedMobileSala === "TODAS" 
                  ? "grid grid-cols-[80px_repeat(6,1fr)]" 
                  : "grid grid-cols-[80px_1fr]"
              )}
            >
              <div className="p-3 text-center border-r border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                Horario
              </div>
              {displayedSalas.map((sala) => (
                <div key={sala.id} className="p-3 text-center border-r border-slate-200 last:border-r-0">
                  <span className="text-slate-900 block font-extrabold text-sm">{sala.nombre}</span>
                  <span className="text-[11px] text-teal-700 font-semibold block mt-0.5">
                    {sala.estado === "DISPONIBLE" 
                      ? `${getCitasCountPorSala(sala.id)} citas (${Math.round((getCitasCountPorSala(sala.id) / TIME_SLOTS.length) * 100)}%)`
                      : "⚠️ Mantenimiento"}
                  </span>
                </div>
              ))}
            </div>

            {/* Time Slot Rows */}
            <div className="divide-y divide-slate-100">
              {TIME_SLOTS.map((slot) => {
                const [slotHour] = slot.split(":").map(Number);

                return (
                  <div 
                    key={slot} 
                    className={cn(
                      "min-h-[85px]",
                      selectedMobileSala === "TODAS" 
                        ? "grid grid-cols-[80px_repeat(6,1fr)]" 
                        : "grid grid-cols-[80px_1fr]"
                    )}
                  >
                    {/* Time Label */}
                    <div className="p-2.5 bg-slate-50/70 border-r border-slate-200 text-center flex flex-col justify-start items-center">
                      <span className="text-xs font-bold text-slate-700">{slot}</span>
                      <span className="text-[10px] text-slate-400">45-60m</span>
                    </div>

                    {/* Columns for displayed room(s) */}
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
                            !appointment && "hover:bg-teal-50/40 cursor-pointer"
                          )}
                          onClick={() => {
                            if (!appointment) {
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

                              {/* ALERTA DE REEVALUACIÓN OBLIGATORIA */}
                              {appointment.esReevaluacion && (
                                <div className="mt-1.5 flex items-center gap-1 text-[9px] font-bold text-amber-900 bg-amber-200/90 border border-amber-400/80 px-1.5 py-0.5 rounded animate-pulse">
                                  <AlertTriangle className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                                  <span className="truncate">Reevaluación Fisioterapéutica</span>
                                </div>
                              )}
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

      {/* Modal / Panel de detalle rápido de cita */}
      {selectedCitaDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-base">Ficha de Cita Reservada</h3>
              <button
                onClick={() => setSelectedCitaDetail(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Paciente</span>
                <span className="text-slate-800 font-bold text-sm">
                  {pacientes.find((p) => p.id === selectedCitaDetail.pacienteId)?.nombres}{" "}
                  {pacientes.find((p) => p.id === selectedCitaDetail.pacienteId)?.apellidos}
                </span>
                <span className="text-slate-500 block text-[11px]">
                  DNI: {pacientes.find((p) => p.id === selectedCitaDetail.pacienteId)?.dni} • Tel: {pacientes.find((p) => p.id === selectedCitaDetail.pacienteId)?.telefono}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-lg border">
                  <span className="text-slate-400 text-[10px] block">Sala Asignada</span>
                  <span className="font-semibold text-slate-800">
                    {salas.find((s) => s.id === selectedCitaDetail.salaId)?.nombre}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border">
                  <span className="text-slate-400 text-[10px] block">Terapeuta</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {terapeutas.find((t) => t.id === selectedCitaDetail.terapeutaId)?.nombre}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border">
                <span className="text-slate-400 text-[10px] block">Horario Programado</span>
                <span className="font-bold text-slate-800">
                  {new Date(selectedCitaDetail.fechaHoraInicio).toLocaleDateString("es-PE")} • {formatTime(selectedCitaDetail.fechaHoraInicio)} a {formatTime(selectedCitaDetail.fechaHoraFin)}
                </span>
              </div>

              {selectedCitaDetail.esReevaluacion && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900">
                  <p className="font-bold flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Reevaluación Clínica Obligatoria
                  </p>
                  <p className="text-[11px] text-amber-800 mt-1">
                    Esta sesión coincide con el hito de 5 sesiones asistidas. El terapeuta debe rellenar la escala EVA y test biomecánico antes del alta.
                  </p>
                </div>
              )}

              {/* Botones de Cambio de Estado Rápido */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Acciones de Recepción y Control</span>
                <div className="grid grid-cols-3 gap-2">
                  {selectedCitaDetail.estado === "PROGRAMADA" && (
                    <button
                      onClick={async () => {
                        const { actualizarEstadoCita } = await import("@/server/actions/citas");
                        await actualizarEstadoCita(selectedCitaDetail.id, "CONFIRMADA");
                        setCitas((prev) => prev.map((c) => c.id === selectedCitaDetail.id ? { ...c, estado: "CONFIRMADA" } : c));
                        setSelectedCitaDetail((prev: any) => ({ ...prev, estado: "CONFIRMADA" }));
                      }}
                      className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 text-center transition"
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
                      className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 text-center transition"
                    >
                      No Asistió
                    </button>
                  )}

                  {selectedCitaDetail.estado !== "CANCELADA" && selectedCitaDetail.estado !== "ATENDIDA" && (
                    <button
                      onClick={async () => {
                        if (confirm("¿Está seguro de cancelar esta cita? La sala quedará libre.")) {
                          const { actualizarEstadoCita } = await import("@/server/actions/citas");
                          await actualizarEstadoCita(selectedCitaDetail.id, "CANCELADA");
                          setCitas((prev) => prev.map((c) => c.id === selectedCitaDetail.id ? { ...c, estado: "CANCELADA" } : c));
                          setSelectedCitaDetail((prev: any) => ({ ...prev, estado: "CANCELADA" }));
                        }
                      }}
                      className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 text-center transition"
                    >
                      Cancelar Cita
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <a
                href={`/dashboard/pacientes/${selectedCitaDetail.pacienteId}`}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition"
              >
                Ficha EVA y Evolución
              </a>
              <button
                onClick={() => setSelectedCitaDetail(null)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
