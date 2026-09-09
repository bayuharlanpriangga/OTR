// OTR — Dev-only smoke test (Phase 19 — Custom Spread)
// Sama pola dengan test_phase16_favorites.mjs: simulasi jalur GUEST penuh
// (storage.js + custom-spread-service.js, tanpa state.user) untuk
// memastikan create/update/delete/list custom spread berperilaku benar
// tanpa login, PLUS registry in-memory di js/tarot/spreads.js
// (ensureCustomSpreadsLoaded/registerCustomSpread/unregisterCustomSpread/
// getSpreadById yang diperluas).
//
// TIDAK menguji jalur cloud (tabel `spreads`/`spread_positions` di Supabase
// asli, atau migrateGuestCustomSpreads() di migration-service.js) -- sama
// seperti pola Phase 12-18, itu tetap scope "smoke test manual di browser
// sungguhan" (lihat PROJECT_STATUS.md). Test ini murni jaring pengaman
// regresi jalur guest + logic registry yang murni/sinkron.
//
// Jalankan: node scripts/test_phase19_custom_spreads.mjs

import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body><div id='app'></div></body></html>", {
  url: "http://localhost/",
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed += 1;
  } else {
    failed += 1;
    console.error(`  FAIL: ${message}`);
  }
}

function section(title) {
  console.log(`\n${title}`);
}

