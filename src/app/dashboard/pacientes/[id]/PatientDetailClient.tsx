"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AttendanceEvolutionModal } from "@/components/pacientes/AttendanceEvolutionModal";
import { NewPackageModal } from "@/components/pacientes/NewPackageModal";
import { ClinicalReportModal } from "@/components/pacientes/ClinicalReportModal";
import { Activity, Plus, AlertTriangle, Layers, Printer } from "lucide-react";

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
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const citasPendientes = citas.filter(
    (c) => c.estado === "PROGRAMADA" || c.estado === "CONFIRMADA"
  );

  const tieneReevaluacion = citasPendientes.some((c) => c.esReevaluacion);

  return (
    <>
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">
            Gestión Clínica del Expediente
          </h3>
          <p className="text-xs text-slate-500">
            {citasPendientes.length > 0
              ? `El paciente tiene ${citasPendientes.length} cita(s) pendiente(s) de atención.`
              : "No hay citas pendientes inmediatas para registrar evolución."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition border border-indigo-200"
          >
            <Printer className="w-4 h-4 text-indigo-600" />
            <span>Imprimir Ficha / Informe</span>
          </button>

          <button
            onClick={() => setIsPackageModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Contratar Paquete (10/20 ses)</span>
          </button>

          {citasPendientes.length > 0 && (
            <button
              onClick={() => setIsAttendanceModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/30 transition"
            >
              <Activity className="w-4 h-4" />
              <span>Registrar Asistencia y EVA</span>
            </button>
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

      {isAttendanceModalOpen && citasPendientes.length > 0 && (
        <AttendanceEvolutionModal
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          citasProgramadas={citasPendientes}
          terapeutas={terapeutas}
          paciente={paciente}
          onEvolucionRegistrada={() => {
            router.refresh();
          }}
        />
      )}

      {isPackageModalOpen && (
        <NewPackageModal
          isOpen={isPackageModalOpen}
          onClose={() => setIsPackageModalOpen(false)}
          pacienteId={paciente.id}
          pacienteNombre={`${paciente.nombres} ${paciente.apellidos}`}
          servicios={servicios}
          onPackageAssigned={() => {
            router.refresh();
          }}
        />
      )}

      {isReportModalOpen && (
        <ClinicalReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          paciente={paciente}
          paquetes={paquetes}
          citas={citas}
          historialEva={historialEva}
        />
      )}
    </>
  );
}
