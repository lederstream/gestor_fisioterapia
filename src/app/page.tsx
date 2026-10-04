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
  Sparkles
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-teal-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-teal-500/20">
              KF
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight block leading-none">
                KineFlow Core
              </span>
              <span className="text-xs text-teal-400 font-medium">
                AJ Fisioterapia • San Borja
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/reservas"
              className="text-xs font-semibold px-4 py-2 rounded-xl text-teal-300 hover:text-white hover:bg-slate-800/60 transition"
            >
              Portal Paciente
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 flex items-center gap-1.5 transition"
            >
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-950/80 border border-teal-800/60 text-teal-400 text-xs font-semibold shadow-inner">
          <Building2 className="w-3.5 h-3.5" /> Sistema de Gestión Clínica y Operativa
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight sm:leading-tight">
          Control Integral para <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
            AJ Fisioterapia (San Borja)
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Diseñado para centros de alto rendimiento: sincronización de 6 salas físicas, 8 terapeutas, paquetes de 10 y 20 sesiones con pagos fraccionados y regla obligatoria de reevaluación cada 5 sesiones.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-xl shadow-teal-500/25 flex items-center justify-center gap-2 transition"
          >
            <span>Abrir Dashboard Clínico</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/reservas"
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl border border-slate-800 flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Portal de Reservas Público</span>
          </Link>
        </div>
      </section>

      {/* 4 Pilares del Sistema */}
      <section className="py-12 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white">Matriz 6 Salas</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Control de concurrencia en tiempo real. Bloques de 45-60 min sin solapamiento de sala ni de terapeuta.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white">Hito de Reevaluación</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Alerta clínica automatizada cada 5 sesiones asistidas. Bloqueo de alta hasta acreditar la ficha física.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white">Caja Multicanal</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cobranzas fraccionadas para paquetes de 10 y 20 sesiones en Efectivo, Yape, Plin y POS Tarjeta.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white">Privacidad Médica</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enfoque transaccional y clínico estricto. Sin grabaciones ni multimedia invasiva de los pacientes.
          </p>
        </div>
      </section>
    </div>
  );
}
