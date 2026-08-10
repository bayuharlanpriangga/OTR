// OTR — Toast
// Dengarkan event "toast:show" dari mana pun (services, pages) dan render
// ke #toast-outlet. Auto-dismiss setelah `duration` ms.

import { on } from "../core/event-bus.js";

const DEFAULT_DURATION = 3200;

function renderToast({ message, variant = "default" }) {
  const outlet = document.getElementById("toast-outlet");
  if (!outlet) return;

  const el = document.createElement("div");
  el.className = `toast${variant !== "default" ? ` toast--${variant}` : ""}`;
  el.setAttribute("role", "status");
  el.textContent = message;
  outlet.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, DEFAULT_DURATION);
}

export function initToasts() {
  on("toast:show", renderToast);
}

/** Shortcut dipakai langsung dari page/service tanpa import event-bus */
export function showToast(message, variant = "default") {
  renderToast({ message, variant });
}
