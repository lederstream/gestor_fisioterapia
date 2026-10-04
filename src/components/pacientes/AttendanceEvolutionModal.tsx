"use client";

import { useState } from "react";
import { registrarAsistenciaYEvolucion } from "@/server/actions/evolucion";
import { Activity, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

interface AttendanceEvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  citasProgramadas: any[];
  terapeutas: any[];
  paciente: any;
  onEvolucionRegistrada: () => void;
}

export function AttendanceEvolutionModal({
  isOpen,
  onClose,
  citasProgramadas,
  terapeutas,
  paciente,
  onEvolucionRegistrada,
}: AttendanceEvolutionModalProps) {
  const [citaId, setCitaId] = useState(citasProgramadas[0]?.id || "");
  const [terapeutaId, setTerapeutaId] = useState(citasProgramadas[0]?.terapeutaId || terapeutas[0]?.id || "");
  const [evaDolorInicio, setEvaDolorInicio] = useState<number>(6);
  const [evaDolorFin, setEvaDolorFin] = useState<number>(3);
  const [tratamientoAplicado, setTratamientoAplicado] = useState("");
  const [notasReevaluacion, setNotasReevaluacion] = useState("");
  const [completarReevaluacion, setCompletarReevaluacion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const citaSeleccionada = citasProgramadas.find((c) => c.id === citaId);
  const esReevaluacion = citaSeleccionada?.esReevaluacion || false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (tratamientoAplicado.trim().length < 10) {
      setErrorMsg("Describa el tratamiento aplicado con al menos 10 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const res = await registrarAsistenciaYEvolucion({
        citaId,
        terapeutaId,
        evaDolorInicio,
        evaDolorFin,
        tratamientoAplicado,
        notasReevaluacion: notasReevaluacion || undefined,
        completarReevaluacion: completarReevaluacion || esReevaluacion,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Error al registrar la asistencia.");
        setLoading(false);
        return;
      }

      onEvolucionRegistrada();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Registrar Asistencia y Evolución Clínica
              </h3>
              <p className="text-[11px] text-slate-500">
                {paciente.nombres} {paciente.apellidos} (DNI: {paciente.dni})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-base font-bold p-1"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Cita a confirmar */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Cita Programada a Atender
            </label>
            <select
              value={citaId}
              onChange={(e) => {
                setCitaId(e.target.value);
                const c = citasProgramadas.find((item) => item.id === e.target.value);
                if (c) setTerapeutaId(c.terapeutaId);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            >
              {citasProgramadas.map((c) => (
                <option key={c.id} value={c.id}>
                  {new Date(c.fechaHoraInicio).toLocaleDateString("es-PE")} • {new Date(c.fechaHoraInicio).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — {c.sala?.nombre || "Sala"} {c.esReevaluacion ? "⚠️ [REEVALUACIÓN]" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Terapeuta Responsable */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Terapeuta Responsable de la Atención
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

          {/* Banner de Reevaluación */}
          {esReevaluacion && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Hito de Reevaluación Física Obligatoria
              </div>
              <p className="text-[11px] text-amber-800">
                Esta sesión corresponde a la reevaluación obligatoria de 5 sesiones. Describa detalladamente los avances biomecánicos o pruebas funcionales abajo.
              </p>
            </div>
          )}

          {/* Sliders Escala EVA Inicio y Fin */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700">EVA Inicio (0-10):</span>
                <span className="font-bold px-2 py-0.5 rounded bg-slate-800 text-white text-xs">
                  {evaDolorInicio}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={evaDolorInicio}
                onChange={(e) => setEvaDolorInicio(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                <span>0 (Sin Dolor)</span>
                <span>10 (Incapacitante)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700">EVA Fin (0-10):</span>
                <span className="font-bold px-2 py-0.5 rounded bg-emerald-600 text-white text-xs">
                  {evaDolorFin}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={evaDolorFin}
                onChange={(e) => setEvaDolorFin(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                <span>0 (Sin Dolor)</span>
                <span>10 (Incapacitante)</span>
              </div>
            </div>
          </div>

          {/* Tratamiento Aplicado */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tratamiento y Técnicas Fisioterapéuticas Aplicadas
            </label>
            <textarea
              rows={3}
              value={tratamientoAplicado}
              onChange={(e) => setTratamientoAplicado(e.target.value)}
              placeholder="Ej. Terapia manual grado III, electroterapia TENS 20 min, ejercicios excéntricos de cuádriceps..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          {/* Notas de Reevaluación / Observaciones */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Notas de Reevaluación o Evolución {esReevaluacion ? "(Requerido para Reevaluación)" : "(Opcional)"}
            </label>
            <textarea
              rows={2}
              value={notasReevaluacion}
              onChange={(e) => setNotasReevaluacion(e.target.value)}
              placeholder={esReevaluacion ? "Detalle rangos articulares goniométricos, fuerza muscular..." : "Observaciones para la siguiente sesión..."}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {esReevaluacion && (
            <label className="flex items-center gap-2 cursor-pointer bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              <input
                type="checkbox"
                checked={completarReevaluacion}
                onChange={(e) => setCompletarReevaluacion(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 accent-teal-600"
              />
              <span className="font-semibold text-amber-900 text-xs">
                Acreditar cumplimiento formal del test de reevaluación física (Desbloquear emisión de alta).
              </span>
            </label>
          )}

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
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
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm shadow-teal-600/30 transition disabled:opacity-50"
            >
              {loading ? "Guardando Evolución..." : "Registrar Asistencia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
