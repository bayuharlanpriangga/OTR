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

// ---------------------------------------------------------------------------
// Phase 23 — AI Personalization (Roadmap Phase 23, DONE WHEN tidak eksplisit
// di Roadmap -- definisi "selesai" di bawah ini keputusan sesi ini sendiri,
// PERLU dikonfirmasi ke Orias, lihat PROJECT_STATUS.md).
//
// Dua constraint Roadmap yang ditulis TEBAL:
//   1. "User must explicitly opt in"
//   2. "Do not automatically analyze private journal content"
//
// Desain dua-lapis opt-in yang dipakai untuk memenuhi constraint #1:
//   Lapis 1 (Settings, per-akun/device, js/pages/settings.js):
//     settings.aiPersonalizationOptIn -- toggle "boleh DITAWARI", default
//     OFF. TIDAK men-generate apa pun sendirian.
//   Lapis 2 (Result Page, PER READING, js/pages/result.js):
//     hanya muncul kalau Lapis 1 ON. Checkbox "Sertakan pola reading &
//     favorit sebelumnya" -- harus dicentang ulang setiap kali user mau
//     personalisasi dipakai (tidak "sekali klik selamanya").
//
// Constraint #2 (Journal) dipenuhi dengan gerbang KETIGA yang lebih ketat:
//   - Checkbox terpisah "Sertakan tema dari Journal-ku", hanya muncul kalau
//     Lapis 2 sudah dicentang, dan HARUS dicentang ulang per reading juga.
//   - Bahkan kalau dicentang, TEKS JOURNAL MENTAH TIDAK PERNAH dikirim kemana
//     pun -- extractJournalThemes() di bawah cuma menghasilkan daftar kata
//     kunci frekuensi-tinggi (bukan kalimat, bukan konteks), dihitung 100%
//     di klien. Ini keputusan scope yang lebih ketat dari yang diwajibkan
//     Roadmap secara harfiah (Roadmap cuma bilang "jangan otomatis", tidak
//     melarang analisis manual) -- diambil karena "Journal Themes" di
//     Roadmap Potential Inputs tidak mendefinisikan representasi konkretnya,
//     dan mengirim ringkasan kata kunci jauh lebih aman secara privasi
//     daripada mengirim cuplikan/teks penuh journal ke Edge Function pihak
//     ketiga (Gemini). PERLU dikonfirmasi ke Orias apakah representasi ini
//     cukup "deep" untuk maksud "deeper synthesis" Roadmap.
// ---------------------------------------------------------------------------

const MAX_PREVIOUS_READINGS = 5;
const MAX_FAVORITE_CATEGORIES = 5;
const MAX_JOURNAL_THEMES = 8;

const CATEGORY_LABELS = {
  major: "Major Arcana",
  wands: "Wands",
  cups: "Cups",
  swords: "Swords",
  pentacles: "Pentacles",
};

/** Kata umum Bahasa Indonesia yang dibuang sebelum menghitung frekuensi kata
 *  di journal -- daftar sengaja pendek/kasar (bukan library stopword penuh),
 *  cukup untuk menyaring kata sambung paling umum supaya "tema" yang keluar
 *  bermakna, bukan daftar "yang/dan/saya". */
const STOPWORDS = new Set([
  "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "ini", "itu", "saya",
  "aku", "kamu", "dia", "mereka", "kita", "kami", "akan", "sudah", "belum",
  "tidak", "juga", "atau", "karena", "kalau", "jadi", "ada", "adalah",
  "saat", "waktu", "hari", "tapi", "sangat", "lebih", "masih", "bisa",
  "harus", "seperti", "banyak", "sama", "dalam", "pada", "oleh", "para",
]);

/**
 * Ekstraksi tema journal sangat sederhana & murni klien -- lihat catatan
 * privasi di atas file ini. TIDAK PERNAH mengembalikan kalimat/cuplikan asli,
 * hanya kata-kata individual yang paling sering muncul lintas entri.
 * @param {Array<{content:string}>} entries
 * @param {number} [max]
 * @returns {string[]}
 */
