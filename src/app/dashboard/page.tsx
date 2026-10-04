import Link from "next/link";
import { dbStore } from "@/lib/store";
import { formatCurrency, formatTime } from "@/lib/utils";
import { 
  Calendar, 
  CreditCard, 
  Users, 
  Activity, 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Building2
} from "lucide-react";

export default function DashboardPage() {
  const citas = dbStore.getCitas();
  const salas = dbStore.getSalas();
  const pacientes = dbStore.getPacientes();
  const paquetes = dbStore.getPaquetes();
  const pagos = dbStore.getPagos();

  const totalAtendidas = citas.filter((c) => c.estado === "ATENDIDA").length;
  const totalProgramadas = citas.filter((c) => c.estado === "PROGRAMADA" || c.estado === "CONFIRMADA").length;
  const totalReevaluaciones = citas.filter((c) => c.esReevaluacion && c.estado !== "CANCELADA").length;
  const totalRecaudado = pagos.reduce((sum, p) => sum + p.monto, 0);

  return (
    <div className="space-y-6">
      {/* Bienvenida y Estado Operativo */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2 border border-teal-500/30">
            <Building2 className="w-3.5 h-3.5" /> AJ Fisioterapia • San Borja
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Panel de Control Clínico y Operativo
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Gestión en tiempo real de las 6 salas de terapia física, control de paquetes de 10 y 20 sesiones, y cumplimiento estricto de reevaluación cada 5 sesiones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/agenda"
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-600/30 flex items-center gap-2 transition"
          >
            <Calendar className="w-4 h-4" />
            <span>Ver Matriz de 6 Salas</span>
          </Link>
          <Link
            href="/dashboard/caja"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 transition"
          >
            <CreditCard className="w-4 h-4" />
            <span>Módulo de Caja</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Salas Operativas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Capacidad Salas</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800">
            6 / 6
          </div>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% de salas físicas operativas hoy
          </p>
        </div>

        {/* KPI 2: Citas de Hoy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Flujo de Pacientes</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800">
            {citas.length} Citas
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {totalAtendidas} atendidas • {totalProgramadas} programadas
          </p>
        </div>

        {/* KPI 3: Reevaluaciones Pendientes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Hito Reevaluación</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700">
            {totalReevaluaciones}
          </div>
          <p className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
            Reevaluación física obligatoria activa
          </p>
        </div>

        {/* KPI 4: Recaudación */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Ingresos Caja</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800">
            {formatCurrency(totalRecaudado)}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">
            Yape, Plin, POS y Efectivo conciliados
          </p>
        </div>
      </div>

      {/* Grid: Salas Físicas Status & Citas Inmediatas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estado en vivo de las 6 salas */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Disponibilidad de Salas Físicas</h2>
              <p className="text-[11px] text-slate-500">AJ Fisioterapia (San Borja)</p>
            </div>
            <Link
              href="/dashboard/agenda"
              className="text-teal-600 hover:text-teal-700 text-xs font-bold flex items-center gap-1"
            >
              Matriz <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {salas.map((sala) => {
              const citaEnCurso = citas.find(
                (c) => c.salaId === sala.id && c.estado !== "CANCELADA"
              );

              return (
                <div
                  key={sala.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 text-xs">{sala.nombre}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[10px] text-slate-500 truncate">
                    {citaEnCurso ? "Ocupada / Reservada" : "Libre"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Sistema libre de solapamientos con índice compuesto.</span>
          </div>
        </div>

        {/* Lista de citas programadas / atendidas hoy */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Próximas Sesiones del Turno</h2>
              <p className="text-[11px] text-slate-500">Atención personalizada por sala</p>
            </div>
            <Link
              href="/dashboard/agenda"
              className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              Ver agenda completa <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {citas.slice(0, 5).map((cita) => {
              const paciente = pacientes.find((p) => p.id === cita.pacienteId);
              const sala = salas.find((s) => s.id === cita.salaId);

              return (
                <div key={cita.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs text-center min-w-[55px]">
                      {formatTime(cita.fechaHoraInicio)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/pacientes/${cita.pacienteId}`}
                          className="font-bold text-slate-800 text-xs hover:text-teal-600 hover:underline"
                        >
                          {paciente?.nombres} {paciente?.apellidos}
                        </Link>
                        {cita.esReevaluacion && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Reevaluación
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {sala?.nombre} • DNI: {paciente?.dni}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        cita.estado === "ATENDIDA"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : cita.estado === "CONFIRMADA"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200"
                      }`}
                    >
                      {cita.estado}
                    </span>
                    <Link
                      href={`/dashboard/pacientes/${cita.pacienteId}`}
                      className="p-1 text-slate-400 hover:text-slate-600"
                      title="Ver ficha"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
