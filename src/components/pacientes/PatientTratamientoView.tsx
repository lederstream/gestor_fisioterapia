"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Activity, 
  Layers, 
  Sparkles, 
  TrendingDown, 
  ShieldCheck, 
  HeartHandshake, 
  ArrowRight,
  FileText,
  CheckCircle2
} from "lucide-react";
import { PackageProgressBar } from "./PackageProgressBar";
import { EvaScaleChart } from "./EvaScaleChart";

interface PatientTratamientoViewProps {
  paquetes: any[];
  historias: any[];
}

export function PatientTratamientoView({ paquetes, historias }: PatientTratamientoViewProps) {
  const [clinicConfig, setClinicConfig] = useState({
    nombreComercial: "AJ Fisioterapia",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("clinic_config");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setClinicConfig((prev) => ({ ...prev, ...parsed }));
        } catch {}
      }
    }
  }, []);

  const formattedHistorias = historias.map((h, i) => ({
    id: h.id || `hist-${i}`,
    fecha: h.createdAt || new Date().toISOString(),
    evaInicio: h.evaDolorInicio || 6,
    evaFin: h.evaDolorFin || 2,
    tratamiento: h.tratamientoAplicado || "Terapia manual miofascial y ejercicios terapéuticos.",
    notas: h.notasReevaluacion || null,
    bloqueaAlta: Boolean(h.bloqueaAlta),
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-emerald-600" />
            Mi Tratamiento & Evolución EVA
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Supervisa el consumo de tus sesiones contratadas, la reducción del dolor y las pautas terapéuticas en {clinicConfig.nombreComercial}.
          </p>
        </div>

        <Link
          href="/reservas"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Continuar Tratamiento</span>
        </Link>
      </div>

      {/* Paquetes Activos */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Layers className="w-4 h-4 text-teal-600" />
          <span>Paquete Terapéutico Contratado</span>
        </div>
        <PackageProgressBar paquetes={paquetes} />
      </div>

      {/* Evolución EVA */}
      <div className="space-y-3 pt-2">
        <EvaScaleChart historialEva={formattedHistorias} />
      </div>

      {/* Recomendaciones Generales para el Paciente */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 p-6 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
          <HeartHandshake className="w-5 h-5 text-teal-700" />
          <span>Pautas de Continuidad Terapéutica en Casa</span>
        </div>
        <p className="text-xs text-teal-800 leading-relaxed">
          Para garantizar una recuperación óptima, mantén las pautas indicadas por tu fisioterapeuta:
        </p>
        <ul className="text-xs text-teal-800 space-y-1.5 list-disc list-inside">
          <li>Realizar los ejercicios de movilidad y estiramiento 1 a 2 veces al día sin forzar dolor.</li>
          <li>Aplicar frío local (15 minutos) si presentas sensación de inflamación luego de actividades intensas.</li>
          <li>Asistir puntualmente a tu reevaluación biomecánica (cada 5 sesiones) para ajustar la intensidad de tu terapia.</li>
        </ul>
      </div>
    </div>
  );
}
