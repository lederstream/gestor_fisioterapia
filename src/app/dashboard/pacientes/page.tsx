import { listarPacientes } from "@/server/actions/pacientes";
import { PacientesClient } from "./PacientesClient";

export default async function PacientesPage() {
  const pacientes = await listarPacientes();

  return <PacientesClient initialPacientes={pacientes} />;
}
