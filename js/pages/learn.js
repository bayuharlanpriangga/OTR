// OTR — Page: Learn Tarot (Phase 20 — Learn Tarot, Roadmap Phase 20,
// Master Spec §70 "Learning Module")
//
// DONE WHEN Roadmap: "User dapat belajar tarot dari OTR tanpa harus
// melakukan reading." Section yang didaftarkan Roadmap (8, urutan ini yang
// dipakai jadi urutan TOC di bawah): Tarot Basics, Major Arcana, Minor
// Arcana, Suits, Numbers, Court Cards, Reversed Cards, Spreads.
//
// KEPUTUSAN SCOPE:
// - Master Spec §70 menandai "Learning Module" sebagai "Future module" dan
//   punya skema "Learning progress" ({userId, lessonId, progress,
//   completedAt}) -- TIDAK diimplementasikan di sini. DONE WHEN Roadmap
//   Phase 20 sendiri cuma minta user bisa BELAJAR, tidak menyebut tracking
//   progress sama sekali (beda dari Master Spec §70 yang menyebutnya).
//   Progress tracking kemungkinan lebih related ke Quiz (Roadmap Phase 21,
//   Master Spec §71-72 menyebut "Learning progress" berdampingan dengan
//   Quiz Engine) -- ditunda ke sana, BUKAN dibangun setengah-setengah di
//   sini tanpa kebutuhan konkret. Konsisten dengan keputusan sadar yang
//   sama seperti Custom Spread (Phase 19) yang juga "Future" di Master Spec
//   tapi Roadmap eksplisit punya fase untuk itu.
// - "Practice" (item ke-9 di daftar Master Spec §70, TIDAK ada di daftar
//   Roadmap Phase 20) SENGAJA tidak dibuat -- Roadmap adalah sumber urutan
//   fase yang dipakai proyek ini, dan practice/quiz sudah py sendiri di
//   Phase 21.
// - Semua konten edukasi di bawah ditulis ORISINAL untuk sesi ini (bukan
//   parafrase dekat dari buku/situs tarot manapun) -- pengetahuan umum
//   tarot yang sudah jadi domain publik (makna Major/Minor Arcana, suit,
//   angka, court card, reversed), diringkas dengan kalimat sendiri.
//
// Konten Major Arcana/Minor Arcana/Suits/Court Cards REUSE
// data/tarot-cards.js (bukan menulis ulang daftar 78 kartu) -- setiap kartu
// yang disebut ditautkan ke Card Detail (`#/library/:cardId`, Phase 9) buat
// makna lengkap upright/reversed. Section Spreads REUSE getAllSpreads()
// (Phase 2) + menautkan ke Custom Spread Builder (`#/custom-spreads`,
// Phase 19).

import { getAllCards, getCardsByArcana, getCardsBySuit } from "../../data/tarot-cards.js";
import { getAllSpreads } from "../tarot/spreads.js";

const SECTIONS = [
  { slug: "basics", label: "Tarot Basics" },
  { slug: "major-arcana", label: "Major Arcana" },
  { slug: "minor-arcana", label: "Minor Arcana" },
  { slug: "suits", label: "Suits" },
  { slug: "numbers", label: "Numbers" },
  { slug: "court-cards", label: "Court Cards" },
  { slug: "reversed-cards", label: "Reversed Cards" },
  { slug: "spreads", label: "Spreads" },
];

const SUIT_LABELS = { wands: "Wands", cups: "Cups", swords: "Swords", pentacles: "Pentacles" };
const SUIT_BLURBS = {
  wands: "Elemen api — soal aksi, gairah, ambisi, kreativitas, dan langkah karier. Wands bicara tentang dorongan untuk BERGERAK.",
  cups: "Elemen air — soal emosi, hubungan, intuisi, dan kehidupan batin. Cups bicara tentang apa yang DIRASAKAN.",
  swords: "Elemen udara — soal pikiran, komunikasi, konflik, dan keputusan. Swords bicara tentang apa yang DIPIKIRKAN.",
  pentacles: "Elemen tanah — soal materi, tubuh, pekerjaan, uang, dan stabilitas. Pentacles bicara tentang apa yang DIBANGUN.",
};

