/**
 * Rules Module — Type Definitions
 *
 * This module defines the shape of all rule data. The engine reads
 * structured rule packs; it does not contain legal knowledge itself.
 * Adding new deadline types = adding data entries, not rewriting logic.
 */

/**
 * How a document was served. Affects deadline computation:
 * - 'hand': Personal service — no additional days
 * - 'mail': U.S. Mail — adds 3 calendar days per Rule 27(b)
 * - 'email': Electronic service — adds 3 calendar days per Rule 27(b)
 */
export type ServiceMethod = "hand" | "mail" | "email";

/**
 * NC appellate court level.
 * - 'COA': North Carolina Court of Appeals
 * - 'SC': North Carolina Supreme Court
 */
export type Court = "COA" | "SC";

/**
 * A single deadline rule describing when a document is due
 * relative to a triggering event (e.g., service of a brief).
 */
export interface DeadlineRule {
  /** Unique identifier, e.g., "rule-13a1-appellee-brief" */
  id: string;

  /** Human-readable name of the resulting document, e.g., "Appellee's Brief" */
  name: string;

  /** Which courts this rule applies to */
  courts: Court[];

  /** The triggering document, e.g., "Appellant's Brief" */
  triggerDocument: string;

  /** Human-readable description of the trigger event */
  triggerDescription: string;

  /** Number of calendar days for the base period */
  baseDays: number;

  /** NC Rule citation for the base period, e.g., "N.C. R. App. P. 13(a)(1)" */
  baseCitation: string;

  /**
   * Additional calendar days added for non-hand service methods.
   * Per Rule 27(b), this is 3 days for mail/email.
   */
  serviceAddDays: number;

  /** Citation for the service-add rule, e.g., "N.C. R. App. P. 27(b)" */
  serviceCitation: string;

  /** Citation for the weekend/holiday roll-forward rule */
  rollForwardCitation: string;

  /** Description of the deadline action, e.g., "File Appellee's Brief" */
  deadlineAction: string;

  /**
   * Whether to exclude the trigger day from counting.
   * Per Rule 27(a), always true for periods measured in days.
   */
  excludeTriggerDay: boolean;
}

/**
 * A versioned, self-describing collection of deadline rules.
 * Every calculation stamps which rule pack version was used,
 * enabling traceability and future upstream change detection.
 */
export interface RulePack {
  /** Semantic version, e.g., "0.1.0" */
  version: string;

  /** ISO date when this pack was last verified against official rules */
  verifiedDate: string;

  /** URL of the authoritative source used for verification */
  sourceUrl: string;

  /** Human-readable description of this rule pack */
  description: string;

  /** The rules in this pack */
  rules: DeadlineRule[];
}
