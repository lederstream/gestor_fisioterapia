import { listarPacientes } from "@/server/actions/pacientes";
import { PacientesClient } from "./PacientesClient";

export const dynamic = "force-dynamic";

export default async function PacientesPage() {
  const pacientes = await listarPacientes();

  return <PacientesClient initialPacientes={pacientes} />;
}