export function extractJournalThemes(entries = [], max = MAX_JOURNAL_THEMES) {
  const freq = new Map();
  for (const entry of entries) {
    const words = String(entry?.content ?? "")
      .toLowerCase()
      .replace(/[^a-zà-ÿ0-9\s]/gi, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
    for (const w of words) {
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([word]) => word);
}

/**
 * @param {Array<{spreadName?:string, synthesisSnapshot?:{theme?:string}, createdAt?:string, id?:string}>} readings
 * @param {string} [excludeId] - reading yang sedang dibuka, jangan dianggap "sebelumnya"
 * @param {number} [max]
 * @returns {Array<{spread:string, theme:string, createdAt:string}>}
 */
export function summarizePreviousReadings(readings = [], excludeId = null, max = MAX_PREVIOUS_READINGS) {
  return readings
    .filter((r) => r?.id !== excludeId && r?.status !== "in_progress")
    .slice(0, max)
    .map((r) => ({
      spread: r.spreadName ?? "",
      theme: r.synthesisSnapshot?.theme ?? "",
      createdAt: r.createdAt ?? "",
    }))
    .filter((r) => r.spread && r.theme);
}

/**
 * @param {string[]} favoriteCardIds
 * @param {(id:string) => {arcana?:string, suit?:string}|null} getCardById
 * @param {number} [max]
 * @returns {string[]} label kategori, terurut dari paling sering
 */
export function summarizeFavoriteCategories(favoriteCardIds = [], getCardById, max = MAX_FAVORITE_CATEGORIES) {
  const freq = new Map();
  for (const id of favoriteCardIds) {
    const card = getCardById?.(id);
    if (!card) continue;
    const key = card.arcana === "major" ? "major" : (card.suit ?? null);
    if (!key || !CATEGORY_LABELS[key]) continue;
    freq.set(key, (freq.get(key) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([key]) => CATEGORY_LABELS[key]);
}

/**
 * Gabungkan tiga sumber opsional jadi satu object `personalization` siap
 * ditempel ke payload -- mengembalikan `null` kalau semuanya kosong (supaya
 * pemanggil tidak mengirim object personalization kosong yang tidak berguna).
 * @param {{previousReadings?:Array, favoriteCategories?:string[], journalThemes?:string[]}} parts
 * @returns {{previousReadings:Array, favoriteCategories:string[], journalThemes:string[]}|null}
 */
export function buildPersonalizationContext({ previousReadings = [], favoriteCategories = [], journalThemes = [] } = {}) {
  if (previousReadings.length === 0 && favoriteCategories.length === 0 && journalThemes.length === 0) {
    return null;
  }
  return { previousReadings, favoriteCategories, journalThemes };
}

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
 * @param {{previousReadings:Array, favoriteCategories:string[], journalThemes:string[]}|null} [params.personalization]
 *   Phase 23 -- hasil buildPersonalizationContext(), atau `null`/tidak diisi
 *   sama sekali kalau user tidak opt-in (lihat catatan dua-lapis opt-in di
 *   atas file ini). Field ini SENGAJA opsional & default tidak ada --
 *   perilaku tanpa argumen ini harus identik 100% dengan Phase 22.
 * @returns {{question:string, spread:string, cards:Array<{position:string,card:string,orientation:string,meaning:string}>, personalization?:object}}
 */
export function buildAIReadingPayload({ question = "", spread, entries, personalization = null }) {
  if (!spread?.name) {
    throw new Error("[ai-service] buildAIReadingPayload() butuh spread yang valid.");
  }
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error("[ai-service] buildAIReadingPayload() butuh minimal 1 entry kartu.");
  }

  const payload = {
    question: question || "",
    spread: spread.name,
    cards: entries.map(({ entry, position, card, interpretation }) => ({
      position: position?.name ?? "",
      card: card?.name ?? "",
      orientation: entry?.orientation ?? "upright",
      meaning: interpretation?.meaning ?? "",
    })),
  };

  // Hanya tempel key `personalization` kalau beneran ada isinya -- payload
  // Phase 22 (tanpa opt-in) TIDAK BOLEH punya key ini sama sekali, supaya
  // validatePayload() di Edge Function bisa membedakan "user tidak opt-in"
  // dari "user opt-in tapi kebetulan semua sumber kosong".
  if (personalization) {
    payload.personalization = personalization;
  }

  return payload;
}

/** Reshape respons Edge Function (snake_case, Master Spec §67 "AI output")
 *  jadi camelCase konsisten dengan konvensi shape lain di app ini
 *  (synthesizeReading() di js/tarot/interpretation.js juga pakai camelCase). */
function mapSynthesisResponse(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Respons AI tidak valid.");
  }
  const { theme, summary, key_message: keyMessage, reflection, personalization_note: personalizationNote } = data;
  const allValid = [theme, summary, keyMessage, reflection].every((v) => typeof v === "string" && v.trim());
  if (!allValid) {
    throw new Error("Respons AI tidak lengkap.");
  }
  // Phase 23: personalization_note cuma ada kalau request-nya menyertakan
  // `personalization` (lihat prompt.js validateSynthesis) -- opsional di
  // sisi klien juga, ditampilkan result.js kalau ada.
  const result = { theme, summary, keyMessage, reflection };
  if (typeof personalizationNote === "string" && personalizationNote.trim()) {
    result.personalizationNote = personalizationNote.trim();
  }
  return result;
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
