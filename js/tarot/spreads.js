// OTR — Spread System
// Master Spec §12 (Spread System) & §13 (Default Spread Catalog). Spread
// tetap data-driven (lihat data/default-spreads.js) — modul ini cuma
// menambahkan helper logic (validasi, lookup posisi) di atas data mentah.

import { getSpreadById, getAllSpreads, getSpreadsByCategory } from "../../data/default-spreads.js";

export { getSpreadById, getAllSpreads, getSpreadsByCategory };

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
