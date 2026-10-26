"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { ConfiguracionClinicaItem } from "@/lib/store";

interface LandingFooterProps {
  config: ConfiguracionClinicaItem;
  brandSecondary: string;
  whatsappHref: string;
  googleMapsHref: string;
  salasDisponibles: number;
  renderHorariosList: () => React.ReactNode;
  onOpenQuickBooking: () => void;
}

export function LandingFooter({
  config,
  brandSecondary,
  whatsappHref,
  googleMapsHref,
  salasDisponibles,
  renderHorariosList,
  onOpenQuickBooking,
}: LandingFooterProps) {
  return (
    <>
      <footer id="contacto" className="bg-[#07241F] text-stone-300 pt-16 pb-10 px-4 sm:px-6 lg:px-8 border-t border-emerald-950/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12">
            
            {/* Col 1: Brand */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden p-1.5"
                  style={{ backgroundColor: brandSecondary }}
                >
                  {config.logoUrl ? (
                    <img
                      src={config.logoUrl}
                      alt={config.nombreComercial || "Logo"}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span>{(config.nombreComercial || "AJ").substring(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-white text-base block leading-tight">
                    {config.nombreComercial || "AJ Fisioterapia"}
                  </span>
                  <span className="text-[9px] tracking-wider uppercase text-stone-400 font-semibold block leading-none mt-0.5">
                    {config.slogan || "REHABILITACIÓN & BIENESTAR"}
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm">
                {config.descripcionHero || "Rehabilitación y terapias físicas con un enfoque cercano, profesional y humano."}
              </p>
            </div>

            {/* Col 2: Explora */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-white text-sm tracking-wide">
                Explora
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-stone-300">
                <li>
                  <a href="#servicios" className="hover:text-white transition-colors">
                    Servicios
                  </a>
                </li>
                <li>
                  <a href="#nosotros" className="hover:text-white transition-colors">
                    Nosotros
                  </a>
                </li>
                <li>
                  <a href="#historias" className="hover:text-white transition-colors">
                    Historias
                  </a>
                </li>
                <li>
                  <a href="#como-funciona" className="hover:text-white transition-colors">
                    Cómo funciona
                  </a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors text-emerald-400 font-bold flex items-center gap-1">
                    <span>Acceso Colaboradores & Pacientes (/login)</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Horarios Dinámicos */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-bold text-white text-sm tracking-wide">
                Horarios
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-stone-300">
                {renderHorariosList()}
              </ul>
            </div>

            {/* Col 4: Contacto */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-white text-sm tracking-wide">
                Contacto
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-stone-300">
                {config.whatsapp && (
                  <li>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors text-emerald-400 font-bold"
                    >
                      WhatsApp: {config.whatsapp}
                    </a>
                  </li>
                )}
                {config.telefono && (
                  <li>Telf: {config.telefono}</li>
                )}
                <li>{config.direccionDistrito || "San Borja"}, {config.direccionCiudad || "Lima"}</li>
                <li>
                  <a
                    href={googleMapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors underline"
                  >
                    Ver en Google Maps
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Divider & Rights */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
            <span>© {new Date().getFullYear()} {config.nombreComercial || "AJ Fisioterapia"}. RUC: {config.ruc || "20601234567"}. Todos los derechos reservados.</span>
            <span className="text-stone-400">Hecho para cuidar de ti.</span>
          </div>
        </div>
      </footer>

      {/* ── BARRA FLOTANTE MÓVIL (STICKY BOTTOM BAR) ────────────────── */}
      <div className="md:hidden fixed bottom-4 inset-x-3 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-stone-900/95 backdrop-blur-md text-white p-2.5 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-3">
          <div className="pl-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-extrabold text-stone-200 uppercase tracking-wider">
                Sede San Borja
              </span>
            </div>
            <p className="text-[11px] font-semibold text-stone-300">
              {salasDisponibles} salas disponibles
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenQuickBooking}
            className="py-2.5 px-4 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer shrink-0"
            style={{ backgroundColor: brandSecondary || "#E07052" }}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Reservar Cita</span>
          </button>
        </div>
      </div>
    </>
  );
}
