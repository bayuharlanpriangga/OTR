// OTR — Utils

export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

export function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

export function createEl(tag, props = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (key === "class") el.className = value;
    else if (key === "html") el.innerHTML = value;
    else if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value !== undefined && value !== null) {
      el.setAttribute(key, value);
    }
  });
  children.forEach((child) => {
    if (child == null) return;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  });
  return el;
}

export function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function formatDate(dateLike, locale = "id-ID") {
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  return d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

export function debounce(fn, wait = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/** Gabungan preferensi OS (`prefers-reduced-motion` media query) DAN toggle
 *  manual di Settings (Phase 8) — mana pun yang aktif, dianggap "kurangi
 *  animasi". Toggle manual diterapkan lewat atribut `data-reduced-motion`
 *  di `<html>` (di-set saat boot & saat toggle diubah — lihat app.js &
 *  js/pages/settings.js), yang juga dibaca companion rule di reset.css/
 *  variables.css/reading.css untuk mematikan animasi CSS secara global. */
export function prefersReducedMotion() {
  const osPref = typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const manualPref = typeof document !== "undefined" && document.documentElement.dataset.reducedMotion === "true";
  return Boolean(osPref || manualPref);
}
