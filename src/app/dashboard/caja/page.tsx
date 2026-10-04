import { obtenerReporteCaja } from "@/server/actions/pagos";
import { CajaClient } from "./CajaClient";

export default async function CajaPage() {
  const reporte = await obtenerReporteCaja();

  return <CajaClient reporte={reporte} />;
}
