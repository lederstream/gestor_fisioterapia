import { dbStore } from "@/lib/store";
import { MatrixGrid } from "@/components/agenda/MatrixGrid";

export default function AgendaPage() {
  const citas = dbStore.getCitas();
  const salas = dbStore.getSalas();
  const terapeutas = dbStore.getTerapeutas();
  const pacientes = dbStore.getPacientes();
  const paquetes = dbStore.getPaquetes();
  const servicios = dbStore.getServicios();

  return (
    <div className="space-y-6">
      <MatrixGrid
        initialCitas={citas}
        salas={salas}
        terapeutas={terapeutas}
        pacientes={pacientes}
        paquetes={paquetes}
        servicios={servicios}
      />
    </div>
  );
}
