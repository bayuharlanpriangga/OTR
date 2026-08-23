// OTR — Service: Reading (Phase 14 — Cloud Sync, Roadmap Phase 14, Master Spec §36-46)
// Layer di atas js/core/storage.js (guest) DAN Supabase (`readings` +
// `reading_cards`) yang memilih backend berdasarkan `state.user` (Master
// Spec §5) -- SEKALI dicek per pemanggilan fungsi, bukan disimpan sebagai
// flag statis, supaya login/logout di tengah sesi langsung "pindah rel"
// tanpa perlu reload halaman.
//
// Kenapa dibuat sekarang (bukan Phase 8/13): Phase 8 sengaja cuma menyambung
// ke localStorage (§48 Local Storage), Phase 12/13 cuma membuktikan pipeline
// Auth. Roadmap Phase 14 eksplisit: "Reading/journal baru langsung ke
// Supabase alih-alih localStorage" setelah user login -- js/pages/result.js,
// history.js, history-detail.js sekarang import dari SINI, bukan lagi
// langsung dari core/storage.js.
//
// Shape record yang dikembalikan SAMA untuk kedua backend (supaya pemanggil
// tidak perlu tahu asalnya):
//   { id, spreadId, spreadName, question, intention, category, status,
//     isFavorite, createdAt, completedAt, savedAt,
//     cards: [{ positionId, positionName, positionDescription, cardId,
//               cardName, orientation, interpretationSnapshot }],
//     synthesisSnapshot }
//
// Catatan penting soal `id`: untuk guest, id dibuat di js/tarot/tarot-engine.js
// saat reading dimulai (uid()) dan tetap dipakai sebagai storage key. Untuk
// cloud, Supabase men-generate uuid barunya SENDIRI saat insert (`readings.id
// default gen_random_uuid()`) -- BEDA dari id sementara yang dipakai selama
// reading berlangsung di js/core/state.js. saveReading() mengembalikan
// record dengan id BARU itu; pemanggil (result.js) wajib pakai id hasil
// balikan ini untuk aksi berikutnya (mis. saveJournalEntry({readingId})),
// bukan id lama dari state.reading.

import { getState } from "../core/state.js";
import { getSupabaseClient } from "../integrations/supabase.js";
import { getSpreadById, getPositionById } from "../tarot/spreads.js";
import { getCardById } from "../../data/tarot-cards.js";
import {
  listGuestReadings,
  getGuestReadingById,
  saveGuestReading,
  deleteGuestReading,
  setGuestReadingFavorite,
} from "../core/storage.js";

function currentUserId() {
  return getState().user?.id ?? null;
}

// ---- Cloud row -> shape lokal ----------------------------------------

/** `reading_cards` diurutkan berdasarkan `spread_positions.position_index`
 *  supaya urutan kartu di UI (rail nomor 1,2,3...) sama persis dengan
 *  urutan dia ditarik -- Supabase tidak menjamin urutan array hasil join
 *  nested select tanpa ORDER BY eksplisit. */
function mapCloudCardRow(row) {
  const card = getCardById(row.card_id);
  const pos = row.spread_positions ?? {};
  return {
    positionId: row.position_id,
    positionName: pos.name ?? "",
    positionDescription: pos.description ?? "",
    cardId: row.card_id,
    cardName: card?.name ?? row.card_id,
    orientation: row.orientation,
    interpretationSnapshot: row.interpretation_snapshot ?? {},
    _positionIndex: pos.position_index ?? 0, // dibuang sebelum dikembalikan, cuma buat sort
  };
}

function mapCloudReadingRow(row) {
  const spread = getSpreadById(row.spread_id);
  const cards = (row.reading_cards ?? [])
    .slice()
    .sort((a, b) => (a.spread_positions?.position_index ?? 0) - (b.spread_positions?.position_index ?? 0))
    .map(mapCloudCardRow)
    .map(({ _positionIndex, ...rest }) => rest);

  return {
    id: row.id,
    spreadId: row.spread_id,
    spreadName: spread?.name ?? row.spread_id,
    question: row.question ?? "",
    intention: row.intention ?? "",
    category: row.category ?? "general",
    status: row.status ?? "completed",
    isFavorite: Boolean(row.is_favorite),
    createdAt: row.created_at ?? null,
    completedAt: row.completed_at ?? null,
    // Tidak ada kolom savedAt di schema cloud -- created_at readings row
    // SAMA DENGAN momen tombol "Simpan Reading" diklik (lihat saveReading()
    // di bawah, yang mengirim record.createdAt milik READING, bukan
    // record.savedAt, ke kolom created_at). Fallback ke completed_at kalau
    // suatu saat created_at kosong.
    savedAt: row.created_at ?? row.completed_at ?? null,
    cards,
    synthesisSnapshot: row.summary ?? {},
  };
}

const READING_SELECT = "*, reading_cards(*, spread_positions(name, description, position_index))";

// ---- Local (guest) ----------------------------------------------------

async function listLocal() {
  return listGuestReadings();
}

async function getLocalById(id) {
  return getGuestReadingById(id);
}

