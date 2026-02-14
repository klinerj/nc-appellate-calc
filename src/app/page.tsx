"use client";

/**
 * NC Appellate Deadline Calculator — Main Page
 *
 * Single-page calculator with two states:
 *   INPUT  → User fills out the form
 *   RESULT → Shows the deadline, audit trail, and actions
 *
 * The state machine is intentionally simple: one useState,
 * two possible shapes. No routing, no context, no reducers.
 */

import { useState } from "react";
import { CalculatorForm } from "./components/CalculatorForm";
import { ResultBanner } from "./components/ResultBanner";
import { AuditTrail } from "./components/AuditTrail";
import { ActionButtons } from "./components/ActionButtons";
import { DisclaimerBanner } from "./components/DisclaimerBanner";
import type { ComputeOutput } from "../engine/types";

type AppState =
  | { mode: "input" }
  | { mode: "result"; output: ComputeOutput };

export default function Home() {
  const [state, setState] = useState<AppState>({ mode: "input" });

  function handleResult(output: ComputeOutput) {
    setState({ mode: "result", output });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setState({ mode: "input" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-navy-950 to-navy-900">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="px-4 pt-10 pb-6 text-center">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">
          NC Appellate Deadline Calculator
        </h1>
        <p className="mt-2 text-sm text-navy-100/50">
          North Carolina Rules of Appellate Procedure
        </p>
      </header>

      {/* ── Main Content Card ──────────────────────────────── */}
      <div className="mx-auto max-w-lg px-4 pb-12">
        <div className="rounded-xl bg-white shadow-2xl shadow-black/20 overflow-hidden">
          {state.mode === "input" ? (
            <CalculatorForm onResult={handleResult} />
          ) : (
            <>
              <ResultBanner output={state.output} />
              <AuditTrail
                steps={state.output.steps}
                rulePackVersion={state.output.rulePackVersion}
              />
              <ActionButtons output={state.output} />

              {/* New Calculation button */}
              <div className="px-6 pb-6 pt-2">
                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-lg border-2 border-navy-200 text-navy-700
                             font-medium text-sm hover:bg-navy-50 active:bg-navy-100
                             transition-colors"
                >
                  New Calculation
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Disclaimer (always visible) ────────────────── */}
        <DisclaimerBanner
          output={state.mode === "result" ? state.output : undefined}
        />
      </div>
    </main>
  );
}
