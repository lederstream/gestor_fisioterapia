import { notFound } from "next/navigation";
import { obtenerFichaPaciente } from "@/server/actions/pacientes";
import { dbStore } from "@/lib/store";
import { PatientHeader } from "@/components/pacientes/PatientHeader";
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
  const servicios = dbStore.getServicios();
  const todosLosLogs = dbStore.getAuditLogs();
  
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

      {/* Experiencia Clínica y de Negocio Unificada: Pestañas, Historial sin scroll horizontal, EVA y Paquetes */}
      <PatientDetailClient
        paciente={ficha.paciente}
        citas={ficha.citas}
        paquetes={ficha.paquetes}
        terapeutas={terapeutas}
        servicios={servicios}
        historialEva={ficha.historialEva}
        logsDelPaciente={logsDelPaciente}
      />
    </div>
  );
}
