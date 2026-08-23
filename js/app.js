// OTR — App Entry Point

import { mountAppShell } from "./components/app-shell.js";
import { initRouter, registerRoute, navigate } from "./router.js";
import { initToasts } from "./components/toast.js";
// Phase 14 — Cloud Sync: getSettings tetap baca cache lokal (sinkron, buat
// paint pertama SEBELUM ada sesi manapun dipulihkan) — syncFromCloud dipakai
// terpisah di bawah, SESUDAH sesi user diketahui.
import { getSettings, syncFromCloud, applyMotionPreference } from "./services/settings-service.js";
import { setState } from "./core/state.js";
import { getCurrentUser, onAuthStateChange } from "./services/auth-service.js";

function registerRoutes() {
  registerRoute("/home", () => import("./pages/home.js"));
  registerRoute("/reading", () => import("./pages/reading.js"));
  registerRoute("/result", () => import("./pages/result.js"));
  registerRoute("/daily", () => import("./pages/daily.js"));
  registerRoute("/library", () => import("./pages/library.js"));
  registerRoute("/library/:cardId", () => import("./pages/card-detail.js"));
  registerRoute("/history", () => import("./pages/history.js"));
  registerRoute("/history/:readingId", () => import("./pages/history-detail.js"));
  registerRoute("/journal", () => import("./pages/journal.js"));
  registerRoute("/statistics", () => import("./pages/statistics.js"));
  registerRoute("/settings", () => import("./pages/settings.js"));
  registerRoute("/profile", () => import("./pages/profile.js"));
  // Phase 13 — Authentication (Master Spec §4 "Authentication routes")
  registerRoute("/login", () => import("./pages/login.js"));
  registerRoute("/register", () => import("./pages/register.js"));
  registerRoute("/forgot-password", () => import("./pages/forgot-password.js"));
}

/** Terapkan preferensi Reduced Motion yang tersimpan (Phase 8) ke <html>
 *  SEBELUM router pertama kali render, supaya companion CSS rule
 *  ([data-reduced-motion="true"] di reset.css/variables.css/reading.css)
 *  aktif sejak paint pertama — bukan cuma habis Settings page dibuka. */
function applyStoredMotionPreference() {
  applyMotionPreference(getSettings());
}

/** Session Persistence (Phase 13, Master Spec §47) — pulihkan sesi Supabase
 *  yang tersimpan (kalau ada) ke state.user.
 *
 *  Phase 14: kalau sesi ditemukan, settings cloud ditarik/di-upload SESUDAH
 *  itu (fire-and-forget, tidak menunda apa pun di sini) -- supaya user yang
 *  buka app dengan sesi lama tersimpan (bukan baru saja login lewat
 *  login.js/register.js, yang sudah memanggil ini sendiri) tetap dapat
 *  preferensi terbaru kalau sempat diubah dari device lain. Kegagalan sync
 *  cuma di-log, TIDAK memblokir apa pun -- motion preference dari cache
 *  lokal (applyStoredMotionPreference() di atas) tetap berlaku sampai sync
 *  ini (kalau berhasil & ada bedanya) menimpanya.
 */
async function restoreSession() {
  try {
    const user = await getCurrentUser();
    setState({ user });
    if (user?.id) {
      syncFromCloud(user.id)
        .then(({ settings, changed }) => {
          if (changed) applyMotionPreference(settings);
        })
        .catch((err) => console.warn("[app] gagal menyinkronkan settings dari cloud", err));
    }
  } catch (err) {
    console.warn("[app] gagal memulihkan sesi Supabase", err);
  }
}

/** Dengarkan perubahan status auth berikutnya (login di tab lain, token
 *  refresh, logout, Google OAuth) supaya state.user selalu ikut sinkron.
 *  Dipisah dari restoreSession() (lihat main()) supaya listener didaftarkan
 *  sekali saja, terlepas dari jalur mana restoreSession() dipanggil.
 *
 *  TIDAK memanggil migration-service.js dari sini -- Guest Migration cuma
 *  dipicu eksplisit dari login.js/register.js tepat setelah aksi login
 *  (lihat komentar di migration-service.js), bukan dari sini, supaya tidak
 *  ada percobaan migrasi ganda saat sesi lama dipulihkan/token di-refresh.
 */
function subscribeAuthChanges() {
  try {
    onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null });
    });
  } catch (err) {
    console.warn("[app] gagal mendengarkan perubahan status auth", err);
  }
}

/**
 * True kalau URL hash saat ini adalah fragment yang ditaruh SUPABASE
 * (implicit-flow redirect Google OAuth, atau link reset-password/
 * konfirmasi email), BUKAN hash route app sendiri (selalu diawali "#/").
 *
 * Kenapa perlu: app pakai hash router (Master Spec §3, "static hosting
 * compatible"), dan Supabase JUGA menaruh token di URL hash
 * (#access_token=...&type=signup|recovery) setelah redirect balik dari
 * Google/link email. Dua mekanisme berebut fragment yang sama. Kalau
 * router.js sempat parseHash() token itu duluan, dia dianggap path route
 * tak dikenal -> "Halaman tidak ditemukan" -- padahal Supabase Client
 * (dibuat lewat restoreSession() -> getCurrentUser()) sebenarnya berhasil
 * memproses token itu jadi sesi valid di belakang layar. User kelihatan
 * gagal padahal login-nya sukses.
 */
function hashHasSupabaseAuthParams() {
  return /access_token=|refresh_token=|type=recovery|error_description=/.test(window.location.hash);
}

function main() {
  applyStoredMotionPreference();

  const root = document.getElementById("app");
  const { contentOutlet } = mountAppShell(root);

  registerRoutes();
  initToasts();
  subscribeAuthChanges();

  if (hashHasSupabaseAuthParams()) {
    // Tunda render pertama SAMPAI Supabase selesai konsumsi token di hash,
    // baru arahkan ke Home lewat navigate() -- ini menimpa hash lama dengan
    // "#/home" yang router bisa baca normal. Hanya kejadian di kasus ini
    // (redirect OAuth/reset-password/konfirmasi email) -- kunjungan normal
    // & login email/password biasa tetap fire-and-forget seperti semula,
    // tidak ada delay paint tambahan.
    restoreSession().then(() => {
      navigate("/home");
      initRouter(contentOutlet);
    });
  } else {
    restoreSession(); // fire-and-forget, tidak menunda paint pertama
    initRouter(contentOutlet);
  }
}

document.addEventListener("DOMContentLoaded", main);
