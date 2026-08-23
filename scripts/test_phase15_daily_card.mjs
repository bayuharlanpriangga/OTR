// OTR — Dev-only smoke test (Phase 15 — Daily Card)
// Sama pola dengan scripts/test_phase14_guest_flow.mjs: simulasi jalur GUEST
// penuh lewat page module (js/pages/daily.js) untuk memastikan
// daily-service.js/daily-card.js/storage.js berperilaku benar tanpa login.
//
// TIDAK menguji jalur cloud (butuh kredensial Supabase asli + domain
// *.supabase.co, tidak ada di sandbox ini) -- sama seperti pola Phase 12/13/14,
// itu tetap scope "smoke test manual di browser sungguhan" (lihat
// PROJECT_STATUS.md). Test ini murni jaring pengaman regresi jalur guest +
// determinisme algoritma murni.
//
// Jalankan: node scripts/test_phase15_daily_card.mjs

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

function freshContainer() {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
}

async function main() {
  // ---- 1. Algoritma murni (js/tarot/daily-card.js) -- tanpa storage sama sekali ----
  const { getDailyCard, toDateKey } = await import("../js/tarot/daily-card.js");

  const seedId = "test-seed-abc";
  const dateA = "2026-08-23";
  const r1 = getDailyCard({ seedId, date: dateA });
  const r2 = getDailyCard({ seedId, date: dateA });
  assert(JSON.stringify(r1) === JSON.stringify(r2), "getDailyCard() deterministic untuk seedId+date yang sama (dipanggil 2x)");
  assert(Boolean(r1.cardId) && Boolean(r1.orientation) && Boolean(r1.reflectionPrompt), "getDailyCard() mengembalikan shape lengkap (cardId/orientation/reflectionPrompt)");

  const r3 = getDailyCard({ seedId, date: "2026-08-24" });
  assert(r1.date !== r3.date, "tanggal berbeda -> date key hasil berbeda");

  // toDateKey() harus berbasis komponen LOKAL, bukan UTC -- new Date(y,m,d,H)
  // di sini dibuat dari komponen lokal jam 01:30, harus tetap "hari yang
  // sama" (23), bukan mundur ke 22 gara-gara toISOString() UTC-shift.
  assert(toDateKey(new Date(2026, 7, 23, 1, 30)) === "2026-08-23", "toDateKey() pakai komponen tanggal LOKAL, bukan UTC");

  let threw = false;
  try {
    getDailyCard({ date: dateA }); // tanpa seedId
  } catch {
    threw = true;
  }
  assert(threw, "getDailyCard() throw kalau dipanggil tanpa seedId");

  // ---- 2. Storage layer (js/core/storage.js) -- guest id & upsert-by-date ----
  const { getOrCreateGuestId, listGuestDailyCards, saveGuestDailyCard, getGuestDailyCardByDate } = await import(
    "../js/core/storage.js"
  );

  const guestId1 = getOrCreateGuestId();
  const guestId2 = getOrCreateGuestId();
  assert(guestId1 === guestId2, "getOrCreateGuestId() stabil antar pemanggilan (localStorage persist)");

  saveGuestDailyCard({ date: "2026-08-20", cardId: "major_00", orientation: "upright", reflectionPrompt: "x", createdAt: "t1" });
  saveGuestDailyCard({ date: "2026-08-20", cardId: "major_01", orientation: "reversed", reflectionPrompt: "y", createdAt: "t2" });
  assert(listGuestDailyCards().length === 1, "saveGuestDailyCard() upsert by date -- bukan append duplikat untuk tanggal yang sama");
  assert(getGuestDailyCardByDate("2026-08-20").cardId === "major_01", "saveGuestDailyCard() upsert menimpa record lama dengan yang baru");

  // ---- 3. daily-service.js -- storage-first, compute-on-miss (guest) ----
  const { getTodayDailyCard, listDailyCardHistory } = await import("../js/services/daily-service.js");
  const { getState } = await import("../js/core/state.js");

  assert(getState().user === null, "state.user null di awal (guest)");

  const today1 = await getTodayDailyCard();
  assert(Boolean(today1?.card), "getTodayDailyCard() mengembalikan record dengan card ter-join");

  const today2 = await getTodayDailyCard();
  assert(today1.cardId === today2.cardId && today1.orientation === today2.orientation, "getTodayDailyCard() kartu SAMA di panggilan kedua (tidak berubah tiap refresh)");
  assert(today1.date === today2.date, "getTodayDailyCard() date SAMA di panggilan kedua");

  const historyList = await listDailyCardHistory(30);
  assert(historyList.some((h) => h.date === today1.date), "listDailyCardHistory() menyertakan kartu hari ini");
  assert(historyList.some((h) => h.date === "2026-08-20"), "listDailyCardHistory() menyertakan record lama yang disimpan manual di atas");
  assert(historyList.every((h) => Boolean(h.card)), "setiap entry listDailyCardHistory() punya card ter-join");

  // ---- 4. js/pages/daily.js -- render penuh, hero + meaning + reflection + history ----
  const dailyPage = (await import("../js/pages/daily.js")).default;
  const container = freshContainer();
  await dailyPage.render(container);

  assert(container.querySelector("[data-tarot-card]"), "Daily page merender tarot-card component (hero)");
  assert(container.querySelector("[data-tarot-card]")?.dataset.revealed === "true", "hero card langsung revealed (bukan card back)");
  assert(container.textContent.includes(today1.card.name), "nama kartu hari ini muncul di halaman");
  assert(container.textContent.includes("Daily Meaning"), "section Daily Meaning ada");
  assert(container.textContent.includes("Reflection"), "section Reflection ada");
  assert(container.textContent.includes(today1.reflectionPrompt), "reflectionPrompt yang tersimpan ditampilkan apa adanya (immutable)");
  assert(container.textContent.includes("Daily History"), "section Daily History ada");
  assert(container.textContent.includes("20 Agu"), "riwayat 2026-08-20 muncul di daftar Daily History (format tanggal pendek)");
  assert(!container.querySelector("[data-tarot-card]")?.closest("[data-history-list]"), "sanity: hero bukan bagian dari list riwayat");

  console.log(`\n${failures === 0 ? "SEMUA LULUS" : `${failures} GAGAL`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Test crash:", err);
  process.exit(1);
});
