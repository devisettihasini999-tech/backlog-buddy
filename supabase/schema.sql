-- =============================================================
--  Backlog Buddy — Supabase schema
--  Run this ONCE in: Supabase Dashboard → SQL Editor → New query
--  It is idempotent (safe to re-run).
-- =============================================================

-- ---------- Branch ----------
create table if not exists public.branches (
  id          text primary key,
  code        text not null,
  name        text not null,
  description text,
  icon        text,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- ---------- Semester (per branch) ----------
create table if not exists public.semesters (
  id         text primary key,
  branch_id  text not null references public.branches(id) on delete cascade,
  order_no   int  not null,
  label      text,
  unique (branch_id, order_no)
);

-- ---------- Subject (branch → semester → subject) ----------
create table if not exists public.subjects (
  id          text primary key,
  branch_id   text not null references public.branches(id) on delete cascade,
  semester_id text not null references public.semesters(id) on delete cascade,
  code        text not null,
  name        text not null,
  description text,
  unit1       text,
  unit2       text,
  unit3       text,
  unit4       text,
  unit5       text,
  created_at  timestamptz default now()
);

-- ---------- Question papers ----------
create table if not exists public.question_papers (
  id           text primary key,
  subject_id   text references public.subjects(id) on delete set null,
  title        text not null,
  academic_year int,
  exam_type    text,
  regulation   text,
  university   text,
  file_url     text,
  file_name    text,
  uploaded_at  timestamptz default now()
);

-- ---------- Questions (important / repeated) ----------
create table if not exists public.questions (
  id             text primary key,
  subject_id     text not null references public.subjects(id) on delete cascade,
  unit           int,
  text           text not null,
  importance     text default 'practice',
  times_appeared int default 0,
  years          text,
  notes          text
);

-- Question ↔ paper links (basis of the "appeared in N papers" analysis)
create table if not exists public.question_paper_links (
  question_id text not null references public.questions(id) on delete cascade,
  paper_id    text not null references public.question_papers(id) on delete cascade,
  primary key (question_id, paper_id)
);

-- ---------- Study materials ----------
create table if not exists public.study_materials (
  id          text primary key,
  subject_id  text references public.subjects(id) on delete cascade,
  title       text not null,
  mtype       text default 'notes',
  description text,
  content     text,
  url         text,
  uploaded_at timestamptz default now()
);

-- ---------- Feedback ----------
create table if not exists public.feedback (
  id         text primary key,
  name       text,
  email      text,
  branch     text,
  message    text not null,
  created_at timestamptz default now()
);

-- ---------- Indexes ----------
create index if not exists idx_semesters_branch   on public.semesters(branch_id, order_no);
create index if not exists idx_subjects_branch    on public.subjects(branch_id, semester_id);
create index if not exists idx_papers_subject     on public.question_papers(subject_id, academic_year desc);
create index if not exists idx_questions_subject  on public.questions(subject_id, unit);
create index if not exists idx_materials_subject  on public.study_materials(subject_id);

-- ---------- Storage bucket for PDF uploads ----------
insert into storage.buckets (id, name, public)
values ('papers', 'papers', true)
on conflict (id) do nothing;

-- ---------- Row Level Security ----------
-- DEMO-FRIENDLY: anon can read everything and write (so the demo admin panel
-- works in the browser without login). For production, replace the write
-- policies with `to authenticated` after adding Supabase Auth.
do $$
declare
  t text;
begin
  foreach t in array array['branches','semesters','subjects','question_papers','questions','question_paper_links','study_materials','feedback']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read %I" on public.%I', t, t);
    execute format('create policy "public read %I" on public.%I for select using (true)', t, t);
    execute format('drop policy if exists "anon write %I" on public.%I', t, t);
    execute format('create policy "anon write %I" on public.%I for all using (true) with check (true)', t, t);
  end loop;
end $$;

-- Storage policies (public read + write for the demo bucket)
drop policy if exists "papers public read"  on storage.objects;
create policy "papers public read"  on storage.objects for select using (bucket_id = 'papers');
drop policy if exists "papers anon insert" on storage.objects;
create policy "papers anon insert" on storage.objects for insert with check (bucket_id = 'papers');
drop policy if exists "papers anon update" on storage.objects;
create policy "papers anon update" on storage.objects for update using (bucket_id = 'papers');
drop policy if exists "papers anon delete" on storage.objects;
create policy "papers anon delete" on storage.objects for delete using (bucket_id = 'papers');
