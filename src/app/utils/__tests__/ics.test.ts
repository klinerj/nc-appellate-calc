/**
 * ICS File Generation Tests
 *
 * Verifies that generated .ics content is RFC 5545 compliant,
 * contains the correct event data, and properly escapes special
 * characters.
 */

import { describe, it, expect } from "vitest";
import { generateICSContent } from "../ics";

// ─── Helpers ─────────────────────────────────────────────────────

function getICSLine(content: string, prefix: string): string | undefined {
  return content
    .split("\r\n")
    .find((line) => line.startsWith(prefix));
}

function countOccurrences(content: string, search: string): number {
  return content.split(search).length - 1;
}

// ─── Basic Structure ─────────────────────────────────────────────

describe("generateICSContent", () => {
  const basicEvent = {
    date: "2026-04-06",
    summary: "DEADLINE: File Appellee's Brief",
    description: "Test description",
  };

  it("begins with BEGIN:VCALENDAR and ends with END:VCALENDAR", () => {
    const ics = generateICSContent(basicEvent);
    expect(ics.startsWith("BEGIN:VCALENDAR")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR")).toBe(true);
  });

  it("uses CRLF line endings (RFC 5545 requirement)", () => {
    const ics = generateICSContent(basicEvent);
    // Every line should end with \r\n
    expect(ics).toContain("\r\n");
    // No bare \n without preceding \r (except inside escaped \\n)
    const withoutEscaped = ics.replace(/\\n/g, "");
    const lines = withoutEscaped.split("\r\n");
    lines.forEach((line) => {
      expect(line).not.toContain("\n");
    });
  });

  it("contains required calendar properties", () => {
    const ics = generateICSContent(basicEvent);
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("PRODID:-//NC Appellate Deadline Calculator//EN");
    expect(ics).toContain("CALSCALE:GREGORIAN");
    expect(ics).toContain("METHOD:PUBLISH");
  });

  it("contains exactly one VEVENT", () => {
    const ics = generateICSContent(basicEvent);
    expect(countOccurrences(ics, "BEGIN:VEVENT")).toBe(1);
    expect(countOccurrences(ics, "END:VEVENT")).toBe(1);
  });

  it("generates a unique UID", () => {
    const ics = generateICSContent(basicEvent);
    const uidLine = getICSLine(ics, "UID:");
    expect(uidLine).toBeDefined();
    expect(uidLine).toContain("@nc-appellate-calc");
  });

  it("generates a DTSTAMP", () => {
    const ics = generateICSContent(basicEvent);
    const dtstamp = getICSLine(ics, "DTSTAMP:");
    expect(dtstamp).toBeDefined();
    // Should be a UTC timestamp like "20260406T120000Z"
    expect(dtstamp).toMatch(/DTSTAMP:\d{8}T\d{6}Z/);
  });
});

// ─── Date Handling ───────────────────────────────────────────────

describe("ICS date handling", () => {
  it("sets DTSTART as VALUE=DATE for all-day event", () => {
    const ics = generateICSContent({
      date: "2026-04-06",
      summary: "Test",
      description: "Test",
    });
    expect(ics).toContain("DTSTART;VALUE=DATE:20260406");
  });

  it("sets DTEND to the next day (exclusive end for all-day events)", () => {
    const ics = generateICSContent({
      date: "2026-04-06",
      summary: "Test",
      description: "Test",
    });
    expect(ics).toContain("DTEND;VALUE=DATE:20260407");
  });

  it("handles month boundary (last day of month)", () => {
    const ics = generateICSContent({
      date: "2026-04-30",
      summary: "Test",
      description: "Test",
    });
    expect(ics).toContain("DTSTART;VALUE=DATE:20260430");
    expect(ics).toContain("DTEND;VALUE=DATE:20260501");
  });

  it("handles year boundary (December 31)", () => {
    const ics = generateICSContent({
      date: "2026-12-31",
      summary: "Test",
      description: "Test",
    });
    expect(ics).toContain("DTSTART;VALUE=DATE:20261231");
    expect(ics).toContain("DTEND;VALUE=DATE:20270101");
  });

  it("handles leap year boundary (Feb 28 in non-leap year)", () => {
    const ics = generateICSContent({
      date: "2026-02-28",
      summary: "Test",
      description: "Test",
    });
    expect(ics).toContain("DTSTART;VALUE=DATE:20260228");
    expect(ics).toContain("DTEND;VALUE=DATE:20260301");
  });
});

// ─── Content ─────────────────────────────────────────────────────

describe("ICS content", () => {
  it("includes the event summary", () => {
    const ics = generateICSContent({
      date: "2026-04-06",
      summary: "DEADLINE: File Appellee's Brief",
      description: "Test",
    });
    expect(ics).toContain("SUMMARY:DEADLINE: File Appellee's Brief");
  });

  it("includes the event description", () => {
    const ics = generateICSContent({
      date: "2026-04-06",
      summary: "Test",
      description: "Simple description text",
    });
    expect(ics).toContain("DESCRIPTION:Simple description text");
  });

  it("marks event as confirmed and opaque", () => {
    const ics = generateICSContent({
      date: "2026-04-06",
      summary: "Test",
      description: "Test",
    });
    expect(ics).toContain("STATUS:CONFIRMED");
    expect(ics).toContain("TRANSP:OPAQUE");
  });
});

// ─── Description Escaping ────────────────────────────────────────

describe("ICS description escaping", () => {
  it("escapes backslashes", () => {
    const ics = generateICSContent({
      date: "2026-04-06",
      summary: "Test",
      description: "path\\to\\file",
    });
    expect(ics).toContain("DESCRIPTION:path\\\\to\\\\file");
  });

  it("escapes semicolons", () => {
    const ics = generateICSContent({
      date: "2026-04-06",
      summary: "Test",
      description: "Rule 27(a); Rule 27(b)",
    });
    expect(ics).toContain("DESCRIPTION:Rule 27(a)\\; Rule 27(b)");
  });

  it("escapes commas", () => {
    const ics = generateICSContent({
      date: "2026-04-06",
      summary: "Test",
      description: "Saturday, Sunday, or holiday",
    });
    expect(ics).toContain(
      "DESCRIPTION:Saturday\\, Sunday\\, or holiday",
    );
  });

  it("converts newlines to \\n", () => {
    const ics = generateICSContent({
      date: "2026-04-06",
      summary: "Test",
      description: "Line one\nLine two\nLine three",
    });
    expect(ics).toContain("DESCRIPTION:Line one\\nLine two\\nLine three");
  });

  it("escapes all special characters in a realistic description", () => {
    const ics = generateICSContent({
      date: "2026-04-06",
      summary: "Test",
      description:
        "File Appellee's Brief\nRule: Rule 13(a)(1); Rule 27(a)\nDue: April 6, 2026",
    });
    const descLine = getICSLine(ics, "DESCRIPTION:");
    expect(descLine).toBeDefined();
    // Newlines escaped
    expect(descLine).toContain("\\n");
    // Semicolons escaped
    expect(descLine).toContain("\\;");
    // Commas escaped
    expect(descLine).toContain("\\,");
  });
});

// ─── VALARM Reminders ────────────────────────────────────────────

describe("ICS reminders", () => {
  const ics = generateICSContent({
    date: "2026-04-06",
    summary: "Test",
    description: "Test",
  });

  it("includes two VALARM blocks", () => {
    expect(countOccurrences(ics, "BEGIN:VALARM")).toBe(2);
    expect(countOccurrences(ics, "END:VALARM")).toBe(2);
  });

  it("includes a 14-day advance reminder", () => {
    expect(ics).toContain("TRIGGER:-P14D");
    expect(ics).toContain("DESCRIPTION:Filing deadline in 14 days");
  });

  it("includes a 1-day advance reminder", () => {
    expect(ics).toContain("TRIGGER:-P1D");
    expect(ics).toContain("DESCRIPTION:Filing deadline tomorrow");
  });

  it("sets ACTION:DISPLAY for all reminders", () => {
    expect(countOccurrences(ics, "ACTION:DISPLAY")).toBe(2);
  });
});

// ─── Case Name in Summary ────────────────────────────────────────

describe("ICS with case name", () => {
  it("includes case name in the summary when provided via caller", () => {
    // Note: case name is included in the summary by ActionButtons,
    // not by generateICSContent itself. This test verifies the ICS
    // faithfully reproduces whatever summary string is passed in.
    const ics = generateICSContent({
      date: "2026-04-06",
      summary: "DEADLINE: File Appellee's Brief — Smith v. Jones",
      description: "Case: Smith v. Jones\nDue: April 6, 2026",
    });
    expect(ics).toContain(
      "SUMMARY:DEADLINE: File Appellee's Brief — Smith v. Jones",
    );
    expect(ics).toContain("Case: Smith v. Jones");
  });
});
