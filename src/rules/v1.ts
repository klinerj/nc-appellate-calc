/**
 * Rule Pack v0.1.0
 *
 * Verified against the NC Rules of Appellate Procedure
 * as codified 2 September 2025.
 *
 * Source: https://www.nccourts.gov/courts/supreme-court/court-rules/
 *         north-carolina-rules-of-appellate-procedure
 *
 * v0.1 implements ONE rule:
 *   Rule 13(a)(1) — Appellee's Brief due 30 days after
 *   service of Appellant's Brief.
 */

import type { RulePack } from "./schema";

export const rulePackV1: RulePack = {
  version: "0.1.0",
  verifiedDate: "2025-09-02",
  sourceUrl:
    "https://www.nccourts.gov/courts/supreme-court/court-rules/north-carolina-rules-of-appellate-procedure",
  description:
    "NC Rules of Appellate Procedure — verified deadline rules (v0.1, single rule)",
  rules: [
    {
      id: "rule-13a1-appellee-brief",
      name: "Appellee's Brief",
      courts: ["COA", "SC"],
      triggerDocument: "Appellant's Brief",
      triggerDescription: "Service of Appellant's Brief",
      baseDays: 30,
      baseCitation: "N.C. R. App. P. 13(a)(1)",
      serviceAddDays: 3,
      serviceCitation: "N.C. R. App. P. 27(b)",
      rollForwardCitation: "N.C. R. App. P. 27(a)",
      deadlineAction: "File Appellee's Brief",
      excludeTriggerDay: true,
    },
  ],
};
