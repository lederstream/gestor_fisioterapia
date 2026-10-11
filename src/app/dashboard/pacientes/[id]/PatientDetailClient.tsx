"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AttendanceEvolutionModal } from "@/components/pacientes/AttendanceEvolutionModal";
import { NewPackageModal } from "@/components/pacientes/NewPackageModal";
import { ClinicalReportModal } from "@/components/pacientes/ClinicalReportModal";
import { EditPatientModal } from "@/components/pacientes/EditPatientModal";
import { Activity, AlertTriangle, Layers, Printer, Calendar, UserCheck, CheckCircle2 } from "lucide-react";

interface PatientDetailClientProps {
  paciente: any;
  citas: any[];
  paquetes: any[];
  terapeutas: any[];
  servicios?: any[];
  historialEva?: any[];
}

export function PatientDetailClient({
  paciente,
  citas,
  paquetes,
  terapeutas,
  servicios = [],
  historialEva = [],
}: PatientDetailClientProps) {
  const router = useRouter();
  const [currentPatient, setCurrentPatient] = useState(paciente);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const citasPendientes = citas.filter(
    (c) => c.estado === "PROGRAMADA" || c.estado === "CONFIRMADA"
  );

  const tieneReevaluacion = citasPendientes.some((c) => c.esReevaluacion);

  return (
    <>
      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-semibold shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">
            Acciones y Gestión del Expediente
          </h3>
          <p className="text-xs text-slate-500">
            {citasPendientes.length > 0
              ? `El paciente tiene ${citasPendientes.length} cita(s) pendiente(s) de atención.`
              : "No hay citas pendientes inmediatas para registrar evolución."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Editar datos */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            title="Editar filiación y contacto"
          >
            <UserCheck className="w-4 h-4 text-slate-600" />
            <span>Editar Datos</span>
          </button>

          {/* Imprimir Ficha */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition border border-indigo-200 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-indigo-600" />
            <span>Imprimir Ficha / Informe</span>
          </button>

          {/* Nuevo Paquete */}
          <button
            onClick={() => setIsPackageModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl transition border border-teal-200 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Asignar Paquete</span>
          </button>

          {/* Registrar Asistencia si hay citas pendientes */}
          {citasPendientes.length > 0 ? (
            <button
              onClick={() => setIsAttendanceModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/30 transition cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>Registrar Asistencia y EVA</span>
            </button>
          ) : (
            <Link
              href={`/dashboard/agenda?pacienteId=${currentPatient.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>Agendar Cita en Agenda</span>
            </Link>
          )}
        </div>
      </div>

      {tieneReevaluacion && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sm block">Reevaluación Periódica Obligatoria (Sesión 5)</span>
            <span>
              Este paciente ha alcanzado el ciclo de 5 sesiones asistidas. El sistema requiere evaluación física integral y registro de evolución antes de autorizar el alta clínica.
            </span>
          </div>
        </div>
      )}

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
    </>
  );
}
