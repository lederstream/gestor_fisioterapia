import Link from "next/link";
import { obtenerConfiguracionCompleta } from "@/server/actions/configuracion";
import { ConfigurationManager } from "@/components/configuracion/ConfigurationManager";
import { PermissionGuard } from "@/components/layout/PermissionGuard";
import { Settings, Users, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const data = await obtenerConfiguracionCompleta();

  return (
    <PermissionGuard
      permission="config:ver"
      fallbackTitle="Acceso Restringido a Configuración Clínica"
      fallbackMessage="La modificación de salas físicas, aranceles de servicios y reglas institucionales de la clínica es exclusiva para la Dirección Médica y Gerencia."
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-800">
              Configuración de la Clínica
            </h1>
            <p className="text-xs text-slate-500">
              Gestiona la información de la clínica, horarios de atención semanales, salas físicas y catálogo de servicios.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/usuarios"
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-2xs text-xs flex items-center gap-1.5 transition"
              title="Administrar fisioterapeutas, recepcionistas y accesos"
            >
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>Gestionar Equipo</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-2xs text-xs flex items-center gap-1.5 transition"
              title="Abrir landing page pública"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Ver Web</span>
            </Link>

            <div className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-teal-600" />
              <span>Administración</span>
            </div>
          </div>
        </div>

        <ConfigurationManager
          initialConfig={data.configuracion}
          initialSalas={data.salas}
          initialServicios={data.servicios}
          initialPersonal={data.personal}
        />
      </div>
    </PermissionGuard>
  );
}
