"use server";

import { revalidatePath } from "next/cache";
import { registrarPagoSchema, type RegistrarPagoInput } from "@/lib/validations";
import { dbStore, PagoItem, TratamientoPaqueteItem } from "@/lib/store";
import { ServerActionResult } from "./citas";

/**
 * Server Action: registrarPago()
 * Regla de Caja y Cobranzas:
 * 1. Registra el pago en la entidad 'pagos'.
 * 2. Actualiza el acumulado 'monto_pagado' en el paquete.
 * 3. Calcula automáticamente si el estado pasa a 'PARCIAL' o 'PAGADO'.
 */
export async function registrarPago(
  input: RegistrarPagoInput
): Promise<ServerActionResult<{ pago: PagoItem; paquete: TratamientoPaqueteItem }>> {
  try {
    const validated = registrarPagoSchema.parse(input);

    const resultado = dbStore.registrarPago({
      paqueteId: validated.paqueteId,
      monto: validated.monto,
      metodoPago: validated.metodoPago,
      numeroOperacion: validated.numeroOperacion,
      comprobanteUrl: validated.comprobanteUrl,
      estado: validated.estado,
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
