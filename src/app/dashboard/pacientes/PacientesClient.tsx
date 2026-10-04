"use client";

import { useState } from "react";
import Link from "next/link";
import { NewPatientModal } from "@/components/pacientes/NewPatientModal";
import { Users, Search, ArrowUpRight, AlertTriangle, ShieldCheck, UserPlus } from "lucide-react";

interface PacientesClientProps {
  initialPacientes: any[];
}

export function PacientesClient({ initialPacientes }: PacientesClientProps) {
  const [pacientes, setPacientes] = useState(initialPacientes);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = pacientes.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const fullName = `${p.nombres} ${p.apellidos}`.toLowerCase();
    return fullName.includes(q) || p.dni.includes(q) || p.telefono.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-800">
            Directorio Clínico de Pacientes
          </h1>
          <p className="text-xs text-slate-500">
            Fichas clínicas integrales, historial de dolor EVA y control de paquetes de tratamiento.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/25 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Paciente</span>
          </button>
          <span className="text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700">
            {pacientes.length} Registrados
          </span>
        </div>
      </div>

      {/* Tabla de Pacientes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por DNI, Nombres o Teléfono..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Privacidad garantizada bajo estricto secreto médico</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Paciente</th>
                <th className="py-3 px-4 font-semibold">DNI</th>
                <th className="py-3 px-4 font-semibold">Teléfono</th>
                <th className="py-3 px-4 font-semibold">Paquetes</th>
                <th className="py-3 px-4 font-semibold">Citas</th>
                <th className="py-3 px-4 font-semibold">Estado Clínico</th>
                <th className="py-3 px-4 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No se encontraron pacientes registrados con ese criterio.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block text-xs">
                        {p.nombres} {p.apellidos}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Nacimiento: {new Date(p.fechaNacimiento).toLocaleDateString("es-PE")}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {p.dni}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {p.telefono}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">
                      {p.paquetesCount > 0 ? `${p.paquetesCount} paquete(s)` : "Individual"}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.citasCount} citas registradas
                    </td>
                    <td className="py-3 px-4">
                      {p.tieneReevaluacionPendiente ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-amber-700" />
                          Reevaluación Obligatoria
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          En Tratamiento
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/dashboard/pacientes/${p.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 transition"
                      >
                        <span>Ver Ficha</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <NewPatientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPatientCreated={(nuevo) => {
            setPacientes((prev) => [nuevo, ...prev]);
          }}
        />
      )}
    </div>
  );
}
