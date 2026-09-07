-- Session 2: portfolio + market data snapshots.
-- Single JSONB-per-snapshot design, chosen deliberately for hackathon speed
-- over a fully normalized schema. Revisit if query patterns demand it later.

create table if not exists portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  snapshot_taken_at timestamptz not null,
  account_mode text not null check (account_mode in ('mainnet-read-only', 'testnet')),
  holdings jsonb not null,     -- PortfolioHolding[]
  market_data jsonb not null,  -- MarketSeries[]
  created_at timestamptz not null default now()
);

create index if not exists portfolio_snapshots_user_id_idx
  on portfolio_snapshots (user_id, snapshot_taken_at desc);

alter table portfolio_snapshots enable row level security;

create policy "Users can view their own snapshots"
  on portfolio_snapshots for select
  using (auth.uid() = user_id);

create policy "Users can insert their own snapshots"
  on portfolio_snapshots for insert
  with check (auth.uid() = user_id);

-- Note: the ingest route/script writes with the service-role key, which
-- bypasses RLS entirely (expected — RLS here protects reads from apps/web).
