import Link from "next/link";
import { 
  Calendar, 
  CreditCard, 
  Users, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Building2,
  Sparkles,
  Phone,
  Clock
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-teal-600 selection:text-white flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white font-black text-xl shadow-md shadow-teal-600/20">
              KF
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight block leading-none">
                KineFlow Core
              </span>
              <span className="text-xs text-teal-700 font-medium">
                AJ Fisioterapia • San Borja
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/reservas"
              className="text-xs font-semibold px-3 sm:px-4 py-2 rounded-xl text-teal-700 hover:text-teal-900 hover:bg-teal-50 transition"
            >
              Portal Paciente
            </Link>
            <Link
              href="/dashboard"
              className="px-4 sm:px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/25 flex items-center gap-1.5 transition"
            >
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-teal-600" /> Sistema de Gestión Clínica y Operativa
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight sm:leading-tight text-slate-900">
            Control Integral para <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 bg-clip-text text-transparent">
              AJ Fisioterapia (San Borja)
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Diseñado para centros de alto rendimiento: sincronización de 6 salas físicas, 8 terapeutas, paquetes de 10 y 20 sesiones con pagos fraccionados y regla obligatoria de reevaluación cada 5 sesiones.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition"
            >
              <span>Abrir Dashboard Clínico</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/reservas"
              className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Portal de Reservas Público</span>
            </Link>
          </div>
        </section>

        {/* 4 Pilares del Sistema */}
        <section className="py-8 px-4 sm:px-6 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200/90 p-6 rounded-2xl space-y-3 shadow-xs hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-800">Matriz 6 Salas</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Control de concurrencia en tiempo real. Bloques de 45-60 min sin solapamiento de sala ni de terapeuta.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 p-6 rounded-2xl space-y-3 shadow-xs hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/70">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-800">Hito de Reevaluación</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Alerta clínica automatizada cada 5 sesiones asistidas. Bloqueo de alta hasta acreditar la ficha física.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 p-6 rounded-2xl space-y-3 shadow-xs hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/70">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-800">Caja Multicanal</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cobranzas fraccionadas para paquetes de 10 y 20 sesiones en Efectivo, Yape, Plin y POS Tarjeta.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 p-6 rounded-2xl space-y-3 shadow-xs hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200/70">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-800">Privacidad Médica</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enfoque transaccional y clínico estricto. Sin grabaciones ni multimedia invasiva de los pacientes.
            </p>
          </div>
        </section>
      </main>

      {/* Daylight Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Sede San Borja: Av. Guardia Civil 520, Lima, Perú</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px]">
            <span>📞 Central: (01) 475-2010</span>
            <span>📱 WhatsApp: 987 654 321</span>
            <span>⏰ Lun - Sáb: 08:00 - 20:00</span>
          </div>
          <div className="text-[11px] text-slate-400">
            © 2026 AJ Fisioterapia S.A.C. • KineFlow Core
          </div>
        </div>
      </footer>
    </div>
  );
}
