"use client";

import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Layers } from "lucide-react";

interface PackageProgressBarProps {
  paquetes: any[];
}

export function PackageProgressBar({ paquetes }: PackageProgressBarProps) {
  if (paquetes.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
        El paciente no cuenta con paquetes activos. Todas las atenciones se registran como sesiones individuales.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {paquetes.map((paq) => {
        const pct = Math.round((paq.sesionesConsumidas / paq.totalSesiones) * 100);
        const sesRestantes = paq.totalSesiones - paq.sesionesConsumidas;
        const requiereReevaluacion = paq.sesionesConsumidas > 0 && paq.sesionesConsumidas % 5 === 0;
        const proximaEsReevaluacion = (paq.sesionesConsumidas + 1) % 5 === 0;

        return (
          <div key={paq.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <h3 className="font-bold text-slate-800 text-sm">
                    {paq.servicio?.nombre || "Paquete de Fisioterapia"}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    Paquete {paq.totalSesiones} Sesiones
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Iniciado el {new Date(paq.createdAt).toLocaleDateString("es-PE")}
                </p>
              </div>

              {/* Estado de Pago */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {formatCurrency(paq.montoPagado)} de {formatCurrency(paq.montoTotal)}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    paq.estadoPago === "PAGADO"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : paq.estadoPago === "PARCIAL"
                      ? "bg-amber-50 text-amber-700 border-amber-300"
                      : "bg-rose-50 text-rose-700 border-rose-300"
                  }`}
                >
                  {paq.estadoPago}
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                <span className="text-slate-700 font-bold text-sm">
                  Sesión {paq.sesionesConsumidas} de {paq.totalSesiones}
                </span>
                <span className="text-slate-500 text-xs">
                  {sesRestantes > 0 ? `${sesRestantes} sesiones disponibles` : "Paquete completado"} ({pct}%)
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 overflow-hidden flex border border-slate-200">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500 relative"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              {/* Indicadores de hitos clínicos cada 5 sesiones */}
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 px-1">
                <span>Inicio</span>
                <span className={paq.sesionesConsumidas >= 5 ? "font-bold text-teal-600" : ""}>
                  Sesión 5 (Reevaluación 1)
                </span>
                {paq.totalSesiones >= 10 && (
                  <span className={paq.sesionesConsumidas >= 10 ? "font-bold text-teal-600" : ""}>
                    Sesión 10 (Reevaluación 2)
                  </span>
                )}
                {paq.totalSesiones >= 20 && (
                  <>
                    <span className={paq.sesionesConsumidas >= 15 ? "font-bold text-teal-600" : ""}>
                      Sesión 15 (Reevaluación 3)
                    </span>
                    <span className={paq.sesionesConsumidas >= 20 ? "font-bold text-teal-600" : ""}>
                      Sesión 20 (Alta Médica)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Alertas de regla clínica */}
            {requiereReevaluacion && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold">¡Hito de 5 sesiones alcanzado!</span> Es obligatorio completar el examen de reevaluación física y registro en la historia clínica antes de autorizar el alta.
                </div>
              </div>
            )}

            {proximaEsReevaluacion && !requiereReevaluacion && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>La próxima sesión agendada requerirá reevaluación física periódica obligatoria.</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
