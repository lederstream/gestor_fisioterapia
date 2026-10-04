"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { PaymentForm } from "@/components/caja/PaymentForm";
import { TransactionTable } from "@/components/caja/TransactionTable";
import { CashArqueoModal } from "@/components/caja/CashArqueoModal";
import { PaymentVoucherModal } from "@/components/caja/PaymentVoucherModal";
import { 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  TrendingUp, 
  Lock, 
  Printer, 
  Share2, 
  FileText 
} from "lucide-react";

interface CajaClientProps {
  reporte: {
    totalRecaudado: number;
    totalEfectivo: number;
    totalYape: number;
    totalPlin: number;
    totalPos: number;
    deudaPendiente: number;
    transacciones: any[];
    paquetesConSaldo: any[];
  };
}

export function CajaClient({ reporte }: CajaClientProps) {
  const [isArqueoOpen, setIsArqueoOpen] = useState(false);
  const [selectedVoucherPago, setSelectedVoucherPago] = useState<any | null>(null);

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

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsArqueoOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <Lock className="w-4 h-4 text-teal-400" />
            <span>Arqueo y Cierre de Turno</span>
          </button>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-emerald-800 text-xs font-bold">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Total Turno: {formatCurrency(reporte.totalRecaudado)}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards por método de pago */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Yape */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
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
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-sky-700 uppercase">Plin</span>
            <Smartphone className="w-4 h-4 text-sky-600" />
          </div>
          <span className="text-lg font-extrabold text-slate-800">
            {formatCurrency(reporte.totalPlin)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Interbank / BBVA / Scotia</span>
        </div>

        {/* POS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-blue-700 uppercase">POS Tarjetas</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-lg font-extrabold text-slate-800">
            {formatCurrency(reporte.totalPos)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Débito y Crédito</span>
        </div>

        {/* Efectivo */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-emerald-700 uppercase">Efectivo</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-lg font-extrabold text-slate-800">
            {formatCurrency(reporte.totalEfectivo)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Gaveta física recepción</span>
        </div>
      </div>

      {/* Main Grid: Formulario de Cobro y Tabla */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PaymentForm
            paquetesConSaldo={reporte.paquetesConSaldo}
            onPagoRegistrado={() => {
              // Si hay última transacción, abrir modal de comprobante
              if (reporte.transacciones.length > 0) {
                setSelectedVoucherPago(reporte.transacciones[0]);
              }
            }}
          />
        </div>

        <div className="lg:col-span-2">
          <TransactionTable transacciones={reporte.transacciones} />
        </div>
      </div>

      {/* Modal Arqueo */}
      {isArqueoOpen && (
        <CashArqueoModal
          isOpen={isArqueoOpen}
          onClose={() => setIsArqueoOpen(false)}
          reporte={reporte}
        />
      )}

      {/* Modal Comprobante / Ticket 80mm */}
      {selectedVoucherPago && (
        <PaymentVoucherModal
          isOpen={Boolean(selectedVoucherPago)}
          onClose={() => setSelectedVoucherPago(null)}
          pago={selectedVoucherPago}
          paciente={selectedVoucherPago.paciente}
          paquete={selectedVoucherPago.paquete}
          servicio={selectedVoucherPago.servicio}
        />
      )}
    </div>
  );
}
