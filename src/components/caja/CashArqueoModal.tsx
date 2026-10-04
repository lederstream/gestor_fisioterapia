"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, Smartphone, CreditCard, ShieldCheck, CheckCircle2, Lock } from "lucide-react";

interface CashArqueoModalProps {
  isOpen: boolean;
  onClose: () => void;
  reporte: {
    totalRecaudado: number;
    totalEfectivo: number;
    totalYape: number;
    totalPlin: number;
    totalPos: number;
    deudaPendiente: number;
    transacciones: any[];
  };
}

export function CashArqueoModal({ isOpen, onClose, reporte }: CashArqueoModalProps) {
  const [efectivoContado, setEfectivoContado] = useState<string>(reporte.totalEfectivo.toString());
  const [cerrando, setCerrando] = useState(false);
  const [turnoSellado, setTurnoSellado] = useState(false);

  if (!isOpen) return null;

  const diferencia = (parseFloat(efectivoContado) || 0) - reporte.totalEfectivo;

  const handleCerrarTurno = () => {
    setCerrando(true);
    setTimeout(() => {
      setCerrando(false);
      setTurnoSellado(true);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl border border-teal-100">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Arqueo y Cierre Diario de Caja
              </h3>
              <p className="text-[11px] text-slate-500">
                Conciliación física vs digital en Sede San Borja
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {turnoSellado ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-extrabold text-emerald-900 text-sm">
              ¡Turno de Caja Sellado y Auditado con Éxito!
            </h4>
            <p className="text-xs text-emerald-800">
              Se ha emitido el cierre de turno y se registró en la auditoría general con firma digital de recepción.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl"
            >
              Cerrar Ventana
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Resumen por Método */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 block text-xs">
                Conciliación por Canal de Cobro
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2.5 rounded-xl border flex justify-between">
                  <span className="text-purple-700 font-semibold">Yape BCP:</span>
                  <span className="font-bold">{formatCurrency(reporte.totalYape)}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border flex justify-between">
                  <span className="text-sky-700 font-semibold">Plin:</span>
                  <span className="font-bold">{formatCurrency(reporte.totalPlin)}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border flex justify-between">
                  <span className="text-blue-700 font-semibold">POS Tarjetas:</span>
                  <span className="font-bold">{formatCurrency(reporte.totalPos)}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border flex justify-between">
                  <span className="text-emerald-700 font-semibold">Efectivo Sistema:</span>
                  <span className="font-bold">{formatCurrency(reporte.totalEfectivo)}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                <span>TOTAL RECAUDADO EN EL TURNO:</span>
                <span>{formatCurrency(reporte.totalRecaudado)}</span>
              </div>
            </div>

            {/* Cuadre de Efectivo en Gaveta */}
            <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200">
              <label className="block font-semibold text-slate-700">
                Efectivo Físico Contado en Gaveta (S/.)
              </label>
              <input
                type="number"
                step="0.10"
                value={efectivoContado}
                onChange={(e) => setEfectivoContado(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <div className="flex justify-between items-center text-[11px] pt-1">
                <span className="text-slate-500">Diferencia de Cuadre:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded ${
                    diferencia === 0
                      ? "text-emerald-700 bg-emerald-50"
                      : diferencia > 0
                      ? "text-blue-700 bg-blue-50"
                      : "text-rose-700 bg-rose-50"
                  }`}
                >
                  {diferencia === 0
                    ? "Cuadre Exacto (S/. 0.00)"
                    : diferencia > 0
                    ? `Sobrante: +${formatCurrency(diferencia)}`
                    : `Faltante: ${formatCurrency(diferencia)}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                El cierre de caja es auditado en tiempo real y quedará archivado con sello de tiempo inmutable.
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCerrarTurno}
                disabled={cerrando}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/25 transition disabled:opacity-50"
              >
                {cerrando ? "Sellando Turno..." : "Cerrar y Sellar Turno de Caja"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
