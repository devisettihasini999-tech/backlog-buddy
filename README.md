# Backlog Buddy

**Prepare Smart. Clear Your Backlogs.**

A functional, responsive study platform for engineering students preparing for
supplementary / backlog examinations. It organises subject-wise previous year
question papers, important questions, frequently repeated topics, unit-wise
important questions, model question papers and study materials for every branch
and semester.

---

## Highlights

| Area | What is included |
| --- | --- |
| Home page | Logo, tagline, introduction, prominent search bar (subject / code / question / topic), branch and semester selectors, live stats, trending subjects, repeated topic analysis |
| Branch selection | CSE, AI & ML, Data Science, ECE, EEE, Mechanical, Civil, IT, Other Engineering Branches |
| Semester selection | 1st to 8th semester |
| Subject page | Previous year papers, important questions, frequently asked questions, repeated topics with counts, unit-wise important questions, model papers, paper downloads, study materials, exam preparation tips |
| Question paper library | Filters for branch, semester, subject, subject code, academic year, exam type and regulation, with View and Download on every paper |
| Search | Global search (header icon) plus inline search on the home page; matches subjects, codes, questions, topics, materials and years |
| Student dashboard | Favourite subjects, bookmarked questions, saved papers, completed subjects with progress, recently opened papers, personal backlog checklist, export and reset |
| Admin panel | Sign in, then manage branches, semesters, subjects, question papers (with PDF upload), important questions, model papers and study materials, plus JSON export and demo reset |
| PDF engine | Dependency-free PDF writer - every paper and model paper can be downloaded instantly, and real PDF files are bundled for the popular subjects |
| Design | Light and dark mode, responsive layout, cards, clear buttons, icons, loading skeletons, empty states, toasts, error handling, contact and about pages |
| Data | 9 branches, 8 semesters, 391 subjects, 1 608 papers, 3 914 questions, 1 966 study resources (bundled demo dataset) |

Everything runs with **zero build step and zero runtime dependencies** - plain
HTML, CSS and JavaScript. `node server.js` serves it, and Vercel serves it as a
static site.

---

## Project structure

```
backlog-buddy/
├── index.html              Home page
├── subjects.html           Branch / semester subject browser
├── subject.html            Subject detail (papers, questions, units, materials, tips)
├── papers.html             Question paper library with filters
├── paper.html              Paper viewer + PDF embed + download
├── important.html          Important questions hub
├── resources.html          Study resources and preparation guidance
├── dashboard.html          Student dashboard
├── admin.html              Admin panel
├── about.html  contact.html  404.html
├── assets/
│   ├── css/styles.css      Design system (tokens, light/dark, responsive)
│   ├── js/data.js          Generated demo dataset (compact wire format)
│   ├── js/store.js         Data store, user state, search, admin CRUD, Supabase adapter
│   ├── js/ui.js            Icons, header, footer, theme, toasts, modals, search UI
│   ├── js/pdf.js           PDF writer (browser + Node)
│   ├── js/pages/*.js       Page controllers
│   └── img/                Logo and favicon (SVG)
├── papers/*.pdf            Sample previous question papers (33 files)
├── scripts/
│   ├── catalog.js          Curated branches, semesters, subjects, featured content
│   └── build-demo-data.js  Regenerates data.js and the sample PDFs
├── supabase/schema.sql     Database schema, RLS policies, storage bucket, analysis view
├── api/db.js               Vercel serverless function: secure Supabase proxy
├── server.js               Zero dependency static server
└── vercel.json             Deployment configuration
```

---

## Running locally

```bash
cd backlog-buddy
node server.js          # http://localhost:3000
```

Any static file server works too (`python3 -m http.server`, `npx serve`, VS Code
Live Server). There is no build step.

Regenerate the demo dataset and PDFs:

```bash
node scripts/build-demo-data.js
```

---

## Database design

```
branches ──< subjects ──< question_papers ──< questions
                 │
                 └──< study_materials
semesters (1-8) referenced by subjects.sem
```

| Table | Key columns |
| --- | --- |
| `branches` | id, code, name, icon, tone, blurb, regulation, university |
| `semesters` | n (1-8), label, note |
| `subjects` | id, branch → branches, sem → semesters, code, name, credits, regulation, university, description, units (jsonb), featured |
| `question_papers` | id, subject → subjects, year, exam_type, regulation, university, marks, duration, file_url, file_name, uploaded_at, downloads, views |
| `questions` | id, subject → subjects, unit, text, topic, tags[], years[], marks |
| `study_materials` | id, subject → subjects, title, type, size, url, file_url, added_at |
| `user_progress` | user_id → auth.users, subject_id, status (saved / completed / bookmarked) |
| `feedback` | name, email, branch, topic, code, message |

The full SQL - including row level security policies, a public storage bucket
for uploaded PDFs and a `repeated_topics` analysis view - is in
[`supabase/schema.sql`](supabase/schema.sql). Run it once in the Supabase SQL
editor.

---

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com) and run
   `supabase/schema.sql` in **SQL Editor → New query**.
2. The site is pre-configured with the project URL and the **publishable** key
   in `assets/js/store.js` (`SUPABASE.url`, `SUPABASE.anonKey`).
