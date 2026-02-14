/**
 * Schema validation tests for the rules module.
 *
 * These tests ensure that the rule pack structure is correct
 * and complete — every rule has valid fields, proper citations,
 * and positive day counts. If someone adds a malformed rule,
 * these tests catch it before it reaches the engine.
 */

import { describe, it, expect } from "vitest";
import { rulePackV1 } from "../v1";
import type { DeadlineRule } from "../schema";

describe("RulePack v1 — structure", () => {
  it("has a valid semver version", () => {
    expect(rulePackV1.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("has a valid ISO verifiedDate", () => {
    expect(rulePackV1.verifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Verify it parses as a real date
    const parsed = new Date(rulePackV1.verifiedDate);
    expect(parsed.toString()).not.toBe("Invalid Date");
  });

  it("has a valid HTTPS source URL", () => {
    expect(rulePackV1.sourceUrl).toMatch(/^https:\/\//);
  });

  it("has a non-empty description", () => {
    expect(rulePackV1.description.length).toBeGreaterThan(0);
  });

  it("contains at least one rule", () => {
    expect(rulePackV1.rules.length).toBeGreaterThan(0);
  });

  it("has unique rule IDs", () => {
    const ids = rulePackV1.rules.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe.each(rulePackV1.rules)("Rule: $name (id: $id)", (rule: DeadlineRule) => {
  it("has a non-empty id", () => {
    expect(rule.id.length).toBeGreaterThan(0);
  });

  it("has a non-empty name", () => {
    expect(rule.name.length).toBeGreaterThan(0);
  });

  it("has at least one valid court", () => {
    expect(rule.courts.length).toBeGreaterThan(0);
    rule.courts.forEach((c) => {
      expect(["COA", "SC"]).toContain(c);
    });
  });

  it("has a non-empty triggerDocument", () => {
    expect(rule.triggerDocument.length).toBeGreaterThan(0);
  });

  it("has positive baseDays", () => {
    expect(rule.baseDays).toBeGreaterThan(0);
  });

  it("has non-negative serviceAddDays", () => {
    expect(rule.serviceAddDays).toBeGreaterThanOrEqual(0);
  });

  it("has a baseCitation referencing NC appellate rules", () => {
    expect(rule.baseCitation).toMatch(/N\.C\. R\. App\. P\./);
  });

  it("has a serviceCitation referencing NC appellate rules", () => {
    expect(rule.serviceCitation).toMatch(/N\.C\. R\. App\. P\./);
  });

  it("has a rollForwardCitation referencing NC appellate rules", () => {
    expect(rule.rollForwardCitation).toMatch(/N\.C\. R\. App\. P\./);
  });

  it("has a non-empty deadlineAction", () => {
    expect(rule.deadlineAction.length).toBeGreaterThan(0);
  });

  it("has excludeTriggerDay set to true (Rule 27(a))", () => {
    // For all NC appellate rules, the trigger day is excluded
    expect(rule.excludeTriggerDay).toBe(true);
  });
});
