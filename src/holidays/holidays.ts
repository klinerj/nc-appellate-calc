/**
 * Holiday & Weekend Detection Module
 *
 * Provides functions to determine if a date is a business day
 * and to roll deadlines forward past weekends and NC judicial holidays.
 *
 * All dates are represented as ISO strings ("YYYY-MM-DD") to avoid
 * timezone bugs. Internally, dates are constructed at noon local time
 * to prevent DST transitions from shifting the calendar date.
 */

import { getHolidaysForYear, getSupportedYears } from "./nc-holidays";

// ─── Date Helpers ─────────────────────────────────────────────────

/**
 * Parses an ISO date string to a Date object at noon local time.
 * Using noon (not midnight) prevents DST edge cases from shifting
 * the date forward or backward.
 */
function toDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

/**
 * Converts a Date object back to an ISO date string ("YYYY-MM-DD").
 * Uses local date parts to match the noon-local-time construction.
 */
function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Adds N calendar days to an ISO date string.
 */
export function addDaysToDate(isoDate: string, days: number): string {
  const date = toDate(isoDate);
  date.setDate(date.getDate() + days);
  return toISO(date);
}

/**
 * Returns true if the date falls on a Saturday or Sunday.
 */
export function isWeekend(isoDate: string): boolean {
  const dayOfWeek = toDate(isoDate).getDay(); // 0=Sun, 6=Sat
  return dayOfWeek === 0 || dayOfWeek === 6;
}

/**
 * Returns true if the date is an NC Judicial Branch holiday.
 */
export function isHoliday(isoDate: string): boolean {
  const year = parseInt(isoDate.substring(0, 4), 10);
  return getHolidaysForYear(year).has(isoDate);
}

/**
 * Returns true if the date is a non-business day (weekend or holiday).
 */
export function isNonBusinessDay(isoDate: string): boolean {
  return isWeekend(isoDate) || isHoliday(isoDate);
}

/**
 * Returns the human-readable reason why a date is not a business day.
 * Returns null if the date IS a business day.
 */
export function getNonBusinessDayReason(isoDate: string): string | null {
  const weekend = isWeekend(isoDate);
  const holiday = isHoliday(isoDate);

  if (holiday && weekend) {
    return `${getDayOfWeekName(isoDate)} (judicial holiday and weekend)`;
  }
  if (holiday) {
    return `${getDayOfWeekName(isoDate)} (judicial holiday)`;
  }
  if (weekend) {
    return `${getDayOfWeekName(isoDate)} (weekend)`;
  }
  return null;
}

/**
 * Rolls a date forward to the next business day if it falls on a
 * weekend or NC Judicial Branch holiday.
 *
 * Returns the final date, whether it was rolled, and all the
 * intermediate reasons (for the audit trail).
 */
export function rollForwardToBusinessDay(isoDate: string): {
  date: string;
  rolled: boolean;
  steps: string[];
} {
  let current = isoDate;
  const steps: string[] = [];

  while (isNonBusinessDay(current)) {
    const reason = getNonBusinessDayReason(current);
    if (reason) {
      steps.push(`${current} is ${reason}`);
    }
    current = addDaysToDate(current, 1);
  }

  return {
    date: current,
    rolled: current !== isoDate,
    steps,
  };
}

/**
 * Returns the full day-of-week name for a date (e.g., "Monday").
 */
export function getDayOfWeekName(isoDate: string): string {
  return toDate(isoDate).toLocaleDateString("en-US", { weekday: "long" });
}

/**
 * Formats an ISO date string for human display.
 * "2026-04-06" → "April 6, 2026"
 */
export function formatDate(isoDate: string): string {
  return toDate(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Returns true if holiday data is available for the year of the given date.
 * Used by the engine to warn when computing deadlines in unsupported years.
 */
export function isYearSupported(isoDate: string): boolean {
  const year = parseInt(isoDate.substring(0, 4), 10);
  return getSupportedYears().includes(year);
}
