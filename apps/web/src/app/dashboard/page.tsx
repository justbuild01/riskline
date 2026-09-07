"use client";

import * as React from "react";
import type { RiskReport } from "@repo/types";
import {
  Logo,
  Gauge,
  CorrelationClusterMap,
  HoldingsList,
  NarrativePanel,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  type NarrativeStatus,
} from "@repo/ui";

type LoadStatus = "loading" | "ready" | "error";

interface NarrativeResult {
  report: RiskReport;
  narrative: string;
}

async function fetchRiskAndNarrative(apiUrl: string): Promise<{
  data: NarrativeResult;
  usingSample: boolean;
}> {
  const latestRes = await fetch(`${apiUrl}/risk/latest/narrative`, { cache: "no-store" });

  if (latestRes.ok) {
    const body = await latestRes.json();
    if (body.ok) return { data: body.data, usingSample: false };
    throw new Error(body.error?.message ?? "unknown error from /risk/latest/narrative");
  }

  if (latestRes.status !== 404) {
    let message = `/risk/latest/narrative failed with status ${latestRes.status}`;
    try {
      const errBody = await latestRes.json();
      if (errBody?.error?.message) message = errBody.error.message;
    } catch {
      // response wasn't JSON — keep the generic status message
    }
    throw new Error(message);
  }

  // No real snapshot ingested yet — fall back to the sample fixture rather
  // than showing a dead dashboard (ruleset 8.5: empty states explain what
  // happened and what to do next).
  const sampleRes = await fetch(`${apiUrl}/risk/sample/narrative`, { cache: "no-store" });
  if (!sampleRes.ok) {
    throw new Error(`/risk/sample/narrative failed with status ${sampleRes.status}`);
  }
  const sampleBody = await sampleRes.json();
  if (!sampleBody.ok) {
    throw new Error(sampleBody.error?.message ?? "unknown error from /risk/sample/narrative");
  }
  return { data: sampleBody.data, usingSample: true };
}

export default function DashboardPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  const [status, setStatus] = React.useState<LoadStatus>("loading");
  const [result, setResult] = React.useState<NarrativeResult | null>(null);
  const [usingSample, setUsingSample] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  const load = React.useCallback(() => {
    setStatus("loading");
    fetchRiskAndNarrative(apiUrl)
      .then(({ data, usingSample }) => {
        setResult(data);
        setUsingSample(usingSample);
        setStatus("ready");
      })
      .catch((err) => {
        setErrorMessage(err instanceof Error ? err.message : "unknown error");
        setStatus("error");
      });
  }, [apiUrl]);

  React.useEffect(() => {
    load();
  }, [load]);

  const narrativeStatus: NarrativeStatus =
    status === "loading" ? "loading" : status === "error" ? "error" : "ready";

  return (
    <main className="min-h-screen bg-bg px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <Logo className="h-8 w-auto text-ink" />
          <div className="flex items-center gap-3">
            {result && (
              <span className="hidden font-body text-xs text-ink-muted sm:inline">
                snapshot: {new Date(result.report.snapshotTakenAt).toLocaleString()}
              </span>
            )}
            <Button size="sm" variant="secondary" onClick={load} disabled={status === "loading"}>
              {status === "loading" ? "Refreshing…" : "Refresh"}
            </Button>
          </div>
        </header>

        {usingSample && status === "ready" && (
          <div className="rounded-panel border border-accent/40 bg-surface px-4 py-3 font-body text-sm text-ink-muted">
            Showing sample data — no portfolio snapshot has been ingested yet. Run the Agent OS
            pull (see <code>docs/agent-os-data-pull-prompt.md</code>) and refresh to see your own.
          </div>
        )}

        {status === "error" && (
          <div className="rounded-panel border border-correlated/40 bg-surface px-4 py-3 font-body text-sm text-ink">
            Couldn&apos;t load the dashboard: {errorMessage}. Check that <code>apps/api</code> is
            running and reachable at <code>{apiUrl}</code>, then hit Refresh.
          </div>
        )}

        {status !== "error" && (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <GaugeCard
                label="Concentration"
                fraction={result?.report.herfindahlIndex ?? 0}
                displayValue={result ? result.report.herfindahlIndex.toFixed(2) : "—"}
                color="#E8A93B"
              />
              <GaugeCard
                label="Volatility (ann.)"
                fraction={Math.min(result?.report.portfolioVolatility ?? 0, 1)}
                displayValue={
                  result?.report.portfolioVolatility != null
                    ? `${Math.round(result.report.portfolioVolatility * 100)}%`
                    : "—"
                }
                color="#E8654F"
              />
              <GaugeCard
                label="Effective assets"
                fraction={
                  result
                    ? result.report.effectiveAssetCount / Math.max(result.report.assets.length, 1)
                    : 0
                }
                displayValue={result ? result.report.effectiveAssetCount.toFixed(1) : "—"}
                color="#4FB8A8"
              />
              <GaugeCard
                label={result ? `Top: ${result.report.topHolding.asset}` : "Top holding"}
                fraction={result?.report.topHolding.weight ?? 0}
                displayValue={result ? `${Math.round(result.report.topHolding.weight * 100)}%` : "—"}
                color="#E8A93B"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Correlation cluster map</CardTitle>
                </CardHeader>
                <CardContent>
                  {result ? (
                    <CorrelationClusterMap
                      assets={result.report.assets}
                      correlations={result.report.correlations}
                    />
                  ) : (
                    <div className="h-[300px] animate-pulse rounded-panel bg-bg" />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Holdings</CardTitle>
                </CardHeader>
                <CardContent>
                  {result ? (
                    <HoldingsList assets={result.report.assets} />
                  ) : (
                    <div className="h-[200px] animate-pulse rounded-panel bg-bg" />
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Risk summary</CardTitle>
              </CardHeader>
              <CardContent>
                <NarrativePanel status={narrativeStatus} narrative={result?.narrative} />
              </CardContent>
            </Card>

            {result && result.report.warnings.length > 0 && (
              <p className="font-body text-xs text-ink-muted">
                {result.report.warnings.map((w) => w.message).join(" ")}
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function GaugeCard({
  label,
  fraction,
  displayValue,
  color,
}: {
  label: string;
  fraction: number;
  displayValue: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-center pt-4">
        <Gauge label={label} fraction={fraction} displayValue={displayValue} color={color} />
      </CardContent>
    </Card>
  );
}
