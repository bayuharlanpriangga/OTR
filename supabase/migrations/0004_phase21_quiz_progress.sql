-- OTR — Supabase schema migration (Phase 21 — Quiz, Roadmap Phase 21, Master Spec §71)
-- ---------------------------------------------------------------------------
-- CATATAN (ditulis sesi Phase 22): file ini SEHARUSNYA sudah ada sejak sesi
-- Phase 21 -- PROJECT_STATUS.md ("Current Phase" & "Next Phase") menyebutnya
-- eksplisit sebagai "migration `0004_phase21_quiz_progress.sql`" dan blocker
-- "Jalankan supabase/migrations/0004_phase21_quiz_progress.sql", TAPI file
-- itu ternyata tidak pernah ter-commit ke repo (hanya 0001-0003 yang ada saat
-- sesi Phase 22 dimulai, dicek lewat `ls supabase/migrations/` -- kemungkinan
-- besar tertinggal secara tidak sengaja di sesi Phase 21 sebelumnya, bukan
-- keputusan disengaja). Direkonstruksi di sini murni dari shape yang SUDAH
-- diasumsikan js/services/quiz-service.js sejak Phase 21 (kolom & nama tabel
-- `quiz_progress` dipakai apa adanya di file itu) -- TIDAK ada perubahan
-- shape apa pun dari yang tersirat di sana, supaya quiz-service.js tetap
-- jalan tanpa modifikasi. Perlu diklarifikasi ke Orias apakah migration versi
-- ASLI (kalau memang pernah ditulis di sesi lain di luar repo ini) punya
-- perbedaan apa pun dari rekonstruksi ini sebelum dijalankan di Supabase
-- Dashboard, terutama kalau tabel `quiz_progress` sudah pernah dibuat manual
-- di project Supabase asli dengan shape yang beda.
-- ---------------------------------------------------------------------------

create table if not exists quiz_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  topic text not null,
  best_score integer not null default 0,
  best_total integer not null default 0,
  attempts integer not null default 0,
  last_played_at timestamptz default now(),
  -- satu baris per (user, topik) -- quiz-service.js recordCloud() upsert
  -- dengan onConflict: "user_id,topic", butuh unique constraint ini supaya
  -- upsert benar-benar update baris yang sama, bukan insert duplikat.
  unique (user_id, topic)
);

alter table quiz_progress enable row level security;

-- Pola sama seperti user_settings/favorites/dst (0001/0003) -- baca/tulis
-- cuma milik sendiri.
create policy "quiz_progress_select_own" on quiz_progress
  for select using (auth.uid() = user_id);
create policy "quiz_progress_insert_own" on quiz_progress
  for insert with check (auth.uid() = user_id);
create policy "quiz_progress_update_own" on quiz_progress
  for update using (auth.uid() = user_id);
create policy "quiz_progress_delete_own" on quiz_progress
  for delete using (auth.uid() = user_id);
