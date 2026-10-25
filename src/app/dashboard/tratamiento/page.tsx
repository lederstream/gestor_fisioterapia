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
      const searchCriteria: any[] = [];
      if (sesion?.userId) searchCriteria.push({ id: sesion.userId });
      if (sesion?.email) searchCriteria.push({ email: { equals: sesion.email, mode: "insensitive" } });

      if (searchCriteria.length > 0) {
        paciente = await prisma.paciente.findFirst({
          where: { OR: searchCriteria },
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
    const todosPacientes = dbStore.getPacientes();
    paciente = todosPacientes.find(
      (p) => p.id === sesion?.userId || (sesion?.email && p.email?.toLowerCase() === sesion.email.toLowerCase())
    ) || todosPacientes[0] || null;

    if (paciente) {
      paquetes = dbStore.getPaquetes().filter((paq) => paq.pacienteId === paciente?.id);
      const citas = dbStore.getCitas().filter((c) => c.pacienteId === paciente?.id);
      historias = dbStore.getHistorias().filter((h) => citas.some((c) => c.id === h.citaId));
    }
  }

  // Garantía defensiva de objeto paciente
  if (!paciente) {
    paciente = {
      id: sesion?.userId || "usr-pac-1",
      nombres: sesion?.nombre?.split(" ")[0] || "Alexander",
      apellidos: sesion?.nombre?.split(" ").slice(1).join(" ") || "Saavedra",
      email: sesion?.email || "alexander.saavedra@gmail.com",
      telefono: "987123456",
      dni: "45892011",
    };
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
