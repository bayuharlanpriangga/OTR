// OTR — Service: Settings (Phase 14 — Cloud Sync, Roadmap Phase 14)
// Roadmap Phase 14 "Important": "Supabase menjadi source of truth untuk
// authenticated users. LocalStorage menjadi: Cache, Guest Storage, Temporary
// State." Beda dari reading-service.js/journal-service.js (pilih SATU
// backend per panggilan), settings SELALU dibaca dari localStorage dulu
// (getSettings() di core/storage.js, dipakai app.js buat menerapkan
// data-reduced-motion SEBELUM paint pertama -- tidak boleh nunggu network).
// Modul ini menambahkan lapisan sinkronisasi DI ATAS itu:
//   - syncFromCloud(userId): dipanggil sekali setelah login/restore session.
//     Cloud ada isinya -> tarik ke cache lokal (device lain jadi ikut sama).
//     Cloud masih kosong (akun ini belum pernah punya baris user_settings)
//     -> baris cloud dibuat dengan DEFAULT_SETTINGS, BUKAN dari cache lokal
//     yang kebetulan lagi nyangkut di localStorage.
//   - saveSettings(partial, user): selalu tulis ke cache lokal dulu (instan,
//     UI tidak pernah menunggu network buat berubah), BARU kalau ada user
//     login, upsert ke cloud juga. Kegagalan upsert cloud TIDAK membatalkan
//     perubahan lokal (sama seperti pola toleransi error migration-service.js)
//     -- toggle tetap terasa responsif, cuma belum ke-sync ke device lain.
//
// Perbaikan pasca-Phase 14 (ditemukan lewat feedback Orias): versi awal
// syncFromCloud() meng-upload cache lokal APA ADANYA sebagai settings awal
// akun begitu tidak ada baris cloud. Itu salah -- localStorage adalah state
// per-DEVICE/BROWSER, bukan per-akun, jadi kalau device yang sama dipakai
// gantian oleh beberapa akun (mis. Login A -> Logout -> Login B, keduanya
// belum pernah menyentuh Settings), preferensi A "kebawa maksa" ke akun B
// cuma karena kebetulan masih nyangkut di localStorage. Setiap akun harus
// jadi ruang bersih terpisah -- akun yang belum pernah set preferensi apa
// pun HARUS mulai dari DEFAULT_SETTINGS aplikasi, bukan dari sisa sesi
// device sebelumnya (siapa pun pemiliknya). Trade-off yang diterima: user
// yang set Reduced Motion sebagai TAMU lalu langsung Daftar tidak lagi
// otomatis membawa preferensi itu ke akun barunya (beda dari Guest Migration
// reading/journal yang memang secara eksplisit "mengklaim" data tamu) --
// tapi Settings BUKAN "data milik seseorang" seperti reading, jadi tidak
// pantas ikut aturan migrasi yang sama.

import { getSettings as getLocalSettings, saveSettings as saveLocalSettings } from "../core/storage.js";
import { getSupabaseClient } from "../integrations/supabase.js";

/** Sumber tunggal nilai default -- SAMA PERSIS dengan DEFAULT_SETTINGS di
 *  core/storage.js (duplikasi kecil yang disengaja: storage.js tidak
 *  meng-export konstanta itu, dan menambah 1 export baru cuma untuk 1
 *  angka ini dianggap lebih berisiko salah pakai daripada menuliskannya
 *  ulang di sini -- kalau storage.js menambah field settings baru nanti,
 *  DEFAULT_SETTINGS di sini WAJIB ikut diperbarui). */
const DEFAULT_SETTINGS = { reducedMotion: false };

/** Re-export supaya pemanggil (settings.js) cukup import satu modul ini. */
export function getSettings() {
  return getLocalSettings();
}

/** Terapkan `data-reduced-motion` ke <html> dari objek settings yang sudah
 *  ada (lokal maupun hasil sync cloud) -- dipakai app.js (boot) & settings.js
 *  (habis toggle berubah / habis syncFromCloud() menemukan nilai lain). */
export function applyMotionPreference(settings) {
  document.documentElement.dataset.reducedMotion = String(Boolean(settings.reducedMotion));
}

function mapCloudRow(row) {
  return { reducedMotion: Boolean(row.reduced_motion) };
}

/**
 * @param {string} userId
 * @returns {Promise<{settings: object, changed: boolean}>} changed=true kalau
 *  cache lokal ikut berubah (dipakai pemanggil buat memutuskan perlu
 *  re-render toggle / re-apply motion preference atau tidak).
 */
export async function syncFromCloud(userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[settings-service] gagal menarik settings dari cloud", error);
    return { settings: getLocalSettings(), changed: false };
  }

  if (data) {
    const cloudSettings = mapCloudRow(data);
    const before = getLocalSettings();
    const merged = saveLocalSettings(cloudSettings);
    return { settings: merged, changed: before.reducedMotion !== merged.reducedMotion };
  }

  // Belum ada baris cloud sama sekali untuk akun ini -- akun ini "ruang
  // bersih", MULAI dari DEFAULT_SETTINGS (bukan cache lokal yang mungkin
  // sisa akun lain di device yang sama). Cache lokal ditimpa juga supaya
  // konsisten dengan apa yang baru saja ditulis ke cloud.
  const before = getLocalSettings();
  const merged = saveLocalSettings(DEFAULT_SETTINGS);
  const { error: upsertError } = await supabase
    .from("user_settings")
    .upsert({ user_id: userId, reduced_motion: Boolean(merged.reducedMotion) });
  if (upsertError) {
    console.warn("[settings-service] gagal membuat baris settings cloud awal", upsertError);
  }
  return { settings: merged, changed: before.reducedMotion !== merged.reducedMotion };
}

/**
 * @param {object} partial
 * @param {object|null} user state.user saat ini (null = guest, tidak upsert cloud)
 * @returns {Promise<object>} settings gabungan (selalu berhasil secara lokal)
 */
export async function saveSettings(partial, user) {
  const merged = saveLocalSettings(partial);

  if (user?.id) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("user_settings")
      .upsert({ user_id: user.id, reduced_motion: Boolean(merged.reducedMotion), updated_at: new Date().toISOString() });
    if (error) {
      console.warn("[settings-service] gagal menyinkronkan settings ke cloud", error);
    }
  }

  return merged;
}
