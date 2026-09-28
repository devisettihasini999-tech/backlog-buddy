import React from 'react'
import { cn } from '../lib/utils.js'
import { I } from './Icons.jsx'

export function Spinner({ size = 20, className = '' }) {
  return (
    <svg className={cn('animate-spin', className)} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label="Loading">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500 dark:text-slate-400">
      <Spinner size={28} className="text-blue-600" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={cn('skeleton', className)} />
}

export function CardSkeletons({ n = 6, className = '' }) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="card p-5">
          <Skeleton className="mb-3 h-4 w-2/3" />
          <Skeleton className="mb-2 h-3 w-1/2" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ icon: IconCmp = I.file, title, hint, action }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="rounded-2xl bg-blue-50 p-4 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400">
        <IconCmp size={28} />
      </div>
      <h3 className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      {hint && <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        className={cn('card mt-8 w-full p-0 shadow-xl', wide ? 'max-w-3xl' : 'max-w-lg')}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h3 className="text-base font-semibold">{title}</h3>
          <button className="btn-ghost !p-1.5" onClick={onClose} aria-label="Close">
            <I.x size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function Badge({ children, cls = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' }) {
  return <span className={cn('badge', cls)}>{children}</span>
}

export function SectionTitle({ icon: Icn = I.layers, title, sub, right }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="rounded-xl bg-blue-600/10 p-2 text-blue-600 dark:text-blue-400">
            <Icn size={20} />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">{title}</h2>
        </div>
        {sub && <p className="mt-1.5 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{sub}</p>}
      </div>
      {right}
    </div>
  )
}

export function Field({ label, children, hint }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export function Stat({ icon: Icn = I.target, label, value, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-600/10 text-blue-600 dark:text-blue-400',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  }
  return (
    <div className="card flex items-center gap-4 p-4">
      <span className={cn('rounded-xl p-3', tones[tone])}>
        <Icn size={22} />
      </span>
      <div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</div>
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
      </div>
    </div>
  )
}

export function Disclaimer({ text }) {
  const t = text || 'These questions are preparation recommendations based on the previous papers currently in our library. They show what has been asked in the past — they are NOT a prediction or guarantee of what will appear in your exam.'
  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
      <I.info size={18} className="mt-0.5 shrink-0" />
      <p>{t}</p>
    </div>
  )
}

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-2xl px-4 py-16">
          <EmptyState
            icon={I.alert}
            title="Something went wrong"
            hint={String(this.state.error?.message || this.state.error)}
            action={
              <button className="btn-primary" onClick={() => window.location.assign('/')}>
                Back to home
              </button>
            }
          />
        </div>
      )
    }
    return this.props.children
  }
}
