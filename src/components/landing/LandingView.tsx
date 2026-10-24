"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  Quote,
  ShieldCheck,
  HeartHandshake,
  CalendarClock,
  Award,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginPortalModal } from "@/components/auth/LoginPortalModal";
import { QuickPreBookingModal } from "@/components/reservas/QuickPreBookingModal";
import { formatCurrency } from "@/lib/utils";
import { ConfiguracionClinicaItem, ServicioItem, SalaItem } from "@/lib/store";

interface LandingViewProps {
  config: ConfiguracionClinicaItem;
  servicios: ServicioItem[];
  salas: SalaItem[];
}

export function LandingView({ config, servicios, salas }: LandingViewProps) {
  const router = useRouter();
  const { isAuthenticated, currentRole, currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPreBookingOpen, setIsPreBookingOpen] = useState(false);
  const [preBookingServiceId, setPreBookingServiceId] = useState<string | undefined>(undefined);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const handleOpenQuickBooking = (servicioId?: string) => {
    setPreBookingServiceId(servicioId);
    setIsPreBookingOpen(true);
  };

  // Paleta de Marca Blanca Dinámica
  const brandPrimary = config?.colorPrimario || "#0C3E37";
  const brandSecondary = config?.colorSecundario || "#E07052";
  const brandAccent = config?.colorAcento || "#0D9488";

  // Filtrar servicios visibles en web (por defecto activos)
  const serviciosWeb = servicios.filter((s) => s.mostrarEnWeb !== false);

  // Salas activas para la insignia dinámica
  const salasDisponibles = salas.filter((s) => s.estado === "DISPONIBLE").length || 6;

  // Manejo de redirección a portales o login
  const handleMiPortalClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      if (currentRole === "PACIENTE") {
        router.push("/reservas");
      } else if (currentRole === "TERAPEUTA" || currentRole === "RECEPCION") {
        router.push("/dashboard/agenda");
      } else {
        router.push("/dashboard");
      }
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const whatsappHref = config.whatsapp
    ? `https://wa.me/${config.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hola ${config.nombreComercial || "Clínica"}, quisiera consultar sobre una cita de fisioterapia.`
      )}`
    : "https://wa.me/51987654321";

  const googleMapsHref =
    config.googleMapsUrl ||
    `https://maps.google.com/?q=${encodeURIComponent(
      config.direccion || `${config.nombreComercial || "Clinica"} Lima Peru`
    )}`;

  const defaultTestimonios = [
    {
      id: "t1",
      nombre: "Sarah M.",
      calificacion: 5,
      ocupacion: "Rehabilitación Lumbar • San Borja",
      comentario: "Llegué con un dolor lumbar severo que me impedía trabajar sentada. En solo 4 sesiones el progreso fue extraordinario. ¡El equipo escucha y diseña un plan que realmente funciona!",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80",
    },
    {
      id: "t2",
      nombre: "James T.",
      calificacion: 5,
      ocupacion: "Atleta de Running • Miraflores",
      comentario: "Profesionales, empáticos y súper capacitados. Entendieron mis metas de carrera y mi recuperación de rodilla fue mucho más rápida de lo esperado. Volví a correr con total seguridad.",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80",
    },
    {
      id: "t3",
      nombre: "Emily R.",
      calificacion: 5,
      ocupacion: "Post-operatorio Hombro • Surco",
      comentario: "Gran experiencia de principio a fin. Después de mi cirugía tenía miedo de no recuperar el rango de movimiento. El acompañamiento y tecnología de la clínica me devolvieron la confianza.",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80",
    },
    {
      id: "t4",
      nombre: "Carlos V.",
      calificacion: 5,
      ocupacion: "Terapia Cervical • San Isidro",
      comentario: "Paso más de 9 horas frente a la computadora y las contracturas me provocaban dolores diarios. La terapia manual combinada con ejercicios posturales me cambió la calidad de vida.",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80",
    },
    {
      id: "t5",
      nombre: "Mariana P.",
      calificacion: 5,
      ocupacion: "Fisioterapia Deportiva • San Borja",
      comentario: "Sufro de esguinces recurrentes en el tobillo. En la clínica no solo trataron la inflamación, sino que me enseñaron propiocepción y fortalecimiento. ¡Excelente atención!",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80",
    },
    {
      id: "t6",
      nombre: "Roberto D.",
      calificacion: 5,
      ocupacion: "Adulto Mayor • San Borja",
      comentario: "Llevé a mi padre de 72 años para fortalecimiento de cadera y equilibrio. La paciencia, vocación y cuidado de cada terapeuta son admirables. Estamos sumamente agradecidos.",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80",
    },
  ];

  const testimoniosList = config.testimonios && config.testimonios.length > 0
    ? config.testimonios
    : defaultTestimonios;

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % testimoniosList.length);
  };

  const prevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + testimoniosList.length) % testimoniosList.length);
  };

  // Cálculo inteligente del estado operativo de la clínica en tiempo real (Zona Horaria Perú)
  const clinicStatus = (() => {
    const dayKeys = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const now = new Date();
    // Convertir a fecha/hora local de Lima, Perú
    const peruDateStr = now.toLocaleString("en-US", { timeZone: "America/Lima" });
    const peruTime = new Date(peruDateStr);
    const currentDayKey = dayKeys[peruTime.getDay()];
    const currentHour = peruTime.getHours();
    const currentMinutes = peruTime.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, "0")}:${currentMinutes.toString().padStart(2, "0")}`;

    const hs = config.horariosSemana;
    const diaHoy = hs ? hs[currentDayKey as keyof typeof hs] : null;

    const isOpenToday = diaHoy ? diaHoy.activo : (currentDayKey !== "domingo");
    const horaAperturaHoy = diaHoy?.apertura || config.horaApertura || "08:00";
    const horaCierreHoy = diaHoy?.cierre || config.horaCierre || "20:00";

    if (isOpenToday && currentTimeStr < horaCierreHoy) {
      if (currentTimeStr < horaAperturaHoy) {
        return {
          titulo: "AGENDA DE HOY",
          subtitulo: `Abre hoy a las ${horaAperturaHoy}`,
          statusText: "Cupos libres",
        };
      }
      return {
        titulo: "HORARIO DE HOY",
        subtitulo: `Atención hasta ${horaCierreHoy}`,
        statusText: "Turnos disponibles",
      };
    }

    // Si ya cerró hoy o el día está inactivo, buscar el próximo día abierto
    let nextDayLabel = "Mañana";
    let nextDayApertura = config.horaApertura || "08:00";

    for (let i = 1; i <= 7; i++) {
      const nextIdx = (peruTime.getDay() + i) % 7;
      const nextKey = dayKeys[nextIdx];
      const nextConf = hs ? hs[nextKey as keyof typeof hs] : null;
      const nextIsOpen = nextConf ? nextConf.activo : (nextKey !== "domingo");
      if (nextIsOpen) {
        nextDayLabel = i === 1 ? "Mañana" : dayNames[nextIdx];
        nextDayApertura = nextConf?.apertura || config.horaApertura || "08:00";
        break;
      }
    }

    return {
      titulo: "PRÓXIMA ATENCIÓN",
      subtitulo: `${nextDayLabel} desde ${nextDayApertura}`,
      statusText: "Reserva 24/7",
    };
  })();

  // Renderizador dinámico de horarios semanales
  const renderHorariosList = () => {
    if (!config.horariosSemana) {
      return (
        <>
          <li>Lun – Vie: {config.horaApertura || "08:00"} – {config.horaCierre || "20:00"}</li>
          <li>Sábados: 08:00 – 14:00</li>
          <li className="text-stone-400">Domingos: Cerrado</li>
        </>
      );
    }

    const hs = config.horariosSemana;
    const weekdays = ["lunes", "martes", "miercoles", "jueves", "viernes"].map((k) => hs[k as keyof typeof hs]);
    const lvEqual = weekdays.every(
      (d) => d && d.activo === weekdays[0]?.activo && d.apertura === weekdays[0]?.apertura && d.cierre === weekdays[0]?.cierre
    );

    const items: { label: string; text: string; isClosed: boolean }[] = [];

    if (lvEqual && weekdays[0]) {
      if (weekdays[0].activo) {
        items.push({ label: "Lun – Vie", text: `${weekdays[0].apertura} – ${weekdays[0].cierre}`, isClosed: false });
      } else {
        items.push({ label: "Lun – Vie", text: "Cerrado", isClosed: true });
      }
    } else {
      const diasNombres: Record<string, string> = {
        lunes: "Lunes",
        martes: "Martes",
        miercoles: "Miércoles",
        jueves: "Jueves",
        viernes: "Viernes",
      };
      for (const [k, name] of Object.entries(diasNombres)) {
        const conf = hs[k as keyof typeof hs];
        if (conf?.activo) {
          items.push({ label: name, text: `${conf.apertura} – ${conf.cierre}`, isClosed: false });
        } else {
          items.push({ label: name, text: "Cerrado", isClosed: true });
        }
      }
    }

    // Sábado
    const sab = hs.sabado;
    if (sab?.activo) {
      items.push({ label: "Sábados", text: `${sab.apertura} – ${sab.cierre}`, isClosed: false });
    } else {
      items.push({ label: "Sábados", text: "Cerrado", isClosed: true });
    }

    // Domingo
    const dom = hs.domingo;
    if (dom?.activo) {
      items.push({ label: "Domingos", text: `${dom.apertura} – ${dom.cierre}`, isClosed: false });
    } else {
      items.push({ label: "Domingos", text: "Cerrado", isClosed: true });
    }

    return items.map((it, idx) => (
      <li key={idx} className={it.isClosed ? "text-stone-400" : ""}>
        {it.label}: {it.text}
      </li>
    ));
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 selection:bg-[#0C3E37] selection:text-white flex flex-col justify-between font-sans">
      {/* ── HEADER / NAVBAR (100% DINÁMICO) ─────────────────────────── */}
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
              <span className="font-bold text-[#0B2E28] text-base sm:text-lg leading-tight block tracking-tight">
                {config.nombreComercial || "AJ Fisioterapia"}
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-wider uppercase text-stone-400 font-semibold block leading-none mt-0.5">
                {config.slogan || "REHABILITACIÓN & BIENESTAR"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a href="#servicios" className="hover:text-stone-900 transition-colors">
              Servicios
            </a>
            <a href="#nosotros" className="hover:text-stone-900 transition-colors">
              Nosotros
            </a>
            <a href="#historias" className="hover:text-stone-900 transition-colors">
              Historias
            </a>
            <a href="#como-funciona" className="hover:text-stone-900 transition-colors">
              Cómo funciona
            </a>
            <a href="#contacto" className="hover:text-stone-900 transition-colors">
              Contacto
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer hover:text-stone-900 text-stone-600 px-3 py-2 rounded-xl hover:bg-stone-100/80"
              title="Acceso al portal clínico con DNI o credenciales"
            >
              <User className="w-4 h-4 text-stone-500" />
              <span>Iniciar Sesión</span>
            </Link>

            <button
              type="button"
              onClick={handleMiPortalClick}
              className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer hover:opacity-85"
              style={{ color: brandPrimary }}
            >
              <span>
                {isAuthenticated && currentUser?.nombre
                  ? `Mi portal (${currentUser.nombre.split(" ")[0]})`
                  : "Mi portal"}
              </span>
              {isAuthenticated && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Sesión activa" />
              )}
            </button>

            <Link
              href="/reservas"
              className="rounded-full text-white px-5 py-2.5 text-sm font-semibold flex items-center gap-2 shadow-xs transition-all hover:gap-2.5 hover:opacity-95"
              style={{ backgroundColor: brandPrimary }}
            >
              <span>Reservar cita</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition cursor-pointer"
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
              <Link
                href="/reservas"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full text-white text-center py-3 font-semibold text-sm flex items-center justify-center gap-2 shadow-xs"
                style={{ backgroundColor: brandPrimary }}
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
                <Link
                  href="/reservas"
                  className="rounded-full text-white font-semibold text-base px-7 py-3.5 shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all hover:gap-3 hover:opacity-95"
                  style={{ backgroundColor: brandPrimary }}
                >
                  <span>Reservar evaluación</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

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
                  onClick={() => handleOpenQuickBooking()}
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

      {/* ── ELEVATED 5-PILLAR VALUE STRIP (Image 2 Reference) ───────── */}
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

      {/* ── SERVICES / LO QUE HACEMOS (Screenshot 3 & Image 4) ───────── */}
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

          {/* Cards Grid Dinámico con Promociones Rojas de Image 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviciosWeb.map((servicio, index) => {
              const formattedIndex = String(index + 1).padStart(2, "0");
              const regularPrice = servicio.precioPromocional || servicio.precioBase;

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
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline">
                        <span className="font-bold text-sm text-[#0B2E28]">
                          Desde {formatCurrency(regularPrice)}
                        </span>
                        <span className="text-xs text-stone-400 ml-1.5">por sesión</span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3 text-stone-400" /> {servicio.duracionMinutos || 45} min
                      </span>
                    </div>

                    {/* Etiqueta Roja de Promoción (Image 4) */}
                    {servicio.textoPromocion ? (
                      <div className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200/70 px-2.5 py-1 rounded-md text-center">
                        {servicio.textoPromocion}
                      </div>
                    ) : null}

                    {/* Botón de Reserva Rápida (Modal) + Link */}
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenQuickBooking(servicio.id)}
                        className="flex-1 py-2 px-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition hover:opacity-95 cursor-pointer"
                        style={{ backgroundColor: brandPrimary }}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Reserva Rápida</span>
                      </button>

                      <Link
                        href={`/reservas?servicio=${servicio.id}`}
                        className="py-2 px-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold transition"
                        title="Ver formulario completo"
                      >
                        Ver más
                      </Link>
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

      {/* ── CUIDAMOS DE TI (Screenshot 4) ────────────────────────────── */}
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

      {/* ── 3 PASOS / SIMPLE Y CERCANO (Cómo funciona) ─────────────── */}
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

      {/* ── HISTORIAS DE PACIENTES / TESTIMONIOS (100% Español Clínico) ── */}
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

          {/* ── BANNER CTA FINAL: LISTO PARA INICIAR TU RECUPERACIÓN (100% Español) ── */}
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
                <Link
                  href="/reservas"
                  className="rounded-full bg-white hover:bg-stone-50 font-bold text-sm sm:text-base px-8 py-4 shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 transition-all hover:gap-3.5 shrink-0 w-full sm:w-auto active:scale-95"
                  style={{ color: brandPrimary }}
                >
                  <Calendar className="w-5 h-5" style={{ color: brandPrimary }} />
                  <span>Reservar mi evaluación</span>
                  <ArrowRight className="w-5 h-5" style={{ color: brandPrimary }} />
                </Link>

                <div className="flex items-center gap-2 text-xs text-[#A8D3C4]">
                  <MapPin className="w-4 h-4 text-[#84CCB5] shrink-0" />
                  <span>{config.direccion || "Av. Guardia Civil 520, San Borja, Lima"}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── FOOTER DINÁMICO (Screenshot 4) ──────────────────────────── */}
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

      {/* ── MODAL DE ACCESO UNIFICADO ─────────────────────────────── */}
      <LoginPortalModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* ── MODAL DE PRE-RESERVA RÁPIDA ─────────────────────────────── */}
      <QuickPreBookingModal
        isOpen={isPreBookingOpen}
        onClose={() => setIsPreBookingOpen(false)}
        servicios={servicios}
        selectedServicioId={preBookingServiceId}
        config={config}
      />
    </div>
  );
}
