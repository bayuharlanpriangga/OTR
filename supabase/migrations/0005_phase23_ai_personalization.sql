-- OTR — Migration Phase 23: AI Personalization (Roadmap Phase 23)
-- ---------------------------------------------------------------------------
-- Roadmap Phase 23 menulis TEBAL: "User must explicitly opt in" dan
-- "Do not automatically analyze private journal content". Migration ini
-- hanya menambah SATU kolom boolean ke `user_settings` (dibuat Phase 14,
-- 0003_phase14_cloud_sync.sql) sebagai gerbang lapis pertama (per-akun) dari
-- dua lapis opt-in yang dipakai fase ini -- lapis kedua (checkbox per-reading
-- + checkbox terpisah khusus Journal) TIDAK butuh kolom cloud sama sekali,
-- karena sengaja tidak dipersist (sama seperti hasil AI synthesis Phase 22
-- yang juga tidak dipersist -- lihat komentar scope js/services/ai-service.js).
--
-- default false WAJIB (bukan sekadar konvensi) -- kalau default true, akun
-- lama yang belum pernah ke Settings akan otomatis "opt-in" begitu kolom ini
-- ditambahkan, melanggar constraint Roadmap secara langsung.
-- ---------------------------------------------------------------------------

alter table user_settings
  add column if not exists ai_personalization_opt_in boolean not null default false;
