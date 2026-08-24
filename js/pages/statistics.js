// OTR — Page: Statistics (Phase 17 — Statistics, Roadmap Phase 17, Master
// Spec §34)
//
// Sebelumnya skeleton Phase 1 (angka dummy "—" statis). Sekarang mengambil
// data lewat js/services/statistics-service.js, yang mengambil reading
// history lewat reading-service.js (otomatis guest/cloud, lihat komentar di
// service itu -- halaman ini tidak perlu tahu bedanya) lalu menghitung
// SEMUA metrik di klien (Roadmap Phase 17 "Prefer derived statistics").
//
// Render strategy: mirip daily.js/history.js -- spinner selama fetch+hitung,
// baru render penuh sekali jadi. Tidak ada state interaktif (search/filter)
// di halaman ini seperti History, jadi tidak perlu split render() vs
// renderList() -- statistik dihitung sekali per kunjungan halaman.

import { getStatistics } from "../services/statistics-service.js";
import { emptyStateHTML } from "../components/empty-state.js";
import { showToast } from "../components/toast.js";
import { icon } from "../components/icons.js";

function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function statCardHTML(value, label) {
  return `
    <div class="card stat-card stack gap-2">
      <span class="stat-card__value font-mono">${escapeHTML(String(value))}</span>
      <span class="stat-card__label text-sm text-muted">${escapeHTML(label)}</span>
    </div>
  `;
}

function highlightCardHTML({ iconName, title, name, meta }) {
  return `
    <div class="card stat-highlight row gap-4">
      <span class="stat-highlight__icon" aria-hidden="true">${icon(iconName, { size: 22 })}</span>
      <div class="stack gap-1" style="min-width:0;">
        <p class="eyebrow">${escapeHTML(title)}</p>
        <h3 class="stat-highlight__name">${escapeHTML(name)}</h3>
        <p class="text-sm text-muted">${escapeHTML(meta)}</p>
      </div>
    </div>
  `;
}

function barRowHTML(label, pct, count, modifierClass = "") {
  return `
    <div class="stat-bar-row">
      <div class="stat-bar-row__label">
        <span>${escapeHTML(label)}</span>
        <span class="text-muted font-mono">${count} &middot; ${pct}%</span>
      </div>
      <div class="stat-bar-track">
        <div class="stat-bar-fill ${modifierClass}" style="width:${pct}%;"></div>
      </div>
    </div>
  `;
}

function orientationSectionHTML(stats) {
  return `
    <div class="card stack gap-3">
      <p class="eyebrow">Orientasi Kartu</p>
      ${barRowHTML("Upright", stats.uprightPct, stats.uprightCount)}
      ${barRowHTML("Reversed", stats.reversedPct, stats.reversedCount, "stat-bar-fill--reversed")}
    </div>
  `;
}

function suitSectionHTML(stats) {
  if (!stats.suitBreakdown.length) return "";
  return `
    <div class="card stack gap-3">
      <p class="eyebrow">Frekuensi Suit</p>
      <div class="stat-bar-list">
        ${stats.suitBreakdown.map((s) => barRowHTML(s.label, s.pct, s.count)).join("")}
      </div>
    </div>
  `;
}

function topCardsSectionHTML(stats) {
  if (stats.topCards.length < 2) return "";
  // Cuma ditampilkan kalau ada minimal 2 kartu berbeda -- kalau cuma 1
  // kartu unik yang pernah ditarik, "Most Drawn Card" di grid highlight di
  // atas sudah cukup, daftar top 5 jadi berisi 1 baris yang mengulang info
  // yang sama persis.
  const max = stats.topCards[0].count;
  return `
    <div class="card stack gap-3">
      <p class="eyebrow">Kartu Paling Sering Ditarik</p>
      <div class="stat-bar-list">
        ${stats.topCards
          .map((c) => barRowHTML(c.name, Math.round((c.count / max) * 100), c.count))
          .join("")}
      </div>
    </div>
  `;
}

function template(stats) {
  if (!stats.totalReadings) {
    return `
      <section class="stack gap-5">
        <div>
          <p class="eyebrow">Statistics</p>
          <h1 class="font-display">Statistik Personal</h1>
        </div>
        ${emptyStateHTML({
          title: "Belum ada data untuk dianalisis",
          message: "Statistik akan muncul otomatis setelah kamu menyimpan reading pertamamu.",
          actionLabel: "Mulai Reading",
          actionHref: "#/reading",
        })}
      </section>
    `;
  }

  return `
    <section class="stack gap-5">
      <div>
        <p class="eyebrow">Statistics</p>
        <h1 class="font-display">Statistik Personal</h1>
        <p class="text-sm text-muted">Dihitung dari ${stats.totalReadings} reading tersimpan.</p>
      </div>

      <div class="grid-cards" style="grid-template-columns:repeat(auto-fill,minmax(140px,1fr));">
        ${statCardHTML(stats.totalReadings, "Total Readings")}
        ${statCardHTML(stats.cardsDrawn, "Cards Drawn")}
        ${statCardHTML(`${stats.readingStreak} hari`, "Reading Streak")}
        ${statCardHTML(`${stats.uprightPct}%`, "Upright")}
        ${statCardHTML(`${stats.reversedPct}%`, "Reversed")}
      </div>

      <div class="grid-cards" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr));">
        ${
          stats.mostDrawnCard
            ? highlightCardHTML({
                iconName: "cards",
                title: "Most Drawn Card",
                name: stats.mostDrawnCard.name,
                meta: `Ditarik ${stats.mostDrawnCard.count}x`,
              })
            : ""
        }
        ${
          stats.favoriteSpread
            ? highlightCardHTML({
                iconName: "sparkle",
                title: "Favorite Spread",
                name: stats.favoriteSpread.name,
                meta: `Dipakai ${stats.favoriteSpread.count}x`,
              })
            : ""
        }
        ${
          stats.mostFrequentSuit
            ? highlightCardHTML({
                iconName: "star",
                title: "Most Frequent Suit",
                name: stats.mostFrequentSuit.label,
                meta: `${stats.mostFrequentSuit.count} kartu`,
              })
            : ""
        }
      </div>

      ${orientationSectionHTML(stats)}
      ${suitSectionHTML(stats)}
      ${topCardsSectionHTML(stats)}
    </section>
  `;
}

export default {
  async render(container) {
    // Sama seperti history.js/daily.js: getStatistics() bisa berupa network
    // call di jalur cloud (listReadings() -> Supabase), jadi tampilkan
    // spinner dulu supaya halaman tidak kosong selama menunggu.
    container.innerHTML = `<div class="row" style="justify-content:center; padding:var(--space-8) 0;"><span class="spinner" aria-label="Memuat"></span></div>`;

    let stats;
    try {
      stats = await getStatistics();
    } catch (err) {
      console.error("[statistics] gagal memuat statistik", err);
      showToast("Gagal memuat statistik.", "danger");
      container.innerHTML = `
        <section class="stack gap-5">
          <div>
            <p class="eyebrow">Statistics</p>
            <h1 class="font-display">Statistik Personal</h1>
          </div>
          ${emptyStateHTML({
            title: "Gagal memuat statistik",
            message: "Terjadi kesalahan saat mengambil riwayat reading. Coba muat ulang halaman ini.",
          })}
        </section>
      `;
      return;
    }

    container.innerHTML = template(stats);
  },
};
