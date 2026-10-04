import { obtenerReporteCaja } from "@/server/actions/pagos";
import { CajaClient } from "./CajaClient";
import { PermissionGuard } from "@/components/layout/PermissionGuard";

export default async function CajaPage() {
  const reporte = await obtenerReporteCaja();

  return (
    <PermissionGuard
      permission="caja:ver"
      fallbackTitle="Acceso Restringido a Finanzas y Caja"
      fallbackMessage="El rol actual no dispone de permisos para consultar el balance monetario, realizar cobranzas ni ejecutar arqueos de turno."
    >
      <CajaClient reporte={reporte} />
    </PermissionGuard>
  );
}

