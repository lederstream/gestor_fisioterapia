"use server";

import { revalidatePath } from "next/cache";
import { crearPacienteSchema, type CrearPacienteInput } from "@/lib/validations";
import { dbStore, PacienteItem } from "@/lib/store";
import { ServerActionResult } from "./citas";
import { prisma } from "@/lib/prisma";
import { obtenerIpCliente } from "./auditoria";

export async function obtenerFichaPaciente(id: string) {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
    try {
      const pac = await prisma.paciente.findUnique({
        where: { id },
        include: {
          tratamientos: {
            include: {
              servicio: true,
              pagos: true,
            },
          },
          citas: {
            include: {
              sala: true,
              terapeuta: true,
              historiaEvolucion: true,
            },
            orderBy: {
              fechaHoraInicio: "desc",
            },
          },
        },
      });

      if (pac) {
        const pacienteFormateado: PacienteItem = {
          id: pac.id,
          tipoDocumento: pac.tipoDocumento as any,
          dni: pac.dni,
          primerNombre: pac.primerNombre || undefined,
          segundoNombre: pac.segundoNombre || undefined,
          apellidoPaterno: pac.apellidoPaterno || undefined,
          apellidoMaterno: pac.apellidoMaterno || undefined,
          nombres: pac.nombres,
          apellidos: pac.apellidos,
          telefono: pac.telefono,
          email: pac.email || undefined,
          fechaNacimiento: pac.fechaNacimiento.toISOString().split("T")[0],
          contactoEmergenciaNombre: pac.contactoEmergenciaNombre || undefined,
          contactoEmergenciaParentesco: pac.contactoEmergenciaParentesco || undefined,
          contactoEmergenciaTelefono: pac.contactoEmergenciaTelefono || undefined,
          contactoEmergencia: pac.contactoEmergencia || undefined,
          createdAt: pac.createdAt.toISOString(),
        };

        const paquetes = pac.tratamientos.map((t) => ({
          id: t.id,
          pacienteId: t.pacienteId,
          servicioId: t.servicioId,
          totalSesiones: t.totalSesiones,
          sesionesConsumidas: t.sesionesConsumidas,
          montoTotal: Number(t.montoTotal),
          montoPagado: Number(t.montoPagado),
          estadoPago: t.estadoPago as any,
          createdAt: t.createdAt.toISOString(),
          servicio: t.servicio ? {
            ...t.servicio,
            precioBase: Number(t.servicio.precioBase),
            precioPromocional: t.servicio.precioPromocional ? Number(t.servicio.precioPromocional) : undefined,
          } : undefined,
          pagos: t.pagos.map((p) => ({
            ...p,
            monto: Number(p.monto),
            fechaPago: p.fechaPago.toISOString(),
          })),
        }));

        const citas = pac.citas.map((c) => ({
          id: c.id,
          paqueteId: c.paqueteId,
          terapeutaId: c.terapeutaId,
          salaId: c.salaId,
          pacienteId: c.pacienteId,
          fechaHoraInicio: c.fechaHoraInicio.toISOString(),
          fechaHoraFin: c.fechaHoraFin.toISOString(),
          estado: c.estado as any,
          esReevaluacion: c.esReevaluacion,
          notasCita: c.notasCita || undefined,
          creadoPorNombre: c.creadoPorNombre || undefined,
          confirmadoPorNombre: c.confirmadoPorNombre || undefined,
          createdAt: c.createdAt.toISOString(),
          sala: c.sala,
          terapeuta: c.terapeuta,
          historiaEvolucion: c.historiaEvolucion ? {
            ...c.historiaEvolucion,
            createdAt: c.historiaEvolucion.createdAt.toISOString(),
          } : undefined,
        }));

        const historialEva = pac.citas
          .filter((c) => c.historiaEvolucion)
          .map((c) => ({
            fecha: c.fechaHoraInicio.toISOString(),
            evaInicio: c.historiaEvolucion!.evaDolorInicio,
            evaFin: c.historiaEvolucion!.evaDolorFin,
            terapeuta: c.terapeuta.nombre,
            citaId: c.id,
            esReevaluacion: c.esReevaluacion,
          }));

        return {
          paciente: pacienteFormateado,
          paquetes,
          citas,
          historialEva,
        };
      }
    } catch (err) {
      console.warn("obtenerFichaPaciente db error, usando fallback dbStore:", err);
    }
  }

  return dbStore.getPacienteById(id);
}

