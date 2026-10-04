"use client";

import { useState } from "react";
import { agendarCita } from "@/server/actions/citas";
import { AlertCircle, CheckCircle2, Calendar, Clock, User, ShieldAlert, Sparkles } from "lucide-react";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  salas: any[];
  terapeutas: any[];
  pacientes: any[];
  paquetes: any[];
  prefilledSalaId?: string;
  prefilledDate?: string;
  prefilledTime?: string;
  onCitaAgendada: (cita: any) => void;
}

export function NewAppointmentModal({
  isOpen,
  onClose,
  salas,
  terapeutas,
  pacientes,
  paquetes,
  prefilledSalaId,
  prefilledDate,
  prefilledTime,
  onCitaAgendada,
}: NewAppointmentModalProps) {
  const [pacienteId, setPacienteId] = useState(pacientes[0]?.id || "");
  const [paqueteId, setPaqueteId] = useState("");
  const [salaId, setSalaId] = useState(prefilledSalaId || salas[0]?.id || "");
  const [terapeutaId, setTerapeutaId] = useState(terapeutas[0]?.id || "");
  const [fecha, setFecha] = useState(prefilledDate || new Date().toISOString().split("T")[0]);
  const [hora, setHora] = useState(prefilledTime || "09:00");
  const [duracion, setDuracion] = useState(45);
  const [esReevaluacion, setEsReevaluacion] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filtrar paquetes del paciente seleccionado
  const paquetesDelPaciente = paquetes.filter((p) => p.pacienteId === pacienteId);
  const paqueteSeleccionado = paquetes.find((p) => p.id === paqueteId);

  // Advertencia de reevaluación si el paciente alcanzará múltiplo de 5
  const esMultiploCinco = paqueteSeleccionado 
    ? (paqueteSeleccionado.sesionesConsumidas + 1) % 5 === 0 
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const [hour, minute] = hora.split(":").map(Number);
      const [year, month, day] = fecha.split("-").map(Number);
      const fechaHoraInicio = new Date(year, month - 1, day, hour, minute);

      const res = await agendarCita({
        pacienteId,
        paqueteId: paqueteId || null,
        terapeutaId,
        salaId,
        fechaHoraInicio,
        duracionMinutos: duracion,
        esReevaluacion: esReevaluacion || esMultiploCinco,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Error al agendar la cita.");
        setLoading(false);
        return;
      }

      onCitaAgendada(res.data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Agendar Nueva Cita Terapéutica
            </h3>
            <p className="text-xs text-slate-500">
              Validación en tiempo real de sala, terapeuta y saldo de paquete.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Conflicto de Concurrencia o Regla:</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {/* Paciente */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Paciente Registrado
            </label>
            <select
              value={pacienteId}
              onChange={(e) => {
                setPacienteId(e.target.value);
                setPaqueteId("");
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            >
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombres} {p.apellidos} — DNI: {p.dni}
                </option>
              ))}
            </select>
          </div>

          {/* Paquete de Sesiones */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Vincular a Paquete de Tratamiento (Opcional / Cita Individual)
            </label>
            <select
              value={paqueteId}
              onChange={(e) => setPaqueteId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="">-- Sin paquete (Cita de Evaluación o Sesión Individual) --</option>
              {paquetesDelPaciente.map((paq) => (
                <option key={paq.id} value={paq.id}>
                  Paquete {paq.totalSesiones} Sesiones (Consumidas: {paq.sesionesConsumidas}/{paq.totalSesiones} • Estado: {paq.estadoPago})
                </option>
              ))}
            </select>
            {paquetesDelPaciente.length === 0 && (
              <p className="text-[10px] text-slate-500 mt-1">
                El paciente no tiene paquetes activos. Se agendará como sesión individual.
              </p>
            )}
          </div>

          {/* Alerta de regla de 5 sesiones */}
          {esMultiploCinco && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Hito Clínico AJ Fisioterapia:</span>
                Esta será la sesión #{paqueteSeleccionado!.sesionesConsumidas + 1}. El sistema marcará automáticamente la cita con la bandera obligatoria de Reevaluación Fisioterapéutica.
              </div>
            </div>
          )}

          {/* Sala y Terapeuta */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sala Física
              </label>
              <select
                value={salaId}
                onChange={(e) => setSalaId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              >
                {salas.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} ({s.estado})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Terapeuta Asignado
              </label>
              <select
                value={terapeutaId}
                onChange={(e) => setTerapeutaId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              >
                {terapeutas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fecha, Hora y Duración */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hora de Inicio
              </label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Duración
              </label>
              <select
                value={duracion}
                onChange={(e) => setDuracion(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos (Neurológica)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm shadow-teal-600/30 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {loading ? "Validando Concurrencia..." : "Confirmar Cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
