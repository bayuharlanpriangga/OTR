// OTR — Service: Favorites (Phase 16 — Favorites, Roadmap Phase 16, Master Spec §33/§44)
// Pola sama dengan reading-service.js/daily-service.js: backend dipilih dari
// state.user (SEKALI dicek per pemanggilan, bukan flag statis) — guest lewat
// js/core/storage.js, login lewat tabel Supabase `favorites`.
//
// Favorite READING TIDAK lewat service ini — itu sudah punya jalurnya
// sendiri sejak Phase 8/10 lewat kolom `readings.is_favorite`
// (setReadingFavorite() di reading-service.js), konsisten dengan skema
// Master Spec §41 yang taruh is_favorite langsung di tabel readings, BUKAN
// entity generik. Service ini menangani 2 entity yang TIDAK punya kolom
// sendiri: "card" (Library/Card Detail) dan "spread" (pemilihan spread di
// Reading setup) — keduanya lewat tabel `favorites` (entity_type/entity_id,
// Master Spec §44) yang skeleton-nya (listFavorites/saveFavorites) sudah
// disiapkan sejak Phase 8 di storage.js, belum pernah dipakai UI manapun
// sampai fase ini.
//
// Tidak ada unique constraint di `favorites` (0001_init_schema.sql §44) —
// toggle di sini SELALU cek baris existing dulu (select) sebelum
// insert/delete, bukan upsert onConflict seperti daily-service.js, supaya
// Phase 16 TIDAK butuh migration SQL baru (tabelnya sudah ada & sudah
// dijalankan sejak Phase 12 — sama pola dengan Known Issues Phase 15).

import { getState } from "../core/state.js";
import { getSupabaseClient } from "../integrations/supabase.js";
import { listGuestFavoriteIds, toggleGuestFavorite } from "../core/storage.js";

function currentUserId() {
  return getState().user?.id ?? null;
}

// ---- Local (guest) -----------------------------------------------------

async function listIdsLocal(entityType) {
  return listGuestFavoriteIds(entityType);
}

async function toggleLocal(entityType, entityId) {
  return toggleGuestFavorite(entityType, entityId);
}

// ---- Cloud ---------------------------------------------------------------

async function listIdsCloud(entityType, userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("entity_id")
    .eq("user_id", userId)
    .eq("entity_type", entityType);
  if (error) throw new Error(`Gagal memuat favorit dari cloud: ${error.message}`);
  return (data ?? []).map((row) => row.entity_id);
}

async function toggleCloud(entityType, entityId, userId) {
  const supabase = getSupabaseClient();

  const { data: existing, error: selectError } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .maybeSingle();
  if (selectError) throw new Error(`Gagal memeriksa status favorit: ${selectError.message}`);

  if (existing) {
    const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
    if (error) throw new Error(`Gagal menghapus favorit: ${error.message}`);
    return false;
  }

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: userId, entity_type: entityType, entity_id: entityId });
  if (error) throw new Error(`Gagal menambahkan favorit: ${error.message}`);
  return true;
}

// ---- Local (guest) — favorit TERBARU -------------------------------------

async function latestIdLocal(entityType) {
  // listGuestFavoriteIds() (di atas) sudah newest-first -- listFavorites()
  // di core/storage.js di-unshift() tiap kali favorit baru ditambahkan
  // (lihat toggleGuestFavorite()), jadi elemen pertama SELALU yang paling
  // baru ditandai, tidak perlu sort tambahan di sini.
  const ids = listGuestFavoriteIds(entityType);
  return ids[0] ?? null;
}

// ---- Cloud — favorit TERBARU ----------------------------------------------

async function latestIdCloud(entityType, userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("entity_id")
    .eq("user_id", userId)
    .eq("entity_type", entityType)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Gagal memuat favorit terbaru: ${error.message}`);
  return data?.entity_id ?? null;
}

// ---- Public API -----------------------------------------------------------

/** Set berisi entity_id yang sudah difavoritkan untuk satu entityType.
 *  Dipanggil SEKALI per halaman (Library/Reading setup), bukan per-item,
 *  supaya tidak ada N network call terpisah kalau backend-nya cloud — sama
 *  pola dengan journal.js membangun readingsById lewat listReadings().
 * @param {"card"|"spread"} entityType
 * @returns {Promise<Set<string>>}
 */
export async function listFavoriteEntityIds(entityType) {
  const userId = currentUserId();
  const ids = userId ? await listIdsCloud(entityType, userId) : await listIdsLocal(entityType);
  return new Set(ids);
}

/** Toggle status favorit satu entity. Mengembalikan status BARU (true =
 *  baru ditandai favorit, false = baru dihapus dari favorit).
 * @param {"card"|"spread"} entityType
 * @param {string} entityId
 * @returns {Promise<boolean>}
 */
export async function toggleFavorite(entityType, entityId) {
  const userId = currentUserId();
  return userId ? toggleCloud(entityType, entityId, userId) : toggleLocal(entityType, entityId);
}

/**
 * entity_id favorit yang PALING BARU ditandai untuk satu entityType, atau
 * `null` kalau belum ada satu pun. Ditambahkan Phase 18 (Profile) untuk
 * field "Favorite Card" (Master Spec §35) -- BEDA dari "Most Drawn Card" di
 * statistics-service.js (Phase 17, kartu paling SERING ditarik di reading):
 * ini kartu yang secara eksplisit ditandai favorit user lewat bintang di
 * Card Detail (Phase 16), bisa jadi kartu yang belum pernah/jarang ditarik
 * sama sekali.
 * @param {"card"|"spread"} entityType
 * @returns {Promise<string|null>}
 */
export async function getLatestFavoriteEntityId(entityType) {
  const userId = currentUserId();
  return userId ? latestIdCloud(entityType, userId) : latestIdLocal(entityType);
}
