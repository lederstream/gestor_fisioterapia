"use client";

import { useState } from "react";
import { SystemDiagnosticsData, obtenerDiagnosticoSistema } from "@/server/actions/soporte";
import { formatDateTime } from "@/lib/utils";
import { 
  Activity, 
  Server, 
  Database, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  FileText, 
  Users, 
  Calendar, 
  CreditCard, 
  Layers, 
  Download,
  Clock,
  HardDrive
} from "lucide-react";

interface SystemDiagnosticsClientProps {
  initialData: SystemDiagnosticsData;
}

export function SystemDiagnosticsClient({ initialData }: SystemDiagnosticsClientProps) {
  const [data, setData] = useState<SystemDiagnosticsData>(initialData);
  const [loading, setLoading] = useState(false);
  const [filterModulo, setFilterModulo] = useState<string>("TODOS");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const refreshed = await obtenerDiagnosticoSistema();
      setData(refreshed);
      setToast("Diagnóstico actualizado en tiempo real.");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = data.recentLogs.filter((log) => {
    if (filterModulo !== "TODOS" && log.modulo !== filterModulo) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchAccion = log.accion?.toLowerCase().includes(q);
      const matchUser = log.usuarioNombre?.toLowerCase().includes(q);
      const matchDet = log.detalles?.toLowerCase().includes(q);
      return matchAccion || matchUser || matchDet;
    }
    return true;
  });

  const handleExportJSON = () => {
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", jsonStr);
    dlAnchor.setAttribute("download", `diagnostico_sistema_${new Date().toISOString().split("T")[0]}.json`);
    dlAnchor.click();
    dlAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-900 text-amber-300 text-xs font-black mb-1.5 border border-amber-400/40">
            <Server className="w-3.5 h-3.5" /> SUPERADMIN CONSOLE
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Diagnóstico del Sistema & Auditoría Forense
          </h1>
          <p className="text-xs text-slate-500">
            Monitor de salud de la base de datos, latencia de consultas y bitácora de eventos del negocio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Escaneando..." : "Escanear"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards de Salud del Servidor */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Estado de Conexión
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${data.dbConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span className="text-sm font-black text-slate-900">
              {data.dbConnected ? "PostgreSQL Conectado" : "Almacén Local"}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block truncate">
            {data.dbType}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Latencia de Respuesta
          </span>
          <div className="text-xl font-black text-teal-800 flex items-center gap-1">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>{data.dbLatencyMs} ms</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            {data.dbLatencyMs < 100 ? "Excelente (&lt; 100ms)" : "Aceptable"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Salud Global
          </span>
          <div className="text-xl font-black text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>{data.systemStatus}</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Integridad ACID garantizada
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Entorno de Ejecución
          </span>
          <div className="text-base font-black text-slate-800 uppercase font-mono">
            Next.js AppRouter
          </div>
          <span className="text-[11px] text-slate-500 block">
            Node.js ({data.environment})
          </span>
        </div>
      </div>

      {/* Matriz de Tablas & Volúmenes de Datos */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-teal-600" />
          <span>Volumen de Registros en Base de Datos</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Pacientes</span>
            <span className="text-lg font-black text-slate-800 block">{data.counts.pacientes}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Citas</span>
            <span className="text-lg font-black text-slate-800 block">{data.counts.citas}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Salas</span>
            <span className="text-lg font-black text-slate-800 block">{data.counts.salas}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Servicios</span>
            <span className="text-lg font-black text-slate-800 block">{data.counts.servicios}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Usuarios</span>
            <span className="text-lg font-black text-slate-800 block">{data.counts.usuarios}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Bitácora</span>
            <span className="text-lg font-black text-slate-800 block">{data.counts.logs}</span>
          </div>
        </div>
      </div>

      {/* Bitácora Forense de Seguridad y Operaciones (Caja Negra) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Bitácora Forense de Auditoría (Caja Negra)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Registro inmutable de quién hizo qué, fecha exacta, dirección IP y rol de usuario.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterModulo}
              onChange={(e) => setFilterModulo(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="TODOS">Todos los Módulos</option>
              <option value="SEGURIDAD">Seguridad & Logins</option>
              <option value="CAJA">Caja & Arqueos</option>
              <option value="AGENDA">Agenda & Citas</option>
              <option value="CLINICA">Evolución & Pacientes</option>
              <option value="CONFIGURACION">Configuración</option>
            </select>
          </div>
        </div>

        {/* Input de Búsqueda Rápida */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por usuario, acción o detalle forense..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        {/* Tabla de Eventos */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Fecha / Hora</th>
                <th className="py-2.5 px-3">Usuario & Rol</th>
                <th className="py-2.5 px-3">Acción</th>
                <th className="py-2.5 px-3">Módulo</th>
                <th className="py-2.5 px-3">Detalle Forense</th>
                <th className="py-2.5 px-3 text-right">IP Origen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No se registran eventos con ese criterio.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="py-2.5 px-3 font-medium">
                      <span className="font-bold text-slate-900 block">{log.usuarioNombre}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">{log.usuarioRol}</span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800 font-mono text-[11px]">
                      {log.accion}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        log.modulo === "SEGURIDAD" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                        log.modulo === "CAJA" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                        log.modulo === "AGENDA" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {log.modulo}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600 max-w-md truncate">
                      {log.detalles}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[10px] text-slate-400">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

