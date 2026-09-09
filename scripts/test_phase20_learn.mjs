// OTR — Dev-only smoke test (Phase 20 — Learn Tarot)
// learn.js tidak punya service layer terpisah (konten murni derived dari
// data/tarot-cards.js & default-spreads.js yang sudah di memory, tanpa
// fetch/persistence sama sekali) -- jadi test ini langsung memanggil
// `render(container, params)` page module lewat jsdom (pola sama dengan
// test level-halaman lain di app ini) dan memeriksa struktur HTML yang
// dihasilkan, bukan menguji fungsi internal murni terpisah seperti
// statistics-service.js/custom-spread-service.js.
//
// Jalankan: node scripts/test_phase20_learn.mjs

import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body><div id='app'></div></body></html>", {
  url: "http://localhost/",
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;

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

function freshContainer() {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
}

async function main() {
  const learn = (await import("../js/pages/learn.js")).default;
  const { getAllCards, getCardsByArcana, getCardsBySuit } = await import("../data/tarot-cards.js");
  const { getAllSpreads } = await import("../js/tarot/spreads.js");

  // ---- 1. Default section (tanpa params / params kosong) -----------------

  section("1. Tanpa params.section -> default ke 'basics'");
  {
    const container = freshContainer();
    learn.render(container, {});
    assert(container.querySelector("h1")?.textContent === "Belajar Tarot", "h1 harus 'Belajar Tarot'");
    assert(container.querySelector("h2")?.textContent === "Tarot Basics", "h2 default harus 'Tarot Basics'");
  }

  // ---- 2. params.section tidak valid -> tetap fallback ke basics --------

  section("2. params.section tidak dikenal -> fallback ke 'basics' (bukan crash)");
  {
    const container = freshContainer();
    learn.render(container, { section: "bukan-section-asli" });
    assert(container.querySelector("h2")?.textContent === "Tarot Basics", "section tidak valid harus fallback ke basics");
  }

  // ---- 3. Major Arcana -- semua 22 kartu tertaut ke Library --------------

  section("3. Section 'major-arcana' menampilkan semua 22 kartu");
  {
    const container = freshContainer();
    learn.render(container, { section: "major-arcana" });
    assert(container.querySelector("h2")?.textContent === "Major Arcana", "h2 harus 'Major Arcana'");
    const links = [...container.querySelectorAll('a.badge[href^="#/library/"]')];
    const majorCards = getCardsByArcana("major");
    assert(links.length === majorCards.length, `harus ada ${majorCards.length} link kartu, dapat ${links.length}`);
    assert(
      majorCards.every((c) => links.some((a) => a.getAttribute("href") === `#/library/${c.id}`)),
      "setiap kartu Major Arcana harus tertaut ke Card Detail-nya"
    );
  }

  // ---- 4. Minor Arcana -- ringkasan jumlah per suit ----------------------

  section("4. Section 'minor-arcana' menampilkan ringkasan 4 suit x 14 kartu");
  {
    const container = freshContainer();
    learn.render(container, { section: "minor-arcana" });
    // Dibatasi ke dalam .grid-cards (kartu ringkasan per suit) -- bukan
    // seluruh textContent section, karena paragraf pembuka section ini
    // SENGAJA juga menyebut "14 kartu" dalam kalimat prosa
    // ("masing-masing berisi 14 kartu: Ace sampai 10...") sebagai bagian
    // penjelasan, bukan bug/duplikasi.
    const summaryText = container.querySelector(".grid-cards")?.textContent ?? "";
    const occurrences = (summaryText.match(/14 kartu/g) || []).length;
    assert(occurrences === 4, `harus ada 4 kartu ringkasan suit dengan "14 kartu", dapat ${occurrences}`);
  }

  // ---- 5. Suits -- 4 blok suit dengan contoh kartu -----------------------

  section("5. Section 'suits' menampilkan 4 suit dengan contoh kartu");
  {
    const container = freshContainer();
    learn.render(container, { section: "suits" });
    ["Wands", "Cups", "Swords", "Pentacles"].forEach((label) => {
      assert(
        [...container.querySelectorAll("h3")].some((h) => h.textContent === label),
        `harus ada heading suit "${label}"`
      );
    });
    const links = container.querySelectorAll('a.badge[href^="#/library/"]');
    assert(links.length === 4 * 4, `harus ada 16 contoh kartu (4 per suit), dapat ${links.length}`);
  }

  // ---- 6. Numbers -- 10 baris Ace..10 -------------------------------------

  section("6. Section 'numbers' menampilkan 10 rank (Ace..10)");
  {
    const container = freshContainer();
    learn.render(container, { section: "numbers" });
    const badges = [...container.querySelectorAll('[data-learn-content] .card .badge')];
    assert(badges.length === 10, `harus ada 10 baris angka, dapat ${badges.length}`);
    assert(badges[0].textContent === "Ace", "baris pertama harus 'Ace'");
    assert(badges[9].textContent === "10", "baris terakhir harus '10'");
  }

  // ---- 7. Court Cards -- 16 kartu (4 rank x 4 suit) ----------------------

  section("7. Section 'court-cards' menampilkan semua 16 court card");
  {
    const container = freshContainer();
    learn.render(container, { section: "court-cards" });
    ["Page", "Knight", "Queen", "King"].forEach((label) => {
      assert(
        [...container.querySelectorAll("h3")].some((h) => h.textContent === label),
        `harus ada heading rank "${label}"`
      );
    });
    const links = [...container.querySelectorAll('a.badge[href^="#/library/"]')];
    const courtCards = getAllCards().filter((c) => ["page", "knight", "queen", "king"].includes(c.rank));
    assert(links.length === 16, `harus ada 16 court card total, dapat ${links.length}`);
    assert(courtCards.length === 16, "sanity: data sumber juga harus tepat 16 court card");
  }

  // ---- 8. Reversed Cards -- menyebut mekanisme 50% -----------------------

  section("8. Section 'reversed-cards' menyebut probabilitas 50%");
  {
    const container = freshContainer();
    learn.render(container, { section: "reversed-cards" });
    assert(container.textContent.includes("50%"), "harus menyebut probabilitas 50%");
  }

  // ---- 9. Spreads -- semua system spread + CTA Custom Spread -------------

  section("9. Section 'spreads' menampilkan semua system spread + CTA Custom Spread");
  {
    const container = freshContainer();
    learn.render(container, { section: "spreads" });
    const spreads = getAllSpreads();
    const spreadHeadings = [...container.querySelectorAll("[data-learn-content] h3")].map((h) => h.textContent);
    assert(
      spreads.every((s) => spreadHeadings.includes(s.name)),
      "setiap system spread harus muncul sebagai heading"
    );
    const cta = container.querySelector('a[href="#/custom-spreads"]');
    assert(cta !== null, "harus ada CTA link ke Custom Spread Builder");
  }

  // ---- 10. TOC -- section aktif ditandai btn--primary, sisanya btn--secondary --

  section("10. TOC menandai section aktif dengan btn--primary");
  {
    const container = freshContainer();
    learn.render(container, { section: "suits" });
    const nav = container.querySelector("nav");
    const primaryLinks = [...nav.querySelectorAll("a.btn--primary")];
    assert(primaryLinks.length === 1, `harus cuma 1 link aktif (btn--primary), dapat ${primaryLinks.length}`);
    assert(primaryLinks[0].getAttribute("href") === "#/learn/suits", "link aktif harus mengarah ke section 'suits'");
    const secondaryLinks = nav.querySelectorAll("a.btn--secondary");
    assert(secondaryLinks.length === 7, `7 section lain harus btn--secondary, dapat ${secondaryLinks.length}`);
  }

  // ---- Ringkasan ------------------------------------------------------------

  console.log(`\n${passed}/${passed + failed} assertion lulus.`);
  if (failed > 0) {
    console.error(`${failed} assertion GAGAL.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
