// OTR — Tarot Interpretation Engine (Phase 6, Master Spec §21–23)
//
// Mengubah raw card data (Phase 2) jadi interpretation yang readable, TANPA
// AI dan tanpa generate teks bebas — murni mengombinasikan data terstruktur
// yang sudah ada (card.upright/reversed, keywords, position, category) lewat
// template deterministik. Fungsi murni, tidak ada DOM/state/network, sama
// seperti tarot-engine.js — supaya tetap testable lewat `node` saja.
//
// Dua entry point:
//   - interpretCard({ card, orientation, position, category, question })
//       → { title, keywords, meaning, advice, reflection }   (Master Spec §21)
//   - synthesizeReading({ entries, category, question })
//       → { theme, dominantKeywords, keyMessage, reflection } (Master Spec §23)
//
// Catatan skema penting: `data/tarot-cards.js` (Phase 2) TIDAK punya field
// makna per-posisi (mis. tidak ada "makna The Fool khusus untuk posisi Masa
// Depan") — menulis itu untuk 78 kartu x semua posisi di 10 spread adalah
// pekerjaan authoring manual yang jauh di luar scope "MVP deterministic
// interpretation". Priority chain di Master Spec §22 tetap diimplementasikan
// penuh (lihat resolveMeaning()) sebagai titik ekstensi forward-compatible:
// begitu ada sumber makna per-posisi di masa depan (mis. `card.positionMeanings`),
// tier 1 otomatis mulai terpakai tanpa ubah pemanggil. Untuk sekarang, tier 1
// akan selalu jatuh ke tier 2 (category-specific).

// ---------------------------------------------------------------------------
// Helpers — resolusi meaning/advice per prioritas (Master Spec §22)
// ---------------------------------------------------------------------------

function bucketFor(card, orientation) {
  return orientation === "reversed" ? card.reversed : card.upright;
}

/** Tier 1 — position-specific meaning. Titik ekstensi; lihat catatan di atas file. */
function resolvePositionMeaning(card, orientation, position, category) {
  return card.positionMeanings?.[position?.id]?.[orientation]?.[category] || null;
}

/** Tier 2 — category-specific meaning (love/career/spiritual; "general" ditangani di tier 4). */
function resolveCategoryMeaning(card, orientation, category) {
  if (!category || category === "general") return null;
  return bucketFor(card, orientation)?.[category] || null;
}

/** Tier 3 — orientation-specific meaning (bucket upright/reversed yang benar, field "general"-nya). */
function resolveOrientationMeaning(card, orientation) {
  return bucketFor(card, orientation)?.general || null;
}

/** Tier 4 — ultimate fallback. Menjamin "never leave the result empty" walau data kartu tidak lengkap. */
function resolveFallbackMeaning(orientation) {
  return orientation === "reversed"
    ? "Kartu ini terbalik — undang refleksi lebih dalam tentang hambatan, penundaan, atau pelajaran yang belum sepenuhnya dipahami."
    : "Kartu ini membawa energi yang relevan dengan situasi saat ini — perhatikan bagaimana temanya muncul dalam kesadaranmu.";
}

/** Rantai prioritas penuh Master Spec §22: position → category → orientation → general. */
function resolveMeaning(card, orientation, position, category) {
  return (
    resolvePositionMeaning(card, orientation, position, category) ||
    resolveCategoryMeaning(card, orientation, category) ||
    resolveOrientationMeaning(card, orientation) ||
    resolveFallbackMeaning(orientation)
  );
}

function resolveAdvice(card, orientation) {
  return (
    bucketFor(card, orientation)?.advice ||
    (orientation === "reversed"
      ? "Perlambat dulu dan tinjau ulang sebelum mengambil langkah besar."
      : "Percayai apa yang sudah kamu rasakan, dan ambil langkah selanjutnya.")
  );
}

function buildTitle(card, orientation, position) {
  const orientationLabel = orientation === "reversed" ? " (Terbalik)" : "";
  return position ? `${position.name} — ${card.name}${orientationLabel}` : `${card.name}${orientationLabel}`;
}

// ---------------------------------------------------------------------------
// Reflection — pertanyaan reflektif, dipilih deterministik (bukan Math.random)
// ---------------------------------------------------------------------------

/** djb2 hash sederhana — cukup untuk memilih index template secara stabil & reproducible, bukan untuk kriptografi. */
function stableHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const REFLECTION_TEMPLATES = {
  general: [
    (ctx) => `Bagaimana tema "${ctx.keyword}" dari ${ctx.cardName} hadir dalam situasimu sekarang?`,
    (ctx) => `Apa yang berubah kalau kamu menerima pesan ${ctx.cardName} apa adanya?`,
    (ctx) => `Bagian mana dari hidupmu saat ini paling terasa seperti ${ctx.cardName}?`,
  ],
  love: [
    (ctx) => `Bagaimana "${ctx.keyword}" bermain dalam hubungan atau perasaanmu belakangan ini?`,
    (ctx) => `Apa yang ingin ${ctx.cardName} kamu dengar tentang caramu mencintai atau dicintai?`,
  ],
  career: [
    (ctx) => `Langkah kecil apa yang mencerminkan "${ctx.keyword}" bisa kamu ambil di pekerjaanmu minggu ini?`,
    (ctx) => `Apa yang ${ctx.cardName} minta kamu perhatikan soal arah kariermu?`,
  ],
  spiritual: [
    (ctx) => `Bagaimana "${ctx.keyword}" terasa dalam perjalanan batinmu saat ini?`,
    (ctx) => `Apa yang ${ctx.cardName} ajak kamu lepaskan atau terima?`,
  ],
};

