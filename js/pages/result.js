// OTR — Page: Result (Phase 7 — Result Experience, Master Spec §24)
// Konten & sumber data TIDAK berubah dari Phase 6: reading disuplai lewat
// js/core/state.js, dan seluruh interpretasi (per kartu + sintesis) tetap
// didelegasikan penuh ke js/tarot/interpretation.js. Yang berubah di Phase 7
// murni presentasi — layout, hierarki visual, dan sequencing — supaya
// "reading result terasa seperti produk final, bukan debug screen"
// (Roadmap Phase 7, DONE WHEN).
//
// Perubahan struktural dari Phase 6:
// - Header sekarang berupa hero block (eyebrow + nama spread + kutipan
//   pertanyaan + timestamp "Diselesaikan pada ..." dari reading.completedAt).
// - Setiap kartu dirender dengan "rail" posisi (nomor + garis penghubung)
//   supaya urutan spread (mis. Situation → Challenge → Advice) terbaca
//   sekilas — bukan cuma daftar kartu lepas. Deskripsi posisi (dari
//   spread.positions[].description, Master Spec §12) ikut ditampilkan
//   sebagai konteks singkat — field yang sudah ada sejak Phase 2 tapi belum
//   pernah dipakai di UI manapun.
// - Overall Theme / Key Message / Reflection sekarang satu panel visual
//   ("result-synthesis") yang ditonjolkan lewat border + watermark .weave
//   tipis — menandakan ini kesimpulan, bukan section sejajar dengan daftar
//   kartu di atasnya.
// - Divider generik <hr> diganti ornamen tipis (.result-divider) yang
//   konsisten dengan bahasa visual "foil accent" aplikasi.
// - Tombol aksi memakai ikon (js/components/icons.js) — pola yang sudah
//   dipakai di sidebar/bottom-nav, sekarang dipakai pertama kali di tombol.
// - Section-section masuk dengan reveal beruntun (lihat css/reading.css +
//   css/animations.css), otomatis nonaktif di bawah prefers-reduced-motion.

import { getState, resetReading } from "../core/state.js";
import { getSpreadById } from "../tarot/spreads.js";
import { getCardById } from "../../data/tarot-cards.js";
import { interpretCard, synthesizeReading } from "../tarot/interpretation.js";
import { tarotCardHTML } from "../components/tarot-card.js";
import { emptyStateHTML } from "../components/empty-state.js";
import { showToast } from "../components/toast.js";
import { navigate } from "../router.js";
import { icon } from "../components/icons.js";
import { formatDate } from "../core/utils.js";
import { saveGuestReading, getGuestReadingById } from "../core/storage.js";

const CATEGORY_LABELS = {
  general: "Umum",
  love: "Cinta",
  career: "Karier",
  spiritual: "Spiritual",
};

function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function keywordChips(keywords = []) {
  return keywords.map((k) => `<span class="badge">${escapeHTML(k)}</span>`).join("");
}

function dividerHTML() {
  return `<div class="result-divider" aria-hidden="true"></div>`;
}

function renderEmpty(container) {
  container.innerHTML = `
    <section class="result-page stack gap-5">
      ${emptyStateHTML({
        title: "Belum ada hasil reading",
        message: "Mulai reading baru untuk melihat hasilnya di sini.",
        actionLabel: "Mulai Reading",
        actionHref: "#/reading",
      })}
    </section>
  `;
}

function cardEntryHTML({ entry, position, card, interpretation, isLast }) {
  if (!card || !position) return "";

  return `
    <div class="result-card-entry">
      <div class="result-card-entry__rail">
        <div class="result-card-entry__index font-mono">${position.index + 1}</div>
        ${isLast ? "" : `<div class="result-card-entry__line" aria-hidden="true"></div>`}
      </div>
      <div class="result-card-entry__body">
        <div class="result-card-entry__visual">
          ${tarotCardHTML({ card, orientation: entry.orientation, revealed: true, interactive: false, size: "md" })}
        </div>
        <div class="result-card-entry__content stack gap-2">
          <div class="stack gap-1">
            <p class="eyebrow">${escapeHTML(position.name)}</p>
            ${position.description ? `<p class="text-sm text-muted result-card-entry__position-desc">${escapeHTML(position.description)}</p>` : ""}
          </div>
          <h3>${escapeHTML(card.name)} ${entry.orientation === "reversed" ? '<span class="badge badge--reversed">Terbalik</span>' : ""}</h3>
          <div class="row gap-2" style="flex-wrap:wrap;">${keywordChips(interpretation.keywords)}</div>
          <p class="text-sm">${escapeHTML(interpretation.meaning)}</p>
          <p class="text-sm text-muted"><strong class="text-sm" style="color:var(--otr-parchment-dim);">Nasihat:</strong> ${escapeHTML(interpretation.advice)}</p>
          <p class="text-sm text-muted" style="font-style:italic;">${escapeHTML(interpretation.reflection)}</p>
        </div>
      </div>
    </div>
  `;
}

