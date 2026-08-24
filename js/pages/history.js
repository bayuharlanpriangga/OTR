// OTR — Page: History (Phase 10 — Reading History, Roadmap Phase 10 / Master Spec §31)
// Phase 8 sudah menyambungkan halaman ini ke js/core/storage.js (list, delete,
// buka detail immutable di #/history/:readingId). Fase ini menambahkan yang
// eksplisit ditunda Phase 8: Search, Filter (All/Today/This Week/This Month/
// Favorites, Master Spec §31), Sort, dan Favorite — tanpa menyentuh
// history-detail.js atau storage.js (setGuestReadingFavorite() sudah
// disiapkan sejak Phase 8, tinggal dipakai).
//
// Render strategy: sama seperti library.js (Phase 9) — template penuh
// (header + toolbar) dibangun sekali di render(), lalu cuma [data-history-list]
// yang di-update tiap search/filter/sort berubah, supaya fokus di search box
// tidak hilang tiap kali user mengetik. Toolbar cuma dirender kalau ada
// minimal 1 reading tersimpan (tidak ada gunanya nyari di list kosong).
//
// Favorite & delete dipasang lewat event delegation di container (bukan
// per-item, mengikuti pola activateFromEvent() di library.js) supaya tidak
// perlu reattach listener tiap kali [data-history-list] di-render ulang.

// Phase 14 — Cloud Sync: sebelumnya import langsung dari core/storage.js.
// Sekarang lewat reading-service.js, yang otomatis baca dari Supabase kalau
// user login (lihat komentar di service itu) -- guest tetap localStorage,
// tidak ada perubahan perilaku buat user yang belum login.
import { listReadings, deleteReading, setReadingFavorite } from "../services/reading-service.js";
import { emptyStateHTML } from "../components/empty-state.js";
import { openModal, closeModal } from "../components/modal.js";
import { showToast } from "../components/toast.js";
import { icon } from "../components/icons.js";
import { formatDate, debounce } from "../core/utils.js";
import { getState } from "../core/state.js";

const CATEGORY_LABELS = {
  general: "Umum",
  love: "Cinta",
  career: "Karier",
  spiritual: "Spiritual",
};

// Master Spec §31 — filter katalog persis: All, Today, This Week, This Month,
// Favorites.
const FILTER_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "today", label: "Hari Ini" },
  { value: "week", label: "Minggu Ini" },
  { value: "month", label: "Bulan Ini" },
  { value: "favorites", label: "Favorit" },
];

// Roadmap Phase 10 cuma minta "Sort" tanpa merinci arah — Terbaru/Terlama
// dipilih karena itu satu-satunya sumbu sort yang masuk akal untuk reading
// card yang cuma punya field tanggal (bukan mis. nama/abjad).
const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
];