const RANK_ORDER = ["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const RANK_MEANINGS = {
  ace: "Awal mula — potensi mentah dari elemen suit ini, sebelum dibentuk jadi apa pun.",
  2: "Keseimbangan & pilihan — dua kemungkinan atau dua pihak yang perlu diselaraskan.",
  3: "Pertumbuhan — hasil awal mulai terlihat, sering lewat kolaborasi atau ekspresi ke luar.",
  4: "Stabilitas — fondasi mulai terbentuk, fase membangun struktur yang lebih permanen.",
  5: "Guncangan — konflik, kehilangan, atau perubahan yang menantang stabilitas sebelumnya.",
  6: "Harmoni — keseimbangan baru ditemukan, sering lewat memberi atau menerima bantuan.",
  7: "Refleksi — jeda untuk mengevaluasi, kesabaran sebelum melangkah lebih jauh.",
  8: "Fokus — energi terkonsentrasi, penguasaan atau kerja keras menuju satu arah.",
  9: "Hampir sampai — kematangan, tinggal selangkah lagi menuju penyelesaian penuh.",
  10: "Penyelesaian — siklus penuh dari suit ini selesai, sekaligus jadi pintu ke Ace berikutnya.",
};

const COURT_ORDER = ["page", "knight", "queen", "king"];
const COURT_LABELS = { page: "Page", knight: "Knight", queen: "Queen", king: "King" };
const COURT_MEANINGS = {
  page: "Pembelajar & pembawa pesan — energi yang masih baru terhadap suit ini, penuh rasa ingin tahu.",
  knight: "Pengejar — energi yang bergerak aktif, kadang impulsif, mengejar sesuatu dengan penuh semangat.",
  queen: "Penguasaan yang mengalir dari dalam — kematangan suit ini yang sudah terinternalisasi, sering bersifat mengasuh.",
  king: "Otoritas & kepemimpinan — penguasaan penuh atas suit ini, dipakai untuk memimpin atau mengambil keputusan besar.",
};

