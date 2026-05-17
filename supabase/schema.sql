-- =========================================================
-- Daily Breaths, Mindful Thoughts — Supabase schema (Phase 1)
-- =========================================================
-- 사용법: Supabase 대시보드 → SQL Editor 에서 전체 복사 → Run
-- =========================================================

create extension if not exists "pgcrypto";

-- 1) moods 테이블
-- (시간대·요일 추출은 Phase 2 통계 시점에 query 안에서 extract() 사용)
create table if not exists public.moods (
  id uuid primary key default gen_random_uuid(),
  text text not null check (char_length(text) <= 140 and char_length(trim(text)) > 0),
  created_at timestamptz not null default now(),
  -- Phase 2+ 에서 채울 컬럼들
  user_id uuid references auth.users on delete set null,
  emotion text,
  keywords text[]
);

create index if not exists moods_created_at_desc_idx on public.moods (created_at desc);

-- 2) Row Level Security — 익명 입력 + 익명 읽기 (Phase 1)
alter table public.moods enable row level security;

drop policy if exists "anyone can insert" on public.moods;
create policy "anyone can insert"
  on public.moods
  for insert
  with check (true);

drop policy if exists "anyone can read" on public.moods;
create policy "anyone can read"
  on public.moods
  for select
  using (true);

-- =========================================================
-- Phase 3 미리보기 (지금 실행할 필요는 없음) — 가입 + 알림 시
-- =========================================================
-- create table if not exists public.notification_settings (
--   user_id uuid primary key references auth.users on delete cascade,
--   channel text not null check (channel in ('email','web_push','kakao')),
--   time time not null,
--   weekdays int[] not null default '{1,2,3,4,5,6,0}',
--   enabled boolean not null default true,
--   timezone text not null default 'Asia/Seoul',
--   updated_at timestamptz default now()
-- );
