// OTR — Service: Statistics (Phase 17 — Statistics, Roadmap Phase 17, Master
// Spec §34)
//
// Semua angka di sini DIHITUNG (derived) dari listReadings() yang sudah ada
// (reading-service.js) -- TIDAK ADA tabel/kolom baru di Supabase maupun
// core/storage.js. Ini sengaja mengikuti instruksi eksplisit Roadmap Phase 17
// ("Prefer derived statistics. Jangan membuat banyak redundant database
// fields.") dan Master Spec §34 ("Do not store redundant statistics unless
// necessary. Calculate from source data.").
//
// Kenapa modul terpisah dari js/pages/statistics.js (bukan logic ditulis
// langsung di page seperti pola journal.js/history.js): Master Spec §0 file
// tree sudah menyiapkan slot `js/services/statistics-service.js` sejak awal
// proyek, dan sebagian metrik yang sama kemungkinan dipakai ulang di Profile
// (Roadmap Phase 18, Master Spec §35 minta "Reading Count, Favorite Card,
// Current Streak" -- subset dari yang dihitung di sini) -- supaya nanti
// Profile tinggal import, bukan menghitung ulang dari nol.
//
// computeStatistics() sengaja dipisah dari getStatistics(): yang pertama
// murni (input array reading -> output angka, tidak ada I/O) sehingga gampang
// dites lewat `node` tanpa jsdom/mock service, mengikuti pola yang sama
// dengan js/tarot/tarot-engine.js yang sengaja dipisah dari result.js.

import { listReadings } from "./reading-service.js";
import { getCardById } from "../../data/tarot-cards.js";
import { getSpreadById } from "../tarot/spreads.js";
import { toDateKey } from "../tarot/daily-card.js";

// Master Spec §7: kartu Major Arcana punya `suit: null` -- "Most Frequent
// Suit" (Roadmap Phase 17) tidak eksplisit merinci apakah Major Arcana ikut
// dihitung atau dikecualikan total. Dikecualikan total berarti kehilangan
// info kalau user banyak menarik Major Arcana (justru sering jadi insight
// paling menarik secara tradisi tarot), jadi diperlakukan sebagai kategori
// tersendiri "Major Arcana" alih-alih dibuang -- konsisten dengan filter
// arcana yang sudah ada di Library (Phase 9).
const SUIT_LABELS = {
  wands: "Wands",
  cups: "Cups",
  swords: "Swords",
  pentacles: "Pentacles",
  major: "Major Arcana",
};

function readingDate(reading) {
  // Fallback berjenjang yang sama dengan getReadingDate() di history.js --
  // completedAt seharusnya selalu ada untuk reading tersimpan, tapi tetap
  // dijaga supaya reading lama yang field-nya kosong tidak diam-diam
  // dibuang dari perhitungan streak/tanggal.
  const raw = reading.completedAt ?? reading.createdAt ?? reading.savedAt;
  return raw ? new Date(raw) : null;
}

function tally(map, key) {
  if (!key) return;
  map.set(key, (map.get(key) ?? 0) + 1);
}

/** Entri dengan count tertinggi. Iterasi Map mengikuti urutan insersi, jadi
 *  kalau ada seri (count sama), yang PALING DULU ditemui yang menang --
 *  deterministik selama urutan listReadings() sendiri stabil (newest-first
 *  dari reading-service.js), bukan diacak. */
function topEntry(map) {
  let bestKey = null;
  let bestCount = 0;
  for (const [key, count] of map) {
    if (count > bestCount) {
      bestKey = key;
      bestCount = count;
    }
  }
  return bestKey ? { key: bestKey, count: bestCount } : null;
}

function sortedEntries(map, limit) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

function suitKeyForCard(card) {
  if (!card) return null;
  return card.arcana === "major" ? "major" : card.suit;
}

/**
 * Streak hari berturut-turut yang punya minimal 1 reading tersimpan,
 * dihitung MUNDUR dari hari ini. Kalau belum ada reading hari ini, mundur
 * dulu satu hari ke kemarin sebelum menyerah -- supaya streak tidak
 * langsung dianggap putus di tengah hari sebelum user sempat membuka app
 * (pola umum "current streak" habit tracker). Streak baru dianggap 0 kalau
 * kemarin PUN kosong.
 * @param {Set<string>} dateKeys hasil toDateKey() dari setiap reading
 */
