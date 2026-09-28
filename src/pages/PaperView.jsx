import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { db } from '../lib/db.js'
import PdfViewer from '../components/PdfViewer.jsx'
import PaperCard from '../components/PaperCard.jsx'
import { EmptyState, Loading, Badge } from '../components/ui.jsx'
import { I } from '../components/Icons.jsx'
import { cn } from '../lib/utils.js'
import { useStore } from '../lib/store.jsx'

export default function PaperView() {
  const { id } = useParams()
  const { savedPapers, toggleSavedPaper, toast, addRecent } = useStore()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setData(null)
    ;(async () => {
      try {
        const paper = await db.get('question_papers', id)
        if (!paper) {
          if (alive) setError('notfound')
          return
        }
        const subject = paper.subject_id ? await db.get('subjects', paper.subject_id) : null
        const related = subject
          ? (await db.list('question_papers', { subject_id: subject.id })).filter((p) => p.id !== id).slice(0, 3)
          : []
        if (!alive) return
        setData({ paper, subject, related })
        addRecent('paper', paper.id)
      } catch (e) {
        if (alive) setError(e.message || 'Failed to load paper')
      }
    })()
    return () => { alive = false }
  }, [id])

  if (error === 'notfound') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState icon={I.alert} title="Paper not found"
          hint="This paper may have been removed."
          action={<Link to="/papers" className="btn-primary">Back to library</Link>} />
      </div>
    )
  }
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><EmptyState icon={I.alert} title="Could not load paper" hint={error} /></div>
  if (!data) return <Loading label="Loading paper…" />

  const { paper, subject, related } = data
  const saved = savedPapers.includes(paper.id)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-400">
        <Link to="/" className="hover:text-blue-600">Home</Link> <I.chevRight size={12} />
        <Link to="/papers" className="hover:text-blue-600">Question Papers</Link> <I.chevRight size={12} />
        <span className="text-slate-600 dark:text-slate-300">{paper.title}</span>
      </nav>

      <div className="card mb-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge cls="bg-slate-900 text-white dark:bg-white dark:text-slate-900">{paper.academic_year}</Badge>
              <Badge cls="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">{paper.exam_type}</Badge>
              {paper.regulation && <Badge>{paper.regulation}</Badge>}
              {paper.university && <Badge>{paper.university}</Badge>}
            </div>
            <h1 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">{paper.title}</h1>
            {subject && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {subject.code} · {subject.name}
                {subject.branch_id && (
                  <Link className="ml-2 font-semibold text-blue-600 hover:underline dark:text-blue-400" to={`/subject/${subject.id}`}>
                    Open subject page <I.chevRight size={12} />
                  </Link>
                )}
              </p>
            )}
          </div>
          <button
            className={cn('btn-outline', saved && '!border-amber-400 !text-amber-600')}
            onClick={() => { toggleSavedPaper(paper.id); toast(saved ? 'Removed from saved papers' : 'Paper saved to dashboard') }}
          >
            <I.bookmark size={16} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save paper'}
          </button>
        </div>
      </div>

      <PdfViewer url={paper.file_url} fileName={paper.file_name} title={paper.title} />

      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">More papers for {subject?.name}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <PaperCard key={p.id} paper={p} subject={subject} />)}
          </div>
        </div>
      )}
    </div>
  )
}
