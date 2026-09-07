import type { RiskReport } from "@repo/types";

const HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions";
const DEFAULT_MODEL = "moonshotai/Kimi-K2-Instruct";

/**
 * Calls Kimi (Moonshot AI) via Hugging Face's OpenAI-compatible Inference
 * Providers router (verified this session: https://router.huggingface.co/v1,
 * bearer auth with an HF token that has "Make calls to Inference Providers"
 * permission). The exact model id/backend-provider pairing HF routes Kimi
 * through shifts over time (seen: moonshotai/Kimi-K2-Instruct,
 * moonshotai/Kimi-K2.6:together, moonshotai/Kimi-K2.6:deepinfra) — configurable
 * via HF_KIMI_MODEL rather than hardcoded, so this doesn't quietly break.
 */
export async function generateRiskNarrative(report: RiskReport): Promise<string> {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error("HF_TOKEN is not set — required to call Kimi via Hugging Face Inference.");
  }

  const model = process.env.HF_KIMI_MODEL || DEFAULT_MODEL;

  const systemPrompt =
    "You are a plain-spoken portfolio risk analyst. You explain, in a few short paragraphs, " +
    "what a portfolio's concentration, correlation, and volatility numbers actually mean for the " +
    "person holding it. You never tell the user what to buy or sell, never give investment advice " +
    "or price predictions — you describe the risk exposure that is already there, factually and " +
    "specifically, using the real numbers given to you. Plain language, no filler, no hype.";

  const userPrompt =
    `Here is a computed risk report for a crypto portfolio:\n\n${JSON.stringify(report, null, 2)}` +
    "\n\nExplain what this means in 3-4 short paragraphs: (1) how concentrated the portfolio is " +
    "and in what, (2) which holdings move together and what that means for diversification, " +
    "(3) what the overall volatility number implies, (4) any data-coverage caveats from the " +
    "warnings, stated plainly.";

  const response = await fetch(HF_ROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6, // Moonshot's own recommended default for Kimi-K2-Instruct
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Hugging Face Inference request failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || content.length === 0) {
    throw new Error("Hugging Face Inference returned an empty response.");
  }

  return content;
}
