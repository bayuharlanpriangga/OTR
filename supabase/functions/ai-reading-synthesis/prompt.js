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

// Phase 23 — AI Personalization. Batas sama persis dengan MAX_* di
// js/services/ai-service.js (client SUDAH memotong ke batas ini sebelum
// kirim) -- diduplikasi & divalidasi ULANG di sini karena Edge Function
// tidak boleh percaya klien begitu saja (klien bisa dibypass, panggil
// Edge Function langsung dengan payload custom).
const MAX_PREVIOUS_READINGS = 5;
const MAX_FAVORITE_CATEGORIES = 5;
const MAX_JOURNAL_THEMES = 8;
const MAX_THEME_TEXT_LENGTH = 200; // per field teks bebas (theme reading sebelumnya) -- bukan angka ajaib, sekadar jaga-jaga oversized abuse sama seperti MAX_QUESTION_LENGTH.

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

  const result = {
    question: typeof question === "string" ? question.trim() : "",
    spread: String(spread).trim(),
    cards: normalizedCards,
  };

  // Phase 23 — key `personalization` SEPENUHNYA opsional (lihat komentar
  // js/services/ai-service.js soal kenapa payload Phase 22 tidak pernah
  // menyertakan key ini). Kalau ada, divalidasi ketat -- tidak percaya
  // shape dari klien, dan SEMUA field-nya sendiri opsional (array boleh
  // kosong, tapi kalau ada isinya harus string non-kosong & dalam batas).
  if (body.personalization !== undefined) {
    result.personalization = validatePersonalization(body.personalization);
  }

  return result;
}

