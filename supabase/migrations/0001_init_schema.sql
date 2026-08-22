-- OTR — Supabase schema migration (Phase 12 — Supabase Foundation)
-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
-- gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 37. PROFILES TABLE
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 38. TAROT_CARDS TABLE
-- Katalog sistem (78 kartu) — public read-only (§46). Insert/update/delete
-- data kartu dilakukan lewat Supabase Dashboard / service role, BUKAN lewat
-- RLS policy untuk role authenticated/anon (sengaja tidak dibuatkan policy
-- write apa pun di bawah -> default RLS = deny semua write untuk user biasa).
-- ---------------------------------------------------------------------------
create table if not exists tarot_cards (
  id text primary key,
  name text not null,
  slug text unique not null,
  arcana text not null,
  suit text,
  card_number integer,
  rank text,
  image_url text,
  keywords jsonb default '[]',
  upright jsonb default '{}',
  reversed jsonb default '{}',
  yes_no text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 39. SPREADS TABLE
-- is_system=true -> katalog bawaan app (public read-only, sama seperti
-- tarot_cards). user_id + is_system=false disiapkan untuk custom spread
-- buatan user sendiri (belum ada fitur-nya di app manapun sampai fase ini
-- ditulis — kolomnya sudah ada di schema spec, jadi RLS-nya turut disiapkan
-- sekarang supaya tidak perlu migration susulan begitu fitur itu dibangun).
-- ---------------------------------------------------------------------------
create table if not exists spreads (
  id text primary key,
  name text not null,
  slug text unique not null,
  category text,
  description text,
  card_count integer not null,
  is_system boolean default true,
  user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 40. SPREAD_POSITIONS TABLE
-- ---------------------------------------------------------------------------
create table if not exists spread_positions (
  id uuid primary key default gen_random_uuid(),
  spread_id text references spreads(id) on delete cascade,
  position_index integer not null,
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 41. READINGS TABLE
-- ---------------------------------------------------------------------------
create table if not exists readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  spread_id text references spreads(id),
  question text,
  intention text,
  status text default 'completed',
  summary jsonb,
  is_favorite boolean default false,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- ---------------------------------------------------------------------------
-- 42. READING_CARDS TABLE
-- ---------------------------------------------------------------------------
create table if not exists reading_cards (
  id uuid primary key default gen_random_uuid(),
  reading_id uuid references readings(id) on delete cascade,
  position_id uuid references spread_positions(id),
  card_id text references tarot_cards(id),
  orientation text not null,
  interpretation_snapshot jsonb,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 43. JOURNALS TABLE
-- ---------------------------------------------------------------------------
create table if not exists journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  reading_id uuid references readings(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 44. FAVORITES TABLE
-- ---------------------------------------------------------------------------
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 45. DAILY_CARDS TABLE
-- ---------------------------------------------------------------------------
create table if not exists daily_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  reading_date date not null,
  card_id text references tarot_cards(id),
  orientation text not null,
  reflection_prompt text,
  created_at timestamptz default now(),
  unique(user_id, reading_date)
);

-- ---------------------------------------------------------------------------
-- 46. ROW LEVEL SECURITY
-- "Users can: SELECT/INSERT/UPDATE/DELETE own data. Users must NOT be able
-- to access another user's: Readings, Journals, Favorites, Daily Cards,
-- Settings. System tarot data can be public read-only."
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;
alter table tarot_cards enable row level security;
alter table spreads enable row level security;
alter table spread_positions enable row level security;
alter table readings enable row level security;
alter table reading_cards enable row level security;
alter table journals enable row level security;
alter table favorites enable row level security;
alter table daily_cards enable row level security;

-- ---- profiles: user cuma bisa akses baris miliknya sendiri ----
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);
-- Tidak ada policy insert manual di sini -> insert dilakukan lewat trigger
-- handle_new_user() di bawah (security definer), bukan langsung oleh client.
-- Tidak ada policy delete -> profil ikut terhapus otomatis lewat
-- "on delete cascade" dari auth.users, bukan lewat aksi user.

-- ---- tarot_cards: katalog sistem, public read-only ----
create policy "tarot_cards_public_read" on tarot_cards
  for select using (true);

-- ---- spreads: spread sistem public read-only; spread custom cuma owner ----
create policy "spreads_public_read_system" on spreads
  for select using (is_system = true);
create policy "spreads_select_own_custom" on spreads
  for select using (is_system = false and auth.uid() = user_id);
create policy "spreads_insert_own_custom" on spreads
  for insert with check (is_system = false and auth.uid() = user_id);
create policy "spreads_update_own_custom" on spreads
  for update using (is_system = false and auth.uid() = user_id);
create policy "spreads_delete_own_custom" on spreads
  for delete using (is_system = false and auth.uid() = user_id);

-- ---- spread_positions: ikut visibilitas spread induknya ----
create policy "spread_positions_public_read_system" on spread_positions
  for select using (
    exists (select 1 from spreads s where s.id = spread_positions.spread_id and s.is_system = true)
  );
create policy "spread_positions_select_own_custom" on spread_positions
  for select using (
    exists (select 1 from spreads s where s.id = spread_positions.spread_id and s.is_system = false and s.user_id = auth.uid())
  );
create policy "spread_positions_write_own_custom" on spread_positions
  for all using (
    exists (select 1 from spreads s where s.id = spread_positions.spread_id and s.is_system = false and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from spreads s where s.id = spread_positions.spread_id and s.is_system = false and s.user_id = auth.uid())
  );

-- ---- readings: full CRUD, cuma milik sendiri ----
create policy "readings_select_own" on readings
  for select using (auth.uid() = user_id);
create policy "readings_insert_own" on readings
  for insert with check (auth.uid() = user_id);
create policy "readings_update_own" on readings
  for update using (auth.uid() = user_id);
create policy "readings_delete_own" on readings
  for delete using (auth.uid() = user_id);

-- ---- reading_cards: tidak punya user_id langsung -> ikut readings induknya ----
create policy "reading_cards_all_via_reading_owner" on reading_cards
  for all using (
    exists (select 1 from readings r where r.id = reading_cards.reading_id and r.user_id = auth.uid())
  ) with check (
    exists (select 1 from readings r where r.id = reading_cards.reading_id and r.user_id = auth.uid())
  );

-- ---- journals: full CRUD, cuma milik sendiri ----
create policy "journals_select_own" on journals
  for select using (auth.uid() = user_id);
create policy "journals_insert_own" on journals
  for insert with check (auth.uid() = user_id);
create policy "journals_update_own" on journals
  for update using (auth.uid() = user_id);
create policy "journals_delete_own" on journals
  for delete using (auth.uid() = user_id);

-- ---- favorites: full CRUD, cuma milik sendiri ----
create policy "favorites_select_own" on favorites
  for select using (auth.uid() = user_id);
create policy "favorites_insert_own" on favorites
  for insert with check (auth.uid() = user_id);
create policy "favorites_update_own" on favorites
  for update using (auth.uid() = user_id);
create policy "favorites_delete_own" on favorites
  for delete using (auth.uid() = user_id);

-- ---- daily_cards: full CRUD, cuma milik sendiri ----
create policy "daily_cards_select_own" on daily_cards
  for select using (auth.uid() = user_id);
create policy "daily_cards_insert_own" on daily_cards
  for insert with check (auth.uid() = user_id);
create policy "daily_cards_update_own" on daily_cards
  for update using (auth.uid() = user_id);
create policy "daily_cards_delete_own" on daily_cards
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Auto-create profile row saat user baru sign up.
-- Ini TIDAK ada di spec secara eksplisit, tapi tanpa ini `profiles` akan
-- selalu kosong untuk user baru (tidak ada policy insert manual untuk
-- profiles di atas — sengaja, supaya user tidak bisa insert baris profil
-- dengan id sembarangan). SECURITY DEFINER supaya trigger bisa insert
-- walau RLS aktif.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