3. On load the app calls `/rest/v1/subjects`. If the table exists it reports
   **Supabase connected**; otherwise it keeps running on the bundled demo data
   and says **Demo data**. Nothing breaks either way.
4. Admin writes are stored locally (so the panel is fully testable) and pushed
   to PostgREST when the tables exist.

> **Security:** the secret key is never placed in the browser bundle. For
> server side writes, set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` as
> environment variables and use the `/api/db` function, which forwards
> authenticated requests to PostgREST.

### Environment variables (Vercel)

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `SUPABASE_SECRET_KEY` | Secret key used only by `api/db.js` on the server |

---

## Deploying

### Live deployments

| Environment | URL |
| --- | --- |
| **Render (frontend, live)** | https://backlog-buddy-web.onrender.com |
| **GitHub Pages (live)** | https://devisettihasini999-tech.github.io/backlog-buddy/ |
| GitHub repository | https://github.com/devisettihasini999-tech/backlog-buddy |
| Supabase project | https://jcltcmildaclwjkxgrgu.supabase.co (public bucket `question-papers` holding the 33 sample PDFs) |

### Render (API + frontend)

Both services are created from the `render.yaml` blueprint in this repository, so
no manual settings are needed:

```bash
# Dashboard -> New -> Blueprint -> pick this repo -> Apply
# or, from the command line:
RENDER_TOKEN=rnd_xxx ./scripts/deploy-render.sh
```

The frontend static site is already live (see the table above). The API
(`backlog-buddy-api`) still needs **one thing from the account owner**: Render
requires a payment method before it will create a web service, even on the free
plan. Add a card at https://dashboard.render.com/billing and then re-run the
command above (or apply `render.yaml`).

The API service runs from `server/` and is configured with:

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Publishable key (public, safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key, server-side only |
| `SUPABASE_DB_URL` | Postgres connection string - **used to create every table automatically on first boot** |
| `JWT_SECRET` | Session token secret (auto-generated by the blueprint) |
| `GEMINI_API_KEY` | Optional - enables the AI assistant; without it the route returns a deterministic, honest fallback |

If `SUPABASE_DB_URL` is not supplied, the API still serves the full catalogue
from the bundled demo dataset and every route works offline - only sign-up,
login and cloud sync need the database.

### Vercel

The Vercel access token supplied with this project was rejected as invalid when
the deployment was attempted (`invalidToken`), so the Vercel deployment could not
be finished from here. Everything it needs is already in place:

* `vercel.json` (clean URLs + security headers),
* `api/db.js` serverless function for secure Supabase writes,
* `deploy.sh` helper script.

Create a fresh token at https://vercel.com/account/tokens and run either:

```bash
./deploy.sh                                       # pushes to GitHub, then deploys
# or
VERCEL_TOKEN=xxxx npx vercel@latest deploy --prod --yes
```

or connect the GitHub repository in the Vercel dashboard (framework: *Other*,
build command: none, output directory: repository root).

For automatic deploys, add this workflow to `.github/workflows/deploy.yml` (the
token used here does not have the `workflow` scope, so the file could not be
committed automatically):

```yaml
name: Deploy Backlog Buddy
on:
  push:
    branches: [main]
  workflow_dispatch:
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx --yes vercel@latest deploy --prod --yes --token "$VERCEL_TOKEN"
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

Add `VERCEL_TOKEN`, `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` as repository secrets
(Settings -> Secrets and variables -> Actions).

### GitHub

```bash
git init
git add -A
git commit -m "Backlog Buddy - engineering backlog preparation platform"
git branch -M main
git remote add origin https://github.com/<user>/backlog-buddy.git
git push -u origin main
```

---

## Admin panel

Open `admin.html` and sign in with the demo credentials:

```
username: admin
password: backlogbuddy
```

From there you can add branches, subjects, upload question papers (PDF files are
kept with the record), curate important questions with honest labels, publish
model papers, manage study materials, export all content as JSON or reset to the
bundled demo data.

For production, replace the demo login with Supabase Auth and protect every
table with row level security policies.

---

## About the important questions and repeated topics

Important questions, frequently asked questions and repeated topics are
**preparation recommendations derived from the previous question papers
available on this platform**. Each question carries a label:

| Label | Meaning |
| --- | --- |
| Very Important | High weightage and appears across many of the available papers |
| Frequently Asked | Appears regularly in the papers on this platform |
| Repeated Question | Appears in several different years of papers |
| Important Topic | Core topic of the unit that supports many questions |
| Practice Question | Useful for practice, lower historical frequency |

The repeated topic table shows how many of the available papers contain each
topic, for example *"Stack operations - appeared in 5 previous papers"*. This is
analysis of uploaded papers only. **No question or topic is predicted or
guaranteed to appear in any examination** - students should always cover the
complete syllabus and follow their college materials.

---

## Scaling

The catalogue is data driven, so more colleges, universities, regulations,
branches, semesters and subjects can be added at any time:

* add rows to `branches` and `semesters` (or through the admin panel),
* add subjects with their own codes, credits, regulation and units,
* upload papers for any year, exam type and regulation,
* questions and materials attach to subjects, so every screen updates
  automatically - including search, filters and repeated topic analysis.

---

Built for engineering students. Study smart, clear the backlog.
