import { notFound } from "next/navigation";
import { obtenerFichaPaciente } from "@/server/actions/pacientes";
import { dbStore } from "@/lib/store";
import { PatientHeader } from "@/components/pacientes/PatientHeader";
import { PackageProgressBar } from "@/components/pacientes/PackageProgressBar";
import { EvaScaleChart } from "@/components/pacientes/EvaScaleChart";
import { PatientDetailClient } from "./PatientDetailClient";

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
          Historia Clínica y Escala Visual Analógica
        </h2>
        <EvaScaleChart historialEva={ficha.historialEva} />
      </div>
    </div>
  );
}
