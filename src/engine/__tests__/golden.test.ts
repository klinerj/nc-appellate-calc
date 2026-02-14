/**
 * Golden Test Cases — Deadline Computation
 *
 * These tests are hand-verified against the calendar and the
 * NC Rules of Appellate Procedure. They are the correctness contract
 * for the computation engine. ALL golden tests must pass before
 * any UI work begins.
 *
 * Verification method: Each expected date was computed by manually
 * counting days on a 2026 calendar, checking day-of-week, and
 * cross-referencing against the NC judicial holiday schedule.
 *
 * Rule applied: N.C. R. App. P. 13(a)(1) — Appellee's Brief due
 * 30 calendar days after service of Appellant's Brief.
 *
 * Computation rules:
 *   Rule 27(a): Exclude trigger day. Roll forward past weekends/holidays.
 *   Rule 27(b): +3 calendar days for mail/email service.
 */

import { describe, it, expect } from "vitest";
import { computeDeadline } from "../compute";
import { rulePackV1 } from "../../rules/v1";
import type { ComputeInput } from "../types";
import type { ServiceMethod } from "../../rules/schema";

const rule = rulePackV1.rules.find(
  (r) => r.id === "rule-13a1-appellee-brief",
)!;

function makeInput(
  serviceDate: string,
  serviceMethod: ServiceMethod,
): ComputeInput {
  return { rule, serviceDate, serviceMethod, court: "COA" };
}

// ─── Golden Tests ─────────────────────────────────────────────────

describe("Golden Tests — Rule 13(a)(1) Appellee's Brief", () => {
  /**
   * Test 1: Basic 30-day calculation, no complications.
   *
   * Service: 2026-03-02 (Monday), hand delivery
   * Day 0 = Mar 2 (excluded per Rule 27(a))
   * Day 1 = Mar 3, Day 2 = Mar 4, ..., Day 30 = Apr 1 (Wednesday)
   * Apr 1 is a business day → no roll-forward needed.
   * Expected: 2026-04-01 (Wednesday)
   */
  it("Test 1: hand service, deadline on business day → Apr 1", () => {
    const result = computeDeadline(makeInput("2026-03-02", "hand"));
    expect(result.deadline).toBe("2026-04-01");
    expect(result.deadlineDay).toBe("Wednesday");
  });

  /**
   * Test 2: Mail service adds 3 days, landing on weekend → rolls.
   *
   * Service: 2026-03-02 (Monday), mail
   * Base: +30 = Apr 1 (Wed)
   * Mail: +3 = Apr 4 (Saturday)
   * Apr 4 is Saturday → Apr 5 (Sunday) → Apr 6 (Monday)
   * Expected: 2026-04-06 (Monday)
   */
  it("Test 2: mail service, +3 lands on Saturday → rolls to Monday Apr 6", () => {
    const result = computeDeadline(makeInput("2026-03-02", "mail"));
    expect(result.deadline).toBe("2026-04-06");
    expect(result.deadlineDay).toBe("Monday");
  });

  /**
   * Test 3: Hand service, base deadline lands on Sunday → rolls.
   *
   * Service: 2026-03-06 (Friday), hand delivery
   * Day 0 = Mar 6 (excluded)
   * Day 1 = Mar 7 (Sat), Day 2 = Mar 8 (Sun), ..., Day 30 = Apr 5 (Sunday)
   * Apr 5 is Sunday → Apr 6 (Monday)
   * Expected: 2026-04-06 (Monday)
   */
  it("Test 3: hand service, deadline on Sunday → rolls to Monday Apr 6", () => {
    const result = computeDeadline(makeInput("2026-03-06", "hand"));
    expect(result.deadline).toBe("2026-04-06");
    expect(result.deadlineDay).toBe("Monday");
  });

  /**
   * Test 4: Hand service, base deadline lands on Good Friday (holiday).
   *
   * Service: 2026-03-04 (Wednesday), hand delivery
   * Day 0 = Mar 4 (excluded)
   * Day 1 = Mar 5, ..., Day 30 = Apr 3 (Friday — Good Friday, judicial holiday)
   * Apr 3 (holiday) → Apr 4 (Sat) → Apr 5 (Sun) → Apr 6 (Mon)
   * Expected: 2026-04-06 (Monday)
   */
  it("Test 4: hand service, deadline on Good Friday → rolls to Monday Apr 6", () => {
    const result = computeDeadline(makeInput("2026-03-04", "hand"));
    expect(result.deadline).toBe("2026-04-06");
    expect(result.deadlineDay).toBe("Monday");
  });

  /**
   * Test 5: Mail service, +3 days lands on Saturday → rolls.
   *
   * Service: 2026-03-23 (Tuesday), mail
   * Day 0 = Mar 23 (excluded)
   * Day 1 = Mar 24, ..., Day 30 = Apr 22 (Wednesday)
   * Mail: +3 = Apr 25 (Saturday)
   * Apr 25 (Sat) → Apr 26 (Sun) → Apr 27 (Monday)
   * Expected: 2026-04-27 (Monday)
   */
  it("Test 5: mail service, +3 lands on Saturday → rolls to Monday Apr 27", () => {
    const result = computeDeadline(makeInput("2026-03-23", "mail"));
    expect(result.deadline).toBe("2026-04-27");
    expect(result.deadlineDay).toBe("Monday");
  });

  /**
   * Test 6: Email service — same +3 behavior as mail per Rule 27(b).
   *
   * Same inputs as Test 2 but with email instead of mail.
   * Service: 2026-03-02 (Monday), email
   * Expected: 2026-04-06 (Monday) — identical to Test 2.
   */
  it("Test 6: email service, same +3 as mail → Apr 6", () => {
    const result = computeDeadline(makeInput("2026-03-02", "email"));
    expect(result.deadline).toBe("2026-04-06");
    expect(result.deadlineDay).toBe("Monday");
  });
});

