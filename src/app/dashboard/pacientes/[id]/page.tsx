import { notFound } from "next/navigation";
import { obtenerFichaPaciente } from "@/server/actions/pacientes";
import { obtenerConfiguracionCompleta } from "@/server/actions/configuracion";
import { obtenerLogsAuditoria } from "@/server/actions/auditoria";
import { PatientHeader } from "@/components/pacientes/PatientHeader";
import { PatientDetailClient } from "./PatientDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PacienteDetailPage({ params }: Props) {
  const { id } = await params;
  const [ficha, configData, todosLosLogs] = await Promise.all([
    obtenerFichaPaciente(id),
    obtenerConfiguracionCompleta(),
    obtenerLogsAuditoria(),
  ]);

  if (!ficha) {
    notFound();
  }

  // Filtrar logs de trazabilidad relacionados a este paciente
  const logsDelPaciente = todosLosLogs.filter((log) => {
    const qNombre = ficha.paciente.nombres.toLowerCase();
    const qDni = ficha.paciente.dni;
    return log.detalles.toLowerCase().includes(qNombre) || log.detalles.includes(qDni);
  });

  return (
    <div className="space-y-6">
      {/* Cabecera del Paciente con Acciones Rápidas */}
      <PatientHeader paciente={ficha.paciente} />

      {/* Experiencia Clínica y de Negocio Unificada */}
      <PatientDetailClient
        paciente={ficha.paciente}
        citas={ficha.citas}
        paquetes={ficha.paquetes}
        terapeutas={configData.personal.filter((p) => p.rol === "TERAPEUTA" || p.rol === "ASISTENTE")}
        servicios={configData.servicios}
        historialEva={ficha.historialEva}
        logsDelPaciente={logsDelPaciente}
      />
    </div>
  );
}
