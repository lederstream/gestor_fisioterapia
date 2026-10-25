"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home, Sparkles, Phone } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Runtime Error Caught by Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-8 h-8 text-teal-600" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AJ Fisioterapia • Soporte Clínico</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Inconveniente al cargar la sección
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hemos protegido tu sesión clínica. Puedes reintentar la acción o volver al panel principal de tu cuenta.
          </p>
        </div>

        {error.message && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Detalle Técnico
            </span>
            <p className="text-xs text-slate-600 font-mono line-clamp-2 mt-0.5">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Reintentar</span>
          </button>

          <Link
            href="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition"
          >
            <Home className="w-4 h-4" />
            <span>Ir al Inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
