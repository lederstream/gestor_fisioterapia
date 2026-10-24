"use server";

import { revalidatePath } from "next/cache";
import { dbStore, ConfiguracionClinicaItem } from "@/lib/store";
import { ServerActionResult } from "./citas";
import { prisma } from "@/lib/prisma";

export async function obtenerConfiguracionClinica(): Promise<ConfiguracionClinicaItem> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      const configDb = await prisma.configuracionClinica.findFirst();
      if (configDb) {
        const item: ConfiguracionClinicaItem = {
          id: configDb.id,
          razonSocial: configDb.razonSocial,
          nombreComercial: configDb.nombreComercial,
          slogan: configDb.slogan || "REHABILITACIÓN & BIENESTAR",
          tituloHero: configDb.tituloHero || "Vuelve a moverte.",
          subtituloHero: configDb.subtituloHero || "Vuelve a sentirte tú.",
          descripcionHero: configDb.descripcionHero || "Fisioterapia especializada y humana para recuperar tu bienestar, paso a paso.",
          ruc: configDb.ruc,
          direccionAvenidaCalle: configDb.direccionAvenidaCalle || undefined,
          direccionNumero: configDb.direccionNumero || undefined,
          direccionDistrito: configDb.direccionDistrito || undefined,
          direccionCiudad: configDb.direccionCiudad || undefined,
          direccionReferencia: configDb.direccionReferencia || undefined,
          direccion: configDb.direccion,
          telefono: configDb.telefono,
          whatsapp: configDb.whatsapp,
          googleMapsUrl: configDb.googleMapsUrl || undefined,
          horaApertura: configDb.horaApertura,
          horaCierre: configDb.horaCierre,
          intervaloMinutos: configDb.intervaloMinutos,
          horariosSemana: (configDb.horariosSemana as any) || undefined,
          frecuenciaReevaluacion: configDb.frecuenciaReevaluacion,
          bloqueoAltaReevaluacion: configDb.bloqueoAltaReevaluacion,
          totalSalasFisicas: configDb.totalSalasFisicas,
          ratingPromedio: configDb.ratingPromedio ? Number(configDb.ratingPromedio) : 4.9,
          totalPacientesMes: configDb.totalPacientesMes || "+1,100",
          testimonios: (configDb.testimonios as any) || undefined,
          logoUrl: configDb.logoUrl || undefined,
          faviconUrl: configDb.faviconUrl || undefined,
          heroImageUrl: configDb.heroImageUrl || undefined,
          colorPrimario: configDb.colorPrimario || "#0C3E37",
          colorSecundario: configDb.colorSecundario || "#E07052",
          colorAcento: configDb.colorAcento || "#0D9488",
          updatedAt: configDb.updatedAt ? configDb.updatedAt.toISOString() : new Date().toISOString(),
        };
        dbStore.actualizarConfiguracion(item);
        return item;
      }
    }
  } catch (err) {
    console.warn("Configuracion: No se pudo leer de Prisma/Supabase, usando dbStore:", err);
  }
  return dbStore.getConfiguracion();
}

export async function obtenerConfiguracionCompleta() {
  const configuracion = await obtenerConfiguracionClinica();
  let salas = dbStore.getSalas();
  let servicios = dbStore.getServicios();
  let personal = dbStore.getUsers();

  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      const [salasDb, serviciosDb, personalDb] = await Promise.all([
        prisma.sala.findMany(),
        prisma.servicio.findMany({ orderBy: { orden: "asc" } }),
        prisma.user.findMany(),
      ]);

      if (salasDb && salasDb.length > 0) {
        salas = salasDb.map((s) => ({
          id: s.id,
          nombre: s.nombre,
          estado: s.estado as "DISPONIBLE" | "MANTENIMIENTO",
          capacidadSimultanea: 1,
        }));
      }

      if (serviciosDb && serviciosDb.length > 0) {
        servicios = serviciosDb.map((s) => ({
          id: s.id,
          nombre: s.nombre,
          categoriaTag: s.categoriaTag || "DOLOR & MOVILIDAD",
          descripcion: s.descripcion || "",
          duracionMinutos: s.duracionMinutos,
          precioBase: Number(s.precioBase),
          precioPromocional: s.precioPromocional ? Number(s.precioPromocional) : undefined,
          textoPromocion: s.textoPromocion || undefined,
          imagenUrl: s.imagenUrl || undefined,
          mostrarEnWeb: s.mostrarEnWeb !== false,
          orden: s.orden ?? 1,
        }));
      }

      if (personalDb && personalDb.length > 0) {
        personal = personalDb.map((u) => ({
          id: u.id,
          nombre: u.nombre,
          email: u.email,
          rol: u.rol as any,
          especialidad: u.especialidad || undefined,
          estado: u.estado as any,
        }));
      }
    }
  } catch (err) {
    console.warn("ConfiguracionCompleta: Error consultando Supabase vía Prisma, fallback a dbStore:", err);
  }

  return {
    configuracion,
    salas,
    servicios,
    personal,
  };
}

