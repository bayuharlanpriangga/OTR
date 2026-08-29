// OTR — Dev-only smoke test (Phase 17 — Statistics)
// Beda dari test_phase15/16 (yang butuh jsdom karena menguji storage guest
// via localStorage): computeStatistics() di statistics-service.js sengaja
// murni (array reading -> objek angka, tanpa I/O), dan modul yang
// diimpornya (tarot/daily-card.js#toDateKey, tarot/spreads.js#getSpreadById,
// data/tarot-cards.js#getCardById) juga tidak menyentuh window/document/
// localStorage sama sekali -- jadi test ini jalan di Node polos, tidak perlu
// jsdom ataupun mock reading-service.js/Supabase.
//
// getStatistics() (wrapper yang memanggil listReadings()) TIDAK diuji di
// sini karena itu cuma 2 baris passthrough -- guest vs cloud fetch-nya
// sendiri sudah dites di scripts/test_phase14_guest_flow.mjs dkk lewat
// reading-service.js. Fokus test ini murni logika hitung.
//
// Jalankan: node scripts/test_phase17_statistics.mjs

import { computeStatistics } from "../js/services/statistics-service.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed += 1;
  } else {
    failed += 1;
    console.error(`  FAIL: ${message}`);
  }
}

function section(title) {
  console.log(`\n${title}`);
}

// ---- Helpers untuk membangun reading palsu ---------------------------

