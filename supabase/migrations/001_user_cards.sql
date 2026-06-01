-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists public.user_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  card_api_id text not null,
  name text not null,
  set text not null,
  number text not null,
  type text not null,
  image_url text not null,
  quantity integer not null default 1 check (quantity >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, card_api_id)
);

create index if not exists user_cards_user_id_idx on public.user_cards (user_id);

create or replace function public.set_user_cards_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_cards_updated_at on public.user_cards;

create trigger user_cards_updated_at
before update on public.user_cards
for each row
execute function public.set_user_cards_updated_at();

alter table public.user_cards enable row level security;

create policy "Users can view own cards"
  on public.user_cards
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own cards"
  on public.user_cards
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cards"
  on public.user_cards
  for update
  using (auth.uid() = user_id);

create policy "Users can delete own cards"
  on public.user_cards
  for delete
  using (auth.uid() = user_id);
