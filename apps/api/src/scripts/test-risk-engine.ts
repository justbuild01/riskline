import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { PortfolioSnapshotRecord } from "@repo/types";
import { computeRiskReport } from "../lib/risk/compute";

/**
 * Usage: pnpm --filter api test:risk-engine
 *
 * Runs the risk engine against a fabricated fixture (BTC/ETH/USDT/SOL, one
 * asset deliberately missing price data) and checks a handful of known
 * properties of the output. This is the pipeline's stand-in for a live
 * testnet run — verified in the sandbox this was built in; re-run here to
 * confirm it still holds in your environment before trusting real output.
 */
function main() {
  const fixturePath = join(__dirname, "..", "fixtures", "sample-snapshot.json");
  const snapshot: PortfolioSnapshotRecord = JSON.parse(readFileSync(fixturePath, "utf-8"));

  const report = computeRiskReport(snapshot);
  console.log(JSON.stringify(report, null, 2));

  const checks: [string, boolean][] = [
    ["total USD value is 57750", report.totalUsdValue === 57750],
    ["BTC is top holding", report.topHolding.asset === "BTC"],
    ["exactly one correlation pair (BTC-ETH)", report.correlations.length === 1],
    [
      "BTC-ETH correlation is strongly positive",
      (report.correlations[0]?.correlation ?? 0) > 0.8,
    ],
    [
      "USDT treated as 0-vol, not missing",
      report.assets.find((a) => a.asset === "USDT")?.volatility === 0,
    ],
    [
      "SOL flagged as missing price data",
      report.assets.find((a) => a.asset === "SOL")?.hasReturnData === false,
    ],
    [
      "PARTIAL_COVERAGE warning present",
      report.warnings.some((w) => w.code === "PARTIAL_COVERAGE"),
    ],
    [
      "portfolio volatility is a finite positive number",
      typeof report.portfolioVolatility === "number" &&
        Number.isFinite(report.portfolioVolatility) &&
        report.portfolioVolatility > 0,
    ],
  ];

  console.log("\n=== Checks ===");
  let allPassed = true;
  for (const [label, passed] of checks) {
    console.log(`${passed ? "PASS" : "FAIL"} — ${label}`);
    if (!passed) allPassed = false;
  }

  if (!allPassed) {
    console.error("\nOne or more checks failed — do not trust the risk engine until fixed.");
    process.exit(1);
  }
}

main();