export async function listarPacientes() {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
    try {
      const pacientesDb = await prisma.paciente.findMany({
        include: {
          tratamientos: true,
          citas: true,
        },
        orderBy: {
          apellidos: "asc",
        },
      });

      return pacientesDb.map((pac) => {
        const tieneReevaluacionPendiente = pac.citas.some(
          (c) => c.esReevaluacion && c.estado === "PROGRAMADA"
        );

        return {
          id: pac.id,
          tipoDocumento: (pac.tipoDocumento || "DNI") as any,
          dni: pac.dni,
          primerNombre: pac.primerNombre || undefined,
          segundoNombre: pac.segundoNombre || undefined,
          apellidoPaterno: pac.apellidoPaterno || undefined,
          apellidoMaterno: pac.apellidoMaterno || undefined,
          nombres: pac.nombres,
          apellidos: pac.apellidos,
          telefono: pac.telefono,
          email: pac.email || undefined,
          fechaNacimiento: pac.fechaNacimiento.toISOString().split("T")[0],
          contactoEmergenciaNombre: pac.contactoEmergenciaNombre || undefined,
          contactoEmergenciaParentesco: pac.contactoEmergenciaParentesco || undefined,
          contactoEmergenciaTelefono: pac.contactoEmergenciaTelefono || undefined,
          contactoEmergencia: pac.contactoEmergencia || undefined,
          createdAt: pac.createdAt.toISOString(),
          paquetesCount: pac.tratamientos.length,
          citasCount: pac.citas.length,
          tieneReevaluacionPendiente,
        };
      });
    } catch (err) {
      console.warn("listarPacientes db error, usando fallback dbStore:", err);
    }
  }

  const pacientes = dbStore.getPacientes();
  const paquetes = dbStore.getPaquetes();
  const citas = dbStore.getCitas();

  return pacientes.map((pac) => {
    const misPaquetes = paquetes.filter((p) => p.pacienteId === pac.id);
    const misCitas = citas.filter((c) => c.pacienteId === pac.id);
    const tieneReevaluacionPendiente = misCitas.some((c) => c.esReevaluacion && c.estado === "PROGRAMADA");

    return {
      ...pac,
      paquetesCount: misPaquetes.length,
      citasCount: misCitas.length,
      tieneReevaluacionPendiente,
    };
  });
}

export async function crearPaciente(input: CrearPacienteInput): Promise<ServerActionResult> {
  try {
    const validated = crearPacienteSchema.parse(input);
    const clientIp = await obtenerIpCliente();

    const nombresCompuestos = validated.nombres || [validated.primerNombre, validated.segundoNombre].filter(Boolean).join(" ");
    const apellidosCompuestos = validated.apellidos || [validated.apellidoPaterno, validated.apellidoMaterno].filter(Boolean).join(" ");

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const existe = await prisma.paciente.findUnique({
          where: { dni: validated.dni },
        });

        if (existe) {
          return { success: false, error: `Ya existe un paciente registrado con el DNI ${validated.dni}.` };
        }

        const nuevoDb = await prisma.paciente.create({
          data: {
            tipoDocumento: validated.tipoDocumento || "DNI",
            dni: validated.dni,
            primerNombre: validated.primerNombre || null,
            segundoNombre: validated.segundoNombre || null,
            apellidoPaterno: validated.apellidoPaterno || null,
            apellidoMaterno: validated.apellidoMaterno || null,
            nombres: nombresCompuestos,
            apellidos: apellidosCompuestos,
            telefono: validated.telefono,
            email: validated.email || null,
            fechaNacimiento: new Date(validated.fechaNacimiento),
            contactoEmergenciaNombre: validated.contactoEmergenciaNombre || null,
            contactoEmergenciaParentesco: validated.contactoEmergenciaParentesco || null,
            contactoEmergenciaTelefono: validated.contactoEmergenciaTelefono || null,
            contactoEmergencia: validated.contactoEmergencia || null,
          },
        });

        await prisma.auditLog.create({
          data: {
            accion: "PACIENTE_CREADO",
            modulo: "HISTORIA_CLINICA",
            entidadId: nuevoDb.id,
            detalles: `Paciente ${nuevoDb.nombres} ${nuevoDb.apellidos} (DNI ${nuevoDb.dni}) registrado con éxito.`,
            ipAddress: clientIp,
          },
        });

        revalidatePath("/dashboard/pacientes");
        revalidatePath("/dashboard");
        return { success: true, data: nuevoDb };
      } catch (dbErr: any) {
        if (dbErr.code === "P2002") {
          return { success: false, error: `Ya existe un paciente con el DNI ${validated.dni}.` };
        }
        console.warn("crearPaciente DB error, usando dbStore fallback:", dbErr);
      }
    }

    const nuevo = dbStore.crearPaciente({
      tipoDocumento: validated.tipoDocumento || "DNI",
      dni: validated.dni,
      primerNombre: validated.primerNombre || undefined,
      segundoNombre: validated.segundoNombre || undefined,
      apellidoPaterno: validated.apellidoPaterno || undefined,
      apellidoMaterno: validated.apellidoMaterno || undefined,
      nombres: nombresCompuestos,
      apellidos: apellidosCompuestos,
      telefono: validated.telefono,
      email: validated.email || undefined,
      fechaNacimiento: validated.fechaNacimiento.toISOString().split("T")[0],
      contactoEmergenciaNombre: validated.contactoEmergenciaNombre || undefined,
      contactoEmergenciaParentesco: validated.contactoEmergenciaParentesco || undefined,
      contactoEmergenciaTelefono: validated.contactoEmergenciaTelefono || undefined,
      contactoEmergencia: validated.contactoEmergencia || undefined,
    });

    revalidatePath("/dashboard/pacientes");
    return { success: true, data: nuevo };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al registrar paciente.";
    return { success: false, error: message };
  }
}

