import { obtenerSesionServidor } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { dbStore } from "@/lib/store";
import { PatientCitasView } from "@/components/pacientes/PatientCitasView";
import { obtenerConfiguracionCompleta } from "@/server/actions/configuracion";

export const dynamic = "force-dynamic";

export default async function MisCitasPage() {
  const sesion = await obtenerSesionServidor();
  const configData = await obtenerConfiguracionCompleta();

  let paciente: any = null;
  let citas: any[] = [];
  let paquetes: any[] = [];

  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
    try {
      if (sesion?.userId) {
        paciente = await prisma.paciente.findUnique({
          where: { id: sesion.userId },
          include: {
            citas: {
              include: { sala: true, terapeuta: true },
              orderBy: { fechaHoraInicio: "desc" },
            },
            tratamientos: {
              include: { servicio: true },
            },
          },
        });
      }

      if (!paciente) {
        // Fallback al primer paciente existente en base de datos si es vista previa
        paciente = await prisma.paciente.findFirst({
          include: {
            citas: {
              include: { sala: true, terapeuta: true },
              orderBy: { fechaHoraInicio: "desc" },
            },
            tratamientos: {
              include: { servicio: true },
            },
          },
        });
      }

      if (paciente) {
        citas = paciente.citas.map((c: any) => ({
          ...c,
          fechaHoraInicio: c.fechaHoraInicio.toISOString(),
          fechaHoraFin: c.fechaHoraFin.toISOString(),
          createdAt: c.createdAt.toISOString(),
        }));
        paquetes = paciente.tratamientos.map((t: any) => ({
          ...t,
          montoTotal: Number(t.montoTotal),
          montoPagado: Number(t.montoPagado),
          createdAt: t.createdAt.toISOString(),
        }));
      }
    } catch (err) {
      console.warn("MisCitasPage db error, usando fallback dbStore:", err);
    }
  }

  if (!paciente) {
    paciente = dbStore.getPacientes()[0] || null;
    if (paciente) {
      citas = dbStore.getCitas().filter((c) => c.pacienteId === paciente?.id);
      paquetes = dbStore.getPaquetes().filter((paq) => paq.pacienteId === paciente?.id);
    }
  }

  return (
    <PatientCitasView
      citas={citas}
      salas={configData.salas}
      personal={configData.personal}
      paciente={paciente}
      paquetes={paquetes}
      servicios={configData.servicios}
    />
  );
}
