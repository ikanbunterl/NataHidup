-- ============================================================
-- NataHidup V2.1 — "Gen-Z Money, Delight & Micro-Interaction"
-- Migrasi Supabase: tabel baru, RLS, index, alter tabel existing.
-- Backward-compatible: semua kolom baru nullable / default aman.
-- Jalankan sekali di SQL Editor Supabase.
-- ============================================================

-- ---------- 1. user_settings ----------
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  auto_theme boolean not null default true,
  sound_enabled boolean not null default true,
  haptic_enabled boolean not null default true,
  roast_enabled boolean not null default true,
  puasa_jajan_until timestamptz,
  puasa_jajan_categories text[] not null default '{}',
  streak_freeze_count integer not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------- 2. split_bills & split_participants ----------
create table if not exists public.split_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_id uuid,
  title text not null default '',
  total_amount numeric not null default 0,
  participant_count integer not null default 2,
  method text not null default 'rata',
  rounding integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists split_bills_user_idx on public.split_bills (user_id, created_at desc);

create table if not exists public.split_participants (
  id uuid primary key default gen_random_uuid(),
  split_bill_id uuid not null references public.split_bills(id) on delete cascade,
  name text not null default '',
  amount numeric not null default 0,
  paid boolean not null default false
);
create index if not exists split_participants_bill_idx on public.split_participants (split_bill_id);

-- ---------- 3. paylater_accounts (cadangan; UI V2.1 memakai debts.kind) ----------
create table if not exists public.paylater_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default '',
  outstanding numeric not null default 0,
  due_date date,
  monthly_amount numeric not null default 0,
  status text not null default 'pending',
  note text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists paylater_accounts_user_idx on public.paylater_accounts (user_id, due_date);

-- ---------- 4. savings_goals & savings_contributions (Wishlist) ----------
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric not null default 0,
  current_amount numeric not null default 0,
  source_url text,
  deadline date,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists savings_goals_user_idx on public.savings_goals (user_id, created_at desc);

create table if not exists public.savings_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.savings_goals(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  amount numeric not null default 0,
  wallet_id uuid,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists savings_contributions_goal_idx on public.savings_contributions (goal_id, created_at desc);

-- ---------- 5. subscriptions ----------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null default 0,
  cycle text not null default 'monthly',
  next_due_date date,
  category_id text,
  reminder_days integer not null default 3,
  auto_detected boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
create index if not exists subscriptions_user_idx on public.subscriptions (user_id, next_due_date);

-- ---------- 6. streaks ----------
create table if not exists public.streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_checkin date,
  freeze_used_at timestamptz,
  paused_until timestamptz
);

-- ---------- 7. achievements (aksesoris maskot dll.) ----------
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  unlocked_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique (user_id, code)
);
create index if not exists achievements_user_idx on public.achievements (user_id);

-- ---------- 8. wrapped_reports ----------
create table if not exists public.wrapped_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, month)
);

-- ---------- 9. Alter tabel existing ----------
alter table public.transactions
  add column if not exists paylater_account_id uuid,
  add column if not exists subscription_id uuid;

alter table public.debts
  add column if not exists kind text not null default 'hutang',
  add column if not exists provider text,
  add column if not exists monthly_amount numeric;

-- ---------- 10. Row Level Security ----------
alter table public.user_settings enable row level security;
alter table public.split_bills enable row level security;
alter table public.split_participants enable row level security;
alter table public.paylater_accounts enable row level security;
alter table public.savings_goals enable row level security;
alter table public.savings_contributions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.streaks enable row level security;
alter table public.achievements enable row level security;
alter table public.wrapped_reports enable row level security;

drop policy if exists "user_settings_own" on public.user_settings;
create policy "user_settings_own" on public.user_settings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "split_bills_own" on public.split_bills;
create policy "split_bills_own" on public.split_bills
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "split_participants_own" on public.split_participants;
create policy "split_participants_own" on public.split_participants
  for all using (
    exists (select 1 from public.split_bills sb where sb.id = split_bill_id and sb.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.split_bills sb where sb.id = split_bill_id and sb.user_id = auth.uid())
  );

drop policy if exists "paylater_accounts_own" on public.paylater_accounts;
create policy "paylater_accounts_own" on public.paylater_accounts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "savings_goals_own" on public.savings_goals;
create policy "savings_goals_own" on public.savings_goals
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "savings_contributions_own" on public.savings_contributions;
create policy "savings_contributions_own" on public.savings_contributions
  for all using (
    exists (select 1 from public.savings_goals g where g.id = goal_id and g.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.savings_goals g where g.id = goal_id and g.user_id = auth.uid())
  );

drop policy if exists "subscriptions_own" on public.subscriptions;
create policy "subscriptions_own" on public.subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "streaks_own" on public.streaks;
create policy "streaks_own" on public.streaks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "achievements_own" on public.achievements;
create policy "achievements_own" on public.achievements
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "wrapped_reports_own" on public.wrapped_reports;
create policy "wrapped_reports_own" on public.wrapped_reports
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- 11. Index tambahan ----------
create index if not exists transactions_date_user_idx on public.transactions (user_id, date desc);
create index if not exists debts_user_status_idx on public.debts (user_id, status);

-- ============================================================
-- Catatan:
-- * UI PayLater V2.1 membaca/menulis debts.kind ('paylater'/'cicilan'),
--   tabel paylater_accounts disediakan untuk fase lanjutan.
-- * Semua fitur V2.1 di aplikasi gagal secara graceful jika tabel
--   belum ada (cek error per-query), kecuali tabel inti V2.0 yang
--   tetap dicek lewat checkSchema().
-- ============================================================
