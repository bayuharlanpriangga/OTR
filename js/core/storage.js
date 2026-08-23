// OTR — Storage
// Thin wrapper di atas localStorage. Semua akses localStorage di app
// harus lewat sini supaya Phase 8/12 (local persistence -> Supabase)
// tinggal ganti implementasi tanpa menyentuh pemanggilnya.

import { uid } from "./utils.js";

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
  // Phase 15 — Daily Card (ditambahkan belakangan, bukan bagian dari "4
  // storage key" Phase 8 di atas — lihat catatan lengkap di bawah, dekat
  // fungsi-fungsi Daily Card).
  DAILY: "otr_guest_daily",
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
  const ok = writeJSON(STORAGE_KEYS.READINGS, next);
  // Master Spec §43: `journals.reading_id references readings(id) on delete
  // cascade`. Guest storage tidak punya FK sungguhan, jadi cascade-nya
  // direplikasi manual di sini — kalau tidak, menghapus reading akan
  // menyisakan journal entry yatim yang menunjuk ke reading yang sudah
  // tidak ada (tidak bisa dibuka lagi dari mana pun, termasuk /journal).
  if (ok) {
    const orphanedJournal = getGuestJournalByReadingId(id);
    if (orphanedJournal) deleteGuestJournalEntry(orphanedJournal.id);
  }
  return ok;
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

// ---- Guest Journal (Phase 11 — Journal, Master Spec §25) ----
// Schema per §25: { id, readingId, userId, content, createdAt, updatedAt }.
// userId belum dipakai di guest mode (konsisten dengan reading record dari
// buildSavedReading() di result.js, yang juga tidak menyimpan userId untuk
// guest — lihat Phase 8). "One reading may have one journal entry in MVP"
// (§25) berarti kunci upsert-nya readingId, BUKAN journal.id sendiri.

export function listGuestJournalEntries() {
  return readJSON(STORAGE_KEYS.JOURNAL, []) ?? [];
}

export function saveGuestJournalEntries(entries) {
  return writeJSON(STORAGE_KEYS.JOURNAL, entries);
}

export function getGuestJournalByReadingId(readingId) {
  return listGuestJournalEntries().find((j) => j.readingId === readingId) ?? null;
}

/** Upsert by readingId (bukan by journal.id) — 1 reading = 1 journal entry
 *  di MVP (§25). Entry lama (kalau ada) di-update content+updatedAt, id &
 *  createdAt aslinya dipertahankan; entry baru dapat id dari uid("journal"). */
export function saveGuestJournalEntry({ readingId, content }) {
  const all = listGuestJournalEntries();
  const idx = all.findIndex((j) => j.readingId === readingId);
  const now = new Date().toISOString();

  if (idx >= 0) {
    all[idx] = { ...all[idx], content, updatedAt: now };
  } else {
    all.unshift({ id: uid("journal"), readingId, content, createdAt: now, updatedAt: now });
  }

  return writeJSON(STORAGE_KEYS.JOURNAL, all) ? getGuestJournalByReadingId(readingId) : null;
}

export function deleteGuestJournalEntry(id) {
  const all = listGuestJournalEntries();
  const next = all.filter((j) => j.id !== id);
  if (next.length === all.length) return false;
  return writeJSON(STORAGE_KEYS.JOURNAL, next);
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

// ==========================================================================
// Phase 15 — Daily Card (Roadmap Phase 15, Master Spec §27/§28)
// Guest storage kartu harian, sengaja TERPISAH dari STORAGE_KEYS.READINGS
// (§28: "History should store daily card readings separately from normal
// readings"). Upsert by `date` (bukan array append-only seperti readings) —
// paling banyak 1 baris per tanggal per definisi fitur ("satu Daily Card
// per hari").
// ==========================================================================

export function listGuestDailyCards() {
  return readJSON(STORAGE_KEYS.DAILY, []) ?? [];
}

export function getGuestDailyCardByDate(date) {
  return listGuestDailyCards().find((d) => d.date === date) ?? null;
}

/** Upsert berdasarkan `record.date`. */
export function saveGuestDailyCard(record) {
  const all = listGuestDailyCards();
  const idx = all.findIndex((d) => d.date === record.date);
  if (idx >= 0) all[idx] = record;
  else all.unshift(record);
  return writeJSON(STORAGE_KEYS.DAILY, all);
}

// ---- Guest device id (bukan salah satu dari "4 storage key" Phase 8) ----
// otr_guest_id adalah id acak yang dibuat SEKALI per device/browser, dipakai
// SEMATA-MATA sebagai `seedId` deterministik di js/tarot/daily-card.js
// (bagian "userId" dari algoritma Master Spec §27) — supaya guest juga
// dapat kartu harian yang personal per device (bukan satu kartu global yang
// sama untuk semua tamu di seluruh dunia), tanpa perlu bikin akun. Ini
// BUKAN identitas user sungguhan, tidak pernah dikirim ke Supabase, dan
// tidak ikut Guest Migration (Phase 13) — konsisten dengan keputusan
// migration-service.js yang juga sengaja tidak menyentuh otr_settings/
// otr_favorites saat migrasi.
const GUEST_ID_KEY = "otr_guest_id";

export function getOrCreateGuestId() {
  let id = readJSON(GUEST_ID_KEY, null);
  if (!id) {
    id = uid("guest");
    writeJSON(GUEST_ID_KEY, id);
  }
  return id;
}
