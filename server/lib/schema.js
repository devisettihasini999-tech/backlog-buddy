/* ============================================================================
   Backlog Buddy — DDL used to create the Supabase tables automatically.
   Runs once at boot when SUPABASE_DB_URL is configured.
   ============================================================================ */
'use strict';

const STATEMENTS = [
  `create extension if not exists "uuid-ossp"`,

  `create table if not exists public.profiles (
     id uuid primary key default uuid_generate_v4(),
     email text not null unique,
     full_name text,
     password_hash text not null,
     created_at timestamptz not null default now()
   )`,

  `create table if not exists public.branches (
     id text primary key,
     code text not null unique,
     name text not null,
     icon text default 'book',
     tone text default 'blue',
     blurb text,
     regulation text default 'R20',
     university text default 'JNTUK',
     created_at timestamptz not null default now()
   )`,

  `create table if not exists public.semesters (
     n integer primary key check (n between 1 and 8),
     label text not null,
     note text
   )`,

  `create table if not exists public.subjects (
     id text primary key,
     branch text not null references public.branches(id) on delete cascade,
     sem integer not null references public.semesters(n),
     code text not null,
     name text not null,
     credits numeric(3,1) default 3,
     regulation text default 'R20',
     university text default 'JNTUK',
     description text,
     units jsonb not null default '[]'::jsonb,
     featured boolean not null default false,
     created_at timestamptz not null default now()
   )`,

  `create table if not exists public.question_papers (
     id text primary key,
     subject text not null references public.subjects(id) on delete cascade,
     year integer not null,
     exam_type text not null default 'Regular',
     regulation text default 'R20',
     university text default 'JNTUK',
     marks integer default 60,
     duration text default '3 hours',
     file_url text,
     file_name text,
     uploaded_at timestamptz not null default now(),
     downloads integer default 0,
     views integer default 0
   )`,

  `create table if not exists public.questions (
     id text primary key,
     subject text not null references public.subjects(id) on delete cascade,
     unit integer not null,
     text text not null,
     topic text,
     tags text[] not null default '{}',
     years integer[] not null default '{}',
     marks integer default 5,
     created_at timestamptz not null default now()
   )`,

  `create table if not exists public.study_materials (
     id text primary key,
     subject text not null references public.subjects(id) on delete cascade,
     title text not null,
     type text not null default 'Notes',
     size text,
     url text,
     file_url text,
     added_at timestamptz not null default now()
   )`,

  `create table if not exists public.items (
     id uuid primary key default uuid_generate_v4(),
     user_id uuid not null references public.profiles(id) on delete cascade,
     title text not null,
     description text,
     ai_summary text,
     created_at timestamptz not null default now()
   )`,

  `create table if not exists public.user_progress (
     user_id uuid not null references public.profiles(id) on delete cascade,
     kind text not null,
     ref_id text not null,
     payload jsonb,
     updated_at timestamptz not null default now(),
     primary key (user_id, kind, ref_id)
   )`,

  `create table if not exists public.feedback (
     id bigserial primary key,
     name text,
     email text,
     branch text,
     topic text,
     code text,
     message text not null,
     created_at timestamptz not null default now()
   )`,

  `create index if not exists subjects_branch_sem_idx on public.subjects (branch, sem)`,
  `create index if not exists papers_subject_idx on public.question_papers (subject)`,
  `create index if not exists questions_subject_idx on public.questions (subject, unit)`,

  `create or replace view public.repeated_topics as
   select q.subject, q.unit, q.topic,
          count(*) as questions,
          count(distinct p.year) as papers,
          array_agg(distinct p.year order by p.year desc) as years
   from public.questions q
   join public.question_papers p on p.subject = q.subject
   where q.topic is not null
   group by q.subject, q.unit, q.topic
   having count(distinct p.year) >= 2
   order by papers desc, questions desc`
];

/* Row level security: public read on catalog content, service role writes. */
const RLS = [
  `alter table public.branches enable row level security`,
  `alter table public.semesters enable row level security`,
  `alter table public.subjects enable row level security`,
  `alter table public.question_papers enable row level security`,
  `alter table public.questions enable row level security`,
  `alter table public.study_materials enable row level security`,
  `alter table public.items enable row level security`,
  `alter table public.user_progress enable row level security`,
  `alter table public.feedback enable row level security`,
  `drop policy if exists "public read branches" on public.branches`,
  `create policy "public read branches" on public.branches for select using (true)`,
  `drop policy if exists "public read semesters" on public.semesters`,
  `create policy "public read semesters" on public.semesters for select using (true)`,
  `drop policy if exists "public read subjects" on public.subjects`,
  `create policy "public read subjects" on public.subjects for select using (true)`,
  `drop policy if exists "public read papers" on public.question_papers`,
  `create policy "public read papers" on public.question_papers for select using (true)`,
  `drop policy if exists "public read questions" on public.questions`,
  `create policy "public read questions" on public.questions for select using (true)`,
  `drop policy if exists "public read materials" on public.study_materials`,
  `create policy "public read materials" on public.study_materials for select using (true)`,
  `drop policy if exists "feedback insert" on public.feedback`,
  `create policy "feedback insert" on public.feedback for insert with check (true)`,
  `drop policy if exists "own items" on public.items`,
  `create policy "own items" on public.items for all using (auth.uid() = user_id) with check (auth.uid() = user_id)`
];

const ALL = STATEMENTS.concat(RLS);

module.exports = { STATEMENTS, RLS, ALL };
