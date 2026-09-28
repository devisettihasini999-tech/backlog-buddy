import React from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store.jsx'
import { cn } from '../lib/utils.js'
import { I } from './Icons.jsx'
import { Badge } from './ui.jsx'

export default function SubjectCard({ subject, branch, semester, counts = {} }) {
  const { favorites, toggleFavorite, toast } = useStore()
  const fav = favorites.includes(subject.id)
  const units = [subject.unit1, subject.unit2, subject.unit3, subject.unit4, subject.unit5].filter(Boolean)

  return (
    <div className="card group relative flex flex-col p-5 transition-shadow hover:shadow-md">
      <button
        className={cn(
          'absolute right-3 top-3 rounded-lg p-1.5 transition-colors',
          fav ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400 dark:text-slate-600'
        )}
        title={fav ? 'Remove from favourites' : 'Add to favourites'}
        onClick={(e) => {
          e.preventDefault()
          toggleFavorite(subject.id)
          toast(fav ? 'Removed from favourites' : 'Saved to favourites')
        }}
      >
        <I.heart size={18} fill={fav ? 'currentColor' : 'none'} />
      </button>

      <div className="mb-2 flex flex-wrap items-center gap-1.5 pr-8">
        <Badge cls="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">{subject.code}</Badge>
        {branch && <Badge>{branch.code}</Badge>}
        {semester && <Badge>{semester.label}</Badge>}
      </div>

      <Link to={`/subject/${subject.id}`} className="flex-1">
        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          {subject.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{subject.description}</p>

        {units.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {units.slice(0, 3).map((u, i) => (
              <span key={i} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                U{i + 1}: {u}
              </span>
            ))}
            {units.length > 3 && <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-400 dark:bg-slate-800">+{units.length - 3} more</span>}
          </div>
        )}
      </Link>

      <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span className="flex items-center gap-1"><I.file size={14} /> {counts.papers ?? 0} papers</span>
        <span className="flex items-center gap-1"><I.list size={14} /> {counts.questions ?? 0} important Qs</span>
        <span className="flex items-center gap-1"><I.book size={14} /> {counts.materials ?? 0} materials</span>
      </div>
    </div>
  )
}
