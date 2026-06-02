-- Scan jobs for async card recognition
create table if not exists public.scan_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  game_type text not null check (game_type in ('pokemon', 'riftbound', 'magic', 'onepiece')),
  image_url text not null,
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'completed', 'failed')
  ),
  detected_name text,
  result_candidates jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists scan_jobs_user_id_idx on public.scan_jobs (user_id);
create index if not exists scan_jobs_status_idx on public.scan_jobs (status);
create index if not exists scan_jobs_user_status_idx on public.scan_jobs (user_id, status);

create or replace function public.set_scan_jobs_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists scan_jobs_updated_at on public.scan_jobs;

create trigger scan_jobs_updated_at
before update on public.scan_jobs
for each row
execute function public.set_scan_jobs_updated_at();

alter table public.scan_jobs enable row level security;

create policy "Users can read own scan jobs"
on public.scan_jobs
for select
to authenticated
using (auth.uid() = user_id);

-- Storage bucket for scan images (public read; uploads via service role on backend)
insert into storage.buckets (id, name, public)
values ('scan-images', 'scan-images', true)
on conflict (id) do nothing;

create policy "Public read scan images"
on storage.objects
for select
to public
using (bucket_id = 'scan-images');
