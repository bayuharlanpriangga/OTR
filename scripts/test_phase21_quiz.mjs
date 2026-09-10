// OTR — Dev-only smoke test (Phase 21 — Quiz)
// Empat lapis, sama pola dengan test script fase-fase sebelumnya:
//   1. data/quiz-questions.js -- integritas bank soal (data murni, node saja).
//   2. js/tarot/quiz-engine.js -- logic sesi kuis murni (node saja, tanpa DOM).
//   3. js/core/storage.js + js/services/quiz-service.js -- jalur GUEST
//      (localStorage, tanpa state.user) untuk record/list progress.
//      TIDAK menguji jalur cloud (tabel quiz_progress Supabase asli) --
//      sama pola dengan Phase 14-20, itu tetap scope smoke test manual di
//      browser (lihat PROJECT_STATUS.md).
//   4. js/pages/quiz.js -- render(container, params) lewat jsdom, simulasi
//      klik penuh: pilih topik -> jawab semua soal -> lihat hasil.
//
// Jalankan: node scripts/test_phase21_quiz.mjs

import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body><div id='app'></div><div id='toast-outlet'></div></body></html>", {
  url: "http://localhost/",
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let failures = 0;
function assert(cond, msg) {
  if (!cond) {
    failures++;
    console.error(`✗ ${msg}`);
  } else {
    console.log(`✓ ${msg}`);
  }
}

function section(title) {
  console.log(`\n${title}`);
}

