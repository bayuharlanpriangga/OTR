// OTR — Edge Function "ai-reading-synthesis": pure logic (Phase 22 — AI Reading,
// Roadmap Phase 22, Master Spec §66-68).
//
// Kenapa dipisah dari index.js: index.js (Deno.serve handler) memanggil
// `Deno.env`/`fetch` ke Gemini, yang tidak bisa dijalankan/dites lewat `node`
// biasa (tidak ada akses Deno runtime maupun jaringan ke generativelanguage.
// googleapis.com dari sandbox coding sesi ini — lihat PROJECT_STATUS.md).
// Modul INI sengaja nol dependency ke Deno/fetch/env — murni fungsi string/
// object in-out — supaya bisa di-import & diuji langsung lewat
// `scripts/test_phase22_ai_reading.mjs` (pola yang sama dengan alasan
// js/tarot/tarot-engine.js dipisah dari DOM/state di Phase 3-5: logic yang
// testable harus bisa dites tanpa runtime yang tidak tersedia di sandbox).
//
// Tiga tanggung jawab modul ini:
//   1. validatePayload(body)   — payload masuk dari klien (Master Spec §67
//      "AI input").
//   2. buildPrompt(payload)    — teks prompt yang dikirim ke Gemini, dengan
//      instruksi schema output (Master Spec §67 "AI output") + instruksi
//      bahasa reflektif (Master Spec §68 "AI SAFETY / PRODUCT POSITIONING").
//   3. parseModelText(text) + validateSynthesis(obj) — parsing & validasi
//      respons mentah dari Gemini supaya index.js tidak pernah meneruskan
//      JSON rusak/schema tidak lengkap ke klien.

// ---------------------------------------------------------------------------
// 1. validatePayload — Master Spec §67 "AI input":
//    { question, spread, cards: [{ position, card, orientation, meaning }] }
// ---------------------------------------------------------------------------

const MAX_CARDS = 15; // batas wajar (spread MVP terbesar = 5 kartu, lihat data/default-spreads.js) — jaga-jaga terhadap payload abusive/oversized.
const MAX_QUESTION_LENGTH = 500;
const VALID_ORIENTATIONS = new Set(["upright", "reversed"]);

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * @param {unknown} body
 * @returns {{question:string, spread:string, cards:Array<{position:string,card:string,orientation:"upright"|"reversed",meaning:string}>}}
 * @throws {Error} pesan siap dikirim sebagai error 400 ke klien
 */
export function validatePayload(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Payload tidak valid.");
  }

  const { question = "", spread, cards } = body;

  if (question !== "" && !isNonEmptyString(question)) {
    throw new Error("question harus berupa string.");
  }
  if (typeof question === "string" && question.length > MAX_QUESTION_LENGTH) {
    throw new Error(`question terlalu panjang (maksimum ${MAX_QUESTION_LENGTH} karakter).`);
  }
  if (!isNonEmptyString(spread)) {
    throw new Error("spread wajib diisi.");
  }
  if (!Array.isArray(cards) || cards.length === 0) {
    throw new Error("cards wajib berupa array berisi minimal 1 kartu.");
  }
  if (cards.length > MAX_CARDS) {
    throw new Error(`cards terlalu banyak (maksimum ${MAX_CARDS}).`);
  }

  const normalizedCards = cards.map((c, i) => {
    if (!c || typeof c !== "object") {
      throw new Error(`cards[${i}] tidak valid.`);
    }
    if (!isNonEmptyString(c.position)) throw new Error(`cards[${i}].position wajib diisi.`);
    if (!isNonEmptyString(c.card)) throw new Error(`cards[${i}].card wajib diisi.`);
    if (!VALID_ORIENTATIONS.has(c.orientation)) {
      throw new Error(`cards[${i}].orientation harus "upright" atau "reversed".`);
    }
    if (!isNonEmptyString(c.meaning)) throw new Error(`cards[${i}].meaning wajib diisi.`);
    return {
      position: String(c.position).trim(),
      card: String(c.card).trim(),
      orientation: c.orientation,
      meaning: String(c.meaning).trim(),
    };
  });

  return {
    question: typeof question === "string" ? question.trim() : "",
    spread: String(spread).trim(),
    cards: normalizedCards,
  };
}

