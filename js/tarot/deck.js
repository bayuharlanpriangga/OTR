// OTR — Deck Engine
// Master Spec §9. TarotDeck bertanggung jawab atas load, clone, shuffle,
// draw, tracking kartu yang sudah keluar, dan reset. Tidak tahu apa-apa
// soal orientation, spread, atau reading — itu tanggung jawab modul lain.

import { getAllCards } from "../../data/tarot-cards.js";
import { shuffleDeck } from "./shuffle.js";

export class TarotDeck {
  /**
   * @param {object[]} [sourceCards] - default: seluruh 78 kartu dari data/tarot-cards.js
   */
  constructor(sourceCards = getAllCards()) {
    /** @type {object[]} kartu asal, tidak pernah dimutasi setelah konstruksi */
    this._sourceCards = [...sourceCards];
    /** @type {object[]} kartu yang masih tersisa untuk di-draw */
    this._remaining = [...this._sourceCards];
    /** @type {object[]} kartu yang sudah keluar di sesi deck ini, urut draw */
    this._drawn = [];
  }

  /** Kembalikan seluruh kartu ke tumpukan, kosongkan riwayat draw. Tidak mengacak. */
  reset() {
    this._remaining = [...this._sourceCards];
    this._drawn = [];
    return this;
  }

  /** Acak urutan kartu yang tersisa (Fisher-Yates, secure random — lihat shuffle.js). */
  shuffle() {
    this._remaining = shuffleDeck(this._remaining);
    return this;
  }

  /**
   * Ambil satu kartu paling atas dari tumpukan yang tersisa. Kartu yang sudah
   * ditarik tidak akan pernah keluar lagi di sesi deck yang sama (duplicate
   * prevention) sampai reset() dipanggil.
   * @returns {object} kartu (schema Master Spec §7)
   */
  draw() {
    if (this._remaining.length === 0) {
      throw new Error("[TarotDeck] Deck kosong — tidak ada kartu tersisa untuk di-draw. Panggil reset() dahulu.");
    }
    const card = this._remaining.pop();
    this._drawn.push(card);
    return card;
  }

  /** Buat instance TarotDeck baru dengan kartu sumber yang sama, dalam kondisi belum di-shuffle/draw. */
  clone() {
    return new TarotDeck(this._sourceCards);
  }

  get remainingCount() {
    return this._remaining.length;
  }

  get drawnCount() {
    return this._drawn.length;
  }

  get drawnCards() {
    return [...this._drawn];
  }

  get isEmpty() {
    return this._remaining.length === 0;
  }

  get totalCount() {
    return this._sourceCards.length;
  }
}
