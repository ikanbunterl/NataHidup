-- ============================================================
-- NataHidup V3 — Audit RLS (BUG-001)
-- Jalankan di Supabase SQL Editor. Anon key bersifat publik;
-- keamanan data = RLS. Script ini menandai tabel yang BOCOR.
-- ============================================================

-- 1) Tabel publik TANPA RLS (harus 0 baris; kalau ada → bahaya)
select n.nspname as schema, c.relname as tabel,
       'RLS MATI — segera aktifkan!' as status
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind = 'r'
  and n.nspname = 'public'
  and not c.relrowsecurity;

-- 2) Tabel dengan RLS tapi TANPA policy sama sekali
--    (aman (default-deny): tidak bisa dibaca siapa pun selain service role)
select t.relname as tabel, 'RLS aktif, 0 policy (deny-all)' as status
from pg_class t
where t.relkind = 'r' and t.relnamespace = 'public'::regnamespace
  and t.relrowsecurity
  and not exists (select 1 from pg_policies p where p.tablename = t.relname);

-- 3) Ringkasan seluruh policy
select tablename, policyname, cmd, qual is not null as pakai_using
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 4) Verifikasi cepat sebagai user anonim (semua harus kosong/error):
-- set role anon;
-- select count(*) from transactions;     -- harus ERROR permission denied
-- select count(*) from push_subscriptions;
-- reset role;

-- Rekomendasi tambahan (dashboard Supabase, bukan SQL):
--  * Auth → Rate limits: turunkan "Send SMS"/"Signups per hour" seperlunya.
--  * API → aktifkan "Legacy API keys disabled" bila project baru.
--  * Jangan pernah menaruh service_role key di file client (config.js
--    HANYA berisi anon key).
