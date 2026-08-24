// OTR — Page: Card Detail (Phase 9 — Tarot Library, Roadmap Phase 9 / Master Spec §30;
// tombol favorit ditambahkan Phase 16 — Favorites, Roadmap Phase 16 / Master
// Spec §33)
// Route #/library/:cardId. Nama file mengikuti file tree Master Spec §3
// (js/pages/card-detail.js), berbeda dari history-detail.js yang me-reuse
// class .result-* dari Result page — di sini styling sengaja dibuat
// sendiri di css/library.css karena Card Detail bukan "hasil reading",
// tapi materi referensi/ensiklopedia yang murni baca data statis kartu.
//
// Struktur konten mengikuti mockup Master Spec §30 persis: nama kartu,
// eyebrow arcana/nomor, keywords, lalu section UPRIGHT dan REVERSED
// masing-masing berisi General/Love/Career/Spiritual (field "advice" di
// data TIDAK ditampilkan di sini — spec §30 cuma minta 4 field itu per
// orientasi; advice sudah punya tempatnya sendiri di Reading flow lewat
// interpretCard()).
//
// Favorit (Phase 16): render() jadi async karena status favorit awal perlu
// dicek dulu ke favorite-service.js (bisa network call kalau login) — pola
// sama dengan journal.js/daily.js, spinner dulu sebelum konten kartu
// tampil. Toast teks mengikuti Master Spec §63 ("Card added to favorites").

import { getCardById } from "../../data/tarot-cards.js";
import { ARCANA_LABELS, SUIT_LABELS, RANK_LABELS } from "../../data/tarot-keywords.js";
import { tarotCardHTML } from "../components/tarot-card.js";
import { emptyStateHTML } from "../components/empty-state.js";
import { icon } from "../components/icons.js";
import { showToast } from "../components/toast.js";
import { listFavoriteEntityIds, toggleFavorite } from "../services/favorite-service.js";

function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** "Major Arcana · 00" / "Wands · Ace" — sama seperti eyebrowLabel() privat
 *  di tarot-card.js, diduplikasi di sini secara sengaja (pola yang sama
 *  dipakai tiap page module untuk helper kecil seperti escapeHTML). */
function arcanaEyebrow(card) {
  if (card.arcana === "major") {
    return `${ARCANA_LABELS.major} · ${String(card.number).padStart(2, "0")}`;
  }
  const suitLabel = SUIT_LABELS[card.suit] ?? card.suit ?? "";
  const rankLabel = RANK_LABELS[card.rank] ?? card.rank ?? "";
  return [ARCANA_LABELS.minor, suitLabel, rankLabel].filter(Boolean).join(" · ");
}

function keywordChips(keywords = []) {
  return keywords.map((k) => `<span class="badge">${escapeHTML(k)}</span>`).join("");
}

function meaningBlock(label, text) {
  return `
    <div class="card-detail__block stack gap-1">
      <p class="eyebrow">${escapeHTML(label)}</p>
      <p class="text-sm">${escapeHTML(text ?? "")}</p>
    </div>
  `;
}

function orientationSection(title, data) {
  return `
    <div class="card card-detail__orientation stack gap-4">
      <h2>${escapeHTML(title)}</h2>
      <div class="card-detail__meanings">
        ${meaningBlock("General", data?.general)}
        ${meaningBlock("Love", data?.love)}
        ${meaningBlock("Career", data?.career)}
        ${meaningBlock("Spiritual", data?.spiritual)}
      </div>
    </div>
  `;
}

function renderNotFound(container) {
  container.innerHTML = `
    <section class="card-detail stack gap-5">
      ${emptyStateHTML({
        title: "Kartu tidak ditemukan",
        message: "Kartu ini mungkin tidak ada, atau linknya tidak valid.",
        actionLabel: "Kembali ke Library",
        actionHref: "#/library",
      })}
    </section>
  `;
}

function renderDetail(container, card, isFav) {
  container.innerHTML = `
    <section class="card-detail stack gap-6">
      <div class="row gap-3" style="justify-content:space-between; align-items:flex-start;">
        <a href="#/library" class="btn btn--ghost" style="align-self:flex-start;">&larr; Kembali ke Library</a>
        <button
          type="button"
          class="btn btn--ghost favorite-btn${isFav ? " is-favorite" : ""}"
          data-favorite-card
          aria-label="${isFav ? "Hapus dari favorit" : "Tandai favorit"}"
          aria-pressed="${isFav}"
        >
          ${icon("star", { size: 18 })}
        </button>
      </div>

      <div class="card-detail__header row gap-5" style="align-items:flex-start; flex-wrap:wrap;">
        <div class="card-detail__visual">
          ${tarotCardHTML({ card, orientation: "upright", revealed: true, interactive: false, size: "lg" })}
        </div>
        <div class="stack gap-3" style="flex:1; min-width:220px;">
          <div>
            <p class="eyebrow">${escapeHTML(arcanaEyebrow(card))}</p>
            <h1 class="font-display">${escapeHTML(card.name)}</h1>
          </div>
          ${card.keywords?.length ? `<div class="row gap-2" style="flex-wrap:wrap;">${keywordChips(card.keywords)}</div>` : ""}
        </div>
      </div>

      <div class="card-detail__divider" aria-hidden="true"></div>

      ${orientationSection("Upright", card.upright)}
      ${orientationSection("Reversed", card.reversed)}
    </section>
  `;
}

export default {
  async render(container, params = {}) {
    const card = getCardById(params.cardId);

    if (!card) {
      renderNotFound(container);
      return;
    }

    // Spinner dulu -- listFavoriteEntityIds() bisa network call kalau login
    // (pola sama dengan journal.js/daily.js).
    container.innerHTML = `<div class="row" style="justify-content:center; padding:var(--space-8) 0;"><span class="spinner" aria-label="Memuat"></span></div>`;

    let isFav = false;
    try {
      const favoriteIds = await listFavoriteEntityIds("card");
      isFav = favoriteIds.has(card.id);
    } catch (err) {
      console.error("[card-detail] gagal memuat status favorit", err);
      // Tidak fatal -- kartu tetap bisa dibaca, tombol favorit cuma mulai
      // dari state "belum favorit" kalau pengecekan gagal.
    }

    renderDetail(container, card, isFav);

    const favBtn = container.querySelector("[data-favorite-card]");
    favBtn?.addEventListener("click", async () => {
      favBtn.disabled = true;
      try {
        isFav = await toggleFavorite("card", card.id);
        favBtn.classList.toggle("is-favorite", isFav);
        favBtn.setAttribute("aria-pressed", String(isFav));
        favBtn.setAttribute("aria-label", isFav ? "Hapus dari favorit" : "Tandai favorit");
        showToast(isFav ? "Kartu ditambahkan ke favorit." : "Kartu dihapus dari favorit.", "success");
      } catch (err) {
        console.error("[card-detail] gagal memperbarui favorit", err);
        showToast("Gagal memperbarui favorit.", "danger");
      } finally {
        favBtn.disabled = false;
      }
    });
  },
};
