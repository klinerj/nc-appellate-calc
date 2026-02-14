"use client";

/**
 * Calculator Input Form
 *
 * Five fields: Court, Trigger Document, Service Method, Service Date,
 * and an optional Case Name/Number.
 * Service method has NO default — the attorney must explicitly select
 * how the document was served, because it affects the deadline by 3 days.
 */

import { useState, type FormEvent } from "react";
import { computeDeadline } from "../../engine/compute";
import { rulePackV1 } from "../../rules/v1";
import type { ComputeOutput } from "../../engine/types";
import type { Court, ServiceMethod } from "../../rules/schema";

interface CalculatorFormProps {
  onResult: (output: ComputeOutput) => void;
}

export function CalculatorForm({ onResult }: CalculatorFormProps) {
  const [court, setCourt] = useState<Court>("COA");
  const [ruleId, setRuleId] = useState<string>(
    rulePackV1.rules[0]?.id ?? "",
  );
  const [serviceMethod, setServiceMethod] = useState<ServiceMethod | "">("");
  const [serviceDate, setServiceDate] = useState<string>("");
  const [caseName, setCaseName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Filter rules by selected court
  const availableRules = rulePackV1.rules.filter((r) =>
    r.courts.includes(court),
  );

  const isValid = court && ruleId && serviceMethod && serviceDate;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!serviceMethod) {
      setError("Please select a service method.");
      return;
    }
    if (!serviceDate) {
      setError("Please enter the service date.");
      return;
    }

    const rule = rulePackV1.rules.find((r) => r.id === ruleId);
    if (!rule) {
      setError("Please select a valid trigger document.");
      return;
    }

    const result = computeDeadline({
      rule,
      serviceDate,
      serviceMethod,
      court,
      caseName: caseName.trim() || undefined,
    });

    onResult(result);
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* ── Court Selector ─────────────────────────────────── */}
      <fieldset>
        <legend className="text-sm font-semibold text-navy-800 mb-3">
          Court
        </legend>
        <div className="flex gap-4">
          {(
            [
              { value: "COA" as Court, label: "Court of Appeals" },
              { value: "SC" as Court, label: "Supreme Court" },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="court"
                value={opt.value}
                checked={court === opt.value}
                onChange={() => {
                  setCourt(opt.value);
                  // Reset rule selection when court changes
                  const firstRule = rulePackV1.rules.find((r) =>
                    r.courts.includes(opt.value),
                  );
                  setRuleId(firstRule?.id ?? "");
                }}
                className="w-4 h-4 text-gold-500 accent-gold-600"
              />
              <span className="text-sm text-navy-800">{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* ── Trigger Document ───────────────────────────────── */}
      <div>
        <label
          htmlFor="ruleId"
          className="block text-sm font-semibold text-navy-800 mb-2"
        >
          Trigger Document
        </label>
        <select
          id="ruleId"
          value={ruleId}
          onChange={(e) => setRuleId(e.target.value)}
          className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-sm
                     text-navy-800 focus:ring-2 focus:ring-gold-500 focus:border-gold-500
                     outline-none transition-colors"
        >
          {availableRules.map((rule) => (
            <option key={rule.id} value={rule.id}>
              {rule.triggerDocument} → {rule.name} due
            </option>
          ))}
        </select>
      </div>

      {/* ── Service Method ─────────────────────────────────── */}
      <fieldset>
        <legend className="text-sm font-semibold text-navy-800 mb-3">
          Method of Service
        </legend>
        <div className="space-y-2.5">
          {(
            [
              {
                value: "hand" as ServiceMethod,
                label: "Hand Delivery / Personal Service",
                hint: "No additional days",
              },
              {
                value: "mail" as ServiceMethod,
                label: "U.S. Mail",
                hint: "+3 days per Rule 27(b)",
              },
              {
                value: "email" as ServiceMethod,
                label: "Email / Electronic Service",
                hint: "+3 days per Rule 27(b)",
              },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                ${
                  serviceMethod === opt.value
                    ? "border-gold-500 bg-gold-500/5"
                    : "border-navy-100 hover:border-navy-200"
                }`}
            >
              <input
                type="radio"
                name="serviceMethod"
                value={opt.value}
                checked={serviceMethod === opt.value}
                onChange={() => setServiceMethod(opt.value)}
                className="w-4 h-4 mt-0.5 text-gold-500 accent-gold-600"
              />
              <div>
                <span className="text-sm font-medium text-navy-800">
                  {opt.label}
                </span>
                <span className="block text-xs text-navy-400 mt-0.5">
                  {opt.hint}
                </span>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {/* ── Service Date ───────────────────────────────────── */}
      <div>
        <label
          htmlFor="serviceDate"
          className="block text-sm font-semibold text-navy-800 mb-2"
        >
          Date of Service
        </label>
        <input
          type="date"
          id="serviceDate"
          value={serviceDate}
          onChange={(e) => setServiceDate(e.target.value)}
          className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-sm
                     text-navy-800 focus:ring-2 focus:ring-gold-500 focus:border-gold-500
                     outline-none transition-colors"
        />
        <p className="mt-1 text-xs text-navy-400">
          Date on the certificate of service
        </p>
      </div>

      {/* ── Case Name / Number (optional) ────────────────── */}
      <div>
        <label
          htmlFor="caseName"
          className="block text-sm font-semibold text-navy-800 mb-2"
        >
          Case Name or Number{" "}
          <span className="font-normal text-navy-400">(optional)</span>
        </label>
        <input
          type="text"
          id="caseName"
          value={caseName}
          onChange={(e) => setCaseName(e.target.value)}
          placeholder="e.g., Smith v. Jones or 24-CVS-1234"
          className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-sm
                     text-navy-800 placeholder:text-navy-300
                     focus:ring-2 focus:ring-gold-500 focus:border-gold-500
                     outline-none transition-colors"
        />
        <p className="mt-1 text-xs text-navy-400">
          Included in calendar events and receipt exports
        </p>
      </div>

      {/* ── Error Message ──────────────────────────────────── */}
      {error && (
        <div
          className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* ── Submit Button ──────────────────────────────────── */}
      <button
        type="submit"
        disabled={!isValid}
        className="w-full py-3 rounded-lg font-semibold text-sm transition-colors
                   disabled:bg-navy-100 disabled:text-navy-400 disabled:cursor-not-allowed
                   bg-gold-500 text-navy-950 hover:bg-gold-400 active:bg-gold-600
                   focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
      >
        Calculate Deadline
      </button>
    </form>
  );
}
