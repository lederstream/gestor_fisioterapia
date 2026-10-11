"use client";

import { useRef, useState, useEffect } from "react";
import { formatDateTime, formatDate, formatCurrency } from "@/lib/utils";
import { 
  Printer, 
  X, 
  FileText, 
  Activity, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  User, 
  Phone, 
  FileSpreadsheet,
  Download
} from "lucide-react";

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  paciente: any;
  paquetes: any[];
  citas: any[];
  historialEva: any[];
}

export function ClinicalReportModal({
  isOpen,
  onClose,
  paciente,
  paquetes,
  citas,
  historialEva,
}: ClinicalReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [logoUrl, setLogoUrl] = useState<string>("/images/logo-clinica.svg");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("clinic_logo");
      if (stored) setLogoUrl(stored);
    }
  }, []);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Calcular estadísticas de la evolución
  const evasInicio = historialEva.map((h) => h.evaDolorInicio);
  const evasFin = historialEva.map((h) => h.evaDolorFin);
  
  const evaInicial = evasInicio.length > 0 ? evasInicio[0] : 0;
  const evaActual = evasFin.length > 0 ? evasFin[evasFin.length - 1] : 0;
  const reduccionDolor = evaInicial > 0 ? Math.round(((evaInicial - evaActual) / evaInicial) * 100) : 0;

  const paqueteActivo = paquetes.find((p) => p.sesionesConsumidas < p.totalSesiones) || paquetes[0];
  const citasAtendidas = citas.filter((c) => c.estado === "ATENDIDA");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-hidden print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden print:max-h-none print:overflow-visible print:border-none print:shadow-none print:max-w-none animate-in fade-in zoom-in-95 duration-150">
        
        {/* Barra superior de acciones (Sticky y siempre visible en pantalla) */}
        <div className="bg-slate-50 border-b border-slate-200 text-slate-800 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600 shrink-0" />
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs sm:text-sm tracking-wide text-slate-900">
                Expediente Clínico & Evolución
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                OFICIAL
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 rounded-xl transition text-slate-500 hover:text-slate-800 cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido del Documento Clínico Membretado Scroleable */}
        <div ref={reportRef} className="p-4 sm:p-8 md:p-10 space-y-6 sm:space-y-8 text-slate-800 overflow-y-auto flex-1 print:p-6 print:text-black print:overflow-visible">
          
          {/* Cabecera Membretada Oficial */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-teal-600 pb-5 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0 print:border-none">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo Empresa"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-teal-600 text-white font-black flex items-center justify-center text-sm">
                      AJ
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight print:text-black">
                    AJ FISIOTERAPIA & REHABILITACIÓN
                  </h1>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Centro Especializado en Terapia Física y Biomecánica Clínica
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Sede Central: Av. San Borja Sur 450, San Borja, Lima | Tel: (01) 475-2289
              </p>
            </div>

            <div className="text-left sm:text-right bg-slate-50 p-3 rounded-2xl border border-slate-200 w-full sm:w-auto print:bg-transparent print:border-none print:p-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                N° Expediente Único
              </span>
              <span className="text-sm sm:text-base font-mono font-black text-teal-700 block">
                HC-{paciente.dni}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 block">
                Emisión: {new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
          </div>

          {/* Información Personal y Filiación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 print:bg-transparent print:border print:border-slate-300">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Paciente</span>
              <span className="text-xs font-bold text-slate-900 block">
                {paciente.nombres} {paciente.apellidos}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Documento de Identidad</span>
              <span className="text-xs font-mono font-bold text-slate-800 block">
                DNI {paciente.dni}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Teléfono de Contacto</span>
              <span className="text-xs font-semibold text-slate-800 block">
                {paciente.telefono || "No especificado"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Contacto de Emergencia</span>
              <span className="text-xs font-semibold text-slate-800 block">
                {paciente.contactoEmergencia || "Registrado en ficha"}
              </span>
            </div>
          </div>

          {/* Resumen del Plan de Terapia y Paquete */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase text-teal-800 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <Activity className="w-4 h-4 text-teal-600" />
              Estado del Tratamiento y Sesiones Asistidas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Programa Contratado</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">
                  {paqueteActivo ? `Paquete de ${paqueteActivo.totalSesiones} Sesiones` : "Sesiones Individuales"}
                </span>
                <span className="text-[11px] text-teal-600 font-semibold block mt-1">
                  {citasAtendidas.length} sesiones completadas
                </span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Progreso de Asistencia</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-black text-slate-900">
                    {paqueteActivo ? paqueteActivo.sesionesConsumidas : citasAtendidas.length}
                  </span>
                  <span className="text-xs text-slate-400">
                    / {paqueteActivo ? paqueteActivo.totalSesiones : citasAtendidas.length}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full"
                    style={{
                      width: `${paqueteActivo ? Math.min(100, (paqueteActivo.sesionesConsumidas / paqueteActivo.totalSesiones) * 100) : 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Estado de Pagos</span>
                <span className={`text-xs font-bold inline-block px-2.5 py-1 rounded-full mt-1 ${
                  paqueteActivo?.estadoPago === "PAGADO"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {paqueteActivo?.estadoPago === "PAGADO" ? "COMPLETAMENTE CANCELADO" : "PAGO EN CUOTAS / PARCIAL"}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Abonado: {formatCurrency(paqueteActivo?.montoPagado || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Comparativa Escala EVA y Evolución del Dolor */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase text-teal-800 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <Activity className="w-4 h-4 text-teal-600" />
              Evolución del Dolor (Escala Visual Analógica - EVA)
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-rose-800 uppercase block">EVA de Ingreso</span>
                <span className="text-3xl font-black text-rose-700 block my-1">{evaInicial}/10</span>
                <span className="text-[11px] text-rose-600 font-medium">Dolor de inicio reportado</span>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">EVA Actual / Salida</span>
                <span className="text-3xl font-black text-emerald-700 block my-1">{evaActual}/10</span>
                <span className="text-[11px] text-emerald-600 font-medium">Nivel post-tratamiento</span>
              </div>

              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-teal-800 uppercase block">Tasa de Recuperación</span>
                <span className="text-3xl font-black text-teal-700 block my-1">
                  {reduccionDolor > 0 ? `+${reduccionDolor}%` : "En proceso"}
                </span>
                <span className="text-[11px] text-teal-600 font-medium">Alivio sintomatológico</span>
              </div>
            </div>
          </div>

          {/* Tabla de Evoluciones y Tratamientos Aplicados */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase text-teal-800 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
              Registro Detallado de Sesiones Realizadas
            </h2>
            <div className="border border-slate-200 rounded-2xl overflow-x-auto bg-white">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Sesión</th>
                    <th className="py-2.5 px-3">Fecha y Hora</th>
                    <th className="py-2.5 px-3">Especialista Tratante</th>
                    <th className="py-2.5 px-3 text-center">EVA Pre / Post</th>
                    <th className="py-2.5 px-3">Terapia Biomecánica / Técnicas Aplicadas</th>
                    <th className="py-2.5 px-3">Reevaluación / Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historialEva.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400">
                        No hay sesiones registradas aún en el sistema.
                      </td>
                    </tr>
                  ) : (
                    historialEva.map((eva, index) => (
                      <tr key={eva.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-bold text-teal-700">
                          #{index + 1}
                        </td>
                        <td className="py-2 px-3 text-slate-700 whitespace-nowrap">
                          <span className="font-semibold block">{formatDate(eva.fecha || eva.createdAt)}</span>
                          <span className="text-[10px] text-slate-500 block">
                            {new Date(eva.fecha || eva.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-800 whitespace-nowrap">
                          <span className="font-bold block text-[11px]">{eva.terapeutaNombre || "Lic. Fisioterapia"}</span>
                          <span className="text-[10px] text-slate-500 block">{eva.terapeutaEspecialidad || "AJ Fisioterapia"}</span>
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-100 text-slate-800">
                            {eva.evaDolorInicio} → {eva.evaDolorFin}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-700 text-[11px]">
                          {eva.tratamientoAplicado}
                        </td>
                        <td className="py-2 px-3 text-slate-600 text-[11px]">
                          {eva.notasReevaluacion || "Evolución favorable"}
                          {eva.bloqueaAlta && (
                            <span className="ml-1 text-rose-600 font-bold block text-[10px]">
                              * Requiere Reevaluación Biomecánica
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dictamen Fisioterapéutico y Firma */}
          <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Dictamen Fisioterapéutico
              </span>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {evaActual <= 2 && reduccionDolor >= 70
                  ? "Paciente presenta remisión sintomatológica notable, arcos articulares funcionales recuperados y fuerza muscular Daniels > 4/5. Se acredita proceso de Alta Fisioterapéutica con plan domiciliario postural."
                  : "Paciente en etapa activa de tratamiento. Se recomienda continuar con las sesiones de descontractura, electroterapia y fortalecimiento muscular progresivo según protocolo."}
              </p>
            </div>

            <div className="text-center space-y-1">
              <div className="w-56 mx-auto border-b-2 border-slate-400 pb-1 mb-2">
                <span className="font-serif italic text-slate-400 block text-xs">
                  Firma y Sello Profesional
                </span>
              </div>
              <span className="text-xs font-bold text-slate-900 block">
                Lic. Fisioterapia y Rehabilitación
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">
                Colegio de Tecnólogos Médicos del Perú (CTMP)
              </span>
              <span className="text-[10px] text-slate-400 block">
                AJ Fisioterapia — Sede San Borja
              </span>
            </div>
          </div>

          {/* Pie de Página Institucional */}
          <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">
            Documento emitido válidamente por el sistema transaccional Gestor Fisioterapia (AJ Fisioterapia San Borja). Confidencialidad bajo ley general de salud.
          </div>
        </div>

        {/* Barra inferior móvil rápida (Oculta al imprimir) */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex sm:hidden items-center justify-between shrink-0 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