async function saveLocal(record) {
  const ok = saveGuestReading(record);
  if (!ok) throw new Error("Gagal menyimpan reading ke penyimpanan lokal.");
  return record;
}

async function deleteLocal(id) {
  const ok = deleteGuestReading(id);
  if (!ok) throw new Error("Reading tidak ditemukan.");
}

async function setFavoriteLocal(id, isFavorite) {
  const ok = setGuestReadingFavorite(id, isFavorite);
  if (!ok) throw new Error("Reading tidak ditemukan.");
}

// ---- Cloud --------------------------------------------------------------

async function listCloud(userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("readings")
    .select(READING_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Gagal memuat riwayat reading dari cloud: ${error.message}`);
  return (data ?? []).map(mapCloudReadingRow);
}

async function getCloudById(id, userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("readings")
    .select(READING_SELECT)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`Gagal memuat reading dari cloud: ${error.message}`);
  return data ? mapCloudReadingRow(data) : null;
}

/** Insert `readings` + `reading_cards`. Kalau insert `reading_cards` gagal
 *  SETELAH `readings` berhasil dibuat, baris `readings` yang sudah telanjur
 *  dibuat dihapus lagi (best-effort) supaya tidak ada reading "kosong" tanpa
 *  kartu tersangkut di History -- pola yang sama dengan
 *  migration-service.js: gagal = tidak ada jejak, aman dicoba ulang. */
async function saveCloud(record, userId) {
  const supabase = getSupabaseClient();
  const spread = getSpreadById(record.spreadId);
  if (!spread) {
    throw new Error(`Spread "${record.spreadId}" tidak dikenali -- reading tidak bisa disimpan ke cloud.`);
  }

  const { data: positionRows, error: positionError } = await supabase
    .from("spread_positions")
    .select("id, position_index")
    .eq("spread_id", spread.id);
  if (positionError) {
    throw new Error(`Gagal mengambil data posisi spread "${spread.id}": ${positionError.message}`);
  }
  const positionIdByIndex = new Map(positionRows.map((r) => [r.position_index, r.id]));

  const { data: insertedReading, error: readingError } = await supabase
    .from("readings")
    .insert({
      user_id: userId,
      spread_id: record.spreadId,
      question: record.question || null,
      intention: record.intention || null,
      category: record.category || null,
      status: record.status || "completed",
      summary: record.synthesisSnapshot ?? null,
      is_favorite: Boolean(record.isFavorite),
      created_at: record.createdAt || new Date().toISOString(),
      completed_at: record.completedAt || null,
    })
    .select()
    .single();
  if (readingError) throw new Error(`Gagal menyimpan reading ke cloud: ${readingError.message}`);

  const newReadingId = insertedReading.id;

  const cardRows = record.cards.map((entry) => {
    const localPosition = getPositionById(spread, entry.positionId);
    const positionUuid = localPosition ? positionIdByIndex.get(localPosition.index) : undefined;
    if (!positionUuid) {
      throw new Error(
        `Posisi "${entry.positionId}" (spread "${spread.id}") tidak ditemukan di Supabase -- ` +
          `kemungkinan supabase/migrations/0002_seed_system_data.sql belum dijalankan.`
      );
    }
    return {
      reading_id: newReadingId,
      position_id: positionUuid,
      card_id: entry.cardId,
      orientation: entry.orientation,
      interpretation_snapshot: entry.interpretationSnapshot ?? null,
    };
  });

  const { error: cardsError } = await supabase.from("reading_cards").insert(cardRows);
  if (cardsError) {
    await supabase.from("readings").delete().eq("id", newReadingId);
    throw new Error(`Gagal menyimpan kartu reading ke cloud: ${cardsError.message}`);
  }

  return { ...record, id: newReadingId, savedAt: insertedReading.created_at };
}

async function deleteCloud(id, userId) {
  // `reading_cards`/`journals` ikut terhapus otomatis lewat
  // `on delete cascade` (0001_init_schema.sql §41/§43) -- beda dari guest
  // storage yang harus mereplikasi cascade itu manual (lihat deleteGuestReading()).
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("readings").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(`Gagal menghapus reading dari cloud: ${error.message}`);
}

async function setFavoriteCloud(id, isFavorite, userId) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("readings")
    .update({ is_favorite: Boolean(isFavorite) })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(`Gagal memperbarui favorit: ${error.message}`);
}

// ---- Public API -----------------------------------------------------------

export async function listReadings() {
  const userId = currentUserId();
  return userId ? listCloud(userId) : listLocal();
}

export async function getReadingById(id) {
  const userId = currentUserId();
  return userId ? getCloudById(id, userId) : getLocalById(id);
}

export async function saveReading(record) {
  const userId = currentUserId();
  return userId ? saveCloud(record, userId) : saveLocal(record);
}

export async function deleteReading(id) {
  const userId = currentUserId();
  return userId ? deleteCloud(id, userId) : deleteLocal(id);
}

export async function setReadingFavorite(id, isFavorite) {
  const userId = currentUserId();
  return userId ? setFavoriteCloud(id, isFavorite, userId) : setFavoriteLocal(id, isFavorite);
}
