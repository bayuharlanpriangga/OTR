// OTR — Supabase Edge Function: ai-reading-synthesis (Phase 22 — AI Reading,
// Roadmap Phase 22, Master Spec §66-68).
//
// "AI bukan tarot engine" (Roadmap Phase 22, ditulis tebal di sana): kartu,
// orientasi, dan spread SUDAH final & deterministik sebelum request ini
// dikirim (js/tarot/tarot-engine.js, crypto.getRandomValues() — tidak pernah
// berubah). Function ini HANYA mensintesis interpretasi teks dari data yang
// sudah ada, tidak pernah diberi wewenang menentukan kartu apa pun.
//
// Architecture (persis Roadmap Phase 22 & Master Spec §67):
//   Frontend (js/services/ai-service.js)
//     -> supabase.functions.invoke("ai-reading-synthesis")
//     -> Function INI (jalan di server Supabase, API key AI cuma ada di sini
//        sebagai secret -- TIDAK PERNAH dikirim ke/diketahui klien)
//     -> Gemini API
//     -> Structured response (schema Master Spec §67 "AI output")
//     -> Frontend
//
// DONE WHEN (Roadmap Phase 22): "AI synthesis works without exposing API
// keys" -- dipenuhi karena GEMINI_API_KEY hanya dibaca dari Deno.env di sini
// (secret Supabase, di-set lewat `supabase secrets set`, TIDAK ADA di
// repo/js/config.js seperti SUPABASE_ANON_KEY yang memang publik).
//
// Deploy: `supabase functions deploy ai-reading-synthesis` (butuh Supabase
// CLI + login ke project asli -- di luar kemampuan sandbox sesi coding ini,
// lihat PROJECT_STATUS.md "Next Phase"). Secret provider AI:
//   supabase secrets set GEMINI_API_KEY=<key dari Google AI Studio>
// Model bisa diganti tanpa redeploy kode lewat secret opsional kedua:
//   supabase secrets set GEMINI_MODEL=gemini-2.5-flash   (default kalau tidak di-set)
//
// File ini SENGAJA .js (bukan .ts) -- konsisten dengan seluruh codebase app
// yang plain JS tanpa build step (lihat komentar js/integrations/supabase.js).
// Deno menjalankan .js sama baiknya dengan .ts, jadi tidak ada trade-off
// teknis untuk konsistensi ini.

import { validatePayload, buildPrompt, parseModelText, validateSynthesis } from "./prompt.js";

const DEFAULT_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// ---------------------------------------------------------------------------
// CORS -- pola standar Supabase Edge Function (dipanggil dari browser lewat
// supabase-js `functions.invoke()`, yang menambahkan header Authorization/
// apikey/x-client-info sendiri -- semua harus diizinkan di Allow-Headers).
// ---------------------------------------------------------------------------
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

async function callGemini(prompt, apiKey, model) {
  const url = `${GEMINI_ENDPOINT_BASE}/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini API error (${res.status}): ${errText || res.statusText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error("Gemini API tidak mengembalikan teks respons (kemungkinan diblokir safety filter).");
  }
  return text;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Body harus JSON valid." }, 400);
  }

  let payload;
  try {
    payload = validatePayload(body);
  } catch (err) {
    return jsonResponse({ error: err.message }, 400);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    // Secret belum di-set di project Supabase -- lihat komentar Deploy di
    // atas. Dikembalikan sebagai 500 (kesalahan konfigurasi server), bukan
    // 400 (bukan kesalahan payload klien).
    return jsonResponse({ error: "Server belum dikonfigurasi: GEMINI_API_KEY tidak ditemukan." }, 500);
  }
  const model = Deno.env.get("GEMINI_MODEL") || DEFAULT_MODEL;

  const prompt = buildPrompt(payload);

  let synthesis;
  try {
    const rawText = await callGemini(prompt, apiKey, model);
    const parsed = parseModelText(rawText);
    synthesis = validateSynthesis(parsed);
  } catch (err) {
    console.error("[ai-reading-synthesis]", err);
    return jsonResponse({ error: `Gagal mensintesis interpretasi AI: ${err.message}` }, 502);
  }

  return jsonResponse(synthesis, 200);
});
