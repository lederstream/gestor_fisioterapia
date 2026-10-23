import { obtenerCitasAgenda } from "@/server/actions/citas";
import { obtenerConfiguracionCompleta } from "@/server/actions/configuracion";
import { listarPacientes } from "@/server/actions/pacientes";
import { MatrixGrid } from "@/components/agenda/MatrixGrid";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const [agendaData, configData, pacientesData] = await Promise.all([
    obtenerCitasAgenda(),
    obtenerConfiguracionCompleta(),
    listarPacientes(),
  ]);

  return (
    <div className="space-y-6">
      <MatrixGrid
        initialCitas={agendaData.citas}
        salas={configData.salas}
        terapeutas={agendaData.terapeutas}
        pacientes={pacientesData as any}
        paquetes={[]}
        servicios={configData.servicios}
        configuracion={configData.configuracion}
      />
    </div>
  );
}
