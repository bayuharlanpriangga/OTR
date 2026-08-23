// OTR — Dev-only smoke test (Phase 14 — Cloud Sync)
// Simulasi flow GUEST penuh lewat page module yang baru diubah Phase 14
// (result.js, history.js, history-detail.js, journal.js, settings.js) untuk
// memastikan refactor ke reading-service.js/journal-service.js/
// settings-service.js TIDAK meregresi jalur guest (state.user null -> semua
// service fallback ke core/storage.js, persis perilaku sebelum Phase 14).
//
// TIDAK menguji jalur cloud (butuh kredensial Supabase asli + domain
// *.supabase.co, yang tidak ada di sandbox ini) -- itu tetap scope "smoke
// test manual di browser sungguhan" yang sama seperti Phase 12/13 (lihat
// PROJECT_STATUS.md). Test ini murni jaring pengaman regresi lokal.
//
// Jalankan: node scripts/test_phase14_guest_flow.mjs

import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body><div id='app'></div><div id='modal-outlet'></div></body></html>", {
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

async function main() {
  const { createTarotEngine } = await import("../js/tarot/tarot-engine.js");
  const { getSpreadById } = await import("../js/tarot/spreads.js");
  const { synthesizeReading } = await import("../js/tarot/interpretation.js");
  const { patchState, getState } = await import("../js/core/state.js");
  const { listReadings, getReadingById } = await import("../js/services/reading-service.js");
  const { listJournalEntries } = await import("../js/services/journal-service.js");
  const { getSettings, saveSettings } = await import("../js/services/settings-service.js");
  const resultPage = (await import("../js/pages/result.js")).default;
  const historyPage = (await import("../js/pages/history.js")).default;
  const historyDetailPage = (await import("../js/pages/history-detail.js")).default;
  const journalPage = (await import("../js/pages/journal.js")).default;
  const settingsPage = (await import("../js/pages/settings.js")).default;

  // Catatan: js/router.js memakai SATU node container yang sama untuk semua
  // page (container.innerHTML direset tiap navigasi, tapi listener yang
  // di-attach ke container ITU SENDIRI -- seperti container.addEventListener
  // di history.js/journal.js -- tidak pernah dilepas karena tidak ada page
  // selain reading.js yang implement destroy()). Ini perilaku PRA-Phase 14
  // (tidak diubah di sini) -- supaya test ini menguji tiap page-render
  // secara terisolasi (bukan ikut kena listener nyangkut dari page
  // sebelumnya), setiap langkah di bawah pakai container BARU, meniru apa
  // yang secara efektif terjadi di reload/kunjungan halaman baru.
  function freshContainer() {
    const el = document.createElement("div");
    document.body.appendChild(el);
    return el;
  }


  // ---- Susun satu reading "card_of_the_day" (1 kartu) selesai, persis
  // seperti finishReading() di js/pages/reading.js (lihat kutipan di
  // komentar file ini). ----
  const spreadId = "card_of_the_day";
  const spread = getSpreadById(spreadId);
  const engine = createTarotEngine();
  engine.createReading({ spreadId, question: "Apakah aku di jalur yang benar?" });
  engine.drawCard();
  engine.revealCurrentCard();
  const reading = engine.getReading();
  const entries = reading.cards.map((c) => ({
    card: engine.deck.drawnCards.find((dc) => dc.id === c.cardId),
    orientation: c.orientation,
    position: spread.positions.find((p) => p.id === c.positionId),
  }));
  const synthesis = synthesizeReading({ entries, category: "general", question: reading.question });
  const completed = engine.completeReading(synthesis.theme);
  patchState("reading", { ...completed, category: "general" });

  assert(getState().user === null, "state.user null di awal (guest)");

  // ---- Result page: render (async), lalu klik "Simpan Reading" ----
  const resultContainer = freshContainer();
  await resultPage.render(resultContainer);
  const saveBtn = resultContainer.querySelector("[data-save-reading]");
  assert(Boolean(saveBtn), "tombol Simpan Reading ada di Result page");
  assert(!saveBtn.disabled, "tombol Simpan Reading belum disabled sebelum diklik");

  saveBtn.click();
  // saveBtn click handler async -- tunggu microtask queue.
  await new Promise((r) => setTimeout(r, 20));
  assert(saveBtn.disabled, "tombol Simpan Reading disabled setelah diklik");

  const savedList = await listReadings();
  assert(savedList.length === 1, "reading tersimpan (listReadings length===1)");
  assert(savedList[0].category === "general", "category ikut tersimpan");

  const savedById = await getReadingById(savedList[0].id);
  assert(Boolean(savedById), "getReadingById menemukan reading yang baru disimpan");

  // ---- Tulis journal dari Result page ----
  const journalBtn = resultContainer.querySelector("[data-write-journal]");
  assert(journalBtn && !journalBtn.disabled, "tombol Tulis Journal aktif setelah save");
  journalBtn.click();
  const textarea = resultContainer.querySelector("[data-journal-slot] textarea");
  assert(Boolean(textarea), "journal editor textarea muncul");
  textarea.value = "Refleksi smoke test Phase 14.";
  const journalSaveBtn = resultContainer.querySelector("[data-journal-slot] [data-journal-save], [data-journal-slot] button[type=submit], [data-journal-slot] .btn--primary");
  assert(Boolean(journalSaveBtn), "tombol simpan journal editor ditemukan");
  journalSaveBtn.click();
  await new Promise((r) => setTimeout(r, 20));

  const journalEntries = await listJournalEntries();
  assert(journalEntries.length === 1, "journal entry tersimpan (length===1)");
  assert(journalEntries[0].readingId === savedList[0].id, "journal.readingId menunjuk ke id reading yang tersimpan (bukan id sementara)");

  // ---- History page: list + favorite toggle + delete ----
  const historyContainer = freshContainer();
  await historyPage.render(historyContainer);
  const readingItem = historyContainer.querySelector("[data-reading-item]");
  assert(Boolean(readingItem), "History menampilkan 1 item reading");

  const favBtn = historyContainer.querySelector("[data-favorite-reading]");
  favBtn.click();
  await new Promise((r) => setTimeout(r, 20));
  const afterFav = await listReadings();
  assert(afterFav[0].isFavorite === true, "favorite toggle tersimpan lewat History page");

  // ---- History Detail page ----
  const detailContainer = freshContainer();
  await historyDetailPage.render(detailContainer, { readingId: savedList[0].id });
  assert(detailContainer.querySelector(".result-page"), "History Detail merender halaman reading");
  assert(detailContainer.textContent.includes("Apakah aku di jalur yang benar?"), "History Detail menampilkan pertanyaan reading yang benar");

  // ---- Journal page: judul reading ter-resolve lewat readingsById map ----
  const journalContainer = freshContainer();
  await journalPage.render(journalContainer);
  assert(journalContainer.querySelector("[data-journal-item]"), "Journal page menampilkan 1 entry");
  assert(!journalContainer.textContent.includes("Reading tidak ditemukan"), "Journal page berhasil me-resolve judul reading (bukan fallback 'tidak ditemukan')");

  // ---- Delete reading dari History Detail (container baru lagi) ----
  const deleteContainer = freshContainer();
  await historyDetailPage.render(deleteContainer, { readingId: savedList[0].id });
  const deleteBtn = deleteContainer.querySelector("[data-delete-reading]");
  // History Detail delete pakai confirm modal -- klik lalu klik confirm.
  deleteBtn.click();
  const confirmBtn = document.querySelector("#modal-outlet [data-confirm-delete]");
  assert(Boolean(confirmBtn), "modal konfirmasi hapus muncul");
  confirmBtn.click();
  await new Promise((r) => setTimeout(r, 20));
  const afterDelete = await listReadings();
  assert(afterDelete.length === 0, "reading terhapus (listReadings length===0)");
  const journalAfterDelete = await listJournalEntries();
  assert(journalAfterDelete.length === 0, "journal ikut terhapus (cascade manual guest storage tetap jalan)");

  // ---- Settings page: reduced motion toggle (local cache path) ----
  const settingsContainer = freshContainer();
  await settingsPage.render(settingsContainer);
  const motionToggle = settingsContainer.querySelector("[data-reduced-motion-toggle]");
  assert(Boolean(motionToggle), "toggle Reduced Motion ada di Settings");
  assert(motionToggle.checked === false, "Reduced Motion default false");
  motionToggle.checked = true;
  motionToggle.dispatchEvent(new dom.window.Event("change"));
  await new Promise((r) => setTimeout(r, 20));
  assert(getSettings().reducedMotion === true, "saveSettings() (guest, tanpa user) tetap menulis ke cache lokal");
  assert(document.documentElement.dataset.reducedMotion === "true", "applyMotionPreference() menerapkan ke <html> data-reduced-motion");

  console.log(`\n${failures === 0 ? "SEMUA LULUS" : `${failures} GAGAL`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Test crash:", err);
  process.exit(1);
});
