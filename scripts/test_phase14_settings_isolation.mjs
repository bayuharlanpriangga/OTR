// OTR — Dev-only test (post-Phase 14 fix): pastikan syncFromCloud() TIDAK
// lagi "memaksa" cache lokal (sisa akun lain di device yang sama) masuk
// jadi settings awal akun yang belum punya baris cloud.
//
// Pakai MOCK js/integrations/supabase.js sementara (dikembalikan otomatis
// oleh caller shell command setelah test ini selesai) -- sama pola dengan
// runtime test Phase 13 yang dicatat di PROJECT_STATUS.md.
//
// Jalankan: node scripts/test_phase14_settings_isolation.mjs

import { JSDOM } from "jsdom";

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

async function main() {
  const { saveSettings: saveLocal } = await import("../js/core/storage.js");
  const { syncFromCloud, getSettings } = await import("../js/services/settings-service.js");

  // ---- Skenario yang dilaporkan: Login A (localStorage jadi reducedMotion
  // true, entah lewat toggle A atau sisa sesi tamu sebelumnya) -> Logout ->
  // Login B, akun B BELUM PERNAH punya baris user_settings sama sekali. ----
  saveLocal({ reducedMotion: true });
  assert(getSettings().reducedMotion === true, "setup: cache lokal reducedMotion=true sebelum sync akun B");

  const USER_A = "user-aaaa";
  const USER_B = "user-bbbb";

  // Akun A sync duluan (baris cloud A belum ada -> dibuat dari DEFAULT, BUKAN
  // dari cache true yang kebetulan nyangkut) -- ini juga membuktikan fix-nya
  // berlaku bahkan untuk akun PERTAMA yang sync, bukan cuma akun kedua.
  const resultA = await syncFromCloud(USER_A);
  assert(resultA.settings.reducedMotion === false, "akun A: baris cloud baru dibuat dengan DEFAULT (false), bukan cache lokal (true)");
  assert(getSettings().reducedMotion === false, "cache lokal ikut ditimpa ke default setelah sync akun A");

  // Simulasikan A sengaja MENGAKTIFKAN reduced motion dari device ini.
  saveLocal({ reducedMotion: true });
  const mod = globalThis.__mockUserSettingsRows;
  const rowA = mod.find((r) => r.user_id === USER_A);
  rowA.reduced_motion = true; // simulasikan saveSettings(..., userA) sudah pernah dipanggil

  // ---- Logout (tidak ada API khusus -- cache lokal TETAP true, device-level,
  // tidak otomatis dibersihkan saat logout, sesuai desain "cache") ----
  assert(getSettings().reducedMotion === true, "cache lokal masih true setelah 'logout' (localStorage device-level)");

  // ---- Login akun B: baris cloud B belum ada sama sekali. Sebelum fix, ini
  // akan meng-upload cache lokal (true, MILIK A) sebagai settings awal B.
  // Sesudah fix, B harus mulai dari DEFAULT, bukan warisan A. ----
  const resultB = await syncFromCloud(USER_B);
  assert(resultB.settings.reducedMotion === false, "akun B (belum pernah sync): dapat DEFAULT (false), TIDAK mewarisi true milik A");
  assert(getSettings().reducedMotion === false, "cache lokal berubah jadi false milik B, bukan lagi true sisa A");

  const rowB = mod.find((r) => r.user_id === USER_B);
  assert(Boolean(rowB), "baris cloud user_settings untuk B benar-benar dibuat");
  assert(rowB.reduced_motion === false, "baris cloud B tersimpan false (default), bukan true");

  // ---- Login ULANG ke akun A: sekarang A SUDAH punya baris cloud (true) --
  // harus dapat nilai TRUE miliknya sendiri, bukan default/bukan sisa B. ----
  const resultA2 = await syncFromCloud(USER_A);
  assert(resultA2.settings.reducedMotion === true, "login ulang akun A: dapat true milik A sendiri (bukan default, bukan sisa B)");
  assert(getSettings().reducedMotion === true, "cache lokal balik ke true milik A setelah sync ulang");

  console.log(`\n${failures === 0 ? "SEMUA LULUS" : `${failures} GAGAL`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Test crash:", err);
  process.exit(1);
});
