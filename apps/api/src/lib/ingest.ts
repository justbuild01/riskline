import { ZodError } from "zod";
import { getSupabase } from "./supabase";
import { portfolioSnapshotInputSchema } from "./schemas";

export class IngestValidationError extends Error {
  constructor(public zodError: ZodError) {
    super("Portfolio snapshot payload failed validation");
  }
}

/**
 * Validates and persists a portfolio snapshot. This is the single place
 * both the HTTP route (src/routes/ingest.ts) and the CLI script
 * (src/scripts/ingest-from-file.ts) go through, so validation and storage
 * logic never drifts between the two entry points.
 *
 * NOTE: single-user hackathon simplification — snapshots are attached to
 * a fixed TARGET_USER_ID env var, not a per-request authenticated user.
 * Flagged in SESSION_REPORT.md; a real multi-user version would derive
 * this from an authenticated session instead.
 */
export async function ingestPortfolioSnapshot(rawPayload: unknown) {
  const parsed = portfolioSnapshotInputSchema.safeParse(rawPayload);
  if (!parsed.success) {
    throw new IngestValidationError(parsed.error);
  }

  const userId = process.env.TARGET_USER_ID;
  if (!userId) {
    throw new Error(
      "TARGET_USER_ID is not set in apps/api/.env — set it to the Supabase auth user id this demo runs as."
    );
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .insert({
      user_id: userId,
      snapshot_taken_at: parsed.data.snapshotTakenAt,
      account_mode: parsed.data.accountMode,
      holdings: parsed.data.holdings,
      market_data: parsed.data.marketData,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }

  return data;
}
