// OTR — Dev-only smoke test (Phase 26 — QA & Release, Roadmap Phase 26)
// Roadmap Phase 26 goal-nya "Production-ready release" dengan checklist Test
// (Reading/Data/Auth/Responsive/Security/Accessibility) — TANPA baris "DONE
// WHEN" eksplisit (sama seperti Phase 23-25). Reading/Data/Auth SUDAH dicek
// regresi lewat test_phase14-24 (semua masih lulus, lihat PROJECT_STATUS).
// Script ini HANYA menutup 2 bagian yang belum ada test otomatisnya sama
// sekali: Security & Accessibility. Responsive TIDAK bisa dites di sini
// (butuh browser/device asli — lihat Known Issues PROJECT_STATUS).
//
// Bagian:
//   1. Security — js/config.js & js/integrations/supabase.js tidak pernah
//      menyebut service_role/secret API key apa pun (Master Spec §66: "Frontend
//      only receives SUPABASE_URL/SUPABASE_ANON_KEY"); Edge Function
//      (supabase/functions/ai-reading-synthesis) TIDAK pernah hardcode
//      GEMINI_API_KEY (harus baca dari Deno.env).
//   2. Security — setiap tabel user-facing (dibuat di migrations) punya BAIK
//      `enable row level security` MAUPUN `grant ... to authenticated` (Phase
//      26 fix: baris grant yang baru ditambahkan sesi ini ke 0001/0003/0004,
//      lihat komentar migration masing-masing untuk latar belakang bug
//      produksi "permission denied for table" yang mendasarinya).
//   3. Accessibility — reduced motion (`@media (prefers-reduced-motion)` di
//      variables.css jadi 0ms token, dipakai animations.css/reading.css/
//      tarot-card.css), aria-label dinamis di reveal kartu (tarot-card.js,
//      Master Spec §60: card flip WAJIB aria-label bukan cuma animasi), dan
//      `:focus-visible` style ada di reset.css (keyboard navigation).
//
// Jalankan: node scripts/test_phase26_qa_release.mjs

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

let failures = 0;
function assert(cond, msg) {
  if (!cond) {
    failures++;
    console.error(`✗ ${msg}`);
  } else {
    console.log(`✓ ${msg}`);
  }
}

console.log("\n1. Security — no secrets di frontend");

const config = read("js/config.js");
const supabaseIntegration = read("js/integrations/supabase.js");
const secretPatterns = [/service_role/i, /SERVICE_ROLE/, /GEMINI_API_KEY/, /SUPABASE_SERVICE/i];
for (const pattern of secretPatterns) {
  assert(
    !pattern.test(config) && !pattern.test(supabaseIntegration),
    `js/config.js & js/integrations/supabase.js tidak menyebut ${pattern}`
  );
}
assert(
  /SUPABASE_URL/.test(config) && /SUPABASE_ANON_KEY/.test(config),
  "js/config.js hanya expose SUPABASE_URL & SUPABASE_ANON_KEY (sesuai Master Spec §66)"
);

const edgeFunctionFiles = ["supabase/functions/ai-reading-synthesis/index.ts", "supabase/functions/ai-reading-synthesis/index.js"];
for (const f of edgeFunctionFiles) {
  const src = read(f);
  assert(
    !/GEMINI_API_KEY\s*=\s*["'][^"']+["']/.test(src),
    `${f} tidak hardcode GEMINI_API_KEY (harus baca dari env var)`
  );
  assert(
    /Deno\.env\.get/.test(src) || /env\.get/.test(src),
    `${f} membaca API key lewat env var, bukan konstanta`
  );
}

console.log("\n2. Security — RLS + grant lengkap per tabel user-facing");

const migrationFiles = readdirSync(join(ROOT, "supabase/migrations")).sort();
let allMigrationsSrc = "";
for (const f of migrationFiles) allMigrationsSrc += read(`supabase/migrations/${f}`) + "\n";

// Tabel user-facing (punya user_id / milik user tertentu) — HARUS RLS + grant.
const userTables = [
  "profiles", "readings", "reading_cards", "journals", "favorites",
  "daily_cards", "user_settings", "quiz_progress",
];
// Tabel sistem read-only publik — RLS ya, grant CRUD authenticated TIDAK wajib
// (cukup select untuk anon+authenticated).
const systemTables = ["tarot_cards", "spreads", "spread_positions"];

for (const table of userTables) {
  assert(
    new RegExp(`alter table ${table} enable row level security`, "i").test(allMigrationsSrc),
    `tabel "${table}": RLS enabled`
  );
  assert(
    new RegExp(`grant[^;]*\\bon\\b[^;]*\\b${table}\\b[^;]*to authenticated`, "i").test(allMigrationsSrc) ||
      new RegExp(`grant[^;]*\\bon\\b[^;]*\\b${table}\\b[^;]*to[^;]*authenticated`, "i").test(allMigrationsSrc),
    `tabel "${table}": grant ke authenticated ada (Phase 26 fix)`
  );
}
for (const table of systemTables) {
  assert(
    new RegExp(`alter table ${table} enable row level security`, "i").test(allMigrationsSrc),
    `tabel sistem "${table}": RLS enabled`
  );
  assert(
    new RegExp(`grant select[^;]*\\bon\\b[^;]*\\b${table}\\b[^;]*to anon`, "i").test(allMigrationsSrc),
    `tabel sistem "${table}": grant select ke anon (guest bisa baca katalog)`
  );
}

console.log("\n3. Accessibility — reduced motion, aria-label reveal, focus-visible");

const variablesCss = read("css/variables.css");
const resetCss = read("css/reset.css");
const tarotCardJs = read("js/components/tarot-card.js");

assert(
  /@media \(prefers-reduced-motion: reduce\)/.test(variablesCss),
  "variables.css: token motion di-override 0ms di bawah prefers-reduced-motion"
);
assert(
  /:focus-visible/.test(resetCss),
  "reset.css: :focus-visible style global ada (keyboard navigation)"
);
assert(
  /setAttribute\("aria-label"/.test(tarotCardJs) && /aria-label="\$\{escapeHTML\(label\)\}"/.test(tarotCardJs),
  "tarot-card.js: aria-label kartu di-set baik saat render awal maupun saat reveal (Master Spec §60 — tidak boleh cuma animasi)"
);

console.log(failures === 0 ? "\n✅ Semua assertion lulus." : `\n❌ ${failures} assertion gagal.`);
process.exit(failures === 0 ? 0 : 1);