// ─── Holiday Cluster Edge Cases ───────────────────────────────────

describe("Holiday cluster edge cases", () => {
  /**
   * Thanksgiving cluster: Nov 26 (Thu) + Nov 27 (Fri) holidays,
   * followed by Sat + Sun.
   *
   * Service: 2026-10-27 (Monday), hand delivery
   * +30 = Nov 26 (Thursday — Thanksgiving)
   * Nov 26 (holiday) → Nov 27 (holiday) → Nov 28 (Sat) → Nov 29 (Sun) → Nov 30 (Mon)
   * Expected: 2026-11-30 (Monday)
   */
  it("Thanksgiving cluster: deadline on Thanksgiving → rolls to Nov 30", () => {
    const result = computeDeadline(makeInput("2026-10-27", "hand"));
    expect(result.deadline).toBe("2026-11-30");
    expect(result.deadlineDay).toBe("Monday");
  });

  /**
   * Christmas cluster: Dec 24 (Thu) + Dec 25 (Fri) holidays,
   * then Sat + Sun, then Dec 28 (Mon) holiday. Five consecutive
   * non-business days.
   *
   * Service: 2026-11-24 (Tuesday), hand delivery
   * +30 = Dec 24 (Thursday — Christmas Eve)
   * Dec 24 (holiday) → Dec 25 (holiday) → Dec 26 (Sat) → Dec 27 (Sun) →
   * Dec 28 (holiday) → Dec 29 (Tuesday)
   * Expected: 2026-12-29 (Tuesday)
   */
  it("Christmas cluster: deadline on Christmas Eve → rolls to Dec 29", () => {
    const result = computeDeadline(makeInput("2026-11-24", "hand"));
    expect(result.deadline).toBe("2026-12-29");
    expect(result.deadlineDay).toBe("Tuesday");
  });
});

// ─── Audit Trail Verification ─────────────────────────────────────

describe("Audit trail", () => {
  it("produces 4 steps for hand service", () => {
    const result = computeDeadline(makeInput("2026-03-02", "hand"));
    expect(result.steps).toHaveLength(4);
    expect(result.steps[0].label).toBe("Service date");
    expect(result.steps[1].label).toBe("Base period");
    expect(result.steps[2].label).toBe("Service by hand delivery");
    expect(result.steps[3].label).toContain("Weekend/holiday");
  });

  it("produces 4 steps for mail service", () => {
    const result = computeDeadline(makeInput("2026-03-02", "mail"));
    expect(result.steps).toHaveLength(4);
    expect(result.steps[2].label).toContain("U.S. mail");
    expect(result.steps[2].isAdjustment).toBe(true);
  });

  it("marks roll-forward step as adjustment when date changes", () => {
    const result = computeDeadline(makeInput("2026-03-04", "hand"));
    const rollStep = result.steps[3]; // Last step
    expect(rollStep.isAdjustment).toBe(true);
    expect(rollStep.dateBeforeStep).toBe("2026-04-03"); // Good Friday
    expect(rollStep.dateAfterStep).toBe("2026-04-06"); // Monday
  });

  it("marks roll-forward step as non-adjustment when no change", () => {
    const result = computeDeadline(makeInput("2026-03-02", "hand"));
    const rollStep = result.steps[3];
    expect(rollStep.isAdjustment).toBe(false);
  });

  it("includes citations in every step", () => {
    const result = computeDeadline(makeInput("2026-03-02", "mail"));
    result.steps.forEach((step) => {
      expect(step.citation).toBeTruthy();
      expect(step.citation).toContain("N.C. R. App. P.");
    });
  });
});

// ─── Output Metadata ──────────────────────────────────────────────

describe("Output metadata", () => {
  it("echoes back input values", () => {
    const result = computeDeadline(makeInput("2026-03-02", "mail"));
    expect(result.serviceDate).toBe("2026-03-02");
    expect(result.serviceMethod).toBe("mail");
    expect(result.court).toBe("COA");
    expect(result.ruleName).toBe("Appellee's Brief");
  });

  it("formats the deadline correctly", () => {
    const result = computeDeadline(makeInput("2026-03-02", "hand"));
    expect(result.deadlineFormatted).toBe("April 1, 2026");
    expect(result.deadlineDay).toBe("Wednesday");
  });

  it("includes rule pack version", () => {
    const result = computeDeadline(makeInput("2026-03-02", "hand"));
    expect(result.rulePackVersion).toBe("0.1.0");
  });

  it("sets holidayDataVerified to true for 2026 deadlines", () => {
    const result = computeDeadline(makeInput("2026-03-02", "hand"));
    expect(result.holidayDataVerified).toBe(true);
  });

  it("includes rule verification warning", () => {
    const result = computeDeadline(makeInput("2026-03-02", "hand"));
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.includes("rule pack v0.1.0"))).toBe(
      true,
    );
  });

  it("sets holidayDataVerified to true for 2027 deadlines", () => {
    const result = computeDeadline(makeInput("2027-03-02", "hand"));
    expect(result.holidayDataVerified).toBe(true);
  });

  it("warns when holiday data is not verified for a year", () => {
    // Service date in 2028 — no holiday data
    const result = computeDeadline(makeInput("2028-03-02", "hand"));
    expect(result.holidayDataVerified).toBe(false);
    expect(
      result.warnings.some((w) => w.includes("Holiday data for 2028")),
    ).toBe(true);
  });
});
