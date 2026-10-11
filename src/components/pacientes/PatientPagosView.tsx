"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  CreditCard, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Eye, 
  ShieldCheck, 
  DollarSign, 
  Layers,
  Sparkles
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { PaymentVoucherModal } from "@/components/caja/PaymentVoucherModal";

interface PatientPagosViewProps {
  pagos: any[];
  paquetes: any[];
  paciente: any;
  servicios: any[];
}

export function PatientPagosView({
  pagos,
  paquetes,
  paciente,
  servicios,
}: PatientPagosViewProps) {
  const [selectedPago, setSelectedPago] = useState<any | null>(null);

  const paqueteActivo = paquetes[0];
  const servicioActivo = servicios.find((s) => s.id === paqueteActivo?.servicioId);

  const totalPagado = pagos.reduce((acc, p) => acc + (p.monto || 0), 0);
  const totalCosto = paqueteActivo ? paqueteActivo.montoTotal : totalPagado;
  const saldoPendiente = Math.max(0, totalCosto - totalPagado);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-blue-600" />
            Mis Pagos & Comprobantes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Revisa el historial de abonos de tus sesiones, estados de cuenta y descarga tus boletas de cobranza.
          </p>
        </div>

        <Link
          href="/reservas"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Adquirir Nuevo Paquete</span>
        </Link>
      </div>

      {/* Resumen Financiero del Paciente */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Abonado
          </span>
          <div className="text-2xl font-black text-emerald-700">
            {formatCurrency(totalPagado)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {pagos.length} comprobante(s) emitido(s)
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Saldo Pendiente
          </span>
          <div className={`text-2xl font-black ${saldoPendiente > 0 ? "text-amber-600" : "text-slate-800"}`}>
            {formatCurrency(saldoPendiente)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {saldoPendiente > 0 ? "A regularizar en recepción" : "Sin deuda pendiente"}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Estado de tu Paquete
          </span>
          <div className="text-base font-extrabold text-slate-800 pt-1">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                saldoPendiente === 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-amber-50 text-amber-700 border-amber-300"
              }`}
            >
              {saldoPendiente === 0 ? "100% CANCELADO" : "PAGO PARCIAL"}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block pt-1">
            {paqueteActivo ? `Plan de ${paqueteActivo.totalSesiones} sesiones` : "Atención por sesión"}
          </span>
        </div>
      </div>

      {/* Historial de Comprobantes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-600" />
            <h2 className="font-bold text-slate-800 text-sm">Historial de Recibos y Comprobantes</h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold">{pagos.length} Pagos Registrados</span>
        </div>

        {pagos.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {pagos.map((pago) => {
              const metodoColor =
                pago.metodoPago === "YAPE"
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : pago.metodoPago === "PLIN"
                  ? "bg-sky-50 text-sky-700 border-sky-200"
                  : pago.metodoPago === "POS"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200";

              return (
                <div
                  key={pago.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                      <Receipt className="w-5 h-5" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {formatCurrency(pago.monto)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${metodoColor}`}>
                          {pago.metodoPago}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Ref: {pago.numeroOperacion || "REC-001"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Abonado el {formatDateTime(pago.fechaPago || new Date().toISOString())}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verificado
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedPago(pago)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-teal-300 transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Boleta</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            No se han registrado pagos o comprobantes de cobranza todavía.
          </div>
        )}
      </div>

      {/* Modal de Comprobante Digital */}
      {selectedPago && (
        <PaymentVoucherModal
          isOpen={Boolean(selectedPago)}
          onClose={() => setSelectedPago(null)}
          pago={selectedPago}
          paciente={paciente}
          paquete={paqueteActivo}
          servicio={servicioActivo}
        />
      )}
    </div>
  );
}