function buildSavedReading({ reading, spread, category, validEntries, synthesis }) {
  return {
    id: reading.id,
    spreadId: spread.id,
    spreadName: spread.name,
    question: reading.question ?? "",
    intention: reading.intention ?? "",
    category,
    status: "completed",
    isFavorite: false,
    createdAt: reading.createdAt ?? null,
    completedAt: reading.completedAt ?? null,
    savedAt: new Date().toISOString(),
    // Master Spec §32 — snapshot per kartu disimpan apa adanya, tidak boleh
    // dihitung ulang lagi oleh siapa pun setelah ini (lihat history-detail.js).
    cards: validEntries.map(({ entry, position, card, interpretation }) => ({
      positionId: position.id,
      positionName: position.name,
      positionDescription: position.description ?? "",
      cardId: card.id,
      cardName: card.name,
      orientation: entry.orientation,
      interpretationSnapshot: interpretation,
    })),
    synthesisSnapshot: synthesis,
  };
}

function renderResult(container, reading) {
  const spread = getSpreadById(reading.spreadId);

  if (!spread) {
    renderEmpty(container);
    return;
  }

  const category = reading.category && CATEGORY_LABELS[reading.category] ? reading.category : "general";

  const entries = reading.cards.map((entry) => ({
    entry,
    position: spread.positions.find((p) => p.id === entry.positionId),
    card: getCardById(entry.cardId),
  }));

  const validEntries = entries
    .filter(({ card, position }) => card && position)
    .map((item) => ({
      ...item,
      interpretation: interpretCard({ card: item.card, orientation: item.entry.orientation, position: item.position, category, question: reading.question ?? "" }),
    }));

  const synthesis = synthesizeReading({
    entries: validEntries.map(({ entry, position, card }) => ({ card, orientation: entry.orientation, position })),
    category,
    question: reading.question ?? "",
  });

  const alreadySaved = Boolean(getGuestReadingById(reading.id));

  container.innerHTML = `
    <section class="result-page stack gap-6">
      <div class="result-header result-section stack gap-3">
        <p class="eyebrow">Reading Selesai</p>
        <h1 class="font-display">${escapeHTML(spread.name)}</h1>
        ${
          reading.question
            ? `<p class="result-question">“${escapeHTML(reading.question)}”</p>`
            : `<p class="text-muted text-sm">Tidak ada pertanyaan spesifik untuk reading ini.</p>`
        }
        ${reading.completedAt ? `<p class="result-header__timestamp">Diselesaikan pada ${escapeHTML(formatDate(reading.completedAt))}</p>` : ""}
      </div>

      ${dividerHTML()}

      <div class="result-section stack gap-5">
        <p class="eyebrow">Spread &middot; ${validEntries.length} Kartu</p>
        <div class="result-cards">
          ${validEntries.map((item, i) => cardEntryHTML({ ...item, isLast: i === validEntries.length - 1 })).join("")}
        </div>
      </div>

      ${dividerHTML()}

      <div class="result-section card result-synthesis">
        <div class="result-synthesis__watermark weave"></div>
        <div class="result-synthesis__block stack gap-2">
          <p class="eyebrow">Overall Theme</p>
          <p class="text-sm">${escapeHTML(synthesis.theme)}</p>
          ${synthesis.dominantKeywords.length ? `<div class="row gap-2" style="flex-wrap:wrap;">${keywordChips(synthesis.dominantKeywords)}</div>` : ""}
        </div>

        <div class="result-synthesis__block stack gap-2">
          <p class="eyebrow">Key Message</p>
          <p class="text-sm">${escapeHTML(synthesis.keyMessage)}</p>
        </div>

        <div class="result-synthesis__block stack gap-2">
          <p class="eyebrow">Reflection</p>
          <p class="text-sm text-muted" style="font-style:italic;">${escapeHTML(synthesis.reflection)}</p>
        </div>
      </div>

      ${dividerHTML()}

      <div class="result-section result-actions row gap-3" style="flex-wrap:wrap;">
        <button type="button" class="btn btn--primary" data-new-reading>${icon("sparkle", { size: 16 })} Reading Baru</button>
        <button type="button" class="btn btn--secondary" data-save-reading ${alreadySaved ? "disabled" : ""}>${icon("bookmark", { size: 16 })} <span data-save-label>${alreadySaved ? "Tersimpan" : "Simpan Reading"}</span></button>
        <button type="button" class="btn btn--secondary" disabled title="Tersedia di Phase 11 (Journal)">${icon("feather", { size: 16 })} Tulis Journal</button>
      </div>
    </section>
  `;

  container.querySelector("[data-new-reading]")?.addEventListener("click", () => {
    resetReading();
    navigate("/reading");
  });

  const saveBtn = container.querySelector("[data-save-reading]");
  saveBtn?.addEventListener("click", () => {
    const record = buildSavedReading({ reading, spread, category, validEntries, synthesis });
    const ok = saveGuestReading(record);
    if (!ok) {
      showToast("Gagal menyimpan reading. Coba lagi.", "danger");
      return;
    }
    saveBtn.disabled = true;
    const label = saveBtn.querySelector("[data-save-label]");
    if (label) label.textContent = "Tersimpan";
    showToast("Reading tersimpan. Bisa dibuka lagi lewat History.", "success");
  });
}

export default {
  render(container) {
    const { reading } = getState();

    if (!reading || reading.status !== "completed" || !reading.spreadId) {
      renderEmpty(container);
      return;
    }

    try {
      renderResult(container, reading);
    } catch (err) {
      console.error("[result] failed to render reading", err);
      showToast("Gagal menampilkan hasil reading.", "danger");
      renderEmpty(container);
    }
  },
};
