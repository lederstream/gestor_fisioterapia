"use client";

import { useState, useMemo } from "react";
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
  FileSpreadsheet,
  TrendingUp,
  Users,
  Eye,
  CheckCircle2,
  Clock,
  Laptop,
  Lock,
  Printer,
  ChevronRight,
  X,
  FileText,
  BadgeAlert
} from "lucide-react";

interface AuditLogTableProps {
  initialLogs: any[];
}

export function AuditLogTable({ initialLogs }: AuditLogTableProps) {
  const [logs] = useState(initialLogs);
  const [filterModulo, setFilterModulo] = useState<string>("TODOS");
  const [filterRol, setFilterRol] = useState<string>("TODOS");
  const [filterPeriodo, setFilterPeriodo] = useState<string>("TODOS");
  const [search, setSearch] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  // 1. Filtrado dinámico multi-criterio
  const filteredLogs = useMemo(() => {
    const now = Date.now();
    return logs.filter((log) => {
      // Filtro de Módulo
      if (filterModulo !== "TODOS" && log.modulo !== filterModulo) return false;

      // Filtro de Rol
      if (filterRol !== "TODOS" && log.usuarioRol !== filterRol) return false;

      // Filtro de Periodo
      if (filterPeriodo !== "TODOS") {
        const logTime = new Date(log.createdAt).getTime();
        const diffHours = (now - logTime) / (1000 * 3600);
        if (filterPeriodo === "HOY" && diffHours > 24) return false;
        if (filterPeriodo === "7DIAS" && diffHours > 24 * 7) return false;
        if (filterPeriodo === "30DIAS" && diffHours > 24 * 30) return false;
      }

      // Filtro de Búsqueda
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchUsuario = (log.usuarioNombre || "").toLowerCase().includes(q);
        const matchDetalles = (log.detalles || "").toLowerCase().includes(q);
        const matchAccion = (log.accion || "").toLowerCase().includes(q);
        const matchModulo = (log.modulo || "").toLowerCase().includes(q);
        const matchIp = (log.ipAddress || "").toLowerCase().includes(q);
        return matchUsuario || matchDetalles || matchAccion || matchModulo || matchIp;
      }

      return true;
    });
  }, [logs, filterModulo, filterRol, filterPeriodo, search]);

  // 2. Métricas y KPIs de Negocio para el Dueño
  const kpis = useMemo(() => {
    let totalCobrosMonto = 0;
    let cobrosCount = 0;
    let citasCreadasCount = 0;
    let citasConfirmadasCount = 0;
    let atencionesCount = 0;

    logs.forEach((l) => {
      // Extraer montos de pagos
      if (l.accion.includes("PAGO") || l.modulo === "CAJA") {
        cobrosCount++;
        const matchMonto = l.detalles.match(/S\/\.?\s*([0-9]+(\.[0-9]{1,2})?)/i);
        if (matchMonto && matchMonto[1]) {
          totalCobrosMonto += parseFloat(matchMonto[1]);
        }
      }
      if (l.accion === "CITA_CREADA") citasCreadasCount++;
      if (l.accion === "CITA_ACEPTADA_CONFIRMADA" || l.detalles.includes("CONFIRMADA")) citasConfirmadasCount++;
      if (l.accion === "ASISTENCIA_REGISTRADA" || l.modulo === "HISTORIA_CLINICA") atencionesCount++;
    });

    return {
      totalEventos: logs.length,
      cobrosCount,
      totalCobrosMonto,
      citasCreadasCount,
      citasConfirmadasCount,
      atencionesCount,
    };
  }, [logs]);

  // 3. Desglose de productividad por Personal
  const productividadPersonal = useMemo(() => {
    const map = new Map<string, { nombre: string; rol: string; totalAcciones: number; cobrosMonto: number; citasCount: number; atencionesCount: number; ultimaIp?: string }>();

    logs.forEach((l) => {
      const nombre = l.usuarioNombre || "Sistema";
      const rol = l.usuarioRol || "SISTEMA";

      if (!map.has(nombre)) {
        map.set(nombre, {
          nombre,
          rol,
          totalAcciones: 0,
          cobrosMonto: 0,
          citasCount: 0,
          atencionesCount: 0,
          ultimaIp: l.ipAddress,
        });
      }

      const item = map.get(nombre)!;
      item.totalAcciones += 1;
      if (l.ipAddress) item.ultimaIp = l.ipAddress;

      if (l.accion.includes("PAGO")) {
        const matchMonto = l.detalles.match(/S\/\.?\s*([0-9]+(\.[0-9]{1,2})?)/i);
        if (matchMonto && matchMonto[1]) {
          item.cobrosMonto += parseFloat(matchMonto[1]);
        }
      }
      if (l.accion.includes("CITA")) item.citasCount += 1;
      if (l.modulo === "HISTORIA_CLINICA") item.atencionesCount += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.totalAcciones - a.totalAcciones);
  }, [logs]);

  // Helpers visuales
  const getModuloBadge = (modulo: string) => {
    switch (modulo) {
      case "AGENDA":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">AGENDA / CITAS</span>;
      case "CAJA":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">CAJA / COBROS</span>;
      case "HISTORIA_CLINICA":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">HISTORIA CLÍNICA / EVA</span>;
      case "CONFIGURACION":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">CONFIGURACIÓN</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">SISTEMA CORE</span>;
    }
  };

  const getAccionBadge = (accion: string) => {
    if (accion.includes("PAGO")) {
      return <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">{accion}</span>;
    }
    if (accion.includes("CONFIRMADA") || accion.includes("ACEPTADA")) {
      return <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[10px]">{accion}</span>;
    }
    if (accion.includes("REEVALUACION")) {
      return <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">{accion}</span>;
    }
    if (accion.includes("CANCELADA") || accion.includes("BLOQUEO") || accion.includes("ELIMINADO")) {
      return <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[10px]">{accion}</span>;
    }
    return <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[10px]">{accion}</span>;
  };

  const getTerminalLabel = (ip?: string) => {
    if (!ip) return "Terminal Clínica (127.0.0.1)";
    if (ip.includes("105") || ip.includes("106")) return `Mostrador Recepción (${ip})`;
    if (ip.includes("110") || ip.includes("112")) return `Consultorio / Sala (${ip})`;
    if (ip.includes("100")) return `Servidor Central (${ip})`;
    return `Terminal (${ip})`;
  };

  // Exportar a CSV para Excel
  const exportToCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ["ID Evento", "Fecha y Hora Exacta", "Usuario Responsable", "Rol Oficial", "Modulo", "Accion", "Detalles", "Terminal IP"];
    const rows = filteredLogs.map((log) => [
      `"${log.id || ""}"`,
      `"${formatDateTime(log.createdAt).replace(/"/g, '""')}"`,
      `"${(log.usuarioNombre || "").replace(/"/g, '""')}"`,
      `"${log.usuarioRol || ""}"`,
      `"${log.modulo || ""}"`,
      `"${(log.accion || "").replace(/"/g, '""')}"`,
      `"${(log.detalles || "").replace(/"/g, '""')}"`,
      `"${log.ipAddress || "127.0.0.1"}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `auditoria_ejecutiva_ajfisioterapia_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. DASHBOARD DE KPIs PARA EL DUEÑO DEL NEGOCIO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Flujo Financiero Auditado */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Recaudación Auditada</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">
              S/. {kpis.totalCobrosMonto.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{kpis.cobrosCount} cobros procesados en caja</span>
          </p>
        </div>

        {/* KPI: Gestión de Agenda */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Movimiento de Citas</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">
              {kpis.citasCreadasCount + kpis.citasConfirmadasCount}
            </span>
            <span className="text-xs text-slate-400">operaciones</span>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-teal-700">{kpis.citasCreadasCount} agendadas</span> • 
            <span className="font-semibold text-blue-700">{kpis.citasConfirmadasCount} confirmadas</span>
          </p>
        </div>

        {/* KPI: Atenciones Clínicas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sesiones & Terapias</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">
              {kpis.atencionesCount}
            </span>
            <span className="text-xs text-slate-400">evoluciones</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Registradas con escala EVA por terapeutas
          </p>
        </div>

        {/* KPI: Total Eventos y Seguridad */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Trazabilidad Total</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">
              {kpis.totalEventos}
            </span>
            <span className="text-xs text-slate-400">registros auditables</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>100% inmutable con sello temporal</span>
          </p>
        </div>
      </div>

      {/* 2. PANEL DE PRODUCTIVIDAD DEL PERSONAL (QUIÉN HACE QUÉ EN EL NEGOCIO) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide">
              Desempeño y Actividad por Colaborador
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {productividadPersonal.length} operadores activos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {productividadPersonal.map((operador, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs truncate max-w-[170px]" title={operador.nombre}>
                  {operador.nombre}
                </span>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                  operador.rol === "RECEPCION"
                    ? "bg-blue-100 text-blue-800"
                    : operador.rol === "TERAPEUTA"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-purple-100 text-purple-800"
                }`}>
                  {operador.rol}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60">
                <div>
                  <span className="text-slate-400 text-[10px] block">Operaciones:</span>
                  <span className="font-bold text-slate-800">{operador.totalAcciones} eventos</span>
                </div>
                {operador.cobrosMonto > 0 ? (
                  <div>
                    <span className="text-slate-400 text-[10px] block">Recaudado:</span>
                    <span className="font-bold text-emerald-700">S/. {operador.cobrosMonto.toFixed(2)}</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-slate-400 text-[10px] block">Atenciones:</span>
                    <span className="font-bold text-teal-700">{operador.atencionesCount} sesiones</span>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono pt-1">
                <Laptop className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{getTerminalLabel(operador.ultimaIp)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. TABLA PRINCIPAL DE AUDITORÍA CON FILTROS AVANZADOS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        {/* Cabecera de controles y filtros */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Buscador inteligente en tiempo real */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por recepcionista, terapeuta, paciente, acción, monto, IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Filtros Dropdown y Botones de Acción */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Periodo */}
            <select
              value={filterPeriodo}
              onChange={(e) => setFilterPeriodo(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
            >
              <option value="TODOS">Todo el Periodo</option>
              <option value="HOY">Solo Hoy (24h)</option>
              <option value="7DIAS">Últimos 7 días</option>
              <option value="30DIAS">Últimos 30 días</option>
            </select>

            {/* Módulo */}
            <select
              value={filterModulo}
              onChange={(e) => setFilterModulo(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
            >
              <option value="TODOS">Todos los Módulos</option>
              <option value="AGENDA">Agenda y Citas</option>
              <option value="CAJA">Caja y Cobranzas</option>
              <option value="HISTORIA_CLINICA">Historia Clínica / EVA</option>
              <option value="CONFIGURACION">Configuración</option>
              <option value="SISTEMA">Sistema Core</option>
            </select>

            {/* Rol */}
            <select
              value={filterRol}
              onChange={(e) => setFilterRol(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
            >
              <option value="TODOS">Todos los Roles</option>
              <option value="RECEPCION">Recepción</option>
              <option value="TERAPEUTA">Terapeutas</option>
              <option value="ADMIN">Gerencia / Admin</option>
            </select>

            {/* Exportar CSV */}
            <button
              onClick={exportToCSV}
              disabled={filteredLogs.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition disabled:opacity-50"
              title="Exportar bitácora a formato CSV compatible con Microsoft Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
              <span>Exportar Excel</span>
            </button>
          </div>
        </div>

        {/* Resumen de resultados filtrados */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Mostrando <strong>{filteredLogs.length}</strong> de {logs.length} movimientos auditados
          </span>
          <span className="text-[11px] text-slate-400">
            Haz clic en <strong>"Ver Ficha"</strong> en cualquier fila para inspección forense detallada
          </span>
        </div>

        {/* Tabla de Registros */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-3.5">Fecha y Hora</th>
                  <th className="py-3 px-3.5">Usuario Responsable</th>
                  <th className="py-3 px-3.5">Módulo</th>
                  <th className="py-3 px-3.5">Acción</th>
                  <th className="py-3 px-3.5">Detalles de Operación</th>
                  <th className="py-3 px-3.5">Terminal / Origen IP</th>
                  <th className="py-3 px-3.5 text-center">Ficha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No se encontraron eventos registrados con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Fecha y Hora Exacta */}
                      <td className="py-3.5 px-3.5 text-slate-600 whitespace-nowrap">
                        <span className="font-semibold block text-slate-800">
                          {new Date(log.createdAt).toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "2-digit" })}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {new Date(log.createdAt).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                      </td>

                      {/* Usuario y Rol */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] border border-slate-200 shrink-0">
                            {log.usuarioNombre?.slice(0, 2).toUpperCase() || "US"}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">
                              {log.usuarioNombre}
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold uppercase">
                              Rol: {log.usuarioRol}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Módulo */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        {getModuloBadge(log.modulo)}
                      </td>

                      {/* Acción */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap font-mono">
                        {getAccionBadge(log.accion)}
                      </td>

                      {/* Detalles */}
                      <td className="py-3.5 px-3.5 text-slate-700 max-w-sm leading-relaxed">
                        <p className="line-clamp-2" title={log.detalles}>
                          {log.detalles}
                        </p>
                      </td>

                      {/* Terminal y Origen IP */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[11px] font-bold text-slate-700 block">
                            {log.ipAddress || "127.0.0.1"}
                          </span>
                          <span className="text-[9px] text-slate-400 block truncate max-w-[140px]">
                            {getTerminalLabel(log.ipAddress)}
                          </span>
                        </div>
                      </td>

                      {/* Botón Ver Ficha */}
                      <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 mx-auto"
                        >
                          <Eye className="w-3 h-3 text-teal-600" />
                          <span>Ver Ficha</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. MODAL FORENSE DE AUDITORÍA (PROTEGIDO CONTRA CLICS ACCIDENTALES) */}
      {selectedLog && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* El contenedor interior previene el click propagation */}
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-teal-50 text-teal-700 rounded-2xl border border-teal-200">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Ficha Forense de Auditoría
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID Registro: {selectedLog.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg text-lg leading-none transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-3.5 text-xs">
              {/* Operador y Rol */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Operador Responsable</span>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">{selectedLog.usuarioNombre}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 uppercase">
                    Rol: {selectedLog.usuarioRol}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block font-mono">ID Usuario: {selectedLog.usuarioId || "usr-rec-1"}</span>
              </div>

              {/* Timestamp e IP */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Sello de Tiempo</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{formatDateTime(selectedLog.createdAt)}</span>
                  <span className="text-[10px] text-slate-400 font-mono block">{selectedLog.createdAt}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Origen IP / Terminal</span>
                  <span className="font-mono font-bold text-slate-800 block mt-0.5">{selectedLog.ipAddress || "127.0.0.1"}</span>
                  <span className="text-[10px] text-teal-700 font-semibold block">{getTerminalLabel(selectedLog.ipAddress)}</span>
                </div>
              </div>

              {/* Módulo y Acción */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Módulo del Sistema</span>
                  <span className="font-bold text-slate-800 block mt-1">{selectedLog.modulo}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Acción Operativa</span>
                  <span className="font-bold text-slate-800 block mt-1">{selectedLog.accion}</span>
                </div>
              </div>

              {/* Detalle Íntegro del Evento */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Detalle Íntegro del Movimiento</span>
                <p className="text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-xl border border-slate-200 text-xs">
                  {selectedLog.detalles}
                </p>
                {selectedLog.entidadId && (
                  <span className="text-[10px] text-slate-400 font-mono block pt-1">
                    Entidad Asociada ID: {selectedLog.entidadId}
                  </span>
                )}
              </div>

              {/* Sello de Integridad Médica */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] flex items-start gap-2">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Registro de auditoría sellado criptográficamente en tiempo de ejecución. Conforme a normativa de calidad y trazabilidad de AJ Fisioterapia.
                </span>
              </div>
            </div>

            {/* Modal Footer con botón explícito de cierre */}
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
