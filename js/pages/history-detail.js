// OTR — Page: History Detail (Phase 8 — Local Storage, Master Spec §32)
// "Display the original reading exactly as it happened. Do not rerun the
// tarot engine... store interpretationSnapshot inside reading cards."
// Ini satu-satunya page yang membaca reading.cards[].interpretationSnapshot
// / reading.synthesisSnapshot langsung dari storage.js — TIDAK pernah
// meng-import interpretCard()/synthesizeReading() dari js/tarot/interpretation.js.
// Kalau logic interpretasi berubah di masa depan (mis. Phase 22 AI Reading),
// reading lama yang sudah tersimpan tetap tampil persis seperti saat dibuat.
//
// Markup sengaja memakai ulang class .result-* dari result.js (Phase 7)
// supaya reading yang baru selesai vs. reading yang dibuka lagi dari
// History terasa satu bahasa visual yang sama — bedanya cuma sumber data
// (live interpretCard() vs snapshot beku) dan action band di bagian bawah.

// Phase 14 — Cloud Sync: sebelumnya import langsung dari core/storage.js.
import { getReadingById, deleteReading } from "../services/reading-service.js";
import { getCardById } from "../../data/tarot-cards.js";
import { tarotCardHTML } from "../components/tarot-card.js";
import { emptyStateHTML } from "../components/empty-state.js";
import { openModal, closeModal } from "../components/modal.js";
import { showToast } from "../components/toast.js";
import { icon } from "../components/icons.js";
import { navigate } from "../router.js";
import { formatDate } from "../core/utils.js";

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

function renderNotFound(container) {
  container.innerHTML = `
    <section class="result-page stack gap-5">
      ${emptyStateHTML({
        title: "Reading tidak ditemukan",
        message: "Reading ini mungkin sudah dihapus, atau linknya tidak valid.",
        actionLabel: "Kembali ke History",
        actionHref: "#/history",
      })}
    </section>
  `;
}

/** Beda dari cardEntryHTML di result.js: TIDAK memanggil interpretCard(),
 *  cuma membaca card.interpretationSnapshot yang sudah beku. Data kartu
 *  penuh (image/eyebrow) di-resolve ulang lewat getCardById() untuk visual
 *  saja — itu data referensi statis (id-based), bukan bagian dari
 *  interpretasi yang wajib immutable. */
function cardEntryHTML(card, isLast) {
  const fullCard = getCardById(card.cardId);
  const snapshot = card.interpretationSnapshot ?? {};

  return `
    <div class="result-card-entry">
      <div class="result-card-entry__rail">
        <div class="result-card-entry__index font-mono">•</div>
        ${isLast ? "" : `<div class="result-card-entry__line" aria-hidden="true"></div>`}
      </div>
      <div class="result-card-entry__body">
        <div class="result-card-entry__visual">
          ${
            fullCard
              ? tarotCardHTML({ card: fullCard, orientation: card.orientation, revealed: true, interactive: false, size: "md" })
              : `<div class="card stack" style="width:180px; aspect-ratio:var(--card-ratio); align-items:center; justify-content:center;"><span class="text-sm text-muted">${escapeHTML(card.cardName)}</span></div>`
          }
        </div>
        <div class="result-card-entry__content stack gap-2">
          <div class="stack gap-1">
            <p class="eyebrow">${escapeHTML(card.positionName)}</p>
            ${card.positionDescription ? `<p class="text-sm text-muted result-card-entry__position-desc">${escapeHTML(card.positionDescription)}</p>` : ""}
          </div>
          <h3>${escapeHTML(card.cardName)} ${card.orientation === "reversed" ? '<span class="badge badge--reversed">Terbalik</span>' : ""}</h3>
          ${snapshot.keywords?.length ? `<div class="row gap-2" style="flex-wrap:wrap;">${keywordChips(snapshot.keywords)}</div>` : ""}
          ${snapshot.meaning ? `<p class="text-sm">${escapeHTML(snapshot.meaning)}</p>` : ""}
          ${snapshot.advice ? `<p class="text-sm text-muted"><strong class="text-sm" style="color:var(--otr-parchment-dim);">Nasihat:</strong> ${escapeHTML(snapshot.advice)}</p>` : ""}
          ${snapshot.reflection ? `<p class="text-sm text-muted" style="font-style:italic;">${escapeHTML(snapshot.reflection)}</p>` : ""}
        </div>
      </div>
    </div>
  `;
}

