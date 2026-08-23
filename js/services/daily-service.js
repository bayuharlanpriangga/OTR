// OTR — Service: Daily Card (Phase 15 — Daily Card, Roadmap Phase 15, Master Spec §27/§28)
// Pola sama dengan reading-service.js/journal-service.js: pilih backend dari
// `state.user` (SEKALI dicek per pemanggilan, bukan flag statis), bentuk
// record yang dikembalikan SAMA untuk guest maupun cloud:
//   { date, cardId, card, orientation, reflectionPrompt, createdAt }
// ("card" = objek kartu penuh, di-join di sini lewat getCardById() — daily
// cards cloud/local cuma menyimpan card_id/cardId, konsisten dengan pola
// reading-service.js yang juga resolve cardName lewat getCardById(), bukan
// menduplikasi data kartu ke tiap baris).
//
// Catatan skema penting: `daily_cards` (Supabase, 0001_init_schema.sql §45)
// cuma punya kolom `reflection_prompt` — PERTANYAAN reflektif deterministik
// dari js/tarot/daily-card.js, BUKAN kolom untuk jawaban/tulisan bebas user
// (beda dari `journals.content`). Fitur "Reflection" di Roadmap Phase 15
// diimplementasikan sebagai menampilkan pertanyaan ini di js/pages/daily.js
// (§28 "DAILY CARD DATA" cuma mendaftar { date, cardId, orientation,
// reflectionPrompt } — tidak ada field jawaban). Kalau nanti Orias mau
// tulisan bebas per Daily Card, itu perlu migration baru (kolom/tabel
// tambahan) + keputusan eksplisit apakah itu perluasan Phase 15 atau
// journal terpisah — dicatat sebagai kandidat di PROJECT_STATUS.md, bukan
// diasumsikan diam-diam di sini.
//
// Storage-first, compute-on-miss: getTodayDailyCard() SELALU cek record
// tersimpan untuk tanggal ini dulu (guest: localStorage; cloud: query
// `daily_cards`) — kalau ada, dikembalikan APA ADANYA (immutability, sama
// prinsip dengan interpretationSnapshot reading di result.js/
// history-detail.js: kartu hari yang sudah lewat tidak boleh berubah walau
// algoritma getDailyCard() berubah di kemudian hari). Kalau belum ada,
// dihitung lewat js/tarot/daily-card.js (deterministic) lalu disimpan.
//
// Kenapa tetap deterministic (bukan generate sekali pakai random lalu
// simpan): race dua tab/device menghitung BARENGAN sebelum salah satu
// sempat tersimpan (mis. dua tab dibuka nyaris bersamaan pagi hari) akan
// menghasilkan kartu yang SAMA persis dari js/tarot/daily-card.js, jadi
// upsert kedua ke cloud (unique(user_id, reading_date)) aman — tidak ada
// risiko "tab A dapat kartu beda dari tab B" walau keduanya sempat insert.

import { getState } from "../core/state.js";
import { getSupabaseClient } from "../integrations/supabase.js";
import { getCardById } from "../../data/tarot-cards.js";
import { getDailyCard, toDateKey } from "../tarot/daily-card.js";
import {
  listGuestDailyCards,
  getGuestDailyCardByDate,
  saveGuestDailyCard,
  getOrCreateGuestId,
} from "../core/storage.js";

function currentUserId() {
  return getState().user?.id ?? null;
}

function joinCard(record) {
  if (!record) return null;
  return { ...record, card: getCardById(record.cardId) };
}

// ---- Local (guest) ------------------------------------------------------

async function getTodayLocal(dateKey) {
  const existing = getGuestDailyCardByDate(dateKey);
  if (existing) return existing;

  const seedId = getOrCreateGuestId();
  const computed = getDailyCard({ seedId, date: dateKey });
  const record = { ...computed, createdAt: new Date().toISOString() };
  const ok = saveGuestDailyCard(record);
  if (!ok) throw new Error("Gagal menyimpan kartu harian ke penyimpanan lokal.");
  return record;
}

async function listLocal(limit) {
  return listGuestDailyCards()
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit);
}

// ---- Cloud ----------------------------------------------------------------

function mapCloudRow(row) {
  return {
    date: row.reading_date,
    cardId: row.card_id,
    orientation: row.orientation,
    reflectionPrompt: row.reflection_prompt ?? "",
    createdAt: row.created_at,
  };
}

async function getTodayCloud(dateKey, userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("daily_cards")
    .select("*")
    .eq("user_id", userId)
    .eq("reading_date", dateKey)
    .maybeSingle();
  if (error) throw new Error(`Gagal memuat kartu harian dari cloud: ${error.message}`);
  if (data) return mapCloudRow(data);

  const computed = getDailyCard({ seedId: userId, date: dateKey });

  // upsert (bukan insert polos) — jaga-jaga race dua tab/device yang
  // sama-sama menemukan belum ada record lalu insert nyaris bersamaan;
  // constraint unique(user_id, reading_date) akan menolak insert kedua kalau
  // pakai insert biasa. Karena getDailyCard() deterministic, upsert di sini
  // aman: kalaupun kalah race, baris yang menang tetap kartu yang SAMA.
  const { data: upserted, error: upsertError } = await supabase
    .from("daily_cards")
    .upsert(
      {
        user_id: userId,
        reading_date: dateKey,
        card_id: computed.cardId,
        orientation: computed.orientation,
        reflection_prompt: computed.reflectionPrompt,
      },
      { onConflict: "user_id,reading_date" }
    )
    .select()
    .single();
  if (upsertError) throw new Error(`Gagal menyimpan kartu harian ke cloud: ${upsertError.message}`);
  return mapCloudRow(upserted);
}

async function listCloud(limit, userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("daily_cards")
    .select("*")
    .eq("user_id", userId)
    .order("reading_date", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Gagal memuat riwayat kartu harian dari cloud: ${error.message}`);
  return (data ?? []).map(mapCloudRow);
}

// ---- Public API -------------------------------------------------------------

/** Kartu harian untuk HARI INI (waktu lokal device), dibuat kalau belum ada.
 * @returns {Promise<{date:string, cardId:string, card:object, orientation:"upright"|"reversed", reflectionPrompt:string, createdAt:string}>}
 */
export async function getTodayDailyCard() {
  const userId = currentUserId();
  const dateKey = toDateKey(new Date());
  const record = userId ? await getTodayCloud(dateKey, userId) : await getTodayLocal(dateKey);
  return joinCard(record);
}

/** Riwayat kartu harian, terbaru duluan (Roadmap Phase 15 — "Daily History").
 * @param {number} [limit]
 * @returns {Promise<Array<{date, cardId, card, orientation, reflectionPrompt, createdAt}>>}
 */
export async function listDailyCardHistory(limit = 14) {
  const userId = currentUserId();
  const records = userId ? await listCloud(limit, userId) : await listLocal(limit);
  return records.map(joinCard);
}
