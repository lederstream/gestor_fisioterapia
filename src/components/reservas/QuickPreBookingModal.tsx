"use client";

import { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Sun,
  Moon,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { solicitarReservaPublica } from "@/server/actions/reservas";
import { ServicioItem, ConfiguracionClinicaItem, HorariosSemanaConfig } from "@/lib/store";

interface QuickPreBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  servicios: ServicioItem[];
  selectedServicioId?: string;
  config?: ConfiguracionClinicaItem;
}

export function QuickPreBookingModal({
  isOpen,
  onClose,
  servicios,
  selectedServicioId,
  config,
}: QuickPreBookingModalProps) {
  const [servicioId, setServicioId] = useState(selectedServicioId || servicios[0]?.id || "");
  const [dni, setDni] = useState("");
  const [nombres, setNombres] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [fecha, setFecha] = useState(() => {
    const today = new Date();
    // Default tomorrow or today
    return today.toISOString().split("T")[0];
  });
  const [turno, setTurno] = useState<"MANANA" | "TARDE">("MANANA");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedData, setConfirmedData] = useState<{
    cita: any;
    paciente: any;
    servicioNombre: string;
  } | null>(null);

  if (!isOpen) return null;

  const brandPrimary = config?.colorPrimario || "#0C3E37";
  const clinicName = config?.nombreComercial || "AJ Fisioterapia";
  const activeServicio = servicios.find((s) => s.id === servicioId) || servicios[0];

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanDni = dni.trim();
    if (!cleanDni || cleanDni.length < 8) {
      setErrorMsg("Por favor ingresa un número de DNI válido (mínimo 8 dígitos).");
      return;
    }

    const cleanNombres = nombres.trim();
    if (!cleanNombres) {
      setErrorMsg("Por favor ingresa tus nombres y apellidos.");
      return;
    }

    const cleanPhone = whatsapp.trim();
    if (!cleanPhone || cleanPhone.length < 7) {
      setErrorMsg("Por favor ingresa un número de WhatsApp / celular de contacto.");
      return;
    }

    if (!fecha) {
      setErrorMsg("Por favor selecciona tu fecha preferida.");
      return;
    }

    // Validar día activo según configuración clínica
    const dayKeys: (keyof HorariosSemanaConfig)[] = [
      "domingo",
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ];
    const dayNames = ["domingos", "lunes", "martes", "miércoles", "jueves", "viernes", "sábados"];
    const selectedDate = new Date(`${fecha}T12:00:00`);
    const dayIdx = selectedDate.getDay();
    const diaConfig = config?.horariosSemana ? config.horariosSemana[dayKeys[dayIdx]] : undefined;

    if (diaConfig && !diaConfig.activo) {
      setErrorMsg(`La clínica no atiende los ${dayNames[dayIdx]}. Por favor selecciona otra fecha disponible.`);
      return;
    }

    // Dividir nombres y apellidos
    const parts = cleanNombres.split(" ");
    const primerNombre = parts[0] || "Paciente";
    const apellidoPaterno = parts.slice(1).join(" ") || "General";

    // Horario dinámico coherente con apertura/intervalos
    const interval = config?.intervaloMinutos || 45;
    let horario = turno === "MANANA" ? "09:00 - 09:45" : "15:00 - 15:45";
    
    if (turno === "MANANA") {
      const startH = diaConfig?.apertura || config?.horaApertura || "08:30";
      const partsA = startH.split(":");
      const h = parseInt(partsA[0], 10);
      const m = parseInt(partsA[1] || "0", 10);
      const totalEnd = h * 60 + m + interval;
      const eh = Math.floor(totalEnd / 60);
      const em = totalEnd % 60;
      horario = `${startH} - ${eh.toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`;
    } else {
      const pmHour = diaConfig?.pausaFin ? parseInt(diaConfig.pausaFin.split(":")[0], 10) : 15;
      const totalEnd = pmHour * 60 + interval;
      const eh = Math.floor(totalEnd / 60);
      const em = totalEnd % 60;
      horario = `${pmHour.toString().padStart(2, "0")}:00 - ${eh.toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`;
    }

    setLoading(true);

    try {
      const res = await solicitarReservaPublica({
        dni: cleanDni,
        primerNombre,
        apellidoPaterno,
        telefono: cleanPhone,
        servicioId: activeServicio?.id || servicios[0]?.id || "",
        fecha,
        horario,
        motivoConsulta: `Pre-reserva web (Turno ${turno === "MANANA" ? "Mañana" : "Tarde"})`,
      });

      setLoading(false);

      if (res.success && res.data) {
        setConfirmedData({
          cita: res.data.cita,
          paciente: res.data.paciente,
          servicioNombre: activeServicio?.nombre || "Fisioterapia Especializada",
        });
      } else {
        setErrorMsg(res.error || "No se pudo registrar la pre-reserva. Intenta nuevamente.");
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || "Error al conectar con el servidor.");
    }
  };

  const resetAndClose = () => {
    setConfirmedData(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200 text-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div
          className="text-white p-6 relative"
          style={{ backgroundColor: brandPrimary }}
        >
          <button
            onClick={resetAndClose}
            className="absolute top-5 right-5 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-[10px] tracking-wider uppercase bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
              MODAL DE PRE-RESERVA RÁPIDA
            </span>
            <span className="text-xs text-emerald-200 font-medium">
              • 45 min por sesión
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            Solicitud de Pre-Reserva
          </h2>
          <p className="text-xs text-stone-200 mt-1 leading-relaxed">
            Ingresa tus datos y recepción confirmará tu horario exacto en las salas de San Borja.
          </p>
        </div>

        {/* Body Modal */}
        <div className="p-6">
          {confirmedData ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-stone-900">
                  ¡Pre-Reserva Registrada con Éxito!
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Tu solicitud ha ingresado a la central de {clinicName}. Recepción asignará tu sala y terapeuta para confirmar tu asistencia.
                </p>
              </div>

              {/* Detalle */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-400 font-semibold">Paciente:</span>
                  <span className="font-bold text-stone-800">{confirmedData.paciente?.nombres} {confirmedData.paciente?.apellidos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 font-semibold">DNI:</span>
                  <span className="font-mono text-stone-800">{confirmedData.paciente?.dni}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 font-semibold">Servicio:</span>
                  <span className="font-bold text-teal-800">{confirmedData.servicioNombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 font-semibold">Fecha Preferida:</span>
                  <span className="font-semibold text-stone-800">{fecha}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 font-semibold">Turno:</span>
                  <span className="font-bold text-[#0C3E37]">
                    {turno === "MANANA" ? "Mañana (08:00 - 13:00)" : "Tarde (14:00 - 20:00)"}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <a
                  href={`https://wa.me/${(config?.whatsapp || "51987654321").replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Hola ${clinicName}, acabo de registrar mi pre-reserva para ${confirmedData.servicioNombre} (DNI ${dni}). Quisiera confirmar mi horario.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Confirmar vía WhatsApp Ahora</span>
                </a>

                <button
                  type="button"
                  onClick={resetAndClose}
                  className="w-full sm:w-auto px-5 py-3 border border-stone-200 text-stone-700 font-bold text-xs rounded-xl hover:bg-stone-50 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleModalSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* DNI y WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Número de DNI *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="Ej. 45892011"
                    value={dni}
                    onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0C3E37]/20 focus:border-[#0C3E37] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    WhatsApp / Celular *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 987 654 321"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0C3E37]/20 focus:border-[#0C3E37] transition"
                  />
                </div>
              </div>

              {/* Nombres y Apellidos */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nombres y Apellidos Completos *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Alexander Saavedra"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0C3E37]/20 focus:border-[#0C3E37] transition"
                  />
                </div>
              </div>

              {/* Servicio Clínico */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Servicio Requerido *
                </label>
                <select
                  value={servicioId}
                  onChange={(e) => setServicioId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C3E37]/20 focus:border-[#0C3E37] transition"
                >
                  {servicios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} ({formatCurrency(s.precioPromocional || s.precioBase)} - 45 min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha y Turno (Mañana / Tarde) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Fecha Preferida *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0C3E37]/20 focus:border-[#0C3E37] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Turno Preferido *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTurno("MANANA")}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        turno === "MANANA"
                          ? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs"
                          : "border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-600" />
                      <span>Mañana</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTurno("TARDE")}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        turno === "TARDE"
                          ? "bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs"
                          : "border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Tarde</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: brandPrimary }}
              >
                {loading ? (
                  <span>Registrando pre-reserva...</span>
                ) : (
                  <>
                    <span>Solicitar Pre-Reserva Inmediata</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Datos protegidos bajo la Ley N.° 29733 de Protección de Datos Personales.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
