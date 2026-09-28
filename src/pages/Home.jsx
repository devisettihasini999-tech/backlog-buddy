import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db } from '../lib/db.js'
import { GLOBAL_TIPS } from '../lib/demoData.js'
import SearchBar from '../components/SearchBar.jsx'
import PaperCard from '../components/PaperCard.jsx'
import { SectionTitle, Stat, CardSkeletons, EmptyState } from '../components/ui.jsx'
import { I } from '../components/Icons.jsx'
import { TAGLINE, APP_NAME } from '../lib/config.js'

const BRANCH_ICONS = { cse: I.code, aiml: I.cpu, ds: I.chart, ece: I.cpu, eee: I.bolt, me: I.gear, ce: I.bridge, it: I.globe, oth: I.box }

export default function Home() {
  const [stats, setStats] = useState(null)
  const [branchList, setBranchList] = useState([])
  const [recentPapers, setRecentPapers] = useState([])
  const [subjectById, setSubjectById] = useState({})
  const nav = useNavigate()

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [branches, subjects, papers, questions, materials] = await Promise.all([
          db.list('branches'), db.list('subjects'), db.list('question_papers'), db.list('questions'), db.list('study_materials'),
        ])
        if (!alive) return
        setBranchList(branches)
        setStats({
          branches: branches.length,
          subjects: subjects.length,
          papers: papers.length,
          questions: questions.length,
          materials: materials.length,
        })
        const byId = {}
        subjects.forEach((s) => (byId[s.id] = s))
        setSubjectById(byId)
        const latest = papers
          .filter((p) => p.file_url)
          .sort((a, b) => b.academic_year - a.academic_year || String(b.uploaded_at).localeCompare(String(a.uploaded_at)))
          .slice(0, 4)
        setRecentPapers(latest)
      } catch (e) {
        console.error(e)
      }
    })()
    return () => { alive = false }
  }, [])

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-20">
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-sm dark:border-blue-500/30 dark:bg-slate-900 dark:text-blue-400">
            <I.sparkles size={14} /> For engineering students with backlogs
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Welcome to <span className="text-blue-600 dark:text-blue-400">{APP_NAME}</span>
          </h1>
          <p className="mt-3 text-lg font-semibold text-slate-600 dark:text-slate-300">{TAGLINE}</p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
            Your one-stop study platform for engineering backlog preparation. Find previous question papers, important
            questions, repeated topics, model papers and study resources — organised subject by subject, so you spend time
            solving what actually matters instead of drowning in PDFs.
          </p>

          <div className="mx-auto mt-8 max-w-2xl">
            <SearchBar big />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/subjects" className="btn-primary !px-6 !py-3">
              <I.book size={17} /> Browse Subjects
            </Link>
            <Link to="/papers" className="btn-outline !px-6 !py-3">
              <I.file size={17} /> Previous Question Papers
            </Link>
            <Link to="/important-questions" className="btn-ghost !px-5 !py-3">
              <I.star size={17} /> Important Questions
            </Link>
            <Link to="/resources" className="btn-ghost !px-5 !py-3">
              <I.bookmark size={17} /> Study Resources
            </Link>
          </div>

          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={I.layers} label="Branches" value={stats?.branches ?? '…'} />
            <Stat icon={I.book} label="Subjects" value={stats?.subjects ?? '…'} tone="violet" />
            <Stat icon={I.file} label="Question papers" value={stats?.papers ?? '…'} tone="amber" />
            <Stat icon={I.list} label="Important questions" value={stats?.questions ?? '…'} tone="emerald" />
          </div>
        </div>
      </section>

      {/* BRANCHES */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionTitle
          icon={I.grid}
          title="Choose your branch"
          sub="Pick your branch and jump straight to its subjects, semesters and papers."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {branchList.map((b) => {
            const IconCmp = BRANCH_ICONS[b.id] || I.box
            return (
              <Link
                key={b.id}
                to={`/subjects?branch=${b.id}`}
                className="card group flex flex-col items-center gap-2.5 p-5 text-center transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:hover:border-blue-500/40"
              >
                <span className="rounded-2xl bg-blue-600/10 p-3 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:text-blue-400">
                  <IconCmp size={24} />
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{b.name}</div>
                  <div className="mt-0.5 text-xs text-slate-400">{b.code}</div>
                </div>
              </Link>
            )
          })}
          {!stats && Array.from({ length: 9 }, (_, i) => <div key={i} className="card p-5"><div className="skeleton mx-auto h-12 w-12 rounded-2xl" /><div className="skeleton mx-auto mt-3 h-3 w-24" /></div>)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <SectionTitle icon={I.target} title="How Backlog Buddy works" sub="Three steps from 'I have a backlog' to 'cleared'." />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { n: '1', t: 'Find your subject', d: 'Select branch → semester → subject. See every previous paper, unit-wise topics and repeated questions in one place.', icon: I.search },
              { n: '2', t: 'Study the high-yield material', d: 'Focus on questions labelled Very Important, Frequently Asked or Repeated — based on what actually appeared in past papers. Bookmark what you need.', icon: I.sparkles },
              { n: '3', t: 'Solve, track, clear', d: 'Solve timed papers from the library, track completed subjects on your dashboard and keep a personal preparation checklist until the day.', icon: I.award },
            ].map((s) => (
              <div key={s.n} className="card relative p-6">
                <span className="absolute right-5 top-4 text-5xl font-extrabold text-slate-100 dark:text-slate-800">{s.n}</span>
                <span className="rounded-xl bg-blue-600/10 p-2.5 text-blue-600 dark:text-blue-400"><s.icon size={22} /></span>
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{s.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT PAPERS */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionTitle
          icon={I.file}
          title="Latest question papers"
          sub="Freshly added papers from the library."
          right={<Link to="/papers" className="btn-outline !py-2 text-xs">View all papers <I.chevRight size={14} /></Link>}
        />
        {recentPapers.length === 0 ? (
          stats ? <EmptyState icon={I.file} title="No papers with PDFs yet" hint="Papers will appear here once they are uploaded." /> : <CardSkeletons n={4} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentPapers.map((p) => (
              <PaperCard key={p.id} paper={p} subject={subjectById[p.subject_id]} />
            ))}
          </div>
        )}
      </section>

      {/* TIPS */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="card overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-5">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-7 text-white lg:col-span-2">
              <I.award size={30} className="mb-4" />
              <h3 className="text-xl font-bold">Exam-smart tips</h3>
              <p className="mt-2 text-sm leading-relaxed text-blue-100">
                Short, practical rules that turn a panicked backlog week into a plan. Read them before you open the first paper.
              </p>
              <Link to="/resources" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25">
                All study resources <I.chevRight size={15} />
              </Link>
            </div>
            <div className="grid gap-3 p-7 sm:grid-cols-2 lg:col-span-3">
              {GLOBAL_TIPS.slice(0, 4).map((t, i) => (
                <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-blue-500">Tip {i + 1}</span>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <div className="card flex flex-col items-center gap-4 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 text-center dark:border-blue-500/30 dark:from-blue-500/10 dark:to-indigo-500/10">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Ready to start clearing backlogs?</h3>
          <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Bookmark your questions, save papers and build your preparation checklist — everything stays in your personal dashboard.
          </p>
          <button className="btn-primary !px-6 !py-3" onClick={() => nav('/dashboard')}>
            <I.dashboard size={17} /> Open My Dashboard
          </button>
        </div>
      </section>
    </div>
  )
}
