import React, { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useStore } from '../lib/store.jsx'
import { cn } from '../lib/utils.js'
import { I, Logo } from './Icons.jsx'
import { APP_NAME, TAGLINE } from '../lib/config.js'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/subjects', label: 'Subjects' },
  { to: '/papers', label: 'Question Papers' },
  { to: '/important-questions', label: 'Important Questions' },
  { to: '/resources', label: 'Resources' },
  { to: '/dashboard', label: 'My Dashboard' },
]

function ThemeToggle() {
  const { theme, toggleTheme } = useStore()
  return (
    <button
      onClick={toggleTheme}
      className="btn-ghost !p-2"
      aria-label="Toggle dark mode"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <I.sun size={18} /> : <I.moon size={18} />}
    </button>
  )
}

function Toasts() {
  const { toasts } = useStore()
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto rounded-xl px-4 py-3 text-sm font-medium shadow-lg',
            t.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
          )}
        >
          {t.msg}
        </div>
      ))}
    </div>
  )
}

export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { dataSource } = useStore()
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo size={34} />
            <div className="leading-tight">
              <div className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">{APP_NAME}</div>
              <div className="hidden text-[11px] font-medium text-blue-600 sm:block dark:text-blue-400">{TAGLINE}</div>
            </div>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}>
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <span
              className={cn(
                'badge hidden md:inline-flex',
                dataSource === 'supabase'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
              )}
              title={dataSource === 'supabase' ? 'Connected to Supabase' : 'Running on built-in demo data'}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', dataSource === 'supabase' ? 'bg-emerald-500' : 'bg-amber-500')} />
              {dataSource === 'supabase' ? 'Supabase' : 'Demo data'}
            </span>
            <Link to="/admin" className="nav-link hidden sm:block" title="Admin panel">
              <span className="flex items-center gap-1.5"><I.dashboard size={15} /> Admin</span>
            </Link>
            <ThemeToggle />
            <button className="btn-ghost !p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <I.x size={20} /> : <I.menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
            <div className="grid grid-cols-2 gap-1">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}>
                  {n.label}
                </NavLink>
              ))}
              <NavLink to="/about" className="nav-link">About</NavLink>
              <NavLink to="/contact" className="nav-link">Contact / Feedback</NavLink>
              <NavLink to="/admin" className="nav-link">Admin</NavLink>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-14 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo size={30} />
              <span className="font-extrabold text-slate-900 dark:text-white">{APP_NAME}</span>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {TAGLINE} Previous papers, important questions, repeated topics and study resources for engineering students — organised subject by subject.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Explore</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link className="hover:text-blue-600" to="/subjects">Browse Subjects</Link></li>
              <li><Link className="hover:text-blue-600" to="/papers">Question Paper Library</Link></li>
              <li><Link className="hover:text-blue-600" to="/important-questions">Important Questions</Link></li>
              <li><Link className="hover:text-blue-600" to="/resources">Study Resources</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Account</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link className="hover:text-blue-600" to="/dashboard">My Dashboard</Link></li>
              <li><Link className="hover:text-blue-600" to="/about">About</Link></li>
              <li><Link className="hover:text-blue-600" to="/contact">Contact / Feedback</Link></li>
              <li><Link className="hover:text-blue-600" to="/admin">Admin Panel</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Good to know</h4>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Question frequency labels are preparation recommendations computed from the papers in our library — they are not predictions of future exam questions.
              {dataSource === 'demo' && ' This instance is running on demo data until the Supabase schema is applied.'}
            </p>
          </div>
        </div>
        <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-400 dark:border-slate-800">
          © {new Date().getFullYear()} {APP_NAME} · Built for engineering students · Use the materials, clear the backlog
        </div>
      </footer>
      <Toasts />
    </div>
  )
}
