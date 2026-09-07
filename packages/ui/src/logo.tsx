import * as React from "react";

/**
 * Typographic wordmark per ruleset 8.4: custom fixed letter-spacing (a
 * deliberate technical/instrument-panel tracking choice, not a font-metrics
 * workaround) plus one geometric modification — the dot of the second "i"
 * (in "line") replaced with a small amber circle, echoing a node in the
 * correlation cluster map sitting on the "line" of the wordmark.
 */
export function Logo({ className }: { className?: string }) {
  const advance = 30;
  const chars = ["r", "i", "s", "k", "l", "\u0131", "n", "e"]; // \u0131 = dotless i, for the 6th char
  const startX = 10;
  const baselineY = 42;

  return (
    <svg
      viewBox="0 0 260 56"
      className={className}
      role="img"
      aria-label="Riskline"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        fontFamily="var(--font-space-grotesk), sans-serif"
        fontWeight={600}
        fontSize={34}
        fill="currentColor"
      >
        {chars.map((char, i) => (
          <tspan key={i} x={startX + i * advance} y={baselineY}>
            {char}
          </tspan>
        ))}
      </text>
      {/* node dot over the dotless i in "line" */}
      <circle cx={startX + 5 * advance + 8} cy={baselineY - 24} r={4.5} fill="#E8A93B" />
    </svg>
  );
}
