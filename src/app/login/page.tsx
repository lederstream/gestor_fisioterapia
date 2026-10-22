import { Metadata } from "next";
import { obtenerConfiguracionClinica } from "@/server/actions/configuracion";
import { LoginPageClient } from "@/components/auth/LoginPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const config = await obtenerConfiguracionClinica();
  const clinicName = config?.nombreComercial || "AJ Fisioterapia";

  return {
    title: `Iniciar Sesión | Portal Clínico ${clinicName}`,
    description: `Acceso privado para pacientes, terapeutas y administración de ${clinicName} en San Borja.`,
  };
}

export default async function LoginPage() {
  const config = await obtenerConfiguracionClinica();

  return <LoginPageClient config={config} />;
}
