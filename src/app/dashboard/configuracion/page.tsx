import { obtenerConfiguracionCompleta } from "@/server/actions/configuracion";
import { ConfigurationManager } from "@/components/configuracion/ConfigurationManager";
import { PermissionGuard } from "@/components/layout/PermissionGuard";
import { Settings, ShieldCheck } from "lucide-react";

export default async function ConfiguracionPage() {
  const data = await obtenerConfiguracionCompleta();

  return (
    <PermissionGuard
      permission="config:ver"
      fallbackTitle="Acceso Restringido a Parámetros de Sede"
      fallbackMessage="La modificación de salas físicas, aranceles de servicios y reglas institucionales de San Borja es exclusiva para la Dirección Médica y Gerencia."
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-800">
              Módulo de Configuración Integral
            </h1>
            <p className="text-xs text-slate-500">
              Administración de sede San Borja, capacidad de las 6 salas, regla obligatoria de reevaluación cada 5 sesiones y catálogo arancelario.
            </p>
          </div>

          <div className="bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4 text-teal-600" />
            <span>Panel de Administración Senior</span>
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

