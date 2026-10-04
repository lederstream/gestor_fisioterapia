"use client";

import { Activity, TrendingDown, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface EvaScaleChartProps {
  historialEva: Array<{
    id: string;
    fecha: string;
    evaInicio: number;
    evaFin: number;
    tratamiento: string;
    notas?: string | null;
    bloqueaAlta: boolean;
  }>;
}

export function EvaScaleChart({ historialEva }: EvaScaleChartProps) {
  const getEvaColor = (val: number) => {
    if (val === 0) return "bg-emerald-500 text-white";
    if (val <= 3) return "bg-teal-500 text-white";
    if (val <= 6) return "bg-amber-500 text-white";
    if (val <= 8) return "bg-orange-500 text-white";
    return "bg-rose-600 text-white";
  };

  const getEvaLabel = (val: number) => {
    if (val === 0) return "Sin Dolor";
    if (val <= 3) return "Dolor Leve";
    if (val <= 6) return "Dolor Moderado";
    if (val <= 8) return "Dolor Severo";
    return "Dolor Máximo";
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Evolución Clínica y Escala Visual Analógica (EVA)
            </h3>
            <p className="text-[11px] text-slate-500">
              Registro del dolor pre y post sesión (0 a 10) conforme a normativa de calidad asistencial.
            </p>
          </div>
        </div>

        {/* Resumen del último alivio */}
        {historialEva.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs font-semibold">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <span>
              Última reducción:{" "}
              {historialEva[historialEva.length - 1].evaInicio - historialEva[historialEva.length - 1].evaFin} pts EVA
            </span>
          </div>
        )}
      </div>

      {historialEva.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          No hay registros de evolución clínica para este paciente todavía.
        </div>
      ) : (
        <div className="space-y-4">
          {historialEva.map((item, index) => {
            const delta = item.evaInicio - item.evaFin;

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 text-xs">
                      Sesión Clínica #{index + 1}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • {formatDateTime(item.fecha)}
                    </span>
                  </div>

                  {item.bloqueaAlta && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      <AlertCircle className="w-3 h-3 text-rose-600" />
                      Bloqueo de Alta: Reevaluación Pendiente
                    </span>
                  )}
                </div>

                {/* Comparador EVA Gráfico */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* EVA Inicio */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                        EVA Inicial (Pre-Sesión)
                      </span>
                      <span className="text-xs font-medium text-slate-700">
                        {getEvaLabel(item.evaInicio)}
                      </span>
                    </div>
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${getEvaColor(
                        item.evaInicio
                      )}`}
                    >
                      {item.evaInicio}
                    </div>
                  </div>

                  {/* EVA Fin */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                        EVA Final (Post-Sesión)
                      </span>
                      <span className="text-xs font-medium text-slate-700">
                        {getEvaLabel(item.evaFin)}
                      </span>
                    </div>
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${getEvaColor(
                        item.evaFin
                      )}`}
                    >
                      {item.evaFin}
                    </div>
                  </div>
                </div>

                {/* Tratamiento Aplicado y Notas */}
                <div className="text-xs space-y-1.5 bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex items-start gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-700">Tratamiento Aplicado: </span>
                      <span className="text-slate-600">{item.tratamiento}</span>
                    </div>
                  </div>

                  {item.notas && (
                    <div className="pt-2 border-t border-slate-100 text-amber-900 bg-amber-50/70 p-2 rounded text-[11px]">
                      <span className="font-bold">Nota de Reevaluación / Observación Clínica: </span>
                      <span>{item.notas}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
