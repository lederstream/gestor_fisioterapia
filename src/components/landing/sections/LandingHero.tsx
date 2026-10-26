"use client";

import Image from "next/image";
import { ArrowRight, Phone, Star, Calendar } from "lucide-react";
import { ConfiguracionClinicaItem } from "@/lib/store";

interface LandingHeroProps {
  config: ConfiguracionClinicaItem;
  brandPrimary: string;
  whatsappHref: string;
  clinicStatus: {
    titulo: string;
    subtitulo: string;
    statusText: string;
  };
  onOpenQuickBooking: () => void;
}

export function LandingHero({
  config,
  brandPrimary,
  whatsappHref,
  clinicStatus,
  onOpenQuickBooking,
}: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 lg:bg-[linear-gradient(to_right,#FAF9F5_55%,#EBF3ED_55%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-6 space-y-6 lg:pr-6">
            {/* Badge: Citas disponibles */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E2EEE7] text-[#145347] text-[11px] sm:text-xs font-bold tracking-wider uppercase shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              <span>CITAS DISPONIBLES ESTA SEMANA</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black text-[#0B2E28] tracking-tight leading-[1.08]">
                {config.tituloHero || "Vuelve a moverte."}
              </h1>
              <div className="font-editorial text-4xl sm:text-5xl lg:text-[62px] text-[#124B41] font-normal leading-[1.12]">
                {config.subtituloHero || "Vuelve a sentirte tú."}
              </div>
            </div>

            {/* Description */}
            <p className="text-stone-600 text-base sm:text-lg max-w-lg leading-relaxed pt-1">
              {config.descripcionHero || "Fisioterapia especializada y humana para recuperar tu bienestar, paso a paso."}
            </p>

            {/* CTA Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3">
              <button
                type="button"
                onClick={onOpenQuickBooking}
                className="rounded-full text-white font-semibold text-base px-7 py-3.5 shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all hover:gap-3 hover:opacity-95 cursor-pointer"
                style={{ backgroundColor: brandPrimary }}
              >
                <span>Reservar evaluación</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 font-semibold text-base hover:opacity-80 py-3.5 px-4 transition"
                style={{ color: brandPrimary }}
              >
                <Phone className="w-4 h-4" style={{ color: brandPrimary }} />
                <span>Hablar con recepción</span>
              </a>
            </div>

            {/* Social Proof Badges (Avatars + Patient Count) */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2.5 overflow-hidden">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#D97D64] text-white text-xs font-bold ring-2 ring-[#FAF9F5]">
                  MR
                </div>
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#5B9285] text-white text-xs font-bold ring-2 ring-[#FAF9F5]">
                  JL
                </div>
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#1A4B45] text-white text-xs font-bold ring-2 ring-[#FAF9F5]">
                  AC
                </div>
              </div>

              <div>
                <div className="font-bold text-sm text-[#0B2E28] leading-tight">
                  {config.totalPacientesMes || "+1,100"} pacientes
                </div>
                <div className="text-xs text-stone-500">
                  atendidos cada mes
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Arch with Floating Badges */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end mt-4 lg:mt-0">
            <div className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[460px] mx-auto">
              <div className="w-full aspect-[4/4.5] rounded-t-[180px] sm:rounded-t-[220px] rounded-b-[32px] sm:rounded-b-[40px] overflow-hidden shadow-2xl relative bg-stone-100 ring-1 ring-stone-900/5">
                <Image
                  src={config.heroImageUrl || "/images/hero-physio.jpg"}
                  alt={`Fisioterapia especializada en ${config.nombreComercial || "Clínica"}`}
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 460px"
                />
              </div>

              {/* Floating Card: 4.9 Stars (Top Right) */}
              <div className="absolute top-4 sm:top-8 -right-2 sm:-right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-3 sm:p-4 shadow-xl border border-stone-100/90 z-10 flex flex-col items-start min-w-[125px] sm:min-w-[140px] hover:-translate-y-0.5 transition-transform">
                <span className="text-2xl sm:text-3xl font-black text-[#0B2E28] leading-none">
                  {config.ratingPromedio || 4.9}
                </span>
                <div className="flex items-center gap-0.5 text-[#F59E0B] my-1">
                  <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                  <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                  <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                  <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                  <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-stone-400">
                  PACIENTES FELICES
                </span>
              </div>

              {/* Floating Card: Disponibilidad Dinámica de la Clínica */}
              <button
                type="button"
                onClick={onOpenQuickBooking}
                className="absolute -bottom-3 sm:-bottom-5 left-2 sm:-left-6 bg-white/95 backdrop-blur-sm rounded-2xl p-2.5 sm:p-4 shadow-xl border border-stone-100/90 z-10 flex items-center gap-2.5 sm:gap-3.5 hover:-translate-y-0.5 transition-transform max-w-[90%] sm:max-w-none text-left cursor-pointer group"
                title="Haz clic para consultar disponibilidad y agendar tu cita"
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#E2EEE7] text-[#145347] flex items-center justify-center shrink-0 group-hover:bg-[#145347] group-hover:text-white transition-colors">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {clinicStatus.titulo}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#0B2E28]">
                    {clinicStatus.subtitulo}
                  </div>
                </div>
                <div className="ml-1 sm:ml-2 bg-[#E7F6EC] text-[#166534] text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{clinicStatus.statusText}</span>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
