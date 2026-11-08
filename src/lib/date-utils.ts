/**
 * Utilidades Centralizadas de Fecha y Hora Sincronizadas con la Zona Horaria de Perú (America/Lima, UTC-5).
 * San Borja, Lima, Perú.
 */

export const PERU_TIMEZONE = "America/Lima";

/**
 * Obtiene la fecha en formato YYYY-MM-DD correspondiente a la hora legal de Perú.
 */
export function getPeruDateString(date: Date | string | number = new Date()): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
  
  // Usar Intl con formato 'en-CA' garantiza formato estándar YYYY-MM-DD en la zona horaria especificada
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PERU_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Convierte un componente fecha "YYYY-MM-DD" y hora "HH:mm" seleccionados por el usuario
 * en un objeto Date con el offset estricto de Perú (-05:00).
 */
export function createPeruDate(dateStr: string, timeStr: string): Date {
  const normalizedTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  // Lima está permanentemente en UTC-5 (no aplica horario de verano)
  return new Date(`${dateStr}T${normalizedTime}-05:00`);
}

/**
 * Obtiene la hora entera (0 a 23) de una fecha según la zona horaria de Perú.
 */
export function getPeruHour(date: Date | string | number): number {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return 0;
  
  const hourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: PERU_TIMEZONE,
    hour: "numeric",
    hour12: false,
  }).format(d);
  
  // en-US con hour12: false puede devolver "24" a la medianoche según la versión de Node/V8
  const parsed = parseInt(hourStr, 10);
  return parsed === 24 ? 0 : parsed;
}

/**
 * Formatea una hora para visualización clínica en Perú (ej: "09:00 AM", "04:30 PM" o 24h).
 */
export function formatPeruTime(
  date: Date | string | number,
  format: "12h" | "24h" = "12h"
): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "--:--";

  if (format === "24h") {
    return new Intl.DateTimeFormat("es-PE", {
      timeZone: PERU_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  }

  return new Intl.DateTimeFormat("es-PE", {
    timeZone: PERU_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/**
 * Formatea la fecha completa en español para títulos y reportes (ej: "Sábado, 7 de noviembre de 2026").
 */
export function formatPeruDateFull(date: Date | string | number = new Date()): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: PERU_TIMEZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

