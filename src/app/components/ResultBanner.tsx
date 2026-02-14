/**
 * Result Banner
 *
 * The big, confident display of the computed deadline.
 * Shows the date, day of week, and a "days from today" counter.
 */

import type { ComputeOutput } from "../../engine/types";

interface ResultBannerProps {
  output: ComputeOutput;
}

export function ResultBanner({ output }: ResultBannerProps) {
  const daysUntil = computeDaysUntil(output.deadline);

  return (
    <div className="bg-navy-900 text-white px-6 py-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
        {output.deadlineAction}
      </p>
      <p className="mt-4 text-4xl font-heading font-bold leading-tight">
        {output.deadlineFormatted}
      </p>
      <p className="mt-1 text-lg text-navy-100/70">{output.deadlineDay}</p>
      {daysUntil !== null && (
        <p className="mt-3 text-sm text-navy-100/50">
          {daysUntil === 0
            ? "Deadline is today"
            : daysUntil > 0
              ? `${daysUntil} day${daysUntil === 1 ? "" : "s"} from today`
              : `${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? "" : "s"} ago`}
        </p>
      )}
    </div>
  );
}

function computeDaysUntil(isoDate: string): number | null {
  try {
    const [y, m, d] = isoDate.split("-").map(Number);
    const deadline = new Date(y, m - 1, d, 12, 0, 0);
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const diffMs = deadline.getTime() - today.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}
