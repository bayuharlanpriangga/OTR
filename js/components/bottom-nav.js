// OTR — Bottom Nav (mobile nav, max 5 item utama)

import { NAV_ITEMS } from "../config.js";
import { icon } from "./icons.js";

export function renderBottomNav(activePage) {
  return `
    <nav class="bottom-nav" aria-label="Navigasi bawah">
      ${NAV_ITEMS.map((item) => {
        const isActive = activePage === item.path.replace("/", "");
        return `
          <a class="bottom-nav__link${isActive ? " is-active" : ""}" href="#${item.path}" aria-current="${isActive ? "page" : "false"}">
            ${icon(item.icon, { size: 20, className: "bottom-nav__link-icon" })}
            <span>${item.label}</span>
          </a>
        `;
      }).join("")}
    </nav>
  `;
}

export function updateBottomNavActive(navEl, activePage) {
  navEl.querySelectorAll(".bottom-nav__link").forEach((link) => {
    const path = link.getAttribute("href").replace("#/", "");
    link.classList.toggle("is-active", path === activePage);
  });
}