export async function guardarConfiguracionClinica(
  data: Partial<ConfiguracionClinicaItem>
): Promise<ServerActionResult<ConfiguracionClinicaItem>> {
  try {
    const actualizada = dbStore.actualizarConfiguracion(data, {
      id: "usr-admin-1",
      nombre: "Marco Yana (Administrador)",
      rol: "ADMIN",
    });

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const existingConfig = await prisma.configuracionClinica.findFirst();
        const targetId = existingConfig?.id || "config-principal";

        await prisma.configuracionClinica.upsert({
          where: { id: targetId },
          update: {
            ...(data.razonSocial !== undefined ? { razonSocial: data.razonSocial } : {}),
            ...(data.nombreComercial !== undefined ? { nombreComercial: data.nombreComercial } : {}),
            ...(data.slogan !== undefined ? { slogan: data.slogan } : {}),
            ...(data.tituloHero !== undefined ? { tituloHero: data.tituloHero } : {}),
            ...(data.subtituloHero !== undefined ? { subtituloHero: data.subtituloHero } : {}),
            ...(data.descripcionHero !== undefined ? { descripcionHero: data.descripcionHero } : {}),
            ...(data.ruc !== undefined ? { ruc: data.ruc } : {}),
            ...(data.direccion !== undefined ? { direccion: data.direccion } : {}),
            ...(data.direccionAvenidaCalle !== undefined ? { direccionAvenidaCalle: data.direccionAvenidaCalle } : {}),
            ...(data.direccionNumero !== undefined ? { direccionNumero: data.direccionNumero } : {}),
            ...(data.direccionDistrito !== undefined ? { direccionDistrito: data.direccionDistrito } : {}),
            ...(data.direccionCiudad !== undefined ? { direccionCiudad: data.direccionCiudad } : {}),
            ...(data.direccionReferencia !== undefined ? { direccionReferencia: data.direccionReferencia } : {}),
            ...(data.telefono !== undefined ? { telefono: data.telefono } : {}),
            ...(data.whatsapp !== undefined ? { whatsapp: data.whatsapp } : {}),
            ...(data.googleMapsUrl !== undefined ? { googleMapsUrl: data.googleMapsUrl } : {}),
            ...(data.horaApertura !== undefined ? { horaApertura: data.horaApertura } : {}),
            ...(data.horaCierre !== undefined ? { horaCierre: data.horaCierre } : {}),
            ...(data.intervaloMinutos !== undefined ? { intervaloMinutos: data.intervaloMinutos } : {}),
            ...(data.horariosSemana !== undefined ? { horariosSemana: data.horariosSemana as any } : {}),
            ...(data.frecuenciaReevaluacion !== undefined ? { frecuenciaReevaluacion: data.frecuenciaReevaluacion } : {}),
            ...(data.bloqueoAltaReevaluacion !== undefined ? { bloqueoAltaReevaluacion: data.bloqueoAltaReevaluacion } : {}),
            ...(data.totalSalasFisicas !== undefined ? { totalSalasFisicas: data.totalSalasFisicas } : {}),
            ...(data.ratingPromedio !== undefined ? { ratingPromedio: data.ratingPromedio } : {}),
            ...(data.totalPacientesMes !== undefined ? { totalPacientesMes: data.totalPacientesMes } : {}),
            ...(data.testimonios !== undefined ? { testimonios: data.testimonios as any } : {}),
            ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl } : {}),
            ...(data.faviconUrl !== undefined ? { faviconUrl: data.faviconUrl } : {}),
            ...(data.heroImageUrl !== undefined ? { heroImageUrl: data.heroImageUrl } : {}),
            ...(data.colorPrimario !== undefined ? { colorPrimario: data.colorPrimario } : {}),
            ...(data.colorSecundario !== undefined ? { colorSecundario: data.colorSecundario } : {}),
            ...(data.colorAcento !== undefined ? { colorAcento: data.colorAcento } : {}),
          },
          create: {
            id: targetId,
            razonSocial: data.razonSocial || "AJ Fisioterapia S.A.C.",
            nombreComercial: data.nombreComercial || "AJ Fisioterapia",
            slogan: data.slogan || "REHABILITACIÓN & BIENESTAR",
            tituloHero: data.tituloHero || "Vuelve a moverte.",
            subtituloHero: data.subtituloHero || "Vuelve a sentirte tú.",
            descripcionHero: data.descripcionHero || "Fisioterapia especializada y humana para recuperar tu bienestar, paso a paso.",
            ruc: data.ruc || "20608912345",
            direccion: data.direccion || "Av. Guardia Civil 520, San Borja, Lima",
            telefono: data.telefono || "(01) 475-2010",
            whatsapp: data.whatsapp || "+51 987 654 321",
            colorPrimario: data.colorPrimario || "#0C3E37",
            colorSecundario: data.colorSecundario || "#E07052",
            colorAcento: data.colorAcento || "#0D9488",
          },
        });
      } catch (dbErr) {
        console.warn("No se pudo persistir en Supabase Prisma, manteniendo en dbStore:", dbErr);
      }
    }

    revalidatePath("/");
    revalidatePath("/dashboard/configuracion");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/agenda");
    revalidatePath("/reservas");
    revalidatePath("/login");

    return { success: true, data: actualizada };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al guardar configuración.";
    return { success: false, error: message };
  }
}

