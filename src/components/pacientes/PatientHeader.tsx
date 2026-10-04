"use client";

import { User, Phone, Mail, Calendar, ShieldCheck, HeartPulse } from "lucide-react";

interface PatientHeaderProps {
  paciente: any;
}

export function PatientHeader({ paciente }: PatientHeaderProps) {
  // Calcular edad aproximada
  const birthYear = new Date(paciente.fechaNacimiento).getFullYear();
  const currentYear = new Date().getFullYear();
  const edad = currentYear - birthYear;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-teal-600/20">
          {paciente.nombres[0]}{paciente.apellidos[0]}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">
              {paciente.nombres} {paciente.apellidos}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              Expediente Activo
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">DNI: {paciente.dni}</span>
            <span>•</span>
            <span>{edad} años ({new Date(paciente.fechaNacimiento).toLocaleDateString("es-PE")})</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {paciente.telefono}
            </span>
            {paciente.email && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {paciente.email}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {paciente.contactoEmergencia && (
        <div className="bg-amber-50/70 border border-amber-200/80 px-4 py-2.5 rounded-xl text-xs">
          <span className="text-[10px] uppercase font-bold text-amber-800 block">Contacto de Emergencia</span>
          <span className="text-amber-900 font-medium">{paciente.contactoEmergencia}</span>
        </div>
      )}
    </div>
  );
}
