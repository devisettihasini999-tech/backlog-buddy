import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../lib/db.js'
import { GLOBAL_TIPS } from '../lib/demoData.js'
import { SectionTitle, CardSkeletons, EmptyState, Field, Badge } from '../components/ui.jsx'
import { I } from '../components/Icons.jsx'

const TYPE_CLS = {
  plan: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  guide: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
  sheet: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  notes: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  video: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
}

export default function Resources() {
  const [materials, setMaterials] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [error, setError] = useState('')
  const [subject, setSubject] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [m, s] = await Promise.all([db.list('study_materials'), db.list('subjects')])
        if (!alive) return
        setMaterials(m)
        setSubjects(s)
      } catch (e) {
        if (alive) setError(e.message || 'Failed to load resources')
      }
    })()
    return () => { alive = false }
  }, [])

  const globalOnes = useMemo(() => (materials || []).filter((m) => !m.subject_id), [materials])
  const subjectOnes = useMemo(
    () => (materials || []).filter((m) => m.subject_id && (!subject || m.subject_id === subject)),
    [materials, subject]
  )
  const subjectById = useMemo(() => Object.fromEntries(subjects.map((s) => [s.id, s])), [subjects])

  const Card = ({ m }) => (
    <Link to={`/resource/${m.id}`} className="card group flex flex-col p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2">
        <Badge cls={TYPE_CLS[m.mtype] || TYPE_CLS.notes}>{m.mtype}</Badge>
        {m.subject_id && subjectById[m.subject_id] && <Badge>{subjectById[m.subject_id].code}</Badge>}
      </div>
      <h3 className="mt-2.5 text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">{m.title}</h3>
      <p className="mt-1.5 flex-1 text-sm text-slate-500 dark:text-slate-400">{m.description}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">Open <I.chevRight size={13} /></span>
    </Link>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionTitle icon={I.bookmark} title="Study Resources"
        sub="Sprint plans, hall-note sheets, guides and formulas — written specifically for backlog and supplementary exam preparation." />

      {error ? (
        <EmptyState icon={I.alert} title="Could not load resources" hint={error} />
      ) : !materials ? (
        <CardSkeletons n={6} />
      ) : (
        <>
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">General preparation</h2>
          {globalOnes.length === 0 ? (
            <EmptyState icon={I.book} title="No general resources yet" hint="Admin can add resources from the admin panel." />
          ) : (
            <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {globalOnes.map((m) => <Card key={m.id} m={m} />)}
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Subject-specific material</h2>
            <select className="input !w-auto" value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">All subjects</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
            </select>
          </div>
          {subjectOnes.length === 0 ? (
            <EmptyState icon={I.book} title="No subject material here yet"
              hint="Subject-specific sheets are being added. The general plans above work for any subject." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjectOnes.map((m) => <Card key={m.id} m={m} />)}
            </div>
          )}

          <div className="card mt-12 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <I.award size={20} className="text-blue-500" /> Quick rules before you start
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {GLOBAL_TIPS.map((t, i) => (
                <div key={i} className="flex gap-2.5 rounded-xl bg-slate-50 p-3.5 text-sm leading-relaxed text-slate-600 dark:bg-slate-950/60 dark:text-slate-300">
                  <I.check size={16} className="mt-0.5 shrink-0 text-emerald-500" /> {t}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
