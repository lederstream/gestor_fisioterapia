"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { ConfiguracionClinicaItem } from "@/lib/store";

interface LandingAboutProps {
  config: ConfiguracionClinicaItem;
  salasDisponibles: number;
}

export function LandingAbout({ config, salasDisponibles }: LandingAboutProps) {
  return (
    <section id="nosotros" className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-xl bg-[#0B332D]">
          
          {/* Left Image Side */}
          <div className="lg:col-span-6 relative min-h-[380px] lg:min-h-[500px]">
            <Image
              src="/images/rehab-band.jpg"
              alt={`Rehabilitación en ${config.nombreComercial || "Clínica"}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            {/* Floating Orange Badge: SALAS DE ATENCIÓN DINÁMICAS */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 lg:left-auto lg:-translate-x-0 lg:-right-14 lg:top-1/2 lg:-translate-y-1/2 lg:bottom-auto z-20">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#E07052] text-white flex flex-col items-center justify-center p-3 shadow-2xl text-center border-4 border-white/90">
                <span className="text-4xl sm:text-5xl font-black leading-none">
                  {salasDisponibles}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase leading-tight mt-1 max-w-[70px]">
                  SALAS DE ATENCIÓN
                </span>
              </div>
            </div>
          </div>

          {/* Right Dark Green Content Side */}
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 text-white flex flex-col justify-center space-y-6">
            <span className="text-[#84CCB5] text-xs font-bold uppercase tracking-widest block">
              CUIDAMOS DE TI
            </span>

            <div className="space-y-1">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                No tratamos síntomas.
              </h2>
              <div className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#C5E9DE] font-normal leading-tight">
                Tratamos personas.
              </div>
            </div>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-lg">
              En {config.nombreComercial || "AJ Fisioterapia"} creemos que recuperar tu movimiento también es recuperar tu confianza. Nuestro equipo te acompaña con escucha, ciencia y un plan hecho para ti.
            </p>

            {/* Checklist */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#185348] text-[#84CCB5] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-xs sm:text-sm text-stone-200">
                  Evaluación completa desde la primera cita
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#185348] text-[#84CCB5] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-xs sm:text-sm text-stone-200">
                  Reevaluación de progreso cada {config.frecuenciaReevaluacion || 5} sesiones
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#185348] text-[#84CCB5] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-xs sm:text-sm text-stone-200">
                  Equipo multidisciplinario y seguimiento biomecánico
                </span>
              </div>
            </div>

            {/* Button */}
            <div className="pt-4">
              <Link
                href="/reservas"
                className="rounded-full bg-white hover:bg-stone-100 text-[#0B332D] font-bold text-sm px-7 py-3.5 inline-flex items-center gap-2 shadow-sm transition hover:gap-3"
              >
                <span>Conoce tu plan de recuperación</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
