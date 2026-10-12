"use client";

import { useState } from "react";
import { User, Phone, Mail, Calendar, ShieldCheck, HeartPulse, MessageSquare, Copy, Check } from "lucide-react";

interface PatientHeaderProps {
  paciente: any;
}

export function PatientHeader({ paciente }: PatientHeaderProps) {
  const [copied, setCopied] = useState(false);

  // Calcular edad exacta
  const birthDate = new Date(paciente.fechaNacimiento);
  const today = new Date();
  let edad = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    edad--;
  }

  // Limpiar teléfono para WhatsApp (remover caracteres que no sean dígitos)
  const cleanPhone = (paciente.telefono || "").replace(/\D/g, "");
  const waUrl = cleanPhone.length >= 9 
    ? `https://wa.me/51${cleanPhone.startsWith("51") ? cleanPhone.slice(2) : cleanPhone}?text=Hola%20${encodeURIComponent(paciente.nombres)},%20te%20escribimos%20de%20la%20cl%C3%ADnica%20de%20fisioterapia%20para%20coordinar%20tu%20atenci%C3%B3n.`
    : null;

  const handleCopyDni = () => {
    if (paciente.dni) {
      navigator.clipboard.writeText(paciente.dni);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {/* Avatar Clínico con Gradiente */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-teal-600/20 shrink-0">
          {paciente.nombres?.[0]}{paciente.apellidos?.[0]}
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {paciente.nombres} {paciente.apellidos}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-50 text-teal-700 border border-teal-200">
              Expediente Activo
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            {/* DNI con Copia Rápida */}
            <button
              onClick={handleCopyDni}
              className="font-mono font-bold text-slate-700 hover:text-teal-700 flex items-center gap-1 transition cursor-pointer"
              title="Copiar DNI"
            >
              <span>{paciente.tipoDocumento || "DNI"}: {paciente.dni}</span>
              {copied ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400 hover:text-slate-600" />
              )}
            </button>
            <span>•</span>
            <span>{edad} años ({new Date(paciente.fechaNacimiento).toLocaleDateString("es-PE")})</span>
            <span>•</span>
            
            {/* Teléfono y Acciones Rápidas */}
            <div className="flex items-center gap-2">
              <a
                href={`tel:${paciente.telefono}`}
                className="flex items-center gap-1 font-semibold text-slate-700 hover:text-teal-700 transition"
              >
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{paciente.telefono}</span>
              </a>

              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold transition shadow-2xs"
                  title="Abrir chat de WhatsApp"
                >
                  <MessageSquare className="w-3 h-3 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>

            {paciente.email && (
              <>
                <span>•</span>
                <a 
                  href={`mailto:${paciente.email}`}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition"
                >
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{paciente.email}</span>
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {(paciente.contactoEmergencia || paciente.contactoEmergenciaNombre) && (
        <div className="bg-amber-50/80 border border-amber-200/90 px-4 py-2.5 rounded-xl text-xs w-full md:w-auto shrink-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
              Contacto de Emergencia
            </span>
            {paciente.contactoEmergenciaParentesco && (
              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-extrabold text-[9px] border border-amber-200">
                {paciente.contactoEmergenciaParentesco}
              </span>
            )}
          </div>
          
          <div className="font-semibold text-amber-950 flex flex-wrap items-center gap-2">
            <span>{paciente.contactoEmergenciaNombre || paciente.contactoEmergencia}</span>
            {paciente.contactoEmergenciaTelefono && (
              <a
                href={`tel:${paciente.contactoEmergenciaTelefono}`}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-white/80 hover:bg-white px-2 py-0.5 rounded-lg border border-amber-300 transition"
                title="Llamar a contacto de emergencia"
              >
                <Phone className="w-3 h-3 text-amber-700" />
                <span>{paciente.contactoEmergenciaTelefono}</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
