# Portfolio Risk & Correlation Analyzer

Binance Agent OS Mini Hackathon — Track A (Data Analysis). An agent that reads a user's Binance
portfolio and live market data, then explains — in plain English — where their risk is actually
concentrated, instead of just showing a balance.

Built session-by-session per `AGENT_BUILD_RULESET.md`. See `BUILD_ROADMAP.md` for the full session
plan and `SESSION_REPORT.md` for the current state of the codebase (source of truth — don't assume
anything not listed there exists yet).

## Structure

```
apps/
  web/      Next.js app (dashboard, auth, demo UI)
  api/      Express + TypeScript server — receives snapshots, computes risk, never talks to Binance directly
packages/
  types/    Shared TypeScript types
  ui/       Shared UI primitives (shadcn/ui-based, filled in during the UI session)
  config/   Shared eslint/tsconfig base configs
docs/
  agent-os-data-pull-prompt.md   How to actually pull data from Binance Agent OS (see below)
```

**Architecture note:** `apps/api` does not connect to Binance's Agent OS MCP server itself.
Binance's MCP server is only reachable through its own OAuth-registered AI clients (Claude Code,
Claude Desktop, ChatGPT, etc.) — not a custom backend with a stored API key. Instead: you run an
actual supported client against Binance Agent OS to pull a portfolio snapshot as JSON (see
`docs/agent-os-data-pull-prompt.md`), then load that JSON into Supabase with
`pnpm --filter api ingest ./snapshot.json`. `apps/api` takes it from there — risk/correlation math
and, later, the plain-English narrative via Kimi (Hugging Face Inference).

## Setup (local dev)

Requires Node >= 20 and pnpm >= 9.

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
# fill in Supabase project URL + keys in both files, run the SQL in
# supabase/migrations/0001_portfolio_snapshots.sql via the Supabase SQL editor,
# sign up once via the web app, then copy that user's id from Supabase
# Authentication > Users into apps/api/.env as TARGET_USER_ID
pnpm dev
```

- `apps/web` runs on http://localhost:3000
- `apps/api` runs on http://localhost:4000 (health check at `/health`)

## Deploy

- `apps/web` → Vercel (Next.js zero-config)
- `apps/api` → Railway / Render / Fly using `apps/api/Dockerfile`

A basic CI check (install, lint, typecheck, build) runs on push via
`.github/workflows/ci.yml`. It is not yet wired to a live deployment — that is a deliberate
Session 1 stub per the build ruleset, not an oversight.

## Status

This is Session 1 output: theme-agnostic core infrastructure only (scaffold, auth, health check).
No Binance Agent OS connection exists yet — that starts in Session 2. See `SESSION_REPORT.md`.
