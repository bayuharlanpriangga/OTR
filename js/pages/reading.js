// OTR — Page: Reading (Phase 5 — Reading MVP)
// Menyambungkan js/tarot/tarot-engine.js (Phase 3) + js/components/tarot-card.js
// (Phase 4) jadi flow reading nyata: Pilih Jenis → Pilih Spread → Pertanyaan →
// Kocok → (Tarik → Reveal → Interpretasi) berulang per kartu → Result.
//
// Halaman ini yang jadi "lem" antara engine (tanpa DOM) dan komponen kartu
// (tanpa TarotEngine) — sesuai pemisahan yang sudah didokumentasikan di
// PROJECT_STATUS.md § Important Decisions.
//
// Reading MVP ini mendukung One Card & Three Card dulu (Roadmap Phase 5).
// Five Card (Career Path, Love Reading) menyusul di fase berikutnya yang
// menyempurnakan Reading experience — spread-nya sudah ada di katalog data,
// tapi belum dimunculkan sebagai opsi di sini supaya scope Phase 5 tetap
// sesuai roadmap.

import { createTarotEngine } from "../tarot/tarot-engine.js";
import { getAllSpreads } from "../tarot/spreads.js";
import { interpretCard, synthesizeReading } from "../tarot/interpretation.js";
import { renderTarotCard } from "../components/tarot-card.js";
import { openModal } from "../components/modal.js";
import { showToast } from "../components/toast.js";
import { patchState } from "../core/state.js";
import { navigate } from "../router.js";
import { prefersReducedMotion } from "../core/utils.js";

const CATEGORY_LABELS = {
  general: "Umum",
  love: "Cinta",
  career: "Karier",
  spiritual: "Spiritual",
};

// Kategori konten yang benar-benar ada di schema kartu (Master Spec §7).
// spread.category boleh berisi nilai lain (mis. "daily") — di luar itu,
// jatuh ke "general".
function defaultCategoryFor(spread) {
  return Object.prototype.hasOwnProperty.call(CATEGORY_LABELS, spread.category) ? spread.category : "general";
}

function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Ket: pickMeaning()/pickAdvice() versi Phase 5 sudah digantikan sepenuhnya
 * oleh js/tarot/interpretation.js (Phase 6) — lihat interpretCard(). */

function keywordChips(keywords = []) {
  return keywords.map((k) => `<span class="badge">${escapeHTML(k)}</span>`).join("");
}

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

/**
 * @param {HTMLElement} container
 */
function startFlow(container) {
  /** @type {{engine: import("../tarot/tarot-engine.js").TarotEngine, type: "one"|"three"|null, spread: object|null, question: string, intention: string, category: string|null, cardHandle: object|null, shuffleTimer: number|null}} */
  const flow = {
    engine: createTarotEngine(),
    type: null,
    spread: null,
    question: "",
    intention: "",
    category: null,
    cardHandle: null,
    shuffleTimer: null,
  };

  showTypeStep(container, flow);

  return flow;
}

function cleanupFlow(flow) {
  if (!flow) return;
  if (flow.shuffleTimer) {
    clearTimeout(flow.shuffleTimer);
    flow.shuffleTimer = null;
  }
  flow.cardHandle?.destroy?.();
  flow.cardHandle = null;
}

function confirmCancel(container, flow, onConfirm) {
  openModal({
    title: "Batalkan reading?",
    bodyHTML: `<p class="text-muted">Kartu yang sudah ditarik tidak akan disimpan.</p>`,
    actionsHTML: `
      <button class="btn btn--ghost" data-cancel-no>Tetap Lanjutkan</button>
      <button class="btn btn--danger" data-cancel-yes>Batalkan</button>
    `,
  });

  const outlet = document.getElementById("modal-outlet");
  outlet.querySelector("[data-cancel-no]")?.addEventListener("click", () => {
    outlet.innerHTML = "";
  });
  outlet.querySelector("[data-cancel-yes]")?.addEventListener("click", () => {
    outlet.innerHTML = "";
    flow.engine.abortReading();
    cleanupFlow(flow);
    onConfirm();
  });
}

