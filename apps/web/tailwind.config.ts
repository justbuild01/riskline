import type { Config } from "tailwindcss";
import { colors, radii } from "../../packages/config/design-tokens";

// Tokens approved via the Section 8 human checkpoint (see SESSION_REPORT.md,
// Session 4 style history entry) — sourced from packages/config/design-tokens.ts,
// not restated here.
const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: colors.bg,
        surface: colors.surface,
        accent: colors.accent,
        correlated: colors.correlated,
        diversifying: colors.diversifying,
        ink: colors.text,
        "ink-muted": colors.textMuted,
        border: colors.border,
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)"],
        body: ["var(--font-plex-sans)"],
      },
      borderRadius: {
        panel: radii.panel,
        control: radii.control,
      },
    },
  },
  plugins: [],
};

export default config;
