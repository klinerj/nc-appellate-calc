/**
 * Audit Trail Component
 *
 * Displays the step-by-step computation with legal citations.
 * This is the core value proposition — every calculation shows its work.
 *
 * Steps that changed the date get gold number badges.
 * Steps that didn't (informational) get gray badges.
 */

import type { ComputeStep } from "../../engine/types";

interface AuditTrailProps {
  steps: ComputeStep[];
  rulePackVersion: string;
}

export function AuditTrail({ steps, rulePackVersion }: AuditTrailProps) {
  return (
    <div className="px-6 py-6 border-t border-navy-100">
      <h2 className="font-heading text-lg font-bold text-navy-900 mb-1">
        Computation Details
      </h2>
      <p className="text-xs text-navy-400 mb-5">
        Rule Pack v{rulePackVersion} — every step cites its authority
      </p>

      <ol className="space-y-5">
        {steps.map((step) => (
          <li key={step.stepNumber} className="relative pl-9">
            {/* Step number badge */}
            <span
              className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center
                          justify-center text-xs font-bold
                          ${
                            step.isAdjustment
                              ? "bg-gold-500 text-navy-950"
                              : "bg-navy-100 text-navy-500"
                          }`}
            >
              {step.stepNumber}
            </span>

            {/* Step content */}
            <div>
              <p className="text-sm font-semibold text-navy-800">
                {step.label}
              </p>
              <p className="text-sm text-navy-600 mt-0.5 leading-relaxed">
                {step.description}
              </p>
              <p className="text-xs text-navy-400 mt-1">
                <span className="italic">{step.citation}</span>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
