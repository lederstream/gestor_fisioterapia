"use client";

import { useState } from "react";
import Link from "next/link";
import { NewPatientModal } from "@/components/pacientes/NewPatientModal";
import { 
  Users, 
  Search, 
  ArrowUpRight, 
  AlertTriangle, 
  ShieldCheck, 
  UserPlus, 
  Calendar,
  CheckCircle2,
  Phone,
  Layers,
  Sparkles,
  MessageSquare,
  Activity
} from "lucide-react";

interface PacientesClientProps {
  initialPacientes: any[];
}

export function PacientesClient({ initialPacientes }: PacientesClientProps) {
  const [pacientes, setPacientes] = useState(initialPacientes);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"todos" | "reevaluacion" | "paquetes">("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Contadores ejecutivos
  const totalPacientes = pacientes.length;
  const conPaquete = pacientes.filter((p) => (p.paquetesCount || 0) > 0).length;
  const reevaluacionPendiente = pacientes.filter((p) => p.tieneReevaluacionPendiente).length;
  const totalCitasAtendidas = pacientes.reduce((acc, p) => acc + (p.citasCount || 0), 0);

  const filtered = pacientes.filter((p) => {
    // Filtro por texto
    if (search) {
      const q = search.toLowerCase();
      const fullName = `${p.nombres} ${p.apellidos}`.toLowerCase();
      const match = fullName.includes(q) || p.dni.includes(q) || p.telefono.includes(q);
      if (!match) return false;
    }

    // Filtro por tipo
    if (filterType === "reevaluacion") {
      return p.tieneReevaluacionPendiente;
    }
    if (filterType === "paquetes") {
      return (p.paquetesCount || 0) > 0;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs font-semibold shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Cabecera y acciones */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            Directorio Clínico de Pacientes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fichas clínicas integrales, control de dolor EVA y paquetes de tratamiento en San Borja.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/25 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Paciente</span>
          </button>
          <span className="text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 whitespace-nowrap shadow-2xs">
            {pacientes.length} Registrados
          </span>
        </div>
      </div>

      {/* Tarjetas de Métricas Ejecutivas del Directorio */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Pacientes</span>
          <span className="text-xl font-black text-slate-800">{totalPacientes}</span>
          <p className="text-[10px] text-slate-500">Expedientes activos en sede</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-teal-700 block tracking-wider">Con Paquete Activo</span>
          <span className="text-xl font-black text-teal-800">{conPaquete}</span>
          <p className="text-[10px] text-teal-600">Tratamientos continuos</p>
        </div>
        <div className={`p-3.5 rounded-2xl border shadow-2xs space-y-1 ${reevaluacionPendiente > 0 ? "bg-amber-50/70 border-amber-200" : "bg-white border-slate-200"}`}>
          <span className="text-[10px] uppercase font-bold text-amber-800 block tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Reevaluación Pendiente</span>
          </span>
          <span className="text-xl font-black text-amber-900">{reevaluacionPendiente}</span>
          <p className="text-[10px] text-amber-700">Ciclo de sesión 5 alcanzado</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Sesiones Totales</span>
          <span className="text-xl font-black text-slate-800">{totalCitasAtendidas}</span>
          <p className="text-[10px] text-slate-500">Historial acumulado</p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por DNI, documento, nombres o teléfono..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Botones de Filtro Rápido */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterType("todos")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterType === "todos"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Todos ({pacientes.length})
            </button>
            <button
              onClick={() => setFilterType("reevaluacion")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                filterType === "reevaluacion"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Reevaluación ({reevaluacionPendiente})</span>
            </button>
            <button
              onClick={() => setFilterType("paquetes")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                filterType === "paquetes"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Con Paquete ({conPaquete})</span>
            </button>
          </div>
        </div>
      </div>

      {/* VISTA 1: Tarjetas para Móviles (sm:hidden) */}
      <div className="grid grid-cols-1 gap-3.5 sm:hidden">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No se encontraron pacientes registrados con ese criterio.
          </div>
        ) : (
          filtered.map((p) => {
            const cleanPhone = (p.telefono || "").replace(/\D/g, "");
            const waUrl = cleanPhone.length >= 9 
              ? `https://wa.me/51${cleanPhone.startsWith("51") ? cleanPhone.slice(2) : cleanPhone}`
              : null;

            return (
              <div
                key={p.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 font-extrabold flex items-center justify-center text-sm border border-teal-200">
                      {p.nombres[0]}{p.apellidos[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {p.nombres} {p.apellidos}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {p.tipoDocumento || "DNI"}: {p.dni} • Tel: {p.telefono}
                      </p>
                    </div>
                  </div>

                  {p.tieneReevaluacionPendiente ? (
                    <span className="p-1 bg-amber-100 text-amber-800 rounded-lg" title="Reevaluación obligatoria">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </span>
                  ) : (
                    <span className="p-1 bg-emerald-50 text-emerald-700 rounded-lg" title="En tratamiento">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-slate-600 font-medium">
                    {p.paquetesCount > 0 ? `${p.paquetesCount} paquete(s)` : "Individual"}
                  </span>
                  <span className="text-slate-500 font-medium">
                    {p.citasCount || 0} cita(s)
                  </span>
                  <span className="font-semibold text-teal-700">
                    {p.tieneReevaluacionPendiente ? "Reevaluación Pendiente" : "Al día"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition"
                      title="WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                  <Link
                    href={`/dashboard/agenda?pacienteId=${p.id}`}
                    className={`flex items-center justify-center gap-1 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition ${!waUrl ? "col-span-2" : ""}`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                    <span>Cita</span>
                  </Link>
                  <Link
                    href={`/dashboard/pacientes/${p.id}`}
                    className="flex items-center justify-center gap-1 py-2 px-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    <span>Ficha</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* VISTA 2: Tabla Desktop/Tablet (hidden sm:block) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Paciente</th>
                <th className="py-3 px-4">Documento</th>
                <th className="py-3 px-4">Teléfono & WhatsApp</th>
                <th className="py-3 px-4">Paquetes</th>
                <th className="py-3 px-4">Sesiones</th>
                <th className="py-3 px-4">Estado Clínico</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No se encontraron pacientes registrados con ese criterio.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const cleanPhone = (p.telefono || "").replace(/\D/g, "");
                  const waUrl = cleanPhone.length >= 9 
                    ? `https://wa.me/51${cleanPhone.startsWith("51") ? cleanPhone.slice(2) : cleanPhone}`
                    : null;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link href={`/dashboard/pacientes/${p.id}`} className="font-bold text-slate-800 hover:text-teal-700 block text-xs">
                          {p.nombres} {p.apellidos}
                        </Link>
                        <span className="text-[10px] text-slate-400">
                          Nacimiento: {new Date(p.fechaNacimiento).toLocaleDateString("es-PE")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold mr-1.5 font-sans">
                          {p.tipoDocumento || "DNI"}
                        </span>
                        {p.dni}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600 font-medium">{p.telefono}</span>
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                              title="Contactar por WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">
                        {p.paquetesCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                            {p.paquetesCount} paquete(s)
                          </span>
                        ) : (
                          <span className="text-slate-400">Individual</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">
                        {p.citasCount || 0} cita(s)
                      </td>
                      <td className="py-3.5 px-4">
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
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/dashboard/agenda?pacienteId=${p.id}`}
                            title="Agendar cita para este paciente"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          >
                            <Calendar className="w-3.5 h-3.5 text-slate-600" />
                          </Link>
                          <Link
                            href={`/dashboard/pacientes/${p.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 transition"
                          >
                            <span>Ficha</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Crear Paciente */}
      {isModalOpen && (
        <NewPatientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPatientCreated={(nuevo) => {
            const formatted = {
              ...nuevo,
              paquetesCount: 0,
              citasCount: 0,
              tieneReevaluacionPendiente: false,
            };
            setPacientes((prev) => [formatted, ...prev]);
            showNotification(`Expediente creado para ${nuevo.nombres} ${nuevo.apellidos} con éxito.`);
          }}
        />
      )}
    </div>
  );
}
