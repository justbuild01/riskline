import "dotenv/config";
import { readFileSync } from "node:fs";
import { ingestPortfolioSnapshot, IngestValidationError } from "../lib/ingest";

/**
 * Usage: pnpm --filter api ingest ./path/to/snapshot.json
 *
 * Loads a JSON file matching PortfolioSnapshotInput (see
 * docs/agent-os-data-pull-prompt.md for how to produce one) and writes it
 * to Supabase. Calls the same ingestPortfolioSnapshot() function the HTTP
 * route uses, so validation/storage logic can't drift between the two.
 */
async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error("Usage: pnpm --filter api ingest ./path/to/snapshot.json");
    process.exit(1);
  }

  const raw = readFileSync(filePath, "utf-8");
  const payload = JSON.parse(raw);

  try {
    const record = await ingestPortfolioSnapshot(payload);
    console.log("Snapshot ingested:", record.id);
  } catch (err) {
    if (err instanceof IngestValidationError) {
      console.error("Validation failed:");
      console.error(JSON.stringify(err.zodError.flatten(), null, 2));
      process.exit(1);
    }
    throw err;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
