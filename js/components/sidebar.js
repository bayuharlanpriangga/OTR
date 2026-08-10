// OTR — Sidebar (desktop nav)

import { NAV_ITEMS, NAV_ITEMS_SECONDARY, APP_NAME } from "../config.js";
import { icon } from "./icons.js";

function navLink({ path, label, icon: iconName }, activePage) {
  const isActive = activePage === path.replace("/", "");
  return `
    <a class="sidebar__link${isActive ? " is-active" : ""}" href="#${path}" aria-current="${isActive ? "page" : "false"}">
      ${icon(iconName, { className: "sidebar__link-icon" })}
      <span class="sidebar__link-label">${label}</span>
    </a>
  `;
}

export function renderSidebar(activePage) {
  return `
    <aside class="sidebar" aria-label="Navigasi utama">
      <div class="sidebar__brand">
        <div class="sidebar__brand-mark" aria-hidden="true"></div>
        <span class="sidebar__brand-name">${APP_NAME}</span>
      </div>
      <nav class="sidebar__nav">
        ${NAV_ITEMS.map((item) => navLink(item, activePage)).join("")}
      </nav>
      <nav class="sidebar__nav">
        ${NAV_ITEMS_SECONDARY.map((item) => navLink(item, activePage)).join("")}
      </nav>
      <div class="sidebar__footer text-sm text-muted">
        ORIAS — Original Asli
      </div>
    </aside>
  `;
}

export function updateSidebarActive(sidebarEl, activePage) {
  sidebarEl.querySelectorAll(".sidebar__link").forEach((link) => {
    const path = link.getAttribute("href").replace("#/", "");
    link.classList.toggle("is-active", path === activePage);
  });
}
