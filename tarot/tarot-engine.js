// OTR — Tarot Engine
// Phase 3. Logic murni tarot reading — TIDAK menyentuh DOM, TIDAK meng-import
// js/core/state.js atau event-bus.js. Modul ini bisa dites langsung lewat
// `node` (lihat cara Phase 2 menguji data/tarot-cards.js), dan dipakai
// Phase 5 (Reading MVP) dengan meng-hubungkan hasilnya ke state/UI di layer
// atasnya (page controller yang panggil patchState("reading", engine.getReading())).
//
// State machine reading (Master Spec §15):
//   idle -> setup -> shuffling -> drawing -> revealing -> interpreting
//   -> (kartu berikutnya: kembali ke drawing) -> ... -> completed
//
// API wajib (Development Roadmap Phase 3):
//   tarotEngine.createReading()
//   tarotEngine.drawCard()
//   tarotEngine.completeReading()

import { getCardById } from "../../data/tarot-cards.js";
import { TarotDeck } from "./deck.js";
import { drawForPosition } from "./draw.js";
import { resolveSpread, getNextPosition, isSpreadComplete } from "./spreads.js";
import { uid } from "../core/utils.js";

const STATUS = /** @type {const} */ ({
  IDLE: "idle",
  SETUP: "setup",
  SHUFFLING: "shuffling",
  DRAWING: "drawing",
  REVEALING: "revealing",
  INTERPRETING: "interpreting",
  COMPLETED: "completed",
});

export class TarotEngine {
  /** @param {TarotDeck} [deck] */
  constructor(deck = new TarotDeck()) {
    this._deck = deck;
    this._spread = null;
    this._reading = null;
    this._reversedProbability = 0.5;
    /** kartu penuh (schema §7) dari draw terakhir, dipakai revealCurrentCard() */
    this._lastDrawnCard = null;
  }

  // ---------------------------------------------------------------------
  // Setup
  // ---------------------------------------------------------------------

