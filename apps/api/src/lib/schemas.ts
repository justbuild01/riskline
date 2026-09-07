import { z } from "zod";

export const portfolioHoldingSchema = z.object({
  asset: z.string().min(1),
  free: z.number().nonnegative(),
  locked: z.number().nonnegative(),
  usdValue: z.number().nonnegative(),
});

export const pricePointSchema = z.object({
  timestamp: z.string().datetime(),
  close: z.number().nonnegative(),
});

export const marketSeriesSchema = z.object({
  symbol: z.string().min(1),
  series: z.array(pricePointSchema).min(2, "need at least 2 points to compute returns"),
});

export const portfolioSnapshotInputSchema = z.object({
  snapshotTakenAt: z.string().datetime(),
  accountMode: z.enum(["mainnet-read-only", "testnet"]),
  holdings: z.array(portfolioHoldingSchema).min(1),
  marketData: z.array(marketSeriesSchema).min(1),
});

export type ValidatedPortfolioSnapshotInput = z.infer<
  typeof portfolioSnapshotInputSchema
>;