function computeStreak(dateKeys) {
  if (!dateKeys.size) return 0;

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!dateKeys.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!dateKeys.has(toDateKey(cursor))) return 0;
  }

  let streak = 0;
  while (dateKeys.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/**
 * Fungsi murni: array reading (shape `listReadings()`) -> objek statistik.
 * Tidak menyentuh network/storage sama sekali -- lihat catatan di atas file.
 * @param {object[]} readings
 */
export function computeStatistics(readings) {
  // Dijaga eksplisit biarpun reading-service.js saat ini SELALU menyimpan
  // dengan status "completed" (lihat result.js) -- kalau suatu saat ada
  // status lain (mis. draft yang sengaja disimpan), statistik tidak boleh
  // ikut menghitungnya sebagai reading "beneran".
  const completed = (readings ?? []).filter((r) => r.status === "completed");

  const cardCounts = new Map();
  const suitCounts = new Map();
  const spreadCounts = new Map();
  const dateKeys = new Set();
  let uprightCount = 0;
  let reversedCount = 0;
  let cardsDrawn = 0;

  for (const reading of completed) {
    tally(spreadCounts, reading.spreadId);

    const date = readingDate(reading);
    if (date) dateKeys.add(toDateKey(date));

    for (const entry of reading.cards ?? []) {
      cardsDrawn += 1;
      tally(cardCounts, entry.cardId);
      tally(suitCounts, suitKeyForCard(getCardById(entry.cardId)));

      if (entry.orientation === "reversed") reversedCount += 1;
      else uprightCount += 1;
    }
  }

  const mostDrawn = topEntry(cardCounts);
  const mostDrawnCard = mostDrawn ? getCardById(mostDrawn.key) : null;

  const mostSuit = topEntry(suitCounts);
  const favoriteSpreadEntry = topEntry(spreadCounts);
  const favoriteSpread = favoriteSpreadEntry ? getSpreadById(favoriteSpreadEntry.key) : null;

  const uprightPct = cardsDrawn ? Math.round((uprightCount / cardsDrawn) * 100) : 0;
  // Reversed % dihitung dari SISA (100 - uprightPct), bukan Math.round()
  // independen -- dua pembulatan terpisah bisa berselisih dari 100% pas
  // (mis. 12.5%/87.5% dibulatkan ke arah yang beda-beda bisa jadi 13%+87%
  // atau 12%+88%, keduanya "benar" secara pembulatan tapi berbeda satu sama
  // lain kalau dihitung independen). Menjamin uprightPct + reversedPct
  // SELALU 100 saat cardsDrawn > 0.
  const reversedPct = cardsDrawn ? 100 - uprightPct : 0;

  return {
    totalReadings: completed.length,
    cardsDrawn,
    uprightCount,
    reversedCount,
    uprightPct,
    reversedPct,
    mostDrawnCard: mostDrawnCard
      ? { id: mostDrawnCard.id, name: mostDrawnCard.name, count: mostDrawn.count }
      : null,
    mostFrequentSuit: mostSuit
      ? { key: mostSuit.key, label: SUIT_LABELS[mostSuit.key] ?? mostSuit.key, count: mostSuit.count }
      : null,
    // Top 5 -- elaborasi visual dari "Most Drawn Card" (Roadmap cuma minta
    // satu angka), tapi tetap derived murni dari data yang sama, tidak
    // menambah metrik baru di luar katalog Roadmap.
    suitBreakdown: sortedEntries(suitCounts, 5).map(({ key, count }) => ({
      key,
      label: SUIT_LABELS[key] ?? key,
      count,
      pct: cardsDrawn ? Math.round((count / cardsDrawn) * 100) : 0,
    })),
    topCards: sortedEntries(cardCounts, 5).map(({ key, count }) => {
      const card = getCardById(key);
      return { id: key, name: card?.name ?? key, count };
    }),
    favoriteSpread: favoriteSpreadEntry
      ? {
          id: favoriteSpreadEntry.key,
          name: favoriteSpread?.name ?? favoriteSpreadEntry.key,
          count: favoriteSpreadEntry.count,
        }
      : null,
    readingStreak: computeStreak(dateKeys),
  };
}

/** Titik akses utama halaman Statistics: fetch (guest/cloud, lewat
 *  reading-service.js) + hitung, dalam satu panggilan. */
export async function getStatistics() {
  const readings = await listReadings();
  return computeStatistics(readings);
}