export async function cambiarEstadoSala(
  salaId: string,
  nuevoEstado: "DISPONIBLE" | "MANTENIMIENTO",
  motivo?: string
): Promise<ServerActionResult> {
  try {
    const sala = dbStore.actualizarEstadoSala(salaId, nuevoEstado, motivo);

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        await prisma.sala.update({
          where: { id: salaId },
          data: { estado: nuevoEstado as any },
        });
      } catch (dbErr) {
        console.warn("Error actualizando sala en Prisma:", dbErr);
      }
    }

    revalidatePath("/dashboard/agenda");
    revalidatePath("/dashboard/configuracion");
    revalidatePath("/dashboard");
    return { success: true, data: sala };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al cambiar estado de sala.";
    return { success: false, error: message };
  }
}

export async function modificarServicio(
  servicioId: string,
  precioBase: number,
  duracionMinutos: number,
  dataExtra?: {
    nombre?: string;
    categoriaTag?: string;
    descripcion?: string;
    precioPromocional?: number;
    textoPromocion?: string;
    imagenUrl?: string;
    mostrarEnWeb?: boolean;
    orden?: number;
  }
): Promise<ServerActionResult> {
  try {
    const servicio = dbStore.actualizarServicio(
      servicioId, 
      precioBase, 
      duracionMinutos, 
      dataExtra
    );

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        await prisma.servicio.update({
          where: { id: servicioId },
          data: {
            ...(dataExtra?.nombre ? { nombre: dataExtra.nombre } : {}),
            precioBase,
            duracionMinutos,
            ...(dataExtra?.categoriaTag !== undefined ? { categoriaTag: dataExtra.categoriaTag } : {}),
            ...(dataExtra?.descripcion !== undefined ? { descripcion: dataExtra.descripcion } : {}),
            ...(dataExtra?.precioPromocional !== undefined ? { precioPromocional: dataExtra.precioPromocional } : {}),
            ...(dataExtra?.textoPromocion !== undefined ? { textoPromocion: dataExtra.textoPromocion } : {}),
            ...(dataExtra?.imagenUrl !== undefined ? { imagenUrl: dataExtra.imagenUrl } : {}),
            ...(dataExtra?.mostrarEnWeb !== undefined ? { mostrarEnWeb: dataExtra.mostrarEnWeb } : {}),
            ...(dataExtra?.orden !== undefined ? { orden: dataExtra.orden } : {}),
          },
        });
      } catch (dbErr) {
        console.warn("Error actualizando servicio en Prisma:", dbErr);
      }
    }

    revalidatePath("/");
    revalidatePath("/dashboard/configuracion");
    revalidatePath("/reservas");
    return { success: true, data: servicio };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al actualizar servicio.";
    return { success: false, error: message };
  }
}

