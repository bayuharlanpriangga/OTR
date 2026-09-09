// OTR — Service: Custom Spread (Phase 19 — Custom Spread, Roadmap Phase 19,
// Master Spec §69 "Custom Spread Builder")
//
// Dual-backend (guest localStorage / cloud Supabase), pola SAMA dengan
// reading-service.js/favorite-service.js -- state.user menentukan rel,
// dicek per pemanggilan fungsi (currentUserId()), bukan disimpan sebagai
// flag statis, supaya login/logout di tengah sesi langsung "pindah rel".
//
// Shape spread yang dikembalikan SAMA untuk kedua backend, dan SENGAJA
// dibuat identik dengan shape DEFAULT_SPREADS (data/default-spreads.js)
// supaya js/tarot/spreads.js bisa memperlakukan keduanya seragam lewat
// registry-nya (lihat ensureCustomSpreadsLoaded() di sana):
//   { id, name, category, description, cardCount,
//     positions: [{ id, index, name, description }], isCustom: true }
//
// KEPUTUSAN SCOPE (didokumentasikan juga di PROJECT_STATUS.md):
// "Edit" (DONE WHEN Roadmap Phase 19) TIDAK mengizinkan menambah/menghapus/
// reorder posisi setelah spread dibuat -- jumlah & urutan posisi terkunci
// sejak Create, cardCount ikut terkunci. Alasan: reading yang SUDAH dibuat
// pakai spread ini menyimpan positionId per kartu (baik di localStorage
// guest maupun `reading_cards.position_id` di cloud); mengubah struktur
// posisi bisa mendesinkronkan reading lama (mis. reading lama attribute-nya
// "5 kartu" tapi definisi spread sekarang cuma 3 posisi). Edit cuma boleh
// mengubah nama/deskripsi/kategori spread DAN nama/deskripsi tiap posisi
// yang SUDAH ADA (index & jumlah tetap). Struktur beda -> harus bikin
// spread baru (Delete lama + Create baru, atau biarkan keduanya ada).
//
// Delete: SENGAJA tidak ada guard eksplisit "cek dulu ada reading yang
// pakai" di jalur cloud -- constraint foreign key `readings.spread_id
// references spreads(id)` (TANPA on delete cascade, 0001_init_schema.sql
// §41) sudah otomatis MENOLAK delete di level Postgres kalau masih ada
// reading yang memakainya (error code 23503, "foreign key violation").
// deleteCloud() di bawah menerjemahkan kode error itu jadi pesan yang bisa
// dibaca manusia, bukan dilempar mentah-mentah ke UI. Jalur guest
// MEREPLIKASI proteksi yang SAMA secara manual (cek listGuestReadings()
// dulu) supaya perilakunya konsisten antara guest & login -- pola
// replikasi manual yang sama dengan deleteGuestReading() mereplikasi
// cascade `journals` di Phase 11.

import { getState } from "../core/state.js";
import { getSupabaseClient } from "../integrations/supabase.js";
import { uid } from "../core/utils.js";
import {
  listGuestCustomSpreads,
  getGuestCustomSpreadById,
  saveGuestCustomSpread,
  deleteGuestCustomSpread,
  listGuestReadings,
} from "../core/storage.js";

function currentUserId() {
  return getState().user?.id ?? null;
}

// Batas atas jumlah posisi -- Roadmap tidak menetapkan angka pasti, tapi
// reading flow (js/pages/reading.js) menggambar kartu satu per satu secara
// manual (Draw -> Reveal -> Interpretasi per kartu, Master Spec §15) --
// spread dengan puluhan posisi akan membuat flow itu sangat panjang tanpa
// ada kegunaan tarot yang wajar. 10 dianggap generous tapi tetap masuk akal
// (contoh Roadmap sendiri cuma 5 posisi).
const MAX_POSITIONS = 10;

function buildPositions(positionInputs) {
  return positionInputs.map((p, index) => ({
    id: `pos_${index}`,
    index,
    name: p.name.trim(),
    description: (p.description || "").trim(),
  }));
}

