// OTR — Daily Card Engine (Phase 15 — Daily Card, Roadmap Phase 15, Master Spec §27-28)
//
// Fungsi murni, tanpa DOM/state/storage/network — sama seperti
// js/tarot/tarot-engine.js & js/tarot/interpretation.js, supaya tetap
// testable lewat `node` saja dan gampang dipastikan deterministik.
//
// Algoritma persis Master Spec §27:
//   userId + date -> deterministic seed -> card index -> daily card
// "Should return the same card throughout the day" — determinisme di sini
// murni lewat hash stabil (BUKAN storage). Alasannya: js/services/daily-service.js
// tetap storage-first (cek record tersimpan dulu sebelum menghitung), tapi
// kalau dua tab/device menghitung BARENGAN sebelum salah satu sempat
// tersimpan (mis. dua tab dibuka nyaris bersamaan pagi hari, atau race cloud
// upsert), hasil dari fungsi ini dijamin SAMA PERSIS untuk seedId+date yang
// sama — tidak ada skenario "tab A dapat kartu berbeda dari tab B".

import { getAllCards } from "../../data/tarot-cards.js";

/** djb2 hash sederhana — sengaja diduplikasi dari js/tarot/interpretation.js
 *  (bukan diimpor): kedua modul memang didesain pure/tanpa-dependency
 *  silang satu sama lain, dan menambah 1 shared util module cuma untuk
 *  fungsi 6-baris ini dianggap lebih berisiko coupling yang tidak perlu
 *  daripada duplikasi kecil. Cukup untuk memilih index secara stabil &
 *  reproducible, bukan untuk kriptografi. */
function stableHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Normalisasi Date -> "YYYY-MM-DD" berbasis waktu LOKAL (BUKAN
 * `toISOString()`, yang mengonversi ke UTC). Kartu harian harus mengikuti
 * hari kalender user, dan `toISOString()` bisa salah "hari" untuk user di
 * timezone timur UTC dekat tengah malam — mis. WIB (UTC+7) jam 02:00 pagi
 * 24 Agustus, `toISOString()` masih menunjuk ke 23 Agustus (17:00 UTC hari
 * sebelumnya).
 * @param {Date|string} [date]
 * @returns {string}
 */
export function toDateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Bank pertanyaan reflektif KHUSUS Daily Card — beda nada dari
// REFLECTION_TEMPLATES di interpretation.js (yang ditulis untuk konteks
// reading bertanya/posisi spread). Di sini fokus ke "hari ini", konsisten
// dengan Roadmap Phase 15 fitur "Reflection" sebagai bagian dari Daily
// Card, bukan journal bebas (lihat catatan skema di daily-service.js).
const DAILY_REFLECTION_PROMPTS = [
  (ctx) => `Bagaimana energi "${ctx.keyword}" dari ${ctx.cardName} bisa hadir dalam harimu hari ini?`,
  (ctx) => `Apa satu hal kecil hari ini yang mencerminkan ${ctx.cardName}?`,
  (ctx) => `Kalau ${ctx.cardName} adalah pengingat untuk hari ini, apa yang ingin ia sampaikan?`,
  (ctx) => `Di mana kamu bisa membawa "${ctx.keyword}" ke satu keputusan atau percakapan hari ini?`,
  (ctx) => `Apa yang terasa berbeda kalau kamu menjalani hari ini dengan semangat ${ctx.cardName}?`,
  (ctx) => `Sebelum hari ini berakhir, bagaimana kamu ingin "${ctx.keyword}" sudah terasa nyata?`,
];

function buildReflectionPrompt(seed, card) {
  const bank = DAILY_REFLECTION_PROMPTS;
  const template = bank[stableHash(`${seed}:prompt`) % bank.length];
  return template({ cardName: card.name, keyword: card.keywords?.[0] ?? card.name });
}

/**
 * @param {object} params
 * @param {string} params.seedId - userId (login) atau guest id persisten
 *   per device (lihat getOrCreateGuestId() di js/core/storage.js) — bagian
 *   "userId" dari algoritma Master Spec §27.
 * @param {Date|string} [params.date] - default hari ini (waktu lokal)
 * @param {number} [params.reversedProbability] - default 0.5, sama seperti
 *   rollOrientation() reading biasa (Master Spec §11) — didesain
 *   configurable untuk konsistensi API, bukan karena Daily Card sudah punya
 *   toggle sendiri di Settings (belum ada di scope Phase 15).
 * @returns {{date:string, cardId:string, orientation:"upright"|"reversed", reflectionPrompt:string}}
 */
export function getDailyCard({ seedId, date = new Date(), reversedProbability = 0.5 } = {}) {
  if (!seedId) {
    throw new Error("[daily-card] getDailyCard() butuh seedId (userId atau guest id).");
  }

  const dateKey = toDateKey(date);
  const cards = getAllCards();
  const seed = `${seedId}:${dateKey}`;

  const cardIndex = stableHash(`${seed}:card`) % cards.length;
  const card = cards[cardIndex];

  // Salt berbeda ("orientation") dari pemilihan kartu ("card") supaya
  // orientasi tidak diam-diam berkorelasi dengan index kartu (mis. index
  // genap selalu jatuh upright kalau pakai hash yang sama).
  const orientationRoll = stableHash(`${seed}:orientation`) % 100;
  const orientation = orientationRoll < Math.round(reversedProbability * 100) ? "reversed" : "upright";

  return {
    date: dateKey,
    cardId: card.id,
    orientation,
    reflectionPrompt: buildReflectionPrompt(seed, card),
  };
}
