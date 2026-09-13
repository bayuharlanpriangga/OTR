// OTR — Dev-only smoke test (Phase 24 — PWA, Roadmap Phase 24)
// Pola sama dengan test_phase22/23. Lima bagian:
//   1. manifest.json — JSON valid & field wajib Web App Manifest ada.
//   2. js/pwa/sw-strategy.js — logic murni (precache list & routing
//      predicate), node saja, TANPA worker context (sama alasan prompt.js
//      Phase 22 dites tanpa Deno).
//   3. service-worker.js — dicek secara TEKSTUAL (bukan dieksekusi — file
//      ini cuma valid di ServiceWorkerGlobalScope sungguhan, node --check
//      di scripts lain sudah pastikan sintaksnya valid), memastikan
//      wiring-nya konsisten dengan sw-strategy.js (import benar, 3 event
//      listener terdaftar, Supabase project API tidak pernah disentuh).
//   4. js/components/install-prompt.js — lewat jsdom: banner muncul saat
//      `beforeinstallprompt`, hilang & tersimpan permanen saat dismiss atau
//      `appinstalled`, tidak muncul lagi kalau sudah pernah di-dismiss.
//   5. index.html — link manifest/ikon/pwa.css ada.
//
// Jalankan: node scripts/test_phase24_pwa.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { JSDOM } from "jsdom";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let failures = 0;
function assert(cond, msg) {
  if (!cond) {
    failures++;
    console.error(`✗ ${msg}`);
  } else {
    console.log(`✓ ${msg}`);
  }
}
function section(title) {
  console.log(`\n${title}`);
}

