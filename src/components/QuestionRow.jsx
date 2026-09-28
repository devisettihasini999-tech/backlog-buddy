import React from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store.jsx'
import { cn, IMPORTANCE_META } from '../lib/utils.js'
import { I } from './Icons.jsx'
import { Badge } from './ui.jsx'

export default function QuestionRow({ q, subject }) {
  const { bookmarks, toggleBookmark, toast } = useStore()
  const meta = IMPORTANCE_META[q.importance] || IMPORTANCE_META.practice
  const marked = bookmarks.includes(q.id)

  return (
    <div className="card flex gap-3 p-4">
      <div className="flex flex-col items-center gap-2">
        <span className={cn('badge', meta.cls)} title={meta.label}>{meta.short}</span>
        {q.unit ? <Badge>Unit {q.unit}</Badge> : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-100">{q.text}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          {(q.times_appeared ?? 0) > 0 && (
            <span className="flex items-center gap-1 font-semibold text-violet-600 dark:text-violet-400">
              <I.repeat size={13} />
              appeared in {q.times_appeared} previous paper{q.times_appeared > 1 ? 's' : ''}
            </span>
          )}
          {q.years && <span className="flex items-center gap-1"><I.clock size={13} /> {q.years}</span>}
          {subject && (
            <Link to={`/subject/${subject.id}`} className="flex items-center gap-1 hover:text-blue-600">
              <I.book size={13} /> {subject.code} · {subject.name}
            </Link>
          )}
        </div>
      </div>
      <button
        className={cn('self-start rounded-lg p-1.5 transition-colors', marked ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500 dark:text-slate-600')}
        title={marked ? 'Remove bookmark' : 'Bookmark this question'}
        onClick={() => {
          toggleBookmark(q.id)
          toast(marked ? 'Bookmark removed' : 'Question bookmarked')
        }}
      >
        <I.star size={18} fill={marked ? 'currentColor' : 'none'} />
      </button>
    </div>
  )
}
