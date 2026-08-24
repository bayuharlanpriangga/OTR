// OTR — Page: Library (Phase 9 — Tarot Library, Roadmap Phase 9 / Master Spec §29;
// filter Favorit ditambahkan Phase 16 — Favorites, Roadmap Phase 16)
// Skeleton sejak Phase 1 cuma nampilin empty-state statis. Fase ini
// membangun UI murni di atas data yang sudah lengkap sejak Phase 2
// (data/tarot-cards.js) — tidak menambah data baru, mirip pola Phase 7.
//
// Fitur (Roadmap Phase 9): Card grid, Search, Arcana filter, Suit filter.
// Klik kartu -> #/library/:cardId (js/pages/card-detail.js). Fitur (Phase
// 16, DONE WHEN "Favorites tersimpan dan dapat difilter"): filter Favorit,
// dipasang sebagai select ketiga (sejajar Arcana/Suit) — bukan UI baru,
// biar konsisten dengan pola filter yang sudah ada di halaman ini.
//
// Render strategy: template penuh cuma dibangun sekali di render(). Grid +
// counter di-update lewat innerHTML pada node [data-library-grid]/
// [data-result-count] saja (bukan re-render seluruh container) supaya fokus
// & posisi kursor di input search tidak hilang tiap kali user mengetik.
// Klik kartu dipasang lewat event delegation di container (stabil, tidak
// ikut diganti tiap update grid) — sesuai pola tarotCardHTML() dipakai
// statis untuk render batch (lihat komentar js/components/tarot-card.js).
//
// render() jadi async karena status favorit (untuk filter) perlu dicek dulu
// ke favorite-service.js SEKALI di awal (bisa network call kalau login) —
// bukan per-kartu, sama pola dengan journal.js membangun readingsById.

import { getAllCards } from "../../data/tarot-cards.js";
import { tarotCardHTML } from "../components/tarot-card.js";
import { emptyStateHTML } from "../components/empty-state.js";
import { navigate } from "../router.js";
import { debounce } from "../core/utils.js";
import { listFavoriteEntityIds } from "../services/favorite-service.js";
import { showToast } from "../components/toast.js";

const ALL_CARDS = getAllCards();
const TOTAL_COUNT = ALL_CARDS.length;

const ARCANA_OPTIONS = [
  { value: "all", label: "Semua Arcana" },
  { value: "major", label: "Major Arcana" },
  { value: "minor", label: "Minor Arcana" },
];

const SUIT_OPTIONS = [
  { value: "all", label: "Semua Suit" },
  { value: "wands", label: "Wands" },
  { value: "cups", label: "Cups" },
  { value: "swords", label: "Swords" },
  { value: "pentacles", label: "Pentacles" },
];

const FAVORITE_OPTIONS = [
  { value: "all", label: "Semua Kartu" },
  { value: "favorites", label: "Favorit" },
];

function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function matchesSearch(card, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    card.name.toLowerCase().includes(q) ||
    card.slug.toLowerCase().includes(q) ||
    (card.keywords ?? []).some((k) => k.toLowerCase().includes(q))
  );
}

function filterCards({ search, arcana, suit, favorite }, favoriteIds) {
  return ALL_CARDS.filter((card) => {
    if (arcana !== "all" && card.arcana !== arcana) return false;
    if (arcana !== "major" && suit !== "all" && card.suit !== suit) return false;
    if (favorite === "favorites" && !favoriteIds.has(card.id)) return false;
    return matchesSearch(card, search);
  });
}

function selectHTML(name, options, selectedValue, disabled) {
  return `
    <select
      name="${name}"
      class="card"
      style="font-family:var(--font-body); font-size:var(--fs-sm); padding:var(--space-3) var(--space-4);"
      ${disabled ? "disabled" : ""}
    >
      ${options
        .map(
          (opt) =>
            `<option value="${opt.value}" ${opt.value === selectedValue ? "selected" : ""}>${escapeHTML(opt.label)}</option>`
        )
        .join("")}
    </select>
  `;
}

