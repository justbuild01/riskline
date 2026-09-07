## Session 1: Core Infrastructure
**Date:** 2026-09-05
**Goal:** Theme-agnostic monorepo scaffold — apps/web + apps/api skeletons, Supabase wiring, base auth, shared packages, deploy stub.

**Files added/changed:**
- `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`, `README.md` — root workspace config
- `.github/workflows/ci.yml` — CI stub: install, lint, typecheck, build on push
- `apps/web/package.json`, `next.config.js`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next-env.d.ts`, `.env.example` — Next.js app config
- `apps/web/src/app/layout.tsx` — root layout / routing shell
- `apps/web/src/app/page.tsx` — home page, shows signed-in/out state
- `apps/web/src/app/globals.css` — Tailwind directives, no tokens yet
- `apps/web/src/app/login/page.tsx` — sign-in form (Supabase email/password)
- `apps/web/src/app/signup/page.tsx` — sign-up form (Supabase email/password)
- `apps/web/src/app/sign-out-button.tsx` — client sign-out control
- `apps/web/src/lib/supabase/client.ts` — Supabase browser client (anon key)
- `apps/web/src/lib/supabase/server.ts` — Supabase server client (anon key, cookie-based session)
- `apps/web/src/middleware.ts` — refreshes Supabase session on every request
- `apps/api/package.json`, `tsconfig.json`, `.env.example`, `Dockerfile` — Express app config + deploy stub
- `apps/api/src/index.ts` — server bootstrap, CORS, JSON body parsing
- `apps/api/src/routes/health.ts` — `GET /health`
- `apps/api/src/lib/supabase.ts` — lazy-init Supabase server client (service role key, never sent to browser)
- `packages/types/package.json`, `src/index.ts` — `ApiResponse<T>`, `HealthCheckResponse`, `AppUser`
- `packages/ui/package.json`, `src/index.ts` — placeholder only, real components land in the UI session
- `packages/config/package.json`, `eslint-preset.js`, `tsconfig.base.json` — shared lint/tsconfig base

**Current full file tree:**
```
.github/workflows/ci.yml
.gitignore
README.md
apps/api/.env.example
apps/api/Dockerfile
apps/api/package.json
apps/api/src/index.ts
apps/api/src/lib/supabase.ts
apps/api/src/routes/health.ts
apps/api/tsconfig.json
apps/web/.env.example
apps/web/next-env.d.ts
apps/web/next.config.js
apps/web/package.json
apps/web/postcss.config.js
apps/web/src/app/globals.css
apps/web/src/app/layout.tsx
apps/web/src/app/login/page.tsx
apps/web/src/app/page.tsx
apps/web/src/app/sign-out-button.tsx
apps/web/src/app/signup/page.tsx
apps/web/src/lib/supabase/client.ts
apps/web/src/lib/supabase/server.ts
apps/web/src/middleware.ts
apps/web/tailwind.config.ts
apps/web/tsconfig.json
package.json
packages/config/eslint-preset.js
packages/config/package.json
packages/config/tsconfig.base.json
packages/types/package.json
packages/types/src/index.ts
packages/ui/package.json
packages/ui/src/index.ts
pnpm-workspace.yaml
turbo.json
```
(regenerated via `find`, not typed from memory)

**Dependencies installed:**
- `next@^14.2.15`, `react@^18.3.1`, `react-dom@^18.3.1` — apps/web framework
- `@supabase/ssr@^0.5.1`, `@supabase/supabase-js@^2.45.4` — Supabase clients (web: ssr cookie-aware; api: plain JS client)
- `tailwindcss@^3.4.13`, `postcss@^8.4.47`, `autoprefixer@^10.4.20` — apps/web styling base, no tokens yet
- `express@^4.21.0`, `cors@^2.8.5`, `dotenv@^16.4.5` — apps/api server
- `tsx@^4.19.1` — apps/api dev runner (watch mode)
- `turbo@^2.1.0` — monorepo task runner
- `typescript@^5.6.0` — both apps
- **Not yet installed/run:** `pnpm install` has not actually been executed in this environment (no network access here) — versions above are declared, not yet verified against the real registry. **First real `pnpm install` is an explicit to-do before Session 2 starts, and per Section 6 rule 9, any dependency that fails to resolve or has a different current API than assumed gets flagged then, not silently worked around.**

**Supabase schema state:**
- No custom tables yet. Using Supabase's built-in `auth.users` only, via `supabase.auth.signUp` / `signInWithPassword` / `signOut`. No RLS policies or migrations written yet — first custom table arrives in Session 2 (portfolio/market-data snapshots).

**Env vars required:**
- `apps/web`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`
- `apps/api`: `PORT`, `WEB_ORIGIN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- No `BINANCE_TESTNET_*` / `BINANCE_MAINNET_*` vars declared yet — intentionally deferred to Session 2 (Section 9.7: don't declare env vars before the session that actually needs them).

**Agent OS mode:** N/A this session — no Agent OS/MCP connection exists yet. Testnet will be the default the moment Session 2 introduces it (Section 9.2).

**Sub-account scope & limits:** N/A this session — no Binance sub-account created yet, no trading/payment/onchain code exists. Nothing to scope or limit.

**Decision log (this session, if any live/testnet actions were taken):**
- None. No trade, payment, or on-chain action is possible in this session's code.

**API endpoints live:**
- `GET /health` — returns `{ ok: true, data: { status, service, timestamp } }`

**Known stubs/mocks/TODOs:**
- `pnpm install` not yet run in a real environment with network access — do this first, before writing any Session 2 code, and fix any version mismatches found.
- `apps/web` and `apps/api` are unstyled/undesigned on purpose — real UI/tokens are Session 4's job per `BUILD_ROADMAP.md`.
- `packages/ui` is a placeholder package, exports nothing real yet.
- CI workflow runs install/lint/typecheck/build only — no deploy step wired to Vercel/Railway yet (manual connect, not a build-session task).
- Supabase project itself has not been created yet — `.env.example` files need real values from an actual Supabase project before `pnpm dev` will run cleanly.

**Assumptions carried into next session:**
- Assumes a Supabase project will be created (free tier is sufficient) and its URL + anon key + service role key dropped into the two `.env` files before Session 2 runs.
- Assumes Session 2 is the first session to actually call the Binance Agent OS MCP server (`https://agent.binance.com/mcp/agentic`) — per Section 9.8, its real tool names/response shapes must be verified against Binance's live docs/tool list at that point, not assumed from this brief's research summary.
- Assumes the open decision in `RESEARCH_BRIEF.md` (testnet synthetic portfolio vs. real read-only mainnet holdings for the demo) will be resolved before Session 2's ingestion logic is written, since it changes which credentials that session needs.
- Assumes Track A entry mechanics (video + GitHub repo) haven't changed since Session 0's research — worth a final check against the official entry form before Session 5 (submission).

