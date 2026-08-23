-- OTR — Supabase schema migration (Phase 14 — Cloud Sync, Roadmap Phase 14)
-- ---------------------------------------------------------------------------
-- Kenapa migration baru, bukan edit 0001_init_schema.sql:
-- 0001 sudah "live" (dijalankan Orias di project Supabase asli sejak Phase
-- 12/13 — lihat PROJECT_STATUS.md). Mengedit file yang sudah dijalankan
-- tidak akan ke-apply ulang secara otomatis; migration baru yang menambah
-- (bukan mengubah destruktif) apa yang kurang adalah cara yang benar.
--
-- Dua celah yang ditemukan Phase 14 saat menyambungkan `readings`/`journals`/
-- `favorites`/`profile`/`settings` ke UI sungguhan (bukan cuma pipeline
-- Connect->Authenticate seperti Phase 12):
--
-- 1. `category` (general/love/career/spiritual — dipilih user di Reading
--    Setup, lihat js/pages/reading.js) TIDAK ada di kolom `readings` manapun
--    di Master Spec §41 maupun 0001_init_schema.sql, padahal record reading
--    lokal (buildSavedReading(), js/pages/result.js) selalu membawanya sejak
--    Phase 7 dan dipakai utk badge kategori di History/Result. Tanpa kolom
--    ini, reading yang disinkron ke cloud akan kehilangan kategorinya begitu
--    dibaca ulang dari Supabase.
-- 2. Master Spec §36 menyebut `user_settings` di daftar "Recommended tables",
--    tapi §37-46 (definisi tabel satu-satu) TIDAK pernah memberi schema-nya
--    -- satu-satunya tabel di daftar §36 yang begitu. Phase 8 (Local
--    Storage) sudah menetapkan bentuknya di localStorage (STORAGE_KEYS.SETTINGS,
--    js/core/storage.js): `{ reducedMotion: boolean }`. Tabel di bawah
--    mengikuti bentuk itu apa adanya (bukan menambah kolom yang belum ada
--    fiturnya) supaya js/services/settings-service.js bisa 1:1 memetakan
--    baris cloud <-> objek settings lokal tanpa transformasi.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Gap #1 — kolom category yang hilang di `readings`.
-- Nullable & tanpa default selain NULL supaya baris reading LAMA (Phase 12/13,
-- sebelum kolom ini ada) tidak perlu backfill -- history.js/result.js sudah
-- terbiasa memperlakukan category kosong sebagai "general" (lihat
-- CATEGORY_LABELS fallback di kedua file itu).
-- ---------------------------------------------------------------------------
alter table readings add column if not exists category text;

-- ---------------------------------------------------------------------------
-- Gap #2 — USER_SETTINGS TABLE (disebut §36, schema baru ditentukan di sini).
-- Satu baris per user (primary key = user_id itu sendiri, bukan uuid
-- terpisah) -- konsisten dengan bentuk lokal "satu objek settings", bukan
-- daftar. Kolom ditambah lewat migration lanjutan kalau nanti ada setting
-- baru (mis. bahasa di Settings sekarang masih badge "Segera").
-- ---------------------------------------------------------------------------
create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reduced_motion boolean not null default false,
  updated_at timestamptz default now()
);

alter table user_settings enable row level security;

-- ---- user_settings: full CRUD (insert+update dipakai sebagai upsert oleh
-- settings-service.js), cuma milik sendiri -- sama seperti pola readings/
-- journals/favorites/daily_cards di 0001_init_schema.sql (§46: "Settings"
-- eksplisit disebut di daftar data yang tidak boleh diakses user lain). ----
create policy "user_settings_select_own" on user_settings
  for select using (auth.uid() = user_id);
create policy "user_settings_insert_own" on user_settings
  for insert with check (auth.uid() = user_id);
create policy "user_settings_update_own" on user_settings
  for update using (auth.uid() = user_id);
create policy "user_settings_delete_own" on user_settings
  for delete using (auth.uid() = user_id);
