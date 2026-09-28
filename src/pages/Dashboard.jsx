import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../lib/db.js'
import { useStore } from '../lib/store.jsx'
import PaperCard from '../components/PaperCard.jsx'
import QuestionRow from '../components/QuestionRow.jsx'
import { SectionTitle, Loading, EmptyState, Stat, Badge } from '../components/ui.jsx'
import { I } from '../components/Icons.jsx'
import { cn, timeAgo } from '../lib/utils.js'

const DEFAULT_CHECKLIST = [
  'Read the unit-wise important questions list',
  'Make one A4 one-pager per unit',
  'Solve one previous paper (timed, 3 hours)',
  'Revise the questions you got wrong',
  'Solve one more paper + model paper',
  'Final one-pager revision the night before',
]

export default function Dashboard() {
  const store = useStore()
  const { favorites, bookmarks, savedPapers, completed, recent, checklist, toast } = store
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [newItem, setNewItem] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [subjects, papers, questions] = await Promise.all([
          db.list('subjects'), db.list('question_papers'), db.list('questions'),
        ])
        if (!alive) return
        setData({ subjects, papers, questions })
      } catch (e) {
        if (alive) setError(e.message || 'Failed to load dashboard')
      }
    })()
    return () => { alive = false }
  }, [])

  const favSubjects = useMemo(
    () => (data ? data.subjects.filter((s) => favorites.includes(s.id)) : []),
    [data, favorites]
  )
  const savedQs = useMemo(
    () => (data ? data.questions.filter((q) => bookmarks.includes(q.id)) : []),
    [data, bookmarks]
  )
  const savedPp = useMemo(
    () => (data ? data.papers.filter((p) => savedPapers.includes(p.id)) : []),
    [data, savedPapers]
  )
  const doneSubjects = useMemo(
    () => (data ? data.subjects.filter((s) => completed.includes(s.id)) : []),
    [data, completed]
  )
  const recentItems = useMemo(
    () =>
      recent.map((r) => {
        if (r.type === 'paper') {
          const p = data?.papers.find((x) => x.id === r.id)
          return p ? { ...r, paper: p } : null
        }
        const s = data?.subjects.find((x) => x.id === r.id)
        return s ? { ...r, subject: s } : null
      }).filter(Boolean),
    [recent, data]
  )

  const doneCount = (checklist || []).filter((c) => c.done).length
  const progress = checklist?.length ? Math.round((doneCount / checklist.length) * 100) : 0

  const addChecklist = (e) => {
    e.preventDefault()
    const t = newItem.trim()
    if (!t) return
    store.addChecklistItem(t)
    setNewItem('')
    toast('Checklist item added')
  }

  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><EmptyState icon={I.alert} title="Could not load dashboard" hint={error} /></div>
  if (!data) return <Loading label="Loading your dashboard…" />

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionTitle icon={I.dashboard} title="My Dashboard"
        sub="Your personal backlog preparation space — favourites, bookmarks, saved papers, progress and checklist. Everything is stored in your browser." />

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={I.heart} label="Favourite subjects" value={favorites.length} tone="rose" />
        <Stat icon={I.star} label="Bookmarked questions" value={bookmarks.length} tone="amber" />
        <Stat icon={I.file} label="Saved papers" value={savedPapers.length} />
        <Stat icon={I.checkSquare} label="Completed subjects" value={completed.length} tone="emerald" />
      </div>

      {/* Progress */}
      <div className="card mb-8 p-6">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Preparation progress</h3>
          <span className="text-xs font-semibold text-slate-400">
            {doneCount}/{checklist.length} checklist steps · {completed.length} subject{completed.length !== 1 ? 's' : ''} marked completed
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all" style={{ width: `${Math.max(progress, completed.length ? 8 : 2)}%` }} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* left column */}
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <I.heart size={18} className="text-rose-500" /> Favourite subjects
            </h3>
            {favSubjects.length === 0 ? (
              <EmptyState icon={I.heart} title="No favourites yet" hint="Tap the heart on any subject card to pin it here."
                action={<Link to="/subjects" className="btn-outline">Browse subjects</Link>} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {favSubjects.map((s) => (
                  <div key={s.id} className="card flex items-center justify-between gap-3 p-4">
                    <Link to={`/subject/${s.id}`} className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge cls="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">{s.code}</Badge>
                        <span className="truncate text-sm font-semibold text-slate-800 hover:text-blue-600 dark:text-slate-100">{s.name}</span>
                      </div>
                    </Link>
                    <button className="btn-ghost !p-1.5" title="Remove favourite" onClick={() => store.toggleFavorite(s.id)}>
                      <I.x size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <I.star size={18} className="text-amber-500" /> Bookmarked questions
            </h3>
            {savedQs.length === 0 ? (
              <EmptyState icon={I.star} title="No bookmarked questions" hint="Star any question from the subject pages or the Important Questions page."
                action={<Link to="/important-questions" className="btn-outline">Browse questions</Link>} />
            ) : (
              <div className="space-y-3">
                {savedQs.map((q) => <QuestionRow key={q.id} q={q} subject={data.subjects.find((s) => s.id === q.subject_id)} />)}
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <I.file size={18} className="text-blue-500" /> Saved papers
            </h3>
            {savedPp.length === 0 ? (
              <EmptyState icon={I.file} title="No saved papers" hint="Bookmark papers from the library or subject pages to build your practice set."
                action={<Link to="/papers" className="btn-outline">Open library</Link>} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {savedPp.map((p) => <PaperCard key={p.id} paper={p} subject={data.subjects.find((s) => s.id === p.subject_id)} />)}
              </div>
            )}
          </section>
        </div>

        {/* right column */}
        <div className="space-y-8">
          <section className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <I.list size={18} className="text-emerald-500" /> Preparation checklist
            </h3>
            <form onSubmit={addChecklist} className="mb-3 flex gap-2">
              <input className="input !py-2" placeholder="Add a step… e.g. Solve 2025 paper" value={newItem} onChange={(e) => setNewItem(e.target.value)} />
              <button className="btn-primary !px-3" type="submit" aria-label="Add"><I.plus size={16} /></button>
            </form>
            {checklist.length === 0 ? (
              <p className="text-sm text-slate-400">
                No steps yet.{' '}
                <button className="font-semibold text-blue-600 hover:underline" onClick={() => {
                  DEFAULT_CHECKLIST.forEach((t) => store.addChecklistItem(t))
                  toast('Started a standard 6-step checklist')
                }}>
                  Start a standard checklist
                </button>
              </p>
            ) : (
              <ul className="space-y-2">
                {checklist.map((c) => (
                  <li key={c.id} className="group flex items-start gap-2.5">
                    <button
                      className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                        c.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-400 dark:border-slate-600')}
                      onClick={() => store.toggleChecklistItem(c.id)}
                      aria-label="Toggle"
                    >
                      {c.done && <I.check size={13} />}
                    </button>
                    <span className={cn('flex-1 text-sm leading-relaxed', c.done ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200')}>
                      {c.text}
                    </span>
                    <button className="text-slate-300 opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100" onClick={() => store.removeChecklistItem(c.id)} aria-label="Remove">
                      <I.trash size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <I.checkSquare size={18} className="text-emerald-500" /> Completed subjects
            </h3>
            {doneSubjects.length === 0 ? (
              <p className="text-sm text-slate-400">
                Mark subjects as completed on their subject page to track your backlog being cleared.
              </p>
            ) : (
              <ul className="space-y-2">
                {doneSubjects.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2">
                    <Link to={`/subject/${s.id}`} className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-600 dark:text-slate-200">
                      <I.check size={15} className="shrink-0 text-emerald-500" />
                      <span className="truncate">{s.code} · {s.name}</span>
                    </Link>
                    <button className="text-xs font-semibold text-slate-400 hover:text-rose-500" onClick={() => store.toggleCompleted(s.id)}>Undo</button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <I.clock size={18} className="text-blue-500" /> Recently opened
            </h3>
            {recentItems.length === 0 ? (
              <p className="text-sm text-slate-400">Papers and subjects you open will show up here.</p>
            ) : (
              <ul className="space-y-2.5">
                {recentItems.map((r) => (
                  <li key={r.type + r.id} className="flex items-start justify-between gap-2 text-sm">
                    <Link to={r.type === 'paper' ? `/papers/${r.id}` : `/subject/${r.id}`}
                      className="flex min-w-0 items-start gap-2 text-slate-700 hover:text-blue-600 dark:text-slate-200">
                      {r.type === 'paper' ? <I.file size={15} className="mt-0.5 shrink-0 text-blue-500" /> : <I.book size={15} className="mt-0.5 shrink-0 text-indigo-500" />}
                      <span className="line-clamp-2">{r.type === 'paper' ? r.paper.title : `${r.subject.code} · ${r.subject.name}`}</span>
                    </Link>
                    <span className="shrink-0 text-xs text-slate-400">{timeAgo(r.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
