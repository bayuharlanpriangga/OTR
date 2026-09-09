// OTR — Spread System
// Master Spec §12 (Spread System) & §13 (Default Spread Catalog). Spread
// tetap data-driven (lihat data/default-spreads.js) — modul ini cuma
// menambahkan helper logic (validasi, lookup posisi) di atas data mentah.
//
// Phase 19 — Custom Spread: ditambah REGISTRY in-memory untuk custom spread
// (lihat blok di bawah). getSpreadById()/resolveSpread()/dst di bawah ini
// dipanggil SINKRON di puluhan tempat (reading-service.js memetakan SETIAP
// baris reading & setiap kali simpan reading baru, migration-service.js,
// result.js, tarot-engine.js#createReading, statistics-service.js) — blast
// radius untuk mengubah SEMUANYA jadi async sekaligus terlalu besar untuk 1
// fase. Solusinya: registry mutable di module-level, diisi SEKALI lewat
// ensureCustomSpreadsLoaded() (async, di-await di titik yang butuh --
// reading-service.js & js/pages/reading.js), lalu getSpreadById() TETAP
// sinkron seperti sebelumnya, cuma sekarang ikut mengecek registry ini di
// samping DEFAULT_SPREADS. Catatan: ini membuat modul ini (dan tarot-engine.js
// yang bergantung padanya) TIDAK LAGI 100% bebas dependency js/core/state.js
// secara transitif (lewat custom-spread-service.js) -- state.js sendiri
// tidak menyentuh DOM, jadi tarot-engine.js tetap bisa dites lewat `node`
// polos seperti sebelumnya, cuma bukan "zero import" lagi seperti komentar
// lama di tarot-engine.js.

import {
  getSpreadById as getSystemSpreadById,
  getAllSpreads,
  getSpreadsByCategory,
} from "../../data/default-spreads.js";
import { listCustomSpreads } from "../services/custom-spread-service.js";
import { getState } from "../core/state.js";

export { getAllSpreads, getSpreadsByCategory };

// ---- Custom Spread Registry (Phase 19) -------------------------------

let customSpreadRegistry = new Map();
let loadedForKey; // userId yang registry-nya SEDANG berlaku, atau "__guest__"
let loadPromise = null;

function currentRegistryKey() {
  return getState().user?.id ?? "__guest__";
}

/**
 * Pastikan custom spread milik user SAAT INI sudah dimuat ke registry.
 * Aman dipanggil berkali-kali dari mana saja (reading.js, reading-service.js,
 * dst) — kalau key (siapa yang login) belum berubah sejak load terakhir,
 * langsung mengembalikan promise yang sama tanpa network call ulang. Kalau
 * user login/logout di tengah sesi, key berubah dan registry dimuat ulang
 * otomatis di panggilan berikutnya -- pola yang sama dengan currentUserId()
 * yang dicek ulang di setiap pemanggilan fungsi service lain, bukan
 * disimpan sebagai flag statis.
 * @returns {Promise<void>}
 */
export async function ensureCustomSpreadsLoaded() {
  const key = currentRegistryKey();
  if (key === loadedForKey && loadPromise) return loadPromise;

  loadedForKey = key;
  loadPromise = listCustomSpreads()
    .then((spreads) => {
      customSpreadRegistry = new Map(spreads.map((s) => [s.id, s]));
    })
    .catch((err) => {
      console.warn("[spreads] gagal memuat custom spread", err);
      customSpreadRegistry = new Map();
      // Reset loadedForKey supaya percobaan BERIKUTNYA (bukan cuma promise
      // yang sudah telanjur di-cache) benar-benar mencoba fetch ulang,
      // bukan dianggap permanen "sudah dimuat (kosong)".
      loadedForKey = undefined;
    });
  return loadPromise;
}

/** Registrasi manual satu custom spread ke registry TANPA refetch penuh --
 *  dipanggil js/pages/custom-spreads.js setelah create/update supaya
 *  getSpreadById() dkk di halaman lain (mis. Reading Step 2) langsung lihat
 *  perubahan tanpa menunggu round-trip listCustomSpreads() lagi. */
export function registerCustomSpread(spread) {
  customSpreadRegistry.set(spread.id, spread);
}

/** Kebalikan registerCustomSpread() — dipanggil setelah delete berhasil. */
export function unregisterCustomSpread(id) {
  customSpreadRegistry.delete(id);
}

/** Snapshot custom spread yang SEDANG ada di registry (sudah ter-load). */
export function listRegisteredCustomSpreads() {
  return [...customSpreadRegistry.values()];
}

/**
 * getSpreadById() sistem (default-spreads.js) DIPRIORITASKAN dulu, baru
 * jatuh ke registry custom spread -- id sistem & custom tidak akan pernah
 * bentrok (custom selalu diprefiks `cspread_`, lihat uid() di
 * custom-spread-service.js), jadi urutan pengecekan ini murni soal mana
 * yang lebih murah dicek (array kecil in-memory) duluan.
 * @returns {object|undefined}
 */
export function getSpreadById(id) {
  return getSystemSpreadById(id) ?? customSpreadRegistry.get(id);
}

/**
 * Pastikan spread valid: ada, dan jumlah positions cocok dengan cardCount.
 * Throw kalau tidak valid — dipanggil tarot-engine.js sebelum reading dimulai.
 * @param {object} spread
 */
export function validateSpread(spread) {
  if (!spread || typeof spread !== "object") {
    throw new Error("[spreads] Spread tidak ditemukan.");
  }
  if (!Array.isArray(spread.positions) || spread.positions.length !== spread.cardCount) {
    throw new Error(
      `[spreads] Spread "${spread.id}" tidak valid: cardCount (${spread.cardCount}) tidak cocok jumlah positions (${spread.positions?.length ?? 0}).`
    );
  }
  return true;
}

/**
 * Cari spread by id sekaligus validasi. Dipakai tarot-engine.js#createReading.
 * @param {string} spreadId
 * @returns {object}
 */
export function resolveSpread(spreadId) {
  const spread = getSpreadById(spreadId);
  validateSpread(spread);
  return spread;
}

/** @param {object} spread @param {number} index @returns {object|undefined} */
export function getPositionAt(spread, index) {
  return spread.positions.find((p) => p.index === index);
}

/** @param {object} spread @param {string} positionId @returns {object|undefined} */
export function getPositionById(spread, positionId) {
  return spread.positions.find((p) => p.id === positionId);
}

/** Posisi berikutnya yang belum terisi, berdasarkan jumlah kartu yang sudah ditarik. */
export function getNextPosition(spread, drawnCount) {
  return getPositionAt(spread, drawnCount);
}

export function isSpreadComplete(spread, drawnCount) {
  return drawnCount >= spread.cardCount;
}
