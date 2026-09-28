import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { db } from '../lib/db.js'
import PaperCard from '../components/PaperCard.jsx'
import { SectionTitle, CardSkeletons, EmptyState, Field, Badge } from '../components/ui.jsx'
import { I } from '../components/Icons.jsx'
import { EXAM_TYPES, REGULATIONS, yearOptions } from '../lib/utils.js'

export default function Papers() {
  const [params, setParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [mobileFilters, setMobileFilters] = useState(false)

  const f = {
    branch: params.get('branch') || '',
    sem: params.get('sem') || '',
    subject: params.get('subject') || '',
    code: params.get('code') || '',
    year: params.get('year') || '',
    examType: params.get('examType') || '',
    regulation: params.get('regulation') || '',
    university: params.get('university') || '',
  }

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [papers, subjects, branches, semesters] = await Promise.all([
          db.list('question_papers'), db.list('subjects'), db.list('branches'), db.list('semesters'),
        ])
        if (!alive) return
        setData({ papers, subjects, branches, semesters })
      } catch (e) {
        if (alive) setError(e.message || 'Failed to load papers')
      }
    })()
    return () => { alive = false }
  }, [])

  const subjectById = useMemo(() => {
    const m = {}
    data?.subjects.forEach((s) => (m[s.id] = s))
    return m
  }, [data])

  const setF = (key, value) => {
    const p = new URLSearchParams(params)
    if (value) p.set(key, value)
    else p.delete(key)
    if (key === 'branch') { p.delete('sem'); p.delete('subject') }
    if (key === 'sem') p.delete('subject')
    setParams(p, { replace: true })
  }

  const clearAll = () => setParams(new URLSearchParams(), { replace: true })

  const subjects = useMemo(() => {
    if (!data) return []
    return data.subjects.filter(
      (s) =>
        (!f.branch || s.branch_id === f.branch) &&
        (!f.sem || s.semester_id === `${f.branch}-sem${f.sem}`) &&
        (!f.code || s.code.toLowerCase().includes(f.code.toLowerCase()))
    )
  }, [data, f.branch, f.sem, f.code])

  const semesters = useMemo(
    () => (data ? data.semesters.filter((s) => !f.branch || s.branch_id === f.branch).sort((a, b) => a.order_no - b.order_no) : []),
    [data, f.branch]
  )

  const years = useMemo(() => {
    if (!data) return []
    const ys = [...new Set(data.papers.map((p) => p.academic_year))].filter(Boolean)
    return ys.sort((a, b) => b - a)
  }, [data])

  const regs = useMemo(() => (data ? [...new Set(data.papers.map((p) => p.regulation).filter(Boolean))] : []), [data])
  const unis = useMemo(() => (data ? [...new Set(data.papers.map((p) => p.university).filter(Boolean))] : []), [data])

  const results = useMemo(() => {
    if (!data) return []
    return data.papers
      .filter((p) => {
        const s = subjectById[p.subject_id]
        if (!s) return false
        if (f.branch && s.branch_id !== f.branch) return false
        if (f.sem && s.semester_id !== `${f.branch}-sem${f.sem}`) return false
        if (f.subject && s.id !== f.subject) return false
        if (f.code && !s.code.toLowerCase().includes(f.code.toLowerCase())) return false
        if (f.year && String(p.academic_year) !== f.year) return false
        if (f.examType && p.exam_type !== f.examType) return false
        if (f.regulation && p.regulation !== f.regulation) return false
        if (f.university && p.university !== f.university) return false
        return true
      })
      .sort((a, b) => {
        const sa = subjectById[a.subject_id], sb = subjectById[b.subject_id]
        return (sa?.code || '').localeCompare(sb?.code || '') || b.academic_year - a.academic_year
      })
  }, [data, f, subjectById])

  const activeFilters = Object.entries(f).filter(([, v]) => v).length

  const Filters = (
    <div className="card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><I.filter size={16} /> Filters</h3>
        {activeFilters > 0 && (
          <button className="text-xs font-semibold text-blue-600 hover:underline" onClick={clearAll}>Clear all ({activeFilters})</button>
        )}
      </div>
      <Field label="Branch">
        <select className="input" value={f.branch} onChange={(e) => setF('branch', e.target.value)}>
          <option value="">All branches</option>
          {(data?.branches || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </Field>
      <Field label="Semester">
        <select className="input" value={f.sem} disabled={!f.branch} onChange={(e) => setF('sem', e.target.value)}>
          <option value="">All semesters</option>
          {semesters.map((s) => <option key={s.id} value={s.order_no}>{s.label}</option>)}
        </select>
      </Field>
      <Field label="Subject">
        <select className="input" value={f.subject} onChange={(e) => setF('subject', e.target.value)}>
          <option value="">All subjects</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
        </select>
      </Field>
      <Field label="Subject code">
        <input className="input" placeholder="e.g. CS301" value={f.code} onChange={(e) => setF('code', e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Year">
          <select className="input" value={f.year} onChange={(e) => setF('year', e.target.value)}>
            <option value="">All years</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
        <Field label="Exam type">
          <select className="input" value={f.examType} onChange={(e) => setF('examType', e.target.value)}>
            <option value="">All types</option>
            {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Regulation">
          <select className="input" value={f.regulation} onChange={(e) => setF('regulation', e.target.value)}>
            <option value="">All</option>
            {(regs.length ? regs : REGULATIONS).map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="University">
          <select className="input" value={f.university} onChange={(e) => setF('university', e.target.value)}>
            <option value="">All</option>
            {(unis.length ? unis : ['JNTUH', 'VTU', 'Anna University']).map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </Field>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionTitle icon={I.file} title="Question Paper Library"
        sub="Filter by branch, semester, subject, code, year, exam type and regulation. Every paper has a built-in viewer and a download." />

      <button className="btn-outline mb-4 !py-2 text-xs lg:hidden" onClick={() => setMobileFilters(!mobileFilters)}>
        <I.filter size={15} /> {mobileFilters ? 'Hide filters' : `Show filters${activeFilters ? ` (${activeFilters})` : ''}`}
      </button>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className={`${mobileFilters ? 'block' : 'hidden'} lg:block`}>{Filters}</div>
        <div className="lg:col-span-3">
          {error ? (
            <EmptyState icon={I.alert} title="Could not load papers" hint={error} />
          ) : !data ? (
            <CardSkeletons n={6} />
          ) : results.length === 0 ? (
            <EmptyState icon={I.file} title="No papers match these filters"
              hint="Try removing a filter or two — or request the paper you need and we'll add it."
              action={<div className="flex gap-2"><button className="btn-outline" onClick={clearAll}>Clear filters</button><Link to="/contact" className="btn-primary">Request a paper</Link></div>} />
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Badge>{results.length} paper{results.length !== 1 ? 's' : ''}</Badge>
                {f.branch && <Badge cls="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">{f.branch.toUpperCase()}</Badge>}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((p) => (
                  <PaperCard key={p.id} paper={p} subject={subjectById[p.subject_id]} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
