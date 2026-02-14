/**
 * Engine Module — Type Definitions
 *
 * These interfaces define the input, output, and intermediate steps
 * of the deadline computation. The engine is a pure function:
 * ComputeInput → ComputeOutput with no side effects.
 */

import type { ServiceMethod, Court, DeadlineRule } from "../rules/schema";

/**
 * Input to the deadline computation engine.
 */
export interface ComputeInput {
  /** The rule to apply (looked up from the rule pack) */
  rule: DeadlineRule;

  /** ISO date string of the service date (from certificate of service) */
  serviceDate: string;

  /** How the triggering document was served */
  serviceMethod: ServiceMethod;

  /** The court level (for display; rule already encodes applicability) */
  court: Court;
}

/**
 * A single step in the computation audit trail.
 * Each step records what happened, why (citation), and the resulting date.
 */
export interface ComputeStep {
  /** 1-based step number */
  stepNumber: number;

  /** Short label, e.g., "Base period" */
  label: string;

  /** Human-readable description of what happened */
  description: string;

  /** The rule citation authorizing this step */
  citation: string;

  /** ISO date before this step was applied */
  dateBeforeStep: string;

  /** ISO date after this step was applied */
  dateAfterStep: string;

  /** Whether this step actually changed the date */
  isAdjustment: boolean;
}

/**
 * Output of the deadline computation engine.
 * Contains the final deadline, a full audit trail, and metadata.
 */
export interface ComputeOutput {
  /** Final computed deadline (ISO string) */
  deadline: string;

  /** Day-of-week name, e.g., "Monday" */
  deadlineDay: string;

  /** Human-readable formatted date, e.g., "April 6, 2026" */
  deadlineFormatted: string;

  /** What action is due, e.g., "File Appellee's Brief" */
  deadlineAction: string;

  /** Echo back: the original service date */
  serviceDate: string;

  /** Echo back: the service method used */
  serviceMethod: ServiceMethod;

  /** Echo back: the court */
  court: Court;

  /** The rule name that was applied */
  ruleName: string;

  /** Rule pack version used for this computation */
  rulePackVersion: string;

  /** Ordered audit trail of computation steps */
  steps: ComputeStep[];

  /** Whether the deadline year has verified holiday data */
  holidayDataVerified: boolean;

  /** Warning messages (empty array if none) */
  warnings: string[];
}
