// OTR — App Entry Point

import { mountAppShell } from "./components/app-shell.js";
import { initRouter, registerRoute } from "./router.js";
import { initToasts } from "./components/toast.js";
import { getSettings } from "./core/storage.js";

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
}

/** Terapkan preferensi Reduced Motion yang tersimpan (Phase 8) ke <html>
 *  SEBELUM router pertama kali render, supaya companion CSS rule
 *  ([data-reduced-motion="true"] di reset.css/variables.css/reading.css)
 *  aktif sejak paint pertama — bukan cuma habis Settings page dibuka. */
function applyStoredMotionPreference() {
  const { reducedMotion } = getSettings();
  document.documentElement.dataset.reducedMotion = String(Boolean(reducedMotion));
}

function main() {
  applyStoredMotionPreference();

  const root = document.getElementById("app");
  const { contentOutlet } = mountAppShell(root);

  registerRoutes();
  initToasts();
  initRouter(contentOutlet);
}

document.addEventListener("DOMContentLoaded", main);
