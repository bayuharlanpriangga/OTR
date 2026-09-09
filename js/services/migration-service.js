// OTR — Service: Migration (Phase 13 — Authentication, Roadmap Phase 13, Master Spec §48)
// Flow persis §48: Guest Data -> Login -> Check LocalStorage -> Upload readings
// -> Associate with user -> Clear migrated local data. Journal ikut dimigrasi
// (dipanggil bareng readings-nya) walau §48 cuma sebut kata "readings" secara
// eksplisit -- journal.readingId menunjuk ke reading lokal, jadi kalau tidak
// ikut dimigrasi & dihapus bareng, dia jadi entry yatim menunjuk reading yang
// sudah tidak ada di localStorage (lihat pola cascade yang sama di
// deleteGuestReading(), core/storage.js Phase 11).
//
// Dipanggil SEKALI, tepat setelah login/register sukses (dari js/pages/login.js
// & register.js) -- BUKAN dari onAuthStateChange listener di app.js, supaya
// tidak ada percobaan migrasi ganda/race waktu token di-refresh atau sesi
// dipulihkan lintas tab.

import { getSupabaseClient } from "../integrations/supabase.js";
import {
  listGuestReadings,
  listGuestJournalEntries,
  listGuestCustomSpreads,
  STORAGE_KEYS,
  remove,
} from "../core/storage.js";
import { getSpreadById, getPositionById, registerCustomSpread } from "../tarot/spreads.js";

/**
 * Salin custom spread guest (Phase 19) ke cloud SEBELUM readings dimigrasi.
 * Readings guest yang memakai custom spread punya `spreadId` yang menunjuk
 * ke id lokal ini; kalau baris `spreads` cloud belum ada saat readings
 * di-insert, insert reading itu akan GAGAL kena foreign key constraint
 * `readings.spread_id references spreads(id)` (0001_init_schema.sql §41,
 * sengaja TANPA on delete cascade/action lain -- lihat komentar di
 * custom-spread-service.js). ID SENGAJA DIPERTAHANKAN SAMA (bukan dibuat
 * ulang) supaya `guestReading.spreadId` di loop bawah tetap valid tanpa
 * perlu menulis ulang setiap reading yang mereferensikannya.
 *
 * registerCustomSpread() dipanggil di akhir tiap iterasi supaya
 * getSpreadById() (dipakai loop readings di bawah) langsung bisa melihat
 * spread yang baru saja dimigrasi TANPA perlu ensureCustomSpreadsLoaded()
 * (yang notabene akan fetch ulang dari cloud -- state race yang tidak
 * perlu di tengah proses migrasi satu kali ini).
 */
async function migrateGuestCustomSpreads(supabase, userId) {
  const guestSpreads = listGuestCustomSpreads();
  for (const spread of guestSpreads) {
    const { error: spreadError } = await supabase.from("spreads").insert({
      id: spread.id,
      name: spread.name,
      slug: spread.id,
      category: spread.category || "general",
      description: spread.description || null,
      card_count: spread.cardCount,
      is_system: false,
      user_id: userId,
      created_at: spread.createdAt || new Date().toISOString(),
    });
    if (spreadError) {
      // 23505 = unique violation (Postgres) -- kemungkinan migrasi ini
      // pernah jalan sebagian di percobaan sebelumnya (retry setelah gagal
      // di tengah jalan, lihat catatan "aman dicoba lagi" di
      // migrateGuestDataToCloud()) dan spread ini SUDAH sempat termigrasi.
      // Aman dilewati -- BUKAN dianggap fatal -- supaya retry migrasi tidak
      // macet permanen gara-gara langkah yang sebenarnya sudah sukses.
      if (spreadError.code !== "23505") {
        throw new Error(`Migrasi custom spread "${spread.id}" gagal: ${spreadError.message}`);
      }
    } else {
      const positionRows = spread.positions.map((p) => ({
        spread_id: spread.id,
        position_index: p.index,
        name: p.name,
        description: p.description || null,
      }));
      const { error: positionsError } = await supabase.from("spread_positions").insert(positionRows);
      if (positionsError) {
        throw new Error(`Migrasi posisi custom spread "${spread.id}" gagal: ${positionsError.message}`);
      }
    }
    registerCustomSpread(spread);
  }
}

/**
 * Migrasikan seluruh guest reading (+ journal terkait, + custom spread yang
 * dipakainya -- Phase 19) dari localStorage ke Supabase. Data lokal HANYA
 * dihapus kalau seluruhnya berhasil termigrasi -- DONE WHEN Roadmap Phase 13
 * eksplisit minta "tanpa kehilangan data", jadi migrasi partial/gagal
 * sengaja TIDAK menghapus apa pun secara lokal (aman dicoba lagi di login
 * berikutnya; reading yang sudah sempat ter-insert ke Supabase sebelum
 * kegagalan tetap ada di sana, cuma belum "resmi" dianggap termigrasi
 * sampai localStorage-nya ikut bersih).
 *
 * @param {string} userId
 * @returns {Promise<{ ok:boolean, migratedReadings:number, migratedJournals:number, total:number, error?:string }>}
 */
