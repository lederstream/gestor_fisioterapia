"use client";

import { Calendar, User, Sparkles } from "lucide-react";

export function LandingSteps() {
  return (
    <section id="como-funciona" className="py-20 lg:py-24 text-center border-t border-stone-200/60 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="text-[#D96548] text-xs font-bold uppercase tracking-widest block mb-3">
          SIMPLE Y CERCANO
        </span>

        <h2 className="text-3xl sm:text-5xl font-black text-[#0B2E28]">
          Empieza a sentirte mejor
        </h2>
        <div className="font-editorial text-3xl sm:text-5xl text-[#124B41] font-normal mt-1 mb-16">
          en tres pasos.
        </div>

        {/* Process Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative max-w-5xl mx-auto">
          {/* Background Dotted Line */}
          <div className="hidden md:block absolute top-10 left-20 right-20 border-t-2 border-dashed border-[#A8CFC5]/60 z-0"></div>

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[#E2EEE7] text-[#145347] flex items-center justify-center relative shadow-xs">
              <Calendar className="w-7 h-7 stroke-[1.8]" />
              <span className="w-6 h-6 rounded-full bg-[#E07052] text-white text-xs font-bold flex items-center justify-center absolute -top-1 -right-1 shadow-xs ring-2 ring-[#FAF9F5]">
                1
              </span>
            </div>
            <h3 className="font-bold text-lg text-[#0B2E28] mt-5 mb-2">
              Reserva tu cita
            </h3>
            <p className="text-stone-500 text-sm max-w-xs leading-relaxed">
              Elige el servicio, día y turno que mejor se adapten a tu horario.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[#E2EEE7] text-[#145347] flex items-center justify-center relative shadow-xs">
              <User className="w-7 h-7 stroke-[1.8]" />
              <span className="w-6 h-6 rounded-full bg-[#E07052] text-white text-xs font-bold flex items-center justify-center absolute -top-1 -right-1 shadow-xs ring-2 ring-[#FAF9F5]">
                2
              </span>
            </div>
            <h3 className="font-bold text-lg text-[#0B2E28] mt-5 mb-2">
              Evaluamos tu caso
            </h3>
            <p className="text-stone-500 text-sm max-w-xs leading-relaxed">
              Conocemos tu historia clínica, movilidad y objetivos de recuperación.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[#E2EEE7] text-[#145347] flex items-center justify-center relative shadow-xs">
              <Sparkles className="w-7 h-7 stroke-[1.8]" />
              <span className="w-6 h-6 rounded-full bg-[#E07052] text-white text-xs font-bold flex items-center justify-center absolute -top-1 -right-1 shadow-xs ring-2 ring-[#FAF9F5]">
                3
              </span>
            </div>
            <h3 className="font-bold text-lg text-[#0B2E28] mt-5 mb-2">
              Inicia tu recuperación
            </h3>
            <p className="text-stone-500 text-sm max-w-xs leading-relaxed">
              Diseñamos un tratamiento progresivo y medimos cada avance sesión a sesión.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
