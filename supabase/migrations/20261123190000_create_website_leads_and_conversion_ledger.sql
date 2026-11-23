-- Isolated website lead + conversion ledger.
-- Existing CRM customers, repairs, invoices and payments are intentionally untouched.
create table if not exists public.website_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_id text unique,
  conversion_event_id text unique,
  name text,
  phone text,
  email text,
  device text,
  issue text,
  source text not null default 'website',
  page text,
  source_url text,
  campaign text,
  utm text,
  click_id text,
  quality_score integer check (quality_score is null or (quality_score >= 0 and quality_score <= 100)),
  quality_verdict text,
  event_name text,
  event_value numeric(10,2) not null default 0,
  currency text not null default 'INR',
  email_sha256 text,
  phone_sha256 text,
  is_test boolean not null default false
);

alter table public.website_leads enable row level security;
revoke all on table public.website_leads from anon, authenticated;
grant insert on table public.website_leads to service_role;