async function main() {
  // ---- 1. data/quiz-questions.js -- integritas bank soal ----
  section("1. data/quiz-questions.js");
  const questionsMod = await import("../data/quiz-questions.js");
  const topics = questionsMod.getAllQuizTopics();
  assert(topics.length === 5, "getAllQuizTopics() mengembalikan 5 topik (4 spesifik + campuran)");

  let totalQuestions = 0;
  for (const t of topics) {
    const qs = questionsMod.getQuestionsForTopic(t.slug);
    totalQuestions += qs.length;
    assert(qs.length > 0, `topik "${t.slug}" punya minimal 1 soal (${qs.length})`);

    const ids = new Set();
    let dupId = false;
    let dupOption = false;
    let missingCorrect = false;
    let badOptionCount = false;
    for (const q of qs) {
      if (ids.has(q.id)) dupId = true;
      ids.add(q.id);
      if (new Set(q.options).size !== q.options.length) dupOption = true;
      if (!q.options.includes(q.correctAnswer)) missingCorrect = true;
      if (q.options.length !== 4) badOptionCount = true;
    }
    assert(!dupId, `topik "${t.slug}" tidak punya id soal duplikat`);
    assert(!dupOption, `topik "${t.slug}" tidak punya soal dengan opsi duplikat`);
    assert(!missingCorrect, `topik "${t.slug}" -- correctAnswer selalu ada di antara options`);
    assert(!badOptionCount, `topik "${t.slug}" -- semua soal punya tepat 4 opsi`);
  }
  assert(
    questionsMod.getQuestionsForTopic("campuran").length ===
      topics.filter((t) => t.slug !== "campuran").reduce((sum, t) => sum + questionsMod.getQuestionsForTopic(t.slug).length, 0),
    "topik campuran = gabungan persis semua topik spesifik (tidak ada yang hilang/dobel)"
  );
  assert(questionsMod.getQuestionsForTopic("tidak-ada").length === 0, "topik tidak dikenal mengembalikan array kosong");

  // ---- 2. js/tarot/quiz-engine.js -- logic murni ----
  section("2. js/tarot/quiz-engine.js");
  const { createQuizSession } = await import("../js/tarot/quiz-engine.js");

  assert(
    (() => {
      try {
        createQuizSession({ topic: "tidak-ada-topik-ini" });
        return false;
      } catch {
        return true;
      }
    })(),
    "createQuizSession() throw untuk topik yang tidak dikenal"
  );

  const perfectSession = createQuizSession({ topic: "numbers", size: 5 });
  assert(perfectSession.total === 5, "sesi 'numbers' size:5 punya 5 soal (pool numbers = 10)");
  assert(perfectSession.status === "in_progress", "status awal sesi = in_progress");

  let guard = 0;
  while (!perfectSession.isComplete() && guard < 10) {
    guard += 1;
    const q = perfectSession.currentQuestion();
    perfectSession.answer(q.correctAnswer);
  }
  assert(perfectSession.isComplete(), "sesi selesai setelah semua soal dijawab");
  assert(perfectSession.score === 5, "skor sempurna kalau semua jawaban benar (5/5)");
  const perfectSummary = perfectSession.getSummary();
  assert(perfectSummary.percent === 100, "getSummary().percent = 100 untuk skor sempurna");
  assert(perfectSummary.bestStreak === 5, "bestStreak = 5 kalau semua jawaban benar berturutan");
  assert(perfectSummary.answers.length === 5, "getSummary().answers mencatat 5 entri jawaban");
  assert(
    (() => {
      try {
        perfectSession.answer("apa saja");
        return false;
      } catch {
        return true;
      }
    })(),
    "answer() throw kalau dipanggil setelah sesi selesai"
  );

  const wrongSession = createQuizSession({ topic: "numbers", size: 4 });
  let wrongGuard = 0;
  while (!wrongSession.isComplete() && wrongGuard < 10) {
    wrongGuard += 1;
    const q = wrongSession.currentQuestion();
    const wrongOption = q.options.find((o) => o !== q.correctAnswer);
    wrongSession.answer(wrongOption);
  }
  assert(wrongSession.score === 0, "skor 0 kalau semua jawaban salah");
  assert(wrongSession.getSummary().bestStreak === 0, "bestStreak = 0 kalau tidak pernah benar berturutan");

  const streakSession = createQuizSession({ topic: "campuran", size: 6 });
  const streakPattern = [true, true, false, true, true, true];
  streakPattern.forEach((shouldBeCorrect) => {
    const q = streakSession.currentQuestion();
    const option = shouldBeCorrect ? q.correctAnswer : q.options.find((o) => o !== q.correctAnswer);
    streakSession.answer(option);
  });
  assert(streakSession.getSummary().bestStreak === 3, "bestStreak mengenali 3 jawaban benar berturutan meski diselingi 1 salah");

  // ---- 3. js/core/storage.js + js/services/quiz-service.js -- jalur GUEST ----
  section("3. storage.js + quiz-service.js (guest)");
  const storage = await import("../js/core/storage.js");
  assert(storage.listGuestQuizProgress().length === 0, "listGuestQuizProgress() kosong sebelum ada sesi apa pun");

  const quizService = await import("../js/services/quiz-service.js");

  const firstAttempt = await quizService.recordQuizResult({ topic: "numbers", score: 6, total: 8 });
  assert(firstAttempt.bestScore === 6 && firstAttempt.attempts === 1, "attempt pertama jadi best score & attempts=1");

  const worseAttempt = await quizService.recordQuizResult({ topic: "numbers", score: 3, total: 8 });
  assert(worseAttempt.bestScore === 6 && worseAttempt.attempts === 2, "attempt lebih rendah TIDAK menimpa best score, tapi attempts bertambah");

  const betterAttempt = await quizService.recordQuizResult({ topic: "numbers", score: 8, total: 8 });
  assert(betterAttempt.bestScore === 8 && betterAttempt.attempts === 3, "attempt lebih tinggi MENIMPA best score");

  const topicProgress = await quizService.getQuizProgressForTopic("numbers");
  assert(topicProgress.bestScore === 8, "getQuizProgressForTopic() mengembalikan best score terkini");
  assert((await quizService.getQuizProgressForTopic("suits")) === null, "getQuizProgressForTopic() untuk topik yang belum pernah dimainkan = null");

  await quizService.recordQuizResult({ topic: "suits", score: 4, total: 8 });
  const allProgress = await quizService.listQuizProgress();
  assert(allProgress.length === 2, "listQuizProgress() mencatat 2 topik yang sudah pernah dimainkan (numbers, suits)");

  // ---- 4. js/pages/quiz.js -- render lewat jsdom, simulasi klik penuh ----
  section("4. js/pages/quiz.js (jsdom)");
  const quizPage = (await import("../js/pages/quiz.js")).default;

  function freshContainer() {
    document.body.querySelectorAll("[data-test-container]").forEach((el) => el.remove());
    const el = document.createElement("div");
    el.setAttribute("data-test-container", "1");
    document.body.appendChild(el);
    return el;
  }

  // 4a. Topic picker (/quiz polos)
  const topicContainer = freshContainer();
  await quizPage.render(topicContainer, {});
  const topicButtons = topicContainer.querySelectorAll("[data-topic]");
  assert(topicButtons.length === 5, "halaman topik menampilkan 5 tombol topik");
  assert(
    topicContainer.innerHTML.includes("Terbaik: 8/8") && topicContainer.innerHTML.includes("Terbaik: 4/8"),
    "badge skor terbaik dari section 3 muncul di kartu topik yang relevan (numbers, suits)"
  );

  // 4b. Sesi kuis penuh untuk topik yang BELUM pernah dimainkan ("court-cards")
  const quizContainer = freshContainer();
  await quizPage.render(quizContainer, { topic: "court-cards" });
  assert(quizContainer.querySelectorAll("[data-option]").length === 4, "halaman kuis menampilkan 4 tombol opsi untuk soal pertama");
  assert(quizContainer.querySelector("[data-quiz-next]") === null, "tombol next belum muncul sebelum soal dijawab");

  let questionsAnswered = 0;
  let sawIncorrectFeedback = false;
  while (quizContainer.querySelector("[data-option]")) {
    questionsAnswered += 1;
    const options = [...quizContainer.querySelectorAll("[data-option]")];
    // Jawab opsi PERTAMA setiap kali (campuran benar/salah tergantung urutan
    // acak) -- cukup untuk menguji kedua state feedback tanpa perlu tahu
    // jawaban benar dari luar quiz-engine.js.
    options[0].dispatchEvent(new dom.window.Event("click", { bubbles: true }));

    const feedbackButtons = quizContainer.querySelectorAll("[data-option][disabled]");
    assert(feedbackButtons.length === 4, `soal ke-${questionsAnswered}: semua opsi disabled setelah dijawab`);
    if (quizContainer.querySelector(".quiz-option--incorrect")) sawIncorrectFeedback = true;
    assert(quizContainer.querySelectorAll(".quiz-option--correct").length >= 1, `soal ke-${questionsAnswered}: jawaban benar selalu ditandai`);

    const nextBtn = quizContainer.querySelector("[data-quiz-next]");
    assert(nextBtn !== null, `soal ke-${questionsAnswered}: tombol next/lihat-hasil muncul setelah dijawab`);
    nextBtn.dispatchEvent(new dom.window.Event("click", { bubbles: true }));
    // Beri kesempatan microtask (renderResultView() di quiz.js bersifat
    // async karena memanggil recordQuizResult()) untuk selesai sebelum
    // membaca DOM lagi.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  assert(questionsAnswered === 8, `sesi kuis 8 soal (QUIZ_SIZE) selesai dijawab semua (${questionsAnswered})`);
  assert(sawIncorrectFeedback, "minimal 1 soal dijawab salah selama sesi (opsi pertama tidak selalu jawaban benar)");

  assert(quizContainer.querySelector("[data-quiz-retry]") !== null, "halaman hasil menampilkan tombol Main Lagi");
  assert(/\d+\/8/.test(quizContainer.textContent), "halaman hasil menampilkan skor dalam format X/8");

  const courtProgress = await quizService.getQuizProgressForTopic("court-cards");
  assert(courtProgress !== null, "hasil sesi court-cards baru saja tersimpan lewat recordQuizResult()");
  assert(courtProgress.attempts === 1, "attempts=1 untuk topik yang baru pertama kali dimainkan lewat halaman");

  // 4c. Main Lagi -- sesi baru tanpa reload/route change
  const retryBtn = quizContainer.querySelector("[data-quiz-retry]");
  retryBtn.dispatchEvent(new dom.window.Event("click", { bubbles: true }));
  assert(quizContainer.querySelectorAll("[data-option]").length === 4, "klik 'Main Lagi' langsung memulai sesi baru (4 opsi soal pertama tampil lagi)");

  // ---- Ringkasan ----
  section("Ringkasan");
  if (failures === 0) {
    console.log("\nSemua assertion lulus.");
    process.exit(0);
  } else {
    console.error(`\n${failures} assertion GAGAL.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
