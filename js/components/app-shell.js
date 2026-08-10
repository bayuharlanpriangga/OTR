// OTR — App Shell
// Merakit kerangka aplikasi sekali di awal. Router hanya menulis ke
// #app-content — sidebar/topbar/bottom-nav tidak ikut re-render tiap navigasi.

import { renderSidebar, updateSidebarActive } from "./sidebar.js";
import { renderBottomNav, updateBottomNavActive } from "./bottom-nav.js";
import { on } from "../core/event-bus.js";
import { ROUTES } from "../config.js";

function titleFor(pageName) {
  return ROUTES.find((r) => r.path === `/${pageName}`)?.title || "OTR";
}

export function mountAppShell(rootEl) {
  rootEl.innerHTML = `
    <div id="app-shell">
      ${renderSidebar("home")}
      <div class="app-main">
        <header class="topbar">
          <h1 class="topbar__title" id="topbar-title">Home</h1>
          <div class="row gap-3">
            <a class="btn btn--ghost" href="#/settings" aria-label="Pengaturan">Pengaturan</a>
          </div>
        </header>
        <main id="app-content" class="app-content" tabindex="-1"></main>
      </div>
      ${renderBottomNav("home")}
    </div>
    <div id="toast-outlet" class="toast-stack"></div>
    <div id="modal-outlet"></div>
  `;

  const sidebarEl = rootEl.querySelector(".sidebar");
  const bottomNavEl = rootEl.querySelector(".bottom-nav");
  const titleEl = rootEl.querySelector("#topbar-title");

  on("route:change", ({ pageName }) => {
    updateSidebarActive(sidebarEl, pageName);
    updateBottomNavActive(bottomNavEl, pageName);
    titleEl.textContent = titleFor(pageName);
    // Pindahkan fokus ke konten untuk aksesibilitas navigasi keyboard/SR
    document.getElementById("app-content")?.focus();
  });

  return {
    contentOutlet: rootEl.querySelector("#app-content"),
  };
}
