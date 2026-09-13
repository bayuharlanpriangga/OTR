// OTR — Service Worker: Strategy (Phase 24 — PWA, Roadmap Phase 24)
// ---------------------------------------------------------------------------
// Logic MURNI (nol dependency ke `self`/`caches`/`fetch` milik
// ServiceWorkerGlobalScope) dipisah dari `service-worker.js` (runtime),
// pola PERSIS sama dengan `supabase/functions/ai-reading-synthesis/prompt.js`
// (Phase 22) -- dipisah supaya testable lewat `node` biasa
// (scripts/test_phase24_pwa.mjs), karena `service-worker.js` sendiri cuma
// bisa benar-benar dijalankan di dalam service worker context browser.
//
// TEMUAN PENTING sesi ini (lihat PROJECT_STATUS.md Completed Phase 24):
// `js/app.js` (dimuat EAGER, bukan lazy `import()`) meng-import
// `settings-service.js` & `auth-service.js`, yang KEDUANYA meng-import
// `js/integrations/supabase.js` -> yang itu meng-import
// `@supabase/supabase-js` dari CDN `esm.sh` lewat import map di index.html.
// Artinya app TIDAK BISA BOOT SAMA SEKALI secara offline -- termasuk untuk
// 3 flow yang Roadmap Phase 24 WAJIBKAN offline (Tarot Library, Tarot
// Engine, Guest Reading) -- kecuali modul CDN itu juga ter-cache.
// RUNTIME_CACHE_HOSTS di bawah ini SENGAJA menyertakan "esm.sh" karena
// alasan ini, bukan cuma buat Google Fonts. Merestrukturisasi app.js
// supaya betul-betul lazy (di luar scope Phase 24 -- itu perubahan
// arsitektur besar ke SEMUA halaman, bukan cuma PWA plumbing) TIDAK
// dilakukan sesi ini; didokumentasikan sebagai keputusan scope eksplisit.
// ---------------------------------------------------------------------------

// Daftar aset app shell yang di-precache saat service worker `install`.
// PENTING -- TIDAK ADA build step/bundler di proyek ini (Master Spec §4),
// jadi daftar ini di-maintain MANUAL. Kalau nambah file .js/.css baru ke
// `js/`, `css/`, atau `data/`, WAJIB ditambahkan juga ke sini, ATAU halaman
// yang memakainya akan gagal dimuat saat offline (fallback fetch-and-cache
// di `service-worker.js` cuma menyelamatkan kasus "online tapi belum
// pernah dibuka", BUKAN kasus "offline sejak awal & belum pernah singgah
// ke halaman itu sama sekali").
export const APP_SHELL_URLS = [
  "./",
  "index.html",
  "manifest.json",
  "icons/icon.svg",

  "css/animations.css",
  "css/components.css",
  "css/daily.css",
  "css/dashboard.css",
  "css/journal.css",
  "css/layout.css",
  "css/library.css",
  "css/pwa.css",
  "css/reading.css",
  "css/reset.css",
  "css/responsive.css",
  "css/tarot-card.css",
  "css/typography.css",
  "css/variables.css",

  "data/default-spreads.js",
  "data/quiz-questions.js",
  "data/tarot-cards.js",
  "data/tarot-keywords.js",

  "js/app.js",
  "js/config.js",
  "js/router.js",

  "js/components/app-shell.js",
  "js/components/bottom-nav.js",
  "js/components/button.js",
  "js/components/empty-state.js",
  "js/components/icons.js",
  "js/components/install-prompt.js",
  "js/components/journal-editor.js",
  "js/components/modal.js",
  "js/components/sidebar.js",
  "js/components/tarot-card.js",
  "js/components/toast.js",

  "js/core/event-bus.js",
  "js/core/state.js",
  "js/core/storage.js",
  "js/core/utils.js",

  "js/integrations/supabase.js",

  "js/pages/card-detail.js",
  "js/pages/custom-spreads.js",
  "js/pages/daily.js",
  "js/pages/forgot-password.js",
  "js/pages/history-detail.js",
  "js/pages/history.js",
  "js/pages/home.js",
  "js/pages/journal.js",
  "js/pages/learn.js",
  "js/pages/library.js",
  "js/pages/login.js",
  "js/pages/profile.js",
  "js/pages/quiz.js",
  "js/pages/reading.js",
  "js/pages/register.js",
  "js/pages/result.js",
  "js/pages/settings.js",
  "js/pages/statistics.js",

  "js/pwa/sw-strategy.js",

  "js/services/ai-service.js",
  "js/services/auth-service.js",
  "js/services/custom-spread-service.js",
  "js/services/daily-service.js",
  "js/services/favorite-service.js",
  "js/services/journal-service.js",
  "js/services/migration-service.js",
  "js/services/profile-service.js",
  "js/services/quiz-service.js",
  "js/services/reading-service.js",
  "js/services/settings-service.js",
  "js/services/statistics-service.js",

  "js/tarot/daily-card.js",
  "js/tarot/deck.js",
  "js/tarot/draw.js",
  "js/tarot/interpretation.js",
  "js/tarot/orientation.js",
  "js/tarot/quiz-engine.js",
  "js/tarot/shuffle.js",
  "js/tarot/spreads.js",
  "js/tarot/tarot-engine.js",
];

// Host cross-origin yang BOLEH di-runtime-cache (cache-first setelah
// permintaan pertama sukses). "esm.sh" WAJIB ada di sini -- lihat catatan
// panjang di atas. Dua host Google Fonts supaya tipografi juga tetap benar
// saat offline (bukan fallback ke font sistem yang terlihat "rusak").
// Supabase project API TIDAK PERNAH masuk daftar ini -- lihat
// shouldHandleRequest() di bawah untuk alasannya.
export const RUNTIME_CACHE_HOSTS = ["esm.sh", "fonts.googleapis.com", "fonts.gstatic.com"];

/** @param {string} urlString @returns {boolean} */
export function isRuntimeCacheableCrossOrigin(urlString) {
  try {
    const { hostname } = new URL(urlString);
    return RUNTIME_CACHE_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}

/**
 * Tentukan apakah service worker WAJIB menangani (respondWith) request ini.
 * `false` berarti request dibiarkan lewat APA ADANYA ke network, tanpa
 * campur tangan cache sama sekali -- ini SENGAJA jalur untuk SEMUA
 * pemanggilan Supabase project API (Auth/Cloud Sync/PostgREST/Edge
 * Function AI) supaya "Online required: Auth, Cloud Sync, AI" (Roadmap
 * Phase 24) betul-betul selalu network fresh, tidak pernah kebaca dari
 * cache basi/token lama.
 * @param {{method:string, url:string, mode?:string}} request
 * @param {string} selfOrigin - `self.location.origin` dari service worker
 * @returns {boolean}
 */
export function shouldHandleRequest(request, selfOrigin) {
  if (request.method !== "GET") return false; // POST/PATCH/dst (semua mutasi Supabase) selalu lewat SW tanpa disentuh.

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return false;
  }

  if (url.origin === selfOrigin) return true; // aset app sendiri (app shell, termasuk fallback lazy-loaded module yang belum di-precache).
  return isRuntimeCacheableCrossOrigin(request.url); // esm.sh / Google Fonts saja -- Supabase project API otomatis TIDAK match ini (hostname beda, biasanya `*.supabase.co`).
}

/** @param {{mode?:string}} request */
export function isNavigationRequest(request) {
  return request.mode === "navigate";
}
