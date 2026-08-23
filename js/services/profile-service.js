// OTR — Service: Profile (Phase 14 — Cloud Sync, Roadmap Phase 14, Master Spec §37)
// Baris `profiles` sudah otomatis dibuat oleh trigger `handle_new_user()`
// (0001_init_schema.sql, Phase 12) begitu user sign up -- jadi TIDAK ada
// "ensureProfile()" di sini, cuma read/update di atas baris yang sudah pasti
// ada. UI penuh (avatar upload, edit nama, dst) adalah scope Phase 18 --
// js/pages/profile.js sengaja masih skeleton, ditandai "Phase 18" di
// komentarnya sendiri sejak Phase 1. Sama seperti auth-service.js ditulis
// duluan di Phase 12 sebelum ada UI Login/Register-nya (Phase 13), file ini
// plumbing yang disiapkan duluan supaya Phase 18 tinggal import, bukan bikin
// ulang -- mengikuti "Sync: ... Profile ..." di Goal Roadmap Phase 14.
//
// Guest (belum login) tidak punya profil cloud sama sekali -- fungsi di sini
// selalu butuh userId eksplisit, TIDAK membaca state.user sendiri seperti
// reading-service.js/journal-service.js/settings-service.js, karena tidak
// ada backend lokal buat profil (guest ditampilkan hardcode "Guest" di
// profile.js, tidak ada yang perlu disinkronkan).

import { getSupabaseClient } from "../integrations/supabase.js";

/** @returns {Promise<{id:string, displayName:string|null, avatarUrl:string|null, createdAt:string}|null>} */
export async function getProfile(userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw new Error(`Gagal memuat profil: ${error.message}`);
  if (!data) return null;
  return {
    id: data.id,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
  };
}

/** @param {{displayName?:string, avatarUrl?:string}} partial */
export async function updateProfile(userId, partial) {
  const supabase = getSupabaseClient();
  const patch = { updated_at: new Date().toISOString() };
  if (partial.displayName !== undefined) patch.display_name = partial.displayName;
  if (partial.avatarUrl !== undefined) patch.avatar_url = partial.avatarUrl;

  const { data, error } = await supabase.from("profiles").update(patch).eq("id", userId).select().single();
  if (error) throw new Error(`Gagal memperbarui profil: ${error.message}`);
  return { id: data.id, displayName: data.display_name, avatarUrl: data.avatar_url, createdAt: data.created_at };
}
