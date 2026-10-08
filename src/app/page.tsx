"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Check,
  User,
  Phone,
  Menu,
  X,
  Star,
} from "lucide-react";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 selection:bg-[#0C3E37] selection:text-white flex flex-col justify-between font-sans">
      {/* ── HEADER / NAVBAR ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-stone-200/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-[#0C3E37] text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
              AJ
            </div>
            <div>
              <span className="font-bold text-[#0B2E28] text-base sm:text-lg leading-tight block tracking-tight">
                AJ Fisioterapia
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-wider uppercase text-stone-400 font-semibold block leading-none mt-0.5">
                REHABILITACIÓN &amp; BIENESTAR
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a
              href="#servicios"
              className="hover:text-[#0C3E37] transition-colors"
            >
              Servicios
            </a>
            <a
              href="#nosotros"
              className="hover:text-[#0C3E37] transition-colors"
            >
              Nosotros
            </a>
            <a
              href="#como-funciona"
              className="hover:text-[#0C3E37] transition-colors"
            >
              Cómo funciona
            </a>
            <a
              href="#contacto"
              className="hover:text-[#0C3E37] transition-colors"
            >
              Contacto
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/reservas"
              className="text-sm font-semibold text-[#0C3E37] hover:text-[#072B26] flex items-center gap-1.5 transition-colors"
            >
              <User className="w-4 h-4 text-[#0C3E37]" />
              <span>Mi portal</span>
            </Link>

            <Link
              href="/reservas"
              className="rounded-full bg-[#0C3E37] hover:bg-[#072B26] text-white px-5 py-2.5 text-sm font-semibold flex items-center gap-2 shadow-xs transition-all hover:gap-2.5"
            >
              <span>Reservar cita</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-stone-200 px-6 py-5 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
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
            <div className="pt-3 border-t border-stone-100 flex flex-col gap-3">
              <Link
                href="/reservas"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-[#0C3E37] flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Mi portal</span>
              </Link>
              <Link
                href="/reservas"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full bg-[#0C3E37] text-white text-center py-3 font-semibold text-sm flex items-center justify-center gap-2"
              >
                <span>Reservar cita</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO SECTION (Screenshots 1 & 2) ────────────────────────── */}
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
                  Vuelve a moverte.
                </h1>
                <div className="font-editorial text-4xl sm:text-5xl lg:text-[62px] text-[#124B41] font-normal leading-[1.12]">
                  Vuelve a sentirte tú.
                </div>
              </div>

              {/* Description */}
              <p className="text-stone-600 text-base sm:text-lg max-w-lg leading-relaxed pt-1">
                Fisioterapia especializada y humana para recuperar tu bienestar, paso a paso.
              </p>

              {/* CTA Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3">
                <Link
                  href="/reservas"
                  className="rounded-full bg-[#0C3E37] hover:bg-[#072B26] text-white font-semibold text-base px-7 py-3.5 shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all hover:gap-3"
                >
                  <span>Reservar evaluación</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="https://wa.me/51987654321?text=Hola%20AJ%20Fisioterapia,%20quisiera%20consultar%20sobre%20una%20cita"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 text-[#0C3E37] font-semibold text-base hover:opacity-80 py-3.5 px-4 transition"
                >
                  <Phone className="w-4 h-4 text-[#0C3E37]" />
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
                    +1,100 pacientes
                  </div>
                  <div className="text-xs text-stone-500">
                    atendidos cada mes
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Arch with Floating Badges */}
            <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
              {/* Main Image Arch Container */}
              <div className="relative w-full max-w-[460px]">
                <div className="w-full aspect-[4/4.5] rounded-t-[220px] rounded-b-[40px] overflow-hidden shadow-2xl relative bg-stone-100 ring-1 ring-stone-900/5">
                  <Image
                    src="/images/hero-physio.jpg"
                    alt="Fisioterapeuta asistiendo a paciente en AJ Fisioterapia"
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 460px"
                  />
                </div>

                {/* Floating Card: 4.9 Stars (Top Right) */}
                <div className="absolute top-8 -right-2 sm:-right-4 bg-white rounded-2xl p-4 shadow-xl border border-stone-100/90 z-10 flex flex-col items-start min-w-[140px] hover:-translate-y-0.5 transition-transform">
                  <span className="text-3xl font-black text-[#0B2E28] leading-none">
                    4.9
                  </span>
                  <div className="flex items-center gap-0.5 text-[#F59E0B] my-1">
                    <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                    <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                    <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                    <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                    <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
                    PACIENTES FELICES
                  </span>
                </div>

                {/* Floating Card: Próxima Cita (Bottom Left) */}
                <div className="absolute -bottom-5 -left-2 sm:-left-6 bg-white rounded-2xl p-3.5 sm:p-4 shadow-xl border border-stone-100/90 z-10 flex items-center gap-3.5 hover:-translate-y-0.5 transition-transform">
                  <div className="w-11 h-11 rounded-xl bg-[#E2EEE7] text-[#145347] flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      PRÓXIMA CITA
                    </div>
                    <div className="text-sm font-bold text-[#0B2E28]">
                      Hoy, 4:30 pm
                    </div>
                  </div>
                  <div className="ml-2 bg-[#E7F6EC] text-[#166534] text-xs font-semibold px-2.5 py-1 rounded-full">
                    Confirmada
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURES STRIP (Screenshot 2) ────────────────────────────── */}
      <section className="border-y border-stone-200/80 bg-white/70 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-200/80 gap-y-6 sm:gap-y-0">
            {/* Feature 1 */}
            <div className="flex items-center gap-3.5 sm:px-6 first:pl-0">
              <div className="text-[#0C3E37] shrink-0">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0B2E28]">
                  Profesionales licenciados
                </h4>
                <p className="text-xs text-stone-500">
                  Atención especializada
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3.5 sm:px-6">
              <div className="text-[#0C3E37] shrink-0">
                <Clock className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0B2E28]">
                  Horarios flexibles
                </h4>
                <p className="text-xs text-stone-500">
                  De lunes a sábado
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3.5 sm:px-6">
              <div className="text-[#0C3E37] shrink-0">
                <MapPin className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0B2E28]">
                  En San Borja
                </h4>
                <p className="text-xs text-stone-500">
                  Fácil acceso
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-3.5 sm:px-6 last:pr-0">
              <div className="text-[#0C3E37] shrink-0">
                <Sparkles className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0B2E28]">
                  Plan personalizado
                </h4>
                <p className="text-xs text-stone-500">
                  A tu ritmo y objetivos
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES / LO QUE HACEMOS (Screenshot 3) ─────────────────── */}
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

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Service 1 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/90 hover:border-[#0C3E37]/30 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs font-mono font-semibold text-stone-400">
                    01
                  </span>
                  <Link
                    href="/reservas"
                    className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 group-hover:text-[#0C3E37] group-hover:border-[#0C3E37] group-hover:bg-[#E2EEE7]/50 transition-all"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <span className="text-[#D96548] text-[11px] font-bold uppercase tracking-wider block mb-2">
                  DOLOR &amp; MOVILIDAD
                </span>
                <h3 className="font-bold text-xl text-[#0B2E28] mb-2.5">
                  Terapia física
                </h3>
                <p className="text-stone-500 text-xs sm:text-sm leading-relaxed mb-6">
                  Tratamientos personalizados para aliviar el dolor, recuperar movilidad y volver a tu rutina.
                </p>
              </div>
              <div className="pt-4 border-t border-stone-100 flex items-baseline">
                <span className="font-bold text-sm text-[#0B2E28]">Desde S/ 70</span>
                <span className="text-xs text-stone-400 ml-1.5">por sesión</span>
              </div>
            </div>

            {/* Service 2 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/90 hover:border-[#0C3E37]/30 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs font-mono font-semibold text-stone-400">
                    02
                  </span>
                  <Link
                    href="/reservas"
                    className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 group-hover:text-[#0C3E37] group-hover:border-[#0C3E37] group-hover:bg-[#E2EEE7]/50 transition-all"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <span className="text-[#D96548] text-[11px] font-bold uppercase tracking-wider block mb-2">
                  RENDIMIENTO
                </span>
                <h3 className="font-bold text-xl text-[#0B2E28] mb-2.5">
                  Rehabilitación deportiva
                </h3>
                <p className="text-stone-500 text-xs sm:text-sm leading-relaxed mb-6">
                  Recuperación muscular progresiva para regresar a tu deporte con confianza y seguridad.
                </p>
              </div>
              <div className="pt-4 border-t border-stone-100 flex items-baseline">
                <span className="font-bold text-sm text-[#0B2E28]">Desde S/ 80</span>
                <span className="text-xs text-stone-400 ml-1.5">por sesión</span>
              </div>
            </div>

            {/* Service 3 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/90 hover:border-[#0C3E37]/30 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs font-mono font-semibold text-stone-400">
                    03
                  </span>
                  <Link
                    href="/reservas"
                    className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 group-hover:text-[#0C3E37] group-hover:border-[#0C3E37] group-hover:bg-[#E2EEE7]/50 transition-all"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <span className="text-[#D96548] text-[11px] font-bold uppercase tracking-wider block mb-2">
                  FUNCIONALIDAD
                </span>
                <h3 className="font-bold text-xl text-[#0B2E28] mb-2.5">
                  Terapia neurológica
                </h3>
                <p className="text-stone-500 text-xs sm:text-sm leading-relaxed mb-6">
                  Acompañamiento especializado para mejorar la función, el equilibrio y la independencia.
                </p>
              </div>
              <div className="pt-4 border-t border-stone-100 flex items-baseline">
                <span className="font-bold text-sm text-[#0B2E28]">Desde S/ 90</span>
                <span className="text-xs text-stone-400 ml-1.5">por sesión</span>
              </div>
            </div>

            {/* Service 4 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/90 hover:border-[#0C3E37]/30 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs font-mono font-semibold text-stone-400">
                    04
                  </span>
                  <Link
                    href="/reservas"
                    className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 group-hover:text-[#0C3E37] group-hover:border-[#0C3E37] group-hover:bg-[#E2EEE7]/50 transition-all"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <span className="text-[#D96548] text-[11px] font-bold uppercase tracking-wider block mb-2">
                  BIENESTAR
                </span>
                <h3 className="font-bold text-xl text-[#0B2E28] mb-2.5">
                  Masoterapia
                </h3>
                <p className="text-stone-500 text-xs sm:text-sm leading-relaxed mb-6">
                  Masajes relajantes, descontracturantes y linfáticos según las necesidades de tu cuerpo.
                </p>
              </div>
              <div className="pt-4 border-t border-stone-100 flex items-baseline">
                <span className="font-bold text-sm text-[#0B2E28]">Desde S/ 60</span>
                <span className="text-xs text-stone-400 ml-1.5">por sesión</span>
              </div>
            </div>
          </div>

          {/* Bottom link: Ver todos los tratamientos */}
          <div className="text-center mt-12">
            <Link
              href="/reservas"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0C3E37] hover:text-[#072B26] hover:underline transition"
            >
              <span>Ver todos los tratamientos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CUIDAMOS DE TI (Screenshot 4) ────────────────────────────── */}
      <section id="nosotros" className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-xl bg-[#0B332D]">
            
            {/* Left Image Side */}
            <div className="lg:col-span-6 relative min-h-[380px] lg:min-h-[500px]">
              <Image
                src="/images/rehab-band.jpg"
                alt="Paciente y terapeuta en sesión de rehabilitación con banda elástica"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* Floating Orange Badge: 6 SALAS DE ATENCIÓN */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 lg:left-auto lg:-translate-x-0 lg:-right-14 lg:top-1/2 lg:-translate-y-1/2 lg:bottom-auto z-20">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#E07052] text-white flex flex-col items-center justify-center p-3 shadow-2xl text-center border-4 border-white/90">
                  <span className="text-4xl sm:text-5xl font-black leading-none">
                    6
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
                En AJ Fisioterapia creemos que recuperar tu movimiento también es recuperar tu confianza. Nuestro equipo te acompaña con escucha, ciencia y un plan hecho para ti.
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
                    Reevaluación de progreso cada 5 sesiones
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#185348] text-[#84CCB5] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm text-stone-200">
                    Equipo multidisciplinario y seguimiento continuo
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

      {/* ── 3 PASOS / SIMPLE Y CERCANO (Screenshot 5) ────────────────── */}
      <section id="como-funciona" className="pt-20 lg:pt-24 pb-12 lg:pb-16 text-center">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative max-w-5xl mx-auto mb-16">
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
                Elige el servicio, día y turno que mejor se adapten a ti.
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
                Conocemos tu historia, movilidad y objetivos de recuperación.
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
                Diseñamos un tratamiento progresivo y medimos cada avance.
              </p>
            </div>
          </div>

          {/* ── BANNER CTA: DA EL PRIMER PASO (Screenshot 4) ─────────── */}
          <div className="relative rounded-[32px] bg-[#0B332D] text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl text-left my-8">
            {/* Concentric decorative circles in bottom-right */}
            <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full border border-white/5 pointer-events-none"></div>
            <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full border border-white/5 pointer-events-none"></div>
            <div className="absolute -bottom-8 -right-8 w-64 h-64 rounded-full border border-emerald-500/10 pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Col: Tag, Heading & Subtitle */}
              <div className="lg:col-span-7 space-y-4">
                <span className="text-[#84CCB5] text-xs font-bold uppercase tracking-widest block">
                  DA EL PRIMER PASO
                </span>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                  Tu cuerpo está listo <br className="hidden sm:inline" />
                  para volver a moverse.
                </h3>
                <p className="text-stone-200 text-sm sm:text-base leading-relaxed max-w-lg pt-1">
                  Agenda hoy tu evaluación y empecemos juntos tu recuperación.
                </p>
              </div>

              {/* Right Col: Button & Location */}
              <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-center gap-3">
                <Link
                  href="/reservas"
                  className="rounded-full bg-[#E07052] hover:bg-[#D45F41] text-white font-bold text-base px-8 py-4 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transition-all hover:gap-3 w-full sm:w-auto"
                >
                  <span>Reservar mi evaluación</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#A8D3C4] pt-1">
                  <MapPin className="w-4 h-4 text-[#84CCB5] shrink-0" />
                  <span>Av. Gálvez Barrenechea 1249, San Borja</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER (Screenshot 4) ───────────────────────────────────── */}
      <footer id="contacto" className="bg-[#07241F] text-stone-300 pt-16 pb-10 px-4 sm:px-6 lg:px-8 border-t border-emerald-950/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12">
            
            {/* Col 1: Brand (4 cols on lg) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E07052] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  AJ
                </div>
                <div>
                  <span className="font-bold text-white text-base block leading-tight">
                    AJ Fisioterapia
                  </span>
                  <span className="text-[9px] tracking-wider uppercase text-stone-400 font-semibold block leading-none mt-0.5">
                    REHABILITACIÓN &amp; BIENESTAR
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm">
                Rehabilitación y terapias físicas con un enfoque cercano, profesional y humano.
              </p>
            </div>

            {/* Col 2: Explora (2 cols on lg) */}
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
                  <a href="#como-funciona" className="hover:text-white transition-colors">
                    Cómo funciona
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Horarios (3 cols on lg) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-bold text-white text-sm tracking-wide">
                Horarios
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-stone-300">
                <li>Lun – Vie: 8:00 – 20:00</li>
                <li>Sábados: 8:00 – 14:00</li>
                <li className="text-stone-400">Domingos: Cerrado</li>
              </ul>
            </div>

            {/* Col 4: Contacto (2 cols on lg) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-white text-sm tracking-wide">
                Contacto
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-stone-300">
                <li>
                  <a
                    href="https://wa.me/51987654321?text=Hola%20AJ%20Fisioterapia,%20quisiera%20consultar%20sobre%20una%20cita"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    WhatsApp
                  </a>
                </li>
                <li>San Borja, Lima</li>
                <li>
                  <a
                    href="https://maps.google.com/?q=Av.+Gálvez+Barrenechea+1249,+San+Borja"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Ver en Google Maps
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Divider & Rights */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
            <span>© 2026 AJ Fisioterapia. Todos los derechos reservados.</span>
            <span className="text-stone-400">Hecho para cuidar de ti.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
