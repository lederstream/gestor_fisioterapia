import { dbStore } from "@/lib/store";
import { PatientPagosView } from "@/components/pacientes/PatientPagosView";

export default function MisPagosPage() {
  const pacienteAlexander = dbStore.getPacientes().find((p) => p.dni === "45892011") || dbStore.getPacientes()[0];
  const paquetes = dbStore.getPaquetes().filter((paq) => paq.pacienteId === pacienteAlexander?.id);
  const pagos = dbStore.getPagos().filter((p) => paquetes.some((paq) => paq.id === p.paqueteId) || !p.paqueteId);
  const servicios = dbStore.getServicios();

  return (
    <PatientPagosView
      pagos={pagos}
      paquetes={paquetes}
      paciente={pacienteAlexander}
      servicios={servicios}
    />
  );
}
