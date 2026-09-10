// OTR — Page: Quiz (Phase 21 — Quiz, Roadmap Phase 21, Master Spec §71)
//
// DONE WHEN Roadmap: Question, Options, Answer, Score, Progress (WAJIB) +
// Streak (Optional, gamifikasi "subtle" — tidak ada XP/Achievements,
// lihat catatan js/tarot/quiz-engine.js).
//
// Flow ada 3 "view" yang dikelola MURNI di dalam satu render() (pola sama
// dengan js/pages/reading.js — multi-step tanpa ganti route per step):
//   topics -> quiz (per soal, re-render lokal, TIDAK lewat navigate()) -> result
// Route /quiz/:topic dipakai supaya sesi kuis bisa di-refresh/di-share ke
// topik yang sama (sesi barunya sendiri tetap acak ulang, lihat
// quiz-engine.js), sedangkan /quiz polos = pemilihan topik.
//
// Progress (fitur WAJIB) dicatat SEKALI di akhir sesi lewat
// recordQuizResult() (quiz-service.js) -- bukan per-jawaban, supaya guest
// tidak menulis localStorage 8x per sesi dan user login tidak melakukan 8x
// network call per sesi (sama filosofi trade-off dengan daily-service.js).

import { getAllQuizTopics } from "../../data/quiz-questions.js";
import { createQuizSession } from "../tarot/quiz-engine.js";
import { recordQuizResult, listQuizProgress } from "../services/quiz-service.js";
import { navigate } from "../router.js";
import { showToast } from "../components/toast.js";
import { icon } from "../components/icons.js";

const QUIZ_SIZE = 8;

