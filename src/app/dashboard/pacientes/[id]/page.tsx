import { notFound } from "next/navigation";
import { obtenerFichaPaciente } from "@/server/actions/pacientes";
import { dbStore } from "@/lib/store";
import { PatientHeader } from "@/components/pacientes/PatientHeader";
import { PackageProgressBar } from "@/components/pacientes/PackageProgressBar";
import { EvaScaleChart } from "@/components/pacientes/EvaScaleChart";
import { PatientDetailClient } from "./PatientDetailClient";
import { formatDateTime } from "@/lib/utils";
import { History, ShieldCheck, FileCheck } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PacienteDetailPage({ params }: Props) {
  const { id } = await params;
  const ficha = await obtenerFichaPaciente(id);

  if (!ficha) {
    notFound();
  }

  const terapeutas = dbStore.getTerapeutas();
  const todosLosLogs = dbStore.getAuditLogs();
  
  // Filtrar logs de trazabilidad relacionados a este paciente
  const logsDelPaciente = todosLosLogs.filter((log) => {
    const qNombre = ficha.paciente.nombres.toLowerCase();
    const qDni = ficha.paciente.dni;
    return log.detalles.toLowerCase().includes(qNombre) || log.detalles.includes(qDni);
  });

  return (
    <div className="space-y-6">
      {/* Cabecera del Paciente */}
      <PatientHeader paciente={ficha.paciente} />

      {/* Componente Interactivo para Registrar Asistencia y Evolución EVA */}
      <PatientDetailClient
        paciente={ficha.paciente}
        citas={ficha.citas}
        paquetes={ficha.paquetes}
        terapeutas={terapeutas}
      />

      {/* Progreso del Paquete de Sesiones */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Paquetes de Tratamiento y Sesiones
        </h2>
        <PackageProgressBar paquetes={ficha.paquetes} />
      </div>

      {/* Historial de Escala EVA y Evolución Clínica */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Historia Clínica y Escala Visual Analógica (EVA)
        </h2>
        <EvaScaleChart historialEva={ficha.historialEva} />
      </div>

      {/* Trazabilidad y Auditoría del Expediente */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              Trazabilidad y Auditoría del Expediente
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            {logsDelPaciente.length} movimientos registrados
          </span>
        </div>

        {logsDelPaciente.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No hay movimientos previos registrados para este expediente.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {logsDelPaciente.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block">{log.accion}</span>
                  <p className="text-slate-600 text-[11px]">{log.detalles}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block">{formatDateTime(log.createdAt)}</span>
                  <span className="text-[10px] font-semibold text-teal-700">{log.usuarioNombre}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