function focusHeading(container) {
  const heading = container.querySelector("h1, h2");
  if (heading) {
    heading.setAttribute("tabindex", "-1");
    heading.focus();
  }
}

// ---------------------------------------------------------------------------
// Step 1 — Reading Type
// ---------------------------------------------------------------------------

function showTypeStep(container, flow) {
  cleanupFlow(flow);

  const oneCount = getAllSpreads().filter((s) => s.cardCount === 1).length;
  const threeCount = getAllSpreads().filter((s) => s.cardCount === 3).length;

  container.innerHTML = `
    <section class="stack gap-5">
      <div>
        <p class="eyebrow">Reading</p>
        <h1 class="font-display">Pilih Jenis Reading</h1>
        <p class="text-muted text-sm" style="margin-top:var(--space-2);">Mulai dari yang paling sesuai dengan waktu &amp; pertanyaanmu.</p>
      </div>

      <div class="grid-cards" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr));">
        <button type="button" class="card card--interactive stack gap-2" data-reading-type="one" style="text-align:left;">
          <h3>One Card</h3>
          <p class="text-sm text-muted">Satu kartu untuk fokus cepat.</p>
          <span class="badge">${oneCount} spread</span>
        </button>
        <button type="button" class="card card--interactive stack gap-2" data-reading-type="three" style="text-align:left;">
          <h3>Three Card</h3>
          <p class="text-sm text-muted">Masa lalu, sekarang, masa depan — atau sudut pandang lain.</p>
          <span class="badge">${threeCount} spread</span>
        </button>
      </div>
    </section>
  `;

  container.querySelectorAll("[data-reading-type]").forEach((btn) => {
    btn.addEventListener("click", () => {
      flow.type = btn.dataset.readingType;
      showSpreadStep(container, flow);
    });
  });

  focusHeading(container);
}

// ---------------------------------------------------------------------------
// Step 2 — Pilih Spread
// ---------------------------------------------------------------------------

function showSpreadStep(container, flow) {
  const cardCount = flow.type === "one" ? 1 : 3;
  const spreads = getAllSpreads().filter((s) => s.cardCount === cardCount);

  container.innerHTML = `
    <section class="stack gap-5">
      <div class="row gap-3" style="justify-content:space-between; align-items:flex-start;">
        <div>
          <p class="eyebrow">Reading · ${flow.type === "one" ? "One Card" : "Three Card"}</p>
          <h1 class="font-display">Pilih Spread</h1>
        </div>
        <button type="button" class="btn btn--ghost" data-back>&larr; Ganti Jenis</button>
      </div>

      <div class="stack gap-3">
        ${spreads
          .map(
            (s) => `
          <button type="button" class="card card--interactive stack gap-2" data-spread-id="${s.id}" style="text-align:left;">
            <div class="row gap-3" style="justify-content:space-between; align-items:baseline;">
              <h3>${escapeHTML(s.name)}</h3>
              <span class="badge">${escapeHTML(CATEGORY_LABELS[defaultCategoryFor(s)])}</span>
            </div>
            <p class="text-sm text-muted">${escapeHTML(s.description)}</p>
            <div class="row gap-2" style="flex-wrap:wrap;">
              ${s.positions.map((p) => `<span class="badge">${escapeHTML(p.name)}</span>`).join("")}
            </div>
          </button>
        `
          )
          .join("")}
      </div>
    </section>
  `;

  container.querySelector("[data-back]")?.addEventListener("click", () => showTypeStep(container, flow));

  container.querySelectorAll("[data-spread-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      flow.spread = spreads.find((s) => s.id === btn.dataset.spreadId) ?? null;
      flow.category = defaultCategoryFor(flow.spread);
      showQuestionStep(container, flow);
    });
  });

  focusHeading(container);
}

