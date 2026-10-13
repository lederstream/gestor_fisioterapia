import { dbStore } from "@/lib/store";
import { BookingForm } from "@/components/reservas/BookingForm";
import Link from "next/link";
import { ShieldCheck, MapPin, Phone, Clock, Sparkles } from "lucide-react";

export default function ReservasPage() {
  const servicios = dbStore.getServicios();
  const configuracion = dbStore.getConfiguracion();

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Brand Bar */}
      <header className="max-w-2xl mx-auto flex items-center justify-between pb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-teal-600/20">
            GF
          </div>
          <div>
            <span className="font-extrabold text-slate-800 text-lg block leading-none">
              {configuracion.nombreComercial || "AJ Fisioterapia"}
            </span>
            <span className="text-xs text-teal-600 font-semibold tracking-wide">
              {configuracion.sedeNombre || "Sede San Borja"} • Gestor Fisioterapia
            </span>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="text-xs font-bold text-slate-600 hover:text-teal-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition"
        >
          Acceso Personal Clínico
        </Link>
      </header>

      {/* Booking Component */}
      <main className="max-w-2xl mx-auto">
        <BookingForm servicios={servicios} configuracion={configuracion} />

        {/* Informative Footer */}
        <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <MapPin className="w-4 h-4 text-teal-600" />
            <span>Centro Clínico {configuracion.nombreComercial} — {configuracion.sedeNombre || "Sede San Borja"}</span>
          </div>
          <p className="leading-relaxed">
            {configuracion.direccion || "Av. Guardia Civil 520, San Borja, Lima"}. Contamos con {configuracion.totalSalasFisicas || 6} salas físicas equipadas para terapia traumatológica, deportiva, ortopédica y neurorehabilitación.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100 text-[11px]">
            <span>📞 Central Telefónica: {configuracion.telefono}</span>
            <span>📱 WhatsApp Recepción: {configuracion.whatsapp}</span>
            <span>⏰ Atención: {configuracion.horaApertura} - {configuracion.horaCierre}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
