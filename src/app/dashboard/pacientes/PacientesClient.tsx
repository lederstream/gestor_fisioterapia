"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { NewPatientModal } from "@/components/pacientes/NewPatientModal";
import { 
  Users, 
  Search, 
  ArrowUpRight, 
  AlertTriangle, 
  UserPlus, 
  Calendar,
  CheckCircle2,
  Layers,
  MessageSquare,
  Activity,
  Copy,
  Check,
  SlidersHorizontal,
  ChevronRight,
  Filter
} from "lucide-react";

interface PacientesClientProps {
  initialPacientes: any[];
}

export function PacientesClient({ initialPacientes }: PacientesClientProps) {
  const [pacientes, setPacientes] = useState(initialPacientes);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"todos" | "reevaluacion" | "paquetes">("todos");
  const [density, setDensity] = useState<"comoda" | "compacta">("comoda");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhone(id);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  // Calcular edad del paciente a partir de su fecha de nacimiento
  const calcularEdad = (fechaNacimiento: string | Date | undefined) => {
    if (!fechaNacimiento) return null;
    const dob = new Date(fechaNacimiento);
    if (isNaN(dob.getTime())) return null;
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    const edad = Math.abs(ageDt.getUTCFullYear() - 1970);
    return isNaN(edad) || edad > 120 ? null : edad;
  };

  // Métricas ejecutivas
  const totalPacientes = pacientes.length;
  const conPaquete = pacientes.filter((p) => (p.paquetesCount || 0) > 0).length;
  const reevaluacionPendiente = pacientes.filter((p) => p.tieneReevaluacionPendiente).length;
  const totalCitasAtendidas = pacientes.reduce((acc, p) => acc + (p.citasCount || 0), 0);

  // Filtrado reactivo
  const filtered = useMemo(() => {
    return pacientes.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        const fullName = `${p.nombres} ${p.apellidos}`.toLowerCase();
        const match = fullName.includes(q) || (p.dni && p.dni.toLowerCase().includes(q)) || (p.telefono && p.telefono.includes(q));
        if (!match) return false;
      }

      if (filterType === "reevaluacion") {
        return p.tieneReevaluacionPendiente;
      }
      if (filterType === "paquetes") {
        return (p.paquetesCount || 0) > 0;
      }

      return true;
    });
  }, [pacientes, search, filterType]);

  return (
    <div className="space-y-5">
      {toastMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs font-semibold shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Cabecera y acciones principales */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            Directorio Clínico de Pacientes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fichas clínicas integrales, control de dolor EVA y paquetes de tratamiento en Sede San Borja.
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

      {/* Tarjetas de Métricas Ejecutivas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Pacientes</span>
          <span className="text-xl font-black text-slate-800">{totalPacientes}</span>
          <p className="text-[10px] text-slate-500">Expedientes activos en sede</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-teal-700 block tracking-wider">Con Paquete Activo</span>
          <span className="text-xl font-black text-teal-800">{conPaquete}</span>
          <p className="text-[10px] text-teal-600">Tratamientos en curso</p>
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

      {/* Barra de Filtros, Búsqueda y Densidad */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombres, DNI/CE, pasaporte o teléfono..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Botones de Filtro Rápido y Modo Densidad */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-xl border border-slate-200/60">
              <button
                onClick={() => setFilterType("todos")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  filterType === "todos"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Todos ({pacientes.length})
              </button>
              <button
                onClick={() => setFilterType("reevaluacion")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  filterType === "reevaluacion"
                    ? "bg-amber-500 text-white shadow-xs font-bold"
                    : "text-amber-800 hover:text-amber-900"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Reevaluación ({reevaluacionPendiente})</span>
              </button>
              <button
                onClick={() => setFilterType("paquetes")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  filterType === "paquetes"
                    ? "bg-teal-700 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Con Paquete ({conPaquete})</span>
              </button>
            </div>

            {/* Selector de Densidad (Compacta / Cómoda) */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 text-[11px] font-bold text-slate-600">
              <button
                onClick={() => setDensity("comoda")}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  density === "comoda" ? "bg-white text-teal-800 shadow-2xs font-extrabold" : "hover:text-slate-900"
                }`}
                title="Espaciado estándar para lectura descansada"
              >
                Cómoda
              </button>
              <button
                onClick={() => setDensity("compacta")}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  density === "compacta" ? "bg-teal-600 text-white shadow-2xs font-extrabold" : "hover:text-slate-900"
                }`}
                title="Espaciado compacto para visualizar el 100% de la tabla sin scroll vertical"
              >
                Compacta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VISTA 1: Tarjetas para Móviles (sm:hidden) */}
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No se encontraron pacientes registrados con ese criterio.
          </div>
        ) : (
          filtered.map((p) => {
            const edad = calcularEdad(p.fechaNacimiento);
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
                      {p.nombres?.[0] || "P"}{p.apellidos?.[0] || ""}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {p.nombres} {p.apellidos}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        <span className="font-semibold text-slate-700">{p.tipoDocumento || "DNI"} {p.dni}</span>
                        {edad !== null && ` • ${edad} años`}
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
                  <span className={`font-semibold ${p.tieneReevaluacionPendiente ? "text-amber-800" : "text-emerald-700"}`}>
                    {p.tieneReevaluacionPendiente ? "Reevaluación" : "En curso"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition"
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

      {/* VISTA 2: TABLA MAESTRA DESKTOP OPTIMIZADA AL 100% (4 Columnas Maestras, 0 scroll horizontal) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] font-bold tracking-wider select-none">
              <tr>
                <th className="py-3 px-4 w-[38%]">Paciente & Documento</th>
                <th className="py-3 px-4 w-[22%]">Contacto Directo</th>
                <th className="py-3 px-4 w-[25%]">Tratamiento & Estado Clínico</th>
                <th className="py-3 px-4 w-[15%] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    No se encontraron pacientes con ese criterio de búsqueda.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const edad = calcularEdad(p.fechaNacimiento);
                  const cleanPhone = (p.telefono || "").replace(/\D/g, "");
                  const waUrl = cleanPhone.length >= 9 
                    ? `https://wa.me/51${cleanPhone.startsWith("51") ? cleanPhone.slice(2) : cleanPhone}`
                    : null;
                  const rowPadding = density === "compacta" ? "py-2.5 px-4" : "py-3.5 px-4";

                  return (
                    <tr 
                      key={p.id} 
                      className="hover:bg-teal-50/20 transition-colors group"
                    >
                      {/* Columna 1: Paciente & Documento */}
                      <td className={rowPadding}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-teal-800 font-black flex items-center justify-center text-xs shrink-0 group-hover:bg-teal-100 transition-colors">
                            {p.nombres?.[0] || "P"}{p.apellidos?.[0] || ""}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Link 
                                href={`/dashboard/pacientes/${p.id}`} 
                                className="font-bold text-slate-900 hover:text-teal-700 block text-xs truncate transition-colors"
                              >
                                {p.nombres} {p.apellidos}
                              </Link>
                              {p.tieneReevaluacionPendiente && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                                  Hito 5
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 font-medium">
                              <span className="font-mono text-slate-700 font-semibold">
                                {p.tipoDocumento || "DNI"}: {p.dni}
                              </span>
                              {edad !== null && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span>{edad} años</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Columna 2: Contacto Directo */}
                      <td className={rowPadding}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-700 font-medium text-xs">
                            {p.telefono || "Sin teléfono"}
                          </span>

                          {p.telefono && (
                            <button
                              onClick={() => copyToClipboard(p.telefono, p.id)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                              title="Copiar número"
                            >
                              {copiedPhone === p.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}

                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition shadow-2xs"
                              title="Conversar por WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Columna 3: Tratamiento & Estado Clínico */}
                      <td className={rowPadding}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {p.tieneReevaluacionPendiente ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                                <AlertTriangle className="w-3 h-3 text-amber-700" />
                                Reevaluación Necesaria
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                En Tratamiento Activo
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span className="font-medium text-slate-700">
                              {p.paquetesCount > 0 ? `${p.paquetesCount} paquete(s)` : "Individual"}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>{p.citasCount || 0} cita(s) atendidas</span>
                          </div>
                        </div>
                      </td>

                      {/* Columna 4: Acciones */}
                      <td className={`${rowPadding} text-right`}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/dashboard/agenda?pacienteId=${p.id}`}
                            title="Agendar cita para este paciente"
                            className="p-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 rounded-lg transition"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/dashboard/pacientes/${p.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                          >
                            <span>Ficha</span>
                            <ChevronRight className="w-3.5 h-3.5" />
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
        
        {/* Pie de tabla con resumen */}
        <div className="bg-slate-50/60 px-4 py-2 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Mostrando <strong>{filtered.length}</strong> de <strong>{pacientes.length}</strong> expedientes</span>
          <span className="text-slate-400">AJ Fisioterapia • Sede San Borja</span>
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