**Style history:** N/A — no design work done this session (first UI session is Session 4).

---

## Session 2: Agent OS Connection & Data Ingestion
**Date:** 2026-09-06
**Goal:** Get a real portfolio + market data snapshot from Binance Agent OS into Supabase. Also the
designated Section 9.2 go-live session (real mainnet, read-only), per an explicit human decision
made in chat this session.

**Major finding — architecture correction (read this before touching apps/api's Binance-related code):**
The Session 0/1 assumption that `apps/api` would be its own MCP client, calling
`https://agent.binance.com/mcp/agentic` directly with a stored API key/secret, is **wrong**. Fetched
Binance's actual MCP Server docs directly this session
(`https://developers.binance.com/en/docs/agent-native/mcp-server/agentic`): the server is only
reachable through its own OAuth-registered AI client apps — Claude Code, Claude Desktop, Codex CLI,
ChatGPT (web + desktop), VS Code, Grok Bot — via a one-time per-user OAuth consent screen. The docs
explicitly warn against pasting the endpoint into arbitrary tools. A hand-rolled Express client with
`BINANCE_API_KEY`/`SECRET` env vars (the pattern seen in several *unofficial* community Binance MCP
projects found during research) does not match how the real, official product works.
**Corrected architecture:** `apps/api` never talks to Binance. A human runs an actual supported
client (prompt + workflow in `docs/agent-os-data-pull-prompt.md`) to pull a snapshot as JSON, saves
it to a file, and loads it with `pnpm --filter api ingest ./snapshot.json`. Separately, the user
specified Kimi via Hugging Face Inference as the only LLM available for use — no hackathon rule was
found requiring this (checked), so it's treated as a personal resource constraint. This splits
cleanly: Kimi is only ever used for the plain-English narrative step in Session 4 (numbers → text,
plain HTTP call to HF Inference), which has no need to touch Binance or MCP at all.

**Go-live documentation (Section 9.2):**
- **Explicit human sign-off:** recorded in chat this session — user chose "Real mainnet holdings,
  read-only" over a testnet-seeded portfolio, after being told this triggers the 9.2 gate.
- **Testnet run of the same logic:** Binance Agent OS does not appear to expose a distinct
  testnet mode separate from the real OAuth-connected mainnet sub-account (not found in the docs
  fetched this session) — unlike the classic Binance REST API's separate testnet.binance.vision.
  The practical equivalent used here: the ingest pipeline (validation + Supabase write) should be
  tested with a hand-written sample JSON file matching the schema *before* running it against a
  real Agent OS pull. **This has not been done yet in this session (no network access in this
  sandbox to actually run it) — do this first, before the first real ingest.**
- **Spend/position limits (Section 9.4):** not applicable in the literal sense — there is no code
  path anywhere in `apps/api` that can place an order, move funds, or trigger a withdrawal. The
  ingest route and CLI script only ever call Supabase inserts. This is enforced by that capability
  simply not existing in the code, not by a runtime check on a limit value.
- **Decision log:** no trade, payment, or on-chain action occurred or is possible this session —
  only a read/store pipeline was built. The sign-off above is the only live/mainnet-relevant
  decision this session made.

**Files added/changed:**
- `supabase/migrations/0001_portfolio_snapshots.sql` — `portfolio_snapshots` table (JSONB
  `holdings`/`market_data` columns, RLS scoped to `user_id`)
- `packages/types/src/index.ts` — added `PortfolioHolding`, `PricePoint`, `MarketSeries`,
  `AccountMode`, `PortfolioSnapshotInput`, `PortfolioSnapshotRecord`
- `apps/api/src/lib/schemas.ts` — Zod schemas mirroring the above, for runtime validation
- `apps/api/src/lib/ingest.ts` — `ingestPortfolioSnapshot()`, shared by the route and the CLI script
- `apps/api/src/routes/ingest.ts` — `POST /ingest/portfolio-snapshot`, gated by `x-ingest-secret` header
- `apps/api/src/scripts/ingest-from-file.ts` — `pnpm --filter api ingest <file>` CLI
- `apps/api/src/index.ts` — mounted the ingest router
- `apps/api/package.json` — added `zod` dependency, added `ingest` script
- `apps/api/.env.example` — added `TARGET_USER_ID`, `INGEST_SECRET`; removed the never-used
  Binance env var placeholder note from Session 1 (no Binance vars exist in this app at all now)
- `docs/agent-os-data-pull-prompt.md` — the actual prompt/workflow for pulling a snapshot via a
  real Binance-supported AI client
- `README.md` — architecture note explaining the correction above, updated setup steps

**Current full file tree:**
```
.github/workflows/ci.yml
.gitignore
README.md
SESSION_REPORT.md
apps/api/.env.example
apps/api/Dockerfile
apps/api/package.json
apps/api/src/index.ts
apps/api/src/lib/ingest.ts
apps/api/src/lib/schemas.ts
apps/api/src/lib/supabase.ts
apps/api/src/routes/health.ts
apps/api/src/routes/ingest.ts
apps/api/src/scripts/ingest-from-file.ts
apps/api/tsconfig.json
apps/web/.env.example
apps/web/next-env.d.ts
apps/web/next.config.js
apps/web/package.json
apps/web/postcss.config.js
apps/web/src/app/globals.css
apps/web/src/app/layout.tsx
apps/web/src/app/login/page.tsx
apps/web/src/app/page.tsx
apps/web/src/app/sign-out-button.tsx
apps/web/src/app/signup/page.tsx
apps/web/src/lib/supabase/client.ts
apps/web/src/lib/supabase/server.ts
apps/web/src/middleware.ts
apps/web/tailwind.config.ts
apps/web/tsconfig.json
docs/agent-os-data-pull-prompt.md
package.json
packages/config/eslint-preset.js
packages/config/package.json
packages/config/tsconfig.base.json
packages/types/package.json
packages/types/src/index.ts
packages/ui/package.json
packages/ui/src/index.ts
pnpm-workspace.yaml
supabase/migrations/0001_portfolio_snapshots.sql
turbo.json
```
(regenerated via `find`, not typed from memory)

**Dependencies installed:**
- `zod@^3.23.8` — apps/api runtime validation for the ingest payload
- Still not actually run through `pnpm install` in a real environment (same sandbox network
  limitation as Session 1) — verify this alongside Session 1's dependency list on first real install.

**Supabase schema state:**
- One custom table now: `portfolio_snapshots` (see migration file above). RLS enabled, scoped to
  `user_id`. Not yet applied to any real Supabase project — run the migration SQL via the Supabase
  SQL editor before first ingest.

**Env vars required (additions this session):**
- `apps/api`: `TARGET_USER_ID` (single-user hackathon simplification, see `ingest.ts` comment),
  `INGEST_SECRET` (only matters if calling the HTTP route directly instead of the CLI script)
- Still no `BINANCE_*` vars anywhere in this codebase — confirmed intentional per this session's
  architecture correction, not an oversight.

**Agent OS mode:** Real mainnet, read-only. No Agent OS/MCP call is made by any code in this repo —
it happens externally, in whichever AI client the builder runs per `docs/agent-os-data-pull-prompt.md`.

**Sub-account scope & limits:** Read-only holdings + market data only. The prompt in
`docs/agent-os-data-pull-prompt.md` explicitly instructs the agent never to call any order, trade,
transfer, or withdrawal tool. No such capability exists in `apps/api`'s own code regardless.

**API endpoints live:**
- `GET /health` — unchanged from Session 1
- `POST /ingest/portfolio-snapshot` — validates + stores a `PortfolioSnapshotInput`, requires
  `x-ingest-secret` header matching `INGEST_SECRET`

**Known stubs/mocks/TODOs:**
- Everything carried over from Session 1 (pnpm install unverified, no real Supabase project yet,
  `packages/ui` still a placeholder).
- The ingest pipeline itself has not been tested with even a sample JSON file yet — do this before
  the first real Agent OS pull (this session's testnet-equivalent verification step, not yet done).
- `docs/agent-os-data-pull-prompt.md` asks the agent to skip assets without a direct USDT pair
  rather than handling cross-conversion — fine for a demo, worth knowing if the real portfolio holds
  an odd asset.

**Assumptions carried into next session:**
- Session 3 (Risk & Correlation Engine) reads `portfolio_snapshots.holdings` and `.market_data`
  directly — no changes to this session's schema should be needed for basic concentration/volatility/
  correlation math.
- Session 4 is still the first time Kimi/Hugging Face Inference gets wired up — nothing from this
  session depends on it existing yet.
- Whoever runs the actual Agent OS pull needs Claude Code, Claude Desktop, or ChatGPT already set
  up with Binance Agent OS connected (one-time OAuth) — not verified as done yet.

**Style history:** N/A — no design work this session.

---

## Session 3: Risk & Correlation Engine
**Date:** 2026-09-06
**Goal:** Compute concentration risk, pairwise correlation, and volatility exposure from an ingested snapshot; expose via `apps/api`.

**Verification actually performed this session (unlike Session 2, this one could be fully run):**
The core math (returns, stddev, Pearson correlation, HHI, weighted-covariance portfolio variance) was
prototyped and checked against known-answer cases in plain JS first — identical series → correlation
1.0, inverse series → −1.0, uncorrelated equal-vol 50/50 → variance is exactly half of fully-correlated
50/50, negatively-correlated 50/50 → variance 0. All matched expected values before being written into
the real TypeScript files. The actual `compute.ts`/`stats.ts` files were then run (via Node's
`--experimental-strip-types`, no build step needed) against a 4-asset fixture (BTC, ETH, USDT, a
deliberately-missing-data SOL) covering every branch: normal correlated pair, stablecoin treated as
0-vol (not "missing"), a genuinely missing-data asset excluded from vol/correlation but still counted
in concentration weight, and weight renormalization when coverage is partial. All 8 checks passed —
full output and checks are reproducible via `pnpm --filter api test:risk-engine`.

**Files added/changed:**
- `packages/types/src/index.ts` — added `RiskWarning`, `AssetRiskDetail`, `CorrelationEntry`, `RiskReport`
- `apps/api/src/lib/risk/stats.ts` — `toReturns`, `mean`, `stddev`, `pearsonCorrelation` (pure, no deps)
- `apps/api/src/lib/risk/compute.ts` — `computeRiskReport()`: HHI/concentration, effective asset count,
  per-asset annualized volatility, pairwise correlation (timestamp-aligned), full weighted-covariance
  portfolio volatility, stablecoin vs. missing-data distinction, coverage warnings
- `apps/api/src/fixtures/sample-snapshot.json` — the verification fixture (also valid `ingest` input —
  doubles as the Session 2 "test the pipeline before real data" fixture that was still outstanding)
- `apps/api/src/scripts/test-risk-engine.ts` — `pnpm --filter api test:risk-engine`, reproduces this
  session's verification
- `apps/api/src/routes/risk.ts` — `GET /risk/sample` (fixture, no DB needed) and `GET /risk/latest`
  (real: fetches the newest snapshot for `TARGET_USER_ID`, computes, returns)
- `apps/api/src/index.ts` — mounted the risk router
- `apps/api/package.json` — added `test:risk-engine` script

**Current full file tree:**
```
.github/workflows/ci.yml
.gitignore
README.md
SESSION_REPORT.md
apps/api/.env.example
apps/api/Dockerfile
apps/api/package.json
apps/api/src/fixtures/sample-snapshot.json
apps/api/src/index.ts
apps/api/src/lib/ingest.ts
apps/api/src/lib/risk/compute.ts
apps/api/src/lib/risk/stats.ts
apps/api/src/lib/schemas.ts
apps/api/src/lib/supabase.ts
apps/api/src/routes/health.ts
apps/api/src/routes/ingest.ts
apps/api/src/routes/risk.ts
apps/api/src/scripts/ingest-from-file.ts
apps/api/src/scripts/test-risk-engine.ts
apps/api/tsconfig.json
apps/web/.env.example
apps/web/next-env.d.ts
apps/web/next.config.js
apps/web/package.json
apps/web/postcss.config.js
apps/web/src/app/globals.css
apps/web/src/app/layout.tsx
apps/web/src/app/login/page.tsx
apps/web/src/app/page.tsx
apps/web/src/app/sign-out-button.tsx
apps/web/src/app/signup/page.tsx
apps/web/src/lib/supabase/client.ts
apps/web/src/lib/supabase/server.ts
apps/web/src/middleware.ts
apps/web/tailwind.config.ts
apps/web/tsconfig.json
docs/agent-os-data-pull-prompt.md
package.json
packages/config/eslint-preset.js
packages/config/package.json
packages/config/tsconfig.base.json
packages/types/package.json
packages/types/src/index.ts
packages/ui/package.json
packages/ui/src/index.ts
pnpm-workspace.yaml
supabase/migrations/0001_portfolio_snapshots.sql
turbo.json
```
(regenerated via `find`, not typed from memory)

**Dependencies installed:** none new — the risk engine is pure TypeScript, no math/stats library needed.
Still no real `pnpm install` run in a networked environment (carried over from Sessions 1–2).

**Supabase schema state:** unchanged from Session 2.

**Env vars required:** unchanged from Session 2 — the risk engine reads what's already in the DB.

**Agent OS mode:** unchanged — N/A, no code in this repo calls Binance directly.

**Sub-account scope & limits:** unchanged from Session 2 — nothing in this session touches Binance,
mainnet, or any live action.

**Decision log:** none — read-only computation on already-stored data, no live/trade/payment/on-chain action.

**API endpoints live:**
- `GET /health`, `POST /ingest/portfolio-snapshot` — unchanged from Sessions 1–2
- `GET /risk/sample` — runs the fixture through the risk engine, no DB or real data required
- `GET /risk/latest` — computes risk for the most recent snapshot belonging to `TARGET_USER_ID`;
  `404` with code `NO_SNAPSHOT` if none exists yet

**Known stubs/mocks/TODOs:**
- Everything carried over from Sessions 1–2 (pnpm install unverified in a real environment, no real
  Supabase project yet, `packages/ui` still a placeholder, real Agent OS pull not yet performed).
- Correlation and portfolio volatility use daily-close data only; no consideration of intraday
  volatility or fees/slippage — reasonable for a risk-narrative demo, worth stating plainly if asked.
- `findSeriesForAsset` assumes a direct `<ASSET>USDT` pair; an asset only priced against BTC or another
  quote currency would be silently treated as missing data (correctly flagged via `MISSING_PRICE_DATA`,
  just worth knowing this is the reason, not a bug, if it comes up with an unusual holding).

**Assumptions carried into next session:**
- Session 4 (Dashboard UI & Risk Narrative) can call `GET /risk/sample` immediately to build/style the
  UI without needing a real Agent OS pull done first, and switch to `GET /risk/latest` once one exists.
- Session 4 is where Kimi (Hugging Face Inference) actually gets wired up, turning this session's
  `RiskReport` numbers into the plain-English narrative — nothing here depends on that existing yet.

**Style history:** N/A — no design work this session (Session 4 is the first UI session).
