/**
 * Deadline Computation Engine
 *
 * Pure function: ComputeInput → ComputeOutput.
 * No UI, no network, no side effects.
 *
 * Algorithm (per NC Rules of Appellate Procedure):
 *
 * 1. Start with the service date (trigger date).
 * 2. Exclude trigger day: add baseDays calendar days (Rule 27(a)).
 *    "The day of the act, event, or default after which the designated
 *     period of time begins to run is not included."
 * 3. If service was by mail or email AND rule.serviceAddDays > 0:
 *    add 3 calendar days AFTER computing the base deadline,
 *    BEFORE applying weekend/holiday adjustment (Rule 27(b)).
 * 4. If the resulting date is a Saturday, Sunday, or NC judicial
 *    holiday: roll forward to the next business day (Rule 27(a)).
 */

import type { ComputeInput, ComputeOutput, ComputeStep } from "./types";
import { rulePackV1 } from "../rules/v1";
import {
  addDaysToDate,
  rollForwardToBusinessDay,
  getDayOfWeekName,
  formatDate,
  isYearSupported,
} from "../holidays/holidays";

export function computeDeadline(input: ComputeInput): ComputeOutput {
  const { rule, serviceDate, serviceMethod, court } = input;
  const steps: ComputeStep[] = [];
  const warnings: string[] = [];
  let stepNumber = 0;

  // ── Step 1: Record the trigger date ───────────────────────────

  stepNumber++;
  steps.push({
    stepNumber,
    label: "Service date",
    description:
      `${rule.triggerDocument} served on ` +
      `${formatDate(serviceDate)} (${getDayOfWeekName(serviceDate)})`,
    citation: rule.baseCitation,
    dateBeforeStep: serviceDate,
    dateAfterStep: serviceDate,
    isAdjustment: false,
  });

  // ── Step 2: Compute base period ───────────────────────────────
  //
  // Rule 27(a): "The day of the act ... is not included."
  // Adding baseDays to the service date effectively starts counting
  // from the day AFTER service. For example:
  //   Service = March 2, baseDays = 30
  //   Day 1 = March 3, Day 2 = March 4, ..., Day 30 = April 1
  //   addDaysToDate("2026-03-02", 30) = "2026-04-01" ✓

  const baseDeadline = addDaysToDate(serviceDate, rule.baseDays);
  stepNumber++;
  steps.push({
    stepNumber,
    label: "Base period",
    description:
      `Add ${rule.baseDays} calendar days (excluding trigger day): ` +
      `${formatDate(serviceDate)} + ${rule.baseDays} days = ` +
      `${formatDate(baseDeadline)} (${getDayOfWeekName(baseDeadline)})`,
    citation: `${rule.baseCitation}; ${rule.rollForwardCitation}`,
    dateBeforeStep: serviceDate,
    dateAfterStep: baseDeadline,
    isAdjustment: true,
  });

  let currentDeadline = baseDeadline;

  // ── Step 3: Service method adjustment ─────────────────────────
  //
  // Rule 27(b): "Whenever a party ... is required ... to do some
  // act within a prescribed period after the service of a paper
  // upon that party ... 3 days shall be added to the prescribed
  // period." Applies to mail and email service.

  if (serviceMethod !== "hand" && rule.serviceAddDays > 0) {
    // Mail/email service WITH additional days (e.g., briefs)
    const methodLabel = serviceMethod === "mail" ? "U.S. mail" : "email";
    const adjustedDeadline = addDaysToDate(
      currentDeadline,
      rule.serviceAddDays,
    );
    stepNumber++;
    steps.push({
      stepNumber,
      label: `Service by ${methodLabel}`,
      description:
        `Add ${rule.serviceAddDays} calendar days for service by ${methodLabel}: ` +
        `${formatDate(currentDeadline)} + ${rule.serviceAddDays} days = ` +
        `${formatDate(adjustedDeadline)} (${getDayOfWeekName(adjustedDeadline)})`,
      citation: rule.serviceCitation,
      dateBeforeStep: currentDeadline,
      dateAfterStep: adjustedDeadline,
      isAdjustment: true,
    });
    currentDeadline = adjustedDeadline;
  } else if (serviceMethod !== "hand" && rule.serviceAddDays === 0) {
    // Mail/email service but Rule 27(b) does NOT apply (e.g., Notice of Appeal)
    const methodLabel = serviceMethod === "mail" ? "U.S. mail" : "email";
    stepNumber++;
    steps.push({
      stepNumber,
      label: `Service by ${methodLabel}`,
      description:
        `Rule 27(b) additional time does not apply to this filing — ` +
        `no additional days added despite service by ${methodLabel}`,
      citation: rule.serviceCitation,
      dateBeforeStep: currentDeadline,
      dateAfterStep: currentDeadline,
      isAdjustment: false,
    });
  } else {
    // Hand delivery — never adds days
    stepNumber++;
    steps.push({
      stepNumber,
      label: "Service by hand delivery",
      description: "Personal service — no additional days added",
      citation: rule.serviceCitation,
      dateBeforeStep: currentDeadline,
      dateAfterStep: currentDeadline,
      isAdjustment: false,
    });
  }

  // ── Step 4: Weekend/holiday roll-forward ──────────────────────
  //
  // Rule 27(a): "... when the last day of the period so computed
  // is a Saturday, Sunday, or a legal holiday ... the period runs
  // until the end of the next day that is not a Saturday, Sunday,
  // or a legal holiday."

  const rollResult = rollForwardToBusinessDay(currentDeadline);
  stepNumber++;
  if (rollResult.rolled) {
    steps.push({
      stepNumber,
      label: "Weekend/holiday adjustment",
      description:
        `${formatDate(currentDeadline)} (${getDayOfWeekName(currentDeadline)}) ` +
        `is not a business day. ` +
        rollResult.steps.join("; ") +
        `. Deadline extends to ${formatDate(rollResult.date)} ` +
        `(${getDayOfWeekName(rollResult.date)}).`,
      citation: rule.rollForwardCitation,
      dateBeforeStep: currentDeadline,
      dateAfterStep: rollResult.date,
      isAdjustment: true,
    });
  } else {
    steps.push({
      stepNumber,
      label: "Weekend/holiday check",
      description:
        `${formatDate(currentDeadline)} (${getDayOfWeekName(currentDeadline)}) ` +
        `is a business day — no adjustment needed`,
      citation: rule.rollForwardCitation,
      dateBeforeStep: currentDeadline,
      dateAfterStep: currentDeadline,
      isAdjustment: false,
    });
  }

  const finalDeadline = rollResult.date;

  // ── Warnings ──────────────────────────────────────────────────

  if (!isYearSupported(finalDeadline)) {
    const year = finalDeadline.substring(0, 4);
    warnings.push(
      `Holiday data for ${year} has not been verified. ` +
        `The computed deadline may not account for all judicial holidays. ` +
        `Please verify against the official NC Judicial Branch holiday schedule.`,
    );
  }

  // Always include the standard verification warning
  warnings.push(
    `This calculation uses rule pack v${rulePackV1.version} ` +
      `verified against rules codified ${formatVerifiedDate(rulePackV1.verifiedDate)}. ` +
      `Verify rules have not been amended.`,
  );

  return {
    deadline: finalDeadline,
    deadlineDay: getDayOfWeekName(finalDeadline),
    deadlineFormatted: formatDate(finalDeadline),
    deadlineAction: rule.deadlineAction,
    serviceDate,
    serviceMethod,
    court,
    ruleName: rule.name,
    rulePackVersion: rulePackV1.version,
    steps,
    holidayDataVerified: isYearSupported(finalDeadline),
    warnings,
  };
}

/**
 * Formats the verified date for display in warnings.
 * "2025-09-02" → "2 September 2025"
 */
function formatVerifiedDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d, 12, 0, 0);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
