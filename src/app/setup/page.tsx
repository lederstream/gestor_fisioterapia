import { Metadata } from "next";
import { verificarEstadoSistema } from "@/server/actions/setup";
import { obtenerConfiguracionClinica } from "@/server/actions/configuracion";
import { SetupWizardClient } from "@/components/setup/SetupWizardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inicialización del Sistema Clínico | Setup Administrador",
  description: "Asistente de arranque seguro para configurar el Administrador Principal del centro de fisioterapia.",
};

export default async function SetupPage() {
  const [status, config] = await Promise.all([
    verificarEstadoSistema(),
    obtenerConfiguracionClinica(),
  ]);

  return <SetupWizardClient status={status} config={config} />;
}