function escapeHTML(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---- Topic picker view -----------------------------------------------

function topicCardHTML(topic, progress) {
  const best = progress?.bestScore != null ? `${progress.bestScore}/${progress.bestTotal}` : null;
  return `
    <button type="button" class="card card--interactive stack gap-2 quiz-topic-card" data-topic="${topic.slug}" style="text-align:left;">
      <div class="row gap-3" style="justify-content:space-between; align-items:baseline;">
        <h3>${escapeHTML(topic.label)}</h3>
        ${best ? `<span class="badge">Terbaik: ${best}</span>` : ""}
      </div>
      <p class="text-sm text-muted">${best ? "Main lagi untuk memecahkan skor terbaikmu." : "Belum pernah dicoba — mulai sekarang."}</p>
    </button>
  `;
}

function topicsTemplate(topics, progressByTopic) {
  return `
    <section class="stack gap-5">
      <div>
        <p class="eyebrow">Quiz</p>
        <h1 class="font-display">Uji Pemahamanmu</h1>
        <p class="text-sm text-muted" style="margin-top:var(--space-2);">Pilih topik, jawab ${QUIZ_SIZE} soal, lihat skormu.</p>
      </div>
      <div class="grid-cards" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));">
        ${topics.map((t) => topicCardHTML(t, progressByTopic[t.slug])).join("")}
      </div>
    </section>
  `;
}

// ---- Quiz session view -------------------------------------------------

function optionButtonHTML(optionText, state, disabled) {
  // state: null (belum dijawab) | "correct" | "incorrect" -- "correct"
  // dipakai baik untuk opsi yang dipilih user (kalau benar) MAUPUN untuk
  // menandai jawaban benar setelah user salah pilih opsi lain (lihat
  // feedbackStateFor).
  const modifier = state ? ` quiz-option--${state}` : "";
  return `<button type="button" class="btn btn--secondary quiz-option${modifier}" data-option="${escapeHTML(optionText)}"${disabled ? " disabled" : ""}>${escapeHTML(optionText)}</button>`;
}

function progressBarHTML(questionNumber, total, pct) {
  return `
    <div class="stat-bar-row">
      <div class="stat-bar-row__label">
        <span>Soal ${questionNumber}/${total}</span>
        <span class="text-muted font-mono">Skor ${pct}%</span>
      </div>
      <div class="stat-bar-track">
        <div class="stat-bar-fill" style="width:${pct}%;"></div>
      </div>
    </div>
  `;
}

function quizTemplate(topicLabel, question, session, feedback) {
  const progress = session.getProgress();
  // Soal yang lagi DITAMPILKAN (bukan index internal session, yang sudah
  // maju duluan begitu answer() dipanggil -- lihat catatan answeredQuestion
  // di render()). Belum dijawab -> index+1 (soal yang akan dijawab). Sudah
  // dijawab (feedback ada) -> index (soal yang baru saja dijawab, karena
  // index sudah maju 1).
  const questionNumber = feedback ? progress.index : progress.index + 1;
  const pct = progress.total ? Math.round((questionNumber / progress.total) * 100) : 0;
  // Subtle streak — cuma dimunculkan begitu >=3 supaya tidak berisik di
  // tiap soal (Roadmap: "Keep gamification subtle").
  const streakHTML =
    session.streak >= 3
      ? `<span class="badge" style="color:var(--otr-gold);">${icon("sparkle", { size: 12 })} ${session.streak} beruntun</span>`
      : "";

  return `
    <section class="stack gap-5">
      <div class="row gap-3" style="justify-content:space-between; align-items:baseline; flex-wrap:wrap;">
        <div>
          <p class="eyebrow">Quiz — ${escapeHTML(topicLabel)}</p>
          <h1 class="font-display" style="font-size:var(--fs-xl);">Skor: ${session.score}</h1>
        </div>
        ${streakHTML}
      </div>

      ${progressBarHTML(questionNumber, progress.total, pct)}

      <div class="card stack gap-4" data-quiz-question>
        <p class="text-md">${escapeHTML(question.question)}</p>
        <div class="stack gap-2">
          ${question.options.map((opt) => optionButtonHTML(opt, feedback ? feedbackStateFor(opt, feedback) : null, Boolean(feedback))).join("")}
        </div>
      </div>

      ${
        feedback
          ? `<div class="row gap-3" style="justify-content:flex-end;">
               <button type="button" class="btn btn--primary" data-quiz-next>${session.isComplete() ? "Lihat Hasil" : "Soal Berikutnya"}</button>
             </div>`
          : ""
      }

      <a class="text-sm text-muted" href="#/quiz" data-quiz-exit>Keluar dari kuis</a>
    </section>
  `;
}

function feedbackStateFor(optionText, feedback) {
  if (optionText === feedback.correctAnswer) return "correct";
  if (optionText === feedback.selected && !feedback.correct) return "incorrect";
  return null;
}

// ---- Result view ---------------------------------------------------------

function resultTemplate(topicLabel, summary, best) {
  const isNewBest = best && summary.score >= best.bestScore;
  return `
    <section class="stack gap-5">
      <div class="card weave stack gap-3" style="text-align:center; padding:var(--space-8) var(--space-5);">
        <p class="eyebrow">Quiz — ${escapeHTML(topicLabel)} selesai</p>
        <h1 class="font-display">${summary.score}/${summary.total}</h1>
        <p class="text-sm text-muted">${summary.percent}% jawaban benar${summary.bestStreak >= 3 ? ` &middot; ${summary.bestStreak} beruntun terbaik` : ""}</p>
        ${isNewBest ? `<span class="badge" style="align-self:center; color:var(--otr-gold);">Skor terbaik baru</span>` : ""}
      </div>
      <div class="row gap-3" style="flex-wrap:wrap;">
        <button type="button" class="btn btn--primary" data-quiz-retry>Main Lagi</button>
        <a class="btn btn--secondary" href="#/quiz">Ganti Topik</a>
        <a class="btn btn--ghost" href="#/learn">Kembali ke Learn</a>
      </div>
    </section>
  `;
}

// ---- Controller ------------------------------------------------------

export default {
  async render(container, params) {
    const topics = getAllQuizTopics();
    const requestedTopic = topics.find((t) => t.slug === params?.topic);

    // /quiz polos (atau slug topik tidak dikenal) -> tampilkan pemilihan
    // topik dulu.
    if (!requestedTopic) {
      container.innerHTML = `<div class="row" style="justify-content:center; padding:var(--space-8) 0;"><span class="spinner" aria-label="Memuat"></span></div>`;
      let progressList = [];
      try {
        progressList = await listQuizProgress();
      } catch (err) {
        console.error("[quiz] gagal memuat progres", err);
        // Bukan fatal -- tampilan topik tetap jalan tanpa badge skor terbaik.
      }
      const progressByTopic = Object.fromEntries(progressList.map((p) => [p.topic, p]));

      container.innerHTML = topicsTemplate(topics, progressByTopic);
      container.querySelectorAll("[data-topic]").forEach((btn) => {
        btn.addEventListener("click", () => navigate(`/quiz/${btn.dataset.topic}`));
      });
      return;
    }

    // Sesi kuis untuk topik ini. `session` & `feedback` hidup di closure
    // render() ini -- re-render soal-ke-soal MURNI lokal (tidak lewat
    // navigate()/router), supaya sesi tidak reset tiap ganti soal.
    let session;
    let feedback = null; // hasil answer() untuk soal SAAT INI, null = belum dijawab
    // quiz-engine.js#answer() memajukan index SEKETIKA (lihat komentar di
    // sana) -- session.currentQuestion() setelah answer() sudah menunjuk ke
    // soal BERIKUTNYA, bukan yang baru saja dijawab. Soal yang feedback-nya
    // sedang ditampilkan harus disimpan terpisah di sini, ditangkap SEBELUM
    // answer() dipanggil.
    let answeredQuestion = null;

    function startNewSession() {
      try {
        session = createQuizSession({ topic: requestedTopic.slug, size: QUIZ_SIZE });
      } catch (err) {
        console.error("[quiz] gagal membuat sesi kuis", err);
        showToast("Gagal memulai kuis untuk topik ini.", "danger");
        navigate("/quiz");
        return false;
      }
      feedback = null;
      answeredQuestion = null;
      return true;
    }

    if (!startNewSession()) return;

    function renderQuestionView() {
      const question = feedback ? answeredQuestion : session.currentQuestion();
      container.innerHTML = quizTemplate(requestedTopic.label, question, session, feedback);
      wireQuestionView(question);
    }

    function wireQuestionView(question) {
      if (!feedback) {
        container.querySelectorAll("[data-option]").forEach((btn) => {
          btn.addEventListener("click", () => {
            answeredQuestion = question;
            feedback = session.answer(btn.dataset.option);
            renderQuestionView();
          });
        });
      }

      container.querySelector("[data-quiz-next]")?.addEventListener("click", () => {
        feedback = null;
        if (session.isComplete()) {
          renderResultView();
        } else {
          renderQuestionView();
        }
      });

      container.querySelector("[data-quiz-exit]")?.addEventListener("click", (e) => {
        e.preventDefault();
        navigate("/quiz");
      });
    }

    async function renderResultView() {
      const summary = session.getSummary();
      let best = null;
      try {
        best = await recordQuizResult({ topic: requestedTopic.slug, score: summary.score, total: summary.total });
      } catch (err) {
        console.error("[quiz] gagal menyimpan progres kuis", err);
        showToast("Skor tidak tersimpan (gagal menyimpan progres).", "danger");
      }

      container.innerHTML = resultTemplate(requestedTopic.label, summary, best);
      container.querySelector("[data-quiz-retry]")?.addEventListener("click", () => {
        // Sesi baru (soal/option teracak ulang) TANPA lewat router --
        // hash tetap /quiz/:topic, cuma closure session-nya diganti.
        if (startNewSession()) renderQuestionView();
      });
    }

    renderQuestionView();
  },
};
