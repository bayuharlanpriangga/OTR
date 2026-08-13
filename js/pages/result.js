// OTR — Page: Result (Phase 5 — Reading MVP)
// Menampilkan reading yang baru saja selesai (Master Spec §24). Reading
// disuplai lewat js/core/state.js (di-patch oleh js/pages/reading.js saat
// completeReading() dipanggil) — halaman ini murni membaca state + data
// (getSpreadById/getCardById), tidak menyentuh TarotEngine sama sekali.
//
// "OVERALL THEME / KEY MESSAGE / REFLECTION" di Master Spec §24 adalah
// output Interpretation Engine (§21–23) yang baru dibangun Phase 6. Supaya
// tidak mendahului scope fase itu, bagian tersebut di sini tampil sebagai
// ringkasan deterministik yang sangat sederhana (gabungan keyword & nasihat
// per kartu) dengan label jelas "sementara" — bukan hasil engine terstruktur
// (title/meaning/advice/reflection per Master Spec §21).

import { getState, resetReading } from "../core/state.js";
import { getSpreadById } from "../tarot/spreads.js";
import { getCardById } from "../../data/tarot-cards.js";
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

function pickMeaning(card, orientation, category) {
  const bucket = orientation === "reversed" ? card.reversed : card.upright;
  return bucket?.[category] || bucket?.general || "";
}

function pickAdvice(card, orientation) {
  const bucket = orientation === "reversed" ? card.reversed : card.upright;
  return bucket?.advice || "";
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

  const cardEntries = reading.cards.map((entry) => {
    const position = spread.positions.find((p) => p.id === entry.positionId);
    const card = getCardById(entry.cardId);
    return { entry, position, card };
  });

  const allKeywords = [...new Set(cardEntries.flatMap(({ card }) => card?.keywords ?? []))];
  const allAdvice = cardEntries
    .map(({ card, entry }) => (card ? pickAdvice(card, entry.orientation) : ""))
    .filter(Boolean);

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
          ${cardEntries
            .map(({ entry, position, card }) => {
              if (!card || !position) return "";
              const meaning = pickMeaning(card, entry.orientation, category);
              const advice = pickAdvice(card, entry.orientation);
              return `
                <div class="card row gap-5" style="align-items:flex-start; flex-wrap:wrap;">
                  <div style="flex-shrink:0; margin:0 auto;">
                    ${tarotCardHTML({ card, orientation: entry.orientation, revealed: true, interactive: false, size: "md" })}
                  </div>
                  <div class="stack gap-2" style="flex:1; min-width:220px;">
                    <p class="eyebrow">${escapeHTML(position.name)}</p>
                    <h3>${escapeHTML(card.name)} ${entry.orientation === "reversed" ? '<span class="badge badge--reversed">Terbalik</span>' : ""}</h3>
                    <div class="row gap-2" style="flex-wrap:wrap;">${keywordChips(card.keywords)}</div>
                    ${meaning ? `<p class="text-sm">${escapeHTML(meaning)}</p>` : ""}
                    ${advice ? `<p class="text-sm text-muted"><strong class="text-sm" style="color:var(--otr-parchment-dim);">Nasihat:</strong> ${escapeHTML(advice)}</p>` : ""}
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
          <div class="row gap-2" style="flex-wrap:wrap;">
            ${allKeywords.length ? keywordChips(allKeywords) : '<p class="text-muted text-sm">—</p>'}
          </div>
        </div>

        <div class="stack gap-2">
          <p class="eyebrow">Key Message</p>
          ${
            allAdvice.length
              ? `<p class="text-sm">${escapeHTML(allAdvice.join(" "))}</p>`
              : '<p class="text-muted text-sm">—</p>'
          }
        </div>

        <div class="stack gap-2">
          <p class="eyebrow">Reflection</p>
          <p class="text-sm text-muted">
            Luangkan waktu sejenak. Bagaimana ${escapeHTML(allKeywords.slice(0, 3).join(", ") || "kartu-kartu ini")}
            hadir dalam situasimu sekarang?
          </p>
        </div>

        <p class="text-muted text-sm" style="font-style:italic;">
          Ringkasan di atas masih sederhana (gabungan kata kunci &amp; nasihat per kartu). Interpretation Engine penuh
          yang menyatukan posisi, kategori, dan pertanyaan jadi satu narasi menyusul di Phase 6.
        </p>
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
