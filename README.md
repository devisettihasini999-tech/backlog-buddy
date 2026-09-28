# Backlog Buddy — Prepare Smart. Clear Your Backlogs.

A modern, responsive study platform for engineering students preparing for **backlog / supplementary exams**.

Find, in one organised place:

- **Subject-wise previous year question papers** (with built-in PDF viewer + downloads)
- **Important questions** labelled `Very Important / Frequently Asked / Repeated / Important Topic / Practice`
- **Frequently repeated questions** with "appeared in N previous papers" counts (computed from the papers in the library — preparation recommendations, **not** predictions)
- **Unit-wise important questions** (Unit 1–5)
- **Model question papers**
- **Study resources**: sprint plans, hall-note sheets, formula one-pagers, exam tips
- **Personal dashboard**: favourite subjects, bookmarked questions, saved papers, completed-subject tracking, recently opened items and a preparation checklist
- **Powerful search** by subject name, subject code, question text, topic and year, plus filters for branch, semester, subject, year, exam type and regulation
- **Admin panel** (passcode-protected) to add branches, semesters, subjects, papers (PDF upload), important questions, model papers and study materials
- Light / dark mode, mobile responsive, empty states, loading states, error handling, feedback page

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

Production build: `npm run build` → `dist/` (deployable to Vercel, Netlify, GitHub Pages, etc.).

**Admin panel:** `/admin` — demo passcode `buddy123` (set via `VITE_ADMIN_PASSCODE`).

## Data mode

The app has a dual data layer (`src/lib/db.js`):

| Mode | When | Where data lives |
|---|---|---|
| **Supabase (live)** | The tables from `supabase/schema.sql` exist in the project | Supabase Postgres + Storage bucket `papers` |
| **Demo** | Tables don't exist yet (default now) | Bundled demo data in `src/lib/demoData.js` + browser `localStorage` (admin edits persist in your browser) |

The app auto-detects the mode on load (badge in the header shows which is active).

### Database setup (one-time, ~1 minute)

1. Open your Supabase dashboard → **SQL Editor** → New query.
2. Paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and run it.

That creates:

```
branches → semesters → subjects → question_papers → questions → study_materials
                                    └── question_paper_links (frequency analysis)
```

plus the public Storage bucket `papers` and RLS policies.

> ⚠️ The included RLS policies let anonymous users write (so the demo admin panel works in the browser without login). For production, add Supabase Auth and change the write policies to `to authenticated` / a custom admin role.

Once the tables exist, the app switches to live mode automatically. You can then:

- Upload real PDFs from **Admin → Papers** (they go to the public `papers` bucket).
- Add branches, subjects, questions and materials through the admin panel (demo data is a reference for what to enter).

## Regenerating the demo PDFs

`data/papers.json` holds the question pools and paper specs; the generator writes one sample PDF per entry into `public/papers/`:

```bash
npm run gen:pdfs     # = python3 scripts/make_demo_pdfs.py
```

All generated PDFs are clearly marked as **sample/demo papers**.

## Security notes

- Only the Supabase **publishable** key is used in the browser (it is designed to be public).
- The **service-role key must never** be placed in client code, the repo, or Vercel project env vars. It is only needed server-side (e.g. `scripts/setup-supabase.js`).
- If keys have been shared in chat or commits, rotate them in the Supabase / Vercel / GitHub dashboards.

## Project structure

```
src/
  components/   Layout, icons, cards, search, PDF viewer, UI primitives
  lib/          config, supabase client, data layer (db.js), demo data, store (state)
  pages/        Home, Browse, SubjectPage, Papers, PaperView, ImportantQuestions,
                Resources, ResourceView, Dashboard, Search, About, Contact, Admin, 404
data/papers.json      demo paper specs + question pools
scripts/              PDF generator, Supabase helper
supabase/schema.sql   full database schema (run once in the SQL editor)
public/papers/        generated sample PDFs
```

## Scalability

Adding more colleges, universities, branches, regulations or semesters is just data:
each paper stores `regulation`, `university`, `academic_year`, `exam_type`; semesters are per-branch; nothing in the UI is hard-coded to a fixed list.
