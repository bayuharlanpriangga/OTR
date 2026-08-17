// OTR — Storage
// Thin wrapper di atas localStorage. Semua akses localStorage di app
// harus lewat sini supaya Phase 8/12 (local persistence -> Supabase)
// tinggal ganti implementasi tanpa menyentuh pemanggilnya.

export function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[storage] failed to read "${key}"`, err);
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[storage] failed to write "${key}"`, err);
    return false;
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[storage] failed to remove "${key}"`, err);
  }
}

export function isAvailable() {
  try {
    const testKey = "__otr_storage_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// ==========================================================================
// Phase 8 — Local Storage (Roadmap Phase 8, Master Spec §48)
// 4 storage key yang ditetapkan Roadmap. Readings dapat CRUD penuh (fokus
// Requirements/DONE WHEN Phase 8: save/reload/reopen/delete). Journal &
// Favorites baru sebatas plumbing generik — UI penuhnya masing-masing di
// Phase 11 & Phase 16, supaya keduanya tinggal bangun di atas ini tanpa
// perlu re-desain storage.
//
// Immutability historical reading (Master Spec §32): saveGuestReading()
// menerima reading yang SUDAH membawa interpretationSnapshot per kartu +
// synthesisSnapshot — dihitung SEKALI oleh pemanggil (js/pages/result.js)
// lewat interpretCard()/synthesizeReading(). storage.js sendiri tidak
// pernah meng-import js/tarot/interpretation.js — begitu tersimpan, yang
// membaca reading lagi (js/pages/history-detail.js) wajib pakai snapshot
// itu apa adanya, bukan menghitung ulang, supaya reading lama tetap sama
// persis walau logic interpretasi berubah di kemudian hari.

export const STORAGE_KEYS = {
  READINGS: "otr_guest_readings",
  JOURNAL: "otr_guest_journal",
  SETTINGS: "otr_settings",
  FAVORITES: "otr_favorites",
};

const DEFAULT_SETTINGS = {
  reducedMotion: false,
};

// ---- Guest Readings ----

/** Terbaru duluan (saveGuestReading menaruh reading baru di depan list). */
export function listGuestReadings() {
  return readJSON(STORAGE_KEYS.READINGS, []) ?? [];
}

export function getGuestReadingById(id) {
  return listGuestReadings().find((r) => r.id === id) ?? null;
}

/** Upsert berdasarkan `reading.id`. */
export function saveGuestReading(reading) {
  const all = listGuestReadings();
  const idx = all.findIndex((r) => r.id === reading.id);
  if (idx >= 0) all[idx] = reading;
  else all.unshift(reading);
  return writeJSON(STORAGE_KEYS.READINGS, all);
}

export function deleteGuestReading(id) {
  const all = listGuestReadings();
  const next = all.filter((r) => r.id !== id);
  if (next.length === all.length) return false; // tidak ada yang dihapus
  return writeJSON(STORAGE_KEYS.READINGS, next);
}

/** Skeleton untuk Phase 16 (Favorites) — sudah bisa dipanggil, belum ada
 *  tombolnya di UI manapun. */
export function setGuestReadingFavorite(id, isFavorite) {
  const all = listGuestReadings();
  const target = all.find((r) => r.id === id);
  if (!target) return false;
  target.isFavorite = Boolean(isFavorite);
  return writeJSON(STORAGE_KEYS.READINGS, all);
}

// ---- Guest Journal (skeleton — CRUD penuh & UI di Phase 11) ----

export function listGuestJournalEntries() {
  return readJSON(STORAGE_KEYS.JOURNAL, []) ?? [];
}

export function saveGuestJournalEntries(entries) {
  return writeJSON(STORAGE_KEYS.JOURNAL, entries);
}

// ---- Settings ----

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...(readJSON(STORAGE_KEYS.SETTINGS, {}) ?? {}) };
}

export function saveSettings(partial) {
  const merged = { ...getSettings(), ...partial };
  writeJSON(STORAGE_KEYS.SETTINGS, merged);
  return merged;
}

// ---- Favorites (entity-based: reading/card/spread) — skeleton, UI di Phase 16 ----

export function listFavorites() {
  return readJSON(STORAGE_KEYS.FAVORITES, []) ?? [];
}

export function saveFavorites(list) {
  return writeJSON(STORAGE_KEYS.FAVORITES, list);
}
