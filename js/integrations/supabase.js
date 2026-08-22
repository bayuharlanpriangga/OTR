// OTR — Integration: Supabase Client (Phase 12 — Supabase Foundation)
// Satu-satunya tempat `createClient()` dipanggil di seluruh app — modul lain
// (js/services/*, dan nanti js/pages/* di Phase 14) selalu import client
// dari sini, tidak pernah bikin instance sendiri. Ini murni "wiring" ke
// layanan pihak ketiga (sesuai namanya sendiri, js/integrations/) — TIDAK
// ada business logic apa pun di file ini, itu tugas js/services/*.
//
// @supabase/supabase-js diimpor lewat import map di index.html (proyek ini
// tidak pakai bundler — lihat komentar di sana), jadi baris import di bawah
// ini terlihat seperti bare-specifier package biasa walau sebenarnya
// resolve ke CDN esm.sh saat runtime di browser.

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../config.js";

let client = null;

/**
 * Lazy singleton — client baru benar-benar dibuat saat pertama kali
 * dipanggil, bukan saat modul di-import. Alasan: banyak halaman (Library,
 * Reading offline, dll — Master Spec §74 PWA Support) tidak pernah butuh
 * Supabase sama sekali; menunda pembuatan client sampai benar-benar
 * dipanggil menghindari error konfigurasi (lihat di bawah) muncul di
 * halaman yang sebenarnya tidak butuh cloud sama sekali.
 */
export function getSupabaseClient() {
  if (client) return client;

  if (SUPABASE_URL.includes("YOUR-PROJECT-REF") || SUPABASE_ANON_KEY === "YOUR-SUPABASE-ANON-KEY") {
    throw new Error(
      "[supabase] SUPABASE_URL/SUPABASE_ANON_KEY di js/config.js masih placeholder. " +
        "Isi dengan URL & anon key project Supabase kamu (Project Settings -> API) sebelum memakai fitur cloud."
    );
  }

  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}
