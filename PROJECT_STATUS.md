# OTR PROJECT STATUS

## Current Phase
Phase 3 — Tarot Engine

## Completed
- Struktur folder proyek sesuai Master Spec §3.
- Design tokens (`css/variables.css`): color, typography, spacing, radius, shadow, motion.
- Base styles: `reset.css`, `typography.css`.
- App shell: sidebar (desktop), bottom nav (mobile), topbar, content outlet.
- Komponen reusable: button, card, modal, toast, spinner/skeleton loading, empty state.
- Signature visual: `.weave` (motif lattice ala punggung kartu tarot, CSS murni).
- Router hash-based (`js/router.js`) — static-hosting friendly, tidak butuh server rewrite.
- Global state object (`js/core/state.js`) sesuai shape di Master Spec §5.
- Event bus, storage wrapper, utils.
- 9 halaman skeleton (belum functional): Home, Reading, Daily, Library, History, Journal, Statistics, Settings, Profile.
- `data/tarot-cards.js` — 78 kartu lengkap (22 Major + 56 Minor Arcana), schema sesuai Master Spec §7.
- `data/tarot-keywords.js` — index ringan terpisah dari data kartu penuh.
- `data/default-spreads.js` — 10 spread MVP sesuai katalog Master Spec §13.
- **`js/tarot/shuffle.js`** — `secureRandomInt()`/`secureRandomFloat()` (Web Crypto `crypto.getRandomValues()` dengan rejection sampling anti-bias, fallback `Math.random()`) dan `shuffleDeck()` (Fisher-Yates, Master Spec §10), tidak memutasi array input.
- **`js/tarot/orientation.js`** — `rollOrientation(reversedProbability = 0.5)`, default 50% upright/50% reversed (Master Spec §11), probability bisa dikonfigurasi (mis. untuk fitur "matikan kartu terbalik" di Settings nanti). Helper `isUpright`/`isReversed`.
- **`js/tarot/deck.js`** — `class TarotDeck`: `reset()`, `shuffle()`, `draw()` (throw kalau deck kosong), `clone()`, getter `remainingCount`/`drawnCount`/`drawnCards`/`isEmpty`/`totalCount`. Duplicate prevention otomatis lewat mutasi tumpukan `_remaining` (Master Spec §9).
- **`js/tarot/spreads.js`** — wrapper di atas `data/default-spreads.js`: `resolveSpread(id)` (lookup + validasi, throw kalau spread tidak ada atau `cardCount` tidak cocok `positions.length`), `getPositionAt`, `getPositionById`, `getNextPosition`, `isSpreadComplete`.
- **`js/tarot/draw.js`** — `drawForPosition(deck, position, options)`: fungsi murni yang menggabungkan `deck.draw()` + `rollOrientation()` jadi satu entri `{ positionId, cardId, orientation, card }`.
- **`js/tarot/tarot-engine.js`** — `class TarotEngine` (+ `createTarotEngine()` factory, `READING_STATUS` enum): orkestrasi penuh reading tanpa DOM dan tanpa dependensi ke `js/core/state.js`/`event-bus.js` (sengaja dipisah supaya reusable & gampang dites lewat `node`).
  - API wajib: `createReading()`, `drawCard()`, `completeReading()`.
  - API tambahan: `reshuffle()`, `revealCurrentCard()`, `abortReading()`, `getReading()`, `getSpread()`, `isComplete()`.
  - State machine sesuai Master Spec §15: `idle → setup → shuffling → drawing → revealing → interpreting → (kartu berikutnya kembali ke drawing) → … → completed`. Setiap method punya guard eksplisit (`_assertStatus`) yang throw error jelas kalau dipanggil di luar urutan — mis. `revealCurrentCard()` sebelum `drawCard()`, atau `completeReading()` sebelum semua posisi terisi.
  - Reading entity yang dihasilkan mengikuti schema Master Spec §14 (`id, userId, spreadId, question, intention, status, cards[], summary, createdAt, completedAt`) plus `currentPosition` dari shape state §5, supaya tinggal di-`patchState("reading", engine.getReading())` di Phase 5 tanpa transformasi tambahan.
- Semua file JS Phase 2 & Phase 3 lolos syntax check (`node --check`).
- Runtime test Phase 3 (script sekali-pakai, tidak ikut deliverable): deck 78/78 kartu tanpa duplikat, shuffle mempertahankan isi & mengubah urutan, orientation 50/50 dalam toleransi wajar + bisa dipaksa 100% upright/reversed, seluruh 10 spread di katalog divalidasi (`positions.length === cardCount`), full reading cycle (create → draw → reveal → interpret, berulang → complete) dijalankan end-to-end untuk **semua 10 spread MVP**, dan 4 skenario invalid-state-transition dipastikan throw. Total 202/202 assertion lulus.

## In Progress
- (tidak ada — Phase 3 selesai, menunggu review sebelum lanjut)

## Not Started
- Tarot Card component (Phase 4)
- Reading MVP (Phase 5)
- Semua phase 6–27

