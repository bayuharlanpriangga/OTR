// OTR — Dev-only smoke test (Phase 16 — Favorites)
// Sama pola dengan scripts/test_phase15_daily_card.mjs: simulasi jalur GUEST
// penuh (storage.js + favorite-service.js, tanpa state.user) untuk
// memastikan toggle/list favorit "card" & "spread" berperilaku benar tanpa
// login. Favorite Reading TIDAK diuji di sini -- itu jalur lama (Phase 8/10,
// setGuestReadingFavorite()), tidak disentuh oleh Phase 16.
//
// TIDAK menguji jalur cloud (tabel `favorites` di Supabase asli) -- sama
// seperti pola Phase 12/13/14/15, itu tetap scope "smoke test manual di
// browser sungguhan" (lihat PROJECT_STATUS.md). Test ini murni jaring
// pengaman regresi jalur guest.
//
// Jalankan: node scripts/test_phase16_favorites.mjs

import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body><div id='app'></div></body></html>", {
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
  // ---- 1. storage.js -- guest favorite helpers murni ----
  const storage = await import("../js/core/storage.js");

  assert(
    JSON.stringify(storage.listGuestFavoriteIds("card")) === "[]",
    "listGuestFavoriteIds() kosong sebelum ada favorit apa pun"
  );

  const fool = "major_00";
  const isFavAfterAdd = storage.toggleGuestFavorite("card", fool);
  assert(isFavAfterAdd === true, "toggleGuestFavorite() mengembalikan true saat MENAMBAH favorit");
  assert(
    storage.listGuestFavoriteIds("card").includes(fool),
    "listGuestFavoriteIds('card') memuat entity yang baru ditambahkan"
  );

  const isFavAfterRemove = storage.toggleGuestFavorite("card", fool);
  assert(isFavAfterRemove === false, "toggleGuestFavorite() mengembalikan false saat MENGHAPUS favorit");
  assert(
    !storage.listGuestFavoriteIds("card").includes(fool),
    "listGuestFavoriteIds('card') tidak lagi memuat entity setelah di-toggle off"
  );

  // entityType berbeda harus terisolasi satu sama lain (card vs spread,
  // walau entityId-nya kebetulan sama string-nya).
  storage.toggleGuestFavorite("card", "shared-id");
  storage.toggleGuestFavorite("spread", "shared-id");
  assert(
    storage.listGuestFavoriteIds("card").includes("shared-id") &&
      storage.listGuestFavoriteIds("spread").includes("shared-id"),
    "entityType 'card' dan 'spread' terisolasi (tidak saling menimpa) walau entityId sama"
  );
  assert(
    storage.listGuestFavoriteIds("card").length === 1 && storage.listGuestFavoriteIds("spread").length === 1,
    "toggle salah satu entityType tidak menambah entry di entityType lain"
  );

  // Reset localStorage sebelum lanjut ke lapisan service supaya independen
  // dari state yang ditinggalkan section di atas.
  localStorage.clear();

  // ---- 2. favorite-service.js -- jalur guest (tanpa state.user) ----
  const { listFavoriteEntityIds, toggleFavorite } = await import("../js/services/favorite-service.js");

  const emptySet = await listFavoriteEntityIds("spread");
  assert(emptySet instanceof Set && emptySet.size === 0, "listFavoriteEntityIds() guest: Set kosong di awal");

  const spreadId = "past_present_future";
  const afterToggleOn = await toggleFavorite("spread", spreadId);
  assert(afterToggleOn === true, "toggleFavorite() guest: true saat menandai favorit");

  const setAfterOn = await listFavoriteEntityIds("spread");
  assert(setAfterOn.has(spreadId), "listFavoriteEntityIds() guest mencerminkan favorit yang baru ditoggle");

  const afterToggleOff = await toggleFavorite("spread", spreadId);
  assert(afterToggleOff === false, "toggleFavorite() guest: false saat menghapus favorit");

  const setAfterOff = await listFavoriteEntityIds("spread");
  assert(!setAfterOff.has(spreadId), "listFavoriteEntityIds() guest tidak lagi memuat entity setelah dihapus");

  // ---- 3. Data nyata -- pastikan id yang dipakai test di atas valid (kalau
  // suatu saat data/default-spreads.js atau tarot-cards.js berubah, test ini
  // gagal duluan sebelum false positive) ----
  const { getCardById } = await import("../data/tarot-cards.js");
  const { getSpreadById } = await import("../js/tarot/spreads.js");
  assert(Boolean(getCardById(fool)), `id kartu "${fool}" yang dipakai test ini valid di data/tarot-cards.js`);
  assert(
    Boolean(getSpreadById(spreadId)),
    `id spread "${spreadId}" yang dipakai test ini valid di data/default-spreads.js`
  );

  console.log(`\n${failures === 0 ? "✅ Semua assertion lulus" : `❌ ${failures} assertion gagal`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
