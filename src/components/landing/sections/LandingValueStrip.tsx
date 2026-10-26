"use client";

import { HeartPulse, ShieldCheck, HeartHandshake, CalendarClock, Award } from "lucide-react";
import { ConfiguracionClinicaItem } from "@/lib/store";

interface LandingValueStripProps {
  config: ConfiguracionClinicaItem;
}

export function LandingValueStrip({ config }: LandingValueStripProps) {
  return (
    <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 lg:-mt-12">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-stone-900/5 border border-stone-200/80 p-6 sm:p-8 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-6 lg:gap-0 lg:divide-x divide-stone-100">
          
          {/* Pillar 1: Personalized Care */}
          <div className="flex flex-col items-center text-center lg:px-5 group">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100/60 text-[#0D9488] flex items-center justify-center mb-3.5 shadow-2xs group-hover:scale-105 group-hover:bg-[#0D9488] group-hover:text-white transition-all duration-300">
              <HeartPulse className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="font-bold text-sm lg:text-base text-[#0B2E28] mb-1.5 tracking-tight">
              Atención personalizada
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
              Planes de tratamiento adaptados a tus objetivos y necesidades únicas.
            </p>
          </div>

          {/* Pillar 2: Experienced Therapists */}
          <div className="flex flex-col items-center text-center lg:px-5 group">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100/60 text-[#0D9488] flex items-center justify-center mb-3.5 shadow-2xs group-hover:scale-105 group-hover:bg-[#0D9488] group-hover:text-white transition-all duration-300">
              <ShieldCheck className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="font-bold text-sm lg:text-base text-[#0B2E28] mb-1.5 tracking-tight">
              Terapeutas licenciados
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
              Profesionales colegiados con amplia experiencia clínica especializada.
            </p>
          </div>

          {/* Pillar 3: Comprehensive Services */}
          <div className="flex flex-col items-center text-center lg:px-5 group">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100/60 text-[#0D9488] flex items-center justify-center mb-3.5 shadow-2xs group-hover:scale-105 group-hover:bg-[#0D9488] group-hover:text-white transition-all duration-300">
              <HeartHandshake className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="font-bold text-sm lg:text-base text-[#0B2E28] mb-1.5 tracking-tight">
              Servicios integrales
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
              Rehabilitación traumatológica, deportiva y postural en un solo centro.
            </p>
          </div>

          {/* Pillar 4: Flexible Appointments */}
          <div className="flex flex-col items-center text-center lg:px-5 group">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100/60 text-[#0D9488] flex items-center justify-center mb-3.5 shadow-2xs group-hover:scale-105 group-hover:bg-[#0D9488] group-hover:text-white transition-all duration-300">
              <CalendarClock className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="font-bold text-sm lg:text-base text-[#0B2E28] mb-1.5 tracking-tight">
              Horarios flexibles
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
              {config.horariosSemana?.sabado?.activo
                ? `Atención de lunes a sábado desde las ${config.horaApertura || "08:00"} hasta las ${config.horaCierre || "20:00"}.`
                : `Atención clínica de lunes a viernes de ${config.horaApertura || "08:00"} a ${config.horaCierre || "20:00"}.`}
            </p>
          </div>

          {/* Pillar 5: Better Results */}
          <div className="flex flex-col items-center text-center lg:px-5 group sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100/60 text-[#0D9488] flex items-center justify-center mb-3.5 shadow-2xs group-hover:scale-105 group-hover:bg-[#0D9488] group-hover:text-white transition-all duration-300">
              <Award className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="font-bold text-sm lg:text-base text-[#0B2E28] mb-1.5 tracking-tight">
              Mejores resultados
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
              Tratamientos con evidencia científica enfocados en tu bienestar duradero.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
