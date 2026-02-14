/**
 * Holiday Module Tests
 *
 * Tests weekend detection, holiday detection, roll-forward logic,
 * and date arithmetic. Particular attention to holiday "clusters"
 * (Thanksgiving Thu+Fri, Christmas Thu+Fri+Mon) where multiple
 * non-business days are consecutive.
 */

import { describe, it, expect } from "vitest";
import {
  isWeekend,
  isHoliday,
  isNonBusinessDay,
  rollForwardToBusinessDay,
  addDaysToDate,
  getDayOfWeekName,
  formatDate,
  isYearSupported,
} from "../holidays";

// ─── Weekend Detection ────────────────────────────────────────────

describe("isWeekend", () => {
  it("returns true for Saturday", () => {
    expect(isWeekend("2026-04-04")).toBe(true); // Saturday
  });

  it("returns true for Sunday", () => {
    expect(isWeekend("2026-04-05")).toBe(true); // Sunday
  });

  it("returns false for weekdays", () => {
    expect(isWeekend("2026-04-06")).toBe(false); // Monday
    expect(isWeekend("2026-04-07")).toBe(false); // Tuesday
    expect(isWeekend("2026-04-08")).toBe(false); // Wednesday
    expect(isWeekend("2026-04-09")).toBe(false); // Thursday
    expect(isWeekend("2026-04-10")).toBe(false); // Friday
  });
});

// ─── Holiday Detection ────────────────────────────────────────────

describe("isHoliday", () => {
  it("recognizes all 2026 NC judicial holidays", () => {
    const holidays2026 = [
      "2026-01-01", // New Year's Day
      "2026-01-19", // MLK Day
      "2026-04-03", // Good Friday
      "2026-05-25", // Memorial Day
      "2026-07-03", // Independence Day observed
      "2026-09-07", // Labor Day
      "2026-11-11", // Veterans Day
      "2026-11-26", // Thanksgiving
      "2026-11-27", // Day after Thanksgiving
      "2026-12-24", // Christmas Eve
      "2026-12-25", // Christmas Day
      "2026-12-28", // Day after Christmas observed
    ];

    holidays2026.forEach((date) => {
      expect(isHoliday(date)).toBe(true);
    });
  });

  it("returns false for regular weekdays in 2026", () => {
    expect(isHoliday("2026-03-02")).toBe(false);
    expect(isHoliday("2026-06-15")).toBe(false);
    expect(isHoliday("2026-10-14")).toBe(false);
  });

  it("returns false for dates in years without data", () => {
    expect(isHoliday("2025-01-01")).toBe(false);
  });

  it("recognizes all 2027 NC judicial holidays (provisional)", () => {
    const holidays2027 = [
      "2027-01-01", // New Year's Day (Friday)
      "2027-01-18", // MLK Day (Monday)
      "2027-03-26", // Good Friday (Friday)
      "2027-05-31", // Memorial Day (Monday)
      "2027-07-05", // Independence Day observed (Monday — Jul 4 is Sunday)
      "2027-09-06", // Labor Day (Monday)
      "2027-11-11", // Veterans Day (Thursday)
      "2027-11-25", // Thanksgiving (Thursday)
      "2027-11-26", // Day after Thanksgiving (Friday)
      "2027-12-24", // Christmas Eve (Friday)
      "2027-12-27", // Christmas observed (Monday — Dec 25 is Saturday)
    ];

    holidays2027.forEach((date) => {
      expect(isHoliday(date)).toBe(true);
    });
  });
});

// ─── Non-Business Day (Combined) ─────────────────────────────────

describe("isNonBusinessDay", () => {
  it("returns true for weekends", () => {
    expect(isNonBusinessDay("2026-04-04")).toBe(true); // Saturday
    expect(isNonBusinessDay("2026-04-05")).toBe(true); // Sunday
  });

  it("returns true for holidays", () => {
    expect(isNonBusinessDay("2026-04-03")).toBe(true); // Good Friday
    expect(isNonBusinessDay("2026-11-11")).toBe(true); // Veterans Day (Wed)
  });

  it("returns false for regular business days", () => {
    expect(isNonBusinessDay("2026-04-01")).toBe(false); // Wednesday
    expect(isNonBusinessDay("2026-04-06")).toBe(false); // Monday
  });
});

// ─── Roll Forward Logic ───────────────────────────────────────────

