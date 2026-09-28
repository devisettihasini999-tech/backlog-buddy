import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { db } from '../lib/db.js'
import SearchBar from '../components/SearchBar.jsx'
import QuestionRow from '../components/QuestionRow.jsx'
import PaperCard from '../components/PaperCard.jsx'
import { SectionTitle, EmptyState, CardSkeletons, Badge } from '../components/ui.jsx'
import { I } from '../components/Icons.jsx'

export default function SearchPage() {
  const [params] = useSearchParams()
  const q = (params.get('q') || '').toLowerCase()
  const [data, setData] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [subjects, questions, papers] = await Promise.all([
          db.list('subjects'), db.list('questions'), db.list('question_papers'),
        ])
        if (!alive) return
        setData({ subjects, questions, papers })
      } catch {
        if (alive) setData({ subjects: [], questions: [], papers: [] })
      }
    })()
    return () => { alive = false }
  }, [])

  const subjectById = useMemo(() => Object.fromEntries((data?.subjects || []).map((s) => [s.id, s])), [data])

  const subs = useMemo(
    () => (data ? data.subjects.filter((s) => q && (s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))) : []),
    [data, q]
  )
  const qs = useMemo(
    () => (data ? data.questions.filter((x) => q && x.text.toLowerCase().includes(q)) : []),
    [data, q]
  )
  const ps = useMemo(
    () => (data ? data.papers.filter((p) => q && (p.title.toLowerCase().includes(q) || String(p.academic_year).includes(q))) : []),
    [data, q]
  )

  const total = subs.length + qs.length + ps.length

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SectionTitle icon={I.search} title="Search" sub="Across subjects, subject codes, questions, topics and years." />
      <div className="mb-8"><SearchBar initialValue={params.get('q') || ''} /></div>

      {!q ? (
        <EmptyState icon={I.search} title="Type to search" hint="Try “data structures”, “CS301”, “stack” or “2025”." />
      ) : !data ? (
        <CardSkeletons n={4} />
      ) : total === 0 ? (
        <EmptyState icon={I.search} title={`No results for “${params.get('q')}”`}
          hint="Check the spelling, try a subject code, or browse subjects directly."
          action={<Link to="/subjects" className="btn-primary">Browse subjects</Link>} />
      ) : (
        <div className="space-y-10">
          {subs.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <I.book size={18} className="text-blue-500" /> Subjects <Badge>{subs.length}</Badge>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {subs.map((s) => (
                  <Link key={s.id} to={`/subject/${s.id}`} className="card group flex items-center gap-3 p-4">
                    <Badge cls="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">{s.code}</Badge>
                    <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 dark:text-slate-100">{s.name}</span>
                    <I.chevRight size={16} className="ml-auto text-slate-300" />
                  </Link>
                ))}
              </div>
            </section>
          )}
          {ps.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <I.file size={18} className="text-blue-500" /> Question papers <Badge>{ps.length}</Badge>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {ps.map((p) => <PaperCard key={p.id} paper={p} subject={subjectById[p.subject_id]} />)}
              </div>
            </section>
          )}
          {qs.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <I.list size={18} className="text-blue-500" /> Questions <Badge>{qs.length}</Badge>
              </h2>
              <div className="space-y-3">
                {qs.map((x) => <QuestionRow key={x.id} q={x} subject={subjectById[x.subject_id]} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