## Current Architecture
- Vanilla HTML/CSS/JS, ES Modules, tanpa framework/build step.
- Routing: hash-based (`#/reading`, dst), didaftarkan di `js/app.js` via `registerRoute()`.
- State: satu object global di `js/core/state.js`, diakses via `getState()`/`setState()`/`patchState()`.
- Komunikasi antar modul lewat `js/core/event-bus.js` (event: `route:change`, `toast:show`, `state:change`).
- Halaman = modul dengan `export default { render(container, params) }`, di-load lazy lewat dynamic `import()`.
- Data domain tarot independen dari UI (`data/`), dikonsumsi Tarot Engine (`js/tarot/`) tanpa DOM sama sekali.
- **Tarot Engine (`js/tarot/`) juga independen dari state management/UI** — `tarot-engine.js` tidak meng-import `js/core/state.js` atau `event-bus.js`. Layer di atasnya (Phase 5 page controller) yang bertanggung jawab menyambungkan hasil `engine.getReading()` ke `patchState("reading", ...)` dan meng-emit event UI. Keputusan ini menjaga engine tetap testable murni lewat `node` tanpa DOM/browser.
- Struktur folder & nama file mengikuti Master Spec §3 persis.

## Important Decisions
- Router pakai hash (`#/...`), bukan History API — supaya kompatibel static hosting tanpa rewrite rule.
- Font: Fraunces (display) + Public Sans (body) + IBM Plex Mono (data/angka) via Google Fonts CDN.
- Palet warna "night-reading table": obsidian/plum sebagai ruang, gold sebagai foil-accent, oxblood untuk state reversed/destructive.
- Data Minor Arcana (56 kartu) di-generate dari kombinasi tema suit × tema rank/court, bukan ditulis satu-satu manual. Teks Major Arcana (22 kartu) ditulis individual.
- `tarot-keywords.js` sengaja dipisah dari `tarot-cards.js` supaya fitur search/filter (Phase 9) & quiz (Phase 21) bisa jalan tanpa nge-load seluruh teks upright/reversed 78 kartu.
- `image` path memakai format `/assets/images/tarot/{suit-or-major}/{slug}.webp` — placeholder, asetnya diisi di Phase 4.
- **Randomization pakai `crypto.getRandomValues()` dengan rejection sampling** (bukan modulo langsung) supaya distribusi shuffle/orientation tidak bias ke angka kecil — sesuai Master Spec §10. Fallback ke `Math.random()` hanya kalau Web Crypto API benar-benar tidak tersedia di environment.
- **`TarotEngine` sengaja dipisah dari `TarotDeck`**: `deck.js` cuma tahu soal kartu fisik (draw/shuffle/reset), tidak tahu apa itu "reading" atau "spread". `tarot-engine.js` yang mengorkestrasi deck + orientation + spread jadi satu reading entity. Pemisahan ini supaya tiap modul gampang dites sendiri-sendiri (lihat runtime test Phase 3).
- **Reveal dipisah jadi state tersendiri dari draw** (`drawing` → `revealing` → `interpreting`), bukan digabung jadi satu langkah — mengikuti state machine Master Spec §15 dan mencegah UI (Phase 5) "skip" langsung dari draw ke interpretasi tanpa render animasi reveal.
- **`drawCard()` mengembalikan objek kartu penuh** (`card`, hasil resolve dari `getCardById`), tapi yang disimpan permanen ke `reading.cards` hanya `{ positionId, cardId, orientation }` — konsisten dengan schema Reading Entity Master Spec §14 (tidak menyimpan data kartu yang sudah redundan dengan `data/tarot-cards.js`).

## Known Issues
- Belum diuji di browser sungguhan (sandbox tidak punya headless browser) — sudah divalidasi lewat `node --check` (syntax) + runtime test (lihat "Completed" Phase 3), tapi rekomendasikan smoke test manual sebelum lanjut ke Phase 4.
- Path gambar kartu (`image`) menunjuk ke file `.webp` yang belum ada secara fisik — normal, ditangani di Phase 4.
- Teks upright/reversed Minor Arcana bersifat templated — cukup untuk fungsi MVP, bisa diperkaya nanti tanpa perubahan struktur.
- Belum ada `manifest.json` / `favicon.ico` (baru dibutuhkan di Phase 24 — PWA).
- **`js/tarot/tarot-engine.js` belum disambungkan ke `js/core/state.js` atau halaman `js/pages/reading.js`** — itu tugas Phase 5 (Reading MVP). Phase 3 murni logic layer.
- Fitur "matikan kartu terbalik" (custom `reversedProbability`) sudah didukung API-nya di `orientation.js`/`tarot-engine.js`, tapi belum ada UI Settings untuk mengaturnya — placeholder untuk phase UI Settings nanti.

## Next Phase
Phase 4 — Tarot Card Component (`js/components/tarot-card.js`, memakai `css/tarot-card.css` yang sudah ada) — komponen UI reusable untuk render kartu (front/back/orientation/revealed/selected), dikonsumsi Phase 5 (Reading MVP) yang akan menyambungkan `js/tarot/tarot-engine.js` dari Phase 3 ini ke UI nyata.
