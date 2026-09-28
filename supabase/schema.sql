-- ============================================================================
-- Backlog Buddy — Supabase schema
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query).
-- Relationships: Branch -> Semester -> Subject -> Question Papers -> Questions
--                Subject -> Study Materials
-- ============================================================================

-- ---------- branches ----------
create table if not exists public.branches (
  id          text primary key,
  code        text not null unique,
  name        text not null,
  icon        text default 'book',
  tone        text default 'blue',
  blurb       text,
  regulation  text default 'R20',
  university  text default 'JNTUK',
  created_at  timestamptz not null default now()
);

-- ---------- semesters ----------
create table if not exists public.semesters (
  n           integer primary key check (n between 1 and 8),
  label       text not null,
  note        text
);

insert into public.semesters (n, label, note) values
  (1, '1st Semester', 'First year - Physics / Chemistry cycle'),
  (2, '2nd Semester', 'First year - Chemistry / Physics cycle'),
  (3, '3rd Semester', 'Second year - core subjects begin'),
  (4, '4th Semester', 'Second year - core subjects'),
  (5, '5th Semester', 'Third year - professional electives begin'),
  (6, '6th Semester', 'Third year - labs and mini project'),
  (7, '7th Semester', 'Final year - project phase I'),
  (8, '8th Semester', 'Final year - project phase II')
on conflict (n) do nothing;

-- ---------- subjects ----------
create table if not exists public.subjects (
  id          text primary key,
  branch      text not null references public.branches(id) on delete cascade,
  sem         integer not null references public.semesters(n),
  code        text not null,
  name        text not null,
  credits     numeric(3,1) default 3,
  regulation  text default 'R20',
  university  text default 'JNTUK',
  description text,
  units       jsonb not null default '[]'::jsonb,
  featured    boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists subjects_branch_sem_idx on public.subjects (branch, sem);
create index if not exists subjects_code_idx on public.subjects (code);

-- ---------- question papers ----------
create table if not exists public.question_papers (
  id           text primary key,
  subject      text not null references public.subjects(id) on delete cascade,
  year         integer not null,
  exam_type    text not null default 'Regular'
               check (exam_type in ('Regular','Supplementary','Backlog','Makeup')),
  regulation   text default 'R20',
  university   text default 'JNTUK',
  marks        integer default 60,
  duration     text default '3 hours',
  file_url     text,
  file_name    text,
  uploaded_at  timestamptz not null default now(),
  downloads    integer default 0,
  views        integer default 0
);
create index if not exists papers_subject_idx on public.question_papers (subject);
create index if not exists papers_year_idx on public.question_papers (year);
create index if not exists papers_branch_year_idx on public.question_papers (year, exam_type);

-- ---------- questions ----------
create table if not exists public.questions (
  id         text primary key,
  subject    text not null references public.subjects(id) on delete cascade,
  unit       integer not null check (unit between 1 and 8),
  text       text not null,
  topic      text,
  tags       text[] not null default '{}',   -- vi | fa | rq | it | pq
  years      integer[] not null default '{}',
  marks      integer default 5,
  created_at timestamptz not null default now()
);
create index if not exists questions_subject_idx on public.questions (subject, unit);
create index if not exists questions_tags_idx on public.questions using gin (tags);

-- ---------- study materials ----------
create table if not exists public.study_materials (
  id         text primary key,
  subject    text not null references public.subjects(id) on delete cascade,
  title      text not null,
  type       text not null default 'Notes'
             check (type in ('Syllabus','Notes','Important Questions','Formula Sheet','Question Papers','Video','Model Paper')),
  size       text,
  url        text,
  file_url   text,
  added_at   timestamptz not null default now()
);
create index if not exists materials_subject_idx on public.study_materials (subject, type);

-- ---------- user progress (optional, enable when auth is added) ----------
create table if not exists public.user_progress (
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject_id  text not null references public.subjects(id) on delete cascade,
  status      text not null default 'saved' check (status in ('saved','completed','bookmarked')),
  updated_at  timestamptz not null default now(),
  primary key (user_id, subject_id, status)
);

-- ---------- feedback ----------
create table if not exists public.feedback (
  id          bigserial primary key,
  name        text,
  email       text,
  branch      text,
  topic       text,
  code        text,
  message     text not null,
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- Row level security
-- Public read for catalog content. Writes are restricted to authenticated
-- service accounts (the admin panel uses the server side secret key).
-- ============================================================================
alter table public.branches          enable row level security;
alter table public.semesters         enable row level security;
alter table public.subjects          enable row level security;
alter table public.question_papers   enable row level security;
alter table public.questions         enable row level security;
alter table public.study_materials   enable row level security;
alter table public.user_progress     enable row level security;
alter table public.feedback          enable row level security;

drop policy if exists "public read branches" on public.branches;
create policy "public read branches" on public.branches for select using (true);

drop policy if exists "public read semesters" on public.semesters;
create policy "public read semesters" on public.semesters for select using (true);

drop policy if exists "public read subjects" on public.subjects;
create policy "public read subjects" on public.subjects for select using (true);

drop policy if exists "public read papers" on public.question_papers;
create policy "public read papers" on public.question_papers for select using (true);

drop policy if exists "public read questions" on public.questions;
create policy "public read questions" on public.questions for select using (true);

drop policy if exists "public read materials" on public.study_materials;
create policy "public read materials" on public.study_materials for select using (true);

drop policy if exists "feedback insert" on public.feedback;
create policy "feedback insert" on public.feedback for insert with check (true);

drop policy if exists "own progress" on public.user_progress;
create policy "own progress" on public.user_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- storage bucket for uploaded PDFs ----------
insert into storage.buckets (id, name, public) values ('question-papers', 'question-papers', true)
on conflict (id) do nothing;

drop policy if exists "public read papers bucket" on storage.objects;
create policy "public read papers bucket" on storage.objects
  for select using (bucket_id = 'question-papers');

-- ============================================================================
-- Helpful view: repeated topic analysis (how many papers contain a topic)
-- ============================================================================
create or replace view public.repeated_topics as
select
  q.subject,
  q.unit,
  q.topic,
  count(*)                                as questions,
  count(distinct p.year)                  as papers,
  array_agg(distinct p.year order by p.year desc) as years
from public.questions q
join public.question_papers p on p.subject = q.subject
where q.topic is not null
group by q.subject, q.unit, q.topic
having count(distinct p.year) >= 2
order by papers desc, questions desc;
