// OTR — Quiz Engine (Phase 21 — Quiz, Roadmap Phase 21, Master Spec §71)
// Logic murni kuis — TIDAK menyentuh DOM, TIDAK import js/core/state.js/
// event-bus.js. Pola sama persis dengan js/tarot/tarot-engine.js (Phase 3):
// bisa dites langsung lewat `node`, dipakai js/pages/quiz.js dengan
// menghubungkan hasilnya ke DOM di layer atasnya.
//
// Fitur WAJIB Roadmap Phase 21 dipetakan ke API di bawah:
//   Question / Options / Answer -> currentQuestion(), answer(selected)
//   Score                       -> .score (getter)
//   Progress                    -> getProgress()
// Optional (gamifikasi, "keep it subtle" per Roadmap): Streak dilacak
// (.streak / bestStreak di getSummary()) TAPI tidak ada XP/Achievements --
// dua hal itu sengaja tidak dibangun supaya gamifikasi tidak berlebihan
// (persis instruksi Roadmap), bukan kelalaian.

import { getQuestionsForTopic } from "../../data/quiz-questions.js";
import { shuffleDeck } from "./shuffle.js";

const STATUS = /** @type {const} */ ({
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
});

/**
 * @param {object} options
 * @param {string} options.topic slug topik (lihat data/quiz-questions.js QUIZ_TOPICS)
 * @param {number} [options.size] jumlah soal per sesi, dibatasi ukuran bank soal topik itu
 */
export function createQuizSession({ topic, size = 8 } = {}) {
  const pool = getQuestionsForTopic(topic);
  if (!pool.length) {
    throw new Error(`Topik kuis tidak dikenal atau tidak punya soal: "${topic}"`);
  }

  // Pilih subset soal (acak, Fisher-Yates dari Phase 3) lalu acak urutan
  // OPTION per soal juga -- correctAnswer dibandingkan by value (string),
  // jadi urutan option boleh diacak tanpa mengubah jawaban benar.
  const questions = shuffleDeck(pool)
    .slice(0, Math.min(size, pool.length))
    .map((q) => ({ ...q, options: shuffleDeck(q.options) }));

  let index = 0;
  let score = 0;
  let streak = 0;
  let bestStreak = 0;
  let status = STATUS.IN_PROGRESS;
  const answers = [];

  function currentQuestion() {
    return status === STATUS.IN_PROGRESS ? questions[index] ?? null : null;
  }

  function getProgress() {
    return {
      // "index" = jumlah soal yang SUDAH dijawab (0..total). Dipakai UI
      // buat progress bar "Soal {index+1}/{total}" saat masih berjalan,
      // atau "{total}/{total}" begitu selesai.
      index,
      total: questions.length,
      percent: questions.length ? Math.round((index / questions.length) * 100) : 0,
    };
  }

  /**
   * @param {string} selectedOption harus salah satu string di
   *   currentQuestion().options
   * @returns {{correct:boolean, selected:string, correctAnswer:string, score:number, streak:number}}
   */
  function answer(selectedOption) {
    if (status !== STATUS.IN_PROGRESS) {
      throw new Error("Kuis sudah selesai — tidak bisa menjawab lagi.");
    }
    const q = questions[index];
    if (!q) throw new Error("Tidak ada soal aktif untuk dijawab.");

    const isCorrect = selectedOption === q.correctAnswer;
    if (isCorrect) {
      score += 1;
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 0;
    }
    answers.push({ questionId: q.id, selected: selectedOption, correct: isCorrect });

    index += 1;
    if (index >= questions.length) status = STATUS.COMPLETED;

    return { correct: isCorrect, selected: selectedOption, correctAnswer: q.correctAnswer, score, streak };
  }

  function isComplete() {
    return status === STATUS.COMPLETED;
  }

  function getSummary() {
    return {
      topic,
      total: questions.length,
      score,
      bestStreak,
      percent: questions.length ? Math.round((score / questions.length) * 100) : 0,
      answers: [...answers],
    };
  }

  return {
    get status() {
      return status;
    },
    get score() {
      return score;
    },
    get streak() {
      return streak;
    },
    get total() {
      return questions.length;
    },
    currentQuestion,
    answer,
    isComplete,
    getProgress,
    getSummary,
  };
}
