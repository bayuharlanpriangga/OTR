// OTR — App Entry Point

import { mountAppShell } from "./components/app-shell.js";
import { initRouter, registerRoute } from "./router.js";
import { initToasts } from "./components/toast.js";

function registerRoutes() {
  registerRoute("/home", () => import("./pages/home.js"));
  registerRoute("/reading", () => import("./pages/reading.js"));
  registerRoute("/result", () => import("./pages/result.js"));
  registerRoute("/daily", () => import("./pages/daily.js"));
  registerRoute("/library", () => import("./pages/library.js"));
  registerRoute("/history", () => import("./pages/history.js"));
  registerRoute("/journal", () => import("./pages/journal.js"));
  registerRoute("/statistics", () => import("./pages/statistics.js"));
  registerRoute("/settings", () => import("./pages/settings.js"));
  registerRoute("/profile", () => import("./pages/profile.js"));
}

function main() {
  const root = document.getElementById("app");
  const { contentOutlet } = mountAppShell(root);

  registerRoutes();
  initToasts();
  initRouter(contentOutlet);
}

document.addEventListener("DOMContentLoaded", main);
