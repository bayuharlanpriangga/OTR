// OTR — Page: Result (Phase 5 — Reading MVP / Phase 6 — Interpretation Engine)
// Menampilkan reading yang baru saja selesai (Master Spec §24). Reading
// disuplai lewat js/core/state.js (di-patch oleh js/pages/reading.js saat
// completeReading() dipanggil) — halaman ini membaca state + data
// (getSpreadById/getCardById) lalu mendelegasikan SELURUH interpretasi
// (per kartu maupun sintesis) ke js/tarot/interpretation.js. Tidak ada
// logic makna/keyword/reflection ditulis ulang di sini.
//
// "OVERALL THEME / KEY MESSAGE / REFLECTION" (Master Spec §24) sekarang
// benar-benar hasil synthesizeReading() (Master Spec §23), bukan lagi
// ringkasan sementara — itu bedanya dari versi Phase 5.
//
// Layout/polish penuh ala Master Spec §24 (mis. "Result page harus bisa
// dibaca tanpa membuka banyak modal", styling final) tetap scope Phase 7 —
// Result Experience. Di sini fokusnya konten sudah benar & lengkap.

import { getState, resetReading } from "../core/state.js";
import { getSpreadById } from "../tarot/spreads.js";
import { getCardById } from "../../data/tarot-cards.js";
import { interpretCard, synthesizeReading } from "../tarot/interpretation.js";
import { tarotCardHTML } from "../components/tarot-card.js";
import { emptyStateHTML } from "../components/empty-state.js";
import { showToast } from "../components/toast.js";
import { navigate } from "../router.js";

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

function renderEmpty(container) {
  container.innerHTML = `
    <section class="stack gap-5">
      ${emptyStateHTML({
        title: "Belum ada hasil reading",
        message: "Mulai reading baru untuk melihat hasilnya di sini.",
        actionLabel: "Mulai Reading",
        actionHref: "#/reading",
      })}
    </section>
  `;
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

  const synthesis = synthesizeReading({
    entries: entries
      .filter(({ card, position }) => card && position)
      .map(({ entry, position, card }) => ({ card, orientation: entry.orientation, position })),
    category,
    question: reading.question ?? "",
  });

  container.innerHTML = `
    <section class="stack gap-6" style="max-width:72ch;">
      <div class="stack gap-2">
        <p class="eyebrow">Reading Selesai</p>
        <h1 class="font-display">${escapeHTML(spread.name)}</h1>
        ${
          reading.question
            ? `<p class="text-muted" style="font-style:italic;">“${escapeHTML(reading.question)}”</p>`
            : `<p class="text-muted text-sm">Tidak ada pertanyaan spesifik untuk reading ini.</p>`
        }
      </div>

      <hr style="border:none; border-top:1px solid var(--otr-hairline);" />

      <div class="stack gap-5">
        <p class="eyebrow">Spread</p>
        <div class="stack gap-5">
          ${entries
            .map(({ entry, position, card }) => {
              if (!card || !position) return "";
              const interpretation = interpretCard({
                card,
                orientation: entry.orientation,
                position,
                category,
                question: reading.question ?? "",
              });
              return `
                <div class="card row gap-5" style="align-items:flex-start; flex-wrap:wrap;">
                  <div style="flex-shrink:0; margin:0 auto;">
                    ${tarotCardHTML({ card, orientation: entry.orientation, revealed: true, interactive: false, size: "md" })}
                  </div>
                  <div class="stack gap-2" style="flex:1; min-width:220px;">
                    <p class="eyebrow">${escapeHTML(position.name)}</p>
                    <h3>${escapeHTML(card.name)} ${entry.orientation === "reversed" ? '<span class="badge badge--reversed">Terbalik</span>' : ""}</h3>
                    <div class="row gap-2" style="flex-wrap:wrap;">${keywordChips(interpretation.keywords)}</div>
                    <p class="text-sm">${escapeHTML(interpretation.meaning)}</p>
                    <p class="text-sm text-muted"><strong class="text-sm" style="color:var(--otr-parchment-dim);">Nasihat:</strong> ${escapeHTML(interpretation.advice)}</p>
                    <p class="text-sm text-muted" style="font-style:italic;">${escapeHTML(interpretation.reflection)}</p>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>

      <hr style="border:none; border-top:1px solid var(--otr-hairline);" />

      <div class="stack gap-4">
        <div class="stack gap-2">
          <p class="eyebrow">Overall Theme</p>
          <p class="text-sm">${escapeHTML(synthesis.theme)}</p>
          <div class="row gap-2" style="flex-wrap:wrap;">
            ${synthesis.dominantKeywords.length ? keywordChips(synthesis.dominantKeywords) : ""}
          </div>
        </div>

        <div class="stack gap-2">
          <p class="eyebrow">Key Message</p>
          <p class="text-sm">${escapeHTML(synthesis.keyMessage)}</p>
        </div>

        <div class="stack gap-2">
          <p class="eyebrow">Reflection</p>
          <p class="text-sm text-muted" style="font-style:italic;">${escapeHTML(synthesis.reflection)}</p>
        </div>
      </div>

      <hr style="border:none; border-top:1px solid var(--otr-hairline);" />

      <div class="row gap-3" style="flex-wrap:wrap;">
        <button type="button" class="btn btn--primary" data-new-reading>Reading Baru</button>
        <button type="button" class="btn btn--secondary" disabled title="Tersedia di Phase 8 (Local Storage)">Simpan Reading</button>
        <button type="button" class="btn btn--secondary" disabled title="Tersedia di Phase 11 (Journal)">Tulis Journal</button>
      </div>
    </section>
  `;

  container.querySelector("[data-new-reading]")?.addEventListener("click", () => {
    resetReading();
    navigate("/reading");
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
