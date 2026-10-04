"use client";

import { useState } from "react";
import { asignarPaqueteTratamiento } from "@/server/actions/pacientes";
import { formatCurrency } from "@/lib/utils";
import { Layers, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

interface NewPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pacienteId: string;
  pacienteNombre: string;
  servicios: any[];
  onPackageAssigned: () => void;
}

export function NewPackageModal({
  isOpen,
  onClose,
  pacienteId,
  pacienteNombre,
  servicios,
  onPackageAssigned,
}: NewPackageModalProps) {
  const [servicioId, setServicioId] = useState(servicios[0]?.id || "");
  const [totalSesiones, setTotalSesiones] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedServicio = servicios.find((s) => s.id === servicioId) || servicios[0];

  // Cálculo del monto total según sesiones con descuento institucional
  const calcularMonto = () => {
    const base = selectedServicio ? selectedServicio.precioBase : 85;
    if (totalSesiones === 1) return base;
    if (totalSesiones === 10) return Number((base * 10 * 0.85).toFixed(2)); // 15% desc
    if (totalSesiones === 20) return Number((base * 20 * 0.75).toFixed(2)); // 25% desc
    return base * totalSesiones;
  };

  const montoTotal = calcularMonto();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await asignarPaqueteTratamiento({
        pacienteId,
        servicioId,
        totalSesiones,
        montoTotal,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Error al asignar paquete.");
        setLoading(false);
        return;
      }

      onPackageAssigned();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Contratar Nuevo Paquete Clínico
              </h3>
              <p className="text-[11px] text-slate-500">{pacienteNombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Servicio Clínico Requerido
            </label>
            <select
              value={servicioId}
              onChange={(e) => setServicioId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            >
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({formatCurrency(s.precioBase)}/sesión)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-2">
              Modalidad de Tratamiento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { n: 1, label: "1 Sesión", desc: "Tarifa regular" },
                { n: 10, label: "10 Sesiones", desc: "15% descuento" },
                { n: 20, label: "20 Sesiones", desc: "25% descuento" },
              ].map((opt) => (
                <button
                  key={opt.n}
                  type="button"
                  onClick={() => setTotalSesiones(opt.n)}
                  className={`p-3 text-center rounded-2xl border transition ${
                    totalSesiones === opt.n
                      ? "border-teal-600 bg-teal-50 ring-2 ring-teal-500/20 text-teal-900 font-bold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600 font-medium"
                  }`}
                >
                  <span className="block text-xs">{opt.label}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total a Pagar / Facturar</span>
              <span className="text-lg font-extrabold text-slate-900">{formatCurrency(montoTotal)}</span>
            </div>
            <span className="text-[11px] text-emerald-700 bg-emerald-100/70 font-semibold px-2.5 py-1 rounded-lg">
              Soporta pagos fraccionados
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/30 transition disabled:opacity-50"
            >
              {loading ? "Creando Paquete..." : "Confirmar y Asignar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
