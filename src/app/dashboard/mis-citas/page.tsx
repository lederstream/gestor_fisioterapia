import { dbStore } from "@/lib/store";
import { PatientCitasView } from "@/components/pacientes/PatientCitasView";

export default function MisCitasPage() {
  const pacienteAlexander = dbStore.getPacientes().find((p) => p.dni === "45892011") || dbStore.getPacientes()[0];
  const citas = dbStore.getCitas().filter((c) => c.pacienteId === pacienteAlexander?.id);
  const salas = dbStore.getSalas();
  const personal = dbStore.getUsers();

  return (
    <PatientCitasView
      citas={citas}
      salas={salas}
      personal={personal}
    />
  );
}
