-- Mark scan jobs as confirmed after the user picks a candidate
alter table public.scan_jobs
add column if not exists confirmed_at timestamptz;

create index if not exists scan_jobs_confirmed_at_idx on public.scan_jobs (confirmed_at);
