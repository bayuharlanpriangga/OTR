// OTR — Draw
// Menggabungkan TarotDeck#draw() (deck.js) dengan orientation roll
// (orientation.js) jadi satu entri kartu untuk sebuah posisi spread.
// Modul ini murni fungsi — tidak menyimpan state, tidak tahu soal reading
// atau spread secara keseluruhan (itu tanggung jawab tarot-engine.js).

import { rollOrientation } from "./orientation.js";

/**
 * Tarik satu kartu dari deck untuk sebuah posisi spread, lalu undi orientasi.
 * @param {import("./deck.js").TarotDeck} deck
 * @param {object} position - entri dari spread.positions (Master Spec §12)
 * @param {object} [options]
 * @param {number} [options.reversedProbability] - default 0.5, lihat orientation.js
 * @returns {{positionId:string, cardId:string, orientation:"upright"|"reversed", card:object}}
 */
export function drawForPosition(deck, position, options = {}) {
  const card = deck.draw();
  const orientation = rollOrientation(options.reversedProbability);

  return {
    positionId: position.id,
    cardId: card.id,
    orientation,
    card, // objek kartu penuh (schema §7) — kemudahan untuk UI, tidak wajib disimpan ke reading entity §14
  };
}
