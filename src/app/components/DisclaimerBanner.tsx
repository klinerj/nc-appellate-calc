/**
 * Disclaimer Banner
 *
 * Persistent legal disclaimer shown on every page state.
 * This is non-negotiable for a legal tool — users must always see
 * that this is for reference only.
 */

import type { ComputeOutput } from "../../engine/types";

interface DisclaimerBannerProps {
  /** If provided, shows rule-pack-specific warnings */
  output?: ComputeOutput;
}

export function DisclaimerBanner({ output }: DisclaimerBannerProps) {
  return (
    <div className="mt-6 space-y-3">
      {/* Rule pack warnings (only shown with results) */}
      {output && output.warnings.length > 0 && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
          {output.warnings.map((warning, i) => (
            <p key={i} className="text-xs text-amber-800 leading-relaxed">
              {i > 0 && <br />}
              {warning}
            </p>
          ))}
        </div>
      )}

      {/* Permanent disclaimer */}
      <div className="p-4 rounded-lg bg-navy-950/50 border border-navy-800/30">
        <p className="text-xs text-navy-100/60 leading-relaxed">
          <strong className="text-navy-100/80">Disclaimer:</strong> This
          calculator is provided for informational purposes only and does not
          constitute legal advice. Always verify computed deadlines independently
          against the current{" "}
          <a
            href="https://www.nccourts.gov/courts/supreme-court/court-rules/north-carolina-rules-of-appellate-procedure"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-navy-100/80"
          >
            NC Rules of Appellate Procedure
          </a>{" "}
          and the{" "}
          <a
            href="https://www.nccourts.gov/holiday-schedule"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-navy-100/80"
          >
            NC Judicial Branch holiday schedule
          </a>
          . Not legal advice.
        </p>
      </div>
    </div>
  );
}
