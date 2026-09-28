# Backlog Buddy

**Prepare Smart. Clear Your Backlogs.**

A modern, responsive study platform for engineering students preparing for supplementary (backlog)
exams — previous year question papers, important & frequently repeated questions, unit-wise topics,
model papers, study resources and preparation guidance, organized subject by subject.

## Features

- **Home** — hero search, quick actions, branch grid, repeat-topic spotlight, recent papers
- **Branch & semester selection** — CSE, AI & ML, Data Science, ECE, EEE, Mechanical, Civil, IT, Other · 1st–8th semester
- **Subject pages** — previous papers, important questions, unit-wise questions, model papers, downloads, study material, prep tips
- **Question paper library** — filter by branch, semester, subject, code, academic year, exam type, regulation & university; view + download PDFs
- **Important questions** — labels (Very Important / Frequently Asked / Repeated Question / Important Topic / Practice Question) with appearance counts and a clear “no prediction” disclaimer
- **Search** — subject name, subject code, question text, topic or year, with filters
- **Student dashboard** — favourite subjects, bookmarked questions, saved papers, completed subjects, recently viewed papers, personal preparation checklist
- **Admin panel** (password `admin123`) — add/edit/delete branches, subjects, papers, questions & study material; upload PDFs; export the dataset as JSON
- **Repeat analysis** — e.g. “Stack Operations — appeared in 4 previous papers”, computed from available papers (guidance only, never a prediction)
- **UI** — light + dark mode, mobile responsive, skeletons, empty states, toasts, error boundary

## Tech stack

- React 18 + TypeScript + Vite
- React Router · lucide-react icons · custom CSS design system
- Supabase (Postgres + PostgREST) as the data backend — schema in [`supabase/schema.sql`](supabase/schema.sql)

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build to dist/
npm run preview    # preview the production build
```

Regenerate the demo PDFs (optional — they are committed):

```bash
npm run pdfs       # scripts/make-pdfs.mjs + scripts/generate_pdfs.py
```

## Demo data → live data

The app ships with a complete sample dataset (9 branches, 80+ subjects, 300+ papers/questions)
so every screen can be tested immediately. To switch to a shared database:

1. Open your Supabase project → **SQL Editor**
2. Paste and run [`supabase/schema.sql`](supabase/schema.sql) once
3. (Optional) seed rows — use the Admin Panel → **Data & Settings → Export current dataset (JSON)**
   as the source of truth for inserts
4. Configure the client (`src/lib/supabase.ts` reads these):

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your publishable/anon key>
```

5. Reload — the footer badge switches from “Demo data mode” to “Supabase connected”.

## Deploy

- **Vercel** — `npm i -g vercel && vercel deploy --prod` (framework: Vite, build `npm run build`, output `dist`)
- **Render** — static site / node web service, build `npm run build`, publish `dist`

## Structure

```
src/
  components/    Layout, UI kit, ErrorBoundary
  context/       App state: dataset, theme, bookmarks, admin overrides
  data/          seed.json + deterministic generator (shared with scripts)
  lib/           search, repeat analysis, storage, supabase client
  pages/         Home, Subjects, SubjectDetail, Papers, PaperViewer,
                 ImportantQuestions, Search, Dashboard, Admin, Resources,
                 About, Contact, NotFound
scripts/         PDF manifest + generator for demo papers
supabase/        schema.sql (tables + RLS + seed notes)
public/papers/   generated demo PDFs
```

## Important disclaimers

- Question labels and repeat counts are **preparation recommendations based on available previous
  papers** — they are **not predictions** and no question is ever guaranteed in an exam.
- The included PDFs are realistic **demo papers** generated for testing; upload real papers through
  the admin panel (or Supabase) for production use.
