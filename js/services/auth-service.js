// OTR — Service: Auth (Phase 12 — Supabase Foundation, Master Spec §47)
// Cuma primitif Auth (signUp/signIn/signOut/session) yang dibutuhkan Roadmap
// Phase 12 buat membuktikan pipeline Connect -> Authenticate -> ... jalan.
// TIDAK ada UI (Login/Register page, form, dsb) di fase ini — itu scope
// Phase 13 (Authentication) yang eksplisit terpisah di Roadmap. Phase 13
// nanti tinggal import fungsi-fungsi ini, bukan bikin ulang.
//
// MVP auth per §47: Email + Password saja (Google/Apple/Magic Link ditandai
// "Future" di spec, sengaja tidak dikerjakan sekarang). Guest mode (tanpa
// akun sama sekali) sudah ada sejak Phase 8 lewat js/core/storage.js — tidak
// disentuh di sini.
//
// Kenapa file ini yang PERTAMA kali masuk js/services/ (folder ini ada di
// Master Spec §3 sejak awal tapi sengaja tidak pernah dipakai Phase 1-11 —
// lihat PROJECT_STATUS.md): auth adalah satu-satunya concern di app ini
// yang benar-benar lintas halaman & lintas fase (dipakai Phase 12 buat
// verifikasi pipeline, Phase 13 buat Login/Register UI, Phase 14 buat cloud
// sync) — beda dari CRUD reading/journal yang masing-masing sudah punya
// "rumah" jelas di js/core/storage.js. Layer service baru masuk akal di
// sini, bukan proaktif dibuat dari awal untuk semua domain.

import { getSupabaseClient } from "../integrations/supabase.js";
import { SITE_URL } from "../config.js";

/** @returns {Promise<{data: {user: object|null, session: object|null}, error: object|null}>} */
export async function signUpWithEmail(email, password, { displayName } = {}) {
  const supabase = getSupabaseClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      // Tanpa ini, Supabase fallback ke "Site URL" default project (localhost)
      // untuk link konfirmasi di email -- lihat catatan di config.js.
      emailRedirectTo: SITE_URL,
      ...(displayName ? { data: { display_name: displayName } } : {}),
    },
  });
}

/** @returns {Promise<{data: {user: object|null, session: object|null}, error: object|null}>} */
export async function signInWithEmail(email, password) {
  const supabase = getSupabaseClient();
  return supabase.auth.signInWithPassword({ email, password });
}

/**
 * Google OAuth. Master Spec §47 menandai Google/Apple/Magic Link sebagai
 * "Future" TANPA mengikatnya ke nomor phase tertentu di Roadmap (beda dari
 * fitur lain yang eksplisit dijadwalkan Phase 14-27) -- jadi ini ditambah
 * di luar urutan phase, bukan mendahului fase yang sudah dijadwalkan.
 * Provider Google sudah diaktifkan manual di Supabase Dashboard (Orias).
 *
 * signInWithOAuth() by default langsung me-redirect browser ke Google
 * (window.location assign) begitu promise ini resolve tanpa error --
 * TIDAK ada session dikembalikan di sini, beda dari signInWithEmail.
 * Setelah user approve di Google, browser diarahkan balik ke redirectTo
 * (SITE_URL) membawa access_token di URL hash (implicit flow) -- lihat
 * app.js untuk kenapa itu perlu ditangani SEBELUM router baca hash.
 * @returns {Promise<{data: {provider: string, url: string}, error: object|null}>}
 */
export async function signInWithGoogle() {
  const supabase = getSupabaseClient();
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: SITE_URL },
  });
}

/** @returns {Promise<{error: object|null}>} */
export async function signOut() {
  const supabase = getSupabaseClient();
  return supabase.auth.signOut();
}

/** @returns {Promise<{data: {session: object|null}, error: object|null}>} */
export async function getSession() {
  const supabase = getSupabaseClient();
  return supabase.auth.getSession();
}

/** Convenience — null kalau belum login. */
export async function getCurrentUser() {
  const { data } = await getSession();
  return data?.session?.user ?? null;
}

/**
 * Daftarkan listener perubahan status auth (login/logout/token refresh).
 * @param {(event: string, session: object|null) => void} callback
 * @returns {() => void} unsubscribe
 */
export function onAuthStateChange(callback) {
  const supabase = getSupabaseClient();
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}

/**
 * Phase 13 — Authentication (Roadmap Phase 13). Kirim email reset password
 * lewat Supabase Auth (dipakai halaman Forgot Password).
 *
 * redirectTo diisi eksplisit ke SITE_URL supaya link di email tidak fallback
 * ke Site URL default project (localhost) -- bug yang sama dengan signUp
 * di atas. CATATAN: app ini BELUM punya halaman "set new password" terpisah
 * (lihat komentar lama, masih relevan) -- link recovery akan mendarat di
 * SITE_URL dan (lewat detectSessionInUrl bawaan supabase-js) langsung
 * membuat sesi ter-recover, tapi tidak ada UI yang memicu
 * supabase.auth.updateUser({ password }) sesudahnya. Itu scope terpisah,
 * bukan bagian dari fix redirectTo ini.
 * @returns {Promise<{data: object, error: object|null}>}
 */
export async function resetPasswordForEmail(email) {
  const supabase = getSupabaseClient();
  return supabase.auth.resetPasswordForEmail(email, { redirectTo: SITE_URL });
}
