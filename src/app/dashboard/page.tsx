import { dbStore } from "@/lib/store";
import { DashboardPageClient } from "./DashboardPageClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
    try {
      const [
        citasDb,
        salasDb,
        pacientesDb,
        paquetesDb,
        pagosDb,
        auditLogsDb,
        historiasDb,
        terapeutasDb,
        serviciosDb,
      ] = await Promise.all([
        prisma.cita.findMany({
          include: {
            paciente: true,
            sala: true,
            terapeuta: true,
            paquete: {
              include: { servicio: true },
            },
          },
          orderBy: { fechaHoraInicio: "asc" },
        }),
        prisma.sala.findMany({ orderBy: { nombre: "asc" } }),
        prisma.paciente.findMany({ orderBy: { apellidos: "asc" } }),
        prisma.tratamientoPaquete.findMany({
          include: { paciente: true, servicio: true },
        }),
        prisma.pago.findMany({ orderBy: { fechaPago: "desc" } }),
        prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
        prisma.historiaEvolucion.findMany({ take: 20 }),
        prisma.user.findMany({ where: { rol: { in: ["TERAPEUTA", "ASISTENTE"] } } }),
        prisma.servicio.findMany({ orderBy: { orden: "asc" } }),
      ]);

      const citas = citasDb.map((c) => ({
        id: c.id,
        paqueteId: c.paqueteId,
        terapeutaId: c.terapeutaId,
        salaId: c.salaId,
        pacienteId: c.pacienteId,
        fechaHoraInicio: c.fechaHoraInicio.toISOString(),
        fechaHoraFin: c.fechaHoraFin.toISOString(),
        estado: c.estado,
        esReevaluacion: c.esReevaluacion,
        creadoPorNombre: c.creadoPorNombre || undefined,
        confirmadoPorNombre: c.confirmadoPorNombre || undefined,
        createdAt: c.createdAt.toISOString(),
        paciente: c.paciente ? {
          ...c.paciente,
          fechaNacimiento: c.paciente.fechaNacimiento.toISOString().split("T")[0],
          createdAt: c.paciente.createdAt.toISOString(),
        } : undefined,
        sala: c.sala,
        terapeuta: c.terapeuta,
        paquete: c.paquete ? {
          ...c.paquete,
          montoTotal: Number(c.paquete.montoTotal),
          montoPagado: Number(c.paquete.montoPagado),
          createdAt: c.paquete.createdAt.toISOString(),
        } : undefined,
      }));

      const salas = salasDb.map((s) => ({
        id: s.id,
        nombre: s.nombre,
        estado: s.estado,
        capacidadSimultanea: 1,
      }));

      const pacientes = pacientesDb.map((p) => ({
        id: p.id,
        tipoDocumento: p.tipoDocumento,
        dni: p.dni,
        primerNombre: p.primerNombre || undefined,
        segundoNombre: p.segundoNombre || undefined,
        apellidoPaterno: p.apellidoPaterno || undefined,
        apellidoMaterno: p.apellidoMaterno || undefined,
        nombres: p.nombres,
        apellidos: p.apellidos,
        telefono: p.telefono,
        email: p.email || undefined,
        fechaNacimiento: p.fechaNacimiento.toISOString().split("T")[0],
        contactoEmergencia: p.contactoEmergencia || undefined,
        createdAt: p.createdAt.toISOString(),
      }));

      const paquetes = paquetesDb.map((pa) => ({
        id: pa.id,
        pacienteId: pa.pacienteId,
        servicioId: pa.servicioId,
        totalSesiones: pa.totalSesiones,
        sesionesConsumidas: pa.sesionesConsumidas,
        montoTotal: Number(pa.montoTotal),
        montoPagado: Number(pa.montoPagado),
        estadoPago: pa.estadoPago,
        createdAt: pa.createdAt.toISOString(),
        paciente: pa.paciente ? {
          ...pa.paciente,
          fechaNacimiento: pa.paciente.fechaNacimiento.toISOString().split("T")[0],
          createdAt: pa.paciente.createdAt.toISOString(),
        } : undefined,
        servicio: pa.servicio ? {
          ...pa.servicio,
          precioBase: Number(pa.servicio.precioBase),
          precioPromocional: pa.servicio.precioPromocional ? Number(pa.servicio.precioPromocional) : undefined,
        } : undefined,
      }));

      const pagos = pagosDb.map((p) => ({
        id: p.id,
        paqueteId: p.paqueteId,
        monto: Number(p.monto),
        metodoPago: p.metodoPago,
        numeroOperacion: p.numeroOperacion || null,
        comprobanteUrl: p.comprobanteUrl || null,
        estado: p.estado,
        fechaPago: p.fechaPago.toISOString(),
      }));

      const auditLogs = auditLogsDb.map((a) => ({
        id: a.id,
        usuarioId: a.usuarioId,
        usuarioNombre: a.usuarioNombre,
        usuarioRol: a.usuarioRol,
        accion: a.accion,
        modulo: a.modulo,
        entidadId: a.entidadId,
        detalles: a.detalles,
        ipAddress: a.ipAddress || undefined,
        createdAt: a.createdAt.toISOString(),
      }));

      const historias = historiasDb.map((h) => ({
        id: h.id,
        citaId: h.citaId,
        terapeutaId: h.terapeutaId,
        evaDolorInicio: h.evaDolorInicio,
        evaDolorFin: h.evaDolorFin,
        tratamientoAplicado: h.tratamientoAplicado,
        notasReevaluacion: h.notasReevaluacion || null,
        bloqueaAlta: h.bloqueaAlta,
        createdAt: h.createdAt.toISOString(),
      }));

      const terapeutas = terapeutasDb.map((t) => ({
        id: t.id,
        nombre: t.nombre,
        email: t.email,
        rol: t.rol,
        especialidad: t.especialidad || undefined,
        estado: t.estado,
      }));

      const servicios = serviciosDb.map((s) => ({
        ...s,
        precioBase: Number(s.precioBase),
        precioPromocional: s.precioPromocional ? Number(s.precioPromocional) : undefined,
      }));

      return (
        <DashboardPageClient
          citas={citas}
          salas={salas}
          pacientes={pacientes}
          paquetes={paquetes}
          pagos={pagos}
          auditLogs={auditLogs}
          historias={historias}
          terapeutas={terapeutas}
          servicios={servicios}
        />
      );
    } catch (err) {
      console.warn("DashboardPage: Error al leer datos de Supabase, usando dbStore:", err);
    }
  }

  const citas = dbStore.getCitas();
  const salas = dbStore.getSalas();
  const pacientes = dbStore.getPacientes();
  const paquetes = dbStore.getPaquetes();
  const pagos = dbStore.getPagos();
  const auditLogs = dbStore.getAuditLogs().slice(0, 5);
  const historias = dbStore.getHistorias();
  const terapeutas = dbStore.getTerapeutas();
  const servicios = dbStore.getServicios();

  return (
    <DashboardPageClient
      citas={citas}
      salas={salas}
      pacientes={pacientes}
      paquetes={paquetes}
      pagos={pagos}
      auditLogs={auditLogs}
      historias={historias}
      terapeutas={terapeutas}
      servicios={servicios}
    />
  );
}