// ---------------------------------------------------------------------------
// Step 3 — Pertanyaan / Niat / Kategori
// ---------------------------------------------------------------------------

function showQuestionStep(container, flow) {
  const spread = flow.spread;

  container.innerHTML = `
    <section class="stack gap-5" style="max-width:60ch;">
      <div class="row gap-3" style="justify-content:space-between; align-items:flex-start;">
        <div>
          <p class="eyebrow">Reading · ${escapeHTML(spread.name)}</p>
          <h1 class="font-display">Pertanyaan &amp; Niat</h1>
        </div>
        <button type="button" class="btn btn--ghost" data-back>&larr; Ganti Spread</button>
      </div>

      <form class="stack gap-4" data-question-form>
        <label class="stack gap-2">
          <span class="text-sm">Pertanyaan <span class="text-muted">(opsional)</span></span>
          <textarea
            name="question"
            rows="3"
            placeholder="Apa yang ingin kamu jelajahi?"
            class="card"
            style="resize:vertical; font-family:var(--font-body); font-size:var(--fs-base);"
          >${escapeHTML(flow.question)}</textarea>
        </label>

        <label class="stack gap-2">
          <span class="text-sm">Niat <span class="text-muted">(opsional)</span></span>
          <input
            type="text"
            name="intention"
            placeholder="mis. Melihat dengan pikiran terbuka"
            class="card"
            style="font-family:var(--font-body); font-size:var(--fs-base); padding:var(--space-3) var(--space-4);"
            value="${escapeHTML(flow.intention)}"
          />
        </label>

        <label class="stack gap-2">
          <span class="text-sm">Kategori</span>
          <select name="category" class="card" style="font-family:var(--font-body); font-size:var(--fs-base); padding:var(--space-3) var(--space-4);">
            ${Object.entries(CATEGORY_LABELS)
              .map(
                ([value, label]) =>
                  `<option value="${value}" ${value === flow.category ? "selected" : ""}>${label}</option>`
              )
              .join("")}
          </select>
        </label>

        <button type="submit" class="btn btn--primary btn--full">Mulai Reading</button>
      </form>
    </section>
  `;

  container.querySelector("[data-back]")?.addEventListener("click", () => showSpreadStep(container, flow));

  container.querySelector("[data-question-form]")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    flow.question = String(data.get("question") ?? "").trim();
    flow.intention = String(data.get("intention") ?? "").trim();
    flow.category = String(data.get("category") ?? flow.category);

    flow.engine.createReading({
      spreadId: flow.spread.id,
      question: flow.question,
      intention: flow.intention,
    });

    showShuffleStep(container, flow);
  });

  focusHeading(container);
}

// ---------------------------------------------------------------------------
// Step 4 — Shuffle (Master Spec §17)
// ---------------------------------------------------------------------------

