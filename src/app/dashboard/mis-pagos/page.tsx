import { obtenerSesionServidor } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { dbStore } from "@/lib/store";
import { PatientPagosView } from "@/components/pacientes/PatientPagosView";
import { obtenerConfiguracionCompleta } from "@/server/actions/configuracion";

export const dynamic = "force-dynamic";

export default async function MisPagosPage() {
  const sesion = await obtenerSesionServidor();
  const configData = await obtenerConfiguracionCompleta();

  let paciente: any = null;
  let paquetes: any[] = [];
  let pagos: any[] = [];

  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
    try {
      if (sesion?.userId) {
        paciente = await prisma.paciente.findUnique({
          where: { id: sesion.userId },
          include: {
            tratamientos: {
              include: {
                servicio: true,
                pagos: true,
              },
            },
          },
        });
      }

      if (!paciente) {
        paciente = await prisma.paciente.findFirst({
          include: {
            tratamientos: {
              include: {
                servicio: true,
                pagos: true,
              },
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

        pagos = paciente.tratamientos.flatMap((t: any) =>
          t.pagos.map((p: any) => ({
            ...p,
            monto: Number(p.monto),
            fechaPago: p.fechaPago.toISOString(),
            paquete: t,
            servicio: t.servicio,
          }))
        );
      }
    } catch (err) {
      console.warn("MisPagosPage db error, usando fallback dbStore:", err);
    }
  }

  if (!paciente) {
    paciente = dbStore.getPacientes()[0] || null;
    if (paciente) {
      paquetes = dbStore.getPaquetes().filter((paq) => paq.pacienteId === paciente?.id);
      pagos = dbStore.getPagos().filter((p) => paquetes.some((paq) => paq.id === p.paqueteId));
    }
  }

  return (
    <PatientPagosView
      pagos={pagos}
      paquetes={paquetes}
      paciente={paciente}
      servicios={configData.servicios}
    />
  );
}
