"use client";

import { useState } from "react";
import { 
  Clock, 
  Calendar, 
  Copy, 
  Coffee, 
  CheckCircle2, 
  Save, 
  Sparkles,
  AlertCircle
} from "lucide-react";
import { Switch } from "./Switch";
import { HorariosSemanaConfig, DiaSemanaClave, HorarioDiaConfig } from "@/lib/store";

interface HorariosManagerProps {
  initialHorarios?: HorariosSemanaConfig;
  initialIntervalo?: number;
  onSave: (horarios: HorariosSemanaConfig, intervalo: number) => Promise<boolean>;
}

const DIAS_INFO: { clave: DiaSemanaClave; label: string; corto: string }[] = [
  { clave: "lunes", label: "Lunes", corto: "LUN" },
  { clave: "martes", label: "Martes", corto: "MAR" },
  { clave: "miercoles", label: "Miércoles", corto: "MIÉ" },
  { clave: "jueves", label: "Jueves", corto: "JUE" },
  { clave: "viernes", label: "Viernes", corto: "VIE" },
  { clave: "sabado", label: "Sábado", corto: "SÁB" },
  { clave: "domingo", label: "Domingo", corto: "DOM" },
];

const DEFAULT_HORARIOS: HorariosSemanaConfig = {
  lunes: { activo: true, apertura: "08:00", cierre: "20:00", tienePausa: true, pausaInicio: "13:00", pausaFin: "14:00" },
  martes: { activo: true, apertura: "08:00", cierre: "20:00", tienePausa: true, pausaInicio: "13:00", pausaFin: "14:00" },
  miercoles: { activo: true, apertura: "08:00", cierre: "20:00", tienePausa: true, pausaInicio: "13:00", pausaFin: "14:00" },
  jueves: { activo: true, apertura: "08:00", cierre: "20:00", tienePausa: true, pausaInicio: "13:00", pausaFin: "14:00" },
  viernes: { activo: true, apertura: "08:00", cierre: "20:00", tienePausa: true, pausaInicio: "13:00", pausaFin: "14:00" },
  sabado: { activo: true, apertura: "08:00", cierre: "14:00", tienePausa: false, pausaInicio: "12:00", pausaFin: "13:00" },
  domingo: { activo: false, apertura: "09:00", cierre: "13:00", tienePausa: false, pausaInicio: "12:00", pausaFin: "13:00" },
};

