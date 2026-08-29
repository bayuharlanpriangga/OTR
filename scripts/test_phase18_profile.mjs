// OTR — Dev-only smoke test (Phase 18 — Profile)
// Fokus test ini: resolveDisplayName() (auth-service.js) -- fungsi murni
// (objek user/profile in-memory -> string), tidak menyentuh Supabase sama
// sekali (getSupabaseClient() cuma dipanggil lazy di dalam fungsi lain di
// modul yang sama, bukan di top-level import -- lihat komentar di
// integrations/supabase.js), jadi jalan di Node polos tanpa jsdom/mock.
//
// TIDAK menguji getProfile()/updateProfile() (profile-service.js) atau
// getLatestFavoriteEntityId() (favorite-service.js) karena keduanya
// langsung memanggil Supabase/getSupabaseClient() begitu dipanggil (tidak
// ada jalur guest untuk profile-service.js, dan favorite-service.js sudah
// punya jalur guest yang dites test_phase16_favorites.mjs) -- scope test
// ini murni logic baru Phase 18 yang belum ada test-nya sama sekali.
//
// Jalankan: node scripts/test_phase18_profile.mjs

import { resolveDisplayName } from "../js/services/auth-service.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed += 1;
  } else {
    failed += 1;
    console.error(`  FAIL: ${message}`);
  }
}

function section(title) {
  console.log(`\n${title}`);
}

// ---- 1. Prioritas profile.displayName menang atas semuanya -------------

section("1. profile.displayName menang atas user_metadata & email");
{
  const user = { email: "orias@example.com", user_metadata: { display_name: "Nama Lama", full_name: "Nama Google" } };
  const profile = { displayName: "Nama Baru dari Edit Profil" };
  assert(
    resolveDisplayName(user, profile) === "Nama Baru dari Edit Profil",
    `harus pakai profile.displayName, dapat "${resolveDisplayName(user, profile)}"`
  );
}

// ---- 2. Tanpa profile (mis. dipanggil dari Settings) -> fallback metadata --

section("2. Tanpa argumen profile -> fallback ke user_metadata.display_name");
{
  const user = { email: "orias@example.com", user_metadata: { display_name: "Orias" } };
  assert(resolveDisplayName(user) === "Orias", `harus "Orias", dapat "${resolveDisplayName(user)}"`);
}

// ---- 3. profile ada tapi displayName null/kosong -> tetap fallback ------

section("3. profile.displayName null/kosong -> tetap fallback ke metadata");
{
  const user = { email: "orias@example.com", user_metadata: { display_name: "Orias Dari Metadata" } };
  assert(
    resolveDisplayName(user, { displayName: null }) === "Orias Dari Metadata",
    "profile.displayName null harus dilewati, jatuh ke user_metadata"
  );
  assert(
    resolveDisplayName(user, { displayName: "" }) === "Orias Dari Metadata",
    "profile.displayName string kosong harus dilewati juga (falsy)"
  );
}

// ---- 4. Google OAuth: full_name / name, TANPA display_name --------------

section("4. Akun Google (full_name/name, tanpa display_name)");
{
  const withFullName = { email: "orias@gmail.com", user_metadata: { full_name: "Bayu Harlan Priangga" } };
  assert(resolveDisplayName(withFullName) === "Bayu Harlan Priangga", "harus fallback ke full_name");

  const withNameOnly = { email: "orias@gmail.com", user_metadata: { name: "Orias" } };
  assert(resolveDisplayName(withNameOnly) === "Orias", "harus fallback ke name kalau full_name tidak ada");
}

// ---- 5. Tidak ada user_metadata sama sekali -> fallback ke email --------

section("5. Fallback ke bagian sebelum @ di email");
{
  const user = { email: "bayu.harlan@example.com", user_metadata: {} };
  assert(resolveDisplayName(user) === "bayu.harlan", `harus "bayu.harlan", dapat "${resolveDisplayName(user)}"`);

  const userNoMeta = { email: "solo@example.com" };
  assert(resolveDisplayName(userNoMeta) === "solo", "user_metadata undefined sama sekali harus tetap fallback ke email, bukan error");
}

// ---- 6. Tidak ada apa-apa sama sekali -> "Akun" --------------------------

section('6. Fallback terakhir -> "Akun"');
{
  assert(resolveDisplayName({}) === "Akun", 'user tanpa email/metadata harus "Akun"');
  assert(resolveDisplayName(null) === "Akun", 'user null harus tetap "Akun" (tidak throw)');
  assert(resolveDisplayName(undefined, undefined) === "Akun", "user & profile keduanya undefined harus tetap aman");
}

// ---- Ringkasan ------------------------------------------------------------

console.log(`\n${passed}/${passed + failed} assertion lulus.`);
if (failed > 0) {
  console.error(`${failed} assertion GAGAL.`);
  process.exit(1);
}
