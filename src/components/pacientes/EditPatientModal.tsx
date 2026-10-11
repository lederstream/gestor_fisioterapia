"use client";

import { useState } from "react";
import { actualizarPaciente } from "@/server/actions/pacientes";
import { UserCheck, AlertCircle, X, HeartHandshake, User } from "lucide-react";

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
  // Parseo inicial inteligente si viene de versión anterior o ya tiene campos atómicos
  const nombresParts = (paciente.nombres || "").trim().split(/\s+/);
  const initialPrimerNombre = paciente.primerNombre || nombresParts[0] || "";
  const initialSegundoNombre = paciente.segundoNombre || (nombresParts.length > 1 ? nombresParts.slice(1).join(" ") : "");

  const apellidosParts = (paciente.apellidos || "").trim().split(/\s+/);
  const initialApellidoPaterno = paciente.apellidoPaterno || apellidosParts[0] || "";
  const initialApellidoMaterno = paciente.apellidoMaterno || (apellidosParts.length > 1 ? apellidosParts.slice(1).join(" ") : "");

  const [primerNombre, setPrimerNombre] = useState(initialPrimerNombre);
  const [segundoNombre, setSegundoNombre] = useState(initialSegundoNombre);
  const [apellidoPaterno, setApellidoPaterno] = useState(initialApellidoPaterno);
  const [apellidoMaterno, setApellidoMaterno] = useState(initialApellidoMaterno);
  const [telefono, setTelefono] = useState(paciente.telefono || "");
  const [email, setEmail] = useState(paciente.email || "");

  // Contacto de Emergencia Atómico
  const [contactoNombre, setContactoNombre] = useState(
    paciente.contactoEmergenciaNombre || (paciente.contactoEmergencia ? paciente.contactoEmergencia.split("-")[0]?.replace(/\(.*\)/, "").trim() : "")
  );
  const [contactoParentesco, setContactoParentesco] = useState(
    paciente.contactoEmergenciaParentesco || "Cónyuge / Pareja"
  );
  const [contactoTelefono, setContactoTelefono] = useState(
    paciente.contactoEmergenciaTelefono || (paciente.contactoEmergencia ? paciente.contactoEmergencia.replace(/\D/g, "") : "")
  );

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!primerNombre.trim()) {
      setErrorMsg("Debe ingresar el primer nombre.");
      setLoading(false);
      return;
    }

    if (!apellidoPaterno.trim()) {
      setErrorMsg("Debe ingresar el apellido paterno.");
      setLoading(false);
      return;
    }

    const nombresDerivados = [primerNombre.trim(), segundoNombre.trim()].filter(Boolean).join(" ");
    const apellidosDerivados = [apellidoPaterno.trim(), apellidoMaterno.trim()].filter(Boolean).join(" ");
    
    let contactoFinal = "";
    if (contactoNombre.trim()) {
      contactoFinal = `${contactoNombre.trim()}${contactoParentesco ? ` (${contactoParentesco})` : ""}${contactoTelefono ? ` - Tel: ${contactoTelefono.trim()}` : ""}`;
    }

    try {
      const res = await actualizarPaciente(paciente.id, {
        primerNombre: primerNombre.trim(),
        segundoNombre: segundoNombre.trim() || undefined,
        apellidoPaterno: apellidoPaterno.trim(),
        apellidoMaterno: apellidoMaterno.trim() || undefined,
        nombres: nombresDerivados,
        apellidos: apellidosDerivados,
        telefono,
        email: email || undefined,
        contactoEmergenciaNombre: contactoNombre.trim() || undefined,
        contactoEmergenciaParentesco: contactoParentesco || undefined,
        contactoEmergenciaTelefono: contactoTelefono.trim() || undefined,
        contactoEmergencia: contactoFinal || undefined,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Error al actualizar paciente.");
        setLoading(false);
        return;
      }

      onPatientUpdated(res.data);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado al guardar cambios.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header fijo */}
        <div className="p-4 sm:p-6 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-teal-50 text-teal-600 rounded-xl shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-800">
                Editar Datos de Filiación (Campos Separados)
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500">
                DNI {paciente.dni} • Gestión individualizada de nombres, apellidos y emergencia
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
            {/* 1. Nombres Individualizados */}
            <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2">
              <span className="font-bold text-slate-700 text-[11px] block uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>Nombres de la Persona (Campos Separados)</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Primer Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={primerNombre}
                    onChange={(e) => setPrimerNombre(e.target.value)}
                    placeholder="Ej. Renato"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Segundo Nombre (Opcional)
                  </label>
                  <input
                    type="text"
                    value={segundoNombre}
                    onChange={(e) => setSegundoNombre(e.target.value)}
                    placeholder="Ej. Alonso"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Apellidos Individualizados */}
            <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2">
              <span className="font-bold text-slate-700 text-[11px] block uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>Apellidos de la Persona (Campos Separados)</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Apellido Paterno *
                  </label>
                  <input
                    type="text"
                    required
                    value={apellidoPaterno}
                    onChange={(e) => setApellidoPaterno(e.target.value)}
                    placeholder="Ej. Salazar"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Apellido Materno *
                  </label>
                  <input
                    type="text"
                    required
                    value={apellidoMaterno}
                    onChange={(e) => setApellidoMaterno(e.target.value)}
                    placeholder="Ej. Castillo"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Contacto Directo */}
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
                  placeholder="Ej: 987654321"
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

            {/* 4. Contacto de Emergencia Estructurado */}
            <div className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-2.5">
              <span className="font-bold text-amber-900 text-[11px] block uppercase tracking-wider flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
                <span>Contacto de Emergencia Oficial (Campos Específicos)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nombre Completo del Contacto
                  </label>
                  <input
                    type="text"
                    value={contactoNombre}
                    onChange={(e) => setContactoNombre(e.target.value)}
                    placeholder="Ej. María Elena Flores Ramos"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Parentesco o Vínculo
                  </label>
                  <select
                    value={contactoParentesco}
                    onChange={(e) => setContactoParentesco(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Cónyuge / Pareja">Cónyuge / Pareja</option>
                    <option value="Madre / Padre">Madre / Padre</option>
                    <option value="Hijo / Hija">Hijo / Hija</option>
                    <option value="Hermano / Hermana">Hermano / Hermana</option>
                    <option value="Familiar Directo">Familiar Directo</option>
                    <option value="Tutor / Apoderado">Tutor / Apoderado</option>
                    <option value="Amigo(a) / Conocido">Amigo(a) / Conocido</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Teléfono del Contacto
                  </label>
                  <input
                    type="tel"
                    maxLength={9}
                    value={contactoTelefono}
                    onChange={(e) => setContactoTelefono(e.target.value.replace(/\D/g, ""))}
                    placeholder="Ej. 987999111"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Acciones */}
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
                {loading ? "Guardando Cambios..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
