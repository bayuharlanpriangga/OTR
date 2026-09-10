// OTR — Quiz Question Bank (Phase 21 — Quiz, Roadmap Phase 21, Master Spec §71)
//
// "Quiz should also be data-driven" (§71) — sama filosofi dengan
// data/tarot-cards.js/default-spreads.js: soal TIDAK ditulis satu-satu
// manual, tapi DIGENERATE dari data yang sudah ada (tarot-cards.js/
// tarot-keywords.js, lihat komentar "dipakai untuk search/filter/quiz
// (Phase 9, 21)" di tarot-keywords.js — slot ini memang sudah diantisipasi
// sejak Phase 2). Modul ini murni DATA (tidak ada DOM, tidak import
// js/core/state.js) — pola sama dengan data/default-spreads.js, konsisten
// dengan Core Technical Principles §2.1.
//
// Schema soal (§71 contoh persis, ditambah 1 field "topic" untuk
// pengelompokan/progress per topik — Score & Progress di Roadmap Phase 21
// dilacak PER TOPIK, bukan skor global tunggal):
//   { id, topic, question, options[], correctAnswer }
//
// Randomisasi (urutan soal yang dipilih ke satu sesi kuis, urutan option per
// soal) SENGAJA tidak dilakukan di sini — itu tanggung jawab
// js/tarot/quiz-engine.js (layer "tarot" logic, yang sudah punya
// shuffleDeck()/secureRandomInt() dari Phase 3) supaya bank soal di modul
// ini tetap deterministic & gampang dites lewat `node` (sama seperti
// tarot-cards.js/default-spreads.js: data mentah tidak pernah membawa
// randomness sendiri).

import { getCardsByArcana, getCardsBySuit } from "./tarot-cards.js";
import { CARD_KEYWORDS, KEYWORD_INDEX, SUIT_LABELS, RANK_LABELS } from "./tarot-keywords.js";

export const QUIZ_TOPICS = [
  { slug: "major-arcana", label: "Major Arcana" },
  { slug: "suits", label: "Suits" },
  { slug: "numbers", label: "Numbers" },
  { slug: "court-cards", label: "Court Cards" },
  { slug: "campuran", label: "Campuran" },
];

/**
 * count indeks yang berbeda dari correctIndex (dan satu sama lain) di
 * rentang [0, n). Deterministic (bukan acak) — lihat catatan di atas.
 * @param {number} n
 * @param {number} correctIndex
 * @param {number} count
 */
function distractorIndices(n, correctIndex, count) {
  const indices = [];
  let step = 1;
  while (indices.length < count && step < n) {
    const idx = (correctIndex + step) % n;
    if (idx !== correctIndex && !indices.includes(idx)) indices.push(idx);
    step += 1;
  }
  return indices;
}

function buildOptions(pool, correctIndex, labelFn, count = 3) {
  const correct = labelFn(pool[correctIndex]);
  const distractors = distractorIndices(pool.length, correctIndex, count).map((i) => labelFn(pool[i]));
  return { options: [correct, ...distractors], correctAnswer: correct };
}

// ---------------------------------------------------------------------
// Topic: Major Arcana
// ---------------------------------------------------------------------

function buildMajorArcanaQuestions() {
  const majors = getCardsByArcana("major"); // sudah terurut nomor 0-21
  const questions = [];

  majors.forEach((card, i) => {
    // Varian A: nomor -> nama kartu
    const byNumber = buildOptions(majors, i, (c) => c.name);
    questions.push({
      id: `quiz_major_number_${card.id}`,
      topic: "major-arcana",
      question: `Kartu Major Arcana bernomor ${card.number} adalah?`,
      options: byNumber.options,
      correctAnswer: byNumber.correctAnswer,
    });

    // Varian B: keyword unik -> nama kartu (cuma dibuat kalau kartu ini
    // punya minimal 1 keyword yang TIDAK dipakai kartu lain manapun --
    // dicek lewat KEYWORD_INDEX supaya soal tidak ambigu/punya >1 jawaban
    // benar).
    const uniqueKeyword = (CARD_KEYWORDS[card.id] ?? []).find(
      (kw) => (KEYWORD_INDEX[kw.toLowerCase()] ?? []).length === 1
    );
    if (uniqueKeyword) {
      const byKeyword = buildOptions(majors, i, (c) => c.name);
      questions.push({
        id: `quiz_major_keyword_${card.id}`,
        topic: "major-arcana",
        question: `Kartu Major Arcana mana yang paling identik dengan tema "${uniqueKeyword}"?`,
        options: byKeyword.options,
        correctAnswer: byKeyword.correctAnswer,
      });
    }
  });

  return questions;
}

// ---------------------------------------------------------------------
// Topic: Suits
// ---------------------------------------------------------------------

const SUIT_ORDER = ["wands", "cups", "swords", "pentacles"];
const SUIT_ELEMENT = { wands: "Api", cups: "Air", swords: "Udara", pentacles: "Tanah" };
const SUIT_THEME = {
  wands: "aksi, gairah, dan ambisi",
  cups: "emosi, hubungan, dan intuisi",
  swords: "pikiran, komunikasi, dan konflik",
  pentacles: "materi, pekerjaan, dan stabilitas",
};

