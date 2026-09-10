// OTR — Service: Quiz Progress (Phase 21 — Quiz, Roadmap Phase 21, Master Spec §71)
// Pola sama dengan daily-service.js/favorite-service.js: backend dipilih
// dari state.user (SEKALI dicek per pemanggilan), bentuk record yang
// dikembalikan SAMA untuk guest maupun cloud:
//   { topic, bestScore, bestTotal, attempts, lastPlayedAt }
//
// "best score" per topik (bukan log semua attempt) -- konsisten dengan
// keputusan Daily Card Phase 15 (1 baris per hari, bukan log tiap
// kunjungan). recordQuizResult() dipanggil SEKALI di akhir sesi kuis
// (js/pages/quiz.js, saat status quiz-engine.js jadi "completed") --
// bukan per-jawaban, supaya tidak menambah network call per soal.

import { getState } from "../core/state.js";
import { getSupabaseClient } from "../integrations/supabase.js";
import {
  listGuestQuizProgress,
  getGuestQuizProgressByTopic,
  saveGuestQuizProgress,
} from "../core/storage.js";

function currentUserId() {
  return getState().user?.id ?? null;
}

function mapCloudRow(row) {
  return {
    topic: row.topic,
    bestScore: row.best_score,
    bestTotal: row.best_total,
    attempts: row.attempts,
    lastPlayedAt: row.last_played_at,
  };
}

// ---- Local (guest) -------------------------------------------------------

async function recordLocal({ topic, score, total }) {
  const existing = getGuestQuizProgressByTopic(topic);
  const attempts = (existing?.attempts ?? 0) + 1;
  const isNewBest = score > (existing?.bestScore ?? -1);
  const record = {
    topic,
    bestScore: isNewBest ? score : existing.bestScore,
    bestTotal: isNewBest ? total : existing.bestTotal,
    attempts,
    lastPlayedAt: new Date().toISOString(),
  };
  const ok = saveGuestQuizProgress(record);
  if (!ok) throw new Error("Gagal menyimpan progres kuis secara lokal.");
  return record;
}

async function listLocal() {
  return listGuestQuizProgress();
}

// ---- Cloud ----------------------------------------------------------------

async function recordCloud({ topic, score, total }, userId) {
  const supabase = getSupabaseClient();
  const { data: existing, error: fetchError } = await supabase
    .from("quiz_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("topic", topic)
    .maybeSingle();
  if (fetchError) throw new Error(`Gagal memuat progres kuis dari cloud: ${fetchError.message}`);

  const attempts = (existing?.attempts ?? 0) + 1;
  const isNewBest = score > (existing?.best_score ?? -1);
  const bestScore = isNewBest ? score : existing.best_score;
  const bestTotal = isNewBest ? total : existing.best_total;

  const { data: upserted, error: upsertError } = await supabase
    .from("quiz_progress")
    .upsert(
      {
        user_id: userId,
        topic,
        best_score: bestScore,
        best_total: bestTotal,
        attempts,
        last_played_at: new Date().toISOString(),
      },
      { onConflict: "user_id,topic" }
    )
    .select()
    .single();
  if (upsertError) throw new Error(`Gagal menyimpan progres kuis ke cloud: ${upsertError.message}`);
  return mapCloudRow(upserted);
}

async function listCloud(userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("quiz_progress").select("*").eq("user_id", userId);
  if (error) throw new Error(`Gagal memuat progres kuis dari cloud: ${error.message}`);
  return (data ?? []).map(mapCloudRow);
}

// ---- Public API -------------------------------------------------------------

/**
 * Catat hasil satu sesi kuis yang baru saja selesai. Hanya memperbarui
 * bestScore/bestTotal kalau skor sesi ini > best sebelumnya -- attempts
 * & lastPlayedAt selalu bertambah/berubah terlepas dari itu.
 * @param {{topic:string, score:number, total:number}} result
 * @returns {Promise<{topic,bestScore,bestTotal,attempts,lastPlayedAt}>}
 */
export async function recordQuizResult({ topic, score, total }) {
  const userId = currentUserId();
  return userId ? recordCloud({ topic, score, total }, userId) : recordLocal({ topic, score, total });
}

/** Progress semua topik yang pernah dimainkan.
 * @returns {Promise<Array<{topic,bestScore,bestTotal,attempts,lastPlayedAt}>>} */
export async function listQuizProgress() {
  const userId = currentUserId();
  return userId ? listCloud(userId) : listLocal();
}

/** @param {string} topic
 *  @returns {Promise<{topic,bestScore,bestTotal,attempts,lastPlayedAt}|null>} */
export async function getQuizProgressForTopic(topic) {
  const all = await listQuizProgress();
  return all.find((p) => p.topic === topic) ?? null;
}
