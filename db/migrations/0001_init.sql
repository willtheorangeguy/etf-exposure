create table if not exists etfs (
  id bigserial primary key,
  ticker text not null unique,
  name   text not null,
  issuer text,
  created_at timestamptz not null default now()
);

create table if not exists snapshots (
  id bigserial primary key,
  etf_id bigint not null references etfs(id) on delete cascade,
  as_of_date date not null,
  source text not null check (source in ('url','upload')),
  source_url text,
  content_hash text not null,
  holdings jsonb not null,
  partial bool not null default false,
  created_at timestamptz not null default now(),
  unique (etf_id, as_of_date)
);

create index if not exists snapshots_etf_id_idx on snapshots(etf_id, created_at desc);
