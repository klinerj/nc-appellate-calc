"use client";

/**
 * Action Buttons
 *
 * Three actions available after computing a deadline:
 * 1. Add to Calendar — downloads an .ics file
 * 2. Copy Receipt — copies formatted audit trail to clipboard
 * 3. Print — opens browser print dialog
 */

import { useState } from "react";
import type { ComputeOutput } from "../../engine/types";
import { generateICSContent, downloadICS } from "../utils/ics";
import { copyReceiptToClipboard } from "../utils/clipboard";

interface ActionButtonsProps {
  output: ComputeOutput;
}

export function ActionButtons({ output }: ActionButtonsProps) {
  const [copyLabel, setCopyLabel] = useState("Copy Receipt");

  function handleDownloadICS() {
    const description = output.steps
      .map(
        (s) =>
          `${s.stepNumber}. ${s.label}: ${s.description} [${s.citation}]`,
      )
      .join("\n");

    const content = generateICSContent({
      date: output.deadline,
      summary: `DEADLINE: ${output.deadlineAction}`,
      description: [
        output.deadlineAction,
        `Due: ${output.deadlineFormatted} (${output.deadlineDay})`,
        "",
        `Rule: ${output.ruleName}`,
        `Service Date: ${output.serviceDate}`,
        `Service Method: ${output.serviceMethod}`,
        "",
        "Computation:",
        description,
        "",
        "NC Appellate Deadline Calculator",
      ].join("\n"),
    });

    downloadICS(content, `deadline-${output.deadline}.ics`);
  }

  async function handleCopy() {
    const success = await copyReceiptToClipboard(output);
    if (success) {
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy Receipt"), 2000);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="px-6 py-4 border-t border-navy-100 flex gap-3">
      <button
        onClick={handleDownloadICS}
        className="flex-1 py-2.5 rounded-lg bg-navy-800 text-white text-sm font-medium
                   hover:bg-navy-700 active:bg-navy-900 transition-colors"
      >
        Add to Calendar
      </button>
      <button
        onClick={handleCopy}
        className="flex-1 py-2.5 rounded-lg border border-navy-200 text-navy-800 text-sm
                   font-medium hover:bg-navy-50 active:bg-navy-100 transition-colors"
      >
        {copyLabel}
      </button>
      <button
        onClick={handlePrint}
        className="flex-1 py-2.5 rounded-lg border border-navy-200 text-navy-800 text-sm
                   font-medium hover:bg-navy-50 active:bg-navy-100 transition-colors
                   no-print"
      >
        Print
      </button>
    </div>
  );
}
