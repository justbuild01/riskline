/**
 * Design tokens for Riskline. Approved via the Section 8 checkpoint in
 * SESSION_REPORT.md, Session 4. Single source of truth — Tailwind config
 * and any hand-written SVG components should reference these, not restate
 * hex values inline.
 */

export const colors = {
  bg: "#12172B", // Deep Indigo — background. Depth of a risk instrument, not chart-candy.
  surface: "#1C2447", // Panel Navy — card/panel surfaces, one step up from bg.
  accent: "#E8A93B", // Instrument Amber — primary accent, key numbers, CTAs.
  correlated: "#E8654F", // Heat Coral — high correlation / concentrated risk signal.
  diversifying: "#4FB8A8", // Cool Teal — low/negative correlation, diversification signal.
  text: "#EDE6D8", // Warm Parchment — body text on dark surfaces.
  textMuted: "#A8A3C0", // Muted lavender-grey — secondary text, labels.
  border: "#2C3560", // Subtle panel border/divider.
} as const;

export const fonts = {
  display: "var(--font-space-grotesk)",
  body: "var(--font-plex-sans)",
} as const;

export const radii = {
  panel: "0.75rem",
  control: "0.5rem",
} as const;

export type ColorToken = keyof typeof colors;
