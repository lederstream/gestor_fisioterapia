"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AttendanceEvolutionModal } from "@/components/pacientes/AttendanceEvolutionModal";
import { NewPackageModal } from "@/components/pacientes/NewPackageModal";
import { ClinicalReportModal } from "@/components/pacientes/ClinicalReportModal";
import { EditPatientModal } from "@/components/pacientes/EditPatientModal";
import { PatientSessionHistory } from "@/components/pacientes/PatientSessionHistory";
import { EvaScaleChart } from "@/components/pacientes/EvaScaleChart";
import { PackageProgressBar } from "@/components/pacientes/PackageProgressBar";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { 
  Activity, 
  AlertTriangle, 
  Layers, 
  Printer, 
  Calendar, 
  UserCheck, 
  CheckCircle2, 
  TrendingDown, 
  Clock, 
  ShieldCheck, 
  History, 
  CreditCard, 
  FileText,
  LayoutGrid,
  Sparkles,
  ChevronRight,
  ShieldAlert
} from "lucide-react";

interface PatientDetailClientProps {
  paciente: any;
  citas: any[];
  paquetes: any[];
  terapeutas: any[];
  servicios?: any[];
  historialEva?: any[];
  logsDelPaciente?: any[];
}

export function PatientDetailClient({
  paciente,
  citas,
  paquetes,
  terapeutas,
  servicios = [],
  historialEva = [],
  logsDelPaciente = [],
}: PatientDetailClientProps) {
  const router = useRouter();
  const { hasPermission, currentRole } = useAuth();
  const [currentPatient, setCurrentPatient] = useState(paciente);
  const [activeTab, setActiveTab] = useState<"historial" | "grafico" | "paquetes" | "auditoria" | "todo">("historial");

  // Permisos segmentados estrictos (Seguridad del Negocio)
  const canEditPatient = hasPermission("pacientes:crear");
  const canPrintReport = hasPermission("clinica:reporte");
  const canAssignPackage = hasPermission("pacientes:paquetes");
  const canSeeFinance = hasPermission("caja:ver");
  const canSeeAudit = hasPermission("auditoria:ver");
  const canRegisterAttendance = hasPermission("clinica:evolucion");
  
  // Modales
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Citas pendientes inmediatas
  const citasPendientes = citas.filter(
    (c) => c.estado === "PROGRAMADA" || c.estado === "CONFIRMADA"
  );
  const proximaCita = citasPendientes.length > 0 ? citasPendientes[citasPendientes.length - 1] : null;

  const tieneReevaluacion = citasPendientes.some((c) => c.esReevaluacion);

  // Métricas rápidas para la cabecera ejecutiva
  const paqueteActivo = paquetes.find((p) => p.sesionesConsumidas < p.totalSesiones) || paquetes[0];
  const ultimoEva = historialEva.length > 0 ? historialEva[historialEva.length - 1] : null;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* KPI Cards de Resumen Rápido para Dueño y Trabajadores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* 1. Estado de Paquete */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Tratamiento</span>
            <Layers className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="font-extrabold text-sm text-slate-800 truncate">
            {paqueteActivo ? (
              <span>Sesión {paqueteActivo.sesionesConsumidas}/{paqueteActivo.totalSesiones}</span>
            ) : (
              <span>Sesiones Individuales</span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 truncate">
            {paqueteActivo ? paqueteActivo.servicio?.nombre || "Paquete Activo" : "Sin paquete asignado"}
          </p>
        </div>

        {/* 2. Dolor EVA Actual */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Dolor EVA</span>
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="font-extrabold text-sm text-slate-800">
            {ultimoEva ? (
              <span className="text-emerald-700">{ultimoEva.evaFin}/10 Post</span>
            ) : (
              <span className="text-slate-400">Sin registro</span>
            )}
          </div>
          <p className="text-[10px] text-slate-500">
            {ultimoEva ? `Inicio fue ${ultimoEva.evaInicio}/10` : "Pendiente de sesión"}
          </p>
        </div>

        {/* 3. Próxima Cita */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Agenda</span>
            <Clock className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="font-extrabold text-sm text-slate-800 truncate">
            {proximaCita ? (
              <span>{new Date(proximaCita.fechaHoraInicio).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}</span>
            ) : (
              <span className="text-slate-400">Sin cita próxima</span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 truncate">
            {proximaCita ? `${proximaCita.sala?.nombre || "Sala"} • ${proximaCita.terapeuta?.nombre || "Terapeuta"}` : "Requiere agendamiento"}
          </p>
        </div>

        {/* 4. Estado Financiero / Plan Clínico */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {canSeeFinance ? "Finanzas" : "Plan de Cuidado"}
            </span>
            <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="font-extrabold text-sm text-slate-800">
            {canSeeFinance ? (
              paqueteActivo ? (
                <span className={paqueteActivo.estadoPago === "PAGADO" ? "text-emerald-700" : "text-amber-700"}>
                  {paqueteActivo.estadoPago}
                </span>
              ) : (
                <span className="text-slate-400">Al día</span>
              )
            ) : (
              paqueteActivo ? (
                <span className="text-teal-700">En Curso</span>
              ) : (
                <span className="text-slate-400">Individual</span>
              )
            )}
          </div>
          <p className="text-[10px] text-slate-500 truncate">
            {canSeeFinance ? (
              paqueteActivo ? `${formatCurrency(paqueteActivo.montoPagado)} de ${formatCurrency(paqueteActivo.montoTotal)}` : "Pagos por sesión"
            ) : (
              paqueteActivo ? `${paqueteActivo.sesionesConsumidas} de ${paqueteActivo.totalSesiones} sesiones` : "Atención por sesión"
            )}
          </p>
        </div>
      </div>

      {/* Barra de Acciones Operativas Rápidas */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm">
            Gestión y Operaciones del Expediente
          </h3>
          <p className="text-xs text-slate-500">
            {citasPendientes.length > 0
              ? `El paciente tiene ${citasPendientes.length} cita(s) pendiente(s) de atención física o evolución.`
              : "No hay citas inmediatas pendientes. Puede agendar una nueva sesión en la agenda."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Editar datos */}
          {canEditPatient && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              title="Editar filiación y contacto"
            >
              <UserCheck className="w-4 h-4 text-slate-600" />
              <span>Editar Datos</span>
            </button>
          )}

          {/* Imprimir Ficha */}
          {canPrintReport && (
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition border border-indigo-200 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-indigo-600" />
              <span>Imprimir Ficha</span>
            </button>
          )}

          {/* Asignar Paquete */}
          {canAssignPackage && (
            <button
              onClick={() => setIsPackageModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl transition border border-teal-200 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Asignar Paquete</span>
            </button>
          )}

          {/* Botón Principal: Registrar Asistencia o Agendar */}
          {citasPendientes.length > 0 ? (
            canRegisterAttendance ? (
              <button
                onClick={() => setIsAttendanceModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/30 transition cursor-pointer"
              >
                <Activity className="w-4 h-4" />
                <span>Registrar Asistencia y EVA</span>
              </button>
            ) : null
          ) : (
            <Link
              href={`/dashboard/agenda?pacienteId=${currentPatient.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>Agendar en Agenda</span>
            </Link>
          )}
        </div>
      </div>

      {/* Alerta de Reevaluación si corresponde */}
      {tieneReevaluacion && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900 text-xs animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-sm block">Reevaluación Periódica Obligatoria (Sesión 5)</span>
            <span>
              Este paciente ha alcanzado el ciclo de 5 sesiones asistidas. El sistema requiere evaluación física integral y registro de evolución antes de autorizar el alta clínica.
            </span>
          </div>
        </div>
      )}

      {/* PESTAÑAS INTELIGENTES: FACILITA EL TRABAJO DEL DUEÑO Y PERSONAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab("historial")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "historial"
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Historial Cronológico ({citas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("grafico")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "grafico"
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Curva de Dolor EVA</span>
          </button>

          <button
            onClick={() => setActiveTab("paquetes")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "paquetes"
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{canSeeFinance ? `Paquetes y Pagos (${paquetes.length})` : `Sesiones del Plan (${paquetes.length})`}</span>
          </button>

          {canSeeAudit && (
            <button
              onClick={() => setActiveTab("auditoria")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "auditoria"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Trazabilidad ({logsDelPaciente.length})</span>
            </button>
          )}
        </div>

        {/* Toggle Ver Todo Desplegado */}
        <button
          onClick={() => setActiveTab(activeTab === "todo" ? "historial" : "todo")}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer self-start sm:self-auto ${
            activeTab === "todo"
              ? "bg-slate-800 text-white"
              : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          {activeTab === "todo" ? "Ver por Pestañas" : "Desplegar Todo"}
        </button>
      </div>

      {/* CONTENIDO DE LAS PESTAÑAS (Optimizadas, sin duplicidades) */}
      <div className="space-y-6">
        {/* 1. HISTORIAL CRONOLÓGICO DE SESIONES */}
        {(activeTab === "historial" || activeTab === "todo") && (
          <div className="space-y-2 animate-in fade-in">
            <PatientSessionHistory
              citas={citas}
              historialEva={historialEva}
              pacienteNombre={`${currentPatient.nombres} ${currentPatient.apellidos}`}
            />
          </div>
        )}

        {/* 2. CURVA GRÁFICA DE DOLOR EVA */}
        {(activeTab === "grafico" || activeTab === "todo") && (
          <div className="space-y-2 animate-in fade-in">
            <EvaScaleChart historialEva={historialEva} />
          </div>
        )}

        {/* 3. PAQUETES Y SESIONES */}
        {(activeTab === "paquetes" || activeTab === "todo") && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>{canSeeFinance ? "Paquetes de Tratamiento y Finanzas" : "Progreso de Sesiones del Plan"}</span>
              </h2>
            </div>
            <PackageProgressBar paquetes={paquetes} showFinancials={canSeeFinance} />
          </div>
        )}

        {/* 4. TRAZABILIDAD Y AUDITORÍA */}
        {canSeeAudit && (activeTab === "auditoria" || activeTab === "todo") && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-teal-600" />
                <h3 className="font-extrabold text-slate-800 text-sm">
                  Trazabilidad y Auditoría del Expediente
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                {logsDelPaciente.length} registros oficiales
              </span>
            </div>

            {logsDelPaciente.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No hay movimientos previos registrados para este expediente.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
                {logsDelPaciente.map((log) => (
                  <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">{log.accion}</span>
                      <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{log.detalles}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block font-mono">{formatDateTime(log.createdAt)}</span>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-100 mt-0.5 inline-block">
                        {log.usuarioNombre}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales Vinculados */}
      {isAttendanceModalOpen && citasPendientes.length > 0 && (
        <AttendanceEvolutionModal
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          citasProgramadas={citasPendientes}
          terapeutas={terapeutas}
          paciente={currentPatient}
          onEvolucionRegistrada={() => {
            showNotification("Asistencia y evolución clínica registrada con éxito.");
            router.refresh();
          }}
        />
      )}

      {isPackageModalOpen && (
        <NewPackageModal
          isOpen={isPackageModalOpen}
          onClose={() => setIsPackageModalOpen(false)}
          pacienteId={currentPatient.id}
          pacienteNombre={`${currentPatient.nombres} ${currentPatient.apellidos}`}
          servicios={servicios}
          onPackageAssigned={() => {
            showNotification("Paquete de tratamiento asignado con éxito.");
            router.refresh();
          }}
        />
      )}

      {isReportModalOpen && (
        <ClinicalReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          paciente={currentPatient}
          paquetes={paquetes}
          citas={citas}
          historialEva={historialEva}
        />
      )}

      {isEditModalOpen && (
        <EditPatientModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          paciente={currentPatient}
          onPatientUpdated={(updated) => {
            setCurrentPatient(updated);
            showNotification("Datos del paciente actualizados con éxito.");
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
