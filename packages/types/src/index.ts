/**
 * Shared, theme-agnostic types. Portfolio/risk/Agent OS-specific types are
 * intentionally NOT here yet — those get added in Session 2+ when that logic
 * is actually built, per the ruleset's "no invented scope" rule.
 */

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string; code?: string } };

export interface HealthCheckResponse {
  status: "ok";
  service: string;
  timestamp: string;
}

export interface AppUser {
  id: string;
  email: string;
}

/**
 * Session 2: shapes for the portfolio/market data snapshot pulled from
 * Binance Agent OS by whichever supported AI client (Claude Code, Claude
 * Desktop, ChatGPT, etc.) the builder runs — see docs/agent-os-data-pull-prompt.md.
 * These are NOT fetched by apps/api directly; apps/api only ever receives
 * and stores this already-assembled JSON.
 */

export interface PortfolioHolding {
  asset: string; // e.g. "BTC"
  free: number;
  locked: number;
  usdValue: number; // estimated USD value at snapshot time
}

export interface PricePoint {
  timestamp: string; // ISO 8601
  close: number;
}

export interface MarketSeries {
  symbol: string; // e.g. "BTCUSDT"
  series: PricePoint[]; // daily closes, oldest first — used for correlation calc
}

export type AccountMode = "mainnet-read-only" | "testnet";

export interface PortfolioSnapshotInput {
  snapshotTakenAt: string; // ISO 8601
  accountMode: AccountMode;
  holdings: PortfolioHolding[];
  marketData: MarketSeries[];
}

export interface PortfolioSnapshotRecord extends PortfolioSnapshotInput {
  id: string;
  userId: string;
  createdAt: string;
}

/**
 * Session 3: risk/correlation engine output. Computed from a stored
 * PortfolioSnapshotRecord — see apps/api/src/lib/risk/compute.ts.
 */

export interface RiskWarning {
  code: string;
  message: string;
}

export interface AssetRiskDetail {
  asset: string;
  weight: number; // usdValue / totalUsdValue
  usdValue: number;
  volatility: number | null; // annualized stddev of daily returns; null if unavailable
  hasReturnData: boolean;
  isStablecoin: boolean;
}

export interface CorrelationEntry {
  assetA: string;
  assetB: string;
  correlation: number; // -1..1
}

export interface RiskReport {
  snapshotId: string;
  snapshotTakenAt: string;
  totalUsdValue: number;
  assets: AssetRiskDetail[];
  herfindahlIndex: number; // 0..1, higher = more concentrated
  effectiveAssetCount: number; // 1 / HHI — intuitive "how many equal-sized assets" read
  topHolding: { asset: string; weight: number };
  portfolioVolatility: number | null; // annualized, weighted + correlation-adjusted
  correlations: CorrelationEntry[];
  warnings: RiskWarning[];
}