describe("rollForwardToBusinessDay", () => {
  it("does not roll a regular business day", () => {
    const result = rollForwardToBusinessDay("2026-04-01"); // Wednesday
    expect(result.date).toBe("2026-04-01");
    expect(result.rolled).toBe(false);
    expect(result.steps).toHaveLength(0);
  });

  it("rolls Saturday to Monday", () => {
    const result = rollForwardToBusinessDay("2026-04-04"); // Saturday
    expect(result.date).toBe("2026-04-06"); // Monday
    expect(result.rolled).toBe(true);
    expect(result.steps).toHaveLength(2); // Sat, Sun
  });

  it("rolls Sunday to Monday", () => {
    const result = rollForwardToBusinessDay("2026-04-05"); // Sunday
    expect(result.date).toBe("2026-04-06"); // Monday
    expect(result.rolled).toBe(true);
    expect(result.steps).toHaveLength(1); // Sun only
  });

  it("rolls Good Friday through weekend to Monday", () => {
    // Apr 3 (Fri holiday) → Apr 4 (Sat) → Apr 5 (Sun) → Apr 6 (Mon)
    const result = rollForwardToBusinessDay("2026-04-03");
    expect(result.date).toBe("2026-04-06");
    expect(result.rolled).toBe(true);
    expect(result.steps).toHaveLength(3); // Fri, Sat, Sun
  });

  it("rolls Thanksgiving cluster to Monday", () => {
    // Nov 26 (Thu holiday) → Nov 27 (Fri holiday) → Nov 28 (Sat) → Nov 29 (Sun) → Nov 30 (Mon)
    const result = rollForwardToBusinessDay("2026-11-26");
    expect(result.date).toBe("2026-11-30");
    expect(result.rolled).toBe(true);
    expect(result.steps).toHaveLength(4); // Thu, Fri, Sat, Sun
  });

  it("rolls Christmas cluster to Tuesday", () => {
    // Dec 24 (Thu holiday) → Dec 25 (Fri holiday) → Dec 26 (Sat) → Dec 27 (Sun) → Dec 28 (Mon holiday) → Dec 29 (Tue)
    const result = rollForwardToBusinessDay("2026-12-24");
    expect(result.date).toBe("2026-12-29");
    expect(result.rolled).toBe(true);
    expect(result.steps).toHaveLength(5); // Thu, Fri, Sat, Sun, Mon
  });

  it("rolls Veterans Day (mid-week holiday) to Thursday", () => {
    // Nov 11 (Wed holiday) → Nov 12 (Thu)
    const result = rollForwardToBusinessDay("2026-11-11");
    expect(result.date).toBe("2026-11-12");
    expect(result.rolled).toBe(true);
    expect(result.steps).toHaveLength(1);
  });

  it("rolls 2027 Good Friday through weekend to Monday", () => {
    // Mar 26 (Fri holiday) → Mar 27 (Sat) → Mar 28 (Sun) → Mar 29 (Mon)
    const result = rollForwardToBusinessDay("2027-03-26");
    expect(result.date).toBe("2027-03-29");
    expect(result.rolled).toBe(true);
    expect(result.steps).toHaveLength(3);
  });

  it("rolls 2027 Christmas cluster to Tuesday", () => {
    // Dec 24 (Fri holiday) → Dec 25 (Sat) → Dec 26 (Sun) → Dec 27 (Mon holiday) → Dec 28 (Tue)
    const result = rollForwardToBusinessDay("2027-12-24");
    expect(result.date).toBe("2027-12-28");
    expect(result.rolled).toBe(true);
    expect(result.steps).toHaveLength(4); // Fri, Sat, Sun, Mon
  });
});

// ─── Date Arithmetic ──────────────────────────────────────────────

describe("addDaysToDate", () => {
  it("adds 30 days correctly (March to April)", () => {
    expect(addDaysToDate("2026-03-02", 30)).toBe("2026-04-01");
  });

  it("adds 1 day", () => {
    expect(addDaysToDate("2026-03-02", 1)).toBe("2026-03-03");
  });

  it("adds 0 days (identity)", () => {
    expect(addDaysToDate("2026-03-02", 0)).toBe("2026-03-02");
  });

  it("crosses month boundary", () => {
    expect(addDaysToDate("2026-01-31", 1)).toBe("2026-02-01");
  });

  it("crosses year boundary", () => {
    expect(addDaysToDate("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("handles February (non-leap year 2026)", () => {
    // 2026 is not a leap year, so Feb has 28 days
    expect(addDaysToDate("2026-02-28", 1)).toBe("2026-03-01");
  });

  it("handles February (leap year 2028)", () => {
    expect(addDaysToDate("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDaysToDate("2028-02-29", 1)).toBe("2028-03-01");
  });
});

// ─── Day of Week ──────────────────────────────────────────────────

describe("getDayOfWeekName", () => {
  it("returns correct names for a full week", () => {
    expect(getDayOfWeekName("2026-04-06")).toBe("Monday");
    expect(getDayOfWeekName("2026-04-07")).toBe("Tuesday");
    expect(getDayOfWeekName("2026-04-08")).toBe("Wednesday");
    expect(getDayOfWeekName("2026-04-09")).toBe("Thursday");
    expect(getDayOfWeekName("2026-04-10")).toBe("Friday");
    expect(getDayOfWeekName("2026-04-04")).toBe("Saturday");
    expect(getDayOfWeekName("2026-04-05")).toBe("Sunday");
  });
});

// ─── Date Formatting ──────────────────────────────────────────────

describe("formatDate", () => {
  it("formats dates as 'Month Day, Year'", () => {
    expect(formatDate("2026-04-06")).toBe("April 6, 2026");
    expect(formatDate("2026-01-01")).toBe("January 1, 2026");
    expect(formatDate("2026-12-25")).toBe("December 25, 2026");
  });
});

// ─── Year Support ─────────────────────────────────────────────────

describe("isYearSupported", () => {
  it("returns true for 2026", () => {
    expect(isYearSupported("2026-06-15")).toBe(true);
  });

  it("returns true for 2027", () => {
    expect(isYearSupported("2027-06-15")).toBe(true);
  });

  it("returns false for years without data", () => {
    expect(isYearSupported("2025-06-15")).toBe(false);
    expect(isYearSupported("2028-06-15")).toBe(false);
  });
});
