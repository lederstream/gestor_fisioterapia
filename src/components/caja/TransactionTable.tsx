"use client";

import { useState } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Search, CheckCircle2, Clock, Smartphone, CreditCard, DollarSign, FileSpreadsheet } from "lucide-react";

interface TransactionTableProps {
  transacciones: any[];
}

export function TransactionTable({ transacciones }: TransactionTableProps) {
  const [filterMethod, setFilterMethod] = useState<string>("TODOS");
  const [search, setSearch] = useState("");

  const filtered = transacciones.filter((t) => {
    if (filterMethod !== "TODOS" && t.metodoPago !== filterMethod) return false;
    if (search) {
      const pName = `${t.paciente?.nombres || ""} ${t.paciente?.apellidos || ""}`.toLowerCase();
      const op = (t.numeroOperacion || "").toLowerCase();
      const q = search.toLowerCase();
      return pName.includes(q) || op.includes(q);
    }
    return true;
  });

  const exportToCSV = () => {
    if (filtered.length === 0) return;

    const headers = ["Fecha y Hora", "Paciente", "DNI", "Servicio", "Metodo de Pago", "Nro Operacion", "Monto (S/.)", "Estado"];
    const rows = filtered.map((item) => [
      `"${formatDateTime(item.fechaPago).replace(/"/g, '""')}"`,
      `"${((item.paciente?.nombres || "") + " " + (item.paciente?.apellidos || "")).replace(/"/g, '""')}"`,
      `"${item.paciente?.dni || ""}"`,
      `"${(item.servicio?.nombre || "Tratamiento Fisioterapéutico").replace(/"/g, '""')}"`,
      `"${item.metodoPago}"`,
      `"${item.numeroOperacion || "N/A"}"`,
      `${item.monto}`,
      `"${item.estado}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `reporte_caja_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMethodBadge = (metodo: string) => {
    switch (metodo) {
      case "YAPE":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">YAPE</span>;
      case "PLIN":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">PLIN</span>;
      case "POS":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">POS</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">EFECTIVO</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Historial de Cobranzas y Transacciones</h3>
          <p className="text-[11px] text-slate-500">
            Registro auditable de pagos en soles peruanos (S/.)
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar paciente u operación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="TODOS">Todos los Métodos</option>
            <option value="YAPE">Yape</option>
            <option value="PLIN">Plin</option>
            <option value="POS">POS Tarjeta</option>
            <option value="EFECTIVO">Efectivo</option>
          </select>

          <button
            onClick={exportToCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition disabled:opacity-50"
            title="Exportar transacciones de caja a Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Fecha y Hora</th>
              <th className="py-2.5 px-3 font-semibold">Paciente</th>
              <th className="py-2.5 px-3 font-semibold">Tratamiento / Servicio</th>
              <th className="py-2.5 px-3 font-semibold">Método</th>
              <th className="py-2.5 px-3 font-semibold">N° Operación</th>
              <th className="py-2.5 px-3 font-semibold">Monto</th>
              <th className="py-2.5 px-3 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400">
                  No se encontraron pagos con los filtros aplicados.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {formatDateTime(item.fechaPago)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-800 block">
                      {item.paciente?.nombres} {item.paciente?.apellidos}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      DNI: {item.paciente?.dni}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {item.servicio?.nombre || "Tratamiento Fisioterapéutico"}
                  </td>
                  <td className="py-3 px-3">
                    {getMethodBadge(item.metodoPago)}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                    {item.numeroOperacion || "—"}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {formatCurrency(item.monto)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verificado
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
