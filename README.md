# OTR — Orias Tarot Reading

Digital tarot journal. Vanilla HTML/CSS/JS (ES Modules), tanpa framework, Supabase-ready.

## Menjalankan secara lokal

Karena app pakai ES Modules (`<script type="module">`), file **tidak bisa** dibuka langsung lewat `file://` (browser akan blokir import karena CORS). Jalankan lewat server statis sederhana:

```bash
# Opsi 1 — Python (biasanya sudah ada)
python3 -m http.server 8000

# Opsi 2 — Node
npx serve .

# Opsi 3 — VS Code
# install extension "Live Server", klik kanan index.html → "Open with Live Server"
```

Lalu buka `http://localhost:8000`.

## Status proyek

Lihat [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) — file ini jadi "memori" antar sesi Claude sesuai `OTR_Development_Roadmap`. Selalu update file itu di akhir tiap phase.

## Struktur

Mengikuti `OTR_Technical_Product_Specification.docx` §3. Ringkas:

```
otr/
├── index.html
├── css/        → design tokens + komponen + halaman-spesifik
├── data/       → domain data tarot (diisi Phase 2)
├── js/
│   ├── app.js       → entry point
│   ├── router.js    → hash router
│   ├── core/        → state, event-bus, storage, utils
│   ├── tarot/        → engine (diisi Phase 3)
│   ├── components/  → UI reusable
│   ├── pages/       → 1 module per route
│   ├── services/    → (diisi Phase 8+)
│   └── integrations/→ supabase, ai (diisi Phase 12+)
```

## Fase saat ini

**Phase 1 — Design System & App Shell** (selesai). Lihat `PROJECT_STATUS.md` untuk detail.