function validateSpreadInput({ name, positions }) {
  if (!name || !name.trim()) throw new Error("Nama spread wajib diisi.");
  if (!Array.isArray(positions) || positions.length < 1) {
    throw new Error("Spread butuh minimal 1 posisi.");
  }
  if (positions.length > MAX_POSITIONS) {
    throw new Error(`Spread maksimal ${MAX_POSITIONS} posisi.`);
  }
  if (positions.some((p) => !p.name || !p.name.trim())) {
    throw new Error("Semua posisi wajib punya nama.");
  }
}

// ---- Local (guest) --------------------------------------------------------

async function listLocal() {
  return listGuestCustomSpreads();
}

async function createLocal({ name, description, category, positions }) {
  validateSpreadInput({ name, positions });
  const spread = {
    id: uid("cspread"),
    name: name.trim(),
    category: category || "general",
    description: (description || "").trim(),
    cardCount: positions.length,
    positions: buildPositions(positions),
    isCustom: true,
    createdAt: new Date().toISOString(),
  };
  const ok = saveGuestCustomSpread(spread);
  if (!ok) throw new Error("Gagal menyimpan spread ke penyimpanan lokal.");
  return spread;
}

async function updateLocal(id, { name, description, category, positions }) {
  const existing = getGuestCustomSpreadById(id);
  if (!existing) throw new Error("Spread tidak ditemukan.");
  if (!Array.isArray(positions) || positions.length !== existing.positions.length) {
    throw new Error("Jumlah posisi tidak bisa diubah saat edit — buat spread baru kalau strukturnya beda.");
  }
  if (positions.some((p) => !p.name || !p.name.trim())) {
    throw new Error("Semua posisi wajib punya nama.");
  }
  const updated = {
    ...existing,
    name: name?.trim() || existing.name,
    category: category || existing.category,
    description: description !== undefined ? description.trim() : existing.description,
    positions: existing.positions.map((p, i) => ({
      ...p,
      name: positions[i].name.trim(),
      description: (positions[i].description ?? p.description ?? "").trim(),
    })),
  };
  const ok = saveGuestCustomSpread(updated);
  if (!ok) throw new Error("Gagal memperbarui spread.");
  return updated;
}

async function deleteLocal(id) {
  const usedByReading = listGuestReadings().some((r) => r.spreadId === id);
  if (usedByReading) {
    throw new Error("Spread ini masih dipakai di reading yang tersimpan — tidak bisa dihapus.");
  }
  const ok = deleteGuestCustomSpread(id);
  if (!ok) throw new Error("Spread tidak ditemukan.");
}

// ---- Cloud ------------------------------------------------------------

const CUSTOM_SPREAD_SELECT = "*, spread_positions(*)";

function mapCloudSpreadRow(row) {
  const positions = (row.spread_positions ?? [])
    .slice()
    .sort((a, b) => a.position_index - b.position_index)
    .map((p) => ({
      id: `pos_${p.position_index}`,
      index: p.position_index,
      name: p.name,
      description: p.description ?? "",
    }));
  return {
    id: row.id,
    name: row.name,
    category: row.category ?? "general",
    description: row.description ?? "",
    cardCount: row.card_count,
    positions,
    isCustom: true,
    createdAt: row.created_at,
  };
}

