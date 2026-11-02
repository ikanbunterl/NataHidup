-- ============================================================
-- NataHidup V3.0.0 — Migration fitur baru
-- Jalankan di Supabase SQL Editor. Idempotent & backward-compatible:
-- migration V2.1 (20261031_v21_features.sql) TETAP dibutuhkan.
-- Aplikasi gagal gracefully bila migration ini belum dijalankan.
-- ============================================================

-- ---------- F-3.9: Web Push (pengingat 19.00) ----------
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  keys text not null default '{}',        -- JSON {p256dh, auth} dari PushSubscription
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push subs own select" on public.push_subscriptions;
create policy "push subs own select" on public.push_subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "push subs own insert" on public.push_subscriptions;
create policy "push subs own insert" on public.push_subscriptions
  for insert with check (auth.uid() = user_id);

drop policy if exists "push subs own delete" on public.push_subscriptions;
create policy "push subs own delete" on public.push_subscriptions
  for delete using (auth.uid() = user_id);

create index if not exists push_subs_user_idx on public.push_subscriptions (user_id);

-- Pengiriman push jam 19.00 WIB dilakukan oleh Edge Function
-- `nightly-push` (lihat supabase/functions/nightly-push/index.ts) yang
-- dipanggil pg_cron. Setelah function di-deploy, aktifkan jadwal:
--
-- select cron.schedule(
--   'nh-nightly-push',
--   '0 12 * * *',                    -- 12:00 UTC = 19:00 WIB
--   $$select net.http_post(
--       url := 'https://nvxvfbwvplkxqoetzwky.supabase.co/functions/v1/nightly-push',
--       headers := '{"Authorization": "Bearer <ANON_ATAU_SERVICE_KEY>"}'::jsonb
--     )$$
-- );

-- ---------- F-3.12: QR split bill — peserta bisa membaca bill ----------
-- (hanya bila tabel split_bills/split_participants dari V2.1 sudah ada)
do $$
begin
  if to_regclass('public.split_bills') is not null
     and to_regclass('public.split_participants') is not null then
    execute 'alter table public.split_bills enable row level security';
    drop policy if exists "split bills readable by participants" on public.split_bills;
    execute $p$
      create policy "split bills readable by participants" on public.split_bills
        for select using (
          auth.uid() = user_id
          or exists (
            select 1 from public.split_participants sp
            where sp.split_id = split_bills.id and sp.user_id = auth.uid()
          )
        )
    $p$;
    drop policy if exists "split participants own rows" on public.split_participants;
    execute $p$
      create policy "split participants own rows" on public.split_participants
        for all using (auth.uid() = user_id) with check (auth.uid() = user_id)
    $p$;
  end if;
end $$;

-- Catatan: mode utama QR V3 tetap "payload di URL" (tanpa backend) sehingga
-- teman TANPA akun pun bisa membuka rincian patungan. Kebijakan di atas
-- hanya memperkaya pengalaman peserta yang punya akun.
