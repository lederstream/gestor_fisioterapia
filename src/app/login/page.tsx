import { Metadata } from "next";
import { obtenerConfiguracionClinica } from "@/server/actions/configuracion";
import { LoginPageClient } from "@/components/auth/LoginPageClient";
import { dbStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  let clinicName = "AJ Fisioterapia";
  try {
    const config = await obtenerConfiguracionClinica();
    if (config?.nombreComercial) clinicName = config.nombreComercial;
  } catch {}

  return {
    title: `Iniciar Sesión | Portal Clínico ${clinicName}`,
    description: `Acceso privado para pacientes, terapeutas y administración de ${clinicName} en San Borja.`,
  };
}

export default async function LoginPage() {
  let config = dbStore.getConfiguracion();
  try {
    const fetched = await obtenerConfiguracionClinica();
    if (fetched) config = fetched;
  } catch (err) {
    console.warn("LoginPage: Error al cargar configuracion, usando dbStore:", err);
  }

  return <LoginPageClient config={config} />;
}
