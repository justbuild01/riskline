import type {
  PortfolioSnapshotRecord,
  MarketSeries,
  PricePoint,
  RiskReport,
  AssetRiskDetail,
  CorrelationEntry,
  RiskWarning,
} from "@repo/types";
import { toReturns, stddev, pearsonCorrelation } from "./stats";

const STABLECOINS = new Set(["USDT", "USDC", "BUSD", "DAI", "FDUSD", "TUSD", "USDP"]);
// Crypto markets trade every day of the year, unlike equities' ~252 trading days.
const DAYS_PER_YEAR = 365;
const MIN_ALIGNED_POINTS_FOR_CORRELATION = 3;

function findSeriesForAsset(
  asset: string,
  marketData: MarketSeries[]
): MarketSeries | undefined {
  const expectedSymbol = `${asset.toUpperCase()}USDT`;
  return marketData.find((s) => s.symbol.toUpperCase() === expectedSymbol);
}

/** Aligns two price series on shared timestamps, discarding unmatched points. */
function alignByTimestamp(
  a: PricePoint[],
  b: PricePoint[]
): { closesA: number[]; closesB: number[] } {
  const mapB = new Map(b.map((p) => [p.timestamp, p.close]));
  const closesA: number[] = [];
  const closesB: number[] = [];
  for (const point of a) {
    const match = mapB.get(point.timestamp);
    if (match !== undefined) {
      closesA.push(point.close);
      closesB.push(match);
    }
  }
  return { closesA, closesB };
}

export function computeRiskReport(snapshot: PortfolioSnapshotRecord): RiskReport {
  const warnings: RiskWarning[] = [];
  const totalUsdValue = snapshot.holdings.reduce((sum, h) => sum + h.usdValue, 0);

  if (totalUsdValue <= 0) {
    warnings.push({
      code: "ZERO_PORTFOLIO_VALUE",
      message: "Total portfolio USD value is zero or negative; weights cannot be computed.",
    });
  }

  const assetReturns = new Map<string, number[]>();

  const assets: AssetRiskDetail[] = snapshot.holdings.map((holding) => {
    const weight = totalUsdValue > 0 ? holding.usdValue / totalUsdValue : 0;
    const isStablecoin = STABLECOINS.has(holding.asset.toUpperCase());
    const series = findSeriesForAsset(holding.asset, snapshot.marketData);

    let volatility: number | null = null;
    let hasReturnData = false;

    if (isStablecoin) {
      // Treated as known-near-zero volatility, not "missing data" — a real
      // distinction worth keeping separate in the warnings below.
      volatility = 0;
      hasReturnData = true;
    } else if (series && series.series.length >= 2) {
      const closes = series.series.map((p) => p.close);
      const returns = toReturns(closes);
      if (returns.length >= 2) {
        volatility = stddev(returns) * Math.sqrt(DAYS_PER_YEAR);
        assetReturns.set(holding.asset, returns);
        hasReturnData = true;
      }
    }

    if (!isStablecoin && !hasReturnData) {
      warnings.push({
        code: "MISSING_PRICE_DATA",
        message: `No usable price series for ${holding.asset} — excluded from volatility and correlation, but still counted toward concentration weight.`,
      });
    }

    return { asset: holding.asset, weight, usdValue: holding.usdValue, volatility, hasReturnData, isStablecoin };
  });

  const herfindahlIndex =
    totalUsdValue > 0 ? assets.reduce((sum, a) => sum + a.weight * a.weight, 0) : 0;
  const effectiveAssetCount = herfindahlIndex > 0 ? 1 / herfindahlIndex : 0;

  const topHolding = assets.reduce(
    (top, a) => (a.weight > top.weight ? { asset: a.asset, weight: a.weight } : top),
    { asset: "", weight: 0 }
  );

  // Correlations only between non-stablecoin assets that both have usable return data —
  // a stablecoin's return series is degenerate (all ~0), so its correlation is meaningless noise.
  const correlatable = assets.filter((a) => a.hasReturnData && !a.isStablecoin);
  const correlations: CorrelationEntry[] = [];
  const corrLookup = new Map<string, number>();

  for (let i = 0; i < correlatable.length; i++) {
    for (let j = i + 1; j < correlatable.length; j++) {
      const assetA = correlatable[i].asset;
      const assetB = correlatable[j].asset;
      const seriesA = findSeriesForAsset(assetA, snapshot.marketData)!;
      const seriesB = findSeriesForAsset(assetB, snapshot.marketData)!;
      const { closesA, closesB } = alignByTimestamp(seriesA.series, seriesB.series);

      if (closesA.length < MIN_ALIGNED_POINTS_FOR_CORRELATION) {
        warnings.push({
          code: "INSUFFICIENT_ALIGNED_DATA",
          message: `${assetA} and ${assetB} share fewer than ${MIN_ALIGNED_POINTS_FOR_CORRELATION} overlapping dates — correlation skipped.`,
        });
        continue;
      }

      const corr = pearsonCorrelation(toReturns(closesA), toReturns(closesB));
      if (corr !== null) {
        correlations.push({ assetA, assetB, correlation: corr });
        corrLookup.set(`${assetA}|${assetB}`, corr);
        corrLookup.set(`${assetB}|${assetA}`, corr);
      }
    }
  }

  // Portfolio volatility via full weighted covariance, renormalized over only the
  // assets that actually have volatility data (stablecoins count in as 0-vol, not excluded).
  const usableAssets = assets.filter((a) => a.hasReturnData);
  const usableWeightSum = usableAssets.reduce((sum, a) => sum + a.weight, 0);
  let portfolioVolatility: number | null = null;

  if (usableAssets.length > 0 && usableWeightSum > 0) {
    let variance = 0;
    for (const a of usableAssets) {
      for (const b of usableAssets) {
        const wa = a.weight / usableWeightSum;
        const wb = b.weight / usableWeightSum;
        const stdA = a.volatility ?? 0;
        const stdB = b.volatility ?? 0;
        const corr = a.asset === b.asset ? 1 : corrLookup.get(`${a.asset}|${b.asset}`) ?? 0;
        variance += wa * wb * stdA * stdB * corr;
      }
    }
    portfolioVolatility = Math.sqrt(Math.max(variance, 0));

    if (usableWeightSum < 0.99) {
      warnings.push({
        code: "PARTIAL_COVERAGE",
        message: `Portfolio volatility is based on ${(usableWeightSum * 100).toFixed(0)}% of portfolio value — the rest lacks price data and was excluded rather than assumed safe.`,
      });
    }
  } else {
    warnings.push({
      code: "NO_VOLATILITY_DATA",
      message: "No assets had usable price data; portfolio volatility could not be computed.",
    });
  }

  return {
    snapshotId: snapshot.id,
    snapshotTakenAt: snapshot.snapshotTakenAt,
    totalUsdValue,
    assets,
    herfindahlIndex,
    effectiveAssetCount,
    topHolding,
    portfolioVolatility,
    correlations,
    warnings,
  };
}
