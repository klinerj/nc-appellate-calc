/**
 * Clipboard Receipt Formatting Tests
 *
 * Tests the plain-text receipt that is copied to the clipboard
 * (and used for reference). We test the pure formatting function
 * rather than the clipboard API interaction itself.
 */

import { describe, it, expect } from "vitest";
import { formatReceipt } from "../clipboard";
import type { ComputeOutput } from "../../../engine/types";

// ─── Test Fixtures ───────────────────────────────────────────────

/** Minimal ComputeOutput for testing receipt formatting */
function makeOutput(overrides: Partial<ComputeOutput> = {}): ComputeOutput {
  return {
    deadline: "2026-04-01",
    deadlineDay: "Wednesday",
    deadlineFormatted: "April 1, 2026",
    deadlineAction: "File Appellee's Brief",
    serviceDate: "2026-03-02",
    serviceMethod: "hand",
    court: "COA",
    ruleName: "Appellee's Brief",
    rulePackVersion: "0.2.0",
    steps: [
      {
        stepNumber: 1,
        label: "Service date",
        description: "Appellant's Brief served on March 2, 2026 (Monday)",
        citation: "N.C. R. App. P. 13(a)(1)",
        dateBeforeStep: "2026-03-02",
        dateAfterStep: "2026-03-02",
        isAdjustment: false,
      },
      {
        stepNumber: 2,
        label: "Base period",
        description:
          "Add 30 calendar days (excluding trigger day): March 2, 2026 + 30 days = April 1, 2026 (Wednesday)",
        citation: "N.C. R. App. P. 13(a)(1); N.C. R. App. P. 27(a)",
        dateBeforeStep: "2026-03-02",
        dateAfterStep: "2026-04-01",
        isAdjustment: true,
      },
      {
        stepNumber: 3,
        label: "Service by hand delivery",
        description: "Personal service — no additional days added",
        citation: "N.C. R. App. P. 27(b)",
        dateBeforeStep: "2026-04-01",
        dateAfterStep: "2026-04-01",
        isAdjustment: false,
      },
      {
        stepNumber: 4,
        label: "Weekend/holiday check",
        description:
          "April 1, 2026 (Wednesday) is a business day — no adjustment needed",
        citation: "N.C. R. App. P. 27(a)",
        dateBeforeStep: "2026-04-01",
        dateAfterStep: "2026-04-01",
        isAdjustment: false,
      },
    ],
    holidayDataVerified: true,
    warnings: [],
    ...overrides,
  };
}

// ─── Header Section ──────────────────────────────────────────────

