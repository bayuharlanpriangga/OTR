# OTR PROJECT STATUS

## Current Phase
Phase 2 — Tarot Data Foundation

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
- **`data/tarot-cards.js`** — 78 kartu lengkap (22 Major + 56 Minor Arcana), schema sesuai Master Spec §7: `id, name, slug, arcana, suit, number, rank, image, keywords[], upright{general,love,career,spiritual,advice}, reversed{...}, yesNo`. Helper: `getCardById`, `getAllCards`, `getCardsByArcana`, `getCardsBySuit`, `getRandomCard`.
- **`data/tarot-keywords.js`** — index ringan terpisah dari data kartu penuh: `CARD_KEYWORDS`, `KEYWORD_INDEX` (reverse lookup keyword→cardId, untuk search di Library/Phase 9), `ARCANA_LABELS`, `SUIT_LABELS`, `RANK_LABELS`. Helper: `findCardIdsByKeyword`, `getAllKeywords`.
- **`data/default-spreads.js`** — 10 spread MVP sesuai katalog Master Spec §13 (3 single-card, 5 three-card, Career Path, Love Reading), schema sesuai §12. Helper: `getSpreadById`, `getSpreadsByCategory`, `getAllSpreads`.
- Semua file JS lolos syntax check (`node --check`).
- Runtime import test (`node` ES module): 78/78 kartu, 22 Major + 56 Minor, 14 kartu tiap suit, tidak ada ID duplikat, semua cross-reference `CARD_KEYWORDS` ↔ `TAROT_CARDS` valid, semua spread `cardCount` cocok jumlah `positions`.

## In Progress
- (tidak ada — Phase 2 selesai, menunggu review sebelum lanjut)

## Not Started
- Tarot engine (Phase 3)
- Tarot Card component (Phase 4)
- Reading MVP (Phase 5)
- Semua phase 6–27

## Current Architecture
- Vanilla HTML/CSS/JS, ES Modules, tanpa framework/build step.
- Routing: hash-based (`#/reading`, dst), didaftarkan di `js/app.js` via `registerRoute()`.
- State: satu object global di `js/core/state.js`, diakses via `getState()`/`setState()`/`patchState()`.
- Komunikasi antar modul lewat `js/core/event-bus.js` (event: `route:change`, `toast:show`, `state:change`).
- Halaman = modul dengan `export default { render(container, params) }`, di-load lazy lewat dynamic `import()`.
- Data domain tarot sekarang independen dari UI (`data/`), siap dikonsumsi Tarot Engine di Phase 3 tanpa DOM sama sekali.
- Struktur folder & nama file mengikuti Master Spec §3 persis.

## Important Decisions
- Router pakai hash (`#/...`), bukan History API — supaya kompatibel static hosting tanpa rewrite rule.
- Font: Fraunces (display) + Public Sans (body) + IBM Plex Mono (data/angka) via Google Fonts CDN.
- Palet warna "night-reading table": obsidian/plum sebagai ruang, gold sebagai foil-accent, oxblood untuk state reversed/destructive.
- **Data Minor Arcana (56 kartu) di-generate dari kombinasi tema suit × tema rank/court**, bukan ditulis satu-satu manual — supaya konsisten secara struktur dan bebas typo/duplikat. Teks Major Arcana (22 kartu) ditulis individual karena tiap kartu punya makna yang sangat spesifik secara tradisional.
- **Konsekuensi dari keputusan di atas**: teks upright/reversed Minor Arcana valid secara struktur dan traditionally-sound (tema suit × angka mengikuti konvensi tarot standar), tapi bahasanya masih agak generik/templated dibanding Major Arcana yang lebih kaya nuansa. Ini cukup untuk MVP (interpretation engine Phase 6 akan selalu punya teks untuk ditampilkan, never empty), tapi bisa diperkaya lebih lanjut di iterasi berikutnya tanpa mengubah struktur/schema.
- `tarot-keywords.js` sengaja dipisah dari `tarot-cards.js` (bukan bagian dari objek kartu) supaya fitur search/filter (Phase 9) & quiz (Phase 21) bisa jalan tanpa nge-load seluruh teks upright/reversed 78 kartu ke memory kalau nanti dipecah lazy-load per kartu.
- `image` path memakai format `/assets/images/tarot/{suit-or-major}/{slug}.webp` — file gambar aslinya belum ada (placeholder path saja), akan diisi asetnya di Phase 4 (Tarot Card Component) atau kapan pun aset final siap.

## Known Issues
- Belum diuji di browser sungguhan (sandbox tidak punya headless browser) — sudah divalidasi lewat `node --check` (syntax) + runtime ES module import test (78 kartu, cross-reference, no duplicate), tapi rekomendasikan smoke test manual (buka `library.js`/console, import modul, cek `TAROT_CARDS.length`) sebelum lanjut ke Phase 3.
- Path gambar kartu (`image`) menunjuk ke file `.webp` yang belum ada secara fisik di `assets/images/tarot/` — normal untuk Phase 2, ditangani di Phase 4.
- Teks upright/reversed Minor Arcana bersifat templated (lihat "Important Decisions") — cukup untuk fungsi MVP, tapi bisa diperkaya konten-nya nanti tanpa perubahan struktur.
- Belum ada `manifest.json` / `favicon.ico` (baru dibutuhkan di Phase 24 — PWA).

## Next Phase
Phase 3 — Tarot Engine (`js/tarot/tarot-engine.js`, `deck.js`, `shuffle.js`, `draw.js`, `orientation.js`, `spreads.js`) — logic murni tanpa DOM, dibangun di atas `data/tarot-cards.js` dan `data/default-spreads.js` dari Phase 2 ini.