export async function asignarPaqueteTratamiento(params: {
  pacienteId: string;
  servicioId: string;
  totalSesiones: number;
  montoTotal: number;
}): Promise<ServerActionResult> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const nuevoPaqDb = await prisma.tratamientoPaquete.create({
          data: {
            pacienteId: params.pacienteId,
            servicioId: params.servicioId,
            totalSesiones: params.totalSesiones,
            montoTotal: params.montoTotal,
            montoPagado: 0,
            estadoPago: "PENDIENTE",
          },
        });

        revalidatePath(`/dashboard/pacientes/${params.pacienteId}`);
        revalidatePath("/dashboard/caja");
        revalidatePath("/dashboard");
        return { success: true, data: nuevoPaqDb };
      } catch (dbErr) {
        console.warn("asignarPaqueteTratamiento db error, usando fallback dbStore:", dbErr);
      }
    }

    const nuevoPaq = dbStore.crearPaquete({
      pacienteId: params.pacienteId,
      servicioId: params.servicioId,
      totalSesiones: params.totalSesiones,
      montoTotal: params.montoTotal,
    });

    revalidatePath(`/dashboard/pacientes/${params.pacienteId}`);
    revalidatePath("/dashboard/caja");
    revalidatePath("/dashboard");

    return { success: true, data: nuevoPaq };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al asignar paquete.";
    return { success: false, error: message };
  }
}

export async function actualizarPaciente(
  id: string,
  data: {
    tipoDocumento?: "DNI" | "CE" | "PASAPORTE" | "CEDULA" | "OTRO";
    dni?: string;
    primerNombre?: string;
    segundoNombre?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    nombres?: string;
    apellidos?: string;
    telefono?: string;
    email?: string;
    contactoEmergenciaNombre?: string;
    contactoEmergenciaParentesco?: string;
    contactoEmergenciaTelefono?: string;
    contactoEmergencia?: string;
  }
): Promise<ServerActionResult> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const actualizadoDb = await prisma.paciente.update({
          where: { id },
          data: {
            ...data,
          },
        });

        revalidatePath(`/dashboard/pacientes/${id}`);
        revalidatePath("/dashboard/pacientes");
        return { success: true, data: actualizadoDb };
      } catch (dbErr) {
        console.warn("actualizarPaciente db error, usando fallback dbStore:", dbErr);
      }
    }

    const actualizado = dbStore.actualizarPaciente(id, data);
    revalidatePath(`/dashboard/pacientes/${id}`);
    revalidatePath("/dashboard/pacientes");
    return { success: true, data: actualizado };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al actualizar paciente.";
    return { success: false, error: message };
  }
}
