// OTR — Component: Install Prompt (Phase 24 — PWA, Roadmap Phase 24)
// ---------------------------------------------------------------------------
// Menangkap event `beforeinstallprompt` (browser Chromium/Android) dan
// menampilkan banner custom, karena browser TIDAK menampilkan UI install
// bawaan apa pun kalau event ini di-`preventDefault()` -- kita yang harus
// sediakan tombolnya sendiri (ini requirement standar Web App Manifest API,
// bukan pilihan gaya).
//
// KETERBATASAN yang didokumentasikan (lihat PROJECT_STATUS.md Known Issues
// Phase 24): Safari/iOS TIDAK PERNAH mengirim `beforeinstallprompt` sama
// sekali (Apple tidak mengimplementasikan event ini) -- di iOS, cara
// install SATU-SATUNYA tetap manual lewat menu Share -> "Add to Home
// Screen", dan TIDAK ADA API untuk mendeteksi/memicu itu dari JavaScript.
// Banner ini karena itu TIDAK PERNAH muncul di iOS -- bukan bug, memang
// tidak ada mekanisme untuk menampilkannya di sana.
// ---------------------------------------------------------------------------

const DISMISS_KEY = "otr_pwa_install_dismissed";

let deferredPrompt = null;

/**
 * @param {Document|HTMLElement} [root] - tempat banner di-mount, default `document.body`
 */
export function initInstallPrompt(root = document.body) {
  if (localStorage.getItem(DISMISS_KEY) === "1") return; // user sudah pernah menutup manual -- jangan tawarkan lagi (per-device, bukan per-sesi).

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    renderBanner(root);
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    removeBanner();
    // Sudah ter-install -> tidak perlu ditawarkan lagi selamanya di device ini.
    localStorage.setItem(DISMISS_KEY, "1");
  });
}

function renderBanner(root) {
  if (root.querySelector("[data-install-banner]")) return; // idempotent -- jangan dobel kalau event beforeinstallprompt sempat fire 2x.

  const el = document.createElement("div");
  el.setAttribute("data-install-banner", "1");
  el.className = "install-banner";
  el.innerHTML = `
    <p class="install-banner__text">Install OTR ke perangkatmu untuk akses lebih cepat &amp; bisa dipakai offline.</p>
    <div class="install-banner__actions">
      <button type="button" class="btn btn--primary install-banner__btn" data-install-accept>Install</button>
      <button type="button" class="btn btn--ghost install-banner__btn" data-install-dismiss aria-label="Tutup">Nanti saja</button>
    </div>
  `;
  root.appendChild(el);

  el.querySelector("[data-install-accept]")?.addEventListener("click", async () => {
    if (!deferredPrompt) {
      removeBanner();
      return;
    }
    // `prompt()` hanya bisa dipanggil SEKALI per event `beforeinstallprompt`
    // -- setelah ini `deferredPrompt` dianggap "terpakai" terlepas dari
    // pilihan user (accept/dismiss di dialog browser), sesuai spec.
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    removeBanner();
  });

  el.querySelector("[data-install-dismiss]")?.addEventListener("click", () => {
    localStorage.setItem(DISMISS_KEY, "1");
    removeBanner();
  });
}

function removeBanner() {
  document.querySelector("[data-install-banner]")?.remove();
}

/** Dipakai HANYA oleh scripts/test_phase24_pwa.mjs untuk reset state module-level antar assertion -- tidak dipanggil dari kode app. */
export function _resetInstallPromptStateForTest() {
  deferredPrompt = null;
  removeBanner();
}