function template(state) {
  return `
    <section class="stack gap-5">
      <div>
        <p class="eyebrow">Library</p>
        <h1 class="font-display">Ensiklopedia Tarot</h1>
        <p class="text-sm text-muted">Jelajahi makna ${TOTAL_COUNT} kartu — Major &amp; Minor Arcana.</p>
      </div>

      <div class="library-toolbar stack gap-3">
        <input
          type="search"
          name="search"
          data-search-input
          placeholder="Cari nama kartu atau kata kunci..."
          class="card"
          style="font-family:var(--font-body); font-size:var(--fs-base); padding:var(--space-3) var(--space-4);"
          value="${escapeHTML(state.search)}"
        />
        <div class="library-filters row gap-3" style="flex-wrap:wrap;">
          <div data-arcana-select>${selectHTML("arcana", ARCANA_OPTIONS, state.arcana, false)}</div>
          <div data-suit-select>${selectHTML("suit", SUIT_OPTIONS, state.suit, state.arcana === "major")}</div>
          <div data-favorite-select>${selectHTML("favorite", FAVORITE_OPTIONS, state.favorite, false)}</div>
        </div>
        <p class="text-sm text-muted font-mono" data-result-count></p>
      </div>

      <div data-library-grid></div>
    </section>
  `;
}

function gridHTML(cards, favoriteActive) {
  if (!cards.length) {
    return emptyStateHTML({
      title: "Kartu tidak ditemukan",
      message: favoriteActive
        ? "Belum ada kartu yang ditandai favorit. Buka Card Detail lalu tekan ikon bintang."
        : "Coba ubah kata kunci pencarian atau filter Arcana/Suit.",
    });
  }
  return `
    <div class="tarot-card-grid">
      ${cards
        .map((card) =>
          tarotCardHTML({
            card,
            orientation: "upright",
            revealed: true,
            interactive: true,
            size: "sm",
          })
        )
        .join("")}
    </div>
  `;
}

export default {
  async render(container) {
    const state = { search: "", arcana: "all", suit: "all", favorite: "all" };

    // Spinner dulu -- listFavoriteEntityIds() bisa network call kalau login
    // (pola sama dengan journal.js/daily.js/card-detail.js).
    container.innerHTML = `<div class="row" style="justify-content:center; padding:var(--space-8) 0;"><span class="spinner" aria-label="Memuat"></span></div>`;

    let favoriteIds;
    try {
      favoriteIds = await listFavoriteEntityIds("card");
    } catch (err) {
      console.error("[library] gagal memuat status favorit", err);
      showToast("Gagal memuat status favorit.", "danger");
      favoriteIds = new Set();
    }

    container.innerHTML = template(state);

    const searchInput = container.querySelector("[data-search-input]");
    const arcanaSelectWrap = container.querySelector("[data-arcana-select]");
    const suitSelectWrap = container.querySelector("[data-suit-select]");
    const favoriteSelectWrap = container.querySelector("[data-favorite-select]");
    const gridEl = container.querySelector("[data-library-grid]");
    const countEl = container.querySelector("[data-result-count]");

    function updateGrid() {
      const filtered = filterCards(state, favoriteIds);
      gridEl.innerHTML = gridHTML(filtered, state.favorite === "favorites");
      countEl.textContent =
        filtered.length === TOTAL_COUNT
          ? `${TOTAL_COUNT} kartu`
          : `${filtered.length} dari ${TOTAL_COUNT} kartu ditemukan`;
    }

    const debouncedUpdate = debounce(() => {
      state.search = searchInput.value;
      updateGrid();
    }, 200);

    searchInput.addEventListener("input", debouncedUpdate);

    arcanaSelectWrap.querySelector("select").addEventListener("change", (e) => {
      state.arcana = e.target.value;
      if (state.arcana === "major") {
        state.suit = "all";
      }
      suitSelectWrap.innerHTML = selectHTML("suit", SUIT_OPTIONS, state.suit, state.arcana === "major");
      suitSelectWrap.querySelector("select").addEventListener("change", handleSuitChange);
      updateGrid();
    });

    function handleSuitChange(e) {
      state.suit = e.target.value;
      updateGrid();
    }
    suitSelectWrap.querySelector("select").addEventListener("change", handleSuitChange);

    favoriteSelectWrap.querySelector("select").addEventListener("change", (e) => {
      state.favorite = e.target.value;
      updateGrid();
    });

    function activateFromEvent(e) {
      const cardEl = e.target.closest("[data-tarot-card]");
      if (!cardEl || !gridEl.contains(cardEl)) return;
      const id = cardEl.dataset.cardId;
      if (id) navigate(`/library/${id}`);
    }

    container.addEventListener("click", activateFromEvent);
    container.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const cardEl = e.target.closest("[data-tarot-card]");
      if (!cardEl || !gridEl.contains(cardEl)) return;
      e.preventDefault();
      activateFromEvent(e);
    });

    updateGrid();
  },
};
