"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { crearPacienteSchema, type CrearPacienteInput } from "@/lib/validations";
import { dbStore, PacienteItem } from "@/lib/store";
import { ServerActionResult } from "./citas";
import { prisma } from "@/lib/prisma";
import { obtenerIpCliente } from "./auditoria";
import { obtenerSesionServidor, requirePermission } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";

export async function obtenerFichaPaciente(id: string) {
  const sesion = await obtenerSesionServidor();
  if (!sesion) return null;
  if (sesion.rol === "PACIENTE") {
    if (sesion.userId !== id) return null;
  } else if (!hasPermission(sesion.rol, "pacientes:ver")) {
    return null;
  }

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
  const sesion = await obtenerSesionServidor();
  if (!sesion || !hasPermission(sesion.rol, "pacientes:ver")) {
    return [];
  }

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
    const sesion = await requirePermission("pacientes:crear");
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

        const initialPassHash = await bcrypt.hash(validated.dni, 10);

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
            passwordHash: initialPassHash,
          },
        });

        await prisma.auditLog.create({
          data: {
            usuarioId: sesion.userId,
            usuarioNombre: sesion.nombre,
            usuarioRol: sesion.rol as any,
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
    await requirePermission("pacientes:paquetes");
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
    await requirePermission("pacientes:crear");
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

export interface ImportarPacienteItemInput {
  tipoDocumento?: "DNI" | "CE" | "PASAPORTE" | "CEDULA" | "OTRO";
  dni: string;
  primerNombre?: string;
  segundoNombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  nombres?: string;
  apellidos?: string;
  telefono: string;
  email?: string;
  fechaNacimiento?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaParentesco?: string;
  contactoEmergenciaTelefono?: string;
  contactoEmergencia?: string;
}

export async function importarPacientesMasivo(
  pacientesList: ImportarPacienteItemInput[]
): Promise<ServerActionResult<{ importados: number; omitidos: number; pacientes: any[] }>> {
  try {
    await requirePermission("pacientes:crear");
    if (!pacientesList || pacientesList.length === 0) {
      return { success: false, error: "La lista de pacientes a importar está vacía." };
    }

    const clientIp = await obtenerIpCliente();
    const sanitizados: any[] = [];
    const dnisSet = new Set<string>();

    for (const p of pacientesList) {
      const cleanDni = (p.dni || "").trim().replace(/\D/g, "");
      if (!cleanDni) continue;
      if (dnisSet.has(cleanDni)) continue; // evitar duplicados dentro del mismo lote
      dnisSet.add(cleanDni);

      const primerNombre = p.primerNombre?.trim() || "";
      const segundoNombre = p.segundoNombre?.trim() || "";
      const apellidoPaterno = p.apellidoPaterno?.trim() || "";
      const apellidoMaterno = p.apellidoMaterno?.trim() || "";

      let nombres = p.nombres?.trim() || [primerNombre, segundoNombre].filter(Boolean).join(" ");
      let apellidos = p.apellidos?.trim() || [apellidoPaterno, apellidoMaterno].filter(Boolean).join(" ");

      if (!nombres) nombres = "Paciente";
      if (!apellidos) apellidos = "Registrado";

      let fechaNac = new Date(p.fechaNacimiento || "1995-01-01");
      if (isNaN(fechaNac.getTime())) fechaNac = new Date("1995-01-01");

      let contactoEmergencia = p.contactoEmergencia?.trim();
      if (!contactoEmergencia && p.contactoEmergenciaNombre) {
        contactoEmergencia = `${p.contactoEmergenciaNombre.trim()}${
          p.contactoEmergenciaParentesco ? ` (${p.contactoEmergenciaParentesco.trim()})` : ""
        }${p.contactoEmergenciaTelefono ? ` - Tel: ${p.contactoEmergenciaTelefono.trim()}` : ""}`;
      }

      sanitizados.push({
        tipoDocumento: p.tipoDocumento || "DNI",
        dni: cleanDni,
        primerNombre: primerNombre || undefined,
        segundoNombre: segundoNombre || undefined,
        apellidoPaterno: apellidoPaterno || undefined,
        apellidoMaterno: apellidoMaterno || undefined,
        nombres,
        apellidos,
        telefono: (p.telefono || "999999999").trim().replace(/\D/g, ""),
        email: p.email?.trim() || undefined,
        fechaNacimiento: fechaNac.toISOString().split("T")[0],
        contactoEmergenciaNombre: p.contactoEmergenciaNombre?.trim() || undefined,
        contactoEmergenciaParentesco: p.contactoEmergenciaParentesco?.trim() || undefined,
        contactoEmergenciaTelefono: p.contactoEmergenciaTelefono?.trim() || undefined,
        contactoEmergencia: contactoEmergencia || undefined,
      });
    }

    let importadosTotal = 0;
    let omitidosTotal = 0;
    const creados: any[] = [];

    // 1. Inserción en PostgreSQL mediante Prisma si está disponible
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const dnisParaChequear = Array.from(dnisSet);
        const yaExistentesDb = await prisma.paciente.findMany({
          where: { dni: { in: dnisParaChequear } },
          select: { dni: true },
        });

        const yaExistentesSet = new Set(yaExistentesDb.map((p) => p.dni));

        for (const item of sanitizados) {
          if (yaExistentesSet.has(item.dni)) {
            omitidosTotal++;
            continue;
          }

          try {
            const nuevoDb = await prisma.paciente.create({
              data: {
                tipoDocumento: item.tipoDocumento,
                dni: item.dni,
                primerNombre: item.primerNombre || null,
                segundoNombre: item.segundoNombre || null,
                apellidoPaterno: item.apellidoPaterno || null,
                apellidoMaterno: item.apellidoMaterno || null,
                nombres: item.nombres,
                apellidos: item.apellidos,
                telefono: item.telefono,
                email: item.email || null,
                fechaNacimiento: new Date(item.fechaNacimiento),
                contactoEmergenciaNombre: item.contactoEmergenciaNombre || null,
                contactoEmergenciaParentesco: item.contactoEmergenciaParentesco || null,
                contactoEmergenciaTelefono: item.contactoEmergenciaTelefono || null,
                contactoEmergencia: item.contactoEmergencia || null,
              },
            });

            creados.push(nuevoDb);
            importadosTotal++;
          } catch {
            omitidosTotal++;
          }
        }

        await prisma.auditLog.create({
          data: {
            accion: "PACIENTES_IMPORTADOS_MASIVO",
            modulo: "HISTORIA_CLINICA",
            entidadId: "batch-import",
            detalles: `Importación masiva: ${importadosTotal} expedientes creados en base de datos (${omitidosTotal} omitidos por DNI duplicado).`,
            ipAddress: clientIp,
          },
        }).catch(() => {});
      } catch (dbErr) {
        console.warn("importarPacientesMasivo db error, usando fallback dbStore:", dbErr);
      }
    }

    // 2. Sincronización en almacén dbStore
    const resStore = dbStore.importarPacientes(sanitizados);
    if (creados.length === 0) {
      importadosTotal = resStore.importados.length;
      omitidosTotal = resStore.omitidos;
      creados.push(...resStore.importados);
    }

    revalidatePath("/dashboard/pacientes");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        importados: importadosTotal,
        omitidos: omitidosTotal,
        pacientes: creados,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error durante la importación masiva.";
    return { success: false, error: message };
  }
}
