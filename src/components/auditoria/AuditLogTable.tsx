"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/utils";
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Calendar, 
  CreditCard, 
  Activity, 
  Settings, 
  Sliders, 
  User, 
  Terminal,
  FileSpreadsheet
} from "lucide-react";

interface AuditLogTableProps {
  initialLogs: any[];
}

export function AuditLogTable({ initialLogs }: AuditLogTableProps) {
  const [logs, setLogs] = useState(initialLogs);
  const [filterModulo, setFilterModulo] = useState("TODOS");
  const [filterAccion, setFilterAccion] = useState("TODOS");
  const [search, setSearch] = useState("");

  const filteredLogs = logs.filter((log) => {
    if (filterModulo !== "TODOS" && log.modulo !== filterModulo) return false;
    if (filterAccion !== "TODOS" && log.accion !== filterAccion) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchUsuario = log.usuarioNombre.toLowerCase().includes(q);
      const matchDetalles = log.detalles.toLowerCase().includes(q);
      const matchAccion = log.accion.toLowerCase().includes(q);
      return matchUsuario || matchDetalles || matchAccion;
    }
    return true;
  });

  const getModuloBadge = (modulo: string) => {
    switch (modulo) {
      case "AGENDA":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">AGENDA</span>;
      case "CAJA":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">CAJA</span>;
      case "HISTORIA_CLINICA":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">HISTORIA CLÍNICA</span>;
      case "CONFIGURACION":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">CONFIGURACIÓN</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">SISTEMA</span>;
    }
  };

  const getAccionBadge = (accion: string) => {
    if (accion.includes("PAGO")) {
      return <span className="font-bold text-emerald-700">{accion}</span>;
    }
    if (accion.includes("REEVALUACION")) {
      return <span className="font-bold text-amber-700">{accion}</span>;
    }
    if (accion.includes("CANCELADA") || accion.includes("BLOQUEO")) {
      return <span className="font-bold text-rose-600">{accion}</span>;
    }
    return <span className="font-bold text-slate-700">{accion}</span>;
  };

  const exportToCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ["Fecha y Hora", "Usuario", "Rol", "Modulo", "Accion", "Detalles", "IP"];
    const rows = filteredLogs.map((log) => [
      `"${formatDateTime(log.createdAt).replace(/"/g, '""')}"`,
      `"${log.usuarioNombre.replace(/"/g, '""')}"`,
      `"${log.usuarioRol}"`,
      `"${log.modulo}"`,
      `"${log.accion.replace(/"/g, '""')}"`,
      `"${log.detalles.replace(/"/g, '""')}"`,
      `"${log.ipAddress || "127.0.0.1"}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `auditoria_clinica_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por usuario, acción o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterModulo}
            onChange={(e) => setFilterModulo(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="TODOS">Todos los Módulos</option>
            <option value="AGENDA">Módulo Agenda</option>
            <option value="CAJA">Módulo Caja</option>
            <option value="HISTORIA_CLINICA">Historia Clínica / EVA</option>
            <option value="CONFIGURACION">Configuración</option>
            <option value="SISTEMA">Sistema</option>
          </select>

          <button
            onClick={exportToCSV}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition disabled:opacity-50"
            title="Exportar registros filtrados a formato CSV compatible con Microsoft Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
            <span>Exportar CSV</span>
          </button>

          <span className="text-xs text-slate-400 font-semibold px-2">
            {filteredLogs.length} eventos registrados
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Fecha y Hora</th>
              <th className="py-2.5 px-3 font-semibold">Usuario Responsable</th>
              <th className="py-2.5 px-3 font-semibold">Módulo</th>
              <th className="py-2.5 px-3 font-semibold">Acción</th>
              <th className="py-2.5 px-3 font-semibold">Detalles de Trazabilidad</th>
              <th className="py-2.5 px-3 font-semibold">IP Origen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No se encontraron eventos con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-slate-500 font-medium whitespace-nowrap">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-800 block">
                      {log.usuarioNombre}
                    </span>
                    <span className="text-[10px] text-teal-600 font-semibold uppercase">
                      Rol: {log.usuarioRol}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {getModuloBadge(log.modulo)}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px]">
                    {getAccionBadge(log.accion)}
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-md leading-relaxed">
                    {log.detalles}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {log.ipAddress || "127.0.0.1"}
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
