import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { db } from '../lib/db.js'
import QuestionRow from '../components/QuestionRow.jsx'
import { SectionTitle, CardSkeletons, EmptyState, Field, Disclaimer, Stat } from '../components/ui.jsx'
import { I } from '../components/Icons.jsx'
import { cn, IMPORTANCE_META } from '../lib/utils.js'

export default function ImportantQuestions() {
  const [params] = useSearchParams()
  const initialQ = params.get('q') || ''
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [f, setF] = useState({ branch: '', subject: '', importance: 'all', unit: '', q: initialQ })

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [questions, subjects, branches] = await Promise.all([
          db.list('questions'), db.list('subjects'), db.list('branches'),
        ])
        if (!alive) return
        setData({ questions, subjects, branches })
      } catch (e) {
        if (alive) setError(e.message || 'Failed to load questions')
      }
    })()
    return () => { alive = false }
  }, [])

  const subjectById = useMemo(() => {
    const m = {}
    data?.subjects.forEach((s) => (m[s.id] = s))
    return m
  }, [data])

  const subjects = useMemo(
    () => (data ? data.subjects.filter((s) => !f.branch || s.branch_id === f.branch) : []),
    [data, f.branch]
  )

  const results = useMemo(() => {
    if (!data) return []
    const term = f.q.trim().toLowerCase()
    return data.questions
      .filter((q) => {
        const s = subjectById[q.subject_id]
        if (!s) return false
        if (f.branch && s.branch_id !== f.branch) return false
        if (f.subject && s.id !== f.subject) return false
        if (f.importance !== 'all' && q.importance !== f.importance) return false
        if (f.unit && q.unit !== Number(f.unit)) return false
        if (term && !q.text.toLowerCase().includes(term) && !(s.code || '').toLowerCase().includes(term) && !(s.name || '').toLowerCase().includes(term)) return false
        return true
      })
      .sort((a, b) => (b.times_appeared ?? 0) - (a.times_appeared ?? 0) || (a.unit || 9) - (b.unit || 9))
  }, [data, f, subjectById])

  const viCount = data?.questions.filter((q) => q.importance === 'very_important').length ?? 0
  const repCount = data?.questions.filter((q) => (q.times_appeared ?? 0) >= 3).length ?? 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionTitle icon={I.star} title="Important Questions"
        sub="A curated, labelled question bank built from previous papers. Use the filters to focus on your subject and unit." />
      <Disclaimer />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={I.list} label="Questions in bank" value={data?.questions.length ?? '…'} />
        <Stat icon={I.alert} label="Very Important" value={viCount} tone="rose" />
        <Stat icon={I.repeat} label="Repeated 3+ times" value={repCount} tone="violet" />
        <Stat icon={I.book} label="Subjects covered" value={data ? new Set(data.questions.map((q) => q.subject_id)).size : '…'} tone="emerald" />
      </div>

      {/* filters */}
      <div className="card mb-6 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Search question">
          <input className="input" placeholder="Type a topic or keyword…" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        </Field>
        <Field label="Branch">
          <select className="input" value={f.branch} onChange={(e) => setF({ ...f, branch: e.target.value, subject: '' })}>
            <option value="">All branches</option>
            {(data?.branches || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </Field>
        <Field label="Subject">
          <select className="input" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })}>
            <option value="">All subjects</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
          </select>
        </Field>
        <Field label="Label">
          <select className="input" value={f.importance} onChange={(e) => setF({ ...f, importance: e.target.value })}>
            <option value="all">All labels</option>
            {Object.entries(IMPORTANCE_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
          </select>
        </Field>
        <Field label="Unit">
          <select className="input" value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })}>
            <option value="">Any unit</option>
            {[1, 2, 3, 4, 5].map((u) => <option key={u} value={u}>Unit {u}</option>)}
          </select>
        </Field>
      </div>

      {error ? (
        <EmptyState icon={I.alert} title="Could not load questions" hint={error} />
      ) : !data ? (
        <CardSkeletons n={6} />
      ) : results.length === 0 ? (
        <EmptyState icon={I.star} title="No questions match" hint="Loosen the filters or search for a different topic." />
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{results.length} questions</p>
          {results.map((q) => <QuestionRow key={q.id} q={q} subject={subjectById[q.subject_id]} />)}
        </div>
      )}

      <div className="mt-10">
        <Link to="/resources" className="btn-outline"><I.book size={16} /> Pair this with study resources</Link>
      </div>
    </div>
  )
}
