import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { db } from '../lib/db.js'
import { GLOBAL_TIPS } from '../lib/demoData.js'
import { useStore } from '../lib/store.jsx'
import PaperCard from '../components/PaperCard.jsx'
import QuestionRow from '../components/QuestionRow.jsx'
import { SectionTitle, EmptyState, Loading, Badge, Disclaimer } from '../components/ui.jsx'
import { I } from '../components/Icons.jsx'
import { cn, IMPORTANCE_META } from '../lib/utils.js'

const TABS = [
  { id: 'papers', label: 'Papers & Downloads', icon: I.file },
  { id: 'important', label: 'Important Questions', icon: I.star },
  { id: 'units', label: 'Unit-wise Questions', icon: I.layers },
  { id: 'model', label: 'Model Papers', icon: I.target },
  { id: 'materials', label: 'Study Materials', icon: I.book },
  { id: 'tips', label: 'Exam Prep Tips', icon: I.award },
]

export default function SubjectPage() {
  const { id } = useParams()
  const { favorites, toggleFavorite, completed, toggleCompleted, toast, addRecent } = useStore()
  const [tab, setTab] = useState('papers')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [impFilter, setImpFilter] = useState('all')

  useEffect(() => {
    let alive = true
    setData(null)
    setError('')
    ;(async () => {
      try {
        const [subject] = await Promise.all([db.get('subjects', id)])
        if (!subject) {
          if (alive) setError('notfound')
          return
        }
        const [branch, semester, papers, questions, materials, allSubjects] = await Promise.all([
          db.get('branches', subject.branch_id),
          db.get('semesters', subject.semester_id),
          db.list('question_papers', { subject_id: subject.id }),
          db.list('questions', { subject_id: subject.id }),
          db.list('study_materials', { subject_id: subject.id }),
          db.list('subjects'),
        ])
        if (!alive) return
        setData({ subject, branch, semester, papers, questions, materials, allSubjects })
        addRecent('subject', subject.id)
      } catch (e) {
        if (alive) setError(e.message || 'Failed to load subject')
      }
    })()
    return () => { alive = false }
  }, [id])

  const tips = useMemo(() => {
    if (!data) return []
    const top = [...data.questions].sort((a, b) => (b.times_appeared ?? 0) - (a.times_appeared ?? 0)).slice(0, 3)
    const unitFocus = {}
    data.questions.forEach((q) => {
      if (q.unit) unitFocus[q.unit] = (unitFocus[q.unit] || 0) + (q.times_appeared ?? 1)
    })
    const topUnit = Object.entries(unitFocus).sort((a, b) => b[1] - a[1])[0]
    const t = []
    if (top.length) t.push(`Highest-frequency questions: ${top.map((q) => q.text.split('.').slice(0, 2).join('.').slice(0, 60) + '…').join(' · ')}`)
    if (topUnit) t.push(`Unit ${topUnit[0]} carries the most repeated material — start there.`)
    if (data.papers.length) t.push(`Solve ${Math.min(3, data.papers.length)} previous papers timed (3 hours each) and compare your scores week over week.`)
    else t.push('No previous papers uploaded yet — focus on the important questions list and request papers via the contact page.')
    t.push('Revise with one A4 one-pager per unit the night before the exam.')
    return t
  }, [data])

  if (error === 'notfound') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState icon={I.alert} title="Subject not found" hint="It may have been removed. Browse all subjects instead."
          action={<Link to="/subjects" className="btn-primary">Browse subjects</Link>} />
      </div>
    )
  }
  if (error) {
    return <div className="mx-auto max-w-3xl px-4 py-16"><EmptyState icon={I.alert} title="Could not load subject" hint={error} /></div>
  }
  if (!data) return <Loading label="Loading subject…" />

  const { subject, branch, semester, papers, questions, materials } = data
  const fav = favorites.includes(subject.id)
  const done = completed.includes(subject.id)
  const units = [1, 2, 3, 4, 5].map((n) => ({ n, name: subject[`unit${n}`] }))
  const modelPapers = papers.filter((p) => p.exam_type === 'Model')
  const regularPapers = papers.filter((p) => p.exam_type !== 'Model').sort((a, b) => b.academic_year - a.academic_year)
  const filteredQs = impFilter === 'all' ? questions : questions.filter((q) => q.importance === impFilter)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* breadcrumb */}
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-400">
        <Link to="/" className="hover:text-blue-600">Home</Link> <I.chevRight size={12} />
        <Link to={`/subjects?branch=${subject.branch_id}`} className="hover:text-blue-600">{branch?.name || subject.branch_id}</Link> <I.chevRight size={12} />
        <Link to={`/subjects?branch=${subject.branch_id}&sem=${semester?.order_no || ''}`} className="hover:text-blue-600">{semester?.label}</Link> <I.chevRight size={12} />
        <span className="text-slate-600 dark:text-slate-300">{subject.name}</span>
      </nav>

      {/* header */}
      <div className="card mb-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge cls="bg-blue-600 text-white">{subject.code}</Badge>
              {branch && <Badge>{branch.code}</Badge>}
              {semester && <Badge>{semester.label}</Badge>}
              {done && <Badge cls="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"><I.check size={12} /> Completed</Badge>}
            </div>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">{subject.name}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">{subject.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={cn('btn-outline', fav && '!border-rose-300 !text-rose-600 dark:!border-rose-500/40')}
              onClick={() => { toggleFavorite(subject.id); toast(fav ? 'Removed from favourites' : 'Saved to favourites') }}
            >
              <I.heart size={16} fill={fav ? 'currentColor' : 'none'} /> {fav ? 'Favourited' : 'Add to favourites'}
            </button>
            <button
              className={cn('btn-outline', done && '!border-emerald-400 !text-emerald-600')}
              onClick={() => { toggleCompleted(subject.id); toast(done ? 'Marked as in progress' : 'Marked as completed 🎉') }}
            >
              <I.checkSquare size={16} /> {done ? 'Completed' : 'Mark completed'}
            </button>
          </div>
        </div>
        {units.some((u) => u.name) && (
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {units.map((u) => (
              <div key={u.n} className={cn('rounded-xl border p-3 text-xs', u.name ? 'border-blue-100 bg-blue-50/60 dark:border-blue-500/20 dark:bg-blue-500/5' : 'border-dashed border-slate-200 dark:border-slate-800')}>
                <div className="font-bold text-blue-600 dark:text-blue-400">Unit {u.n}</div>
                <div className="mt-1 font-medium text-slate-600 dark:text-slate-300">{u.name || 'Unit details coming soon'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* tabs */}
      <div className="mb-6 flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.id}
            className={cn('flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
              tab === t.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800')}
            onClick={() => setTab(t.id)}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* ---- Papers & downloads ---- */}
      {tab === 'papers' && (
        <div>
          <SectionTitle icon={I.file} title="Previous Year Question Papers"
            sub="Solve these timed, in the exact format you'll face. Download the PDF or open it in the built-in viewer." />
          {regularPapers.length === 0 ? (
            <EmptyState icon={I.file} title="No previous papers here yet"
              hint="Papers for this subject are being uploaded. Request a specific year via the contact page."
              action={<Link to="/contact" className="btn-outline">Request a paper</Link>} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {regularPapers.map((p) => <PaperCard key={p.id} paper={p} subject={subject} />)}
            </div>
          )}
        </div>
      )}

      {/* ---- Important questions ---- */}
      {tab === 'important' && (
        <div>
          <Disclaimer />
          <div className="mb-4 flex flex-wrap gap-2">
            <button className={cn('rounded-full border px-3.5 py-1.5 text-xs font-semibold', impFilter === 'all' ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : 'border-slate-300 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400')}
              onClick={() => setImpFilter('all')}>All ({questions.length})</button>
            {Object.entries(IMPORTANCE_META).map(([k, m]) => (
              <button key={k} className={cn('rounded-full border px-3.5 py-1.5 text-xs font-semibold', impFilter === k ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : 'border-slate-300 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400')}
                onClick={() => setImpFilter(k)}>
                {m.label} ({questions.filter((q) => q.importance === k).length})
              </button>
            ))}
          </div>
          {questions.length === 0 ? (
            <EmptyState icon={I.star} title="No important questions listed yet"
              hint="The question bank for this subject is being prepared. Check the model papers in the meantime." />
          ) : filteredQs.length === 0 ? (
            <EmptyState icon={I.star} title="Nothing under this label" hint="Try another importance filter." />
          ) : (
            <div className="space-y-3">
              {filteredQs.sort((a, b) => (b.times_appeared ?? 0) - (a.times_appeared ?? 0) || (a.unit || 9) - (b.unit || 9)).map((q) => (
                <QuestionRow key={q.id} q={q} subject={subject} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- Unit-wise ---- */}
      {tab === 'units' && (
        <div>
          <Disclaimer text="Unit-wise grouping of the important-questions bank. Frequency counts come from the previous papers in our library — preparation guidance, not exam predictions." />
          {!questions.length && !units.some((u) => u.name) ? (
            <EmptyState icon={I.layers} title="Unit-wise material coming soon" hint="Units and their questions for this subject are being added." />
          ) : (
            <div className="space-y-6">
              {units.map((u) => {
                const uqs = questions.filter((q) => q.unit === u.n)
                return (
                  <div key={u.n} className="card p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                      <span className="rounded-lg bg-blue-600/10 p-1.5 text-blue-600 dark:text-blue-400"><I.layers size={16} /></span>
                      Unit {u.n} — {u.name || 'Topics being added'}
                      <span className="text-xs font-medium text-slate-400">{uqs.length} questions</span>
                    </h3>
                    {uqs.length === 0 ? (
                      <p className="text-sm text-slate-400">Important questions for this unit are being added. Use the global question bank as a starting point.</p>
                    ) : (
                      <div className="space-y-3">{uqs.map((q) => <QuestionRow key={q.id} q={q} subject={subject} />)}</div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ---- Model papers ---- */}
      {tab === 'model' && (
        <div>
          <SectionTitle icon={I.target} title="Model Question Papers"
            sub="Practice papers in the expected exam pattern — use them in the final week." />
          {modelPapers.length === 0 ? (
            <EmptyState icon={I.target} title="No model paper yet"
              hint="Model papers will be added here. Previous year papers in the Papers tab work the same way for practice." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {modelPapers.map((p) => <PaperCard key={p.id} paper={p} subject={subject} />)}
            </div>
          )}
        </div>
      )}

      {/* ---- Study materials ---- */}
      {tab === 'materials' && (
        <div>
          <SectionTitle icon={I.book} title="Study Materials & Hall Notes"
            sub="Sprints, sheets and summaries for this subject. Also see global resources on the Resources page."
            right={<Link to="/resources" className="btn-outline !py-2 text-xs">All resources <I.chevRight size={14} /></Link>} />
          {materials.length === 0 ? (
            <EmptyState icon={I.book} title="No materials for this subject yet"
              hint="Generic plans, templates and guides are available on the Resources page."
              action={<Link to="/resources" className="btn-primary">Open Resources</Link>} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {materials.map((m) => (
                <Link key={m.id} to={`/resource/${m.id}`} className="card group p-5 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-2">
                    <Badge cls="bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">{m.mtype}</Badge>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">{m.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{m.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">Open material <I.chevRight size={13} /></span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- Tips ---- */}
      {tab === 'tips' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <I.sparkles size={18} className="text-blue-500" /> Subject-specific suggestions
            </h3>
            <ul className="space-y-3">
              {tips.map((t, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  <I.check size={16} className="mt-0.5 shrink-0 text-emerald-500" /> {t}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-400">Suggestions are generated from the frequency of questions in this subject's bank and papers.</p>
          </div>
          <div className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <I.award size={18} className="text-blue-500" /> General rules for backlog exams
            </h3>
            <ul className="space-y-3">
              {GLOBAL_TIPS.map((t, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  <I.check size={16} className="mt-0.5 shrink-0 text-emerald-500" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
