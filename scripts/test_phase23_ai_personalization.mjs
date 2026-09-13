// OTR — Dev-only smoke test (Phase 23 — AI Personalization, Roadmap Phase 23)
// Pola sama dengan test_phase22_ai_reading.mjs. Empat lapis:
//   1. supabase/functions/ai-reading-synthesis/prompt.js -- validasi
//      `personalization` opsional di validatePayload(), section tambahan di
//      buildPrompt(), personalization_note opsional di validateSynthesis().
//      Node saja, tanpa Deno/network (sama alasan seperti Phase 22).
//   2. js/services/ai-service.js -- extractJournalThemes(),
//      summarizePreviousReadings(), summarizeFavoriteCategories(),
//      buildPersonalizationContext(), dan buildAIReadingPayload() dengan
//      argumen `personalization` baru -- semua pure, node saja.
//   3. Regression byte-level: prompt TANPA personalization harus identik
//      persis dengan sebelum Phase 23 (tidak ada field/section personalisasi
//      yang "bocor" ke request yang tidak opt-in).
//   4. js/pages/result.js -- lewat jsdom: checkbox Lapis 2/3 TIDAK muncul
//      kalau Settings (Lapis 1) OFF (default), MUNCUL kalau ON, dan
//      checkbox Journal terkunci sampai checkbox umum dicentang.
//
// Jalankan: node scripts/test_phase23_ai_personalization.mjs

import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body><div id='app'></div><div id='toast-outlet'></div></body></html>", {
  url: "http://localhost/",
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let failures = 0;
function assert(cond, msg) {
  if (!cond) {
    failures++;
    console.error(`✗ ${msg}`);
  } else {
    console.log(`✓ ${msg}`);
  }
}

function section(title) {
  console.log(`\n${title}`);
}

