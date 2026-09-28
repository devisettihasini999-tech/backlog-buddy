import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../lib/db.js'
import { useStore } from '../lib/store.jsx'
import { I } from './Icons.jsx'

export default function SearchBar({ big = false, initialValue = '' }) {
  const [q, setQ] = useState(initialValue)
  const [items, setItems] = useState(null)
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const box = useRef(null)

  useEffect(() => setQ(initialValue), [initialValue])

  useEffect(() => {
    const term = q.trim().toLowerCase()
    if (term.length < 2) {
      setItems(null)
      return
    }
    let alive = true
    const t = setTimeout(async () => {
      try {
        const [subjects, questions, papers] = await Promise.all([db.list('subjects'), db.list('questions'), db.list('question_papers')])
        if (!alive) return
        const match = (s) => String(s).toLowerCase().includes(term)
        const subs = subjects
          .filter((s) => match(s.name) || match(s.code))
          .slice(0, 4)
          .map((s) => ({ type: 'subject', id: s.id, label: s.name, sub: `${s.code} · subject`, to: `/subject/${s.id}` }))
        const qs = questions
          .filter((x) => match(x.text))
          .slice(0, 4)
          .map((x) => ({ type: 'question', id: x.id, label: x.text, sub: `important question · appeared ${x.times_appeared ?? 0}×`, to: `/important-questions?q=${encodeURIComponent(x.text.slice(0, 40))}` }))
        const ps = papers
          .filter((p) => match(p.title) || match(String(p.academic_year)))
          .slice(0, 4)
          .map((p) => ({ type: 'paper', id: p.id, label: p.title, sub: `${p.academic_year} · ${p.exam_type}`, to: p.file_url ? `/papers/${p.id}` : null }))
        setItems([...subs, ...qs, ...ps])
      } catch {
        if (alive) setItems([])
      }
    }, 220)
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [q])

  useEffect(() => {
    const h = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const submit = (e) => {
    e?.preventDefault()
    setOpen(false)
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div ref={box} className="relative w-full">
      <form onSubmit={submit} className="relative">
        <I.search size={big ? 20 : 17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={big ? 'Search subject, subject code, or question…' : 'Search subject, code or question…'}
          className={`input ${big ? '!py-4 !pl-12 !pr-4 text-base shadow-lg shadow-blue-600/5' : '!pl-10'}`}
          aria-label="Search"
        />
      </form>

      {open && items && items.length > 0 && (
        <div className="card absolute z-30 mt-2 max-h-96 w-full overflow-y-auto p-2 shadow-xl">
          {items.map((it, i) => (
            <button
              key={i}
              className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => {
                setOpen(false)
                if (it.to) nav(it.to)
                else nav(`/search?q=${encodeURIComponent(q.trim())}`)
              }}
            >
              <span className="mt-0.5 shrink-0 text-blue-500">
                {it.type === 'subject' ? <I.book size={16} /> : it.type === 'question' ? <I.list size={16} /> : <I.file size={16} />}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">{it.label}</span>
                <span className="block text-xs text-slate-400">{it.sub}</span>
              </span>
            </button>
          ))}
        </div>
      )}
      {open && items && items.length === 0 && q.trim().length >= 2 && (
        <div className="card absolute z-30 mt-2 w-full p-4 text-sm text-slate-500 dark:text-slate-400">
          No matches for “{q.trim()}” — try a subject code like <b>CS301</b> or a topic like <b>stack</b>.
        </div>
      )}
    </div>
  )
}
