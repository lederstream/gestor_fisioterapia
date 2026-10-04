import { obtenerLogsAuditoria } from "@/server/actions/auditoria";
import { AuditLogTable } from "@/components/auditoria/AuditLogTable";
import { ShieldCheck, History, Eye, Lock } from "lucide-react";

export default async function AuditoriaPage() {
  const logs = await obtenerLogsAuditoria();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5 text-teal-600" />
            <span>Auditoría Médica y Financiera • ISO / HIPAA Compliance</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-800">
            Registro de Auditoría y Trazabilidad (Audit Trail)
          </h1>
          <p className="text-xs text-slate-500">
            Seguimiento milimétrico de cada movimiento: citas agendadas, cobros, evoluciones clínicas EVA y cambios de configuración.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Seguridad Activa: Integridad 100%</span>
          </div>
        </div>
      </div>

      <AuditLogTable initialLogs={logs} />
    </div>
  );
}