function confirmDelete(onConfirm) {
  openModal({
    title: "Hapus reading ini?",
    bodyHTML: `<p class="text-muted">Reading yang sudah dihapus tidak bisa dikembalikan.</p>`,
    actionsHTML: `
      <button type="button" class="btn btn--secondary" data-cancel-delete>Batal</button>
      <button type="button" class="btn btn--danger" data-confirm-delete>Hapus</button>
    `,
  });

  const outlet = document.getElementById("modal-outlet");
  outlet?.querySelector("[data-cancel-delete]")?.addEventListener("click", () => closeModal());
  outlet?.querySelector("[data-confirm-delete]")?.addEventListener("click", () => {
    closeModal();
    onConfirm();
  });
}

function renderDetail(container, reading) {
  const synthesis = reading.synthesisSnapshot ?? {};
  const cards = reading.cards ?? [];

  container.innerHTML = `
    <section class="result-page stack gap-6">
      <div class="result-header result-section stack gap-3">
        <p class="eyebrow">Reading Tersimpan</p>
        <h1 class="font-display">${escapeHTML(reading.spreadName)}</h1>
        ${
          reading.question
            ? `<p class="result-question">“${escapeHTML(reading.question)}”</p>`
            : `<p class="text-muted text-sm">Tidak ada pertanyaan spesifik untuk reading ini.</p>`
        }
        ${reading.completedAt ? `<p class="result-header__timestamp">Diselesaikan pada ${escapeHTML(formatDate(reading.completedAt))}</p>` : ""}
      </div>

      ${dividerHTML()}

      <div class="result-section stack gap-5">
        <p class="eyebrow">Spread &middot; ${cards.length} Kartu</p>
        <div class="result-cards">
          ${cards.map((card, i) => cardEntryHTML(card, i === cards.length - 1)).join("")}
        </div>
      </div>

      ${dividerHTML()}

      <div class="result-section card result-synthesis">
        <div class="result-synthesis__watermark weave"></div>
        <div class="result-synthesis__block stack gap-2">
          <p class="eyebrow">Overall Theme</p>
          <p class="text-sm">${escapeHTML(synthesis.theme ?? "")}</p>
          ${synthesis.dominantKeywords?.length ? `<div class="row gap-2" style="flex-wrap:wrap;">${keywordChips(synthesis.dominantKeywords)}</div>` : ""}
        </div>

        <div class="result-synthesis__block stack gap-2">
          <p class="eyebrow">Key Message</p>
          <p class="text-sm">${escapeHTML(synthesis.keyMessage ?? "")}</p>
        </div>

        <div class="result-synthesis__block stack gap-2">
          <p class="eyebrow">Reflection</p>
          <p class="text-sm text-muted" style="font-style:italic;">${escapeHTML(synthesis.reflection ?? "")}</p>
        </div>
      </div>

      ${dividerHTML()}

      <div class="result-section result-actions row gap-3" style="flex-wrap:wrap;">
        <a class="btn btn--secondary" href="#/history">${icon("clock", { size: 16 })} Kembali ke History</a>
        <button type="button" class="btn btn--secondary" disabled title="Tersedia di Phase 11 (Journal)">${icon("feather", { size: 16 })} Tulis Journal</button>
        <button type="button" class="btn btn--danger" data-delete-reading>${icon("trash", { size: 16 })} Hapus Reading</button>
      </div>
    </section>
  `;

  container.querySelector("[data-delete-reading]")?.addEventListener("click", () => {
    confirmDelete(async () => {
      try {
        await deleteReading(reading.id);
      } catch (err) {
        console.error("[history-detail] gagal menghapus reading", err);
        showToast("Gagal menghapus reading.", "danger");
        return;
      }
      showToast("Reading dihapus.", "default");
      navigate("/history");
    });
  });
}

export default {
  async render(container, params = {}) {
    // Phase 14: getReadingById() bisa berupa network call (cloud) —
    // spinner dulu supaya halaman tidak kosong selama menunggu.
    container.innerHTML = `<div class="row" style="justify-content:center; padding:var(--space-8) 0;"><span class="spinner" aria-label="Memuat"></span></div>`;

    let reading;
    try {
      reading = await getReadingById(params.readingId);
    } catch (err) {
      console.error("[history-detail] gagal memuat reading", err);
      showToast("Gagal menampilkan reading.", "danger");
      renderNotFound(container);
      return;
    }

    if (!reading) {
      renderNotFound(container);
      return;
    }

    try {
      renderDetail(container, reading);
    } catch (err) {
      console.error("[history-detail] failed to render reading", err);
      showToast("Gagal menampilkan reading.", "danger");
      renderNotFound(container);
    }
  },
};
