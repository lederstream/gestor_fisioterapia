"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ServicioItem } from "@/lib/store";

interface LandingServicesProps {
  servicios: ServicioItem[];
  brandPrimary: string;
  onOpenQuickBooking: (servicioId?: string) => void;
}

export function LandingServices({
  servicios,
  brandPrimary,
  onOpenQuickBooking,
}: LandingServicesProps) {
  const serviciosWeb = servicios.filter((s) => s.mostrarEnWeb !== false);

  return (
    <section id="servicios" className="py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-[#D96548] text-xs font-bold uppercase tracking-widest block mb-3">
              LO QUE HACEMOS
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#0B2E28] leading-[1.15]">
              Tu bienestar, en{" "}
              <span className="font-editorial text-[#124B41] font-normal block sm:inline">
                buenas manos.
              </span>
            </h2>
          </div>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-md">
            Combinamos experiencia clínica, tecnología y un trato cercano para que cada sesión te acerque a tu mejor versión.
          </p>
        </div>

        {/* Cards Grid Dinámico con Promociones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviciosWeb.map((servicio, index) => {
            const formattedIndex = String(index + 1).padStart(2, "0");
            const basePrice = Number(servicio.precioBase) || 0;
            const promoPrice = servicio.precioPromocional ? Number(servicio.precioPromocional) : null;
            const hasPromo = Boolean(promoPrice && promoPrice > 0 && promoPrice < basePrice);
            const discountPercent = hasPromo ? Math.round(((basePrice - promoPrice!) / basePrice) * 100) : 0;
            const displayPrice = hasPromo ? promoPrice! : basePrice;

            return (
              <div
                key={servicio.id}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/90 hover:border-[#0C3E37]/30 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xs font-mono font-semibold text-stone-400">
                      {formattedIndex}
                    </span>
                    <Link
                      href={`/reservas?servicio=${servicio.id}`}
                      className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 group-hover:text-[#0C3E37] group-hover:border-[#0C3E37] group-hover:bg-[#E2EEE7]/50 transition-all"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {servicio.categoriaTag && (
                    <span className="text-[#D96548] text-[11px] font-bold uppercase tracking-wider block mb-2">
                      {servicio.categoriaTag}
                    </span>
                  )}

                  <h3 className="font-bold text-xl text-[#0B2E28] mb-2.5">
                    {servicio.nombre}
                  </h3>

                  <p className="text-stone-500 text-xs sm:text-sm leading-relaxed mb-6">
                    {servicio.descripcion ||
                      "Tratamientos personalizados para aliviar el dolor, recuperar movilidad y volver a tu rutina."}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-extrabold text-base text-[#0B2E28]">
                          Desde {formatCurrency(displayPrice)}
                        </span>
                        {hasPromo && (
                          <span className="text-xs text-stone-400 line-through">
                            {formatCurrency(basePrice)}
                          </span>
                        )}
                        {hasPromo && discountPercent > 0 && (
                          <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-md">
                            -{discountPercent}%
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-stone-400">por sesión</span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md shrink-0">
                      <Clock className="w-3 h-3 text-stone-400" /> {servicio.duracionMinutos || 45} min
                    </span>
                  </div>

                  {/* Botón Principal Unificado de Reserva */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => onOpenQuickBooking(servicio.id)}
                      className="w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all hover:opacity-95 hover:shadow-md cursor-pointer"
                      style={{ backgroundColor: brandPrimary }}
                    >
                      <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Reservar este Servicio</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom link: Ver todos los tratamientos */}
        <div className="text-center mt-12">
          <Link
            href="/reservas"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0C3E37] hover:text-[#072B26] hover:underline transition"
          >
            <span>Ver todos los tratamientos y agendar</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
