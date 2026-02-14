/**
 * ICS File Generation
 *
 * Generates RFC 5545 compliant .ics files for all-day calendar events.
 * No external library needed — an all-day VEVENT is ~20 lines of text.
 *
 * Includes two VALARM reminders:
 *   - 14 days before (gives time to prepare a brief)
 *   - 1 day before (final reminder)
 */

interface ICSEventInput {
  /** ISO date string for the event, e.g., "2026-04-06" */
  date: string;
  /** Event title, e.g., "DEADLINE: File Appellee's Brief" */
  summary: string;
  /** Multi-line description (audit trail, rule info, etc.) */
  description: string;
}

/**
 * Generates the text content of an .ics file for an all-day event.
 */
export function generateICSContent(event: ICSEventInput): string {
  const uid = `${Date.now()}-${Math.random().toString(36).substring(2)}@nc-appellate-calc`;
  const dtstamp = formatICSTimestamp(new Date());

  // All-day event: DTSTART is the event day, DTEND is the next day (exclusive)
  const dtstart = event.date.replace(/-/g, "");
  const [y, m, d] = event.date.split("-").map(Number);
  const nextDay = new Date(y, m - 1, d + 1, 12, 0, 0);
  const dtend = [
    nextDay.getFullYear(),
    String(nextDay.getMonth() + 1).padStart(2, "0"),
    String(nextDay.getDate()).padStart(2, "0"),
  ].join("");

  // ICS requires special escaping: backslash, semicolon, comma, newlines
  const escapedDesc = event.description
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NC Appellate Deadline Calculator//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${dtstart}`,
    `DTEND;VALUE=DATE:${dtend}`,
    `SUMMARY:${event.summary}`,
    `DESCRIPTION:${escapedDesc}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    // Reminder: 14 days before
    "BEGIN:VALARM",
    "TRIGGER:-P14D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Filing deadline in 14 days",
    "END:VALARM",
    // Reminder: 1 day before
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Filing deadline tomorrow",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}

/**
 * Triggers a file download of the .ics content in the browser.
 */
export function downloadICS(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function formatICSTimestamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
