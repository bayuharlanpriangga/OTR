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
import { listGuestReadings, listGuestJournalEntries, STORAGE_KEYS, remove } from "../core/storage.js";
import { getSpreadById, getPositionById } from "../tarot/spreads.js";

/**
 * Migrasikan seluruh guest reading (+ journal terkait) dari localStorage ke
 * Supabase. Data lokal HANYA dihapus kalau seluruh reading berhasil
 * termigrasi -- DONE WHEN Roadmap Phase 13 eksplisit minta "tanpa kehilangan
 * data", jadi migrasi partial/gagal sengaja TIDAK menghapus apa pun secara
 * lokal (aman dicoba lagi di login berikutnya; reading yang sudah sempat
 * ter-insert ke Supabase sebelum kegagalan tetap ada di sana, cuma belum
 * "resmi" dianggap termigrasi sampai localStorage-nya ikut bersih).
 *
 * @param {string} userId
 * @returns {Promise<{ ok:boolean, migratedReadings:number, migratedJournals:number, total:number, error?:string }>}
 */
export async function migrateGuestDataToCloud(userId) {
  const guestReadings = listGuestReadings();
  const guestJournals = listGuestJournalEntries();

  if (guestReadings.length === 0) {
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
    for (const guestReading of guestReadings) {
      // Resolve spread lokal dulu -- kalau id-nya sendiri sudah tidak
      // dikenali data/default-spreads.js, tidak ada cara aman menerka
      // posisi kartu, jadi migrasi dihentikan (bukan di-skip diam-diam,
      // supaya tidak ada reading yang "hilang" tanpa penjelasan).
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

  // Semua reading (+ journal terkait) berhasil -> baru aman menghapus data
  // lokal yang sudah termigrasi. Tidak menyentuh otr_settings/otr_favorites.
  remove(STORAGE_KEYS.READINGS);
  remove(STORAGE_KEYS.JOURNAL);

  return { ok: true, migratedReadings, migratedJournals, total: guestReadings.length };
}
