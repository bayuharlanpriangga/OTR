// OTR — Global Application State
// State object terpusat & ringan (bukan Redux). Komponen membaca lewat
// getState(), menulis lewat setState(partial) yang men-trigger "state:change".

import { emit } from "./event-bus.js";

// Shape state utama aplikasi (lihat Master Spec §5)
const appState = {
  user: null,

  currentPage: "home",

  reading: {
    id: null,
    spread: null,
    question: "",
    cards: [],
    currentPosition: 0,
    status: "idle", // idle | setup | shuffling | drawing | revealing | interpreting | completed
  },

  ui: {
    sidebarOpen: false,
    modal: null,
    loading: false,
  },
};

export function getState() {
  return appState;
}

/**
 * Shallow-merge partial state at a given top-level key, or at root.
 * @param {Partial<typeof appState>} partial
 */
export function setState(partial) {
  Object.assign(appState, partial);
  emit("state:change", appState);
}

/**
 * Merge into a nested top-level slice, e.g. patchState("reading", { question: "..." })
 * @param {"user"|"currentPage"|"reading"|"ui"} key
 * @param {object} partial
 */
export function patchState(key, partial) {
  appState[key] = { ...appState[key], ...partial };
  emit("state:change", appState);
}

export function resetReading() {
  patchState("reading", {
    id: null,
    spread: null,
    question: "",
    cards: [],
    currentPosition: 0,
    status: "idle",
  });
}
