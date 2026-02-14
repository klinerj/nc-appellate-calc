/**
 * Rule Pack v0.2.0
 *
 * Verified against the NC Rules of Appellate Procedure
 * as codified 2 September 2025.
 *
 * Source: https://www.nccourts.gov/courts/supreme-court/court-rules/
 *         north-carolina-rules-of-appellate-procedure
 *
 * v0.2 implements three rules:
 *   1. Rule 13(a)(1) — Appellee's Brief (30 days)
 *   2. Rule 28(h) — Reply Brief (14 days)
 *   3. Rule 3(c) — Notice of Appeal (30 days, NO Rule 27(b) extension)
 */

import type { RulePack } from "./schema";

export const rulePackV1: RulePack = {
  version: "0.2.0",
  verifiedDate: "2025-09-02",
  sourceUrl:
    "https://www.nccourts.gov/courts/supreme-court/court-rules/north-carolina-rules-of-appellate-procedure",
  description:
    "NC Rules of Appellate Procedure — verified deadline rules (v0.2)",
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
    {
      id: "rule-28h-reply-brief",
      name: "Reply Brief",
      courts: ["COA", "SC"],
      triggerDocument: "Appellee's Brief",
      triggerDescription: "Service of Appellee's Brief",
      baseDays: 14,
      baseCitation: "N.C. R. App. P. 28(h)",
      serviceAddDays: 3,
      serviceCitation: "N.C. R. App. P. 27(b)",
      rollForwardCitation: "N.C. R. App. P. 27(a)",
      deadlineAction: "File Reply Brief",
      excludeTriggerDay: true,
    },
    {
      id: "rule-3c-notice-of-appeal",
      name: "Notice of Appeal",
      courts: ["COA", "SC"],
      triggerDocument: "Judgment",
      triggerDescription: "Entry of judgment or service of judgment copy",
      baseDays: 30,
      baseCitation: "N.C. R. App. P. 3(c)",
      serviceAddDays: 0, // Rule 27(b) explicitly does NOT apply
      serviceCitation: "N.C. R. App. P. 3(c) (Rule 27(b) inapplicable)",
      rollForwardCitation: "N.C. R. App. P. 27(a)",
      deadlineAction: "File Notice of Appeal",
      excludeTriggerDay: true,
    },
  ],
};
