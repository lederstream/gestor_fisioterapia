"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Menu, X, ArrowRight } from "lucide-react";
import { ConfiguracionClinicaItem } from "@/lib/store";

interface LandingHeaderProps {
  config: ConfiguracionClinicaItem;
  brandPrimary: string;
  isAuthenticated: boolean;
  currentRole?: string;
  currentUser?: { nombre: string; email: string } | null;
  onOpenLoginModal: () => void;
  onOpenQuickBooking: () => void;
}

export function LandingHeader({
  config,
  brandPrimary,
  isAuthenticated,
  currentRole,
  currentUser,
  onOpenLoginModal,
  onOpenQuickBooking,
}: LandingHeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMiPortalClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      if (currentRole === "PACIENTE") {
        router.push("/reservas");
      } else if (currentRole === "TERAPEUTA" || currentRole === "ASISTENTE" || currentRole === "RECEPCION") {
        router.push("/dashboard/agenda");
      } else {
        router.push("/dashboard");
      }
    } else {
      onOpenLoginModal();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-stone-200/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="w-11 h-11 rounded-2xl text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform overflow-hidden p-1.5"
            style={{ backgroundColor: brandPrimary }}
          >
            {config.logoUrl ? (
              <img
                src={config.logoUrl}
                alt={config.nombreComercial || "Logo"}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="font-black text-sm">
                {(config.nombreComercial || "AJ").substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <span className="font-black text-lg text-[#0B2E28] block leading-tight tracking-tight">
              {config.nombreComercial || "AJ Fisioterapia"}
            </span>
            <span className="text-[10px] tracking-wider uppercase text-stone-500 font-bold block leading-none mt-0.5">
              {config.slogan || "REHABILITACIÓN & BIENESTAR"}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-stone-600">
          <a href="#servicios" className="hover:text-[#0C3E37] transition-colors">
            Servicios
          </a>
          <a href="#nosotros" className="hover:text-[#0C3E37] transition-colors">
            Nosotros
          </a>
          <a href="#historias" className="hover:text-[#0C3E37] transition-colors">
            Historias
          </a>
          <a href="#como-funciona" className="hover:text-[#0C3E37] transition-colors">
            Cómo funciona
          </a>
          <a href="#contacto" className="hover:text-[#0C3E37] transition-colors">
            Contacto
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            type="button"
            onClick={handleMiPortalClick}
            className="text-sm font-bold flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
            style={{ color: brandPrimary }}
          >
            <User className="w-4 h-4" style={{ color: brandPrimary }} />
            <span>
              {isAuthenticated && currentUser?.nombre
                ? `Mi portal (${currentUser.nombre.split(" ")[0]})`
                : "Mi portal"}
            </span>
            {isAuthenticated && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenQuickBooking}
            className="rounded-full text-white font-semibold text-sm px-6 py-2.5 shadow-sm hover:shadow flex items-center gap-2 transition hover:gap-3 cursor-pointer"
            style={{ backgroundColor: brandPrimary }}
          >
            <span>Reservar cita</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-700 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF9F5] border-b border-stone-200 px-4 pt-2 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
          <a
            href="#servicios"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-stone-700 hover:text-[#0C3E37]"
          >
            Servicios
          </a>
          <a
            href="#nosotros"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-stone-700 hover:text-[#0C3E37]"
          >
            Nosotros
          </a>
          <a
            href="#historias"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-stone-700 hover:text-[#0C3E37]"
          >
            Historias
          </a>
          <a
            href="#como-funciona"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-stone-700 hover:text-[#0C3E37]"
          >
            Cómo funciona
          </a>
          <a
            href="#contacto"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-stone-700 hover:text-[#0C3E37]"
          >
            Contacto
          </a>

          <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-bold text-stone-800 hover:text-[#0C3E37] py-2"
            >
              <User className="w-4 h-4 text-[#0C3E37]" />
              <span>Iniciar Sesión / Portal (/login)</span>
            </Link>
          </div>
          <div className="pt-3 border-t border-stone-100 flex flex-col gap-3">
            <button
              type="button"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleMiPortalClick(e);
              }}
              className="text-base font-semibold flex items-center gap-2 text-left py-1 cursor-pointer"
              style={{ color: brandPrimary }}
            >
              <User className="w-4 h-4" style={{ color: brandPrimary }} />
              <span>
                {isAuthenticated && currentUser?.nombre
                  ? `Mi portal (${currentUser.nombre.split(" ")[0]})`
                  : "Mi portal"}
              </span>
              {isAuthenticated && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuickBooking();
              }}
              className="rounded-full text-white text-center py-3 font-semibold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              style={{ backgroundColor: brandPrimary }}
            >
              <span>Reservar cita</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