export async function migrateGuestDataToCloud(userId) {
  const guestReadings = listGuestReadings();
  const guestJournals = listGuestJournalEntries();
  const guestCustomSpreads = listGuestCustomSpreads();

  // Phase 19: sebelumnya guard ini cuma cek guestReadings.length -- user
  // yang sudah bikin custom spread tapi BELUM sempat reading dengannya
  // (spread-nya "yatim", tidak direferensikan reading mana pun) akan lolos
  // guard lama tanpa pernah termigrasi, jadi diam-diam hilang begitu
  // currentUserId() beralih ke cloud pasca-login. Sekarang custom spread
  // yang belum dipakai reading apa pun TETAP dimigrasi lewat cabang ini.
  if (guestReadings.length === 0 && guestCustomSpreads.length === 0) {
    return { ok: true, migratedReadings: 0, migratedJournals: 0, total: 0 };
  }

  const supabase = getSupabaseClient();

  // Cache posisi per spread -- readings sering berbagi spread yang sama
  // (mis. beberapa reading "Past/Present/Future"), jadi cukup 1 query per
  // spread, bukan per reading.
  const positionCache = new Map(); // spreadId -> Map(positionIndex -> spread_positions.id)

  async function getPositionIdMap(spreadId) {
    if (positionCache.has(spreadId)) return positionCache.get(spreadId);
    const { data, error } = await supabase
      .from("spread_positions")
      .select("id, position_index")
      .eq("spread_id", spreadId);
    if (error) {
      throw new Error(`Gagal mengambil data posisi spread "${spreadId}": ${error.message}`);
    }
    const map = new Map(data.map((row) => [row.position_index, row.id]));
    positionCache.set(spreadId, map);
    return map;
  }

  let migratedReadings = 0;
  let migratedJournals = 0;

  try {
    // Custom spread (Phase 19) dimigrasi DULU, sebelum readings -- lihat
    // komentar lengkap migrateGuestCustomSpreads() di atas. Kalau ini gagal,
    // seluruh migrasi dianggap gagal (masuk catch di bawah) sama seperti
    // kegagalan di loop readings.
    await migrateGuestCustomSpreads(supabase, userId);

    for (const guestReading of guestReadings) {
      // Resolve spread lokal dulu -- kalau id-nya sendiri sudah tidak
      // dikenali data/default-spreads.js MAUPUN custom spread yang baru
      // saja dimigrasi di atas, tidak ada cara aman menerka posisi kartu,
      // jadi migrasi dihentikan (bukan di-skip diam-diam, supaya tidak ada
      // reading yang "hilang" tanpa penjelasan).
      const spread = getSpreadById(guestReading.spreadId);
      if (!spread) {
        throw new Error(
          `Spread "${guestReading.spreadId}" pada reading "${guestReading.id}" tidak dikenali -- migrasi dihentikan.`
        );
      }

      const { data: insertedReading, error: readingError } = await supabase
        .from("readings")
        .insert({
          user_id: userId,
          spread_id: guestReading.spreadId,
          question: guestReading.question || null,
          intention: guestReading.intention || null,
          status: guestReading.status || "completed",
          summary: guestReading.synthesisSnapshot ?? null,
          is_favorite: Boolean(guestReading.isFavorite),
          created_at: guestReading.createdAt || new Date().toISOString(),
          completed_at: guestReading.completedAt || null,
        })
        .select()
        .single();

      if (readingError) {
        throw new Error(`Insert reading "${guestReading.id}" gagal: ${readingError.message}`);
      }

      const newReadingId = insertedReading.id;

      // Resolve position_id (uuid) tiap kartu lewat position_index -- BUKAN
      // lewat positionId (slug lokal, mis. "past") -- karena kolom id di
      // spread_positions Supabase adalah uuid random, tidak sepadan dengan
      // slug lokal (lihat catatan Phase 12 di PROJECT_STATUS.md).
      const positionIdMap = await getPositionIdMap(spread.id);
      const cardRows = guestReading.cards.map((entry) => {
        const localPosition = getPositionById(spread, entry.positionId);
        const positionUuid = localPosition ? positionIdMap.get(localPosition.index) : undefined;
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
        throw new Error(`Insert reading_cards untuk reading "${guestReading.id}" gagal: ${cardsError.message}`);
      }

      migratedReadings += 1;

      // Journal terkait (kalau ada) -- "One reading may have one journal
      // entry in MVP" (Master Spec §25), jadi paling banyak 1 per reading.
      const journalEntry = guestJournals.find((j) => j.readingId === guestReading.id);
      if (journalEntry) {
        const { error: journalError } = await supabase.from("journals").insert({
          user_id: userId,
          reading_id: newReadingId,
          content: journalEntry.content,
          created_at: journalEntry.createdAt || new Date().toISOString(),
          updated_at: journalEntry.updatedAt || new Date().toISOString(),
        });
        if (journalError) {
          throw new Error(`Insert journal untuk reading "${guestReading.id}" gagal: ${journalError.message}`);
        }
        migratedJournals += 1;
      }
    }
  } catch (err) {
    return {
      ok: false,
      migratedReadings,
      migratedJournals,
      total: guestReadings.length,
      error: err?.message ?? String(err),
    };
  }

  // Semua reading (+ journal + custom spread) berhasil -> baru aman
  // menghapus data lokal yang sudah termigrasi. Tidak menyentuh
  // otr_settings/otr_favorites (lihat keputusan yang sama di komentar file
  // ini bagian atas & Known Issues Phase 15/16 di PROJECT_STATUS.md).
  remove(STORAGE_KEYS.READINGS);
  remove(STORAGE_KEYS.JOURNAL);
  remove(STORAGE_KEYS.CUSTOM_SPREADS);

  return { ok: true, migratedReadings, migratedJournals, total: guestReadings.length };
}
