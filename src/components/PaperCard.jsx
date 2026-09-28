import React from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store.jsx'
import { cn, downloadFile, timeAgo } from '../lib/utils.js'
import { I } from './Icons.jsx'
import { Badge } from './ui.jsx'

const TYPE_CLS = {
  'End Semester': 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  'Mid Semester': 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
  Supplementary: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  Model: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
}

export default function PaperCard({ paper, subject }) {
  const { savedPapers, toggleSavedPaper, toast } = useStore()
  const saved = savedPapers.includes(paper.id)
  const hasFile = Boolean(paper.file_url)

  return (
    <div className="card flex flex-col p-5 transition-shadow hover:shadow-md">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Badge cls="bg-slate-900 text-white dark:bg-white dark:text-slate-900">{paper.academic_year}</Badge>
        <Badge cls={TYPE_CLS[paper.exam_type] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}>{paper.exam_type}</Badge>
        {paper.regulation && <Badge>{paper.regulation}</Badge>}
        {paper.university && <Badge>{paper.university}</Badge>}
      </div>

      <h3 className="text-sm font-bold leading-snug text-slate-900 dark:text-white">
        {subject ? (
          <Link to={`/subject/${subject.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
            {paper.title}
          </Link>
        ) : (
          paper.title
        )}
      </h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {subject ? `${subject.code} · ` : ''}{paper.university || '—'} · uploaded {timeAgo(paper.uploaded_at)}
      </p>

      <div className="mt-4 flex items-center gap-2">
        {hasFile ? (
          <>
            <Link to={`/papers/${paper.id}`} className="btn-primary flex-1 !px-3 !py-2 text-xs">
              <I.eye size={15} /> View Paper
            </Link>
            <button
              className="btn-outline flex-1 !px-3 !py-2 text-xs"
              onClick={async () => {
                try {
                  await downloadFile(paper.file_url, paper.file_name || `${paper.title}.pdf`)
                  toast('Download started')
                } catch {
                  toast('Download failed — please try again', 'error')
                }
              }}
            >
              <I.download size={15} /> Download
            </button>
          </>
        ) : (
          <div className="flex-1 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-center text-xs font-medium text-slate-400 dark:border-slate-700">
            PDF not uploaded yet — coming soon
          </div>
        )}
        <button
          className={cn('rounded-xl p-2 transition-colors', saved ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500 dark:text-slate-600')}
          title={saved ? 'Remove saved paper' : 'Save this paper'}
          onClick={() => {
            toggleSavedPaper(paper.id)
            toast(saved ? 'Removed from saved papers' : 'Paper saved to dashboard')
          }}
        >
          <I.bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  )
}
