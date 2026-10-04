import { dbStore } from "@/lib/store";
import { DashboardPageClient } from "./DashboardPageClient";

export default function DashboardPage() {
  const citas = dbStore.getCitas();
  const salas = dbStore.getSalas();
  const pacientes = dbStore.getPacientes();
  const paquetes = dbStore.getPaquetes();
  const pagos = dbStore.getPagos();
  const auditLogs = dbStore.getAuditLogs().slice(0, 5);
  const historias = dbStore.getHistorias();

  return (
    <DashboardPageClient
      citas={citas}
      salas={salas}
      pacientes={pacientes}
      paquetes={paquetes}
      pagos={pagos}
      auditLogs={auditLogs}
      historias={historias}
    />
  );
}

