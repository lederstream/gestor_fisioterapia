import { obtenerDiagnosticoSistema } from "@/server/actions/soporte";
import { SystemDiagnosticsClient } from "@/components/soporte/SystemDiagnosticsClient";
import { PermissionGuard } from "@/components/layout/PermissionGuard";

export const dynamic = "force-dynamic";

export default async function SoportePage() {
  const diagnosticData = await obtenerDiagnosticoSistema();

  return (
    <PermissionGuard
      permission="sistema:superadmin"
      fallbackTitle="Acceso Restringido a Consola de Soporte"
      fallbackMessage="El monitor de diagnóstico del sistema y auditoría forense está reservado exclusivamente para la cuenta raíz de SuperAdmin / Soporte Técnico."
    >
      <SystemDiagnosticsClient initialData={diagnosticData} />
    </PermissionGuard>
  );
}