describe("formatReceipt header", () => {
  it("starts with the deadline action", () => {
    const text = formatReceipt(makeOutput());
    expect(text).toMatch(/^DEADLINE: File Appellee's Brief/);
  });

  it("includes the formatted deadline date and day", () => {
    const text = formatReceipt(makeOutput());
    expect(text).toContain("Due: April 1, 2026 (Wednesday)");
  });
});

// ─── Case Name ───────────────────────────────────────────────────

describe("formatReceipt case name", () => {
  it("omits case name line when not provided", () => {
    const text = formatReceipt(makeOutput());
    expect(text).not.toContain("Case:");
  });

  it("includes case name line when provided", () => {
    const text = formatReceipt(makeOutput({ caseName: "Smith v. Jones" }));
    expect(text).toContain("Case: Smith v. Jones");
  });

  it("places case name between the deadline and due date lines", () => {
    const text = formatReceipt(makeOutput({ caseName: "Doe v. Roe" }));
    const lines = text.split("\n");
    const deadlineIdx = lines.findIndex((l) => l.startsWith("DEADLINE:"));
    const caseIdx = lines.findIndex((l) => l.startsWith("Case:"));
    const dueIdx = lines.findIndex((l) => l.startsWith("Due:"));
    expect(caseIdx).toBe(deadlineIdx + 1);
    expect(dueIdx).toBe(caseIdx + 1);
  });
});

// ─── Metadata Section ────────────────────────────────────────────

describe("formatReceipt metadata", () => {
  it("includes the rule name and citation", () => {
    const text = formatReceipt(makeOutput());
    expect(text).toContain("Rule: Appellee's Brief");
    // Should include the base period citation (step 2)
    expect(text).toContain("N.C. R. App. P. 13(a)(1)");
  });

  it("includes the service date", () => {
    const text = formatReceipt(makeOutput());
    expect(text).toContain("Service Date: 2026-03-02");
  });

  it("formats hand delivery service method", () => {
    const text = formatReceipt(makeOutput({ serviceMethod: "hand" }));
    expect(text).toContain("Service Method: Hand Delivery");
  });

  it("formats mail service method", () => {
    const text = formatReceipt(makeOutput({ serviceMethod: "mail" }));
    expect(text).toContain("Service Method: U.S. Mail");
  });

  it("formats email service method", () => {
    const text = formatReceipt(makeOutput({ serviceMethod: "email" }));
    expect(text).toContain("Service Method: Email");
  });

  it("formats Court of Appeals", () => {
    const text = formatReceipt(makeOutput({ court: "COA" }));
    expect(text).toContain("Court: NC Court of Appeals");
  });

  it("formats Supreme Court", () => {
    const text = formatReceipt(makeOutput({ court: "SC" }));
    expect(text).toContain("Court: NC Supreme Court");
  });
});

// ─── Computation Steps ───────────────────────────────────────────

describe("formatReceipt computation steps", () => {
  it("includes all computation steps", () => {
    const text = formatReceipt(makeOutput());
    expect(text).toContain("Computation Steps:");
    expect(text).toContain("1. Service date:");
    expect(text).toContain("2. Base period:");
    expect(text).toContain("3. Service by hand delivery:");
    expect(text).toContain("4. Weekend/holiday check:");
  });

  it("includes citations for each step", () => {
    const text = formatReceipt(makeOutput());
    expect(text).toContain("Citation: N.C. R. App. P. 13(a)(1)");
    expect(text).toContain("Citation: N.C. R. App. P. 27(a)");
    expect(text).toContain("Citation: N.C. R. App. P. 27(b)");
  });
});

// ─── Footer ──────────────────────────────────────────────────────

describe("formatReceipt footer", () => {
  it("includes the rule pack version", () => {
    const text = formatReceipt(makeOutput());
    expect(text).toContain("Rule Pack: v0.2.0");
  });

  it("includes a computation timestamp", () => {
    const text = formatReceipt(makeOutput());
    expect(text).toContain("Computed:");
  });

  it("ends with the disclaimer", () => {
    const text = formatReceipt(makeOutput());
    expect(text).toContain("NC Appellate Deadline Calculator");
    expect(text).toContain(
      "This tool is for reference only. Always verify deadlines independently.",
    );
  });

  it("includes a separator before the disclaimer", () => {
    const text = formatReceipt(makeOutput());
    expect(text).toContain("---");
  });
});

// ─── Completeness ────────────────────────────────────────────────

describe("formatReceipt completeness", () => {
  it("returns a non-empty string", () => {
    const text = formatReceipt(makeOutput());
    expect(text.length).toBeGreaterThan(0);
  });

  it("contains no undefined or null values", () => {
    const text = formatReceipt(makeOutput());
    expect(text).not.toContain("undefined");
    expect(text).not.toContain("null");
  });

  it("works with Supreme Court + mail + case name", () => {
    const text = formatReceipt(
      makeOutput({
        court: "SC",
        serviceMethod: "mail",
        caseName: "State v. Defendant",
      }),
    );
    expect(text).toContain("Court: NC Supreme Court");
    expect(text).toContain("Service Method: U.S. Mail");
    expect(text).toContain("Case: State v. Defendant");
  });
});
