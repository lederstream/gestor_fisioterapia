import { obtenerLogsAuditoria } from "@/server/actions/auditoria";
import { AuditLogTable } from "@/components/auditoria/AuditLogTable";
import { PermissionGuard } from "@/components/layout/PermissionGuard";
import { ShieldCheck, History } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditoriaPage() {
  const logs = await obtenerLogsAuditoria();

  return (
    <PermissionGuard
      permission="auditoria:ver"
      fallbackTitle="Acceso Restringido a Bitácora de Auditoría"
      fallbackMessage="La consulta del registro de auditoría médica y trazabilidad de transacciones es exclusiva para el perfil de Administrador / Gerencia."
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-2">
              <History className="w-3.5 h-3.5 text-teal-600" />
              <span>Historial Oficial de la Clínica</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-800">
              Historial de Operaciones y Auditoría de Negocio
            </h1>
            <p className="text-xs text-slate-500">
              Supervisión en tiempo real de transacciones financieras, agendamientos de recepción, evoluciones clínicas y desempeño del personal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Registro Protegido</span>
            </div>
          </div>
        </div>

        <AuditLogTable initialLogs={logs} />
      </div>
    </PermissionGuard>
  );
}