function buildSuitsQuestions() {
  const questions = [];

  SUIT_ORDER.forEach((suit, i) => {
    const elementOpt = buildOptions(SUIT_ORDER, i, (s) => SUIT_LABELS[s]);
    questions.push({
      id: `quiz_suit_element_${suit}`,
      topic: "suits",
      question: `Suit apa yang berelemen "${SUIT_ELEMENT[suit]}"?`,
      options: elementOpt.options,
      correctAnswer: elementOpt.correctAnswer,
    });

    const themeOpt = buildOptions(SUIT_ORDER, i, (s) => SUIT_LABELS[s]);
    questions.push({
      id: `quiz_suit_theme_${suit}`,
      topic: "suits",
      question: `Suit apa yang paling identik dengan tema ${SUIT_THEME[suit]}?`,
      options: themeOpt.options,
      correctAnswer: themeOpt.correctAnswer,
    });

    // 3 contoh kartu per suit (indeks tetap: 0, 5, 10 dari 14 kartu suit
    // itu) -> "Kartu X termasuk suit apa?"
    const suitCards = getCardsBySuit(suit);
    [0, 5, 10].forEach((cardIdx) => {
      const card = suitCards[cardIdx];
      if (!card) return;
      const opt = buildOptions(SUIT_ORDER, i, (s) => SUIT_LABELS[s]);
      questions.push({
        id: `quiz_suit_card_${card.id}`,
        topic: "suits",
        question: `Kartu "${card.name}" termasuk suit apa?`,
        options: opt.options,
        correctAnswer: opt.correctAnswer,
      });
    });
  });

  return questions;
}

// ---------------------------------------------------------------------
// Topic: Numbers (Ace..10 di Minor Arcana)
// ---------------------------------------------------------------------

const RANK_ORDER = ["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const RANK_THEME = {
  ace: "awal mula & potensi mentah",
  2: "keseimbangan & pilihan antara dua hal",
  3: "pertumbuhan awal lewat kolaborasi",
  4: "stabilitas & fondasi yang mulai terbentuk",
  5: "guncangan, konflik, atau perubahan",
  6: "harmoni & keseimbangan yang baru ditemukan",
  7: "jeda untuk refleksi & evaluasi",
  8: "fokus & energi yang terkonsentrasi",
  9: "hampir sampai, tinggal selangkah lagi",
  10: "penyelesaian penuh satu siklus",
};

function buildNumbersQuestions() {
  return RANK_ORDER.map((rank, i) => {
    const opt = buildOptions(RANK_ORDER, i, (r) => RANK_LABELS[r]);
    return {
      id: `quiz_number_${rank}`,
      topic: "numbers",
      question: `Angka apa di Minor Arcana yang biasanya melambangkan "${RANK_THEME[rank]}"?`,
      options: opt.options,
      correctAnswer: opt.correctAnswer,
    };
  });
}

// ---------------------------------------------------------------------
// Topic: Court Cards
// ---------------------------------------------------------------------

const COURT_ORDER = ["page", "knight", "queen", "king"];
const COURT_THEME = {
  page: "pembelajar & pembawa pesan yang penuh rasa ingin tahu",
  knight: "pengejar — energi aktif, kadang impulsif",
  queen: "penguasaan yang mengalir dari dalam, sering bersifat mengasuh",
  king: "otoritas & kepemimpinan penuh",
};

function buildCourtCardsQuestions() {
  const questions = [];

  // Varian A: makna -> rank court (4 soal, 1 per rank).
  COURT_ORDER.forEach((rank, i) => {
    const opt = buildOptions(COURT_ORDER, i, (r) => RANK_LABELS[r]);
    questions.push({
      id: `quiz_court_theme_${rank}`,
      topic: "court-cards",
      question: `Court card apa yang paling pas digambarkan sebagai "${COURT_THEME[rank]}"?`,
      options: opt.options,
      correctAnswer: opt.correctAnswer,
    });
  });

  // Varian B: suit + rank -> nama kartu spesifik (16 soal: 4 suit x 4 rank).
  SUIT_ORDER.forEach((suit) => {
    const courtCards = COURT_ORDER.map((rank) =>
      getCardsBySuit(suit).find((c) => c.rank === rank)
    ).filter(Boolean);

    courtCards.forEach((card, i) => {
      const opt = buildOptions(courtCards, i, (c) => c.name);
      questions.push({
        id: `quiz_court_card_${card.id}`,
        topic: "court-cards",
        question: `Kartu apa yang merupakan ${RANK_LABELS[card.rank]} dari suit ${SUIT_LABELS[suit]}?`,
        options: opt.options,
        correctAnswer: opt.correctAnswer,
      });
    });
  });

  return questions;
}

// ---------------------------------------------------------------------
// Bank & lookup publik
// ---------------------------------------------------------------------

const QUESTION_BANKS = {
  "major-arcana": buildMajorArcanaQuestions(),
  suits: buildSuitsQuestions(),
  numbers: buildNumbersQuestions(),
  "court-cards": buildCourtCardsQuestions(),
};
QUESTION_BANKS.campuran = [
  ...QUESTION_BANKS["major-arcana"],
  ...QUESTION_BANKS.suits,
  ...QUESTION_BANKS.numbers,
  ...QUESTION_BANKS["court-cards"],
];

/** @returns {Array<{slug:string,label:string}>} */
export function getAllQuizTopics() {
  return QUIZ_TOPICS;
}

/** @param {string} topic slug (lihat QUIZ_TOPICS)
 *  @returns {Array<{id,topic,question,options,correctAnswer}>} */
export function getQuestionsForTopic(topic) {
  return QUESTION_BANKS[topic] ?? [];
}
