export interface CalendarEventDetails {
  title: string;
  description?: string;
  location?: string;
  startDate: Date | string;
  endDate: Date | string;
}

/**
 * Genera la URL para agregar un evento a Google Calendar
 */
export function createGoogleCalendarUrl(event: CalendarEventDetails): string {
  const start = new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const end = new Date(event.endDate).toISOString().replace(/-|:|\.\d\d\d/g, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description || "",
    location: event.location || "AJ Fisioterapia, Av. Guardia Civil 520, San Borja, Lima",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Descarga un archivo universal .ics compatible con Apple Calendar, Outlook y dispositivos móviles
 */
export function downloadIcsFile(event: CalendarEventDetails, filename = "cita-fisioterapia.ics") {
  const formatDateForIcs = (d: Date | string) => {
    return new Date(d).toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AJ Fisioterapia//Gestor Fisioterapia//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `SUMMARY:${event.title.replace(/\n/g, " ")}`,
    `DESCRIPTION:${(event.description || "").replace(/\n/g, "\\n")}`,
    `LOCATION:${(event.location || "AJ Fisioterapia, San Borja").replace(/\n/g, ", ")}`,
    `DTSTART:${formatDateForIcs(event.startDate)}`,
    `DTEND:${formatDateForIcs(event.endDate)}`,
    `STATUS:CONFIRMED`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
