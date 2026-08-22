// OTR — App Entry Point

import { mountAppShell } from "./components/app-shell.js";
import { initRouter, registerRoute } from "./router.js";
import { initToasts } from "./components/toast.js";
import { getSettings } from "./core/storage.js";
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
  const { reducedMotion } = getSettings();
  document.documentElement.dataset.reducedMotion = String(Boolean(reducedMotion));
}

/** Session Persistence (Phase 13, Master Spec §47) — pulihkan sesi Supabase
 *  yang tersimpan (kalau ada) ke state.user, lalu dengarkan perubahan status
 *  auth berikutnya (login di tab lain, token refresh, logout) supaya
 *  state.user selalu ikut sinkron. Dipanggil fire-and-forget (tidak
 *  di-`await` di main()) supaya pemulihan sesi tidak menunda paint pertama
 *  -- halaman yang membaca state.user (mis. settings.js) sudah membacanya
 *  ulang tiap kali di-render lewat router, jadi cukup toleran walau sesi
 *  baru resolve sesaat setelah shell tampil.
 *
 *  TIDAK memanggil migration-service.js dari sini -- Guest Migration cuma
 *  dipicu eksplisit dari login.js/register.js tepat setelah aksi login
 *  (lihat komentar di migration-service.js), bukan dari sini, supaya tidak
 *  ada percobaan migrasi ganda saat sesi lama dipulihkan/token di-refresh.
 */
async function restoreSessionAndSubscribe() {
  try {
    const user = await getCurrentUser();
    setState({ user });
  } catch (err) {
    console.warn("[app] gagal memulihkan sesi Supabase", err);
  }

  try {
    onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null });
    });
  } catch (err) {
    console.warn("[app] gagal mendengarkan perubahan status auth", err);
  }
}

function main() {
  applyStoredMotionPreference();

  const root = document.getElementById("app");
  const { contentOutlet } = mountAppShell(root);

  registerRoutes();
  initToasts();
  initRouter(contentOutlet);
  restoreSessionAndSubscribe();
}

document.addEventListener("DOMContentLoaded", main);
