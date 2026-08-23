// OTR — Service: Journal (Phase 14 — Cloud Sync, Roadmap Phase 14, Master Spec §25/§43)
// Sama pola dengan reading-service.js -- pilih backend dari `state.user`,
// bentuk record yang dikembalikan SAMA untuk guest maupun cloud:
//   { id, readingId, content, createdAt, updatedAt }
//
// "One reading may have one journal entry in MVP" (§25) dipertahankan di
// KEDUA backend -- saveJournalEntry() tetap upsert-by-readingId, bukan
// insert selalu baru.

import { getState } from "../core/state.js";
import { getSupabaseClient } from "../integrations/supabase.js";
import {
  listGuestJournalEntries,
  getGuestJournalByReadingId,
  saveGuestJournalEntry,
  deleteGuestJournalEntry,
} from "../core/storage.js";

function currentUserId() {
  return getState().user?.id ?? null;
}

function mapCloudRow(row) {
  return {
    id: row.id,
    readingId: row.reading_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---- Local (guest) ------------------------------------------------------

async function listLocal() {
  return listGuestJournalEntries();
}

async function getLocalByReadingId(readingId) {
  return getGuestJournalByReadingId(readingId);
}

async function saveLocal({ readingId, content }) {
  const saved = saveGuestJournalEntry({ readingId, content });
  if (!saved) throw new Error("Gagal menyimpan journal ke penyimpanan lokal.");
  return saved;
}

async function deleteLocal(id) {
  const ok = deleteGuestJournalEntry(id);
  if (!ok) throw new Error("Journal tidak ditemukan.");
}

// ---- Cloud ----------------------------------------------------------------

async function listCloud(userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("journals")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`Gagal memuat journal dari cloud: ${error.message}`);
  return (data ?? []).map(mapCloudRow);
}

async function getCloudByReadingId(readingId, userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("journals")
    .select("*")
    .eq("reading_id", readingId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`Gagal memuat journal dari cloud: ${error.message}`);
  return data ? mapCloudRow(data) : null;
}

/** Upsert-by-readingId manual (bukan `upsert()` Supabase, karena kolom unik
 *  di schema cloud adalah `id` -- bukan `reading_id` -- lihat §43): cek dulu
 *  apakah sudah ada baris journal untuk reading ini, update kalau ada,
 *  insert kalau belum. Sama persis alur saveGuestJournalEntry() di
 *  core/storage.js, cuma backend-nya beda. */
async function saveCloud({ readingId, content }, userId) {
  const supabase = getSupabaseClient();
  const existing = await getCloudByReadingId(readingId, userId);

  if (existing) {
    const { data, error } = await supabase
      .from("journals")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw new Error(`Gagal memperbarui journal di cloud: ${error.message}`);
    return mapCloudRow(data);
  }

  const { data, error } = await supabase
    .from("journals")
    .insert({ user_id: userId, reading_id: readingId, content })
    .select()
    .single();
  if (error) throw new Error(`Gagal menyimpan journal ke cloud: ${error.message}`);
  return mapCloudRow(data);
}

async function deleteCloud(id, userId) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("journals").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(`Gagal menghapus journal dari cloud: ${error.message}`);
}

// ---- Public API -----------------------------------------------------------

export async function listJournalEntries() {
  const userId = currentUserId();
  return userId ? listCloud(userId) : listLocal();
}

export async function getJournalByReadingId(readingId) {
  const userId = currentUserId();
  return userId ? getCloudByReadingId(readingId, userId) : getLocalByReadingId(readingId);
}

export async function saveJournalEntry({ readingId, content }) {
  const userId = currentUserId();
  return userId ? saveCloud({ readingId, content }, userId) : saveLocal({ readingId, content });
}

export async function deleteJournalEntry(id) {
  const userId = currentUserId();
  return userId ? deleteCloud(id, userId) : deleteLocal(id);
}
