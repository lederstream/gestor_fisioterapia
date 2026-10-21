"use server";

import { revalidatePath } from "next/cache";
import { registrarPagoSchema, type RegistrarPagoInput } from "@/lib/validations";
import { dbStore, PagoItem, TratamientoPaqueteItem } from "@/lib/store";
import { ServerActionResult } from "./citas";
import { obtenerIpCliente } from "./auditoria";

import { prisma } from "@/lib/prisma";

/**
 * Server Action: registrarPago()
 * Regla de Caja y Cobranzas:
 * 1. Registra el pago en la entidad 'pagos'.
 * 2. Valida unicidad estricta para evitar comprobantes duplicados (Yape/Plin/POS).
 * 3. Actualiza el acumulado 'monto_pagado' en el paquete.
 * 4. Calcula automáticamente si el estado pasa a 'PARCIAL' o 'PAGADO'.
 * 5. Ejecuta transacción atómica si PostgreSQL está conectado.
 */
export async function registrarPago(
  input: RegistrarPagoInput,
  usuarioAuditoria?: { id?: string; nombre: string; rol: any }
): Promise<ServerActionResult<{ pago: PagoItem; paquete: TratamientoPaqueteItem }>> {
  try {
    const validated = registrarPagoSchema.parse(input);
    const clientIp = await obtenerIpCliente();
    const numOp = validated.numeroOperacion?.trim() || null;

    // Si hay base de datos real conectada (Supabase / Neon), ejecutar en transacción atómica
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const txResult = await prisma.$transaction(async (tx: any) => {
          // Validar duplicidad de comprobante en DB
          if (numOp) {
            const opExiste = await tx.pago.findFirst({
              where: { numeroOperacion: numOp },
            });
            if (opExiste) {
              throw new Error(`El número de operación "${numOp}" ya fue registrado previamente en otra cobranza.`);
            }
          }

          const paquete = await tx.tratamientoPaquete.findUnique({
            where: { id: validated.paqueteId },
          });
          if (!paquete) throw new Error("El paquete de sesiones no existe.");

          const nuevoPago = await tx.pago.create({
            data: {
              paqueteId: validated.paqueteId,
              monto: validated.monto,
              metodoPago: validated.metodoPago,
              numeroOperacion: numOp || `${validated.metodoPago}-${Date.now().toString().slice(-6)}`,
              comprobanteUrl: validated.comprobanteUrl,
              estado: validated.estado || "VERIFICADO",
            },
          });

          const nuevoMontoPagado = Number(paquete.montoPagado) + validated.monto;
          let nuevoEstadoPago: "PENDIENTE" | "PARCIAL" | "PAGADO" = "PENDIENTE";
          if (nuevoMontoPagado >= Number(paquete.montoTotal)) {
            nuevoEstadoPago = "PAGADO";
          } else if (nuevoMontoPagado > 0) {
            nuevoEstadoPago = "PARCIAL";
          }

          const paqueteActualizado = await tx.tratamientoPaquete.update({
            where: { id: validated.paqueteId },
            data: {
              montoPagado: nuevoMontoPagado,
              estadoPago: nuevoEstadoPago,
            },
          });

          await tx.auditLog.create({
            data: {
              usuarioId: usuarioAuditoria?.id,
              usuarioNombre: usuarioAuditoria?.nombre || "Caja AJ Fisioterapia",
              usuarioRol: usuarioAuditoria?.rol || "RECEPCION",
              accion: "PAGO_REGISTRADO",
              modulo: "CAJA",
              entidadId: nuevoPago.id,
              detalles: `Cobranza de S/. ${validated.monto.toFixed(2)} (${validated.metodoPago}, Op: ${nuevoPago.numeroOperacion}). Estado: ${nuevoEstadoPago}.`,
              ipAddress: clientIp,
            },
          });

          return {
            pago: nuevoPago as unknown as PagoItem,
            paquete: paqueteActualizado as unknown as TratamientoPaqueteItem,
          };
        });

        // Sincronizar en memoria
        dbStore.registrarPago({
          paqueteId: validated.paqueteId,
          monto: validated.monto,
          metodoPago: validated.metodoPago,
          numeroOperacion: validated.numeroOperacion,
          comprobanteUrl: validated.comprobanteUrl,
          estado: validated.estado,
          usuarioAuditoria,
          ipAddress: clientIp,
        });

        revalidatePath("/dashboard/caja");
        revalidatePath(`/dashboard/pacientes/${txResult.paquete.pacienteId}`);
        revalidatePath("/dashboard");

        return { success: true, data: txResult };
      } catch (dbErr: any) {
        if (dbErr.message && !dbErr.message.includes("connect") && !dbErr.message.includes("Can't reach database")) {
          return { success: false, error: dbErr.message };
        }
      }
    }

    const resultado = dbStore.registrarPago({
      paqueteId: validated.paqueteId,
      monto: validated.monto,
      metodoPago: validated.metodoPago,
      numeroOperacion: validated.numeroOperacion,
      comprobanteUrl: validated.comprobanteUrl,
      estado: validated.estado,
      usuarioAuditoria,
      ipAddress: clientIp,
    });

    revalidatePath("/dashboard/caja");
    revalidatePath(`/dashboard/pacientes/${resultado.paquete.pacienteId}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      data: resultado,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al procesar el pago.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Obtener consolidado y transacciones de caja
 */
export async function obtenerReporteCaja() {
  const pagos = dbStore.getPagos();
  const paquetes = dbStore.getPaquetes();
  const pacientes = dbStore.getPacientes();
  const servicios = dbStore.getServicios();

  // Enriquecer pagos con datos de paciente y servicio
  const transacciones = pagos.map((pago) => {
    const paquete = paquetes.find((pa) => pa.id === pago.paqueteId);
    const paciente = paquete ? pacientes.find((p) => p.id === paquete.pacienteId) : null;
    const servicio = paquete ? servicios.find((s) => s.id === paquete.servicioId) : null;

    return {
      ...pago,
      paciente,
      paquete,
      servicio,
    };
  }).sort((a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime());

  // Métricas agregadas
  const totalRecaudado = pagos.reduce((acc, curr) => acc + curr.monto, 0);
  const totalEfectivo = pagos.filter((p) => p.metodoPago === "EFECTIVO").reduce((acc, c) => acc + c.monto, 0);
  const totalYape = pagos.filter((p) => p.metodoPago === "YAPE").reduce((acc, c) => acc + c.monto, 0);
  const totalPlin = pagos.filter((p) => p.metodoPago === "PLIN").reduce((acc, c) => acc + c.monto, 0);
  const totalPos = pagos.filter((p) => p.metodoPago === "POS").reduce((acc, c) => acc + c.monto, 0);

  // Deuda total pendiente por cobrar en todos los paquetes
  const deudaPendiente = paquetes.reduce((acc, paq) => {
    const saldo = paq.montoTotal - paq.montoPagado;
    return acc + (saldo > 0 ? saldo : 0);
  }, 0);

  return {
    totalRecaudado,
    totalEfectivo,
    totalYape,
    totalPlin,
    totalPos,
    deudaPendiente,
    transacciones,
    paquetesConSaldo: paquetes
      .filter((pa) => pa.estadoPago !== "PAGADO")
      .map((pa) => ({
        ...pa,
        paciente: pacientes.find((p) => p.id === pa.pacienteId),
        servicio: servicios.find((s) => s.id === pa.servicioId),
      })),
  };
}