function buildReflection(card, orientation, position, category, question) {
  const bank = REFLECTION_TEMPLATES[category] || REFLECTION_TEMPLATES.general;
  const seed = `${card.id}:${position?.id ?? ""}:${orientation}`;
  const template = bank[stableHash(seed) % bank.length];
  const ctx = {
    cardName: card.name,
    positionName: position?.name ?? "",
    keyword: card.keywords?.[0] ?? card.name,
  };
  const base = template(ctx);
  return question ? `${base} (Ingat pertanyaanmu: "${question}".)` : base;
}

// ---------------------------------------------------------------------------
// interpretCard() — Master Spec §21
// ---------------------------------------------------------------------------

/**
 * @param {object} params
 * @param {object} params.card - objek kartu penuh (schema Master Spec §7)
 * @param {"upright"|"reversed"} params.orientation
 * @param {{id:string,name:string,description?:string}|null} [params.position]
 * @param {"general"|"love"|"career"|"spiritual"} [params.category]
 * @param {string} [params.question]
 * @returns {{title:string, keywords:string[], meaning:string, advice:string, reflection:string}}
 */
export function interpretCard({ card, orientation, position = null, category = "general", question = "" }) {
  if (!card || !orientation) {
    throw new Error("[interpretation] interpretCard() butuh card dan orientation.");
  }

  return {
    title: buildTitle(card, orientation, position),
    keywords: card.keywords ?? [],
    meaning: resolveMeaning(card, orientation, position, category),
    advice: resolveAdvice(card, orientation),
    reflection: buildReflection(card, orientation, position, category, question),
  };
}

// ---------------------------------------------------------------------------
// synthesizeReading() — Master Spec §23 (Reading Synthesis)
// ---------------------------------------------------------------------------

function rankKeywords(cardsKeywords, limit = 5) {
  const counts = new Map();
  for (const keywords of cardsKeywords) {
    for (const k of keywords ?? []) {
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([keyword]) => keyword);
}

function buildTheme(dominantKeywords, category) {
  if (dominantKeywords.length === 0) {
    return "Reading ini membawa campuran energi yang beragam.";
  }
  const categoryLabel = { general: "", love: " dalam konteks cinta", career: " dalam konteks karier", spiritual: " secara spiritual" }[category] ?? "";
  return `Reading ini berpusat pada ${dominantKeywords.slice(0, 3).join(", ")}${categoryLabel}.`;
}

/**
 * Key message = advice dari kartu di posisi terakhir. Untuk spread naratif
 * linear (past→present→future, situation→obstacle→advice, dst.), posisi
 * terakhir biasanya yang paling ke-depan/actionable — heuristik sederhana
 * dan deterministik, bukan pemilihan "pintar" berbasis makna posisi.
 */
function buildKeyMessage(interpretations) {
  if (interpretations.length === 0) return "";
  return interpretations[interpretations.length - 1].advice;
}

function buildSynthesisReflection(dominantKeywords, category, question) {
  const bank = REFLECTION_TEMPLATES[category] || REFLECTION_TEMPLATES.general;
  const seed = `${dominantKeywords.join("|")}:${category}`;
  const template = bank[stableHash(seed) % bank.length];
  const ctx = {
    cardName: dominantKeywords[0] ?? "kartu-kartu ini",
    keyword: dominantKeywords[0] ?? "energi yang muncul",
  };
  const base = template(ctx);
  return question ? `${base} (Ingat pertanyaanmu: "${question}".)` : base;
}

/**
 * @param {object} params
 * @param {{card:object, orientation:"upright"|"reversed", position:object}[]} params.entries - urutan sesuai posisi
 * @param {"general"|"love"|"career"|"spiritual"} [params.category]
 * @param {string} [params.question]
 * @returns {{theme:string, dominantKeywords:string[], keyMessage:string, reflection:string, cards: object[]}}
 */
export function synthesizeReading({ entries, category = "general", question = "" }) {
  const interpretations = entries.map((e) => ({
    ...interpretCard({ card: e.card, orientation: e.orientation, position: e.position, category, question }),
    positionId: e.position?.id ?? null,
    cardId: e.card.id,
    orientation: e.orientation,
  }));

  const dominantKeywords = rankKeywords(entries.map((e) => e.card.keywords));

  return {
    theme: buildTheme(dominantKeywords, category),
    dominantKeywords,
    keyMessage: buildKeyMessage(interpretations),
    reflection: buildSynthesisReflection(dominantKeywords, category, question),
    cards: interpretations,
  };
}
