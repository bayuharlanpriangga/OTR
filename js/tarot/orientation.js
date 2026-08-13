// OTR — Card Orientation
// Master Spec §11. Orientasi disimpan terpisah dari identitas kartu
// ({ cardId, orientation }), bukan properti permanen di data/tarot-cards.js.

import { secureRandomFloat } from "./shuffle.js";

export const ORIENTATIONS = /** @type {const} */ (["upright", "reversed"]);

const DEFAULT_REVERSED_PROBABILITY = 0.5;

/**
 * Undi orientasi kartu. Default 50% upright / 50% reversed, tapi bisa
 * dikonfigurasi (mis. Settings — "matikan kartu terbalik" -> probability 0).
 * @param {number} reversedProbability - 0..1
 * @returns {"upright"|"reversed"}
 */
export function rollOrientation(reversedProbability = DEFAULT_REVERSED_PROBABILITY) {
  const p = Math.min(1, Math.max(0, reversedProbability));
  return secureRandomFloat() < p ? "reversed" : "upright";
}

export function isUpright(orientation) {
  return orientation === "upright";
}

export function isReversed(orientation) {
  return orientation === "reversed";
}
