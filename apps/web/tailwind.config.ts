import type { Config } from "tailwindcss";

// Base config only. Design tokens (colors, type scale, radii) are added
// during the dedicated UI session per ruleset Section 8 — not guessed here.
const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
