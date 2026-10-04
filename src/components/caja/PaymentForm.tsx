"use client";

import { useState } from "react";
import { registrarPago } from "@/server/actions/pagos";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, Smartphone, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";

interface PaymentFormProps {
  paquetesConSaldo: any[];
  onPagoRegistrado?: () => void;
}

export function PaymentForm({ paquetesConSaldo, onPagoRegistrado }: PaymentFormProps) {
  const [paqueteId, setPaqueteId] = useState(paquetesConSaldo[0]?.id || "");
  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState<"EFECTIVO" | "YAPE" | "PLIN" | "POS">("YAPE");
  const [numeroOperacion, setNumeroOperacion] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedPaquete = paquetesConSaldo.find((p) => p.id === paqueteId);
  const saldoPendiente = selectedPaquete 
    ? selectedPaquete.montoTotal - selectedPaquete.montoPagado 
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensajeExito(null);
    setErrorMsg(null);

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setErrorMsg("Ingrese un monto válido mayor a 0.");
      setLoading(false);
      return;
    }

    try {
      const res = await registrarPago({
        paqueteId,
        monto: montoNum,
        metodoPago,
        numeroOperacion: numeroOperacion || undefined,
        estado: "VERIFICADO",
      });

      if (!res.success) {
        setErrorMsg(res.error || "Error al procesar el pago.");
        setLoading(false);
        return;
      }

      setMensajeExito(
        `Pago de ${formatCurrency(montoNum)} registrado con éxito (${metodoPago}). Estado actual: ${res.data?.paquete?.estadoPago}`
      );
      setMonto("");
      setNumeroOperacion("");
      if (onPagoRegistrado) onPagoRegistrado();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Registro Rápido de Pago</h3>
          <p className="text-[11px] text-slate-500">
            Abonos a paquetes de sesiones o pagos individuales (Efectivo, Yape, Plin, POS).
          </p>
        </div>
      </div>

      {mensajeExito && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {/* Selector de Paquete / Paciente con saldo */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Cuenta / Paquete con Saldo Pendiente
          </label>
          <select
            value={paqueteId}
            onChange={(e) => setPaqueteId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            required
          >
            {paquetesConSaldo.length === 0 ? (
              <option value="">No hay paquetes con saldo pendiente</option>
            ) : (
              paquetesConSaldo.map((paq) => (
                <option key={paq.id} value={paq.id}>
                  {paq.paciente?.nombres} {paq.paciente?.apellidos} — {paq.servicio?.nombre} (Debe: {formatCurrency(paq.montoTotal - paq.montoPagado)})
                </option>
              ))
            )}
          </select>
          {selectedPaquete && (
            <div className="mt-1.5 flex items-center justify-between text-[11px] bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
              <span className="text-slate-500">Monto Total: {formatCurrency(selectedPaquete.montoTotal)}</span>
              <span className="text-slate-500">Abonado: {formatCurrency(selectedPaquete.montoPagado)}</span>
              <span className="font-bold text-rose-600">Saldo: {formatCurrency(saldoPendiente)}</span>
            </div>
          )}
        </div>

        {/* Métodos de Pago */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            Método de Pago
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "YAPE", label: "Yape", color: "border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100" },
              { id: "PLIN", label: "Plin", color: "border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100" },
              { id: "POS", label: "POS Tarjeta", color: "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100" },
              { id: "EFECTIVO", label: "Efectivo", color: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setMetodoPago(method.id as any)}
                className={`py-2 px-1 text-center font-bold text-xs rounded-lg border transition ${
                  metodoPago === method.id
                    ? "ring-2 ring-teal-600 border-teal-600 shadow-xs"
                    : "opacity-75"
                } ${method.color}`}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        {/* Monto y Operación */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Monto a Cobrar (S/.)
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder={`Ej. ${saldoPendiente || 80}`}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              N° Operación / Ref
            </label>
            <input
              type="text"
              value={numeroOperacion}
              onChange={(e) => setNumeroOperacion(e.target.value)}
              placeholder="Ej: YAP-928120"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !paqueteId}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
        >
          {loading ? "Registrando Pago..." : `Cobrar ${monto ? formatCurrency(monto) : ""}`}
        </button>
      </form>
    </div>
  );
}
