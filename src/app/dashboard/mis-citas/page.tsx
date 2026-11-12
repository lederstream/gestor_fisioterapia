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
      const searchCriteria: any[] = [];
      if (sesion?.userId) searchCriteria.push({ id: sesion.userId });
      if (sesion?.email) searchCriteria.push({ email: { equals: sesion.email, mode: "insensitive" } });

      if (searchCriteria.length > 0) {
        paciente = await prisma.paciente.findFirst({
          where: { OR: searchCriteria },
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

      if (!paciente && sesion && sesion.rol !== "PACIENTE") {
        // Fallback al primer paciente existente en base de datos solo en vista previa administrativa
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
    const todosPacientes = dbStore.getPacientes();
    paciente = todosPacientes.find(
      (p) => p.id === sesion?.userId || (sesion?.email && p.email?.toLowerCase() === sesion.email.toLowerCase())
    ) || (sesion && sesion.rol !== "PACIENTE" ? todosPacientes[0] : null) || null;

    if (paciente) {
      citas = dbStore.getCitas().filter((c) => c.pacienteId === paciente?.id);
      paquetes = dbStore.getPaquetes().filter((paq) => paq.pacienteId === paciente?.id);
    }
  }

  // Garantía defensiva de objeto paciente para evitar que PatientCitasView o PatientBookingModal queden en null
  if (!paciente) {
    paciente = {
      id: sesion?.userId || "pac-preview",
      nombres: sesion?.nombre?.split(" ")[0] || "Paciente",
      apellidos: sesion?.nombre?.split(" ").slice(1).join(" ") || "Titular",
      email: sesion?.email || "paciente@clinica.pe",
      telefono: "999999999",
      dni: "00000000",
    };
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
