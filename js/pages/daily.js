// OTR — Page: Daily (Phase 15 — Daily Card, Roadmap Phase 15, Master Spec §27/§28)
// Menggantikan skeleton Phase 1. Empat fitur Roadmap Phase 15:
//   - Daily Card    -> hero card besar, revealed langsung (bukan flip
//                      interaktif seperti Reading — kartu ini sudah
//                      "ditentukan" begitu halaman dibuka, tidak ada
//                      langkah draw manual, Master Spec §27).
//   - Daily Meaning  -> title/keywords/meaning/advice dari js/tarot/
//                      interpretation.js (interpretCard(), category
//                      "general") — reuse penuh, konsisten dengan suara
//                      interpretasi di Result page.
//   - Reflection     -> reflectionPrompt dari js/tarot/daily-card.js,
//                      dibuat SEKALI per hari & disimpan (immutable),
//                      BUKAN textarea bebas (lihat catatan skema di
//                      js/services/daily-service.js).
//   - Daily History  -> daftar ringkas kartu-kartu hari sebelumnya
//                      (§28 "History should store daily card readings
//                      separately from normal readings") — ditampilkan
//                      inline di halaman ini, bukan route terpisah, karena
//                      Master Spec §56 (Navigation) cuma punya SATU entri
//                      nav "Daily Card", tidak ada "Daily History" sendiri.

import { getTodayDailyCard, listDailyCardHistory } from "../services/daily-service.js";
import { interpretCard } from "../tarot/interpretation.js";
import { tarotCardHTML } from "../components/tarot-card.js";
import { showToast } from "../components/toast.js";
import { emptyStateHTML } from "../components/empty-state.js";

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

/** "Sabtu, 23 Agustus 2026" dari date key "YYYY-MM-DD" — dibangun manual
 *  dari komponen tanggal lokal (bukan `new Date("YYYY-MM-DD")` langsung,
 *  yang oleh mesin JS ditafsir sebagai UTC tengah malam dan bisa mundur
 *  1 hari lagi di tampilan untuk timezone barat UTC — sama alasan dengan
 *  toDateKey() di js/tarot/daily-card.js, cuma arah sebaliknya). */
function formatDailyDate(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const local = new Date(y, m - 1, d);
  return local.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatShortDate(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const local = new Date(y, m - 1, d);
  return local.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function heroHTML(daily, interpretation) {
  return `
    <div class="card weave daily-hero">
      <div class="daily-hero__visual">
        ${tarotCardHTML({ card: daily.card, orientation: daily.orientation, revealed: true, interactive: false, size: "lg" })}
      </div>
      <div class="daily-hero__content stack gap-2">
        <p class="daily-hero__date">${escapeHTML(formatDailyDate(daily.date))}</p>
        <p class="eyebrow">Kartu Hari Ini</p>
        <h1 class="font-display">${escapeHTML(daily.card.name)} ${daily.orientation === "reversed" ? '<span class="badge badge--reversed">Terbalik</span>' : ""}</h1>
        <div class="row gap-2" style="flex-wrap:wrap;">${keywordChips(interpretation.keywords)}</div>
      </div>
    </div>
  `;
}

function meaningHTML(interpretation) {
  return `
    <div class="result-section stack gap-3">
      <p class="eyebrow">Daily Meaning</p>
      <p class="text-sm">${escapeHTML(interpretation.meaning)}</p>
      <p class="text-sm text-muted"><strong class="text-sm" style="color:var(--otr-parchment-dim);">Nasihat:</strong> ${escapeHTML(interpretation.advice)}</p>
    </div>
  `;
}

function reflectionHTML(daily) {
  return `
    <div class="result-section card result-synthesis">
      <div class="result-synthesis__watermark weave"></div>
      <div class="result-synthesis__block stack gap-2">
        <p class="eyebrow">Reflection</p>
        <p class="text-sm text-muted" style="font-style:italic;">${escapeHTML(daily.reflectionPrompt)}</p>
      </div>
    </div>
  `;
}

function historyItemHTML(entry) {
  if (!entry.card) return "";
  return `
    <a class="card card--interactive daily-history-item" href="#/library/${escapeHTML(entry.card.slug)}">
      <div class="daily-history-item__meta stack gap-1">
        <p class="daily-history-item__date">${escapeHTML(formatShortDate(entry.date))}</p>
        <h3>${escapeHTML(entry.card.name)} ${entry.orientation === "reversed" ? '<span class="badge badge--reversed">Terbalik</span>' : ""}</h3>
      </div>
    </a>
  `;
}

function historyHTML(entries, todayDate) {
  // Hari ini sudah ditampilkan penuh lewat hero — riwayat cuma menunjukkan
  // hari-hari SEBELUM hari ini supaya tidak duplikat.
  const past = entries.filter((e) => e.date !== todayDate);

  return `
    <div class="result-section stack gap-3">
      <p class="eyebrow">Daily History</p>
      ${
        past.length
          ? `<div class="daily-history-list">${past.map(historyItemHTML).join("")}</div>`
          : `<p class="text-sm text-muted">Riwayat kartu harian sebelumnya akan muncul di sini.</p>`
      }
    </div>
  `;
}

function renderError(container) {
  container.innerHTML = `
    <section class="stack gap-5">
      ${emptyStateHTML({
        title: "Gagal memuat kartu harian",
        message: "Terjadi kesalahan saat mengambil kartu hari ini. Coba muat ulang halaman.",
      })}
    </section>
  `;
}

export default {
  async render(container) {
    container.innerHTML = `<div class="row" style="justify-content:center; padding:var(--space-8) 0;"><span class="spinner" aria-label="Memuat"></span></div>`;

    let daily;
    let history = [];
    try {
      daily = await getTodayDailyCard();
      history = await listDailyCardHistory(14);
    } catch (err) {
      console.error("[daily] gagal memuat kartu harian", err);
      showToast("Gagal memuat kartu harian.", "danger");
      renderError(container);
      return;
    }

    if (!daily?.card) {
      renderError(container);
      return;
    }

    const interpretation = interpretCard({ card: daily.card, orientation: daily.orientation, category: "general" });

    container.innerHTML = `
      <section class="stack gap-6">
        <div>
          <p class="eyebrow">Daily</p>
          <h1 class="font-display">Kartu Hari Ini</h1>
        </div>

        ${heroHTML(daily, interpretation)}
        ${dividerHTML()}
        ${meaningHTML(interpretation)}
        ${dividerHTML()}
        ${reflectionHTML(daily)}
        ${dividerHTML()}
        ${historyHTML(history, daily.date)}
      </section>
    `;
  },
};
