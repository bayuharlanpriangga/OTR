// OTR — Dev-only smoke test (Phase 22 — AI Reading)
// Tiga lapis, pola sama dengan test script fase-fase sebelumnya:
//   1. supabase/functions/ai-reading-synthesis/prompt.js -- pure logic Edge
//      Function (validatePayload/buildPrompt/parseModelText/validateSynthesis).
//      Node saja, TIDAK butuh Deno runtime maupun network ke Gemini --
//      lihat komentar di kepala prompt.js soal kenapa modul ini nol
//      dependency ke Deno/fetch/env.
//   2. js/services/ai-service.js -- buildAIReadingPayload() (pure reshape,
//      node saja). getAIReadingSynthesis() TIDAK diuji jalur sukses di sini
//      -- fungsi itu SELALU network call ke Edge Function (tidak ada jalur
//      guest/lokal sama sekali untuk AI synthesis, beda dari service lain),
//      dan sandbox coding sesi ini tidak punya akses jaringan ke
//      *.supabase.co (lihat konfigurasi network) apalagi ke project Supabase
//      ASLI dengan Edge Function yang sudah di-deploy + GEMINI_API_KEY
//      ter-set. Sama pola dengan Phase 12-21: jalur cloud/network TIDAK
//      pernah dicoba terhadap backend sungguhan dari sandbox ini, cuma
//      dipastikan strukturnya benar (section 2) + jalur ERROR-nya graceful
//      (section 3b, di bawah).
//   3. js/pages/result.js -- render(container) lewat jsdom untuk reading
//      yang sudah completed:
//        a. Panel "AI Reading" muncul dengan tombol "Lihat Interpretasi AI".
//        b. Klik tombol -> state loading muncul -> karena network ke
//           Supabase tidak tersedia di sandbox ini, request GAGAL -- pastikan
//           kegagalan itu ditangani graceful (toast error, tombol kembali
//           enabled dengan label "Coba Lagi"), TIDAK crash/throw unhandled.
//           Jalur SUKSES (klik -> render Theme/Summary/Key Message/
//           Reflection dari AI sungguhan) perlu smoke test manual di browser
//           setelah Edge Function di-deploy Orias -- dicatat di
//           PROJECT_STATUS.md "Next Phase", sama seperti jalur cloud fase
//           lain yang belum pernah dicoba dari sandbox mana pun.
//
// Jalankan: node scripts/test_phase22_ai_reading.mjs

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
  // ---- 1. supabase/functions/ai-reading-synthesis/prompt.js ----
  section("1. supabase/functions/ai-reading-synthesis/prompt.js");
  const promptMod = await import("../supabase/functions/ai-reading-synthesis/prompt.js");
  const { validatePayload, buildPrompt, parseModelText, validateSynthesis } = promptMod;

  const validBody = {
    question: "Bagaimana karierku bulan ini?",
    spread: "Past, Present, Future",
    cards: [
      { position: "Past", card: "The Fool", orientation: "upright", meaning: "Awal baru yang penuh harapan." },
      { position: "Present", card: "The Tower", orientation: "reversed", meaning: "Menghindari keruntuhan yang tak terhindarkan." },
    ],
  };

  const normalized = validatePayload(validBody);
  assert(normalized.spread === "Past, Present, Future", "validatePayload() menerima payload valid & mempertahankan spread");
  assert(normalized.cards.length === 2, "validatePayload() mempertahankan jumlah kartu");
  assert(normalized.cards[1].orientation === "reversed", "validatePayload() mempertahankan orientation per kartu");

  const emptyQuestion = validatePayload({ ...validBody, question: "" });
  assert(emptyQuestion.question === "", "validatePayload() menerima question kosong (opsional)");

  let threw = false;
  try {
    validatePayload({ question: "x", cards: validBody.cards });
  } catch {
    threw = true;
  }
  assert(threw, "validatePayload() menolak payload tanpa spread");

  threw = false;
  try {
    validatePayload({ ...validBody, cards: [] });
  } catch {
    threw = true;
  }
  assert(threw, "validatePayload() menolak cards kosong");

  threw = false;
  try {
    validatePayload({ ...validBody, cards: [{ position: "Past", card: "The Fool", orientation: "sideways", meaning: "x" }] });
  } catch {
    threw = true;
  }
  assert(threw, "validatePayload() menolak orientation selain upright/reversed");

  threw = false;
  try {
    validatePayload({ ...validBody, cards: Array.from({ length: 20 }, () => validBody.cards[0]) });
  } catch {
    threw = true;
  }
  assert(threw, "validatePayload() menolak cards yang melebihi batas wajar");

  threw = false;
  try {
    validatePayload({ ...validBody, question: "x".repeat(501) });
  } catch {
    threw = true;
  }
  assert(threw, "validatePayload() menolak question yang terlalu panjang");

  const prompt = buildPrompt(normalized);
  assert(prompt.includes("The Fool") && prompt.includes("The Tower"), "buildPrompt() menyertakan nama semua kartu");
  assert(prompt.includes("Tegak") && prompt.includes("Terbalik"), "buildPrompt() melokalisasi orientation ke Bahasa Indonesia");
  assert(prompt.includes(validBody.question), "buildPrompt() menyertakan pertanyaan user");
  assert(/reflektif/i.test(prompt), "buildPrompt() menginstruksikan bahasa reflektif (Master Spec §68)");
  assert(prompt.includes("key_message") && prompt.includes("reflection"), "buildPrompt() menyertakan schema output JSON persis (Master Spec §67)");

  const noQuestionPrompt = buildPrompt(validatePayload({ ...validBody, question: "" }));
  assert(!noQuestionPrompt.includes('Pertanyaan dari user: ""'), "buildPrompt() tidak menampilkan pertanyaan kosong sebagai kutipan kosong");

  const rawJSON = '{"theme":"Transformasi","summary":"Ringkasan.","key_message":"Pesan.","reflection":"Pertanyaan?"}';
  assert(parseModelText(rawJSON).theme === "Transformasi", "parseModelText() mem-parse JSON polos");
  assert(parseModelText("```json\n" + rawJSON + "\n```").theme === "Transformasi", "parseModelText() strip code fence ```json ... ```");

  threw = false;
  try {
    parseModelText("bukan json sama sekali");
  } catch {
    threw = true;
  }
  assert(threw, "parseModelText() throw untuk teks yang bukan JSON");

  const validSynth = validateSynthesis(JSON.parse(rawJSON));
  assert(validSynth.key_message === "Pesan.", "validateSynthesis() menerima schema lengkap");

  threw = false;
  try {
    validateSynthesis({ theme: "x", summary: "y", reflection: "z" }); // key_message hilang
  } catch {
    threw = true;
  }
  assert(threw, "validateSynthesis() menolak schema yang tidak lengkap");

  threw = false;
  try {
    validateSynthesis({ theme: "x", summary: "y", key_message: "   ", reflection: "z" }); // whitespace-only
  } catch {
    threw = true;
  }
  assert(threw, "validateSynthesis() menolak field yang cuma whitespace");

  // ---- 2. js/services/ai-service.js -- buildAIReadingPayload() (pure) ----
  section("2. js/services/ai-service.js");
  const aiService = await import("../js/services/ai-service.js");

  const fixtureEntries = [
    {
      entry: { orientation: "upright" },
      position: { name: "Situation" },
      card: { name: "The Star" },
      interpretation: { meaning: "Harapan setelah masa sulit." },
    },
    {
      entry: { orientation: "reversed" },
      position: { name: "Advice" },
      card: { name: "Ten of Swords" },
      interpretation: { meaning: "Akhir dari sebuah siklus yang menyakitkan." },
    },
  ];

  const payload = aiService.buildAIReadingPayload({
    question: "Apa yang perlu kuperhatikan?",
    spread: { name: "Two Card Spread" },
    entries: fixtureEntries,
  });
  assert(payload.spread === "Two Card Spread", "buildAIReadingPayload() memetakan nama spread");
  assert(payload.cards.length === 2, "buildAIReadingPayload() memetakan semua entry jadi cards");
  assert(payload.cards[0].card === "The Star" && payload.cards[0].orientation === "upright", "buildAIReadingPayload() memetakan card & orientation per entry");
  assert(payload.cards[1].meaning === "Akhir dari sebuah siklus yang menyakitkan.", "buildAIReadingPayload() memetakan interpretation.meaning -> meaning");

  // validatePayload() (dari prompt.js, section 1) harus menerima persis
  // output buildAIReadingPayload() tanpa transformasi apa pun -- ini
  // memastikan kontrak client<->Edge Function konsisten di kedua ujung.
  const roundTrip = validatePayload(payload);
  assert(roundTrip.cards.length === 2, "output buildAIReadingPayload() valid lolos validatePayload() Edge Function tanpa perubahan");

  threw = false;
  try {
    aiService.buildAIReadingPayload({ spread: { name: "x" }, entries: [] });
  } catch {
    threw = true;
  }
  assert(threw, "buildAIReadingPayload() menolak entries kosong");

  threw = false;
  try {
    aiService.buildAIReadingPayload({ spread: null, entries: fixtureEntries });
  } catch {
    threw = true;
  }
  assert(threw, "buildAIReadingPayload() menolak spread yang tidak valid");

  // ---- 3. js/pages/result.js -- render + panel AI (jsdom) ----
  section("3. js/pages/result.js (jsdom)");

  const { createTarotEngine } = await import("../js/tarot/tarot-engine.js");
  const { getState, patchState, resetReading } = await import("../js/core/state.js");

  const engine = createTarotEngine();
  engine.createReading({ spreadId: "card_of_the_day", question: "Bagaimana hariku?" });
  engine.drawCard();
  engine.revealCurrentCard();
  engine.completeReading();
  patchState("reading", engine.getReading());

  const resultPage = (await import("../js/pages/result.js")).default;

  function freshContainer() {
    document.body.querySelectorAll("[data-test-container]").forEach((el) => el.remove());
    const el = document.createElement("div");
    el.setAttribute("data-test-container", "1");
    document.body.appendChild(el);
    return el;
  }

  const container = freshContainer();
  await resultPage.render(container);

  // 3a. Panel AI muncul
  const aiBtn = container.querySelector("[data-ai-generate]");
  assert(aiBtn !== null, "panel 'AI Reading' menampilkan tombol 'Lihat Interpretasi AI'");
  assert(container.innerHTML.includes("AI Reading"), "halaman menampilkan label panel 'AI Reading'");
  assert(container.innerHTML.includes("Opsional"), "panel AI menandai dirinya sebagai opsional (tidak menggantikan sintesis lokal di atasnya)");
  assert(container.querySelector(".result-synthesis") !== null, "panel sintesis LOKAL (Overall Theme/Key Message/Reflection) tetap ada, tidak digantikan panel AI");

  // 3b. Klik tombol -> loading -> gagal graceful (tidak ada network ke
  // Supabase di sandbox ini, lihat komentar kepala file).
  aiBtn.dispatchEvent(new dom.window.Event("click", { bubbles: true }));
  // Beri microtask untuk loading state ter-render sebelum request (yang
  // async) selesai/gagal.
  await new Promise((resolve) => setTimeout(resolve, 0));
  const labelDuringLoad = container.querySelector("[data-ai-btn-label]")?.textContent ?? "";
  const isLoadingOrDone = labelDuringLoad === "Menyusun interpretasi..." || labelDuringLoad === "Coba Lagi";
  assert(isLoadingOrDone, `tombol menunjukkan state loading atau sudah gagal segera setelah diklik (label: "${labelDuringLoad}")`);

  // Tunggu request selesai (gagal ATAU sukses) sebelum assert final, dengan
  // POLLING alih-alih fixed sleep. Di sandbox tanpa akses jaringan, egress
  // proxy menolak host dalam puluhan ms sehingga fixed 500ms cukup -- tapi
  // di mesin dengan akses internet sungguhan ke *.supabase.co (config.js
  // proyek ini sudah diisi URL/anon key asli, bukan placeholder), request
  // menempuh DNS+TLS+round-trip beneran yang bisa lebih lambat dari 500ms,
  // membuat tombol masih berstatus loading saat assert dijalankan (flaky).
  const settleDeadline = Date.now() + 8000;
  while (Date.now() < settleDeadline) {
    const label = container.querySelector("[data-ai-btn-label]")?.textContent ?? "";
    if (label !== "Menyusun interpretasi...") break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const btnAfter = container.querySelector("[data-ai-generate]");
  assert(btnAfter !== null, "tombol AI tetap ada setelah request gagal (tidak dihapus dari DOM)");
  assert(!btnAfter.disabled, "tombol AI di-enable kembali setelah request gagal, supaya user bisa 'Coba Lagi'");
  assert(btnAfter.querySelector("[data-ai-btn-label]")?.textContent === "Coba Lagi", "label tombol berubah jadi 'Coba Lagi' setelah gagal");
  assert(container.querySelector(".result-synthesis") !== null, "panel sintesis lokal TIDAK ikut rusak oleh kegagalan AI synthesis");

  resetReading();
  assert(getState().reading.status === "idle", "resetReading() (dipakai tombol 'Reading Baru') tetap berfungsi seperti sebelum Phase 22");

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
