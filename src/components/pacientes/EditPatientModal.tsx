"use client";

import { useState } from "react";
import { actualizarPaciente } from "@/server/actions/pacientes";
import { UserCheck, AlertCircle, X } from "lucide-react";

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  paciente: any;
  onPatientUpdated: (updated: any) => void;
}

export function EditPatientModal({
  isOpen,
  onClose,
  paciente,
  onPatientUpdated,
}: EditPatientModalProps) {
  const [nombres, setNombres] = useState(paciente.nombres || "");
  const [apellidos, setApellidos] = useState(paciente.apellidos || "");
  const [telefono, setTelefono] = useState(paciente.telefono || "");
  const [email, setEmail] = useState(paciente.email || "");
  const [contactoEmergencia, setContactoEmergencia] = useState(paciente.contactoEmergencia || "");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await actualizarPaciente(paciente.id, {
        nombres,
        apellidos,
        telefono,
        email: email || undefined,
        contactoEmergencia: contactoEmergencia || undefined,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Error al actualizar paciente.");
        setLoading(false);
        return;
      }

      onPatientUpdated(res.data);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado al guardar cambios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header fijo */}
        <div className="p-4 sm:p-6 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-teal-50 text-teal-600 rounded-xl shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-base font-bold text-slate-800">
                Editar Datos de Filiación
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500">
                DNI {paciente.dni} • Expediente Clínico San Borja
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario scroleable */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nombres *
              </label>
              <input
                type="text"
                required
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Correo Electrónico
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
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/30 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Guardando..." : "Actualizar Datos"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
}