async function listCloud(userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("spreads")
    .select(CUSTOM_SPREAD_SELECT)
    .eq("user_id", userId)
    .eq("is_system", false)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Gagal memuat custom spread dari cloud: ${error.message}`);
  return (data ?? []).map(mapCloudSpreadRow);
}

async function getCloudById(id, userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("spreads")
    .select(CUSTOM_SPREAD_SELECT)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`Gagal memuat spread: ${error.message}`);
  return data ? mapCloudSpreadRow(data) : null;
}

async function createCloud({ name, description, category, positions }, userId) {
  validateSpreadInput({ name, positions });
  const supabase = getSupabaseClient();
  const id = uid("cspread");

  // `slug` NOT NULL UNIQUE di schema (0001_init_schema.sql §39) tapi tidak
  // pernah dipakai di mana pun di app untuk custom spread (beda dari
  // tarot_cards.slug yang dipakai routing) -- diisi = id sendiri supaya
  // constraint terpenuhi tanpa perlu logic slugify terpisah yang tidak
  // ada gunanya.
  const { error: spreadError } = await supabase.from("spreads").insert({
    id,
    name: name.trim(),
    slug: id,
    category: category || "general",
    description: (description || "").trim(),
    card_count: positions.length,
    is_system: false,
    user_id: userId,
  });
  if (spreadError) throw new Error(`Gagal menyimpan spread ke cloud: ${spreadError.message}`);

  const positionRows = positions.map((p, index) => ({
    spread_id: id,
    position_index: index,
    name: p.name.trim(),
    description: (p.description || "").trim(),
  }));
  const { error: positionsError } = await supabase.from("spread_positions").insert(positionRows);
  if (positionsError) {
    // Spread sudah telanjur dibuat -- hapus lagi (best-effort) supaya tidak
    // ada spread "kosong" tanpa posisi tersangkut, pola sama dengan
    // reading-service.js#saveCloud membersihkan `readings` kalau
    // `reading_cards` gagal diinsert.
    await supabase.from("spreads").delete().eq("id", id);
    throw new Error(`Gagal menyimpan posisi spread ke cloud: ${positionsError.message}`);
  }

  return getCloudById(id, userId);
}

async function updateCloud(id, { name, description, category, positions }, userId) {
  const supabase = getSupabaseClient();

  const { data: existingPositions, error: fetchError } = await supabase
    .from("spread_positions")
    .select("id, position_index")
    .eq("spread_id", id)
    .order("position_index", { ascending: true });
  if (fetchError) throw new Error(`Gagal memuat posisi spread: ${fetchError.message}`);
  if (!Array.isArray(positions) || positions.length !== existingPositions.length) {
    throw new Error("Jumlah posisi tidak bisa diubah saat edit — buat spread baru kalau strukturnya beda.");
  }
  if (positions.some((p) => !p.name || !p.name.trim())) {
    throw new Error("Semua posisi wajib punya nama.");
  }

  const { error: spreadError } = await supabase
    .from("spreads")
    .update({
      name: name?.trim(),
      category: category || "general",
      description: (description || "").trim(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .eq("is_system", false);
  if (spreadError) throw new Error(`Gagal memperbarui spread: ${spreadError.message}`);

  for (let i = 0; i < positions.length; i += 1) {
    const { error } = await supabase
      .from("spread_positions")
      .update({ name: positions[i].name.trim(), description: (positions[i].description || "").trim() })
      .eq("id", existingPositions[i].id);
    if (error) throw new Error(`Gagal memperbarui posisi spread: ${error.message}`);
  }

  return getCloudById(id, userId);
}

async function deleteCloud(id, userId) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("spreads").delete().eq("id", id).eq("user_id", userId).eq("is_system", false);
  if (error) {
    // 23503 = foreign key violation (Postgres) -- terjadi kalau masih ada
    // `readings.spread_id` yang menunjuk ke spread ini (tidak ada
    // `on delete cascade` di FK itu, SENGAJA -- lihat komentar di atas
    // file). Diterjemahkan jadi pesan yang bisa dibaca user, bukan
    // dilempar mentah.
    if (error.code === "23503") {
      throw new Error("Spread ini masih dipakai di reading yang tersimpan — tidak bisa dihapus.");
    }
    throw new Error(`Gagal menghapus spread dari cloud: ${error.message}`);
  }
}

// ---- Public API -----------------------------------------------------------

export async function listCustomSpreads() {
  const userId = currentUserId();
  return userId ? listCloud(userId) : listLocal();
}

export async function createCustomSpread(input) {
  const userId = currentUserId();
  return userId ? createCloud(input, userId) : createLocal(input);
}

export async function updateCustomSpread(id, input) {
  const userId = currentUserId();
  return userId ? updateCloud(id, input, userId) : updateLocal(id, input);
}

export async function deleteCustomSpread(id) {
  const userId = currentUserId();
  return userId ? deleteCloud(id, userId) : deleteLocal(id);
}
