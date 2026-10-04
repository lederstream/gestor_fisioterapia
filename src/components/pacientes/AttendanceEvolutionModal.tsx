"use client";

import { useState } from "react";
import { registrarAsistenciaYEvolucion } from "@/server/actions/evolucion";
import { Activity, AlertTriangle, CheckCircle2, ShieldAlert, Award, FileCheck } from "lucide-react";

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
  
  // Campos estructurados de Reevaluación (Hito de 5 sesiones)
  const [romGrados, setRomGrados] = useState("Flexión 110°, Extensión completa 0°");
  const [escalaDaniels, setEscalaDaniels] = useState("4/5 (Contra gravedad y resistencia moderada)");
  const [testFuncional, setTestFuncional] = useState("Test de movilidad negativo a dolor irradiado.");
  const [dictamenClinico, setDictamenClinico] = useState("Aprobado para pase a fase 2 de fortalecimiento.");
  const [completarReevaluacion, setCompletarReevaluacion] = useState(true);

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

    // Si es reevaluación, ensamblar notas estructuradas
    let notasFinales = "";
    if (esReevaluacion) {
      notasFinales = `[REEVALUACIÓN CLÍNICA SESIÓN 5] ROM: ${romGrados} | Daniels: ${escalaDaniels} | Test: ${testFuncional} | Dictamen: ${dictamenClinico}`;
    }

    try {
      const res = await registrarAsistenciaYEvolucion({
        citaId,
        terapeutaId,
        evaDolorInicio,
        evaDolorFin,
        tratamientoAplicado,
        notasReevaluacion: notasFinales || undefined,
        completarReevaluacion: esReevaluacion ? completarReevaluacion : false,
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
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Registro de Asistencia y Evolución Clínica
              </h3>
              <p className="text-[11px] text-slate-500">
                {paciente.nombres} {paciente.apellidos} (DNI: {paciente.dni})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-base font-bold p-1 rounded-lg"
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            >
              {citasProgramadas.map((c) => (
                <option key={c.id} value={c.id}>
                  {new Date(c.fechaHoraInicio).toLocaleDateString("es-PE")} • {new Date(c.fechaHoraInicio).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — {c.sala?.nombre || "Sala"} {c.esReevaluacion ? "⚠️ [REEVALUACIÓN OBLIGATORIA]" : ""}
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            >
              {terapeutas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} ({t.especialidad || "Fisioterapia"})
                </option>
              ))}
            </select>
          </div>

          {/* Banner de Reevaluación */}
          {esReevaluacion && (
            <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-2xl text-amber-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Hito Clínico: Examen de Reevaluación Periódica (Sesión 5)
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Esta sesión coincide con el hito obligatorio de 5 sesiones asistidas. Complete el protocolo biomecánico para acreditar el progreso y habilitar el alta médica.
              </p>
            </div>
          )}

          {/* Escala EVA Sliders */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700">EVA Inicial:</span>
                <span className="font-bold px-2 py-0.5 rounded-lg bg-teal-700 text-white text-xs">
                  {evaDolorInicio}/10
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
                <span>10 (Severo)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700">EVA Final:</span>
                <span className="font-bold px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-xs">
                  {evaDolorFin}/10
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
                <span>10 (Severo)</span>
              </div>
            </div>
          </div>

          {/* Tratamiento Aplicado */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tratamiento y Técnicas Aplicadas en la Sesión
            </label>
            <textarea
              rows={2}
              value={tratamientoAplicado}
              onChange={(e) => setTratamientoAplicado(e.target.value)}
              placeholder="Ej. Terapia manual articular, punción seca miofascial, electroestimulación TENS 20 min..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          {/* Formulario Biomecánico Estructurado si es Reevaluación */}
          {esReevaluacion && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 block text-xs flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-teal-600" />
                Protocolo Biomecánico Formal (AJ Fisioterapia San Borja)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                    Goniometría ROM (Grados Articulares)
                  </label>
                  <input
                    type="text"
                    value={romGrados}
                    onChange={(e) => setRomGrados(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                    Fuerza Muscular (Escala Daniels 1-5)
                  </label>
                  <input
                    type="text"
                    value={escalaDaniels}
                    onChange={(e) => setEscalaDaniels(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                  Test Funcional / Maniobra Específica
                </label>
                <input
                  type="text"
                  value={testFuncional}
                  onChange={(e) => setTestFuncional(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                  Dictamen Clínico y Conducta Terapéutica
                </label>
                <input
                  type="text"
                  value={dictamenClinico}
                  onChange={(e) => setDictamenClinico(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={completarReevaluacion}
                  onChange={(e) => setCompletarReevaluacion(e.target.checked)}
                  className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                />
                <span className="font-bold text-teal-800 text-[11px]">
                  Acreditar cumplimiento formal de Reevaluación (Desbloquear Alta Médica)
                </span>
              </label>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/30 transition disabled:opacity-50"
            >
              {loading ? "Guardando Registro..." : "Registrar Atención"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