  /**
   * Mulai reading baru: validasi spread, reset + shuffle deck, siapkan
   * reading entity (Master Spec §14). Status akhir: "shuffling", siap
   * untuk drawCard() pertama.
   * @param {object} options
   * @param {string} options.spreadId
   * @param {string} [options.question]
   * @param {string} [options.intention]
   * @param {string|null} [options.userId]
   * @param {number} [options.reversedProbability] - 0..1, default 0.5 (Master Spec §11)
   * @returns {object} reading snapshot
   */
  createReading({ spreadId, question = "", intention = "", userId = null, reversedProbability = 0.5 } = {}) {
    const spread = resolveSpread(spreadId);

    this._spread = spread;
    this._reversedProbability = reversedProbability;
    this._lastDrawnCard = null;

    this._deck.reset();
    this._deck.shuffle();

    this._reading = {
      id: uid("reading"),
      userId,
      spreadId: spread.id,
      question,
      intention,
      status: STATUS.SHUFFLING,
      cards: [],
      currentPosition: 0,
      summary: "",
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    return this.getReading();
  }

  /** Acak ulang deck secara manual — hanya valid sebelum kartu pertama ditarik. */
  reshuffle() {
    this._assertReadingExists();
    this._assertStatus([STATUS.SHUFFLING], "reshuffle()");
    this._deck.shuffle();
    return this.getReading();
  }

  // ---------------------------------------------------------------------
  // Draw / Reveal
  // ---------------------------------------------------------------------

  /**
   * Tarik kartu untuk posisi berikutnya yang belum terisi. Hanya valid saat
   * status "shuffling" (kartu pertama) atau "interpreting" (kartu
   * sebelumnya sudah selesai diinterpretasi -> lanjut ke posisi berikut).
   * @returns {{positionId:string, position:object, cardId:string, orientation:"upright"|"reversed", card:object}}
   */
  drawCard() {
    this._assertReadingExists();
    this._assertStatus(
      [STATUS.SHUFFLING, STATUS.INTERPRETING],
      "drawCard() — kartu harus di-reveal & interpretasikan dulu sebelum menarik kartu berikutnya"
    );

    if (isSpreadComplete(this._spread, this._reading.cards.length)) {
      throw new Error("[TarotEngine] Semua posisi spread sudah terisi. Panggil completeReading().");
    }

    const position = getNextPosition(this._spread, this._reading.cards.length);
    this._reading.status = STATUS.DRAWING;

    const { positionId, cardId, orientation, card } = drawForPosition(this._deck, position, {
      reversedProbability: this._reversedProbability,
    });

    this._reading.cards.push({ positionId, cardId, orientation });
    this._reading.currentPosition = position.index;
    this._lastDrawnCard = card;

    // Kartu sudah keluar dari deck; status "revealing" menandakan kartu
    // menunggu di-flip di UI (Draw Screen, Master Spec §18) sebelum
    // teks interpretasi ditampilkan.
    this._reading.status = STATUS.REVEALING;

    return { positionId, position, cardId, orientation, card };
  }

  /**
   * Tandai kartu yang baru ditarik sudah di-reveal ke user. Hanya valid
   * saat status "revealing" — mencegah user "skip" ke interpretasi
   * sebelum kartu benar-benar ditarik (Master Spec §15).
   * @returns {{positionId:string, cardId:string, orientation:"upright"|"reversed", card:object}}
   */
  revealCurrentCard() {
    this._assertReadingExists();
    this._assertStatus([STATUS.REVEALING], "revealCurrentCard() — belum ada kartu yang ditarik untuk di-reveal");

    this._reading.status = STATUS.INTERPRETING;

    const entry = this._reading.cards[this._reading.cards.length - 1];
    const card = this._lastDrawnCard ?? getCardById(entry.cardId);

    return { ...entry, card };
  }

  // ---------------------------------------------------------------------
  // Complete
  // ---------------------------------------------------------------------

  /**
   * Tutup reading. Hanya valid kalau semua posisi spread sudah terisi dan
   * kartu terakhir sudah melewati status "interpreting".
   * @param {string} [summary]
   * @returns {object} reading snapshot final
   */
  completeReading(summary = "") {
    this._assertReadingExists();
    this._assertStatus(
      [STATUS.INTERPRETING],
      "completeReading() — masih ada kartu yang belum di-reveal/diinterpretasikan"
    );

    if (!isSpreadComplete(this._spread, this._reading.cards.length)) {
      throw new Error(
        `[TarotEngine] Reading belum lengkap: ${this._reading.cards.length}/${this._spread.cardCount} kartu sudah ditarik.`
      );
    }

    this._reading.status = STATUS.COMPLETED;
    this._reading.summary = summary;
    this._reading.completedAt = new Date().toISOString();

    return this.getReading();
  }

  /** Batalkan reading yang sedang berjalan dan kembalikan engine ke kondisi kosong. */
  abortReading() {
    this._spread = null;
    this._reading = null;
    this._lastDrawnCard = null;
    this._deck.reset();
  }

  // ---------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------

  /** @returns {object|null} salinan reading saat ini (tidak bisa dimutasi dari luar) */
  getReading() {
    if (!this._reading) return null;
    return { ...this._reading, cards: this._reading.cards.map((c) => ({ ...c })) };
  }

  getSpread() {
    return this._spread;
  }

  isComplete() {
    return Boolean(this._reading) && isSpreadComplete(this._spread, this._reading.cards.length) && this._reading.status === STATUS.COMPLETED;
  }

  get deck() {
    return this._deck;
  }

  // ---------------------------------------------------------------------
  // Internal guards
  // ---------------------------------------------------------------------

  _assertReadingExists() {
    if (!this._reading || !this._spread) {
      throw new Error("[TarotEngine] Belum ada reading aktif. Panggil createReading() dulu.");
    }
  }

  _assertStatus(allowedStatuses, actionLabel) {
    if (!allowedStatuses.includes(this._reading.status)) {
      throw new Error(
        `[TarotEngine] Aksi tidak valid: ${actionLabel}. Status saat ini "${this._reading.status}", butuh salah satu dari [${allowedStatuses.join(", ")}].`
      );
    }
  }
}

export { STATUS as READING_STATUS };

/** Factory kecil supaya pemanggil tidak perlu `new TarotEngine()` manual kalau tidak butuh custom deck. */
export function createTarotEngine() {
  return new TarotEngine();
}
