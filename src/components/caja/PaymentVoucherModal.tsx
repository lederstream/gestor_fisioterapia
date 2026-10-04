"use client";

import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Printer, Share2, CheckCircle2, ShieldCheck } from "lucide-react";

interface PaymentVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  pago: any;
  paciente: any;
  paquete?: any;
  servicio?: any;
}

export function PaymentVoucherModal({
  isOpen,
  onClose,
  pago,
  paciente,
  paquete,
  servicio,
}: PaymentVoucherModalProps) {
  if (!isOpen || !pago) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const telefono = paciente?.telefono || "";
    const texto = encodeURIComponent(
      `*AJ FISIOTERAPIA (San Borja)* - Comprobante de Cobranza\n\nEstimado(a) ${paciente?.nombres} ${paciente?.apellidos}:\nHemos registrado su pago de *${formatCurrency(pago.monto)}* (${pago.metodoPago}, Ref: ${pago.numeroOperacion}).\nServicio: ${servicio?.nombre || "Fisioterapia"}\n¡Gracias por su preferencia!`
    );
    window.open(`https://wa.me/51${telefono}?text=${texto}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-slate-800 font-mono text-xs">
        {/* Ticket Header Formato 80mm */}
        <div className="text-center pb-4 border-b border-dashed border-slate-300 space-y-1">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-2 font-sans shadow-md shadow-teal-600/20">
            AJ
          </div>
          <h2 className="font-extrabold text-sm uppercase tracking-wider font-sans">
            AJ FISIOTERAPIA S.A.C.
          </h2>
          <p className="text-[10px] text-slate-500">RUC: 20608912345</p>
          <p className="text-[10px] text-slate-500">Av. Guardia Civil 520, San Borja, Lima</p>
          <p className="text-[10px] text-slate-500">Telf: (01) 475-2010 • WhatsApp: 987 654 321</p>
        </div>

        {/* Voucher Info */}
        <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">N° Comprobante:</span>
            <span className="font-bold">{pago.numeroOperacion || "REC-001"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Fecha / Hora:</span>
            <span>{formatDateTime(pago.fechaPago || new Date().toISOString())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Paciente:</span>
            <span className="font-bold truncate max-w-[170px]">
              {paciente ? `${paciente.nombres} ${paciente.apellidos}` : "Paciente"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">DNI:</span>
            <span>{paciente?.dni || "—"}</span>
          </div>
        </div>

        {/* Detalle del Cobro */}
        <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
          <div className="flex justify-between font-bold">
            <span>Concepto:</span>
            <span className="text-right truncate max-w-[160px]">
              {servicio?.nombre || "Tratamiento Fisioterapéutico"}
            </span>
          </div>
          {paquete && (
            <div className="flex justify-between text-slate-500">
              <span>Sesiones Consumidas:</span>
              <span>{paquete.sesionesConsumidas} de {paquete.totalSesiones}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-500">
            <span>Método de Pago:</span>
            <span className="font-bold text-slate-700">{pago.metodoPago}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Estado:</span>
            <span className="text-emerald-700 font-bold">VERIFICADO</span>
          </div>
        </div>

        {/* Montos Totales */}
        <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-xs">
          <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1">
            <span>MONTO COBRADO:</span>
            <span>{formatCurrency(pago.monto)}</span>
          </div>
          {paquete && (
            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
              <span>Saldo Restante del Paquete:</span>
              <span className="font-bold text-rose-600">
                {formatCurrency(Math.max(0, paquete.montoTotal - paquete.montoPagado))}
              </span>
            </div>
          )}
        </div>

        <div className="text-center py-2 text-[9px] text-slate-400">
          ¡Gracias por confiar en AJ Fisioterapia!
          <br />Exclusivo para fines clínicos y control de caja interno.
        </div>

        {/* Botones de Acción */}
        <div className="pt-3 flex flex-col gap-2 font-sans">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="py-2.5 px-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={handleWhatsApp}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            Cerrar Comprobante
          </button>
        </div>
      </div>
    </div>
  );
}
