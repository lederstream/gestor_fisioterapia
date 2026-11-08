"use client";

import { useState, useMemo, useEffect } from "react";
import { agendarCita } from "@/server/actions/citas";
import { cn } from "@/lib/utils";
import { getPeruDateString, createPeruDate } from "@/lib/date-utils";
import { 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  ShieldAlert, 
  Search, 
  Layers, 
  X,
  Check,
  Stethoscope,
  Building2,
  Phone,
  FileText,
  ChevronDown
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

const DURACIONES = [
  { valor: 30, etiqueta: "30 min", detalle: "Rápida" },
  { valor: 45, etiqueta: "45 min", detalle: "Estándar" },
  { valor: 60, etiqueta: "60 min", detalle: "Completa" },
  { valor: 90, etiqueta: "90 min", detalle: "Extensa" },
];

const HORARIOS_RAPIDOS = ["08:00", "09:00", "10:00", "11:00", "15:00", "16:00", "17:00", "18:00"];

export function NewAppointmentModal({
  isOpen,
  onClose,
  salas = [],
  terapeutas = [],
  pacientes = [],
  paquetes = [],
  prefilledSalaId,
  prefilledDate,
  prefilledTime,
  onCitaAgendada,
}: NewAppointmentModalProps) {
  const effectiveSalas = salas || [];
  const effectiveTerapeutas = (terapeutas || []).filter(
    (t: any) => (t.rol === "TERAPEUTA" || t.rol === "ASISTENTE" || !t.rol) && t.rol !== "SUPERADMIN" && t.rol !== "ADMIN"
  );

  const [pacienteId, setPacienteId] = useState(pacientes[0]?.id || "");
  const [searchPatient, setSearchPatient] = useState("");
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);
  const [paqueteId, setPaqueteId] = useState("");
  const [salaId, setSalaId] = useState(prefilledSalaId || effectiveSalas[0]?.id || "");
  const [terapeutaId, setTerapeutaId] = useState(effectiveTerapeutas[0]?.id || "");
  const [fecha, setFecha] = useState(prefilledDate || getPeruDateString());
  const [hora, setHora] = useState(prefilledTime || "09:00");
  const [duracion, setDuracion] = useState(45);
  const [esReevaluacion, setEsReevaluacion] = useState(false);
  const [notasCita, setNotasCita] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sincronizar prefilled valores si cambian
  useEffect(() => {
    if (prefilledSalaId) setSalaId(prefilledSalaId);
    if (prefilledDate) setFecha(prefilledDate);
    if (prefilledTime) setHora(prefilledTime);
  }, [prefilledSalaId, prefilledDate, prefilledTime]);

  // Asegurar que salaId y terapeutaId tengan valor inicial válido
  useEffect(() => {
    if (!salaId && effectiveSalas.length > 0) {
      setSalaId(effectiveSalas[0].id);
    }
    if (!terapeutaId && effectiveTerapeutas.length > 0) {
      setTerapeutaId(effectiveTerapeutas[0].id);
    }
  }, [effectiveSalas, effectiveTerapeutas, salaId, terapeutaId]);

  // Filtrado predictivo de pacientes
  const filteredPacientes = useMemo(() => {
    if (!searchPatient.trim()) return pacientes.slice(0, 6);
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
      setErrorMsg("Por favor seleccione un paciente para agendar la cita.");
      setLoading(false);
      return;
    }

    if (!salaId) {
      setErrorMsg("Por favor seleccione una sala física.");
      setLoading(false);
      return;
    }

    if (!terapeutaId) {
      setErrorMsg("Por favor seleccione un terapeuta responsable.");
      setLoading(false);
      return;
    }

    try {
      const fechaHoraInicio = createPeruDate(fecha, hora);

      const res = await agendarCita({
        pacienteId,
        paqueteId: paqueteId || null,
        terapeutaId,
        salaId,
        fechaHoraInicio,
        duracionMinutos: duracion,
        esReevaluacion: esReevaluacion || esMultiploCinco,
        notasCita: notasCita.trim() || undefined,
      });

      if (!res.success) {
        setErrorMsg(res.error || "No se pudo agendar la cita.");
        setLoading(false);
        return;
      }

      onCitaAgendada(res.data);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  };

  const setFechaHoy = () => setFecha(getPeruDateString());
  const setFechaManana = () => {
    const [y, m, d] = getPeruDateString().split("-").map(Number);
    const next = new Date(y, m - 1, d + 1);
    setFecha(getPeruDateString(next));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* Cabecera Limpia */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Agendar Nueva Cita
              </h3>
              <p className="text-xs text-slate-500">
                Reserva de sala, asignación de terapeuta y control clínico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario Scroleable */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs shadow-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {/* 1. SELECCIÓN DE PACIENTE (COMBOBOX + PÍLDORAS) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <User className="w-3.5 h-3.5 text-teal-600" />
                Paciente *
              </label>
              {selectedPatient && (
                <button
                  type="button"
                  onClick={() => setIsSearchingPatient(!isSearchingPatient)}
                  className="text-[11px] font-bold text-teal-600 hover:text-teal-700 cursor-pointer"
                >
                  {isSearchingPatient ? "Cerrar búsqueda" : "Cambiar paciente"}
                </button>
              )}
            </div>

            {/* Píldora del paciente actualmente seleccionado */}
            {selectedPatient && !isSearchingPatient ? (
              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {selectedPatient.nombres?.[0] || "P"}{selectedPatient.apellidos?.[0] || ""}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-slate-900 block text-xs truncate">
                      {selectedPatient.nombres} {selectedPatient.apellidos}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      DNI: {selectedPatient.dni} {selectedPatient.telefono ? `• Tel: ${selectedPatient.telefono}` : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                    Seleccionado
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchingPatient(true);
                      setSearchPatient("");
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="Buscar otro paciente"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Combobox de búsqueda */
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoFocus={isSearchingPatient}
                    placeholder="Escribe DNI o Nombre del paciente..."
                    value={searchPatient}
                    onChange={(e) => setSearchPatient(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none text-xs"
                  />
                  {searchPatient && (
                    <button
                      type="button"
                      onClick={() => setSearchPatient("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Lista de candidatos */}
                <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white shadow-xs">
                  {filteredPacientes.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 text-[11px]">
                      No se encontraron pacientes que coincidan con la búsqueda.
                    </div>
                  ) : (
                    filteredPacientes.map((p) => {
                      const isSelected = p.id === pacienteId;
                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => {
                            setPacienteId(p.id);
                            setIsSearchingPatient(false);
                            const paqs = paquetes.filter((pa) => pa.pacienteId === p.id);
                            const paqActivo = paqs.find((pa) => pa.sesionesConsumidas < pa.totalSesiones);
                            setPaqueteId(paqActivo ? paqActivo.id : "");
                          }}
                          className={cn(
                            "w-full p-2.5 text-left flex items-center justify-between text-xs transition cursor-pointer hover:bg-teal-50/60",
                            isSelected && "bg-teal-50/90 font-bold text-teal-900"
                          )}
                        >
                          <div>
                            <span className="font-bold text-slate-800 block text-xs">
                              {p.nombres} {p.apellidos}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              DNI: {p.dni} {p.telefono ? `• Tel: ${p.telefono}` : ""}
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-teal-600" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2 & 3. SALA FÍSICA Y TERAPEUTA RESPONSABLE (PÍLDORAS COMBOBOX COMPACTAS EN 2 COLUMNAS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Sala Física Combobox */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Sala Física Asignada *</span>
                </label>
                {effectiveSalas.find(s => s.id === salaId)?.estado === "DISPONIBLE" && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                    ● Libre
                  </span>
                )}
              </div>
              <div className="relative">
                <select
                  value={salaId}
                  onChange={(e) => setSalaId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 focus:border-teal-500 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition cursor-pointer appearance-none pr-8"
                >
                  {effectiveSalas.map((s) => (
                    <option key={s.id} value={s.id} disabled={s.estado === "MANTENIMIENTO"}>
                      {s.nombre} {s.estado === "MANTENIMIENTO" ? "(Mantenimiento)" : "— Libre / Disponible"}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {/* Píldoras rápidas de selección de sala en un clic */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-0.5">
                {effectiveSalas.slice(0, 4).map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    disabled={s.estado === "MANTENIMIENTO"}
                    onClick={() => setSalaId(s.id)}
                    className={cn(
                      "px-2 py-0.5 text-[10px] rounded-lg font-semibold transition border shrink-0 cursor-pointer",
                      salaId === s.id
                        ? "bg-teal-600 text-white border-teal-600 shadow-2xs font-bold"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    {s.nombre}
                  </button>
                ))}
              </div>
            </div>

            {/* Terapeuta Responsable Combobox */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  <span>Terapeuta Responsable *</span>
                </label>
                <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-bold border border-teal-200">
                  Profesional
                </span>
              </div>
              <div className="relative">
                <select
                  value={terapeutaId}
                  onChange={(e) => setTerapeutaId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 focus:border-teal-500 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition cursor-pointer appearance-none pr-8"
                >
                  {effectiveTerapeutas.map((t) => {
                    const rolTexto = t.rol === "ASISTENTE" ? "Asistente" : t.rol === "ADMIN" ? "Admin Clínico" : "Terapeuta";
                    const espTexto = t.especialidad ? ` • ${t.especialidad}` : "";
                    return (
                      <option key={t.id} value={t.id}>
                        {t.nombre} ({rolTexto}{espTexto})
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {/* Píldoras rápidas de terapeutas frecuentes */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-0.5">
                {effectiveTerapeutas.slice(0, 3).map((t) => {
                  const shortName = t.nombre.replace(/^Lic\.\s+|^Tec\.\s+/i, "").split(" ")[0];
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setTerapeutaId(t.id)}
                      className={cn(
                        "px-2 py-0.5 text-[10px] rounded-lg font-semibold transition border shrink-0 cursor-pointer",
                        terapeutaId === t.id
                          ? "bg-teal-600 text-white border-teal-600 shadow-2xs font-bold"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {shortName}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. FECHA, HORA Y DURACIÓN (PÍLDORAS + CONTROLES) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Fecha con atajos rápidos */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  Fecha de la Cita *
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={setFechaHoy}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold cursor-pointer"
                  >
                    Hoy
                  </button>
                  <button
                    type="button"
                    onClick={setFechaManana}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold cursor-pointer"
                  >
                    Mañana
                  </button>
                </div>
              </div>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none text-xs"
              />
            </div>

            {/* Hora de Inicio */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                Hora de Inicio *
              </label>
              <input
                type="time"
                required
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none text-xs"
              />
            </div>
          </div>

          {/* Atajos Rápidos de Hora (Píldoras) */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-500">Horarios frecuentes:</span>
            <div className="flex flex-wrap gap-1.5">
              {HORARIOS_RAPIDOS.map((h) => (
                <button
                  type="button"
                  key={h}
                  onClick={() => setHora(h)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer border",
                    hora === h
                      ? "bg-teal-600 text-white border-teal-600 font-bold shadow-2xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* 5. DURACIÓN (PÍLDORAS) */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 text-xs">
              Duración de la Sesión *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DURACIONES.map((d) => {
                const isSelected = duracion === d.valor;
                return (
                  <button
                    type="button"
                    key={d.valor}
                    onClick={() => setDuracion(d.valor)}
                    className={cn(
                      "py-2 px-2.5 rounded-xl border text-center transition cursor-pointer text-xs",
                      isSelected
                        ? "bg-teal-600 text-white border-teal-600 font-bold shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <div className="font-bold">{d.etiqueta}</div>
                    <div className={cn("text-[10px]", isSelected ? "text-teal-100" : "text-slate-400")}>
                      {d.detalle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. VINCULACIÓN A PAQUETE DE TRATAMIENTO */}
          {paquetesDelPaciente.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                Vincular a Paquete de Sesiones
              </label>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setPaqueteId("")}
                  className={cn(
                    "w-full p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between",
                    paqueteId === ""
                      ? "bg-teal-50 border-teal-500 text-teal-900 font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <span>Sesión Individual / Fuera de Paquete</span>
                  {paqueteId === "" && <Check className="w-4 h-4 text-teal-600" />}
                </button>

                {paquetesDelPaciente.map((paq) => {
                  const isSelected = paqueteId === paq.id;
                  return (
                    <button
                      type="button"
                      key={paq.id}
                      onClick={() => setPaqueteId(paq.id)}
                      className={cn(
                        "w-full p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between",
                        isSelected
                          ? "bg-teal-50 border-teal-500 text-teal-900 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      <div>
                        <div className="font-bold">Paquete de {paq.totalSesiones} Sesiones</div>
                        <div className="text-[10px] text-slate-500">
                          Consumidas: {paq.sesionesConsumidas} de {paq.totalSesiones} • Pago: {paq.estadoPago}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-teal-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Alerta de Hito Reevaluación (Regla Clínica cada 5 sesiones) */}
          {esMultiploCinco && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Hito Clínico de Reevaluación:</span>
                Esta será la sesión #{paqueteSeleccionado!.sesionesConsumidas + 1}. El sistema marcará automáticamente la cita con la bandera de Reevaluación Fisioterapéutica obligatoria.
              </div>
            </div>
          )}

          {/* 7. NOTAS CLÍNICAS / OBSERVACIONES */}
          <div className="space-y-1.5 pt-1">
            <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Notas u Observaciones (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Paciente acude por dolor lumbar agudo, traer resonancia..."
              value={notasCita}
              onChange={(e) => setNotasCita(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none text-xs"
            />
          </div>

          {/* Botones de Acción */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer flex items-center gap-2 text-xs"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Agendando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Cita</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
