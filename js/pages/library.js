// OTR — Page: Library (Phase 9 — Tarot Library, Roadmap Phase 9 / Master Spec §29)
// Skeleton sejak Phase 1 cuma nampilin empty-state statis. Fase ini
// membangun UI murni di atas data yang sudah lengkap sejak Phase 2
// (data/tarot-cards.js) — tidak menambah data baru, mirip pola Phase 7.
//
// Fitur (Roadmap Phase 9): Card grid, Search, Arcana filter, Suit filter.
// Klik kartu -> #/library/:cardId (js/pages/card-detail.js).
//
// Render strategy: template penuh cuma dibangun sekali di render(). Grid +
// counter di-update lewat innerHTML pada node [data-library-grid]/
// [data-result-count] saja (bukan re-render seluruh container) supaya fokus
// & posisi kursor di input search tidak hilang tiap kali user mengetik.
// Klik kartu dipasang lewat event delegation di container (stabil, tidak
// ikut diganti tiap update grid) — sesuai pola tarotCardHTML() dipakai
// statis untuk render batch (lihat komentar js/components/tarot-card.js).

import { getAllCards } from "../../data/tarot-cards.js";
import { tarotCardHTML } from "../components/tarot-card.js";
import { emptyStateHTML } from "../components/empty-state.js";
import { navigate } from "../router.js";
import { debounce } from "../core/utils.js";

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

function filterCards({ search, arcana, suit }) {
  return ALL_CARDS.filter((card) => {
    if (arcana !== "all" && card.arcana !== arcana) return false;
    if (arcana !== "major" && suit !== "all" && card.suit !== suit) return false;
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
        </div>
        <p class="text-sm text-muted font-mono" data-result-count></p>
      </div>

      <div data-library-grid></div>
    </section>
  `;
}

function gridHTML(cards) {
  if (!cards.length) {
    return emptyStateHTML({
      title: "Kartu tidak ditemukan",
      message: "Coba ubah kata kunci pencarian atau filter Arcana/Suit.",
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
  render(container) {
    const state = { search: "", arcana: "all", suit: "all" };

    container.innerHTML = template(state);

    const searchInput = container.querySelector("[data-search-input]");
    const arcanaSelectWrap = container.querySelector("[data-arcana-select]");
    const suitSelectWrap = container.querySelector("[data-suit-select]");
    const gridEl = container.querySelector("[data-library-grid]");
    const countEl = container.querySelector("[data-result-count]");

    function updateGrid() {
      const filtered = filterCards(state);
      gridEl.innerHTML = gridHTML(filtered);
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
