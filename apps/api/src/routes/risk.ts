import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Router } from "express";
import type { ApiResponse, PortfolioSnapshotRecord, RiskReport } from "@repo/types";
import { getSupabase } from "../lib/supabase";
import { computeRiskReport } from "../lib/risk/compute";
import { generateRiskNarrative } from "../lib/kimi";

export const riskRouter = Router();

function loadSampleSnapshot(): PortfolioSnapshotRecord {
  const fixturePath = join(__dirname, "..", "fixtures", "sample-snapshot.json");
  return JSON.parse(readFileSync(fixturePath, "utf-8"));
}

async function loadLatestSnapshotForUser(): Promise<PortfolioSnapshotRecord | null> {
  const userId = process.env.TARGET_USER_ID;
  if (!userId) {
    throw new Error("TARGET_USER_ID is not configured on the server");
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("*")
    .eq("user_id", userId)
    .order("snapshot_taken_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`internal error fetching latest snapshot: ${error.message}`);
  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    createdAt: data.created_at,
    snapshotTakenAt: data.snapshot_taken_at,
    accountMode: data.account_mode,
    holdings: data.holdings,
    marketData: data.market_data,
  };
}

/** Demo/dev endpoint: runs the fixed sample fixture through the risk engine. No DB needed. */
riskRouter.get("/sample", (_req, res) => {
  const report = computeRiskReport(loadSampleSnapshot());
  const body: ApiResponse<RiskReport> = { ok: true, data: report };
  res.json(body);
});

/** Real endpoint: computes risk for the most recent ingested snapshot. */
riskRouter.get("/latest", async (_req, res) => {
  try {
    const snapshot = await loadLatestSnapshotForUser();
    if (!snapshot) {
      const body: ApiResponse<never> = {
        ok: false,
        error: { message: "no snapshot found yet — run the ingest step first", code: "NO_SNAPSHOT" },
      };
      res.status(404).json(body);
      return;
    }
    const report = computeRiskReport(snapshot);
    const body: ApiResponse<RiskReport> = { ok: true, data: report };
    res.json(body);
  } catch (err) {
    console.error("GET /risk/latest failed:", err);
    const body: ApiResponse<never> = { ok: false, error: { message: "internal error" } };
    res.status(500).json(body);
  }
});

/** Sample snapshot + Kimi narrative together — no DB or Binance data needed, good for UI dev. */
riskRouter.get("/sample/narrative", async (_req, res) => {
  try {
    const report = computeRiskReport(loadSampleSnapshot());
    const narrative = await generateRiskNarrative(report);
    const body: ApiResponse<{ report: RiskReport; narrative: string }> = {
      ok: true,
      data: { report, narrative },
    };
    res.json(body);
  } catch (err) {
    console.error("GET /risk/sample/narrative failed:", err);
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: err instanceof Error ? err.message : "internal error" },
    };
    res.status(500).json(body);
  }
});

/** Real snapshot + Kimi narrative together. */
riskRouter.get("/latest/narrative", async (_req, res) => {
  try {
    const snapshot = await loadLatestSnapshotForUser();
    if (!snapshot) {
      const body: ApiResponse<never> = {
        ok: false,
        error: { message: "no snapshot found yet — run the ingest step first", code: "NO_SNAPSHOT" },
      };
      res.status(404).json(body);
      return;
    }
    const report = computeRiskReport(snapshot);
    const narrative = await generateRiskNarrative(report);
    const body: ApiResponse<{ report: RiskReport; narrative: string }> = {
      ok: true,
      data: { report, narrative },
    };
    res.json(body);
  } catch (err) {
    console.error("GET /risk/latest/narrative failed:", err);
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: err instanceof Error ? err.message : "internal error" },
    };
    res.status(500).json(body);
  }
});