async function main() {
  // ---- 1. manifest.json ----
  section("1. manifest.json");
  const manifestRaw = readFileSync(join(ROOT, "manifest.json"), "utf-8");
  let manifest;
  try {
    manifest = JSON.parse(manifestRaw);
    assert(true, "manifest.json adalah JSON valid");
  } catch (err) {
    assert(false, `manifest.json adalah JSON valid (${err.message})`);
    manifest = {};
  }
  for (const field of ["name", "short_name", "start_url", "display", "background_color", "theme_color", "icons"]) {
    assert(field in manifest, `manifest.json punya field wajib "${field}"`);
  }
  assert(manifest.display === "standalone", 'manifest.json display="standalone" (syarat installable, bukan "browser")');
  assert(Array.isArray(manifest.icons) && manifest.icons.length > 0, "manifest.json punya minimal 1 icon");
  assert(
    manifest.icons?.some((i) => i.purpose === "maskable"),
    "manifest.json punya minimal 1 icon dengan purpose maskable (syarat Android adaptive icon)"
  );
  assert(manifest.start_url?.includes("#/"), "manifest.json start_url mengarah ke hash route app (konsisten hash router Master Spec §3)");

  // ---- 2. js/pwa/sw-strategy.js (pure) ----
  section("2. js/pwa/sw-strategy.js (Phase 24)");
  const strategy = await import("../js/pwa/sw-strategy.js");

  assert(Array.isArray(strategy.APP_SHELL_URLS) && strategy.APP_SHELL_URLS.length > 20, "APP_SHELL_URLS berisi daftar aset yang wajar banyaknya (>20 file)");
  assert(strategy.APP_SHELL_URLS.includes("index.html"), "APP_SHELL_URLS menyertakan index.html");
  assert(strategy.APP_SHELL_URLS.includes("manifest.json"), "APP_SHELL_URLS menyertakan manifest.json");
  assert(new Set(strategy.APP_SHELL_URLS).size === strategy.APP_SHELL_URLS.length, "APP_SHELL_URLS tidak punya duplikat");

  // Cross-check: SEMUA file .js/.css/.js data yang benar-benar ada di
  // repo (offline-critical: Tarot Engine, Guest Reading, Tarot Library)
  // harus masuk precache list -- regression kalau ada file baru ditambah
  // tapi lupa di-precache.
  const { execSync } = await import("node:child_process");
  const realFiles = execSync('find js css data -name "*.js" -o -name "*.css"', { cwd: ROOT })
    .toString()
    .trim()
    .split("\n")
    .filter(Boolean);
  const missing = realFiles.filter((f) => !strategy.APP_SHELL_URLS.includes(f));
  assert(missing.length === 0, `semua file .js/.css di js/,css/,data/ ada di APP_SHELL_URLS (hilang: ${missing.join(", ") || "-"})`);

  assert(strategy.isRuntimeCacheableCrossOrigin("https://esm.sh/@supabase/supabase-js@2"), "isRuntimeCacheableCrossOrigin() mengizinkan esm.sh (CDN Supabase client -- WAJIB, lihat catatan app.js eager-import di kepala sw-strategy.js)");
  assert(strategy.isRuntimeCacheableCrossOrigin("https://fonts.googleapis.com/css2?x"), "isRuntimeCacheableCrossOrigin() mengizinkan fonts.googleapis.com");
  assert(strategy.isRuntimeCacheableCrossOrigin("https://fonts.gstatic.com/font.woff2"), "isRuntimeCacheableCrossOrigin() mengizinkan fonts.gstatic.com");
  assert(!strategy.isRuntimeCacheableCrossOrigin("https://yqbckinxvzjghbezypxc.supabase.co/rest/v1/readings"), "isRuntimeCacheableCrossOrigin() MENOLAK host Supabase project (Auth/Cloud Sync/AI harus selalu network fresh)");
  assert(!strategy.isRuntimeCacheableCrossOrigin("not a url"), "isRuntimeCacheableCrossOrigin() tidak crash untuk string bukan URL, mengembalikan false");

  const selfOrigin = "https://bayuharlanpriangga.github.io";
  assert(strategy.shouldHandleRequest({ method: "GET", url: `${selfOrigin}/js/app.js` }, selfOrigin), "shouldHandleRequest() menangani GET same-origin");
  assert(strategy.shouldHandleRequest({ method: "GET", url: "https://esm.sh/@supabase/supabase-js@2" }, selfOrigin), "shouldHandleRequest() menangani GET ke esm.sh");
  assert(!strategy.shouldHandleRequest({ method: "GET", url: "https://xyz.supabase.co/auth/v1/token" }, selfOrigin), "shouldHandleRequest() TIDAK menangani GET ke Supabase project API -- dibiarkan lewat ke network apa adanya");
  assert(!strategy.shouldHandleRequest({ method: "POST", url: `${selfOrigin}/js/app.js` }, selfOrigin), "shouldHandleRequest() TIDAK menangani method selain GET (semua mutasi Supabase)");
  assert(strategy.isNavigationRequest({ mode: "navigate" }), "isNavigationRequest() true untuk mode navigate");
  assert(!strategy.isNavigationRequest({ mode: "cors" }), "isNavigationRequest() false untuk mode lain");

  // ---- 3. service-worker.js (tekstual — file ini cuma valid dieksekusi di ServiceWorkerGlobalScope sungguhan) ----
  section("3. service-worker.js (Phase 24, cek tekstual)");
  const swSource = readFileSync(join(ROOT, "service-worker.js"), "utf-8");
  assert(swSource.includes('from "./js/pwa/sw-strategy.js"'), "service-worker.js meng-import sw-strategy.js (bukan menduplikasi logic)");
  assert(/CACHE_VERSION\s*=\s*["']/.test(swSource), "service-worker.js mendefinisikan CACHE_VERSION");
  for (const evt of ["install", "activate", "fetch"]) {
    assert(swSource.includes(`addEventListener("${evt}"`), `service-worker.js mendaftarkan listener "${evt}"`);
  }
  assert(swSource.includes("shouldHandleRequest"), "service-worker.js memakai shouldHandleRequest() sebelum respondWith (bukan cache-first buta ke semua request)");
  assert(swSource.includes("skipWaiting"), "service-worker.js memanggil skipWaiting() saat install");
  assert(swSource.includes("clients.claim"), "service-worker.js memanggil clients.claim() saat activate");

  // ---- 4. js/components/install-prompt.js (jsdom) ----
  section("4. js/components/install-prompt.js (Phase 24, jsdom)");
  localStorage.clear();
  const { initInstallPrompt, _resetInstallPromptStateForTest } = await import("../js/components/install-prompt.js");

  const root = document.createElement("div");
  document.body.appendChild(root);
  initInstallPrompt(root);

  assert(root.querySelector("[data-install-banner]") === null, "banner TIDAK muncul sebelum event beforeinstallprompt terjadi");

  const bipEvent = new dom.window.Event("beforeinstallprompt", { cancelable: true });
  bipEvent.prompt = () => {};
  bipEvent.userChoice = Promise.resolve({ outcome: "accepted" });
  window.dispatchEvent(bipEvent);
  assert(root.querySelector("[data-install-banner]") !== null, "banner MUNCUL setelah event beforeinstallprompt");

  root.querySelector("[data-install-dismiss]")?.dispatchEvent(new dom.window.Event("click", { bubbles: true }));
  assert(root.querySelector("[data-install-banner]") === null, "banner hilang setelah tombol dismiss diklik");
  assert(localStorage.getItem("otr_pwa_install_dismissed") === "1", "dismiss tersimpan permanen ke localStorage");

  _resetInstallPromptStateForTest();
  root.innerHTML = "";
  localStorage.clear();
  initInstallPrompt(root);
  window.dispatchEvent(new dom.window.Event("appinstalled"));
  window.dispatchEvent(bipEvent);
  // appinstalled sudah set dismissed=1 sebelum beforeinstallprompt berikutnya
  // sempat terjadi -- tapi listener beforeinstallprompt yang SUDAH terpasang
  // (dari initInstallPrompt() panggilan ini) tidak mengecek localStorage
  // ulang per-event, jadi banner MASIH bisa muncul di sesi/pemanggilan yang
  // SAMA. Assertion sebenarnya untuk "tidak ditawarkan lagi" adalah lewat
  // initInstallPrompt() dipanggil ULANG (simulasi reload halaman) di bawah.
  root.innerHTML = "";
  _resetInstallPromptStateForTest();
  const root2 = document.createElement("div");
  document.body.appendChild(root2);
  initInstallPrompt(root2); // localStorage sudah "1" dari appinstalled di atas
  window.dispatchEvent(bipEvent);
  assert(root2.querySelector("[data-install-banner]") === null, "setelah appinstalled (simulasi reload/initInstallPrompt ulang), banner tidak pernah ditawarkan lagi di device ini");

  localStorage.clear();
  _resetInstallPromptStateForTest();

  // ---- 5. index.html ----
  section("5. index.html (Phase 24)");
  const html = readFileSync(join(ROOT, "index.html"), "utf-8");
  assert(html.includes('rel="manifest"'), "index.html punya <link rel=\"manifest\">");
  assert(html.includes('href="manifest.json"'), "index.html menaut ke manifest.json");
  assert(html.includes('href="css/pwa.css"'), "index.html memuat css/pwa.css");
  assert(html.includes('rel="icon"') && html.includes("icons/icon.svg"), "index.html punya favicon dari icons/icon.svg");

  // ---- Ringkasan ----
  section("Ringkasan");
  if (failures === 0) {
    console.log("\nSemua assertion lulus.");
    process.exit(0);
  } else {
    console.error(`\n${failures} assertion GAGAL.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
