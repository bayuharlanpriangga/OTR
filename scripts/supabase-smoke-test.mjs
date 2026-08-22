// OTR — Supabase smoke test .

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

function step(label) {
  console.log(`\n— ${label} —`);
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  fail("SUPABASE_URL / SUPABASE_ANON_KEY belum di-set. Lihat komentar di atas file ini.");
}
if (!TEST_EMAIL || !TEST_PASSWORD) {
  fail("TEST_EMAIL / TEST_PASSWORD belum di-set. Lihat komentar di atas file ini.");
}

async function main() {
  // ---- 1. CONNECT ----
  step("1. CONNECT");
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log(`Client dibuat untuk ${SUPABASE_URL}`);

  // ---- 2. AUTHENTICATE ----
  step("2. AUTHENTICATE");
  let session = null;

  const signIn = await supabase.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASSWORD });
  if (signIn.data?.session) {
    session = signIn.data.session;
    console.log(`Sign in berhasil (user sudah ada sebelumnya): ${session.user.id}`);
  } else {
    console.log(`Sign in gagal (${signIn.error?.message ?? "unknown"}), coba sign up...`);
    const signUp = await supabase.auth.signUp({ email: TEST_EMAIL, password: TEST_PASSWORD });
    if (signUp.error) {
      fail(`Sign up juga gagal: ${signUp.error.message}`);
    }
    if (!signUp.data.session) {
      fail(
        "Sign up berhasil TAPI tidak ada session langsung -- project ini kemungkinan masih " +
          "mewajibkan konfirmasi email. Konfirmasi dulu email test-nya (cek inbox), atau " +
          "matikan sementara 'Confirm email' di Authentication -> Providers -> Email di " +
          "Supabase Dashboard, lalu jalankan skrip ini lagi."
      );
    }
    session = signUp.data.session;
    console.log(`Sign up + auto-login berhasil (user baru): ${session.user.id}`);
  }

  const userId = session.user.id;

  // ---- 3. INSERT ----
  step("3. INSERT");
  const testReading = {
    user_id: userId,
    spread_id: null, // sengaja null -- smoke test ini tidak butuh spread sungguhan ada di tabel spreads
    question: "[smoke test] Apakah pipeline Supabase ini jalan?",
    intention: "Verifikasi Phase 12",
    status: "completed",
    summary: { theme: "smoke-test", dominantKeywords: [], keyMessage: "ok", reflection: "ok" },
    is_favorite: false,
    completed_at: new Date().toISOString(),
  };

  const insertResult = await supabase.from("readings").insert(testReading).select().single();
  if (insertResult.error) {
    fail(`Insert gagal: ${insertResult.error.message}\n\nKalau errornya soal RLS policy, cek apakah migration supabase/migrations/0001_init_schema.sql sudah dijalankan LENGKAP (termasuk bagian RLS policies-nya, bukan cuma CREATE TABLE).`);
  }
  const readingId = insertResult.data.id;
  console.log(`Insert berhasil, reading id: ${readingId}`);

  // ---- 4. SELECT ----
  step("4. SELECT");
  const selectResult = await supabase.from("readings").select("*").eq("id", readingId).single();
  if (selectResult.error) fail(`Select gagal: ${selectResult.error.message}`);
  if (selectResult.data.question !== testReading.question) {
    fail("Select berhasil TAPI data yang kembali tidak cocok dengan yang di-insert.");
  }
  console.log(`Select berhasil, question: "${selectResult.data.question}"`);

  // ---- 5. UPDATE ----
  step("5. UPDATE");
  const updateResult = await supabase.from("readings").update({ is_favorite: true }).eq("id", readingId).select().single();
  if (updateResult.error) fail(`Update gagal: ${updateResult.error.message}`);
  if (updateResult.data.is_favorite !== true) fail("Update berhasil TAPI is_favorite tidak berubah jadi true.");
  console.log(`Update berhasil, is_favorite: ${updateResult.data.is_favorite}`);

  // ---- 6. DELETE ----
  step("6. DELETE");
  const deleteResult = await supabase.from("readings").delete().eq("id", readingId);
  if (deleteResult.error) fail(`Delete gagal: ${deleteResult.error.message}`);

  const verifyGone = await supabase.from("readings").select("id").eq("id", readingId).maybeSingle();
  if (verifyGone.data !== null) fail("Delete 'berhasil' tanpa error TAPI baris masih ada saat di-select ulang.");
  console.log("Delete berhasil, baris sudah tidak ada lagi.");

  // ---- (bonus) RLS sanity check: sign out lalu coba select tanpa auth ----
  step("Bonus — RLS sanity check (select tanpa login harus KOSONG/ditolak)");
  await supabase.auth.signOut();
  const anonResult = await supabase.from("readings").select("id").limit(1);
  if (anonResult.error) {
    console.log(`Ditolak dengan error (juga valid, tergantung setup): ${anonResult.error.message}`);
  } else if (anonResult.data.length === 0) {
    console.log("Tanpa login, select readings mengembalikan array kosong -- RLS bekerja seperti yang diharapkan.");
  } else {
    fail("RLS BOCOR: select readings tanpa login mengembalikan data. Cek ulang RLS policies di migration.");
  }

  console.log("\n" + "=".repeat(60));
  console.log("SEMUA 6 STEP PIPELINE (+ RLS sanity check) BERHASIL.");
  console.log("Roadmap Phase 12 DONE WHEN terpenuhi: Supabase CRUD berjalan dengan RLS.");
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("\n✗ Smoke test gagal dengan error tak terduga:");
  console.error(err);
  process.exit(1);
});
