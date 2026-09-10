// OTR — Service: AI Reading Synthesis (Phase 22 — AI Reading, Roadmap Phase
// 22, Master Spec §66-68).
//
// Beda pola dari services lain (reading-service.js, quiz-service.js, dst):
// TIDAK ADA jalur guest/localStorage di sini sama sekali -- AI synthesis
// SELALU lewat Supabase Edge Function, untuk guest maupun user login (Master
// Spec §66: "AI requests must go through a secure backend/serverless
// function", tidak ada pengecualian mode guest). supabase.functions.invoke()
// otomatis mengirim anon key sebagai Authorization kalau tidak ada sesi
// login -- Edge Function ai-reading-synthesis/index.js tidak membedakan
// anon vs authenticated, jadi guest bisa memakai fitur ini tanpa login.
//
// Fungsi murni buildAIReadingPayload() dipisah dari fungsi network
// getAIReadingSynthesis() supaya bagian pembentukan payload testable lewat
// `node` tanpa network (lihat scripts/test_phase22_ai_reading.mjs) -- pola
// yang sama dengan alasan js/tarot/interpretation.js dipisah dari DOM.
//
// Catatan scope (didokumentasikan juga di PROJECT_STATUS.md): hasil AI
// synthesis TIDAK dipersist ke reading yang tersimpan (localStorage maupun
// tabel `readings` cloud) -- digenerate ulang tiap kali Result Page dibuka
// & tombol "Lihat Interpretasi AI" diklik. Keputusan scope sengaja supaya
// tidak menambah kolom skema baru ke `readings` (yang berarti perlu migration
// + perubahan reading-service.js/history-detail.js) untuk fase yang DONE
// WHEN-nya cuma "AI synthesis works without exposing API keys" -- lihat
// catatan "Kandidat masa depan" di PROJECT_STATUS.md kalau Orias mau AI
// synthesis muncul lagi tanpa re-generate saat reading dibuka dari History.

import { getSupabaseClient } from "../integrations/supabase.js";

const FUNCTION_NAME = "ai-reading-synthesis";

/**
 * Menyusun payload sesuai Master Spec §67 "AI input" dari data yang SUDAH
 * ada di Result Page (js/pages/result.js) -- tidak menghitung ulang apa pun,
 * murni reshape. `entries` menerima array item persis seperti `validEntries`
 * di result.js: `{ entry: {orientation}, position: {name}, card: {name},
 * interpretation: {meaning} }`.
 *
 * @param {object} params
 * @param {string} [params.question]
 * @param {{name:string}} params.spread
 * @param {Array<{entry:{orientation:string}, position:{name:string}, card:{name:string}, interpretation:{meaning:string}}>} params.entries
 * @returns {{question:string, spread:string, cards:Array<{position:string,card:string,orientation:string,meaning:string}>}}
 */
export function buildAIReadingPayload({ question = "", spread, entries }) {
  if (!spread?.name) {
    throw new Error("[ai-service] buildAIReadingPayload() butuh spread yang valid.");
  }
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error("[ai-service] buildAIReadingPayload() butuh minimal 1 entry kartu.");
  }

  return {
    question: question || "",
    spread: spread.name,
    cards: entries.map(({ entry, position, card, interpretation }) => ({
      position: position?.name ?? "",
      card: card?.name ?? "",
      orientation: entry?.orientation ?? "upright",
      meaning: interpretation?.meaning ?? "",
    })),
  };
}

/** Reshape respons Edge Function (snake_case, Master Spec §67 "AI output")
 *  jadi camelCase konsisten dengan konvensi shape lain di app ini
 *  (synthesizeReading() di js/tarot/interpretation.js juga pakai camelCase). */
function mapSynthesisResponse(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Respons AI tidak valid.");
  }
  const { theme, summary, key_message: keyMessage, reflection } = data;
  const allValid = [theme, summary, keyMessage, reflection].every((v) => typeof v === "string" && v.trim());
  if (!allValid) {
    throw new Error("Respons AI tidak lengkap.");
  }
  return { theme, summary, keyMessage, reflection };
}

/**
 * Panggil Edge Function ai-reading-synthesis. Selalu network call -- tidak
 * ada cache/fallback lokal (lihat catatan scope di atas file).
 * @param {{question:string, spread:string, cards:Array}} payload - hasil buildAIReadingPayload()
 * @returns {Promise<{theme:string, summary:string, keyMessage:string, reflection:string}>}
 */
export async function getAIReadingSynthesis(payload) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, { body: payload });
  if (error) {
    throw new Error(`Gagal mendapatkan interpretasi AI: ${error.message ?? String(error)}`);
  }
  return mapSynthesisResponse(data);
}
