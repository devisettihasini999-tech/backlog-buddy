import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { db } from '../lib/db.js'
import { EmptyState, Loading, Badge } from '../components/ui.jsx'
import { I } from '../components/Icons.jsx'

export default function ResourceView() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setData(null)
    ;(async () => {
      try {
        const m = await db.get('study_materials', id)
        if (!m) {
          if (alive) setError('notfound')
          return
        }
        const subject = m.subject_id ? await db.get('subjects', m.subject_id) : null
        if (!alive) return
        setData({ m, subject })
      } catch (e) {
        if (alive) setError(e.message || 'Failed to load resource')
      }
    })()
    return () => { alive = false }
  }, [id])

  if (error === 'notfound') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState icon={I.alert} title="Resource not found" hint="It may have been removed."
          action={<Link to="/resources" className="btn-primary">Back to resources</Link>} />
      </div>
    )
  }
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><EmptyState icon={I.alert} title="Could not load resource" hint={error} /></div>
  if (!data) return <Loading label="Loading resource…" />

  const { m, subject } = data
  const blocks = (m.content || '').split(/\n\n+/).map((b) => b.trim()).filter(Boolean)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-400">
        <Link to="/" className="hover:text-blue-600">Home</Link> <I.chevRight size={12} />
        <Link to="/resources" className="hover:text-blue-600">Resources</Link> <I.chevRight size={12} />
        <span className="text-slate-600 dark:text-slate-300">{m.title}</span>
      </nav>

      <div className="card p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge cls="bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">{m.mtype}</Badge>
          {subject && <Badge>{subject.code} · {subject.name}</Badge>}
        </div>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">{m.title}</h1>
        {m.description && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{m.description}</p>}
        <hr className="my-6 border-slate-200 dark:border-slate-800" />
        <div className="space-y-4">
          {blocks.map((b, i) => {
            const lines = b.split('\n').map((l) => l.trim()).filter(Boolean)
            if (lines.length > 1 && lines.every((l) => /^(- |\d+\.|Day |Step |Unit )/.test(l))) {
              return (
                <div key={i} className="space-y-2">
                  {lines.map((l, j) => (
                    <p key={j} className="flex gap-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      <I.check size={15} className="mt-1 shrink-0 text-blue-500" />
                      <span>{l.replace(/^(- |\d+\.) /, '')}</span>
                    </p>
                  ))}
                </div>
              )
            }
            return (
              <p key={i} className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{b}</p>
            )
          })}
        </div>
        {subject && (
          <div className="mt-8 rounded-xl bg-blue-50 p-4 text-sm dark:bg-blue-500/10">
            <span className="font-semibold text-slate-800 dark:text-slate-100">Studying this subject? </span>
            <Link to={`/subject/${subject.id}`} className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
              Open {subject.code} — {subject.name} →
            </Link>{' '}
            previous papers, important questions and unit-wise material.
          </div>
        )}
      </div>
    </div>
  )
}
