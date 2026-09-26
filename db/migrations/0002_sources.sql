create table if not exists holdings_sources (
  id bigserial primary key,
  url text not null unique,
  label text not null,
  ticker text,
  issuer text,
  interval_days integer not null default 30 check (interval_days between 1 and 365),
  enabled boolean not null default true,
  next_run_at timestamptz not null default now(),
  last_run_at timestamptz,
  last_success_at timestamptz,
  lease_token text,
  lease_until timestamptz,
  report jsonb,
  created_at timestamptz not null default now()
);
create index if not exists holdings_sources_due_idx on holdings_sources(next_run_at) where enabled;
