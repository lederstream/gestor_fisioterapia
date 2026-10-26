"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

import { solicitarReservaPublica } from "@/server/actions/reservas";

interface BookingFormProps {
  servicios: any[];
  configuracion?: any;
}

export function BookingForm({ servicios, configuracion }: BookingFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [servicioId, setServicioId] = useState(servicios[0]?.id || "");
  const [dni, setDni] = useState("");
  const [primerNombre, setPrimerNombre] = useState("");
  const [segundoNombre, setSegundoNombre] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [horario, setHorario] = useState("09:00 - 10:00");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [citaCreada, setCitaCreada] = useState<any | null>(null);

  // Calcular dinámicamente slots del día según la configuración institucional
  const { diaSemanaNombre, isDayClosed, availableSlots } = useMemo(() => {
    if (!fecha) return { diaSemanaNombre: "", isDayClosed: false, availableSlots: [] };
    const [y, m, d] = fecha.split("-").map(Number);
    const day = new Date(y, m - 1, d).getDay();
    const map: Record<number, { clave: string; nombre: string }> = {
      0: { clave: "domingo", nombre: "Domingo" },
      1: { clave: "lunes", nombre: "Lunes" },
      2: { clave: "martes", nombre: "Martes" },
      3: { clave: "miercoles", nombre: "Miércoles" },
      4: { clave: "jueves", nombre: "Jueves" },
      5: { clave: "viernes", nombre: "Viernes" },
      6: { clave: "sabado", nombre: "Sábado" },
    };
    const info = map[day] || { clave: "lunes", nombre: "Lunes" };
    const diaConfig = configuracion?.horariosSemana?.[info.clave];

    if (diaConfig && !diaConfig.activo) {
      return { diaSemanaNombre: info.nombre, isDayClosed: true, availableSlots: [] };
    }

    const aperturaH = diaConfig?.apertura 
      ? parseInt(diaConfig.apertura.split(":")[0], 10) 
      : parseInt((configuracion?.horaApertura || "08:00").split(":")[0], 10);
    const cierreH = diaConfig?.cierre 
      ? parseInt(diaConfig.cierre.split(":")[0], 10) 
      : parseInt((configuracion?.horaCierre || "20:00").split(":")[0], 10);

    const pIni = diaConfig?.tienePausa && diaConfig.pausaInicio ? parseInt(diaConfig.pausaInicio.split(":")[0], 10) : -1;
    const pFin = diaConfig?.tienePausa && diaConfig.pausaFin ? parseInt(diaConfig.pausaFin.split(":")[0], 10) : -1;

    const slots: string[] = [];
    for (let h = aperturaH; h < cierreH; h++) {
      if (h >= pIni && h < pFin) continue; // Excluir pausa de refrigerio
      const nextH = h + 1;
      const startStr = `${h.toString().padStart(2, "0")}:00`;
      const endStr = `${nextH.toString().padStart(2, "0")}:00`;
      slots.push(`${startStr} - ${endStr}`);
    }

    return { diaSemanaNombre: info.nombre, isDayClosed: false, availableSlots: slots };
  }, [fecha, configuracion]);

  // Sincronizar horario seleccionado al cambiar de fecha
  useEffect(() => {
    if (availableSlots.length > 0 && !availableSlots.includes(horario)) {
      setHorario(availableSlots[0]);
    }
  }, [availableSlots, horario]);

  const nombres = [primerNombre.trim(), segundoNombre.trim()].filter(Boolean).join(" ");
  const apellidos = [apellidoPaterno.trim(), apellidoMaterno.trim()].filter(Boolean).join(" ");

  const selectedServicio = servicios.find((s) => s.id === servicioId) || servicios[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await solicitarReservaPublica({
        dni,
        primerNombre,
        segundoNombre: segundoNombre || undefined,
        apellidoPaterno,
        apellidoMaterno: apellidoMaterno || undefined,
        telefono,
        email: email || undefined,
        servicioId,
        fecha,
        horario,
        motivoConsulta: motivo || undefined,
      });

      if (!res.success) {
        setErrorMsg(res.error || "No se pudo agendar la cita. Por favor intente con otro horario.");
        setLoading(false);
        return;
      }

      setCitaCreada(res.data?.cita);
      setConfirmado(true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado al solicitar cita.");
    } finally {
      setLoading(false);
    }
  };

  if (confirmado) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl max-w-xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">
            ¡Cita Reservada con Éxito!
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Estimado(a) <strong className="text-slate-800">{nombres} {apellidos}</strong>, su cita ha sido registrada formalmente en nuestro sistema clínico.
          </p>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left text-xs space-y-2.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Servicio Seleccionado:</span>
            <span className="font-bold text-slate-800">{selectedServicio.nombre}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Fecha y Horario:</span>
            <span className="font-bold text-slate-800">{new Date(fecha).toLocaleDateString("es-PE")} ({horario})</span>
          </div>
          {citaCreada?.salaNombre && (
            <div className="flex justify-between">
              <span className="text-slate-500">Sala Asignada:</span>
              <span className="font-bold text-teal-700">{citaCreada.salaNombre} (San Borja)</span>
            </div>
          )}
          {citaCreada?.terapeutaNombre && (
            <div className="flex justify-between">
              <span className="text-slate-500">Profesional Terapeuta:</span>
              <span className="font-bold text-slate-800">{citaCreada.terapeutaNombre}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Sede:</span>
            <span className="font-bold text-slate-800">Av. Guardia Civil 520, San Borja</span>
          </div>
          <div className="flex justify-between border-t border-slate-200/60 pt-2">
            <span className="text-slate-500">Tarifa Consulta Inicial:</span>
            <span className="font-bold text-emerald-700">{formatCurrency(selectedServicio.precioBase)}</span>
          </div>
        </div>

        <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-950 text-xs text-left space-y-2">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span className="font-semibold text-teal-900 leading-snug">
              Tu solicitud ha sido recibida por la central de <strong>AJ Fisioterapia</strong> en San Borja.
            </span>
          </div>
          <div className="text-[11px] text-teal-800/90 pl-6 space-y-1">
            <p>• <strong>Confirmación:</strong> Recepción verificará la sala y te contactará por WhatsApp para confirmar tu asistencia.</p>
            <p>• <strong>Historia Clínica Oficial:</strong> Acude el día de tu cita con tu DNI físico. Tu evaluación funcional y expediente clínico serán aperturados por el terapeuta colegiado en sala.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setConfirmado(false);
            setCitaCreada(null);
            setErrorMsg(null);
            setDni("");
            setPrimerNombre("");
            setSegundoNombre("");
            setApellidoPaterno("");
            setApellidoMaterno("");
            setTelefono("");
            setMotivo("");
          }}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/25 transition cursor-pointer"
        >
          Solicitar otra cita
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-2xl mx-auto">
      {/* Clinic Welcome Header */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-700 p-6 sm:p-8 text-white">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-teal-100 text-xs font-semibold mb-3 backdrop-blur-xs">
          <MapPin className="w-3.5 h-3.5" /> San Borja • AJ Fisioterapia
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Agenda tu Cita de Fisioterapia
        </h1>
        <p className="text-teal-100 text-xs sm:text-sm mt-1.5 leading-relaxed">
          Atención personalizada en 6 salas clínicas especializadas con licenciados colegiados.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 text-xs">
        {/* Step 1: Servicio Clínico */}
        <div className="space-y-3">
          <label className="font-bold text-slate-800 text-sm block">
            1. Seleccione el Servicio Clínico
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {servicios.map((s) => {
              const basePrice = Number(s.precioBase) || 0;
              const promoPrice = s.precioPromocional ? Number(s.precioPromocional) : null;
              const hasPromo = Boolean(promoPrice && promoPrice > 0 && promoPrice < basePrice);
              const discountPercent = hasPromo ? Math.round(((basePrice - promoPrice!) / basePrice) * 100) : 0;
              const displayPrice = hasPromo ? promoPrice! : basePrice;

              return (
                <div
                  key={s.id}
                  onClick={() => setServicioId(s.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    servicioId === s.id
                      ? "border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20 shadow-xs"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-slate-800 text-xs block">
                      {s.nombre}
                    </span>
                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {hasPromo && (
                          <span className="text-[10px] text-slate-400 line-through">
                            {formatCurrency(basePrice)}
                          </span>
                        )}
                        <span className="text-teal-700 font-extrabold text-xs">
                          {formatCurrency(displayPrice)}
                        </span>
                        {hasPromo && discountPercent > 0 && (
                          <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-100/80 px-1 py-0.5 rounded">
                            -{discountPercent}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{s.duracionMinutos} minutos de sesión</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Datos del Paciente */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <label className="font-bold text-slate-800 text-sm block">
              2. Datos del Paciente
            </label>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 inline-flex items-center gap-1.5 w-fit">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Pre-reserva ágil sin contraseñas • HC oficial en clínica
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Solo requerimos tus datos de contacto para reservar la sala. Tu Historia Clínica oficial será aperturada por el fisioterapeuta colegiado durante tu primera atención presencial.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                DNI (8 dígitos) *
              </label>
              <input
                type="text"
                maxLength={8}
                required
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                placeholder="45892011"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Celular / WhatsApp *
              </label>
              <input
                type="tel"
                maxLength={9}
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
                placeholder="987654321"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Nombres y Apellidos Desglosados */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Primer Nombre *
              </label>
              <input
                type="text"
                required
                value={primerNombre}
                onChange={(e) => setPrimerNombre(e.target.value)}
                placeholder="Ej. Carlos"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Segundo Nombre (Opcional)
              </label>
              <input
                type="text"
                value={segundoNombre}
                onChange={(e) => setSegundoNombre(e.target.value)}
                placeholder="Ej. Eduardo"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Apellido Paterno *
              </label>
              <input
                type="text"
                required
                value={apellidoPaterno}
                onChange={(e) => setApellidoPaterno(e.target.value)}
                placeholder="Ej. Mendoza"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Apellido Materno *
              </label>
              <input
                type="text"
                required
                value={apellidoMaterno}
                onChange={(e) => setApellidoMaterno(e.target.value)}
                placeholder="Ej. Castro"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Fecha y Horario Deseado */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="font-bold text-slate-800 text-sm block">
            3. Fecha y Franja Horaria de Preferencia
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Fecha de Consulta
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Horario de Preferencia
              </label>
              {isDayClosed ? (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Clínica cerrada los {diaSemanaNombre}. Elige otra fecha.</span>
                </div>
              ) : (
                <select
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot) => {
                      const startH = parseInt(slot.split(":")[0], 10);
                      const tag = startH < 12 ? "Mañana" : "Tarde";
                      return (
                        <option key={slot} value={slot}>
                          {tag}: {slot}
                        </option>
                      );
                    })
                  ) : (
                    <option value="">No hay turnos disponibles</option>
                  )}
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Motivo de Consulta o Lesión (Breve descripción)
            </label>
            <textarea
              rows={2}
              required
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Dolor lumbar agudo tras ejercicio físico, molestia en rodilla derecha..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            Sus datos clínicos están protegidos bajo estricto secreto profesional y la ley de protección de datos en salud. No se realizan grabaciones ni contenido multimedia.
          </span>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || dni.length !== 8 || telefono.length !== 9 || isDayClosed}
          className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            "Procesando Solicitud..."
          ) : (
            <>
              <span>Solicitar Reserva en San Borja</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
