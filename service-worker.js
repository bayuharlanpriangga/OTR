// OTR — Service Worker (Phase 24 — PWA, Roadmap Phase 24)
// ---------------------------------------------------------------------------
// Module Service Worker (didaftarkan dengan {type:"module"} di js/app.js)
// supaya bisa `import` logic murni dari js/pwa/sw-strategy.js -- konsisten
// dengan gaya "pisahkan logic murni dari runtime" yang dipakai
// supabase/functions/ai-reading-synthesis/ (Phase 22). Lihat sw-strategy.js
// untuk penjelasan LENGKAP kenapa esm.sh masuk runtime cache, dan kenapa
// Supabase project API sengaja TIDAK PERNAH disentuh cache di sini.
//
// KETERBATASAN KOMPATIBILITAS yang didokumentasikan (lihat PROJECT_STATUS.md
// Known Issues Phase 24): module service worker BELUM didukung semua
// browser (mis. Firefox baru mendukungnya sejak versi 114, pertengahan
// 2023) -- untuk browser yang tidak dukung, `navigator.serviceWorker
// .register()` di js/app.js akan reject dan di-catch (di-log sebagai
// warning, TIDAK melempar error yang mengganggu bootstrap app) -- app tetap
// jalan normal SELAMA online, cuma tanpa kapabilitas offline/install.
//
// PENTING -- WAJIB dinaikkan (mis. "otr-v2") tiap kali ada perubahan ke
// APP_SHELL_URLS atau isi salah satu file yang di-precache -- tidak ada
// mekanisme cache-busting otomatis (tidak ada hash nama file, proyek ini
// tanpa build step), jadi versi cache manual ini SATU-SATUNYA sinyal bagi
// browser untuk mengunduh ulang & menghapus cache lama (lihat 'activate').
const CACHE_VERSION = "otr-v1";

import { APP_SHELL_URLS, shouldHandleRequest, isNavigationRequest } from "./js/pwa/sw-strategy.js";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      // skipWaiting: versi baru langsung aktif tanpa menunggu semua tab lama
      // ditutup -- trade-off yang wajar untuk app tanpa data offline yang
      // butuh migrasi skema (beda kelas masalah dengan migration SQL
      // Supabase) -- worst case user perlu 1x refresh kalau ada
      // ketidakcocokan sesaat.
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (!shouldHandleRequest(request, self.location.origin)) {
    // TIDAK memanggil respondWith() sama sekali -- request lewat SW tanpa
    // disentuh, langsung ke network apa adanya. Ini jalur Supabase project
    // API (Auth/Cloud Sync/AI Edge Function) & method non-GET.
    return;
  }

  if (isNavigationRequest(request)) {
    // Network-first untuk navigasi (selalu ke index.html — hash router,
    // Master Spec §3) supaya user ONLINE selalu dapat shell TERBARU;
    // fallback ke cache HANYA kalau network gagal (offline).
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put("index.html", clone));
          return response;
        })
        .catch(() => caches.match("index.html"))
    );
    return;
  }

  // Cache-first untuk semua aset statis lain (app shell + runtime cache
  // esm.sh/Google Fonts) -- proyek ini tanpa build step jadi nama file
  // tidak berubah antar versi (lihat CACHE_VERSION di atas untuk cara
  // invalidasi), cache-first paling murah untuk kasus ini.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Simpan ke cache HANYA kalau sukses (`response.ok`) -- fallback
        // fetch-and-cache ini menyelamatkan aset yang belum sempat masuk
        // APP_SHELL_URLS (lihat komentar "WAJIB ditambahkan" di
        // sw-strategy.js) SELAMA request itu terjadi saat online.
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
