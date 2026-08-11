// OTR — Tarot Card component (Phase 4)
// Satu komponen dipakai di seluruh OTR: Reading (Phase 5, 1 kartu besar
// pakai flip), Library (Phase 9, grid 78 kartu langsung revealed), History,
// dsb. Tidak tahu apa-apa soal TarotEngine (Phase 3) — cuma menerima data
// kartu (schema Master Spec §7) + flag orientation/revealed/selected/dst,
// selaras dengan pemisahan "data & logic independen dari UI" yang sudah
// dipakai Phase 2 & 3.
//
// Dua cara pakai (lihat pola button.js & modal.js):
//   - tarotCardHTML(opts)      -> string markup statis, cocok untuk render
//                                  batch (mis. grid 78 kartu di Library)
//   - renderTarotCard(el, opts) -> mount ke satu container + wire interaksi,
//                                  mengembalikan handle imperative untuk
//                                  Reading flow (reveal() dipanggil setelah
//                                  animasi "Draw Card", dst — Phase 5)

import { ARCANA_LABELS, SUIT_LABELS, RANK_LABELS } from "../../data/tarot-keywords.js";

function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Eyebrow label kecil di atas art, mis. "MAJOR ARCANA · 00" / "CUPS · SEVEN". */
function eyebrowLabel(card) {
  if (!card) return "";
  if (card.arcana === "major") {
    return `${ARCANA_LABELS.major} · ${String(card.number).padStart(2, "0")}`;
  }
  const suitLabel = SUIT_LABELS[card.suit] ?? card.suit ?? "";
  const rankLabel = RANK_LABELS[card.rank] ?? card.rank ?? "";
  return [suitLabel, rankLabel].filter(Boolean).join(" · ");
}

/**
 * Bangun markup satu tarot card (tanpa mem-bind event apa pun).
 * @param {object} opts
 * @param {object|null} [opts.card] - objek kartu penuh (data/tarot-cards.js, schema §7). Boleh null kalau belum ada kartu (mis. slot kosong di layout spread).
 * @param {"upright"|"reversed"} [opts.orientation]
 * @param {boolean} [opts.revealed] - false = tampil card back (default)
 * @param {boolean} [opts.selected]
 * @param {boolean} [opts.disabled]
 * @param {boolean} [opts.loading]
 * @param {boolean} [opts.interactive] - true kalau kartu memang bisa diklik (menentukan hover/cursor/role=button)
 * @param {"sm"|"md"|"lg"} [opts.size]
 * @param {string} [opts.positionLabel] - label posisi spread (mis. "Situation") ditampilkan lewat aria-label, bukan visual (visual position label jadi tanggung jawab layout Reading di Phase 5)
 * @returns {string}
 */
export function tarotCardHTML({
  card = null,
  orientation = "upright",
  revealed = false,
  selected = false,
  disabled = false,
  loading = false,
  interactive = false,
  size = "md",
  positionLabel = "",
} = {}) {
  const cardId = card?.id ?? "";
  const name = card ? escapeHTML(card.name) : "";
  const eyebrow = card ? escapeHTML(eyebrowLabel(card)) : "";
  const artStyle = card?.image ? ` style="background-image:url('${escapeHTML(card.image)}')"` : "";
  const initial = card ? escapeHTML(card.name.charAt(0)) : "";

  const label = card
    ? `${revealed ? name : "Kartu tertutup"}${positionLabel ? ` — ${positionLabel}` : ""}${revealed ? ` (${orientation === "reversed" ? "terbalik" : "tegak"})` : ""}`
    : positionLabel || "Slot kartu kosong";

  return `
    <div
      class="tarot-card tarot-card--${size}"
      data-tarot-card
      data-card-id="${escapeHTML(cardId)}"
      data-orientation="${orientation}"
      data-revealed="${revealed}"
      data-selected="${selected}"
      data-disabled="${disabled}"
      data-loading="${loading}"
      data-interactive="${interactive && !disabled}"
      role="${interactive && !disabled ? "button" : "img"}"
      ${interactive && !disabled ? 'tabindex="0"' : ""}
      aria-label="${escapeHTML(label)}"
      aria-disabled="${disabled}"
    >
      <div class="tarot-card__inner">
        <div class="tarot-card__back weave">
          <div class="tarot-card__back-mark"></div>
        </div>
        <div class="tarot-card__front">
          ${revealed && orientation === "reversed" ? '<span class="badge badge--reversed tarot-card__orientation-badge">Terbalik</span>' : ""}
          <div class="tarot-card__face-content">
            <p class="tarot-card__eyebrow">${eyebrow}</p>
            <div class="tarot-card__art"${artStyle}>
              <span class="tarot-card__art-fallback">${initial}</span>
            </div>
            <p class="tarot-card__name">${name}</p>
          </div>
        </div>
      </div>
      <div class="tarot-card__loading-overlay skeleton"></div>
    </div>
  `;
}

