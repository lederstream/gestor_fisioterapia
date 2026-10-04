"use client";

import { useState } from "react";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BookingFormProps {
  servicios: any[];
}

export function BookingForm({ servicios }: BookingFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [servicioId, setServicioId] = useState(servicios[0]?.id || "");
  const [dni, setDni] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [horario, setHorario] = useState("09:00 - 10:00");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  const selectedServicio = servicios.find((s) => s.id === servicioId) || servicios[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setConfirmado(true);
    }, 800);
  };

  if (confirmado) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl max-w-xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">
            ¡Solicitud de Cita Recibida!
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Estimado(a) <strong className="text-slate-800">{nombres} {apellidos}</strong>, nuestro equipo de recepción en San Borja ha registrado su solicitud de cita inicial.
          </p>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left text-xs space-y-2.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Servicio Seleccionado:</span>
            <span className="font-bold text-slate-800">{selectedServicio.nombre}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Fecha Estimada:</span>
            <span className="font-bold text-slate-800">{new Date(fecha).toLocaleDateString("es-PE")} ({horario})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Sede Física:</span>
            <span className="font-bold text-teal-700">Av. Guardia Civil 520, San Borja</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tarifa Consulta Inicial:</span>
            <span className="font-bold text-slate-900">{formatCurrency(selectedServicio.precioBase)}</span>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          En los próximos 15 minutos un recepcionista se comunicará a su celular <strong>{telefono}</strong> vía WhatsApp para confirmar la sala y profesional asignado.
        </p>

        <button
          onClick={() => {
            setConfirmado(false);
            setDni("");
            setNombres("");
            setApellidos("");
            setTelefono("");
            setMotivo("");
          }}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
        >
          Solicitar otra cita
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-2xl mx-auto">
      {/* Clinic Welcome Header */}
      <div className="bg-gradient-to-r from-teal-700 to-slate-900 p-8 text-white">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-3">
          <MapPin className="w-3.5 h-3.5" /> Sede San Borja • AJ Fisioterapia
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Agenda tu Cita de Fisioterapia
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
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
            {servicios.map((s) => (
              <div
                key={s.id}
                onClick={() => setServicioId(s.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  servicioId === s.id
                    ? "border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20 shadow-xs"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-800 text-xs block">
                    {s.nombre}
                  </span>
                  <span className="text-teal-700 font-extrabold text-xs">
                    {formatCurrency(s.precioBase)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{s.duracionMinutos} minutos de sesión</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Datos del Paciente */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="font-bold text-slate-800 text-sm block">
            2. Datos del Paciente
          </label>
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

            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Nombres *
              </label>
              <input
                type="text"
                required
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                placeholder="Ej. Carlos"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Apellidos *
              </label>
              <input
                type="text"
                required
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Ej. Mendoza Castro"
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
              <select
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="08:00 - 09:00">Mañana: 08:00 - 09:00 AM</option>
                <option value="09:00 - 10:00">Mañana: 09:00 - 10:00 AM</option>
                <option value="10:00 - 11:00">Mañana: 10:00 - 11:00 AM</option>
                <option value="11:00 - 12:00">Mañana: 11:00 - 12:00 PM</option>
                <option value="15:00 - 16:00">Tarde: 03:00 - 04:00 PM</option>
                <option value="16:00 - 17:00">Tarde: 04:00 - 05:00 PM</option>
                <option value="17:00 - 18:00">Tarde: 05:00 - 06:00 PM</option>
                <option value="18:00 - 19:00">Tarde: 06:00 - 07:00 PM</option>
              </select>
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

        <button
          type="submit"
          disabled={loading || dni.length !== 8 || telefono.length !== 9}
          className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
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