function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function selectHTML(name, options, selectedValue) {
  return `
    <select
      name="${name}"
      class="card"
      style="font-family:var(--font-body); font-size:var(--fs-sm); padding:var(--space-3) var(--space-4);"
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

/** completedAt seharusnya selalu ada untuk reading yang sudah tersimpan
 *  (lihat buildSavedReading() di result.js), tapi tetap fallback berjenjang
 *  ke createdAt/savedAt supaya sort/filter tanggal tidak diam-diam
 *  membuang reading kalau suatu saat ada data lama yang field-nya kosong. */
function getReadingDate(reading) {
  const raw = reading.completedAt ?? reading.createdAt ?? reading.savedAt;
  return raw ? new Date(raw) : null;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// Senin sebagai awal minggu (konvensi Indonesia), bukan Minggu.
function startOfWeek(d) {
  const x = startOfDay(d);
  const day = x.getDay(); // 0=Minggu, 1=Senin, ...
  const diff = (day === 0 ? -6 : 1) - day;
  x.setDate(x.getDate() + diff);
  return x;
}

function startOfMonth(d) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

function matchesDateFilter(reading, filter, now) {
  if (filter === "all") return true;
  if (filter === "favorites") return Boolean(reading.isFavorite);

  const date = getReadingDate(reading);
  if (!date) return false;

  if (filter === "today") return date >= startOfDay(now);
  if (filter === "week") return date >= startOfWeek(now);
  if (filter === "month") return date >= startOfMonth(now);
  return true;
}

function matchesSearch(reading, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  const cardNames = (reading.cards ?? []).map((c) => c.cardName?.toLowerCase() ?? "").join(" ");
  return (
    (reading.spreadName ?? "").toLowerCase().includes(q) ||
    (reading.question ?? "").toLowerCase().includes(q) ||
    cardNames.includes(q)
  );
}

function sortReadings(readings, sort) {
  const sorted = [...readings];
  sorted.sort((a, b) => {
    const da = getReadingDate(a)?.getTime() ?? 0;
    const db = getReadingDate(b)?.getTime() ?? 0;
    return sort === "oldest" ? da - db : db - da;
  });
  return sorted;
}

function filterReadings(readings, state) {
  const now = new Date();
  const filtered = readings.filter(
    (r) => matchesDateFilter(r, state.filter, now) && matchesSearch(r, state.search)
  );
  return sortReadings(filtered, state.sort);
}

function readingItemHTML(reading) {
  const categoryLabel = CATEGORY_LABELS[reading.category] ?? null;
  const cardCount = reading.cards?.length ?? 0;
  const isFav = Boolean(reading.isFavorite);

  return `
    <div class="card card--interactive row gap-4" style="justify-content:space-between; align-items:flex-start;" data-reading-item="${escapeHTML(reading.id)}">
      <a href="#/history/${escapeHTML(reading.id)}" class="stack gap-1" style="flex:1; min-width:0; text-decoration:none; color:inherit;">
        <p class="eyebrow">${escapeHTML(reading.spreadName)} &middot; ${cardCount} Kartu${categoryLabel ? ` &middot; ${escapeHTML(categoryLabel)}` : ""}</p>
        <h3>${reading.question ? `“${escapeHTML(reading.question)}”` : "Tanpa pertanyaan spesifik"}</h3>
        ${reading.completedAt ? `<p class="text-sm text-muted font-mono">${escapeHTML(formatDate(reading.completedAt))}</p>` : ""}
      </a>
      <div class="row gap-2" style="flex-shrink:0;">
        <button
          type="button"
          class="btn btn--ghost favorite-btn${isFav ? " is-favorite" : ""}"
          data-favorite-reading="${escapeHTML(reading.id)}"
          aria-label="${isFav ? "Hapus dari favorit" : "Tandai favorit"}"
          aria-pressed="${isFav}"
        >
          ${icon("star", { size: 16 })}
        </button>
        <button type="button" class="btn btn--ghost" data-delete-reading="${escapeHTML(reading.id)}" aria-label="Hapus reading ini">
          ${icon("trash", { size: 16 })}
        </button>
      </div>
    </div>
  `;
}

function template(state, totalCount) {
  // Phase 14: label berubah tergantung sumber data -- "perangkat ini"
  // (guest, localStorage) vs "akunmu" (login, Supabase) -- supaya tidak
  // menyesatkan sekarang reading bisa disinkronkan lintas device.
  const isCloud = Boolean(getState().user);
  return `
    <section class="stack gap-5">
      <div>
        <p class="eyebrow">History</p>
        <h1 class="font-display">Riwayat Reading</h1>
        ${totalCount ? `<p class="text-sm text-muted">${totalCount} reading tersimpan di ${isCloud ? "akunmu" : "perangkat ini"}.</p>` : ""}
      </div>

      ${
        totalCount
          ? `
      <div class="history-toolbar stack gap-3">
        <input
          type="search"
          name="search"
          data-search-input
          placeholder="Cari pertanyaan, spread, atau nama kartu..."
          class="card"
          style="font-family:var(--font-body); font-size:var(--fs-base); padding:var(--space-3) var(--space-4);"
          value="${escapeHTML(state.search)}"
        />
        <div class="history-filters row gap-3" style="flex-wrap:wrap;">
          <div data-filter-select>${selectHTML("filter", FILTER_OPTIONS, state.filter)}</div>
          <div data-sort-select>${selectHTML("sort", SORT_OPTIONS, state.sort)}</div>
        </div>
        <p class="text-sm text-muted font-mono" data-result-count></p>
      </div>`
          : ""
      }

      <div data-history-list></div>
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
  async render(container) {
    const state = { search: "", filter: "all", sort: "newest" };

    // Phase 14: listReadings() bisa berupa network call (cloud) — tampilkan
    // spinner dulu supaya halaman tidak kosong selama menunggu. Guest tetap
    // resolve instan lewat microtask (localStorage), jadi spinner ini
    // praktis tidak sempat kelihatan di jalur itu.
    container.innerHTML = `<div class="row" style="justify-content:center; padding:var(--space-8) 0;"><span class="spinner" aria-label="Memuat"></span></div>`;

    // Diambil sekali dari service, lalu dimutasi lokal saat favorite/delete
    // berhasil — supaya renderList() tidak perlu fetch ulang tiap keystroke
    // di search box (sumber kebenaran tetap service, cuma dibaca ulang di
    // titik yang jelas: awal render() ini saja).
    let baseReadings;
    try {
      baseReadings = await listReadings();
    } catch (err) {
      console.error("[history] gagal memuat riwayat reading", err);
      showToast("Gagal memuat riwayat reading.", "danger");
      baseReadings = [];
    }

    container.innerHTML = template(state, baseReadings.length);

    const listEl = container.querySelector("[data-history-list]");
    const countEl = container.querySelector("[data-result-count]");

    function renderList() {
      if (!baseReadings.length) {
        listEl.innerHTML = emptyStateHTML({
          title: "Belum ada reading tersimpan",
          message: "Reading yang kamu simpan lewat tombol \"Simpan Reading\" di halaman Result akan muncul di sini.",
          actionLabel: "Mulai Reading",
          actionHref: "#/reading",
        });
        return;
      }

      const filtered = filterReadings(baseReadings, state);
      listEl.innerHTML = filtered.length
        ? `<div class="stack gap-3">${filtered.map(readingItemHTML).join("")}</div>`
        : emptyStateHTML({
            title: "Reading tidak ditemukan",
            message: "Coba ubah kata kunci pencarian atau filter di atas.",
          });

      if (countEl) {
        countEl.textContent =
          filtered.length === baseReadings.length
            ? `${baseReadings.length} reading`
            : `${filtered.length} dari ${baseReadings.length} reading ditemukan`;
      }
    }

    const searchInput = container.querySelector("[data-search-input]");
    if (searchInput) {
      const debouncedSearch = debounce(() => {
        state.search = searchInput.value;
        renderList();
      }, 200);
      searchInput.addEventListener("input", debouncedSearch);
    }

    container.querySelector("[data-filter-select] select")?.addEventListener("change", (e) => {
      state.filter = e.target.value;
      renderList();
    });

    container.querySelector("[data-sort-select] select")?.addEventListener("change", (e) => {
      state.sort = e.target.value;
      renderList();
    });

    container.addEventListener("click", async (e) => {
      const favBtn = e.target.closest("[data-favorite-reading]");
      if (favBtn) {
        e.preventDefault();
        const id = favBtn.dataset.favoriteReading;
        const target = baseReadings.find((r) => r.id === id);
        if (!target) return;
        const next = !target.isFavorite;
        try {
          await setReadingFavorite(id, next);
        } catch (err) {
          console.error("[history] gagal memperbarui favorit", err);
          showToast("Gagal memperbarui favorit.", "danger");
          return;
        }
        target.isFavorite = next;
        renderList();
        return;
      }

      const delBtn = e.target.closest("[data-delete-reading]");
      if (delBtn) {
        e.preventDefault();
        const id = delBtn.dataset.deleteReading;
        confirmDelete(id, async () => {
          try {
            await deleteReading(id);
          } catch (err) {
            console.error("[history] gagal menghapus reading", err);
            showToast("Gagal menghapus reading.", "danger");
            return;
          }
          baseReadings = baseReadings.filter((r) => r.id !== id);
          showToast("Reading dihapus.", "default");
          renderList();
        });
      }
    });

    renderList();
  },
};
