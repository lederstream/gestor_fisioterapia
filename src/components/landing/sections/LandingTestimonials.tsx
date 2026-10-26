"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, CalendarClock, Calendar, ArrowRight, MapPin } from "lucide-react";
import { ConfiguracionClinicaItem, TestimonioItem } from "@/lib/store";

interface LandingTestimonialsProps {
  config: ConfiguracionClinicaItem;
  brandPrimary: string;
  brandAccent: string;
  testimoniosList: TestimonioItem[];
  onOpenQuickBooking: () => void;
}

export function LandingTestimonials({
  config,
  brandPrimary,
  brandAccent,
  testimoniosList,
  onOpenQuickBooking,
}: LandingTestimonialsProps) {
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % testimoniosList.length);
  };

  const prevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + testimoniosList.length) % testimoniosList.length);
  };

  return (
    <section id="historias" className="py-20 lg:py-24 bg-white border-t border-stone-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header en Español */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[#0D9488] text-xs font-bold uppercase tracking-widest block mb-2">
            HISTORIAS DE RECUPERACIÓN
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B2E28] tracking-tight">
            Lo que dicen nuestros pacientes
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-2">
            Casos reales de personas que recuperaron su movilidad y bienestar con nosotros en San Borja.
          </p>
        </div>

        {/* Carrusel Interactivo con Botones Circulares Laterales */}
        <div className="relative flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
          
          {/* Botón Circular Izquierdo */}
          <button
            type="button"
            onClick={prevTestimonial}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0D9488] hover:bg-[#0B7A70] active:scale-95 text-white flex items-center justify-center shadow-md transition-all shrink-0 cursor-pointer z-10"
            aria-label="Testimonio anterior"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Ventana de Testimonios */}
          <div className="flex-1 overflow-hidden py-2">
            {/* Escritorio: 3 tarjetas visibles */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((offset) => {
                const item = testimoniosList[(testimonialIndex + offset) % testimoniosList.length];
                return (
                  <div
                    key={`${item.id}-${offset}`}
                    className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[270px]"
                  >
                    <div>
                      {/* Header: Avatar + Estrellas */}
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={item.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80"}
                          alt={item.nombre}
                          className="w-14 h-14 rounded-full object-cover border-2 border-teal-50 shadow-sm shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1 text-[#F59E0B] mb-1">
                            {Array.from({ length: item.calificacion || 5 }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-teal-700">
                            Calificación 5/5
                          </span>
                        </div>
                      </div>

                      {/* Testimonio */}
                      <p className="text-stone-600 text-sm leading-relaxed italic mb-6">
                        "{item.comentario}"
                      </p>
                    </div>

                    {/* Firma del Paciente */}
                    <div className="pt-3 border-t border-stone-100">
                      <h4 className="font-bold text-sm text-[#0B2E28]">
                        — {item.nombre}
                      </h4>
                      <span className="text-xs text-stone-400 block mt-0.5">
                        {item.ocupacion || "Paciente Verificado"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Móvil / Tablet: 1 tarjeta por vista */}
            <div className="lg:hidden">
              {(() => {
                const item = testimoniosList[testimonialIndex % testimoniosList.length];
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/90 shadow-sm flex flex-col justify-between transition-all min-h-[250px]"
                  >
                    <div>
                      {/* Header: Avatar + Estrellas */}
                      <div className="flex items-center gap-3.5 mb-4">
                        <img
                          src={item.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80"}
                          alt={item.nombre}
                          className="w-13 h-13 rounded-full object-cover border-2 border-teal-50 shadow-sm shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1 text-[#F59E0B] mb-1">
                            {Array.from({ length: item.calificacion || 5 }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-teal-700">
                            Calificación 5/5
                          </span>
                        </div>
                      </div>

                      {/* Testimonio */}
                      <p className="text-stone-600 text-sm leading-relaxed italic mb-5">
                        "{item.comentario}"
                      </p>
                    </div>

                    {/* Firma */}
                    <div className="pt-3 border-t border-stone-100">
                      <h4 className="font-bold text-sm text-[#0B2E28]">
                        — {item.nombre}
                      </h4>
                      <span className="text-xs text-stone-400 block mt-0.5">
                        {item.ocupacion || "Paciente Verificado"}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>

          {/* Botón Circular Derecho */}
          <button
            type="button"
            onClick={nextTestimonial}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0D9488] hover:bg-[#0B7A70] active:scale-95 text-white flex items-center justify-center shadow-md transition-all shrink-0 cursor-pointer z-10"
            aria-label="Testimonio siguiente"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

        </div>

        {/* Indicadores / Puntos de Paginación */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {testimoniosList.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setTestimonialIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                testimonialIndex === idx ? "w-6" : "w-2 bg-stone-300 hover:bg-stone-400"
              }`}
              style={testimonialIndex === idx ? { backgroundColor: brandAccent } : {}}
              aria-label={`Ir a testimonio ${idx + 1}`}
            />
          ))}
        </div>

        {/* ── BANNER CTA FINAL: LISTO PARA INICIAR TU RECUPERACIÓN ── */}
        <div
          className="mt-16 relative rounded-2xl sm:rounded-3xl text-white p-7 sm:p-10 lg:p-12 shadow-2xl border border-teal-800/40 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, #07241F 100%)` }}
        >
          {/* Efectos de luz sutil */}
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            
            {/* Lado izquierdo: Icono + Título + Bajada */}
            <div className="flex items-center gap-4 sm:gap-5 text-center lg:text-left flex-col lg:flex-row">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
                <CalendarClock className="w-8 h-8 text-[#84CCB5]" />
              </div>
              <div>
                <span className="text-[#84CCB5] text-xs font-bold uppercase tracking-widest block mb-1">
                  DA EL PRIMER PASO
                </span>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  ¿Listo para volver a moverte sin dolor?
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl mt-1.5">
                  Agenda hoy tu evaluación clínica en {config.nombreComercial || "AJ Fisioterapia"} y recupera tu calidad de vida sin esperas ni dolor.
                </p>
              </div>
            </div>

            {/* Lado derecho: Botón y Dirección en San Borja */}
            <div className="flex flex-col items-center lg:items-end gap-3 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={onOpenQuickBooking}
                className="rounded-full bg-white hover:bg-stone-50 font-bold text-sm sm:text-base px-8 py-4 shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 transition-all hover:gap-3.5 shrink-0 w-full sm:w-auto active:scale-95 cursor-pointer"
                style={{ color: brandPrimary }}
              >
                <Calendar className="w-5 h-5" style={{ color: brandPrimary }} />
                <span>Reservar mi evaluación</span>
                <ArrowRight className="w-5 h-5" style={{ color: brandPrimary }} />
              </button>

              <div className="flex items-center gap-2 text-xs text-[#A8D3C4]">
                <MapPin className="w-4 h-4 text-[#84CCB5] shrink-0" />
                <span>{config.direccion || "Av. Guardia Civil 520, San Borja, Lima"}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