// ---------------------------------------------------------------------------
// 2. buildPrompt — Master Spec §67 (schema output) + §68 (bahasa reflektif)
// ---------------------------------------------------------------------------

const ORIENTATION_LABEL = { upright: "Tegak", reversed: "Terbalik" };

function cardLineFor(c, i) {
  return `${i + 1}. Posisi "${c.position}" — ${c.card} (${ORIENTATION_LABEL[c.orientation]}). Makna dasar: ${c.meaning}`;
}

/**
 * @param {{question:string, spread:string, cards:Array}} payload - hasil validatePayload()
 * @returns {string}
 */
export function buildPrompt(payload) {
  const cardLines = payload.cards.map(cardLineFor).join("\n");

  return [
    "Kamu adalah pembaca tarot yang membantu menyusun sintesis reflektif dari hasil reading.",
    "PENTING: Kamu TIDAK menentukan kartu, orientasi, atau spread apa pun — semua itu sudah final dan diberikan di bawah, murni sudah ditentukan secara acak oleh sistem sebelum kamu terlibat. Tugasmu HANYA mensintesis interpretasi dari data yang sudah ada.",
    "",
    `Spread: ${payload.spread}`,
    payload.question ? `Pertanyaan dari user: "${payload.question}"` : "Tidak ada pertanyaan spesifik dari user.",
    "",
    "Kartu-kartu dalam reading ini (urutan sesuai posisi):",
    cardLines,
    "",
    "Tulis dalam Bahasa Indonesia. Gunakan bahasa REFLEKTIF, bukan prediksi pasti:",
    'Gunakan frasa seperti "Kartu ini mungkin menunjukkan...", "Kombinasi ini bisa mengarah pada...", "Pertimbangkan apakah...".',
    'JANGAN gunakan frasa seperti "Ini pasti akan terjadi", "Kamu ditakdirkan untuk...", "Orang ini pasti...", "Kamu akan pasti...".',
    "",
    "Balas HANYA dengan JSON valid (tanpa markdown, tanpa teks lain di luar JSON) dengan schema persis berikut:",
    '{"theme": "...", "summary": "...", "key_message": "...", "reflection": "..."}',
    "- theme: 1 kalimat pendek tema utama reading ini.",
    "- summary: 2-4 kalimat sintesis yang menghubungkan semua kartu di atas.",
    "- key_message: 1-2 kalimat pesan utama yang paling actionable.",
    "- reflection: 1 pertanyaan reflektif terbuka untuk direnungkan user.",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// 3. parseModelText + validateSynthesis — Master Spec §67 "AI output must
//    follow a schema".
// ---------------------------------------------------------------------------

/**
 * Gemini kadang membungkus JSON dalam code fence ```json ... ``` walau sudah
 * diminta "tanpa markdown" — strip dulu sebelum JSON.parse supaya tidak
 * rapuh terhadap variasi kecil ini.
 * @param {string} text
 * @returns {object}
 * @throws {Error}
 */
export function parseModelText(text) {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Respons model AI kosong.");
  }
  const stripped = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  try {
    return JSON.parse(stripped);
  } catch {
    throw new Error("Respons model AI bukan JSON valid.");
  }
}

const SYNTHESIS_FIELDS = ["theme", "summary", "key_message", "reflection"];

/**
 * @param {unknown} obj
 * @returns {{theme:string, summary:string, key_message:string, reflection:string}}
 * @throws {Error}
 */
export function validateSynthesis(obj) {
  if (!obj || typeof obj !== "object") {
    throw new Error("Respons model AI tidak berupa object.");
  }
  for (const field of SYNTHESIS_FIELDS) {
    if (!isNonEmptyString(obj[field])) {
      throw new Error(`Respons model AI tidak lengkap — field "${field}" hilang atau kosong.`);
    }
  }
  return {
    theme: obj.theme.trim(),
    summary: obj.summary.trim(),
    key_message: obj.key_message.trim(),
    reflection: obj.reflection.trim(),
  };
}
