# Pulling a Portfolio Snapshot via Binance Agent OS

`apps/api` never talks to Binance directly (see `SESSION_REPORT.md`, Session 2, for why). Instead,
you run this prompt in an actual Binance-supported AI client, save its JSON output to a file, then
load that file into Supabase with a script. This is the real "AI agent" part of the submission.

## 1. Connect a supported client to Binance Agent OS (one-time)

Pick whichever you have: **Claude Code** (recommended — supports headless re-runs), Claude
Desktop, or ChatGPT. Follow Binance's own setup steps for that client at
https://developers.binance.com/en/docs/agent-native/mcp-server/agentic — this includes a one-time
OAuth consent screen tied to your Binance account. Do this once; the connection persists after.

## 2. Run this prompt

```
Using the Binance Agent OS MCP tools, do the following. This is a READ-ONLY task — do not call
any order, trade, transfer, or withdrawal tool, ever, even if one is available to you.

1. Fetch my agentic sub-account's current holdings (every asset with a non-zero free or locked
   balance), and an estimated USD value for each.
2. For each held asset, fetch its daily closing price in USDT for the last 30 days (e.g. BTCUSDT,
   ETHUSDT). If a direct USDT pair doesn't exist for an asset, note that and skip its price series.
3. Output ONLY a single JSON object, no other text, in exactly this shape:

{
  "snapshotTakenAt": "<current UTC ISO 8601 timestamp>",
  "accountMode": "mainnet-read-only",
  "holdings": [
    { "asset": "BTC", "free": 0.05, "locked": 0, "usdValue": 3200.50 }
  ],
  "marketData": [
    { "symbol": "BTCUSDT", "series": [
      { "timestamp": "2026-08-07T00:00:00Z", "close": 61234.5 },
      { "timestamp": "2026-08-08T00:00:00Z", "close": 62012.1 }
    ]}
  ]
}
```

## 3. Save the output and ingest it

Save the JSON output to a file, e.g. `snapshot.json`, then from the repo root:

```bash
pnpm --filter api ingest ./snapshot.json
```

This validates the payload and writes it to the `portfolio_snapshots` table. Re-run steps 2–3
any time you want a fresh snapshot for the demo.

## Why this exists (not a shortcut around the ruleset)

Binance's Agent OS MCP server is only reachable through its own OAuth-registered client apps —
not from an arbitrary custom backend with a stored API key. `apps/api` was originally going to be
its own MCP client (the "Full-stack pattern" default); that assumption was corrected mid-Session 2
once the actual docs were checked. See `SESSION_REPORT.md` for the full note.