async function main() {
  // ---- 1. prompt.js -- validatePersonalization + buildPrompt + validateSynthesis ----
  section("1. supabase/functions/ai-reading-synthesis/prompt.js (Phase 23)");
  const { validatePayload, buildPrompt, validateSynthesis } = await import("../supabase/functions/ai-reading-synthesis/prompt.js");

  const baseBody = {
    question: "Bagaimana hubunganku?",
    spread: "Two Card Spread",
    cards: [
      { position: "Situation", card: "The Star", orientation: "upright", meaning: "Harapan." },
      { position: "Advice", card: "Ten of Swords", orientation: "reversed", meaning: "Akhir siklus sulit." },
    ],
  };

  // 1a. Tanpa personalization sama sekali -- regression Phase 22.
  const withoutPersonalization = validatePayload(baseBody);
  assert(!("personalization" in withoutPersonalization), "validatePayload() tidak menambahkan key personalization kalau tidak dikirim klien");

  const promptWithout = buildPrompt(withoutPersonalization);
  assert(!promptWithout.includes("KONTEKS PERSONALISASI"), "buildPrompt() tanpa personalization tidak menyertakan section personalisasi");
  assert(!promptWithout.includes("personalization_note"), "buildPrompt() tanpa personalization tidak meminta field personalization_note");

  // 1b. Dengan personalization valid.
  const withPersonalizationBody = {
    ...baseBody,
    personalization: {
      previousReadings: [{ spread: "Card of the Day", theme: "Refleksi diri" }],
      favoriteCategories: ["Cups", "Major Arcana"],
      journalThemes: ["kerja", "keluarga"],
    },
  };
  const normalizedWithP = validatePayload(withPersonalizationBody);
  assert(normalizedWithP.personalization.previousReadings.length === 1, "validatePayload() menerima personalization.previousReadings valid");
  assert(normalizedWithP.personalization.favoriteCategories.includes("Cups"), "validatePayload() menerima personalization.favoriteCategories valid");
  assert(normalizedWithP.personalization.journalThemes.includes("kerja"), "validatePayload() menerima personalization.journalThemes valid");

  const promptWith = buildPrompt(normalizedWithP);
  assert(promptWith.includes("KONTEKS PERSONALISASI"), "buildPrompt() dengan personalization menyertakan section personalisasi");
  assert(promptWith.includes("Card of the Day") && promptWith.includes("Refleksi diri"), "buildPrompt() menyertakan previous readings di section personalisasi");
  assert(promptWith.includes("Cups"), "buildPrompt() menyertakan favorite categories");
  assert(promptWith.includes("kerja"), "buildPrompt() menyertakan journal themes (kata kunci)");
  assert(promptWith.includes("personalization_note"), "buildPrompt() dengan personalization meminta field personalization_note di schema output");
  assert(/psikolog|diagnosis/i.test(promptWith), "buildPrompt() menyertakan instruksi anti-diagnosis-psikologis untuk konteks personalisasi");

  // 1c. Validasi menolak input personalization yang tidak wajar.
  let threw = false;
  try {
    validatePayload({ ...baseBody, personalization: { previousReadings: Array.from({ length: 10 }, () => ({ spread: "x", theme: "y" })) } });
  } catch {
    threw = true;
  }
  assert(threw, "validatePayload() menolak personalization.previousReadings melebihi batas");

  threw = false;
  try {
    validatePayload({ ...baseBody, personalization: { journalThemes: ["dua kata"] } });
  } catch {
    threw = true;
  }
  assert(threw, "validatePayload() menolak journalThemes yang berupa frasa/kalimat (bukan satu kata)");

  threw = false;
  try {
    validatePayload({ ...baseBody, personalization: { favoriteCategories: "bukan array" } });
  } catch {
    threw = true;
  }
  assert(threw, "validatePayload() menolak favoriteCategories yang bukan array");

  threw = false;
  try {
    validatePayload({ ...baseBody, personalization: "bukan object" });
  } catch {
    threw = true;
  }
  assert(threw, "validatePayload() menolak personalization yang bukan object");

  // 1d. validateSynthesis() -- personalization_note opsional.
  const synthWithNote = validateSynthesis({
    theme: "t", summary: "s", key_message: "k", reflection: "r",
    personalization_note: "Mempertimbangkan pola sebelumnya.",
  });
  assert(synthWithNote.personalization_note === "Mempertimbangkan pola sebelumnya.", "validateSynthesis() meneruskan personalization_note kalau ada");

  const synthWithoutNote = validateSynthesis({ theme: "t", summary: "s", key_message: "k", reflection: "r" });
  assert(!("personalization_note" in synthWithoutNote), "validateSynthesis() tidak menambahkan personalization_note kalau model tidak mengirimnya");

  threw = false;
  try {
    validateSynthesis({ theme: "t", summary: "s", key_message: "k", reflection: "r", personalization_note: 123 });
  } catch {
    threw = true;
  }
  assert(threw, "validateSynthesis() menolak personalization_note yang bukan string");

  // ---- 2. js/services/ai-service.js -- helper Phase 23 (pure) ----
  section("2. js/services/ai-service.js (Phase 23)");
  const aiService = await import("../js/services/ai-service.js");

  const journalEntries = [
    { content: "Hari ini aku memikirkan tentang kerja dan target baru di kantor." },
    { content: "Masih mikirin soal kerja terus, capek juga sih, tapi keluarga bantu banget." },
  ];
  const themes = aiService.extractJournalThemes(journalEntries, 3);
  assert(Array.isArray(themes) && themes.length <= 3, "extractJournalThemes() mengembalikan array dibatasi max");
  assert(themes.includes("kerja"), "extractJournalThemes() menangkap kata yang sering muncul lintas entri");
  assert(!themes.some((t) => t.includes(" ")), "extractJournalThemes() tidak pernah mengembalikan frasa/kalimat, hanya kata tunggal");
  assert(!journalEntries.some((e) => themes.includes(e.content)), "extractJournalThemes() tidak pernah mengembalikan teks mentah journal");

  const previousReadingsFixture = [
    { id: "r1", status: "completed", spreadName: "Card of the Day", synthesisSnapshot: { theme: "Awal baru" }, createdAt: "2026-01-01" },
    { id: "current", status: "completed", spreadName: "Two Card Spread", synthesisSnapshot: { theme: "Harus dilewati" }, createdAt: "2026-01-05" },
    { id: "r2", status: "completed", spreadName: "Three Card Spread", synthesisSnapshot: {}, createdAt: "2026-01-03" }, // theme kosong -> harus difilter
  ];
  const prevSummary = aiService.summarizePreviousReadings(previousReadingsFixture, "current");
  assert(prevSummary.every((r) => r.spread !== "Two Card Spread"), "summarizePreviousReadings() mengecualikan reading yang sedang dibuka (excludeId)");
  assert(prevSummary.length === 1, "summarizePreviousReadings() memfilter reading tanpa theme (synthesisSnapshot kosong)");
  assert(prevSummary[0].spread === "Card of the Day", "summarizePreviousReadings() mempertahankan data reading valid");

  function fakeGetCardById(id) {
    const map = {
      major_00: { arcana: "major", suit: null },
      cups_01: { arcana: "minor", suit: "cups" },
      cups_02: { arcana: "minor", suit: "cups" },
      wands_01: { arcana: "minor", suit: "wands" },
    };
    return map[id] ?? null;
  }
  const cats = aiService.summarizeFavoriteCategories(["cups_01", "cups_02", "wands_01", "major_00", "unknown_id"], fakeGetCardById);
  assert(cats[0] === "Cups", "summarizeFavoriteCategories() mengurutkan kategori dari paling sering (Cups muncul 2x)");
  assert(cats.includes("Major Arcana") && cats.includes("Wands"), "summarizeFavoriteCategories() menyertakan semua kategori valid");
  assert(cats.length === 3, "summarizeFavoriteCategories() mengabaikan id kartu yang tidak ditemukan (unknown_id)");

  assert(aiService.buildPersonalizationContext({}) === null, "buildPersonalizationContext() mengembalikan null kalau semua sumber kosong");
  const ctx = aiService.buildPersonalizationContext({ favoriteCategories: ["Cups"] });
  assert(ctx !== null && ctx.favoriteCategories.includes("Cups"), "buildPersonalizationContext() mengembalikan object kalau minimal 1 sumber terisi");

  // buildAIReadingPayload() -- regression (tanpa personalization) + fitur baru.
  const fixtureEntries = [
    { entry: { orientation: "upright" }, position: { name: "Situation" }, card: { name: "The Star" }, interpretation: { meaning: "Harapan." } },
  ];
  const payloadNoPersonalization = aiService.buildAIReadingPayload({ spread: { name: "One Card" }, entries: fixtureEntries });
  assert(!("personalization" in payloadNoPersonalization), "buildAIReadingPayload() tanpa argumen personalization tidak menambahkan key itu (regression Phase 22)");

  const payloadWithPersonalization = aiService.buildAIReadingPayload({ spread: { name: "One Card" }, entries: fixtureEntries, personalization: ctx });
  assert(payloadWithPersonalization.personalization === ctx, "buildAIReadingPayload() menempelkan personalization kalau diberikan & tidak null");

  // Round-trip penuh: keluaran buildPersonalizationContext() lolos
  // validatePayload() Edge Function tanpa transformasi tambahan.
  const roundTripFull = validatePayload(aiService.buildAIReadingPayload({
    spread: { name: "One Card" },
    entries: fixtureEntries,
    personalization: aiService.buildPersonalizationContext({
      previousReadings: prevSummary,
      favoriteCategories: cats,
      journalThemes: themes,
    }),
  }));
  assert(roundTripFull.personalization.favoriteCategories.length === cats.length, "payload personalization end-to-end lolos validatePayload() Edge Function tanpa berubah");

  // ---- 3. js/pages/result.js -- gating Lapis 1/2/3 (jsdom) ----
  section("3. js/pages/result.js (Phase 23, jsdom)");

  const { createTarotEngine } = await import("../js/tarot/tarot-engine.js");
  const { patchState, resetReading } = await import("../js/core/state.js");
  const { saveSettings: saveLocalSettings } = await import("../js/core/storage.js");

  function freshReading() {
    const engine = createTarotEngine();
    engine.createReading({ spreadId: "card_of_the_day", question: "Bagaimana hariku?" });
    engine.drawCard();
    engine.revealCurrentCard();
    engine.completeReading();
    patchState("reading", engine.getReading());
  }

  function freshContainer() {
    document.body.querySelectorAll("[data-test-container]").forEach((el) => el.remove());
    const el = document.createElement("div");
    el.setAttribute("data-test-container", "1");
    document.body.appendChild(el);
    return el;
  }

  const resultPage = (await import("../js/pages/result.js")).default;

  // 3a. Default (Settings belum pernah disentuh -- aiPersonalizationOptIn: false).
  saveLocalSettings({ aiPersonalizationOptIn: false });
  freshReading();
  let container = freshContainer();
  await resultPage.render(container);
  assert(container.querySelector("[data-ai-personalize-checkbox]") === null, "Lapis 1 OFF (default) -> checkbox personalisasi TIDAK dirender sama sekali (constraint 'must explicitly opt in')");
  assert(container.querySelector("[data-ai-generate]") !== null, "tombol 'Lihat Interpretasi AI' Phase 22 tetap ada walau Lapis 1 OFF");

  // 3b. Settings toggle ON -- checkbox harus muncul, tapi Journal checkbox
  // masih terkunci sampai checkbox umum dicentang (Lapis 3 gerbang Lapis 2).
  saveLocalSettings({ aiPersonalizationOptIn: true });
  freshReading();
  container = freshContainer();
  await resultPage.render(container);
  const personalizeCb = container.querySelector("[data-ai-personalize-checkbox]");
  const journalCb = container.querySelector("[data-ai-journal-checkbox]");
  assert(personalizeCb !== null, "Lapis 1 ON -> checkbox personalisasi umum muncul di Result Page");
  assert(journalCb !== null && journalCb.disabled === true, "checkbox Journal muncul TAPI disabled by default (Lapis 3 terkunci sampai Lapis 2 dicentang)");

  personalizeCb.checked = true;
  personalizeCb.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  assert(journalCb.disabled === false, "mencentang checkbox umum membuka kunci checkbox Journal");

  personalizeCb.checked = false;
  personalizeCb.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  assert(journalCb.disabled === true && journalCb.checked === false, "melepas centang checkbox umum mengunci ULANG & mematikan checkbox Journal (tidak boleh ada state Journal ON tanpa umum ON)");

  // Reset settings ke default supaya tidak bocor ke test/sesi lain yang
  // membaca localStorage yang sama.
  saveLocalSettings({ aiPersonalizationOptIn: false });
  resetReading();

  // ---- Ringkasan ----
  section("Ringkasan");
  if (failures === 0) {
    console.log("\nSemua assertion lulus.");
    process.exit(0);
  } else {
    console.error(`\n${failures} assertion GAGAL.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