function showShuffleStep(container, flow) {
  container.innerHTML = `
    <section class="stack gap-6" style="align-items:center; text-align:center;">
      <div class="row gap-3" style="justify-content:space-between; align-items:flex-start; width:100%;">
        <div>
          <p class="eyebrow">Reading · ${escapeHTML(flow.spread.name)}</p>
          <h1 class="font-display">Kocok Kartu</h1>
        </div>
        <button type="button" class="btn btn--ghost" data-cancel>Batal</button>
      </div>

      <div class="shuffle-deck" data-shuffle-deck>
        <div class="shuffle-deck__card shuffle-deck__card--1 weave"></div>
        <div class="shuffle-deck__card shuffle-deck__card--2 weave"></div>
        <div class="shuffle-deck__card shuffle-deck__card--3 weave"></div>
        <div class="shuffle-deck__card shuffle-deck__card--4 weave"></div>
        <div class="shuffle-deck__card shuffle-deck__card--5 weave"></div>
      </div>

      <p class="text-muted text-sm" style="max-width:36ch;">78 kartu, diacak dengan Web Crypto secure random. Kocok sebanyak yang kamu mau sebelum menarik kartu pertama.</p>

      <div class="row gap-3">
        <button type="button" class="btn btn--secondary" data-shuffle-again>Kocok Lagi</button>
        <button type="button" class="btn btn--primary" data-start-draw>Tarik Kartu</button>
      </div>
    </section>
  `;

  const deckEl = container.querySelector("[data-shuffle-deck]");
  const shuffleAgainBtn = container.querySelector("[data-shuffle-again]");
  const drawBtn = container.querySelector("[data-start-draw]");

  function runShuffleAnimation() {
    flow.engine.reshuffle();
    deckEl.classList.remove("is-shuffling");
    // Force reflow supaya animasi bisa di-retrigger walau class sama.
    void deckEl.offsetWidth;
    deckEl.classList.add("is-shuffling");

    shuffleAgainBtn.disabled = true;
    drawBtn.disabled = true;

    const wait = prefersReducedMotion() ? 150 : 1200;
    flow.shuffleTimer = window.setTimeout(() => {
      deckEl.classList.remove("is-shuffling");
      shuffleAgainBtn.disabled = false;
      drawBtn.disabled = false;
      flow.shuffleTimer = null;
    }, wait);
  }

  // Kocok otomatis sekali begitu layar ini muncul, supaya deck terasa "hidup".
  runShuffleAnimation();

  shuffleAgainBtn.addEventListener("click", runShuffleAnimation);
  drawBtn.addEventListener("click", () => showDrawStep(container, flow));
  container.querySelector("[data-cancel]")?.addEventListener("click", () => {
    confirmCancel(container, flow, () => showTypeStep(container, flow));
  });

  focusHeading(container);
}

// ---------------------------------------------------------------------------
// Step 5 — Draw / Reveal / Interpret (loop per posisi) (Master Spec §18–20)
// ---------------------------------------------------------------------------