function dateKeyOffset(daysAgo) {
  const d = new Date();
  d.setHours(12, 0, 0, 0); // tengah hari, jauh dari batas tengah malam
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function reading({ id, spreadId, cards, daysAgo = 0, status = "completed" }) {
  return {
    id,
    spreadId,
    status,
    completedAt: dateKeyOffset(daysAgo),
    createdAt: dateKeyOffset(daysAgo),
    cards,
  };
}

function card(cardId, orientation = "upright") {
  return { cardId, orientation };
}

// ---- 1. Array kosong ---------------------------------------------------

section("1. Tidak ada reading sama sekali");
{
  const stats = computeStatistics([]);
  assert(stats.totalReadings === 0, "totalReadings harus 0");
  assert(stats.cardsDrawn === 0, "cardsDrawn harus 0");
  assert(stats.uprightPct === 0 && stats.reversedPct === 0, "upright/reversed % harus 0 kalau tidak ada kartu");
  assert(stats.mostDrawnCard === null, "mostDrawnCard harus null");
  assert(stats.mostFrequentSuit === null, "mostFrequentSuit harus null");
  assert(stats.favoriteSpread === null, "favoriteSpread harus null");
  assert(stats.readingStreak === 0, "readingStreak harus 0");
  assert(Array.isArray(stats.suitBreakdown) && stats.suitBreakdown.length === 0, "suitBreakdown harus array kosong");
  assert(Array.isArray(stats.topCards) && stats.topCards.length === 0, "topCards harus array kosong");
}

// ---- 2. Total Readings & Cards Drawn -----------------------------------

section("2. Total Readings & Cards Drawn");
{
  const readings = [
    reading({ id: "r1", spreadId: "quick_insight", cards: [card("major_00")] }),
    reading({
      id: "r2",
      spreadId: "past_present_future",
      cards: [card("wands_01"), card("cups_02"), card("major_10")],
    }),
  ];
  const stats = computeStatistics(readings);
  assert(stats.totalReadings === 2, `totalReadings harus 2, dapat ${stats.totalReadings}`);
  assert(stats.cardsDrawn === 4, `cardsDrawn harus 4, dapat ${stats.cardsDrawn}`);
}

// ---- 3. Reading berstatus non-"completed" tidak dihitung ---------------

section("3. Reading non-completed dikecualikan");
{
  const readings = [
    reading({ id: "r1", spreadId: "quick_insight", cards: [card("major_00")] }),
    reading({ id: "r2", spreadId: "quick_insight", cards: [card("major_01")], status: "draft" }),
  ];
  const stats = computeStatistics(readings);
  assert(stats.totalReadings === 1, `reading status "draft" seharusnya tidak dihitung, dapat totalReadings=${stats.totalReadings}`);
  assert(stats.cardsDrawn === 1, `kartu dari reading draft seharusnya tidak ikut cardsDrawn, dapat ${stats.cardsDrawn}`);
}

// ---- 4. Upright % / Reversed % selalu total 100 ------------------------

section("4. Upright/Reversed % (termasuk kasus pembulatan ganjil)");
{
  const readings = [
    reading({
      id: "r1",
      spreadId: "past_present_future",
      cards: [card("major_00", "upright"), card("major_01", "reversed"), card("major_02", "reversed")],
    }),
  ];
  const stats = computeStatistics(readings);
  assert(stats.uprightCount === 1 && stats.reversedCount === 2, "uprightCount=1, reversedCount=2");
  assert(stats.uprightPct + stats.reversedPct === 100, `upright%+reversed% harus 100, dapat ${stats.uprightPct}+${stats.reversedPct}`);
  assert(stats.uprightPct === 33, `uprightPct harus dibulatkan ke 33, dapat ${stats.uprightPct}`);
  assert(stats.reversedPct === 67, `reversedPct harus 100-33=67 (komplemen), dapat ${stats.reversedPct}`);
}

// ---- 5. Most Drawn Card + tie-break ke yang lebih dulu muncul ----------

section("5. Most Drawn Card & tie-break");
{
  const readings = [
    reading({ id: "r1", spreadId: "quick_insight", cards: [card("major_00")] }),
    reading({ id: "r2", spreadId: "quick_insight", cards: [card("major_01")] }),
    reading({ id: "r3", spreadId: "quick_insight", cards: [card("major_00")] }),
  ];
  const stats = computeStatistics(readings);
  assert(stats.mostDrawnCard?.id === "major_00", `mostDrawnCard harus major_00 (2x), dapat ${stats.mostDrawnCard?.id}`);
  assert(stats.mostDrawnCard?.count === 2, `count harus 2, dapat ${stats.mostDrawnCard?.count}`);
  assert(stats.mostDrawnCard?.name === "The Fool", `nama harus resolve dari data kartu, dapat "${stats.mostDrawnCard?.name}"`);

  const tieReadings = [
    reading({ id: "r1", spreadId: "quick_insight", cards: [card("major_05")] }),
    reading({ id: "r2", spreadId: "quick_insight", cards: [card("major_06")] }),
  ];
  const tieStats = computeStatistics(tieReadings);
  assert(tieStats.mostDrawnCard?.id === "major_05", `tie-break harus menang ke yang duluan muncul (major_05), dapat ${tieStats.mostDrawnCard?.id}`);
}

// ---- 6. Most Frequent Suit (termasuk Major Arcana sebagai kategori) ----

section("6. Most Frequent Suit termasuk kategori Major Arcana");
{
  const readings = [
    reading({
      id: "r1",
      spreadId: "past_present_future",
      cards: [card("wands_01"), card("wands_02"), card("cups_01")],
    }),
  ];
  const stats = computeStatistics(readings);
  assert(stats.mostFrequentSuit?.key === "wands", `mostFrequentSuit harus wands, dapat ${stats.mostFrequentSuit?.key}`);
  assert(stats.mostFrequentSuit?.label === "Wands", `label harus "Wands", dapat "${stats.mostFrequentSuit?.label}"`);
  assert(stats.mostFrequentSuit?.count === 2, `count harus 2, dapat ${stats.mostFrequentSuit?.count}`);

  const majorReadings = [
    reading({ id: "r1", spreadId: "quick_insight", cards: [card("major_00")] }),
    reading({ id: "r2", spreadId: "quick_insight", cards: [card("major_01")] }),
    reading({ id: "r3", spreadId: "quick_insight", cards: [card("wands_01")] }),
  ];
  const majorStats = computeStatistics(majorReadings);
  assert(
    majorStats.mostFrequentSuit?.key === "major" && majorStats.mostFrequentSuit?.label === "Major Arcana",
    `Major Arcana harus dihitung sebagai kategori suit tersendiri, dapat key=${majorStats.mostFrequentSuit?.key}`
  );
}

// ---- 7. Favorite Spread --------------------------------------------------

section("7. Favorite Spread");
{
  const readings = [
    reading({ id: "r1", spreadId: "single_advice", cards: [card("major_00")] }),
    reading({ id: "r2", spreadId: "past_present_future", cards: [card("major_01")] }),
    reading({ id: "r3", spreadId: "past_present_future", cards: [card("major_02")] }),
  ];
  const stats = computeStatistics(readings);
  assert(stats.favoriteSpread?.id === "past_present_future", `favoriteSpread harus past_present_future, dapat ${stats.favoriteSpread?.id}`);
  assert(stats.favoriteSpread?.count === 2, `count harus 2, dapat ${stats.favoriteSpread?.count}`);
  assert(stats.favoriteSpread?.name === "Past / Present / Future", `nama harus resolve dari data spread, dapat "${stats.favoriteSpread?.name}"`);
}

// ---- 8. Reading Streak: berturut-turut, ada jeda hari ini, dan putus ----

section("8. Reading Streak");
{
  const consecutive = [
    reading({ id: "r1", spreadId: "quick_insight", cards: [card("major_00")], daysAgo: 0 }),
    reading({ id: "r2", spreadId: "quick_insight", cards: [card("major_00")], daysAgo: 1 }),
    reading({ id: "r3", spreadId: "quick_insight", cards: [card("major_00")], daysAgo: 2 }),
  ];
  assert(computeStatistics(consecutive).readingStreak === 3, `streak berturut-turut 3 hari harus 3, dapat ${computeStatistics(consecutive).readingStreak}`);

  const notYetToday = [
    reading({ id: "r1", spreadId: "quick_insight", cards: [card("major_00")], daysAgo: 1 }),
    reading({ id: "r2", spreadId: "quick_insight", cards: [card("major_00")], daysAgo: 2 }),
  ];
  assert(computeStatistics(notYetToday).readingStreak === 2, `streak "belum reading hari ini tapi kemarin ada" harus tetap 2, dapat ${computeStatistics(notYetToday).readingStreak}`);

  const broken = [reading({ id: "r1", spreadId: "quick_insight", cards: [card("major_00")], daysAgo: 2 })];
  assert(computeStatistics(broken).readingStreak === 0, `streak dengan jeda 2 hari harus putus (0), dapat ${computeStatistics(broken).readingStreak}`);

  const sameDayTwice = [
    reading({ id: "r1", spreadId: "quick_insight", cards: [card("major_00")], daysAgo: 0 }),
    reading({ id: "r2", spreadId: "quick_insight", cards: [card("major_01")], daysAgo: 0 }),
  ];
  assert(computeStatistics(sameDayTwice).readingStreak === 1, `2 reading di hari sama harus tetap streak 1, dapat ${computeStatistics(sameDayTwice).readingStreak}`);
}

// ---- 9. suitBreakdown & topCards diurutkan menurun, dibatasi 5 ---------

section("9. suitBreakdown & topCards terurut & dibatasi 5");
{
  const readings = [
    reading({
      id: "r1",
      spreadId: "quick_insight",
      cards: [
        card("major_00"),
        card("major_00"),
        card("major_00"),
        card("wands_01"),
        card("wands_01"),
        card("cups_01"),
      ],
    }),
  ];
  const stats = computeStatistics(readings);
  assert(stats.topCards[0].id === "major_00" && stats.topCards[0].count === 3, "topCards[0] harus major_00 count 3");
  assert(stats.topCards[1].id === "wands_01" && stats.topCards[1].count === 2, "topCards[1] harus wands_01 count 2");
  const pcts = stats.suitBreakdown.map((s) => s.pct);
  const isDescending = pcts.every((v, i) => i === 0 || pcts[i - 1] >= v);
  assert(isDescending, `suitBreakdown harus terurut menurun berdasarkan count, dapat ${JSON.stringify(pcts)}`);
}

// ---- Ringkasan ------------------------------------------------------------

console.log(`\n${passed}/${passed + failed} assertion lulus.`);
if (failed > 0) {
  console.error(`${failed} assertion GAGAL.`);
  process.exit(1);
}
