import { dbStore } from "@/lib/store";
import { PatientTratamientoView } from "@/components/pacientes/PatientTratamientoView";

export default function TratamientoPage() {
  const pacienteAlexander = dbStore.getPacientes().find((p) => p.dni === "45892011") || dbStore.getPacientes()[0];
  const paquetes = dbStore.getPaquetes().filter((paq) => paq.pacienteId === pacienteAlexander?.id);
  const citas = dbStore.getCitas().filter((c) => c.pacienteId === pacienteAlexander?.id);
  const historias = dbStore.getHistorias().filter((h) => citas.some((c) => c.id === h.citaId) || h.citaId.includes("prev"));

  return (
    <PatientTratamientoView
      paquetes={paquetes}
      historias={historias}
    />
  );
}
