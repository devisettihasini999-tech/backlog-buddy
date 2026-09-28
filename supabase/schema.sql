-- ============================================================
-- Backlog Buddy — Supabase schema
-- Run this ONCE in the Supabase SQL Editor (Dashboard → SQL).
-- The app auto-detects these tables and switches from the
-- built-in demo dataset to live, shared data.
-- Relationships:
--   branches → subjects → question_papers
--                        → questions
--                        → study_materials
-- ============================================================

create table if not exists public.branches (
  id text primary key,
  code text not null,
  name text not null,
  short text,
  tagline text,
  accent text default 'blue'
);

create table if not exists public.subjects (
  id text primary key,
  code text not null,
  name text not null,
  branch_ids text[] not null default '{}',
  semester int not null check (semester between 1 and 8),
  credits int default 3,
  topics text[] not null default '{}',
  flagship boolean default false,
  constraint subjects_branch_fk foreign key (branch_ids) references public.branches (id) on delete cascade
);

-- NOTE: Postgres cannot FK an array; keep referential integrity in the app
-- for branch_ids. The FK above is illustrative and may be omitted:
-- drop constraint if needed with:
--   alter table public.subjects drop constraint if exists subjects_branch_fk;

create table if not exists public.question_papers (
  id text primary key,
  subject_id text not null references public.subjects (id) on delete cascade,
  title text not null,
  year int not null,
  exam_type text not null check (exam_type in ('Regular', 'Supplementary', 'Mid-Term', 'Model')),
  regulation text default 'R23',
  university text default '',
  duration text default '3 Hours',
  max_marks int default 70,
  pages int default 2,
  pdf_url text default '',
  uploaded_at date default current_date
);

create table if not exists public.questions (
  id text primary key,
  subject_id text not null references public.subjects (id) on delete cascade,
  unit int not null check (unit between 1 and 5),
  topic text default '',
  text text not null,
  label text not null check (label in ('Very Important', 'Frequently Asked', 'Repeated Question', 'Important Topic', 'Practice Question')),
  appearances int[] not null default '{}'
);

create table if not exists public.study_materials (
  id text primary key,
  subject_id text not null references public.subjects (id) on delete cascade,
  title text not null,
  type text not null check (type in ('notes', 'guide', 'syllabus', 'lab')),
  description text default '',
  pdf_url text default '',
  uploaded_at date default current_date
);

create table if not exists public.feedback (
  id text primary key,
  name text not null,
  email text not null,
  topic text default 'Feedback',
  message text not null,
  created_at timestamptz default now()
);

create index if not exists idx_papers_subject on public.question_papers (subject_id);
create index if not exists idx_papers_year on public.question_papers (year);
create index if not exists idx_questions_subject on public.questions (subject_id);
create index if not exists idx_subjects_branches on public.subjects using gin (branch_ids);
create index if not exists idx_materials_subject on public.study_materials (subject_id);

-- ---------------- Row Level Security ----------------
-- Public read access for the library; writes restricted to service role
-- (used by the admin tooling / seed scripts).

alter table public.branches enable row level security;
alter table public.subjects enable row level security;
alter table public.question_papers enable row level security;
alter table public.questions enable row level security;
alter table public.study_materials enable row level security;
alter table public.feedback enable row level security;

create policy "public read branches" on public.branches for select using (true);
create policy "public read subjects" on public.subjects for select using (true);
create policy "public read papers" on public.question_papers for select using (true);
create policy "public read questions" on public.questions for select using (true);
create policy "public read materials" on public.study_materials for select using (true);

create policy "service write branches" on public.branches for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service write subjects" on public.subjects for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service write papers" on public.question_papers for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service write questions" on public.questions for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service write materials" on public.study_materials for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service write feedback" on public.feedback for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ============================================================
-- Optional: seed from the demo dataset
-- ------------------------------------------------------------
-- The repository exports the full sample dataset with:
--   node -e "..." (see README) or via the Admin Panel → Data & Settings
--   → "Export current dataset (JSON)".
-- Insert rows with the Supabase CLI, a script, or plain INSERTs:
--
-- insert into public.branches (id, code, name, short, tagline, accent)
-- values ('cse', 'CSE', 'Computer Science & Engineering', 'CSE',
--         'Software, systems and computing fundamentals', 'blue');
--
-- insert into public.subjects (id, code, name, branch_ids, semester, credits, topics, flagship)
-- values ('cs301', 'CS301', 'Data Structures', array['cse','it','aiml','ds'], 3, 3,
--         array['Arrays and Linked Lists','Stacks and Queues','Trees and Binary Search Trees',
--               'Graphs and Traversals','Hashing and Searching'], true);
-- ============================================================
