"use client";

import { useState, useMemo } from "react";
import { agendarCita } from "@/server/actions/citas";
import { cn } from "@/lib/utils";
import { 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  ShieldAlert, 
  Sparkles, 
  Search, 
  Layers, 
  X,
  Check
} from "lucide-react";

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
  const [searchPatient, setSearchPatient] = useState("");
  const [paqueteId, setPaqueteId] = useState("");
  const [salaId, setSalaId] = useState(prefilledSalaId || salas[0]?.id || "");
  const [terapeutaId, setTerapeutaId] = useState(terapeutas[0]?.id || "");
  const [fecha, setFecha] = useState(prefilledDate || new Date().toISOString().split("T")[0]);
  const [hora, setHora] = useState(prefilledTime || "09:00");
  const [duracion, setDuracion] = useState(45);
  const [esReevaluacion, setEsReevaluacion] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtrado predictivo de pacientes por Nombre, Apellido, DNI o Teléfono
  const filteredPacientes = useMemo(() => {
    if (!searchPatient.trim()) return pacientes.slice(0, 8);
    const q = searchPatient.toLowerCase().trim();
    return pacientes.filter((p) => {
      const full = `${p.nombres} ${p.apellidos}`.toLowerCase();
      return full.includes(q) || (p.dni && p.dni.includes(q)) || (p.telefono && p.telefono.includes(q));
    });
  }, [pacientes, searchPatient]);

  const selectedPatient = pacientes.find((p) => p.id === pacienteId);

  // Filtrar paquetes del paciente seleccionado
  const paquetesDelPaciente = useMemo(() => {
    return paquetes.filter((p) => p.pacienteId === pacienteId);
  }, [paquetes, pacienteId]);

  const paqueteSeleccionado = paquetes.find((p) => p.id === paqueteId);

  // Advertencia de reevaluación si el paciente alcanzará múltiplo de 5
  const esMultiploCinco = paqueteSeleccionado 
    ? (paqueteSeleccionado.sesionesConsumidas + 1) % 5 === 0 
    : false;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!pacienteId) {
      setErrorMsg("Debe seleccionar un paciente para agendar la cita.");
      setLoading(false);
      return;
    }

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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Cabecera Limpia */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl shrink-0 border border-teal-200">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Agendar Nueva Cita Terapéutica
              </h3>
              <p className="text-[11px] text-slate-500">
                Asignación inteligente de sala física, fisioterapeuta y paquete
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario Scroleable */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECCIÓN 1: SELECCIÓN PREDICTIVA DE PACIENTE */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700">
              Paciente Asignado *
            </label>

            {/* Buscador Rápido */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por DNI o Nombre del paciente..."
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none text-xs"
              />
            </div>

            {/* Lista desplegable compacta de resultados */}
            <div className="max-h-28 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white">
              {filteredPacientes.length === 0 ? (
                <div className="p-2.5 text-center text-slate-400 text-[11px]">
                  No se encontraron pacientes con esa búsqueda.
                </div>
              ) : (
                filteredPacientes.map((p) => {
                  const isSelected = p.id === pacienteId;
                  const paqs = paquetes.filter((pa) => pa.pacienteId === p.id);
                  const paqActivo = paqs.find((pa) => pa.sesionesConsumidas < pa.totalSesiones);

                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => {
                        setPacienteId(p.id);
                        if (paqActivo) {
                          setPaqueteId(paqActivo.id);
                        } else {
                          setPaqueteId("");
                        }
                      }}
                      className={cn(
                        "w-full p-2 text-left flex items-center justify-between text-xs transition cursor-pointer hover:bg-teal-50/50",
                        isSelected && "bg-teal-50/80 font-bold text-teal-900"
                      )}
                    >
                      <div>
                        <span className="font-bold text-slate-800 block text-xs">
                          {p.nombres} {p.apellidos}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {p.tipoDocumento || "DNI"}: {p.dni} • Tel: {p.telefono}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {paqActivo ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            Paquete ({paqActivo.sesionesConsumidas}/{paqActivo.totalSesiones})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">
                            Sesión Suelta
                          </span>
                        )}
                        {isSelected && <Check className="w-3.5 h-3.5 text-teal-600" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {selectedPatient && (
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
                <span>
                  Seleccionado: <strong className="text-slate-800">{selectedPatient.nombres} {selectedPatient.apellidos}</strong>
                </span>
                <span className="font-mono text-slate-500">{selectedPatient.dni}</span>
              </div>
            )}
          </div>

          {/* SECCIÓN 2: VINCULACIÓN DE PAQUETE */}
          <div className="space-y-1 pt-1">
            <label className="block font-semibold text-slate-700">
              Vincular a Paquete de Tratamiento (Opcional)
            </label>
            <select
              value={paqueteId}
              onChange={(e) => setPaqueteId(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
            >
              <option value="">-- Sin paquete (Cobro por sesión individual o evaluación) --</option>
              {paquetesDelPaciente.map((paq) => (
                <option key={paq.id} value={paq.id}>
                  Paquete {paq.totalSesiones} Sesiones (Consumidas: {paq.sesionesConsumidas}/{paq.totalSesiones} • Pago: {paq.estadoPago})
                </option>
              ))}
            </select>
          </div>

          {/* Alerta de regla de 5 sesiones */}
          {esMultiploCinco && (
            <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Hito Clínico AJ Fisioterapia:</span>
                Esta será la sesión #{paqueteSeleccionado!.sesionesConsumidas + 1}. El sistema marcará automáticamente la cita con la bandera obligatoria de Reevaluación Fisioterapéutica.
              </div>
            </div>
          )}

          {/* SECCIÓN 3: SALA FÍSICA Y TERAPEUTA RESPONSABLE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sala Física *
              </label>
              <select
                value={salaId}
                onChange={(e) => setSalaId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
                required
              >
                {salas.map((s) => (
                  <option key={s.id} value={s.id} disabled={s.estado === "MANTENIMIENTO"}>
                    {s.nombre} {s.estado === "MANTENIMIENTO" ? "(⚠️ En Mantenimiento)" : s.equipamiento ? `— ${s.equipamiento}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Terapeuta Asignado *
              </label>
              <select
                value={terapeutaId}
                onChange={(e) => setTerapeutaId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
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

          {/* SECCIÓN 4: FECHA, HORA Y DURACIÓN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hora de Inicio *
              </label>
              <input
                type="time"
                required
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Duración (min) *
              </label>
              <select
                value={duracion}
                onChange={(e) => setDuracion(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
              >
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos (Estándar)</option>
                <option value={60}>60 minutos (1 hora)</option>
                <option value={90}>90 minutos (Extensa)</option>
              </select>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Agendando..." : "Confirmar Cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
