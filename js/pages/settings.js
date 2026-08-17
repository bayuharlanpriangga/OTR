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

function template(settings) {
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

export default {
  render(container) {
    const settings = getSettings();
    container.innerHTML = template(settings);

    container.querySelector("[data-reduced-motion-toggle]")?.addEventListener("change", (e) => {
      const checked = e.target.checked;
      const saved = saveSettings({ reducedMotion: checked });
      document.documentElement.dataset.reducedMotion = String(saved.reducedMotion);
      showToast(checked ? "Reduced motion diaktifkan." : "Reduced motion dimatikan.", "default");
    });
  },
};