export async function cambiarEstadoPersonal(
  usuarioId: string,
  estado: "ACTIVO" | "INACTIVO",
  especialidad?: string
): Promise<ServerActionResult> {
  try {
    const usuario = dbStore.actualizarUsuario(usuarioId, estado, especialidad);

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        await prisma.user.update({
          where: { id: usuarioId },
          data: {
            estado: estado as any,
            ...(especialidad ? { especialidad } : {}),
          },
        });
      } catch (dbErr) {
        console.warn("Error actualizando usuario en Prisma:", dbErr);
      }
    }

    revalidatePath("/dashboard/configuracion");
    return { success: true, data: usuario };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al actualizar personal.";
    return { success: false, error: message };
  }
}

export async function crearNuevaSala(
  nombre: string,
  equipamiento?: string
): Promise<ServerActionResult> {
  try {
    const cleanNombre = nombre.trim();
    if (!cleanNombre) {
      return { success: false, error: "El nombre de la sala es obligatorio." };
    }

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const existe = await prisma.sala.findUnique({
          where: { nombre: cleanNombre },
        });
        if (existe) {
          return { success: false, error: `Ya existe una sala registrada con el nombre "${cleanNombre}".` };
        }

        const nuevaDb = await prisma.sala.create({
          data: {
            nombre: cleanNombre,
            estado: "DISPONIBLE",
          },
        });

        const totalSalas = await prisma.sala.count();
        const config = await prisma.configuracionClinica.findFirst();
        if (config) {
          await prisma.configuracionClinica.update({
            where: { id: config.id },
            data: { totalSalasFisicas: totalSalas },
          });
        }

        revalidatePath("/dashboard/agenda");
        revalidatePath("/dashboard/configuracion");
        revalidatePath("/dashboard");
        revalidatePath("/reservas");

        return {
          success: true,
          data: {
            id: nuevaDb.id,
            nombre: nuevaDb.nombre,
            estado: nuevaDb.estado,
            equipamiento: equipamiento || "Camilla clínica estándar",
            capacidadSimultanea: 1,
          },
        };
      } catch (dbErr: any) {
        console.error("Error creando sala en Prisma:", dbErr);
        return { success: false, error: "No se pudo registrar la sala en la base de datos." };
      }
    }

    const sala = dbStore.crearSala(cleanNombre, equipamiento);
    revalidatePath("/dashboard/agenda");
    revalidatePath("/dashboard/configuracion");
    revalidatePath("/dashboard");
    return { success: true, data: sala };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al registrar nueva sala.";
    return { success: false, error: message };
  }
}

export async function editarDatosSala(
  salaId: string,
  nombre: string,
  equipamiento?: string
): Promise<ServerActionResult> {
  try {
    const cleanNombre = nombre.trim();
    if (!cleanNombre) {
      return { success: false, error: "El nombre de la sala no puede estar vacío." };
    }

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const actualizada = await prisma.sala.update({
          where: { id: salaId },
          data: { nombre: cleanNombre },
        });

        revalidatePath("/dashboard/agenda");
        revalidatePath("/dashboard/configuracion");
        revalidatePath("/dashboard");
        revalidatePath("/reservas");

        return {
          success: true,
          data: {
            id: actualizada.id,
            nombre: actualizada.nombre,
            estado: actualizada.estado,
            equipamiento: equipamiento || "Camilla clínica estándar",
            capacidadSimultanea: 1,
          },
        };
      } catch (dbErr: any) {
        console.error("Error editando sala en Prisma:", dbErr);
        return { success: false, error: "No se pudo actualizar el nombre de la sala." };
      }
    }

    const sala = dbStore.editarSala(salaId, cleanNombre, equipamiento);
    revalidatePath("/dashboard/agenda");
    revalidatePath("/dashboard/configuracion");
    return { success: true, data: sala };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al actualizar sala.";
    return { success: false, error: message };
  }
}