function showDrawStep(container, flow) {
  cleanupFlow(flow);

  const drawnCount = flow.engine.getReading().cards.length;
  const total = flow.spread.cardCount;
  const nextIndex = drawnCount; // posisi ke berapa yang akan ditarik (0-based)
  const upcomingPosition = flow.spread.positions[nextIndex];

  container.innerHTML = `
    <section class="stack gap-5" style="align-items:center; text-align:center;">
      <div class="row gap-3" style="justify-content:space-between; align-items:flex-start; width:100%;">
        <div>
          <p class="eyebrow">Reading · Kartu ${nextIndex + 1} dari ${total}</p>
          <h1 class="font-display">${escapeHTML(upcomingPosition.name)}</h1>
          <p class="text-muted text-sm" style="margin-top:var(--space-1);">${escapeHTML(upcomingPosition.description)}</p>
        </div>
        <button type="button" class="btn btn--ghost" data-cancel>Batal</button>
      </div>

      <div data-card-stage></div>

      <div class="row gap-3" data-action-row>
        <button type="button" class="btn btn--primary" data-draw-btn>Tarik Kartu</button>
      </div>

      <div class="reading-interpretation stack gap-3" data-interpretation hidden></div>
    </section>
  `;

  const stage = container.querySelector("[data-card-stage]");
  const actionRow = container.querySelector("[data-action-row]");
  const interpretationEl = container.querySelector("[data-interpretation]");
  const drawBtn = container.querySelector("[data-draw-btn]");

  container.querySelector("[data-cancel]")?.addEventListener("click", () => {
    confirmCancel(container, flow, () => showTypeStep(container, flow));
  });

  flow.cardHandle = renderTarotCard(stage, {
    card: null,
    revealed: false,
    interactive: true,
    size: "lg",
    positionLabel: upcomingPosition.name,
    onClick: () => handleDraw(),
  });

  function handleDraw() {
    let result;
    try {
      result = flow.engine.drawCard();
    } catch (err) {
      console.error("[reading] drawCard failed", err);
      showToast("Gagal menarik kartu. Coba lagi.", "danger");
      return;
    }

    flow.cardHandle.update(result.card, result.orientation);
    drawBtn.disabled = true;

    // Beri jeda singkat sebelum flip supaya terasa seperti kartu "diletakkan"
    // dulu, baru dibuka — bukan langsung terbuka bersamaan dengan draw.
    window.setTimeout(
      () => {
        flow.cardHandle.reveal();
        showRevealActions();
      },
      prefersReducedMotion() ? 0 : 260
    );
  }

  function showRevealActions() {
    const isLast = nextIndex + 1 >= total;
    actionRow.innerHTML = `
      <button type="button" class="btn btn--secondary" data-continue-btn>Lanjutkan</button>
    `;
    actionRow.querySelector("[data-continue-btn]").addEventListener("click", () => {
      let entry;
      try {
        entry = flow.engine.revealCurrentCard();
      } catch (err) {
        console.error("[reading] revealCurrentCard failed", err);
        showToast("Terjadi kesalahan saat membuka kartu.", "danger");
        return;
      }
      showInterpretation(entry, isLast);
    });
  }

  function showInterpretation(entry, isLast) {
    const { card, orientation } = entry;
    const interpretation = interpretCard({
      card,
      orientation,
      position: upcomingPosition,
      category: flow.category,
      question: flow.question,
    });

    interpretationEl.hidden = false;
    interpretationEl.innerHTML = `
      <div class="card stack gap-3" style="text-align:left;">
        <div class="row gap-3" style="justify-content:space-between; align-items:baseline;">
          <h3>${escapeHTML(card.name)}</h3>
          <span class="badge ${orientation === "reversed" ? "badge--reversed" : ""}">${orientation === "reversed" ? "Terbalik" : "Tegak"}</span>
        </div>
        <div class="row gap-2" style="flex-wrap:wrap;">${keywordChips(interpretation.keywords)}</div>
        <p>${escapeHTML(interpretation.meaning)}</p>
        <p class="text-sm text-muted"><strong class="text-sm" style="color:var(--otr-parchment-dim);">Nasihat:</strong> ${escapeHTML(interpretation.advice)}</p>
        <p class="text-sm text-muted" style="font-style:italic;">${escapeHTML(interpretation.reflection)}</p>
      </div>
    `;

    actionRow.innerHTML = isLast
      ? `<button type="button" class="btn btn--primary" data-finish-btn>Lihat Hasil</button>`
      : `<button type="button" class="btn btn--primary" data-next-btn>Kartu Berikutnya</button>`;

    if (isLast) {
      actionRow.querySelector("[data-finish-btn]")?.addEventListener("click", () => finishReading());
    } else {
      actionRow.querySelector("[data-next-btn]")?.addEventListener("click", () => showDrawStep(container, flow));
    }
  }

  function finishReading() {
    const reading = flow.engine.getReading();
    const spread = flow.spread;

    const entries = reading.cards.map((c) => ({
      card: flow.engine.deck.drawnCards.find((dc) => dc.id === c.cardId),
      orientation: c.orientation,
      position: spread.positions.find((p) => p.id === c.positionId),
    }));

    const synthesis = synthesizeReading({ entries, category: flow.category, question: flow.question });
    const completed = flow.engine.completeReading(synthesis.theme);

    patchState("reading", {
      ...completed,
      category: flow.category,
    });

    cleanupFlow(flow);
    navigate("/result");
  }

  focusHeading(container);
}

// ---------------------------------------------------------------------------
// Page export
// ---------------------------------------------------------------------------

let activeFlow = null;

export default {
  render(container) {
    // Setiap kali page ini di-render ulang (navigasi ke #/reading), mulai
    // dari awal — bukan melanjutkan reading yang tertinggal di module scope
    // sebelumnya (module ES tetap singleton, tapi flow lokal harus fresh).
    cleanupFlow(activeFlow);
    activeFlow = startFlow(container);
  },
  destroy() {
    cleanupFlow(activeFlow);
    activeFlow = null;
  },
};