function validatePersonalization(p) {
  if (!p || typeof p !== "object") {
    throw new Error("personalization harus berupa object.");
  }
  const { previousReadings = [], favoriteCategories = [], journalThemes = [] } = p;

  if (!Array.isArray(previousReadings)) throw new Error("personalization.previousReadings harus array.");
  if (previousReadings.length > MAX_PREVIOUS_READINGS) {
    throw new Error(`personalization.previousReadings terlalu banyak (maksimum ${MAX_PREVIOUS_READINGS}).`);
  }
  const normalizedPrevious = previousReadings.map((r, i) => {
    if (!r || typeof r !== "object") throw new Error(`personalization.previousReadings[${i}] tidak valid.`);
    if (!isNonEmptyString(r.spread)) throw new Error(`personalization.previousReadings[${i}].spread wajib diisi.`);
    if (!isNonEmptyString(r.theme)) throw new Error(`personalization.previousReadings[${i}].theme wajib diisi.`);
    if (r.spread.length > MAX_THEME_TEXT_LENGTH || r.theme.length > MAX_THEME_TEXT_LENGTH) {
      throw new Error(`personalization.previousReadings[${i}] terlalu panjang.`);
    }
    return { spread: String(r.spread).trim(), theme: String(r.theme).trim() };
  });

  if (!Array.isArray(favoriteCategories)) throw new Error("personalization.favoriteCategories harus array.");
  if (favoriteCategories.length > MAX_FAVORITE_CATEGORIES) {
    throw new Error(`personalization.favoriteCategories terlalu banyak (maksimum ${MAX_FAVORITE_CATEGORIES}).`);
  }
  const normalizedFavorites = favoriteCategories.map((c, i) => {
    if (!isNonEmptyString(c)) throw new Error(`personalization.favoriteCategories[${i}] harus string non-kosong.`);
    return String(c).trim();
  });

  if (!Array.isArray(journalThemes)) throw new Error("personalization.journalThemes harus array.");
  if (journalThemes.length > MAX_JOURNAL_THEMES) {
    throw new Error(`personalization.journalThemes terlalu banyak (maksimum ${MAX_JOURNAL_THEMES}).`);
  }
  const normalizedThemes = journalThemes.map((t, i) => {
    if (!isNonEmptyString(t)) throw new Error(`personalization.journalThemes[${i}] harus string non-kosong.`);
    // Kata tunggal saja (bukan kalimat) -- lihat extractJournalThemes() di
    // ai-service.js. Bukan penegakan privasi yang kuat (klien bisa
    // dibypass), tapi jaga-jaga in-depth defense: field ini secara desain
    // tidak dimaksudkan menampung kalimat/cuplikan journal.
    if (/\s/.test(t.trim())) throw new Error(`personalization.journalThemes[${i}] harus berupa satu kata, bukan kalimat.`);
    return String(t).trim();
  });

  return {
    previousReadings: normalizedPrevious,
    favoriteCategories: normalizedFavorites,
    journalThemes: normalizedThemes,
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
// Phase 23 — bagian personalisasi disusun terpisah supaya buildPrompt() di
// bawah tetap mudah dibaca, dan supaya bagian ini gampang di-skip total
// (tidak dipanggil sama sekali) kalau payload.personalization tidak ada --
// prompt Phase 22 murni HARUS identik byte-per-byte untuk request tanpa
// personalisasi (regression safety).
function personalizationSectionFor(personalization) {
  const { previousReadings, favoriteCategories, journalThemes } = personalization;
  const lines = [];

  if (previousReadings.length) {
    lines.push("Reading-reading sebelumnya dari user ini (tema, BUKAN kartu detail):");
    lines.push(previousReadings.map((r) => `- ${r.spread}: ${r.theme}`).join("\n"));
  }
  if (favoriteCategories.length) {
    lines.push(`Kategori kartu yang paling sering ditandai favorit oleh user: ${favoriteCategories.join(", ")}.`);
  }
  if (journalThemes.length) {
    lines.push(`Kata-kata yang sering muncul di journal user (BUKAN kalimat/kutipan asli, cuma daftar kata): ${journalThemes.join(", ")}.`);
  }

  if (!lines.length) return "";

  return [
    "",
    "=== KONTEKS PERSONALISASI (opsional, user SUDAH secara eksplisit opt-in untuk ini) ===",
    ...lines,
    "",
    "Instruksi PENTING soal konteks personalisasi di atas:",
    "- Gunakan HANYA sebagai lapisan tambahan yang memperkaya sintesis reading SAAT INI — jangan sampai reading saat ini jadi 'terlupakan' karena fokus ke histori.",
    "- JANGAN membuat kesimpulan psikologis definitif tentang kepribadian/kondisi mental user dari histori ini (mis. JANGAN 'Kamu terlihat sedang depresi'). Ini pola, bukan diagnosis.",
    "- Kalau konteks ini benar-benar dipakai untuk mewarnai sintesis, isi juga field \"personalization_note\" di JSON output (1 kalimat singkat, transparan ke user APA yang dipertimbangkan — mis. \"Sintesis ini mempertimbangkan pola dari reading-reading sebelumnya bertema serupa.\"). Kalau tidak relevan/tidak dipakai, boleh dikosongkan (\"\").",
    "=== AKHIR KONTEKS PERSONALISASI ===",
  ].join("\n");
}

export function buildPrompt(payload) {
  const cardLines = payload.cards.map(cardLineFor).join("\n");
  const personalizationSection = payload.personalization ? personalizationSectionFor(payload.personalization) : "";
  const schemaLine = payload.personalization
    ? '{"theme": "...", "summary": "...", "key_message": "...", "reflection": "...", "personalization_note": "..."}'
    : '{"theme": "...", "summary": "...", "key_message": "...", "reflection": "..."}';

  const lines = [
    "Kamu adalah pembaca tarot yang membantu menyusun sintesis reflektif dari hasil reading.",
    "PENTING: Kamu TIDAK menentukan kartu, orientasi, atau spread apa pun — semua itu sudah final dan diberikan di bawah, murni sudah ditentukan secara acak oleh sistem sebelum kamu terlibat. Tugasmu HANYA mensintesis interpretasi dari data yang sudah ada.",
    "",
    `Spread: ${payload.spread}`,
    payload.question ? `Pertanyaan dari user: "${payload.question}"` : "Tidak ada pertanyaan spesifik dari user.",
    "",
    "Kartu-kartu dalam reading ini (urutan sesuai posisi):",
    cardLines,
  ];
  // personalizationSection sudah membawa "" leading kosong sendiri kalau ada
  // isinya (lihat personalizationSectionFor) -- kalau kosong (tidak
  // opt-in), TIDAK ditambahkan sama sekali supaya prompt Phase 22 identik
  // byte-per-byte (bukan cuma "kelihatan sama", literal sama).
  if (personalizationSection) lines.push(personalizationSection);
  lines.push(
    "",
    "Tulis dalam Bahasa Indonesia. Gunakan bahasa REFLEKTIF, bukan prediksi pasti:",
    'Gunakan frasa seperti "Kartu ini mungkin menunjukkan...", "Kombinasi ini bisa mengarah pada...", "Pertimbangkan apakah...".',
    'JANGAN gunakan frasa seperti "Ini pasti akan terjadi", "Kamu ditakdirkan untuk...", "Orang ini pasti...", "Kamu akan pasti...".',
    "",
    "Balas HANYA dengan JSON valid (tanpa markdown, tanpa teks lain di luar JSON) dengan schema persis berikut:",
    schemaLine,
    "- theme: 1 kalimat pendek tema utama reading ini.",
    "- summary: 2-4 kalimat sintesis yang menghubungkan semua kartu di atas.",
    "- key_message: 1-2 kalimat pesan utama yang paling actionable.",
    "- reflection: 1 pertanyaan reflektif terbuka untuk direnungkan user."
  );
  if (payload.personalization) {
    lines.push("- personalization_note: lihat instruksi di atas — boleh string kosong kalau konteks personalisasi tidak dipakai.");
  }
  return lines.join("\n");
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
  const result = {
    theme: obj.theme.trim(),
    summary: obj.summary.trim(),
    key_message: obj.key_message.trim(),
    reflection: obj.reflection.trim(),
  };
  // Phase 23: personalization_note SENGAJA tidak masuk SYNTHESIS_FIELDS
  // (tidak wajib non-kosong) -- prompt.js mengizinkan model mengosongkannya
  // kalau konteks personalisasi tidak relevan untuk reading ini. Cuma
  // divalidasi TIPE-nya kalau field-nya ada di respons sama sekali.
  if (obj.personalization_note !== undefined) {
    if (typeof obj.personalization_note !== "string") {
      throw new Error("Respons model AI tidak valid — personalization_note harus string.");
    }
    result.personalization_note = obj.personalization_note.trim();
  }
  return result;
}