export async function eliminarSala(salaId: string): Promise<ServerActionResult> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const citasCount = await prisma.cita.count({
          where: { salaId },
        });

        if (citasCount > 0) {
          return {
            success: false,
            error: `Esta sala tiene ${citasCount} cita(s) agendada(s). En su lugar, puedes ponerla en estado MANTENIMIENTO para inhabilitarla sin perder el historial clínico.`,
          };
        }

        await prisma.sala.delete({
          where: { id: salaId },
        });

        const totalSalas = await prisma.sala.count();
        const config = await prisma.configuracionClinica.findFirst();
        if (config) {
          await prisma.configuracionClinica.update({
            where: { id: config.id },
            data: { totalSalasFisicas: totalSalas },
          });
        }

        revalidatePath("/dashboard/agenda");
        revalidatePath("/dashboard/configuracion");
        revalidatePath("/dashboard");
        revalidatePath("/reservas");

        return { success: true };
      } catch (dbErr: any) {
        console.error("Error eliminando sala en Prisma:", dbErr);
        return { success: false, error: "No se pudo eliminar la sala de la base de datos." };
      }
    }

    const eliminada = dbStore.eliminarSala(salaId);
    revalidatePath("/dashboard/agenda");
    revalidatePath("/dashboard/configuracion");
    revalidatePath("/dashboard");
    return { success: true, data: eliminada };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al eliminar sala.";
    return { success: false, error: message };
  }
}

export async function crearNuevoServicio(
  nombre: string,
  precioBase: number,
  duracionMinutos: number,
  dataExtra?: {
    categoriaTag?: string;
    descripcion?: string;
    precioPromocional?: number;
    textoPromocion?: string;
    imagenUrl?: string;
    mostrarEnWeb?: boolean;
    orden?: number;
  }
): Promise<ServerActionResult> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const nuevoDb = await prisma.servicio.create({
          data: {
            nombre: nombre.trim(),
            duracionMinutos,
            precioBase,
            categoriaTag: dataExtra?.categoriaTag || "DOLOR & MOVILIDAD",
            descripcion: dataExtra?.descripcion || null,
            precioPromocional: dataExtra?.precioPromocional !== undefined ? dataExtra.precioPromocional : null,
            textoPromocion: dataExtra?.textoPromocion || null,
            imagenUrl: dataExtra?.imagenUrl || null,
            mostrarEnWeb: dataExtra?.mostrarEnWeb !== false,
            orden: dataExtra?.orden ?? 1,
          },
        });

        revalidatePath("/");
        revalidatePath("/dashboard/configuracion");
        revalidatePath("/reservas");

        return {
          success: true,
          data: {
            id: nuevoDb.id,
            nombre: nuevoDb.nombre,
            categoriaTag: nuevoDb.categoriaTag || "DOLOR & MOVILIDAD",
            descripcion: nuevoDb.descripcion || "",
            duracionMinutos: nuevoDb.duracionMinutos,
            precioBase: Number(nuevoDb.precioBase),
            precioPromocional: nuevoDb.precioPromocional ? Number(nuevoDb.precioPromocional) : undefined,
            textoPromocion: nuevoDb.textoPromocion || undefined,
            imagenUrl: nuevoDb.imagenUrl || undefined,
            mostrarEnWeb: nuevoDb.mostrarEnWeb,
            orden: nuevoDb.orden,
          },
        };
      } catch (dbErr: any) {
        console.error("Error creando servicio en Prisma:", dbErr);
        return { success: false, error: "No se pudo registrar el servicio en la base de datos." };
      }
    }

    const servicio = dbStore.crearServicio(nombre, precioBase, duracionMinutos, dataExtra);
    revalidatePath("/");
    revalidatePath("/dashboard/configuracion");
    revalidatePath("/reservas");
    return { success: true, data: servicio };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al crear nuevo servicio.";
    return { success: false, error: message };
  }
}

export async function eliminarServicio(servicioId: string): Promise<ServerActionResult> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        await prisma.servicio.delete({
          where: { id: servicioId },
        });

        revalidatePath("/");
        revalidatePath("/dashboard/configuracion");
        revalidatePath("/reservas");
        return { success: true };
      } catch (dbErr: any) {
        console.error("Error eliminando servicio en Prisma:", dbErr);
        return { success: false, error: "No se pudo eliminar el servicio." };
      }
    }

    const eliminado = dbStore.eliminarServicio(servicioId);
    revalidatePath("/");
    revalidatePath("/dashboard/configuracion");
    revalidatePath("/reservas");
    return { success: true, data: eliminado };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al eliminar servicio.";
    return { success: false, error: message };
  }
}
