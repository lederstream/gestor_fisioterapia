"use client";

import { useState } from "react";
import { 
  Activity, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Award, 
  ShieldCheck, 
  Zap, 
  HelpCircle 
} from "lucide-react";
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
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  // Cálculo de estadísticas globales
  const totalRegistros = historialEva.length;
  const primerRegistro = totalRegistros > 0 ? historialEva[0] : null;
  const ultimoRegistro = totalRegistros > 0 ? historialEva[totalRegistros - 1] : null;

  const evaInicial = primerRegistro ? primerRegistro.evaInicio : 0;
  const evaFinalActual = ultimoRegistro ? ultimoRegistro.evaFin : 0;
  
  const puntosReducidos = Math.max(0, evaInicial - evaFinalActual);
  const porcentajeAlivio = evaInicial > 0 ? Math.round((puntosReducidos / evaInicial) * 100) : 0;

  const getEvaColor = (val: number) => {
    if (val === 0) return "bg-emerald-500 text-white";
    if (val <= 3) return "bg-teal-500 text-white";
    if (val <= 6) return "bg-amber-500 text-white";
    if (val <= 8) return "bg-orange-500 text-white";
    return "bg-rose-600 text-white";
  };

  const getEvaLabel = (val: number) => {
    if (val === 0) return "Sin Dolor (Asintomático)";
    if (val <= 3) return "Dolor Leve (Tolerable)";
    if (val <= 6) return "Dolor Moderado (Molestia funcional)";
    if (val <= 8) return "Dolor Severo (Inhabilitante parcial)";
    return "Dolor Máximo (Inhabilitante total)";
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
      {/* Cabecera y Resumen Ejecutivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Analítica Biomecánica</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Escala Visual Analógica (0 - 10)
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
            Curva Gráfica de Dolor y Evolución Terapéutica
          </h3>
          <p className="text-xs text-slate-500 max-w-2xl">
            Visualización analítica del impacto del tratamiento a lo largo del tiempo, comparando el estado de ingreso pre y post sesión.
          </p>
        </div>

        {/* Métrica destacada de Alivio Global */}
        {totalRegistros > 0 && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 px-4 py-2.5 rounded-xl shrink-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Alivio Acumulado</span>
              <span className="text-sm sm:text-base font-black text-emerald-900">
                {porcentajeAlivio}% de Reducción ({puntosReducidos} pts)
              </span>
            </div>
          </div>
        )}
      </div>

      {totalRegistros === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs space-y-2">
          <Activity className="w-8 h-8 mx-auto text-slate-300" />
          <p className="font-semibold text-slate-600">Aún no hay evoluciones de dolor registradas</p>
          <p className="text-[11px] text-slate-400">
            Al registrar la primera atención asistida con escala EVA, el sistema generará automáticamente la curva analítica.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tarjetas KPI de Evaluación Inicial vs Actual */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Dolor de Ingreso */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dolor de Ingreso (Sesión 1)</span>
                <span className="text-base font-black text-slate-800 block">{evaInicial}/10</span>
                <span className="text-[10px] text-slate-500 font-medium">{getEvaLabel(evaInicial)}</span>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shadow-xs ${getEvaColor(evaInicial)}`}>
                {evaInicial}
              </div>
            </div>

            {/* 2. Dolor Actual */}
            <div className="bg-teal-50/60 border border-teal-200/80 rounded-xl p-3.5 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">Dolor Actual (Última Sesión)</span>
                <span className="text-base font-black text-teal-900 block">{evaFinalActual}/10</span>
                <span className="text-[10px] text-teal-700 font-medium">{getEvaLabel(evaFinalActual)}</span>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shadow-xs ${getEvaColor(evaFinalActual)}`}>
                {evaFinalActual}
              </div>
            </div>

            {/* 3. Dictamen Clínico de Alta */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estado Clínico</span>
                <span className="text-xs font-black text-slate-800 block">
                  {ultimoRegistro?.bloqueaAlta 
                    ? "Reevaluación en Curso" 
                    : evaFinalActual <= 2 
                    ? "Apto para Alta Médica" 
                    : "Fase de Fortalecimiento"}
                </span>
                <span className="text-[10px] text-slate-500">
                  {totalRegistros} sesiones evaluadas
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-teal-600 shadow-2xs">
                {evaFinalActual <= 2 ? (
                  <Award className="w-5 h-5 text-emerald-600" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-teal-600" />
                )}
              </div>
            </div>
          </div>

          {/* GRÁFICO VISUAL DE CURVA DE DOLOR (Interactivo y responsive) */}
          <div className="bg-slate-50/60 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Trayectoria de Dolor Pre y Post por Cada Sesión:</span>
              </span>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  Pre-Sesión
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  Post-Sesión
                </span>
              </div>
            </div>

            {/* Barras de comparación visual por sesión */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 pt-2">
              {historialEva.map((item, idx) => {
                const sesionNum = idx + 1;
                const delta = item.evaInicio - item.evaFin;
                const isSelected = selectedPoint === idx;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPoint(isSelected ? null : idx)}
                    className={`bg-white rounded-xl border p-2.5 text-center transition-all cursor-pointer select-none space-y-2 ${
                      isSelected
                        ? "border-teal-500 ring-2 ring-teal-500/20 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-extrabold text-slate-800">#{sesionNum}</span>
                      {delta > 0 && (
                        <span className="text-emerald-600 font-bold">-{delta}</span>
                      )}
                    </div>

                    {/* Gráfico de barras dual mini */}
                    <div className="h-16 flex items-end justify-center gap-1.5 py-1">
                      {/* Barra Pre */}
                      <div className="w-2.5 bg-slate-100 rounded-t-sm flex flex-col justify-end h-full">
                        <div
                          className="w-full bg-slate-400 rounded-t-sm transition-all duration-300"
                          style={{ height: `${Math.max(item.evaInicio * 10, 8)}%` }}
                          title={`Pre: ${item.evaInicio}/10`}
                        />
                      </div>
                      {/* Barra Post */}
                      <div className="w-2.5 bg-slate-100 rounded-t-sm flex flex-col justify-end h-full">
                        <div
                          className="w-full bg-teal-600 rounded-t-sm transition-all duration-300"
                          style={{ height: `${Math.max(item.evaFin * 10, 8)}%` }}
                          title={`Post: ${item.evaFin}/10`}
                        />
                      </div>
                    </div>

                    {/* Valores numéricos */}
                    <div className="text-[10px] font-mono font-bold text-slate-600 border-t border-slate-100 pt-1">
                      <span>{item.evaInicio}</span>
                      <span className="text-slate-300 mx-0.5">→</span>
                      <span className="text-teal-700">{item.evaFin}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detalle del punto seleccionado */}
            {selectedPoint !== null && (
              <div className="p-3 bg-white rounded-xl border border-teal-200 text-xs space-y-1 animate-in fade-in">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Sesión Clínica #{selectedPoint + 1}</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {formatDateTime(historialEva[selectedPoint].fecha)}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  <strong className="text-slate-700">Técnica:</strong> {historialEva[selectedPoint].tratamiento}
                </p>
                {historialEva[selectedPoint].notas && (
                  <p className="text-amber-800 bg-amber-50 p-1.5 rounded text-[10px]">
                    <strong>Nota:</strong> {historialEva[selectedPoint].notas}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Guía Rápida de la Escala EVA para el Paciente */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Referencia Oficial de Clasificación EVA:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] text-center">
              <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                0: Sin Dolor
              </div>
              <div className="p-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-bold">
                1 - 3: Dolor Leve
              </div>
              <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold">
                4 - 6: Moderado
              </div>
              <div className="p-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 font-bold">
                7 - 8: Severo
              </div>
              <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-bold">
                9 - 10: Máximo
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