/**
 * Mount satu tarot card ke container + wire interaksi klik/keyboard.
 * Dipakai Reading flow (Phase 5) yang butuh imperative handle untuk
 * mengatur timing reveal secara terpisah dari draw.
 * @param {HTMLElement} container
 * @param {object} opts - sama seperti tarotCardHTML, plus:
 * @param {(card:object|null)=>void} [opts.onClick] - dipanggil saat kartu diklik/Enter/Space, hanya kalau interactive && !disabled
 * @returns {{
 *   el: HTMLElement,
 *   reveal: () => void,
 *   hide: () => void,
 *   setOrientation: (o:"upright"|"reversed") => void,
 *   setSelected: (v:boolean) => void,
 *   setDisabled: (v:boolean) => void,
 *   setLoading: (v:boolean) => void,
 *   update: (card:object, orientation?:"upright"|"reversed") => void,
 *   destroy: () => void
 * }|null}
 */
export function renderTarotCard(container, opts = {}) {
  if (!container) return null;

  const state = { ...opts };
  container.innerHTML = tarotCardHTML(state);
  const el = container.querySelector("[data-tarot-card]");

  function handleActivate(e) {
    if (state.disabled || !state.interactive) return;
    if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
    if (e.type === "keydown") e.preventDefault();
    state.onClick?.(state.card ?? null);
  }

  el.addEventListener("click", handleActivate);
  el.addEventListener("keydown", handleActivate);

  function rerender() {
    const focused = document.activeElement === el;
    container.innerHTML = tarotCardHTML(state);
    const newEl = container.querySelector("[data-tarot-card]");
    newEl.addEventListener("click", handleActivate);
    newEl.addEventListener("keydown", handleActivate);
    if (focused) newEl.focus();
    return newEl;
  }

  let currentEl = el;

  return {
    get el() {
      return currentEl;
    },
    /** Flip ke front face. Idempotent kalau sudah revealed. */
    reveal() {
      state.revealed = true;
      currentEl.dataset.revealed = "true";
      // Badge & orientation-dependent markup butuh re-render penuh.
      currentEl = rerender();
    },
    /** Flip balik ke card back (mis. "Draw ulang" sebelum reading dikonfirmasi). */
    hide() {
      state.revealed = false;
      currentEl = rerender();
    },
    setOrientation(orientation) {
      state.orientation = orientation;
      currentEl = rerender();
    },
    setSelected(value) {
      state.selected = Boolean(value);
      currentEl.dataset.selected = String(state.selected);
    },
    setDisabled(value) {
      state.disabled = Boolean(value);
      currentEl = rerender();
    },
    setLoading(value) {
      state.loading = Boolean(value);
      currentEl.dataset.loading = String(state.loading);
    },
    /** Ganti kartu yang ditampilkan sepenuhnya (mis. dari hasil tarotEngine.drawCard()). */
    update(card, orientation = state.orientation) {
      state.card = card;
      state.orientation = orientation;
      currentEl = rerender();
    },
    destroy() {
      currentEl.removeEventListener("click", handleActivate);
      currentEl.removeEventListener("keydown", handleActivate);
      container.innerHTML = "";
    },
  };
}
