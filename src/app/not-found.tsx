import Link from "next/link";
import { ArrowLeft, Home, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center mx-auto shadow-sm">
          <span className="text-2xl font-black text-teal-800">404</span>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AJ Fisioterapia • San Borja</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Página no encontrada
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            La ruta a la que intentas acceder no existe o fue reubicada en el portal clínico.
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            <Home className="w-4 h-4" />
            <span>Regresar al Panel Clínico</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