export function HorariosManager({
  initialHorarios,
  initialIntervalo = 45,
  onSave,
}: HorariosManagerProps) {
  const [horarios, setHorarios] = useState<HorariosSemanaConfig>(
    initialHorarios || DEFAULT_HORARIOS
  );
  const [intervalo, setIntervalo] = useState<number>(initialIntervalo || 45);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modificar campo de un día
  const updateDia = (dia: DiaSemanaClave, field: keyof HorarioDiaConfig, value: any) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [field]: value,
      },
    }));
  };

  // Copiar horario del Lunes a Martes-Viernes
  const handleCopiarLunesASemana = () => {
    const lunesConfig = horarios.lunes;
    setHorarios((prev) => ({
      ...prev,
      martes: { ...lunesConfig },
      miercoles: { ...lunesConfig },
      jueves: { ...lunesConfig },
      viernes: { ...lunesConfig },
    }));
    setFeedback("Horario de Lunes replicado a Martes, Miércoles, Jueves y Viernes.");
    setTimeout(() => setFeedback(null), 3500);
  };

  // Calcular horas netas de un día
  const calcularHorasNetas = (config: HorarioDiaConfig) => {
    if (!config.activo) return 0;
    const [hIni, mIni] = config.apertura.split(":").map(Number);
    const [hFin, mFin] = config.cierre.split(":").map(Number);
    let mins = (hFin * 60 + mFin) - (hIni * 60 + mIni);

    if (config.tienePausa && config.pausaInicio && config.pausaFin) {
      const [hPIni, mPIni] = config.pausaInicio.split(":").map(Number);
      const [hPFin, mPFin] = config.pausaFin.split(":").map(Number);
      const pausaMins = (hPFin * 60 + mPFin) - (hPIni * 60 + mPIni);
      if (pausaMins > 0) mins -= pausaMins;
    }
    return Math.max(0, mins / 60);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const ok = await onSave(horarios, intervalo);
    setSaving(false);
    if (ok) {
      setFeedback("Horarios de atención actualizados con éxito.");
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const diasAbiertos = Object.values(horarios).filter((d) => d.activo).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resumen Superior & Acciones Rápidas */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-800 text-sm">
              Horarios Semanales de Atención
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              {diasAbiertos} días operativos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Define la disponibilidad de la sede, recesos de almuerzo y el intervalo de citas para la agenda y reservas en línea.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopiarLunesASemana}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
            title="Aplica la apertura, cierre y pausa del lunes al resto de días hábiles"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copiar Lunes a Viernes</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Guardando..." : "Guardar Horarios"}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Intervalo de Turno / Slot de Agenda */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-xs">Duración Estándar de Cita / Turno</h4>
            <p className="text-[11px] text-slate-500">
              Define el tamaño de cada ranura horaria en la agenda clínica
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[
            { val: 30, label: "30 min" },
            { val: 45, label: "45 min (Recomendado)" },
            { val: 60, label: "60 min" },
          ].map((op) => (
            <button
              key={op.val}
              type="button"
              onClick={() => setIntervalo(op.val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                intervalo === op.val
                  ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Interactivo Día por Día */}
      <div className="space-y-3">
        {DIAS_INFO.map(({ clave, label, corto }) => {
          const diaConfig = horarios[clave];
          const horasNetas = calcularHorasNetas(diaConfig);

          return (
            <div
              key={clave}
              className={`p-4 rounded-2xl border transition-all ${
                diaConfig.activo
                  ? "bg-white border-slate-200/90 shadow-2xs"
                  : "bg-slate-50/70 border-slate-200 text-slate-400"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Cabecera del Día: Switch de Apertura */}
                <div className="flex items-center justify-between lg:justify-start gap-4 min-w-[200px]">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-slate-100 font-extrabold text-xs text-slate-700 flex items-center justify-center border border-slate-200 shrink-0">
                      {corto}
                    </span>
                    <div>
                      <span className="font-extrabold text-slate-800 text-sm block">
                        {label}
                      </span>
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          diaConfig.activo
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {diaConfig.activo ? "Abierto" : "Cerrado"}
                      </span>
                    </div>
                  </div>

                  <Switch
                    checked={diaConfig.activo}
                    onChange={(checked) => updateDia(clave, "activo", checked)}
                    id={`switch-${clave}`}
                  />
                </div>

                {/* Controles de Horario si el día está ACTIVO */}
                {diaConfig.activo ? (
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
                    {/* Apertura & Cierre */}
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block">Apertura</span>
                        <input
                          type="time"
                          value={diaConfig.apertura}
                          onChange={(e) => updateDia(clave, "apertura", e.target.value)}
                          className="bg-white px-2 py-1 rounded-lg border border-slate-200 font-bold text-xs text-slate-800 focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <span className="text-slate-400 font-bold pt-3.5">—</span>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block">Cierre</span>
                        <input
                          type="time"
                          value={diaConfig.cierre}
                          onChange={(e) => updateDia(clave, "cierre", e.target.value)}
                          className="bg-white px-2 py-1 rounded-lg border border-slate-200 font-bold text-xs text-slate-800 focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    {/* Refrigerio / Pausa de Almuerzo */}
                    <div className="flex items-center gap-2.5 bg-amber-50/60 p-2 rounded-xl border border-amber-200/80">
                      <div className="flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="text-[11px] font-bold text-amber-900">Almuerzo / Pausa</span>
                        <input
                          type="checkbox"
                          checked={diaConfig.tienePausa}
                          onChange={(e) => updateDia(clave, "tienePausa", e.target.checked)}
                          className="w-4 h-4 accent-teal-600 rounded cursor-pointer ml-1"
                        />
                      </div>

                      {diaConfig.tienePausa && (
                        <div className="flex items-center gap-1.5 pl-2 border-l border-amber-200">
                          <input
                            type="time"
                            value={diaConfig.pausaInicio || "13:00"}
                            onChange={(e) => updateDia(clave, "pausaInicio", e.target.value)}
                            className="bg-white px-1.5 py-1 rounded-lg border border-amber-200 font-semibold text-xs text-slate-800"
                          />
                          <span className="text-amber-600 text-[10px]">a</span>
                          <input
                            type="time"
                            value={diaConfig.pausaFin || "14:00"}
                            onChange={(e) => updateDia(clave, "pausaFin", e.target.value)}
                            className="bg-white px-1.5 py-1 rounded-lg border border-amber-200 font-semibold text-xs text-slate-800"
                          />
                        </div>
                      )}
                    </div>

                    {/* Badge de Horas Operativas */}
                    <div className="hidden sm:block text-right ml-auto">
                      <span className="text-[11px] font-extrabold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                        {horasNetas}h operativas
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic flex items-center gap-1.5 py-2">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sede cerrada este día. No se generarán turnos en la agenda ni en reservas.</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/25 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer text-xs"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Guardando Horarios..." : "Guardar Horarios Semanales"}</span>
        </button>
      </div>
    </form>
  );
}
