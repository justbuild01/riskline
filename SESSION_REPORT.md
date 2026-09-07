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
