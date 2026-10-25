"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  AlertTriangle,
  X,
  Download,
  ExternalLink,
  MessageCircle,
  CalendarCheck
} from "lucide-react";
import { formatCurrency, formatTime, formatDateTime } from "@/lib/utils";
import { agendarCita } from "@/server/actions/citas";
import { createGoogleCalendarUrl, downloadIcsFile } from "@/lib/calendar";

interface PatientBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  paciente?: any;
  paquetes?: any[];
  terapeutas?: any[];
  salas?: any[];
  servicios?: any[];
  onSuccess?: (nuevaCita: any) => void;
}

export function PatientBookingModal({
  isOpen,
  onClose,
  paciente,
  paquetes = [],
  terapeutas = [],
  salas = [],
  servicios = [],
  onSuccess,
}: PatientBookingModalProps) {
  // Paciente objetivo con tipado defensivo total
  const pacienteData = useMemo(() => {
    if (paciente) {
      return {
        ...paciente,
        id: paciente.id || "usr-pac-1",
        nombres: paciente.nombres || paciente.nombre?.split(" ")[0] || "Alexander",
        apellidos: paciente.apellidos || paciente.nombre?.split(" ").slice(1).join(" ") || "Saavedra",
      };
    }
    return {
      id: "usr-pac-1",
      nombres: "Alexander",
      apellidos: "Saavedra",
      dni: "45892011",
      telefono: "987123456",
      email: "alexander.saavedra@gmail.com",
    };
  }, [paciente]);

  // Lista de terapeutas clínica con Lic. Jeiser Vasquez como predeterminado
  const listaTerapeutas = useMemo(() => {
    if (terapeutas && terapeutas.length > 0) return terapeutas;
    return [
      { id: "usr-ter-1", nombre: "Lic. Jeiser Vasquez", especialidad: "Lic. Fisioterapia Deportiva (CTMP 12480)" },
      { id: "usr-ter-2", nombre: "Lic. Andrea Rivas", especialidad: "Lic. Fisioterapia Traumatológica (CTMP 14920)" },
      { id: "usr-ter-4", nombre: "Lic. Valeria Soto", especialidad: "Lic. Fisioterapia y Neurorehabilitación" },
    ];
  }, [terapeutas]);

  // Lista de salas físicas disponibles
  const listaSalas = useMemo(() => {
    if (salas && salas.length > 0) return salas.filter((s) => s.estado === "DISPONIBLE");
    return [
      { id: "sala-1", nombre: "Sala 1 - Fisioterapia Deportiva & TMR", estado: "DISPONIBLE" },
      { id: "sala-2", nombre: "Sala 2 - Columna y Dolor Miofascial", estado: "DISPONIBLE" },
      { id: "sala-3", nombre: "Sala 3 - Neurorehabilitación & Magneto", estado: "DISPONIBLE" },
    ];
  }, [salas]);

  // Configuración de la clínica desde localStorage
  const [clinicConfig, setClinicConfig] = useState({
    nombreComercial: "AJ Fisioterapia",
    whatsapp: "+51 987 654 321",
    direccion: "Av. Guardia Civil 520, San Borja, Lima",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("clinic_config");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setClinicConfig((prev) => ({ ...prev, ...parsed }));
        } catch {}
      }
    }
  }, []);

  // Detectar paquete activo y saldo de manera segura
  const paqueteActivo = useMemo(() => {
    if (paquetes && paquetes.length > 0) {
      return paquetes.find((p) => p.sesionesConsumidas < p.totalSesiones) || paquetes[0];
    }
    return null;
  }, [paquetes]);

  const sesionesRestantes = paqueteActivo ? Math.max(0, paqueteActivo.totalSesiones - paqueteActivo.sesionesConsumidas) : 0;
  const sesionProyectada = paqueteActivo ? paqueteActivo.sesionesConsumidas + 1 : 1;
  const esHitoReevaluacion = sesionProyectada % 5 === 0;

  // Form State
  const [selectedTerapeutaId, setSelectedTerapeutaId] = useState(listaTerapeutas[0]?.id || "usr-ter-1");
  const [selectedSalaId, setSelectedSalaId] = useState(listaSalas[0]?.id || "sala-1");

  useEffect(() => {
    if (listaTerapeutas.length > 0 && !listaTerapeutas.some((t) => t.id === selectedTerapeutaId)) {
      setSelectedTerapeutaId(listaTerapeutas[0].id);
    }
  }, [listaTerapeutas, selectedTerapeutaId]);

  useEffect(() => {
    if (listaSalas.length > 0 && !listaSalas.some((s) => s.id === selectedSalaId)) {
      setSelectedSalaId(listaSalas[0].id);
    }
  }, [listaSalas, selectedSalaId]);
  
  // Fecha: Por defecto mañana si ya es tarde hoy, o hoy si es temprano
  const initialDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // día siguiente
    return d.toISOString().split("T")[0];
  }, []);

  const [fecha, setFecha] = useState(initialDateStr);
  const [horario, setHorario] = useState("09:00 - 10:00");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [citaConfirmada, setCitaConfirmada] = useState<any | null>(null);

  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  // Turnos disponibles (mañana y tarde)
  const slotsManana = [
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
  ];

  const slotsTarde = [
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
    "17:00 - 18:00",
    "18:00 - 19:00",
  ];

  // Calcular día de la semana
  const diaSemanaTexto = useMemo(() => {
    if (!fecha) return "";
    const [y, m, d] = fecha.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
  }, [fecha]);

  // Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const [startHourStr] = horario.split(" - ");
      const [sh, sm] = startHourStr.split(":").map(Number);
      const [y, m, d] = fecha.split("-").map(Number);
      const fechaHoraInicio = new Date(y, m - 1, d, sh, sm, 0);

      if (!pacienteData) {
        setErrorMsg("No se ha seleccionado ningún paciente para esta reserva.");
        setLoading(false);
        return;
      }

      const res = await agendarCita({
        pacienteId: pacienteData.id,
        paqueteId: paqueteActivo?.id || null,
        terapeutaId: selectedTerapeutaId,
        salaId: selectedSalaId,
        fechaHoraInicio,
        duracionMinutos: 45,
        esReevaluacion: esHitoReevaluacion,
      }, {
        id: pacienteData.id,
        nombre: `${pacienteData.nombres} ${pacienteData.apellidos}`,
        rol: "PACIENTE",
      });

      if (!res.success) {
        setErrorMsg(res.error || "No fue posible registrar la cita. Por favor elige otro horario.");
        setLoading(false);
        return;
      }

      const terapeutaElegido = listaTerapeutas.find((t) => t.id === selectedTerapeutaId);
      const salaElegida = listaSalas.find((s) => s.id === selectedSalaId);

      const citaResult = {
        ...((res.data as Record<string, any>) || {}),
        fechaHoraInicio: fechaHoraInicio.toISOString(),
        fechaHoraFin: new Date(fechaHoraInicio.getTime() + 45 * 60000).toISOString(),
        terapeuta: terapeutaElegido,
        sala: salaElegida,
        paciente: pacienteData,
      };

      setCitaConfirmada(citaResult);
      if (onSuccess) onSuccess(citaResult);

      // Disparar evento para que otras vistas del portal se actualicen en tiempo real
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cita-agendada", { detail: citaResult }));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Ocurrió un error inesperado al procesar la reserva.");
    } finally {
      setLoading(false);
    }
  };

  const cleanWhatsapp = clinicConfig.whatsapp ? clinicConfig.whatsapp.replace(/\D/g, "") : "51987654321";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-700 p-5 sm:p-6 text-white flex items-start justify-between">
          <div className="space-y-1 pr-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-teal-100 text-[11px] font-semibold backdrop-blur-xs border border-white/20">
              <Sparkles className="w-3 h-3 text-emerald-300" />
              <span>Portal Privado • {clinicConfig.nombreComercial}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              Reservar Próxima Sesión
            </h2>
            <p className="text-xs text-teal-100 leading-relaxed">
              Hola, <strong className="text-white">{pacienteData.nombres} {pacienteData.apellidos}</strong>. Selecciona fecha y terapeuta sin volver a ingresar tus datos.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-teal-200 hover:text-white hover:bg-white/10 rounded-xl transition"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
          {citaConfirmada ? (
            /* Vista de Éxito / Confirmación In-Modal */
            <div className="text-center space-y-6 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                  ¡Sesión Confirmada con Éxito!
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Tu cita ya está en tu agenda clínica
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Tu terapeuta y la sala han sido reservados para tu sesión número {sesionProyectada}.
                </p>
              </div>

              {/* Tarjeta de Resumen de la Cita */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5 text-left max-w-lg mx-auto">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Fecha y Hora:</span>
                  <span className="font-bold text-slate-800 capitalize">
                    {diaSemanaTexto} ({horario})
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Terapeuta Responsable:</span>
                  <span className="font-bold text-teal-800">
                    {citaConfirmada.terapeuta?.nombre || "Lic. Jeiser Vasquez"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Ubicación y Sala:</span>
                  <span className="font-bold text-slate-800">
                    {clinicConfig.nombreComercial} • {citaConfirmada.sala?.nombre || "Sala 1"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500">Saldo del Paquete:</span>
                  <span className="font-extrabold text-emerald-700">
                    {sesionesRestantes - 1} sesiones restantes disponibles (S/ 0.00 adicional)
                  </span>
                </div>
              </div>

              {/* Botones de Sincronización con Calendario */}
              <div className="space-y-2 max-w-lg mx-auto">
                <span className="text-[11px] font-bold text-slate-500 block">
                  Añade este turno a tu calendario personal para no olvidarlo:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href={createGoogleCalendarUrl({
                      title: `Sesión de Fisioterapia - ${clinicConfig.nombreComercial}`,
                      description: `Sesión de fisioterapia con ${citaConfirmada.terapeuta?.nombre}. Traer ropa deportiva y llegar 5 minutos antes.`,
                      location: clinicConfig.direccion,
                      startDate: citaConfirmada.fechaHoraInicio,
                      endDate: citaConfirmada.fechaHoraFin,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Google Calendar</span>
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      downloadIcsFile({
                        title: `Sesión de Fisioterapia - ${clinicConfig.nombreComercial}`,
                        description: `Sesión de fisioterapia con ${citaConfirmada.terapeuta?.nombre}. Traer ropa deportiva.`,
                        location: clinicConfig.direccion,
                        startDate: citaConfirmada.fechaHoraInicio,
                        endDate: citaConfirmada.fechaHoraFin,
                      })
                    }
                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Apple / Outlook (.ics)</span>
                  </button>
                </div>
              </div>

              {/* Botón de cierre */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setCitaConfirmada(null);
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Entendido, Ver en Mis Citas
                </button>
              </div>
            </div>
          ) : (
            /* Formulario de Reserva In-App */
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Tarjeta de Reconocimiento del Paquete Activo o Sesión Regular */}
              {paqueteActivo ? (
                <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-teal-900 text-xs sm:text-sm">
                        Paquete de Fisioterapia Activo
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white">
                        {sesionesRestantes} sesiones disponibles
                      </span>
                    </div>
                    <p className="text-[11px] text-teal-800">
                      Estás reservando tu <strong>Sesión {sesionProyectada} de {paqueteActivo.totalSesiones}</strong>. Esta sesión está cubierta al 100% por tu tratamiento.
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] text-teal-600 font-bold block uppercase">Costo adicional</span>
                    <span className="text-base font-black text-teal-900">S/. 0.00</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800 text-xs sm:text-sm">
                        Sesión Individual de Terapia
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                        Atención Particular
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Esta sesión se agendará en la sala seleccionada y podrás regularizar el abono o paquete en recepción.
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Tarifa en clínica</span>
                    <span className="text-base font-black text-slate-800">S/. 40.00</span>
                  </div>
                </div>
              )}

              {/* Alerta de Hito Reevaluación */}
              {esHitoReevaluacion && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <strong className="font-bold">Hito de Reevaluación Médica (Sesión {sesionProyectada}):</strong> Esta sesión incluirá el test físico y la medición de tu escala EVA para evaluar la reducción del dolor y avance muscular.
                  </div>
                </div>
              )}

              {/* Mensaje de Error si hay conflicto */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Paso 1: Fisioterapeuta Asignado */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>1. Fisioterapeuta Responsable</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {listaTerapeutas.map((terapeuta) => {
                    const isSelected = selectedTerapeutaId === terapeuta.id;
                    return (
                      <div
                        key={terapeuta.id}
                        onClick={() => setSelectedTerapeutaId(terapeuta.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-teal-50/80 border-teal-600 ring-2 ring-teal-500/20 shadow-xs"
                            : "bg-white border-slate-200 hover:border-teal-300"
                        }`}
                      >
                        <span className="font-bold text-slate-800 text-xs block leading-tight">
                          {terapeuta.nombre}
                        </span>
                        <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 block">
                          {terapeuta.especialidad || "Lic. Fisioterapia"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Paso 2: Fecha y Sala */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-bold text-slate-800 text-xs block mb-1.5">
                    2. Fecha de Atención
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-teal-700 font-medium capitalize mt-1 block">
                    📅 {diaSemanaTexto}
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-800 text-xs block mb-1.5">
                    Sala Física Clínica
                  </label>
                  <select
                    value={selectedSalaId}
                    onChange={(e) => setSelectedSalaId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {listaSalas.map((sala) => (
                      <option key={sala.id} value={sala.id}>
                        {sala.nombre}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Equipamiento y camillas desinfectadas
                  </span>
                </div>
              </div>

              {/* Paso 3: Turnos Horarios (Mañana / Tarde) */}
              <div className="space-y-2 pt-1">
                <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>3. Horario Disponible para tu Sesión (45 min)</span>
                </label>

                {/* Turno Mañana */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Turno Mañana (08:00 AM - 12:00 PM)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {slotsManana.map((slot) => {
                      const isSelected = horario === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setHorario(slot)}
                          className={`py-2 px-2.5 rounded-xl font-bold text-xs text-center border transition ${
                            isSelected
                              ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50/50 hover:border-teal-300"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Turno Tarde */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Turno Tarde (02:00 PM - 07:00 PM)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {slotsTarde.map((slot) => {
                      const isSelected = horario === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setHorario(slot)}
                          className={`py-2 px-2 rounded-xl font-bold text-xs text-center border transition ${
                            isSelected
                              ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50/50 hover:border-teal-300"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Paso 4: Nota opcional para el terapeuta */}
              <div className="space-y-1 pt-1">
                <label className="font-bold text-slate-700 text-xs block">
                  Notas sobre tu evolución o molestias (Opcional):
                </label>
                <textarea
                  rows={2}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej. Siento menos dolor lumbar al caminar, me gustaría reforzar ejercicios de estiramiento..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Botón de Confirmación Primario */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !fecha || !horario}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Agendando Sesión en Tiempo Real...</span>
                  ) : (
                    <>
                      <span>Confirmar y Agendar Sesión {sesionProyectada}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Nota de Seguridad */}
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 text-center pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>
                  Reserva instantánea confirmada en el software institucional de {clinicConfig.nombreComercial}.
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
