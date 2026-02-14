/**
 * NC Judicial Branch Holiday Data
 *
 * Static dataset of dates when NC courts are closed for transactions.
 * Source: https://www.nccourts.gov/holiday-schedule
 *
 * IMPORTANT: This data must be verified annually against the official
 * NC Judicial Branch holiday schedule. The module interface is designed
 * so this can later be swapped for a fetched/cached version.
 *
 * Note: This does NOT include ad-hoc closings (weather, etc.) which
 * are posted at https://www.nccourts.gov/closings
 */

/**
 * Holiday dates organized by year. Each entry is an ISO date string.
 * Add new years as they are published by the NC Judicial Branch.
 */
export const NC_HOLIDAYS: Record<number, string[]> = {
  2026: [
    "2026-01-01", // New Year's Day (Thursday)
    "2026-01-19", // Martin Luther King Jr. Day (Monday)
    "2026-04-03", // Good Friday (Friday)
    "2026-05-25", // Memorial Day (Monday)
    "2026-07-03", // Independence Day observed (Friday — July 4 is Saturday)
    "2026-09-07", // Labor Day (Monday)
    "2026-11-11", // Veterans Day (Wednesday)
    "2026-11-26", // Thanksgiving Day (Thursday)
    "2026-11-27", // Day after Thanksgiving (Friday)
    "2026-12-24", // Christmas Eve (Thursday)
    "2026-12-25", // Christmas Day (Friday)
    "2026-12-28", // Day after Christmas observed (Monday — Dec 26 is Saturday)
  ],

  /**
   * 2027 holidays — PROVISIONAL, computed from standard rules.
   * The official NC Judicial Branch schedule for 2027 has NOT yet
   * been published. These dates MUST be verified against
   * https://www.nccourts.gov/holiday-schedule once available.
   *
   * Christmas 2027 note: Dec 25 falls on Saturday and Dec 26 on
   * Sunday. Following the 2026 pattern (observed day for weekend
   * holidays), Dec 24 (Fri) is Christmas Eve and Dec 27 (Mon) is
   * the observed Christmas/day-after-Christmas holiday.
   */
  2027: [
    "2027-01-01", // New Year's Day (Friday)
    "2027-01-18", // Martin Luther King Jr. Day (Monday)
    "2027-03-26", // Good Friday (Friday — Easter is March 28)
    "2027-05-31", // Memorial Day (Monday)
    "2027-07-05", // Independence Day observed (Monday — July 4 is Sunday)
    "2027-09-06", // Labor Day (Monday)
    "2027-11-11", // Veterans Day (Thursday)
    "2027-11-25", // Thanksgiving Day (Thursday)
    "2027-11-26", // Day after Thanksgiving (Friday)
    "2027-12-24", // Christmas Eve (Friday)
    "2027-12-27", // Christmas Day observed (Monday — Dec 25 is Saturday)
  ],
};

/**
 * Returns the set of holiday ISO date strings for a given year.
 * Returns an empty set if the year has no data (triggers a warning
 * in the engine).
 */
export function getHolidaysForYear(year: number): Set<string> {
  return new Set(NC_HOLIDAYS[year] ?? []);
}

/**
 * Returns all years that have verified holiday data.
 */
export function getSupportedYears(): number[] {
  return Object.keys(NC_HOLIDAYS).map(Number).sort();
}
