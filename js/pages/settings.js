// OTR — Page: Settings (Phase 8 — Local Storage, Roadmap Phase 8)
// Skeleton sejak Phase 1 cuma nampilin dua baris dengan badge "Segera".
// Fase ini menyambungkan Reduced Motion ke otr_settings (storage.js) —
// satu-satunya toggle yang Roadmap Phase 8 sebut secara eksplisit sebagai
// "Settings" yang harus di-persist. Bahasa tetap "Segera": belum ada
// sistem i18n dibangun di mana pun, di luar scope Phase 8.
//
// Reduced Motion di sini BUKAN cuma nyimpen angka ke localStorage — begitu
// di-toggle, langsung diterapkan live lewat `data-reduced-motion` di
// <html>, yang dibaca:
//   - companion CSS rule di reset.css (safety-net universal: nge-nolin
//     semua animation/transition-duration, mirror dari
//     @media(prefers-reduced-motion:reduce) yang sudah ada sejak Phase 1)
//   - companion CSS rule di variables.css (nol-in token --duration-*)
//   - companion CSS rule di reading.css (matiin reveal beruntun Result Page)
//   - prefersReducedMotion() di core/utils.js (dipakai reading.js buat
//     jeda draw/shuffle)
// jadi nggak perlu reload halaman buat lihat efeknya.

import { getSettings, saveSettings, isAvailable } from "../core/storage.js";
import { showToast } from "../components/toast.js";
import { getState, setState } from "../core/state.js";
import { signOut } from "../services/auth-service.js";
import { icon } from "../components/icons.js";

function escapeHTML(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Phase 13 — Authentication. Status login & tombol Logout ditaruh di sini
// (BUKAN di js/pages/profile.js -- itu skeleton yang sengaja ditandai
// "Phase 18" di komentarnya sendiri, lihat PROJECT_STATUS.md "Next Phase"
// Phase 12).
function accountSectionHTML(user) {
  if (user) {
    const label = user.user_metadata?.display_name || user.email || "Akun";
    return `
      <div class="card stack gap-4">
        <div class="row gap-4" style="justify-content:space-between; align-items:center;">
          <div class="stack gap-1" style="min-width:0;">
            <h3 style="overflow-wrap:anywhere;">${escapeHTML(label)}</h3>
            <p class="text-sm text-muted">Masuk dengan akun ini. Reading & journal-mu tersinkron ke cloud.</p>
          </div>
          <button type="button" class="btn btn--secondary" data-logout-btn>
            ${icon("logout", { size: 16 })} Keluar
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="card stack gap-4">
      <div>
        <h3>Belum Masuk</h3>
        <p class="text-sm text-muted">Reading yang kamu buat sebagai tamu cuma tersimpan di perangkat ini. Masuk atau daftar supaya bisa disinkronkan &amp; diakses dari mana pun.</p>
      </div>
      <div class="row gap-3">
        <a class="btn btn--primary" href="#/login">Masuk</a>
        <a class="btn btn--secondary" href="#/register">Daftar</a>
      </div>
    </div>
  `;
}

function template(settings, user) {
  return `
    <section class="stack gap-5">
      <div>
        <p class="eyebrow">Settings</p>
        <h1 class="font-display">Pengaturan</h1>
      </div>

      ${
        isAvailable()
          ? ""
          : `<p class="text-sm text-muted">Local storage tidak tersedia di browser ini — pengaturan tidak akan tersimpan setelah halaman ditutup.</p>`
      }

      <div data-account-section>${accountSectionHTML(user)}</div>

      <div class="card stack gap-4">
        <div class="row" style="justify-content:space-between;">
          <div>
            <h3>Reduced Motion</h3>
            <p class="text-sm text-muted">Kurangi animasi di seluruh aplikasi (flip kartu, shuffle, reveal, dst).</p>
          </div>
          <label style="display:inline-flex; align-items:center; gap:var(--space-2); cursor:pointer;">
            <input type="checkbox" data-reduced-motion-toggle ${settings.reducedMotion ? "checked" : ""} />
          </label>
        </div>
        <div class="row" style="justify-content:space-between;">
          <div>
            <h3>Bahasa</h3>
            <p class="text-sm text-muted">Indonesia (default)</p>
          </div>
          <span class="badge">Segera</span>
        </div>
      </div>
    </section>
  `;
}

function bindAccountSection(container) {
  container.querySelector("[data-logout-btn]")?.addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    const { error } = await signOut();
    if (error) {
      btn.disabled = false;
      showToast("Gagal keluar. Coba lagi.", "danger");
      return;
    }
    setState({ user: null });
    const section = container.querySelector("[data-account-section]");
    if (section) section.innerHTML = accountSectionHTML(null);
    showToast("Berhasil keluar.", "default");
  });
}

export default {
  render(container) {
    const settings = getSettings();
    const user = getState().user;
    container.innerHTML = template(settings, user);

    bindAccountSection(container);

    container.querySelector("[data-reduced-motion-toggle]")?.addEventListener("change", (e) => {
      const checked = e.target.checked;
      const saved = saveSettings({ reducedMotion: checked });
      document.documentElement.dataset.reducedMotion = String(saved.reducedMotion);
      showToast(checked ? "Reduced motion diaktifkan." : "Reduced motion dimatikan.", "default");
    });
  },
};
