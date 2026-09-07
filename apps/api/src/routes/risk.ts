import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Router } from "express";
import type { ApiResponse, PortfolioSnapshotRecord, RiskReport } from "@repo/types";
import { getSupabase } from "../lib/supabase";
import { computeRiskReport } from "../lib/risk/compute";

export const riskRouter = Router();

/** Demo/dev endpoint: runs the fixed sample fixture through the risk engine. No DB needed. */
riskRouter.get("/sample", (_req, res) => {
  const fixturePath = join(__dirname, "..", "fixtures", "sample-snapshot.json");
  const snapshot: PortfolioSnapshotRecord = JSON.parse(readFileSync(fixturePath, "utf-8"));
  const report = computeRiskReport(snapshot);
  const body: ApiResponse<RiskReport> = { ok: true, data: report };
  res.json(body);
});

/** Real endpoint: computes risk for the most recent ingested snapshot. */
riskRouter.get("/latest", async (_req, res) => {
  const userId = process.env.TARGET_USER_ID;
  if (!userId) {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "TARGET_USER_ID is not configured on the server" },
    };
    res.status(500).json(body);
    return;
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("*")
    .eq("user_id", userId)
    .order("snapshot_taken_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("failed to fetch latest snapshot:", error);
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "internal error fetching latest snapshot" },
    };
    res.status(500).json(body);
    return;
  }

  if (!data) {
    const body: ApiResponse<never> = {
      ok: false,
      error: {
        message: "no snapshot found for this user yet — run the ingest step first",
        code: "NO_SNAPSHOT",
      },
    };
    res.status(404).json(body);
    return;
  }

  const snapshot: PortfolioSnapshotRecord = {
    id: data.id,
    userId: data.user_id,
    createdAt: data.created_at,
    snapshotTakenAt: data.snapshot_taken_at,
    accountMode: data.account_mode,
    holdings: data.holdings,
    marketData: data.market_data,
  };

  const report = computeRiskReport(snapshot);
  const body: ApiResponse<RiskReport> = { ok: true, data: report };
  res.json(body);
});
