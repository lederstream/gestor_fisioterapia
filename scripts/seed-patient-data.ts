import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function seedPatientData() {
  console.log("🌱 Sembrando datos para Alexander Saavedra en Supabase...");

  const paciente = await prisma.paciente.findFirst({
    where: { dni: "45892011" },
  });

  if (!paciente) {
    console.error("No se encontró el paciente Alexander Saavedra.");
    return;
  }

  const terapeuta = await prisma.user.findFirst({
    where: { rol: "TERAPEUTA" },
  });

  const sala = await prisma.sala.findFirst();
  const servicio = await prisma.servicio.findFirst();

  if (!terapeuta || !sala || !servicio) {
    console.error("Faltan terapeuta, sala o servicio en Supabase.");
    return;
  }

  // 1. Paquete de tratamiento
  let paquete = await prisma.tratamientoPaquete.findFirst({
    where: { pacienteId: paciente.id },
  });

  if (!paquete) {
    paquete = await prisma.tratamientoPaquete.create({
      data: {
        pacienteId: paciente.id,
        servicioId: servicio.id,
        totalSesiones: 10,
        sesionesConsumidas: 4,
        montoTotal: 700.0,
        montoPagado: 700.0,
        estadoPago: "PAGADO",
      },
    });
    console.log("✅ Paquete de 10 sesiones creado:", paquete.id);
  }

  // 2. Pagos
  const pagosCount = await prisma.pago.count({
    where: { paqueteId: paquete.id },
  });

  if (pagosCount === 0) {
    await prisma.pago.create({
      data: {
        paqueteId: paquete.id,
        monto: 700.0,
        metodoPago: "YAPE",
        numeroOperacion: "YAP-892104",
        estado: "VERIFICADO",
        fechaPago: new Date("2026-10-15T09:30:00Z"),
      },
    });
    console.log("✅ Pago registrado en Supabase.");
  }

  // 3. Citas de Alexander Saavedra
  const citasCount = await prisma.cita.count({
    where: { pacienteId: paciente.id },
  });

  if (citasCount === 0) {
    // Cita 1: Atendida
    const cita1 = await prisma.cita.create({
      data: {
        pacienteId: paciente.id,
        paqueteId: paquete.id,
        terapeutaId: terapeuta.id,
        salaId: sala.id,
        fechaHoraInicio: new Date("2026-10-16T08:00:00Z"),
        fechaHoraFin: new Date("2026-10-16T08:45:00Z"),
        estado: "ATENDIDA",
        creadoPorNombre: "Alexander Saavedra",
        confirmadoPorNombre: "Karin Palacios",
      },
    });

    // Historia evolución 1
    await prisma.historiaEvolucion.create({
      data: {
        citaId: cita1.id,
        terapeutaId: terapeuta.id,
        evaDolorInicio: 8,
        evaDolorFin: 5,
        tratamientoAplicado: "Evaluación postural, terapia manual descompresiva lumbosacra y punción seca guiada.",
        notasReevaluacion: "Paciente responde adecuadamente a terapia manual.",
        bloqueaAlta: false,
      },
    });

    // Cita 2: Atendida
    const cita2 = await prisma.cita.create({
      data: {
        pacienteId: paciente.id,
        paqueteId: paquete.id,
        terapeutaId: terapeuta.id,
        salaId: sala.id,
        fechaHoraInicio: new Date("2026-10-19T08:00:00Z"),
        fechaHoraFin: new Date("2026-10-19T08:45:00Z"),
        estado: "ATENDIDA",
        creadoPorNombre: "Alexander Saavedra",
        confirmadoPorNombre: "Karin Palacios",
      },
    });

    // Historia evolución 2
    await prisma.historiaEvolucion.create({
      data: {
        citaId: cita2.id,
        terapeutaId: terapeuta.id,
        evaDolorInicio: 5,
        evaDolorFin: 3,
        tratamientoAplicado: "Neuromodulación no invasiva, ejercicios de estabilización de core y termoterapia profunda.",
        notasReevaluacion: "Gran progreso. Movilidad de columna lumbar al 85%.",
        bloqueaAlta: false,
      },
    });

    // Cita 3: Próxima cita programada
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    mañana.setHours(9, 0, 0, 0);

    const finMañana = new Date(mañana);
    finMañana.setMinutes(45);

    await prisma.cita.create({
      data: {
        pacienteId: paciente.id,
        paqueteId: paquete.id,
        terapeutaId: terapeuta.id,
        salaId: sala.id,
        fechaHoraInicio: mañana,
        fechaHoraFin: finMañana,
        estado: "PROGRAMADA",
        creadoPorNombre: "Alexander Saavedra",
        confirmadoPorNombre: "Karin Palacios",
      },
    });

    console.log("✅ Citas e historias clínicas sembradas en Supabase.");
  }

  console.log("🎉 Datos clínicos de Alexander Saavedra listos en Supabase.");
}

seedPatientData()
  .catch((err) => {
    console.error("Error sembrando datos:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
