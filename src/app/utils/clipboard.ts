/**
 * Clipboard Utility
 *
 * Formats computation output as a plain-text receipt and copies it
 * to the clipboard. The formatting function is exported separately
 * for testability.
 */

import type { ComputeOutput } from "../../engine/types";

/**
 * Formats the computation output as a plain-text receipt string.
 * Pure function — no side effects, fully testable.
 */
export function formatReceipt(output: ComputeOutput): string {
  const serviceMethodLabel =
    output.serviceMethod === "hand"
      ? "Hand Delivery"
      : output.serviceMethod === "mail"
        ? "U.S. Mail"
        : "Email";

  return [
    `DEADLINE: ${output.deadlineAction}`,
    ...(output.caseName ? [`Case: ${output.caseName}`] : []),
    `Due: ${output.deadlineFormatted} (${output.deadlineDay})`,
    "",
    `Rule: ${output.ruleName} — ${output.steps[1]?.citation ?? ""}`,
    `Service Date: ${output.serviceDate}`,
    `Service Method: ${serviceMethodLabel}`,
    `Court: ${output.court === "COA" ? "NC Court of Appeals" : "NC Supreme Court"}`,
    "",
    "Computation Steps:",
    ...output.steps.map(
      (s) =>
        `  ${s.stepNumber}. ${s.label}: ${s.description}` +
        `\n     Citation: ${s.citation}`,
    ),
    "",
    `Rule Pack: v${output.rulePackVersion}`,
    `Computed: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}`,
    "",
    "---",
    "NC Appellate Deadline Calculator",
    "This tool is for reference only. Always verify deadlines independently.",
  ].join("\n");
}

/**
 * Formats the computation output as a plain-text receipt
 * and copies it to the clipboard.
 *
 * Returns true if the copy succeeded.
 */
export async function copyReceiptToClipboard(
  output: ComputeOutput,
): Promise<boolean> {
  const text = formatReceipt(output);

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers without Clipboard API
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  }
}
