// OTR — Page: History (Phase 8 — Local Storage, Roadmap Phase 8)
// Skeleton sejak Phase 1 cuma nampilin empty-state statis. Fase ini
// menyambungkannya ke js/core/storage.js: list reading yang tersimpan,
// hapus (dengan konfirmasi), dan buka detail immutable-nya di
// #/history/:readingId (js/pages/history-detail.js).
//
// Search/filter/sort tetap ditunda ke Phase 10 (Reading History) sesuai
// komentar skeleton aslinya — di sini list-nya cuma diurutkan apa adanya
// dari storage (terbaru duluan, lihat saveGuestReading() di storage.js).

import { listGuestReadings, deleteGuestReading } from "../core/storage.js";
import { emptyStateHTML } from "../components/empty-state.js";
import { openModal, closeModal } from "../components/modal.js";
import { showToast } from "../components/toast.js";
import { icon } from "../components/icons.js";
import { formatDate } from "../core/utils.js";

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

function readingItemHTML(reading) {
  const categoryLabel = CATEGORY_LABELS[reading.category] ?? null;
  const cardCount = reading.cards?.length ?? 0;

  return `
    <div class="card card--interactive row gap-4" style="justify-content:space-between; align-items:flex-start;" data-reading-item="${escapeHTML(reading.id)}">
      <a href="#/history/${escapeHTML(reading.id)}" class="stack gap-1" style="flex:1; min-width:0; text-decoration:none; color:inherit;">
        <p class="eyebrow">${escapeHTML(reading.spreadName)} &middot; ${cardCount} Kartu${categoryLabel ? ` &middot; ${escapeHTML(categoryLabel)}` : ""}</p>
        <h3>${reading.question ? `“${escapeHTML(reading.question)}”` : "Tanpa pertanyaan spesifik"}</h3>
        ${reading.completedAt ? `<p class="text-sm text-muted font-mono">${escapeHTML(formatDate(reading.completedAt))}</p>` : ""}
      </a>
      <button type="button" class="btn btn--ghost" data-delete-reading="${escapeHTML(reading.id)}" aria-label="Hapus reading ini" style="flex-shrink:0;">
        ${icon("trash", { size: 16 })}
      </button>
    </div>
  `;
}

function template(readings) {
  return `
    <section class="stack gap-5">
      <div>
        <p class="eyebrow">History</p>
        <h1 class="font-display">Riwayat Reading</h1>
        ${readings.length ? `<p class="text-sm text-muted">${readings.length} reading tersimpan di perangkat ini.</p>` : ""}
      </div>
      <div data-history-list>
        ${
          readings.length
            ? `<div class="stack gap-3">${readings.map(readingItemHTML).join("")}</div>`
            : emptyStateHTML({
                title: "Belum ada reading tersimpan",
                message: "Reading yang kamu simpan lewat tombol \"Simpan Reading\" di halaman Result akan muncul di sini.",
                actionLabel: "Mulai Reading",
                actionHref: "#/reading",
              })
        }
      </div>
    </section>
  `;
}

function confirmDelete(id, onConfirm) {
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

export default {
  render(container) {
    function renderList() {
      const readings = listGuestReadings();
      container.innerHTML = template(readings);

      container.querySelectorAll("[data-delete-reading]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const id = btn.dataset.deleteReading;
          confirmDelete(id, () => {
            const ok = deleteGuestReading(id);
            if (!ok) {
              showToast("Gagal menghapus reading.", "danger");
              return;
            }
            showToast("Reading dihapus.", "default");
            renderList();
          });
        });
      });
    }

    renderList();
  },
};
