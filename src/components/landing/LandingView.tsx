"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { LoginPortalModal } from "@/components/auth/LoginPortalModal";
import { QuickPreBookingModal } from "@/components/reservas/QuickPreBookingModal";
import { ConfiguracionClinicaItem, ServicioItem, SalaItem, TestimonioItem } from "@/lib/store";

import { LandingHeader } from "./sections/LandingHeader";
import { LandingHero } from "./sections/LandingHero";
import { LandingValueStrip } from "./sections/LandingValueStrip";
import { LandingServices } from "./sections/LandingServices";
import { LandingAbout } from "./sections/LandingAbout";
import { LandingSteps } from "./sections/LandingSteps";
import { LandingTestimonials } from "./sections/LandingTestimonials";
import { LandingFooter } from "./sections/LandingFooter";

interface LandingViewProps {
  config: ConfiguracionClinicaItem;
  servicios: ServicioItem[];
  salas: SalaItem[];
}

export function LandingView({ config, servicios, salas }: LandingViewProps) {
  const { isAuthenticated, currentRole, currentUser } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPreBookingOpen, setIsPreBookingOpen] = useState(false);
  const [preBookingServiceId, setPreBookingServiceId] = useState<string | undefined>(undefined);

  const handleOpenQuickBooking = (servicioId?: string) => {
    setPreBookingServiceId(servicioId);
    setIsPreBookingOpen(true);
  };

  // Paleta de Marca Blanca Dinámica
  const brandPrimary = config?.colorPrimario || "#0C3E37";
  const brandSecondary = config?.colorSecundario || "#E07052";
  const brandAccent = config?.colorAcento || "#0D9488";

  // Salas activas para la insignia dinámica
  const salasDisponibles = salas.filter((s) => s.estado === "DISPONIBLE").length || 6;

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

  const defaultTestimonios: TestimonioItem[] = [
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
      nombre: "Carlos R.",
      calificacion: 5,
      ocupacion: "Fisioterapia Deportiva (Running)",
      comentario: "Excelente trato y evaluación personalizada. La reevaluación cada 5 sesiones me dio la seguridad total de que mi rodilla estaba lista para volver a competir.",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80",
    },
    {
      id: "t3",
      nombre: "Elena P.",
      calificacion: 5,
      ocupacion: "Terapia Postural y Cervical",
      comentario: "Las salas individuales y la puntualidad marcan una diferencia enorme. Desde la primera sesión de magnetoterapia sentí alivio. ¡Recomendadísimo!",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80",
    },
  ];

  const testimoniosList: TestimonioItem[] =
    config?.testimonios && config.testimonios.length > 0
      ? config.testimonios
      : defaultTestimonios;

  // Cálculo inteligente del estado operativo de la clínica en tiempo real (Zona Horaria Perú)
  const clinicStatus = (() => {
    const dayKeys = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const now = new Date();
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
      {/* 1. Header / Navbar */}
      <LandingHeader
        config={config}
        brandPrimary={brandPrimary}
        isAuthenticated={isAuthenticated}
        currentRole={currentRole}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenQuickBooking={() => handleOpenQuickBooking()}
      />

      {/* 2. Hero Section */}
      <LandingHero
        config={config}
        brandPrimary={brandPrimary}
        whatsappHref={whatsappHref}
        clinicStatus={clinicStatus}
        onOpenQuickBooking={() => handleOpenQuickBooking()}
      />

      {/* 3. Value Pillars Strip */}
      <LandingValueStrip config={config} />

      {/* 4. Services Grid */}
      <LandingServices
        servicios={servicios}
        brandPrimary={brandPrimary}
        onOpenQuickBooking={handleOpenQuickBooking}
      />

      {/* 5. About / Cuidamos de ti */}
      <LandingAbout
        config={config}
        salasDisponibles={salasDisponibles}
      />

      {/* 6. Steps / Cómo Funciona */}
      <LandingSteps />

      {/* 7. Testimonials & Final CTA */}
      <LandingTestimonials
        config={config}
        brandPrimary={brandPrimary}
        brandAccent={brandAccent}
        testimoniosList={testimoniosList}
        onOpenQuickBooking={() => handleOpenQuickBooking()}
      />

      {/* 8. Footer & Mobile Sticky Bar */}
      <LandingFooter
        config={config}
        brandSecondary={brandSecondary}
        whatsappHref={whatsappHref}
        googleMapsHref={googleMapsHref}
        salasDisponibles={salasDisponibles}
        renderHorariosList={renderHorariosList}
        onOpenQuickBooking={() => handleOpenQuickBooking()}
      />

      {/* Modales de Interacción */}
      <LoginPortalModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

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
