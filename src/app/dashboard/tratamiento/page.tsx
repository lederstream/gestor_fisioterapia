import { obtenerSesionServidor } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { dbStore } from "@/lib/store";
import { PatientTratamientoView } from "@/components/pacientes/PatientTratamientoView";
import { obtenerConfiguracionCompleta } from "@/server/actions/configuracion";

export const dynamic = "force-dynamic";

export default async function TratamientoPage() {
  const sesion = await obtenerSesionServidor();
  const configData = await obtenerConfiguracionCompleta();

  let paciente: any = null;
  let paquetes: any[] = [];
  let historias: any[] = [];

  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
    try {
      if (sesion?.userId) {
        paciente = await prisma.paciente.findUnique({
          where: { id: sesion.userId },
          include: {
            tratamientos: {
              include: { servicio: true },
            },
            citas: {
              include: { historiaEvolucion: true },
            },
          },
        });
      }

      if (!paciente) {
        paciente = await prisma.paciente.findFirst({
          include: {
            tratamientos: {
              include: { servicio: true },
            },
            citas: {
              include: { historiaEvolucion: true },
            },
          },
        });
      }

      if (paciente) {
        paquetes = paciente.tratamientos.map((t: any) => ({
          ...t,
          montoTotal: Number(t.montoTotal),
          montoPagado: Number(t.montoPagado),
          createdAt: t.createdAt.toISOString(),
          servicio: t.servicio ? {
            ...t.servicio,
            precioBase: Number(t.servicio.precioBase),
            precioPromocional: t.servicio.precioPromocional ? Number(t.servicio.precioPromocional) : undefined,
          } : undefined,
        }));

        historias = paciente.citas
          .filter((c: any) => c.historiaEvolucion)
          .map((c: any) => ({
            ...c.historiaEvolucion,
            createdAt: c.historiaEvolucion.createdAt.toISOString(),
          }));
      }
    } catch (err) {
      console.warn("TratamientoPage db error, usando fallback dbStore:", err);
    }
  }

  if (!paciente) {
    paciente = dbStore.getPacientes()[0] || null;
    if (paciente) {
      paquetes = dbStore.getPaquetes().filter((paq) => paq.pacienteId === paciente?.id);
      const citas = dbStore.getCitas().filter((c) => c.pacienteId === paciente?.id);
      historias = dbStore.getHistorias().filter((h) => citas.some((c) => c.id === h.citaId));
    }
  }

  return (
    <PatientTratamientoView
      paquetes={paquetes}
      historias={historias}
      paciente={paciente}
      salas={configData.salas}
      terapeutas={configData.personal.filter((p) => p.rol === "TERAPEUTA")}
      servicios={configData.servicios}
    />
  );
}
