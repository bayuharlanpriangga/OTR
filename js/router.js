// OTR — Router
// Hash-based router (#/reading, #/library/:cardId, dst). Dipilih karena
// "Deployment: Static hosting compatible" (spec §0) — hash route tidak
// perlu rewrite rule server seperti history-mode routing.
//
// Setiap page module harus export default { render(container, params) }.

import { setState } from "./core/state.js";
import { emit } from "./core/event-bus.js";

const routes = [];

/**
 * @param {string} pattern e.g. "/library/:cardId"
 * @param {() => Promise<{default: {render: Function}}>} loader dynamic import
 */
export function registerRoute(pattern, loader) {
  const paramNames = [];
  const regex = new RegExp(
    "^" +
      pattern
        .split("/")
        .map((segment) => {
          if (segment.startsWith(":")) {
            paramNames.push(segment.slice(1));
            return "([^/]+)";
          }
          return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        })
        .join("/") +
      "$"
  );
  routes.push({ pattern, regex, paramNames, loader });
}

function parseHash() {
  const hash = window.location.hash.replace(/^#/, "") || "/home";
  const [path] = hash.split("?");
  return path === "" || path === "/" ? "/home" : path;
}

function matchRoute(path) {
  for (const route of routes) {
    const match = path.match(route.regex);
    if (match) {
      const params = {};
      route.paramNames.forEach((name, i) => (params[name] = match[i + 1]));
      return { route, params };
    }
  }
  return null;
}

let container = null;
let currentPageModule = null;

export function initRouter(outletEl) {
  container = outletEl;
  window.addEventListener("hashchange", () => renderCurrentRoute());
  renderCurrentRoute();
}

export function navigate(path) {
  window.location.hash = path;
}

async function renderCurrentRoute() {
  const path = parseHash();
  const matched = matchRoute(path);

  if (!matched) {
    renderNotFound(path);
    return;
  }

  const pageName = path.split("/")[1] || "home";
  setState({ currentPage: pageName });
  emit("route:change", { path, pageName });

  container.classList.add("is-loading");
  try {
    const mod = await matched.route.loader();
    currentPageModule?.destroy?.();
    currentPageModule = mod.default;
    container.innerHTML = "";
    currentPageModule.render(container, matched.params);
  } catch (err) {
    console.error("[router] failed to load page", err);
    renderLoadError(path);
  } finally {
    container.classList.remove("is-loading");
  }
}

function renderNotFound(path) {
  container.innerHTML = `
    <div class="empty-state weave">
      <h2>Halaman tidak ditemukan</h2>
      <p class="text-muted">Rute "${path}" belum tersedia.</p>
      <a class="btn btn--secondary" href="#/home">Kembali ke Home</a>
    </div>
  `;
}

function renderLoadError(path) {
  container.innerHTML = `
    <div class="empty-state">
      <h2>Gagal memuat halaman</h2>
      <p class="text-muted">Terjadi kesalahan saat memuat "${path}". Coba muat ulang.</p>
      <button class="btn btn--secondary" onclick="location.reload()">Muat Ulang</button>
    </div>
  `;
}