function escapeHTML(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function cardChip(card) {
  return `<a class="badge" href="#/library/${card.id}" style="text-decoration:none;">${escapeHTML(card.name)}</a>`;
}

function chipListHTML(cards) {
  return `<div class="row gap-2" style="flex-wrap:wrap;">${cards.map(cardChip).join("")}</div>`;
}

// ---- Section content -------------------------------------------------

function basicsSectionHTML() {
  return `
    <div class="stack gap-4">
      <p>Tarot adalah satu set 78 kartu yang dipakai sebagai alat refleksi — bukan alat ramal yang memastikan masa depan. Dek tarot terbagi jadi dua kelompok besar: <strong>22 kartu Major Arcana</strong> yang mewakili tema-tema besar dalam hidup, dan <strong>56 kartu Minor Arcana</strong> yang mewakili situasi & dinamika sehari-hari.</p>
      <p>Saat melakukan reading, kamu memilih sebuah <strong>spread</strong> — susunan posisi kartu, di mana tiap posisi mewakili sudut pandang atau pertanyaan tertentu (misalnya "masa lalu", "sekarang", "masa depan"). Kartu yang ditarik untuk tiap posisi lalu ditafsirkan berdasarkan tiga hal: posisi itu sendiri, arah kartu (tegak atau terbalik), dan pertanyaan yang kamu bawa.</p>
      <p class="text-muted">Penting: anggap tiap kartu sebagai cermin untuk memikirkan ulang situasimu dari sudut yang berbeda — bukan instruksi mutlak yang harus diikuti begitu saja.</p>
      <p>Siap coba langsung? <a href="#/reading">Mulai Reading</a> atau lihat dulu <a href="#/library">seluruh 78 kartu di Tarot Library</a>.</p>
    </div>
  `;
}

function majorArcanaSectionHTML() {
  const cards = getCardsByArcana("major");
  return `
    <div class="stack gap-4">
      <p>22 kartu Major Arcana diberi nomor 0 sampai 21, dimulai dari The Fool. Kartu-kartu ini mewakili perjalanan & tema besar dalam hidup — transformasi, cinta, tantangan, pencerahan. Kalau Major Arcana muncul dalam reading-mu, itu biasanya menandakan momen atau tema yang bobotnya lebih besar dibanding kartu Minor Arcana.</p>
      ${chipListHTML(cards)}
      <p class="text-sm text-muted">Klik nama kartu untuk lihat makna lengkapnya di Tarot Library.</p>
    </div>
  `;
}

function minorArcanaSectionHTML() {
  const suits = ["wands", "cups", "swords", "pentacles"];
  return `
    <div class="stack gap-4">
      <p>56 kartu Minor Arcana terbagi ke dalam 4 suit (Wands, Cups, Swords, Pentacles), masing-masing berisi 14 kartu: Ace sampai 10, ditambah 4 court card (Page, Knight, Queen, King). Kalau Major Arcana bicara soal tema besar, Minor Arcana lebih bicara soal detail & dinamika keseharian — pekerjaan, komunikasi, perasaan, hal-hal praktis.</p>
      <div class="grid-cards" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));">
        ${suits
          .map((s) => {
            const count = getCardsBySuit(s).length;
            return `<div class="card stack gap-1"><h3>${SUIT_LABELS[s]}</h3><p class="text-sm text-muted">${count} kartu</p></div>`;
          })
          .join("")}
      </div>
      <p>Untuk penjelasan tiap suit lihat section <a href="#/learn/suits">Suits</a>, untuk arti angka lihat <a href="#/learn/numbers">Numbers</a>, dan untuk Page/Knight/Queen/King lihat <a href="#/learn/court-cards">Court Cards</a>.</p>
    </div>
  `;
}

function suitsSectionHTML() {
  const suits = ["wands", "cups", "swords", "pentacles"];
  return `
    <div class="stack gap-5">
      <p>Tiap suit di Minor Arcana punya "kepribadian" elemen sendiri:</p>
      ${suits
        .map((s) => {
          const examples = getCardsBySuit(s).slice(0, 4);
          return `
            <div class="card stack gap-2">
              <h3>${SUIT_LABELS[s]}</h3>
              <p class="text-sm text-muted">${SUIT_BLURBS[s]}</p>
              ${chipListHTML(examples)}
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function numbersSectionHTML() {
  return `
    <div class="stack gap-4">
      <p>Di Minor Arcana, angka Ace sampai 10 punya makna dasar yang konsisten di semua suit — angkanya sama, cuma "dicat" dengan warna elemen suit masing-masing.</p>
      <div class="stack gap-3">
        ${RANK_ORDER.map(
          (r) => `
          <div class="card row gap-4" style="align-items:baseline;">
            <span class="badge" style="min-width:3.5em; text-align:center;">${r === "ace" ? "Ace" : r}</span>
            <p class="text-sm text-muted">${RANK_MEANINGS[r]}</p>
          </div>
        `
        ).join("")}
      </div>
    </div>
  `;
}

function courtCardsSectionHTML() {
  return `
    <div class="stack gap-5">
      <p>16 court card (4 rank × 4 suit) mewakili "kepribadian" atau tahap penguasaan atas energi suit-nya masing-masing:</p>
      ${COURT_ORDER.map((rank) => {
        const cards = getAllCards().filter((c) => c.rank === rank);
        return `
          <div class="card stack gap-2">
            <h3>${COURT_LABELS[rank]}</h3>
            <p class="text-sm text-muted">${COURT_MEANINGS[rank]}</p>
            ${chipListHTML(cards)}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function reversedCardsSectionHTML() {
  return `
    <div class="stack gap-4">
      <p>Di OTR, tiap kartu punya kemungkinan 50% muncul <strong>terbalik (reversed)</strong> tiap kali ditarik — dicek ulang secara acak setiap kali, bukan sifat tetap kartunya.</p>
      <p>Kartu reversed umumnya BUKAN berarti "kebalikan total" dari makna tegaknya. Cara paling umum memahaminya: energi kartu itu sedang <strong>diblokir</strong>, <strong>ditahan ke dalam</strong>, <strong>masih dalam proses</strong>, atau butuh perhatian ekstra sebelum bisa mengalir penuh seperti makna tegaknya.</p>
      <p class="text-sm text-muted">Tiap kartu di Tarot Library punya makna upright & reversed masing-masing — bandingkan langsung untuk lihat perbedaannya.</p>
    </div>
  `;
}

function spreadsSectionHTML() {
  const spreads = getAllSpreads();
  return `
    <div class="stack gap-4">
      <p>Spread adalah susunan posisi untuk sebuah reading — tiap posisi punya sudut pandang atau pertanyaan sendiri. Makin banyak posisi, makin detail (tapi juga makin panjang) reading-nya.</p>
      <div class="stack gap-3">
        ${spreads
          .map(
            (s) => `
          <div class="card stack gap-2">
            <div class="row gap-3" style="justify-content:space-between; align-items:baseline;">
              <h3>${escapeHTML(s.name)}</h3>
              <span class="badge">${s.cardCount} kartu</span>
            </div>
            ${s.description ? `<p class="text-sm text-muted">${escapeHTML(s.description)}</p>` : ""}
            <div class="row gap-2" style="flex-wrap:wrap;">
              ${s.positions.map((p) => `<span class="badge">${escapeHTML(p.name)}</span>`).join("")}
            </div>
          </div>
        `
          )
          .join("")}
      </div>
      <div class="card stack gap-2">
        <h3>Mau spread sendiri?</h3>
        <p class="text-sm text-muted">Buat tata letak posisi sendiri lewat Custom Spread Builder — jumlah posisi bebas.</p>
        <a class="btn btn--secondary" href="#/custom-spreads" style="align-self:flex-start;">Buka Custom Spread Builder</a>
      </div>
    </div>
  `;
}

// Phase 21 — Quiz. CTA ini SENGAJA tampil di SEMUA section (dipanggil dari
// template(), bukan jadi bagian salah satu SECTION_RENDERERS) -- "practice"
// relevan terlepas dari section mana yang lagi dibaca, dan Roadmap Phase 21
// sendiri menyebut Goal-nya "Interactive learning" (pelengkap Learn, bukan
// fitur section tersendiri).
function quizCtaHTML() {
  return `
    <div class="card weave stack gap-2">
      <p class="eyebrow">Practice</p>
      <h3>Uji pemahamanmu</h3>
      <p class="text-sm text-muted">Coba kuis singkat dari materi yang baru saja kamu baca — Major Arcana, Suits, Numbers, Court Cards, atau campuran semuanya.</p>
      <a class="btn btn--primary" href="#/quiz" style="align-self:flex-start;">Mulai Kuis</a>
    </div>
  `;
}

const SECTION_RENDERERS = {
  basics: basicsSectionHTML,
  "major-arcana": majorArcanaSectionHTML,
  "minor-arcana": minorArcanaSectionHTML,
  suits: suitsSectionHTML,
  numbers: numbersSectionHTML,
  "court-cards": courtCardsSectionHTML,
  "reversed-cards": reversedCardsSectionHTML,
  spreads: spreadsSectionHTML,
};

function tocHTML(activeSlug) {
  return `
    <nav class="row gap-2" style="flex-wrap:wrap;" aria-label="Daftar section Learn Tarot">
      ${SECTIONS.map(
        (s) => `
        <a class="btn ${s.slug === activeSlug ? "btn--primary" : "btn--secondary"}" href="#/learn/${s.slug}">${escapeHTML(s.label)}</a>
      `
      ).join("")}
    </nav>
  `;
}

function template(activeSlug) {
  const section = SECTIONS.find((s) => s.slug === activeSlug) ?? SECTIONS[0];
  const renderContent = SECTION_RENDERERS[section.slug] ?? basicsSectionHTML;
  return `
    <section class="stack gap-5">
      <div>
        <p class="eyebrow">Learn</p>
        <h1 class="font-display">Belajar Tarot</h1>
        <p class="text-sm text-muted" style="margin-top:var(--space-2);">Pelajari dasar-dasar tarot tanpa perlu melakukan reading dulu.</p>
      </div>

      ${tocHTML(section.slug)}

      <div data-learn-content>
        <h2 class="font-display" style="margin-bottom:var(--space-3);">${escapeHTML(section.label)}</h2>
        ${renderContent()}
      </div>

      ${quizCtaHTML()}
    </section>
  `;
}

export default {
  render(container, params) {
    // Section ditentukan lewat route param (/learn/:section, lihat js/app.js)
    // -- kalau tidak valid/tidak ada (/learn polos), default ke section
    // pertama ("basics"). Konten section MURNI sinkron (semua data sumbernya
    // -- tarot-cards.js, default-spreads.js -- sudah di memory sejak awal,
    // tidak ada fetch/spinner sama sekali, beda dari kebanyakan halaman lain
    // di app ini sejak Phase 14).
    const slug = SECTIONS.some((s) => s.slug === params?.section) ? params.section : SECTIONS[0].slug;
    container.innerHTML = template(slug);

    const heading = container.querySelector("h1");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus();
    }
  },
};
