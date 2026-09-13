# Phase 19 — Custom Spread — Cara Pasang

Ini murni penambahan Phase 19. Kalau Phase 18 (Profile) sudah kepasang/kepush
duluan (sudah dikonfirmasi ya), file-file di paket ini AMAN ditimpa langsung
tanpa mempengaruhi Phase 18.

## File yang ditimpa/ditambah

| File di paket ini                          | Taruh ke path repo                          | Status  |
|----------------------------------------------|------------------------------------------------|---------|
| `js/pages/custom-spreads.js`                  | `js/pages/custom-spreads.js`                    | **BARU** |
| `js/pages/reading.js`                         | `js/pages/reading.js`                           | REPLACE (tambah tipe "Custom Spread") |
| `js/services/custom-spread-service.js`        | `js/services/custom-spread-service.js`          | **BARU** |
| `js/services/reading-service.js`              | `js/services/reading-service.js`                | REPLACE (await registry custom spread) |
| `js/services/migration-service.js`            | `js/services/migration-service.js`              | REPLACE (migrasi custom spread) |
| `js/tarot/spreads.js`                         | `js/tarot/spreads.js`                           | REPLACE (registry custom spread) |
| `js/core/storage.js`                          | `js/core/storage.js`                            | REPLACE (CRUD guest custom spread) |
| `js/components/icons.js`                      | `js/components/icons.js`                        | REPLACE (ikon `layout` + `plus`) |
| `js/app.js`                                   | `js/app.js`                                     | REPLACE (route `/custom-spreads`) |
| `js/config.js`                                | `js/config.js`                                  | REPLACE (nav sidebar `/custom-spreads`) |
| `scripts/test_phase19_custom_spreads.mjs`     | `scripts/test_phase19_custom_spreads.mjs`       | **BARU** (dev-only) |
| `PROJECT_STATUS.md`                           | `PROJECT_STATUS.md` (root)                      | REPLACE (juga melengkapi dokumentasi Phase 18 yang sempat ketinggalan) |

**Tidak ada migration SQL baru** — tabel `spreads`/`spread_positions` dan
RLS policy-nya sudah lengkap sejak Phase 12 (memang disiapkan dari awal untuk
fitur ini).

## Jalankan test (sangat disarankan)
```
npm install
node scripts/test_phase19_custom_spreads.mjs
```
Harus keluar `32/32 assertion lulus.` — murni Node + jsdom, tidak butuh
Supabase. Kalau mau jalankan test lain juga (regresi):
```
node scripts/test_phase16_favorites.mjs
node scripts/test_phase17_statistics.mjs`
node scripts/test_phase18_profile.mjs
```

## Yang PALING PENTING dicek manual di browser

Fitur ini menyentuh migrasi data & foreign key sungguhan yang belum pernah
dites terhadap Supabase asli — urutan cek yang disarankan:

1. **Buat & kelola custom spread** — buka `#/custom-spreads`, klik "Buat
   Spread Baru", coba contoh dari Roadmap: nama "My Decision Spread", 5
   posisi (What I want / What I fear / What I don't see / Path A / Path B).
   Simpan, pastikan muncul di list. Coba Edit (ubah nama/deskripsi — pastikan
   TIDAK ada tombol tambah/hapus posisi saat edit). Coba Hapus.
2. **Pakai custom spread di Reading** — buka `#/reading`, pilih "Custom
   Spread" di Step 1, pilih spread yang tadi dibuat, selesaikan reading
   penuh sampai tersimpan. Cek muncul benar di History/Journal/Statistics.
3. **Coba hapus spread yang masih dipakai** — dari langkah 2, coba hapus
   spread itu di `#/custom-spreads`. Harus DITOLAK dengan pesan jelas
   ("masih dipakai di reading yang tersimpan"), bukan error mentah.
4. **PALING KRITIS — Guest Migration dengan custom spread**: **logout dulu**
   (atau buka tab Incognito), sebagai TAMU buat custom spread + reading
   dengan spread itu, lalu Register/Login akun baru. Pastikan proses migrasi
   sukses TANPA error, dan custom spread + reading-nya sama-sama muncul di
   akun cloud yang baru. Ini jalur baru yang paling berisiko kalau ada yang
   kelewat saat coding — kalau gagal, kabari detail error-nya.

Kalau langkah 4 ternyata gagal, jangan buru-buru hapus data localStorage-nya —
localStorage sengaja TIDAK dibersihkan otomatis kalau migrasi gagal, supaya
bisa dicoba lagi setelah masalahnya diperbaiki.
