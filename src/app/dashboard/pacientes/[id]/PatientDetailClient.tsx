"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AttendanceEvolutionModal } from "@/components/pacientes/AttendanceEvolutionModal";
import { Activity, Plus, AlertTriangle, CheckCircle2 } from "lucide-react";

interface PatientDetailClientProps {
  paciente: any;
  citas: any[];
  paquetes: any[];
  terapeutas: any[];
}

export function PatientDetailClient({
  paciente,
  citas,
  paquetes,
  terapeutas,
}: PatientDetailClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Citas que están en estado PROGRAMADA o CONFIRMADA para registrar asistencia
  const citasPendientes = citas.filter(
    (c) => c.estado === "PROGRAMADA" || c.estado === "CONFIRMADA"
  );

  const tieneReevaluacion = citasPendientes.some((c) => c.esReevaluacion);

  return (
    <>
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">
            Atención Clínica en Curso
          </h3>
          <p className="text-xs text-slate-500">
            {citasPendientes.length > 0
              ? `El paciente tiene ${citasPendientes.length} cita(s) pendiente(s) de atención.`
              : "No hay citas pendientes inmediatas para registrar evolución."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {citasPendientes.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-teal-600/30 transition"
            >
              <Activity className="w-4 h-4" />
              <span>Registrar Asistencia y Escala EVA</span>
            </button>
          )}
        </div>
      </div>

      {tieneReevaluacion && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sm block">Reevaluación Periódica Obligatoria</span>
            <span>
              Este paciente ha alcanzado el ciclo de 5 sesiones asistidas. El sistema requiere evaluación física integral y registro de evolución antes de autorizar el alta clínica.
            </span>
          </div>
        </div>
      )}

      {isModalOpen && citasPendientes.length > 0 && (
        <AttendanceEvolutionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          citasProgramadas={citasPendientes}
          terapeutas={terapeutas}
          paciente={paciente}
          onEvolucionRegistrada={() => {
            router.refresh();
          }}
        />
      )}
    </>
  );
}
