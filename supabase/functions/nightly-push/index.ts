// NataHidup V3 — F-3.9 Web Push "Jam 7 Malam"
// Deploy:  supabase functions deploy nightly-push
// Secret:  supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=...
// Jadwal:  lihat pg_cron di migrations/20261101_v30_features.sql (19.00 WIB)
//
// VAPID keys (sekali saja, di mesin lokal):
//   npx web-push generate-vapid-keys
//   -> public key  : isi ke config.js (VAPID_PUBLIC_KEY) & secret
//   -> private key : HANYA ke secret Supabase (jangan pernah ke client)
//
import webpush from "npm:web-push@3.6.7";

const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY") || "";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails("mailto:owner@natahidup.app", VAPID_PUBLIC, VAPID_PRIVATE);
}

const MESSAGES = [
  "Udah jam 7 malam 🌙 Pengeluaran hari ini udah dicatat belum?",
  "Tok tok 📦 Dompetmu kangen dicatat. Dua menit aja kok!",
  "Malam! ✨ Catat sekarang, tidur tenang, besok nggak penasaran.",
  "Jam 7 ⏰ Waktunya kencan singkat sama buku keuanganmu 📖",
  "Aku udah nungguin dari tadi 🥺 Catat pengeluaran hari ini yuk!",
];

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("OK", { status: 200 });
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return new Response(JSON.stringify({ error: "VAPID keys belum di-set" }), { status: 501 });
  }
  const { data: subs, error } = await fetch(
    `${SUPA_URL}/rest/v1/push_subscriptions?select=endpoint,keys`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
  ).then((r) => r.json()).then((d) => ({ data: d, error: null })).catch((e) => ({ data: null, error: e }));
  if (error || !Array.isArray(subs)) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
  const body = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  let sent = 0, failed = 0;
  for (const s of subs) {
    try {
      let keys = s.keys;
      if (typeof keys === "string") keys = JSON.parse(keys);
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys },
        JSON.stringify({ title: "NataHidup 🌙", body, url: "./?action=add-expense" }),
      );
      sent++;
    } catch {
      failed++;
      // 404/410 = subscription hangus; bersihkan:
      try {
        await fetch(`${SUPA_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(s.endpoint)}`, {
          method: "DELETE",
          headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
        });
      } catch { /* biarkan */ }
    }
  }
  return new Response(JSON.stringify({ sent, failed, total: subs.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
