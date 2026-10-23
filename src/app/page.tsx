import { Metadata } from "next";
import { obtenerConfiguracionCompleta } from "@/server/actions/configuracion";
import { LandingView } from "@/components/landing/LandingView";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { configuracion } = await obtenerConfiguracionCompleta();

  const title = `${configuracion?.nombreComercial || "AJ Fisioterapia"} | ${configuracion?.slogan || "Rehabilitación & Bienestar"}`;
  const description = configuracion?.descripcionHero || "Fisioterapia especializada y humana para recuperar tu bienestar, paso a paso.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_PE",
      siteName: configuracion?.nombreComercial || "AJ Fisioterapia",
    },
    icons: {
      icon: configuracion?.faviconUrl || "/favicon.ico",
    },
  };
}

export default async function HomePage() {
  const { configuracion, servicios, salas } = await obtenerConfiguracionCompleta();

  return (
    <LandingView
      config={configuracion}
      servicios={servicios}
      salas={salas}
    />
  );
}
