// OTR — Shuffle & Secure Random
// Master Spec §10 (Randomization). Pakai crypto.getRandomValues() saat
// tersedia (browser + Node >= 19 lewat globalThis.crypto), fallback ke
// Math.random() kalau tidak ada. Rejection sampling dipakai supaya hasil
// modulo tidak bias ke angka kecil.

const MAX_UINT32 = 0xffffffff;

function hasSecureRandom() {
  return typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function";
}

/**
 * Angka acak integer di rentang [0, maxExclusive).
 * @param {number} maxExclusive
 * @returns {number}
 */
export function secureRandomInt(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) return 0;
  if (maxExclusive === 1) return 0;

  if (hasSecureRandom()) {
    // Rejection sampling: buang hasil yang jatuh di sisa pembagian tidak rata
    // supaya setiap kartu punya peluang keluar yang sama persis.
    const limit = MAX_UINT32 - (MAX_UINT32 % maxExclusive);
    const buf = new Uint32Array(1);
    let x;
    do {
      crypto.getRandomValues(buf);
      x = buf[0];
    } while (x >= limit);
    return x % maxExclusive;
  }

  // Fallback — hanya dipakai kalau Web Crypto API benar-benar tidak tersedia.
  return Math.floor(Math.random() * maxExclusive);
}

/**
 * Angka pecahan acak di rentang [0, 1), dibangun dari secureRandomInt supaya
 * tetap lewat sumber acak yang sama (dipakai orientation.js).
 * @returns {number}
 */
export function secureRandomFloat() {
  return secureRandomInt(1_000_000) / 1_000_000;
}

/**
 * Fisher-Yates shuffle. Tidak memutasi array input — mengembalikan array baru.
 * @template T
 * @param {T[]} deck
 * @returns {T[]}
 */
export function shuffleDeck(deck) {
  const result = [...deck];

  for (let i = result.length - 1; i > 0; i--) {
    const randomIndex = secureRandomInt(i + 1);
    [result[i], result[randomIndex]] = [result[randomIndex], result[i]];
  }

  return result;
}
