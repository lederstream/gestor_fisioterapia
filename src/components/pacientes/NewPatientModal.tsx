"use client";

import { useState } from "react";
import { crearPaciente } from "@/server/actions/pacientes";
import { UserPlus, CheckCircle2, AlertCircle } from "lucide-react";

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: (newPatient: any) => void;
}

export function NewPatientModal({ isOpen, onClose, onPatientCreated }: NewPatientModalProps) {
  const [dni, setDni] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("1995-05-15");
  const [contactoEmergencia, setContactoEmergencia] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (dni.length !== 8) {
      setErrorMsg("El DNI peruano debe tener exactamente 8 dígitos.");
      setLoading(false);
      return;
    }

    try {
      const res = await crearPaciente({
        dni,
        nombres,
        apellidos,
        telefono,
        email: email || undefined,
        fechaNacimiento: new Date(fechaNacimiento),
        contactoEmergencia: contactoEmergencia || undefined,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Error al crear paciente.");
        setLoading(false);
        return;
      }

      onPatientCreated(res.data);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Nuevo Expediente de Paciente
              </h3>
              <p className="text-xs text-slate-500">
                Admisión clínica en Sede San Borja (Trazabilidad auditable)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                DNI (8 dígitos) *
              </label>
              <input
                type="text"
                maxLength={8}
                required
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                placeholder="Ej: 45892011"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Celular / WhatsApp *
              </label>
              <input
                type="tel"
                maxLength={9}
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
                placeholder="Ej: 987654321"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nombres *
              </label>
              <input
                type="text"
                required
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                placeholder="Ej: Renato"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Apellidos *
              </label>
              <input
                type="text"
                required
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Ej: Salazar Castillo"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                required
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Correo Electrónico (Opcional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="paciente@ejemplo.pe"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Contacto de Emergencia y Parentesco
            </label>
            <input
              type="text"
              value={contactoEmergencia}
              onChange={(e) => setContactoEmergencia(e.target.value)}
              placeholder="Ej: Esposa - 987999111"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
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
              {loading ? "Creando Expediente..." : "Registrar Paciente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
