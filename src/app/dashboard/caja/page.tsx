import { obtenerReporteCaja } from "@/server/actions/pagos";
import { PaymentForm } from "@/components/caja/PaymentForm";
import { TransactionTable } from "@/components/caja/TransactionTable";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, Smartphone, DollarSign, AlertCircle, ArrowDownRight, TrendingUp } from "lucide-react";

export default async function CajaPage() {
  const reporte = await obtenerReporteCaja();

  return (
    <div className="space-y-6">
      {/* Caja Header & Metrics */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-800">
            Control de Caja y Cobranzas
          </h1>
          <p className="text-xs text-slate-500">
            Gestión de pagos fraccionados para paquetes de 10 y 20 sesiones (Efectivo, Yape, Plin, POS).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-emerald-800 text-xs font-bold">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Total Recaudado: {formatCurrency(reporte.totalRecaudado)}</span>
        </div>
      </div>

      {/* KPI Cards por método de pago */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Yape */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-purple-700 uppercase">Yape</span>
            <Smartphone className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-lg font-extrabold text-slate-800">
            {formatCurrency(reporte.totalYape)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Billetera móvil BCP</span>
        </div>

        {/* Plin */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-sky-700 uppercase">Plin</span>
            <Smartphone className="w-4 h-4 text-sky-600" />
          </div>
          <span className="text-lg font-extrabold text-slate-800">
            {formatCurrency(reporte.totalPlin)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Interbank / BBVA / Scotiabank</span>
        </div>

        {/* POS */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-blue-700 uppercase">POS Tarjetas</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-lg font-extrabold text-slate-800">
            {formatCurrency(reporte.totalPos)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Débito y Crédito Visa/MC</span>
        </div>

        {/* Efectivo */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-emerald-700 uppercase">Efectivo</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-lg font-extrabold text-slate-800">
            {formatCurrency(reporte.totalEfectivo)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Caja física recepción</span>
        </div>
      </div>

      {/* Main Grid: Formulario de Cobro y Tabla */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PaymentForm paquetesConSaldo={reporte.paquetesConSaldo} />
        </div>

        <div className="lg:col-span-2">
          <TransactionTable transacciones={reporte.transacciones} />
        </div>
      </div>
    </div>
  );
}
