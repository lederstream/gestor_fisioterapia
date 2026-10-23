import { DashboardShell } from "@/components/layout/DashboardShell";
import { obtenerSesionServidor } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await obtenerSesionServidor();

  if (!sesion) {
    redirect("/login");
  }

  const initialUser = {
    id: sesion.userId,
    nombre: sesion.nombre,
    email: sesion.email,
    rol: sesion.rol,
    especialidad: sesion.especialidad,
    isPaciente: sesion.isPaciente,
  };

  return <DashboardShell initialUser={initialUser}>{children}</DashboardShell>;
}