async function main() {
  const storage = await import("../js/core/storage.js");
  const customSpreadService = await import("../js/services/custom-spread-service.js");
  const spreads = await import("../js/tarot/spreads.js");

  // ---- 1. Kosong sebelum ada apa-apa ------------------------------------

  section("1. listCustomSpreads() kosong di awal");
  {
    const list = await customSpreadService.listCustomSpreads();
    assert(Array.isArray(list) && list.length === 0, "harus array kosong sebelum ada custom spread apa pun");
  }

  // ---- 2. Create -- validasi input --------------------------------------

  section("2. createCustomSpread() validasi input");
  {
    await assertRejects(
      () => customSpreadService.createCustomSpread({ name: "", positions: [{ name: "A" }] }),
      "nama kosong harus ditolak"
    );
    await assertRejects(
      () => customSpreadService.createCustomSpread({ name: "Test", positions: [] }),
      "0 posisi harus ditolak"
    );
    await assertRejects(
      () =>
        customSpreadService.createCustomSpread({
          name: "Test",
          positions: Array.from({ length: 11 }, (_, i) => ({ name: `Posisi ${i}` })),
        }),
      "11 posisi (melebihi MAX_POSITIONS=10) harus ditolak"
    );
    await assertRejects(
      () => customSpreadService.createCustomSpread({ name: "Test", positions: [{ name: "A" }, { name: "" }] }),
      "posisi tanpa nama harus ditolak"
    );
  }

  // ---- 3. Create -- sukses -----------------------------------------------

  section("3. createCustomSpread() sukses menghasilkan shape yang benar");
  let decisionSpread;
  {
    decisionSpread = await customSpreadService.createCustomSpread({
      name: "My Decision Spread",
      category: "general",
      description: "Untuk keputusan besar",
      positions: [
        { name: "What I want" },
        { name: "What I fear" },
        { name: "What I don't see" },
        { name: "Path A" },
        { name: "Path B" },
      ],
    });
    assert(typeof decisionSpread.id === "string" && decisionSpread.id.length > 0, "id harus terisi");
    assert(decisionSpread.name === "My Decision Spread", "nama harus tersimpan apa adanya");
    assert(decisionSpread.cardCount === 5, `cardCount harus 5, dapat ${decisionSpread.cardCount}`);
    assert(decisionSpread.isCustom === true, "isCustom harus true");
    assert(decisionSpread.positions.length === 5, "jumlah posisi harus 5");
    assert(
      decisionSpread.positions.every((p, i) => p.index === i && p.id === `pos_${i}`),
      "index & id tiap posisi harus berurutan 0..4 dan berformat pos_N"
    );
    assert(decisionSpread.positions[1].name === "What I fear", "nama posisi ke-2 harus sesuai input");
  }

  // ---- 4. List -- newest-first --------------------------------------------

  section("4. listCustomSpreads() newest-first");
  let quickSpread;
  {
    quickSpread = await customSpreadService.createCustomSpread({
      name: "Quick Check",
      positions: [{ name: "Vibe" }],
    });
    const list = await customSpreadService.listCustomSpreads();
    assert(list.length === 2, `harus ada 2 spread, dapat ${list.length}`);
    assert(list[0].id === quickSpread.id, "spread yang PALING BARU dibuat harus di posisi pertama");
  }

  // ---- 5. Update -- metadata & nama posisi (jumlah sama) ------------------

  section("5. updateCustomSpread() mengubah metadata & nama posisi");
  {
    const updated = await customSpreadService.updateCustomSpread(decisionSpread.id, {
      name: "My Big Decision",
      category: "career",
      description: "Diperbarui",
      positions: [
        { name: "Apa yang kuinginkan" },
        { name: "What I fear" },
        { name: "What I don't see" },
        { name: "Path A" },
        { name: "Path B" },
      ],
    });
    assert(updated.name === "My Big Decision", "nama harus berubah");
    assert(updated.category === "career", "kategori harus berubah");
    assert(updated.positions[0].name === "Apa yang kuinginkan", "nama posisi pertama harus berubah");
    assert(updated.positions[0].index === 0 && updated.positions[0].id === "pos_0", "index/id posisi harus tetap sama setelah edit");
    assert(updated.cardCount === 5, "cardCount tidak boleh berubah lewat edit");
  }

  // ---- 6. Update -- jumlah posisi tidak boleh berubah ---------------------

  section("6. updateCustomSpread() menolak perubahan jumlah posisi");
  {
    await assertRejects(
      () =>
        customSpreadService.updateCustomSpread(decisionSpread.id, {
          name: "X",
          positions: [{ name: "Cuma satu" }],
        }),
      "mengubah 5 posisi jadi 1 posisi saat edit harus ditolak"
    );
  }

  // ---- 7. Update -- id tidak ditemukan -------------------------------------

  section("7. updateCustomSpread() spread tidak ditemukan");
  {
    await assertRejects(
      () => customSpreadService.updateCustomSpread("cspread_tidak_ada", { name: "X", positions: [{ name: "A" }] }),
      "update ke id yang tidak ada harus ditolak"
    );
  }

  // ---- 8. Delete -- ditolak kalau masih dipakai reading -------------------

  section("8. deleteCustomSpread() ditolak kalau masih dipakai reading tersimpan");
  {
    storage.saveGuestReading({
      id: "reading_pakai_quick",
      spreadId: quickSpread.id,
      status: "completed",
      cards: [],
      createdAt: new Date().toISOString(),
    });
    await assertRejects(
      () => customSpreadService.deleteCustomSpread(quickSpread.id),
      "delete spread yang masih dipakai reading tersimpan harus ditolak"
    );
    const stillThere = await customSpreadService.listCustomSpreads();
    assert(stillThere.some((s) => s.id === quickSpread.id), "spread tidak boleh ikut terhapus kalau delete ditolak");
  }

  // ---- 9. Delete -- sukses kalau tidak dipakai ----------------------------

  section("9. deleteCustomSpread() sukses kalau tidak dipakai reading apa pun");
  {
    await customSpreadService.deleteCustomSpread(decisionSpread.id);
    const list = await customSpreadService.listCustomSpreads();
    assert(!list.some((s) => s.id === decisionSpread.id), "spread yang dihapus tidak boleh muncul lagi di list");
    assert(list.length === 1, `harus tersisa 1 spread (quickSpread), dapat ${list.length}`);
  }

  // ---- 10. Registry spreads.js -- getSpreadById tetap resolve sistem -----

  section("10. getSpreadById() tetap resolve spread SISTEM seperti sebelumnya");
  {
    const system = spreads.getSpreadById("card_of_the_day");
    assert(system?.id === "card_of_the_day", "spread sistem harus tetap resolve normal (regresi Phase 2)");
  }

  // ---- 11. Registry spreads.js -- custom spread TIDAK terlihat sebelum di-load --

  section("11. getSpreadById() TIDAK melihat custom spread sebelum ensureCustomSpreadsLoaded()");
  {
    // Modul spreads.js baru di-import fresh di test ini -- registrynya
    // masih kosong sampai ensureCustomSpreadsLoaded() dipanggil eksplisit
    // (lihat komentar lengkap di spreads.js kenapa ini sengaja begini).
    const beforeLoad = spreads.getSpreadById(quickSpread.id);
    assert(beforeLoad === undefined, "custom spread belum boleh resolve sebelum registry dimuat");
  }

  // ---- 12. ensureCustomSpreadsLoaded() + getSpreadById() -----------------

  section("12. ensureCustomSpreadsLoaded() membuat custom spread resolve lewat getSpreadById()");
  {
    await spreads.ensureCustomSpreadsLoaded();
    const found = spreads.getSpreadById(quickSpread.id);
    assert(found?.id === quickSpread.id, "custom spread harus resolve setelah registry dimuat");
    assert(found?.name === "Quick Check", "nama harus sesuai");
  }

  // ---- 13. Memoization -- panggilan kedua tidak fetch ulang --------------

  section("13. ensureCustomSpreadsLoaded() memoized selama key (user) sama");
  {
    // Hapus 1 spread LANGSUNG lewat service (tanpa lewat registry) --
    // kalau ensureCustomSpreadsLoaded() TIDAK memoized, panggilan berikut
    // akan fetch ulang dan spread yang baru dihapus ini akan hilang dari
    // registry juga. Kalau MEMOIZED (seharusnya), registry tetap
    // menampilkan versi lama sampai ada perubahan key.
    await customSpreadService.createCustomSpread({ name: "Sementara", positions: [{ name: "X" }] });
    await spreads.ensureCustomSpreadsLoaded(); // key belum berubah -> no-op
    const stillOld = spreads.listRegisteredCustomSpreads();
    assert(
      !stillOld.some((s) => s.name === "Sementara"),
      "registry tidak boleh otomatis ter-refresh tanpa key (login state) berubah -- harus manual lewat registerCustomSpread()"
    );
  }

  // ---- 14. registerCustomSpread()/unregisterCustomSpread() manual -------

  section("14. registerCustomSpread()/unregisterCustomSpread() manual");
  {
    const manual = { id: "cspread_manual_test", name: "Manual", cardCount: 1, positions: [], isCustom: true };
    spreads.registerCustomSpread(manual);
    assert(spreads.getSpreadById("cspread_manual_test")?.name === "Manual", "registerCustomSpread() harus langsung terlihat getSpreadById()");
    spreads.unregisterCustomSpread("cspread_manual_test");
    assert(spreads.getSpreadById("cspread_manual_test") === undefined, "unregisterCustomSpread() harus menghapus dari registry");
  }

  // ---- Ringkasan ------------------------------------------------------------

  console.log(`\n${passed}/${passed + failed} assertion lulus.`);
  if (failed > 0) {
    console.error(`${failed} assertion GAGAL.`);
    process.exit(1);
  }
}

async function assertRejects(fn, message) {
  try {
    await fn();
    failed += 1;
    console.error(`  FAIL: ${message} (tidak throw)`);
  } catch {
    passed += 1;
  }
}

main().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
