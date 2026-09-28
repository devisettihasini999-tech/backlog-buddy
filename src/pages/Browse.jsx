import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { db } from '../lib/db.js'
import SubjectCard from '../components/SubjectCard.jsx'
import { SectionTitle, CardSkeletons, EmptyState } from '../components/ui.jsx'
import { I } from '../components/Icons.jsx'
import { cn, semLabel } from '../lib/utils.js'

export default function Browse() {
  const [params, setParams] = useSearchParams()
  const branch = params.get('branch') || ''
  const sem = params.get('sem') || ''

  const [branches, setBranches] = useState(null)
  const [semesters, setSemesters] = useState([])
  const [subjects, setSubjects] = useState([])
  const [counts, setCounts] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setError('')
        const [bs, sems, subs, papers, questions, materials] = await Promise.all([
          db.list('branches'), db.list('semesters'), db.list('subjects'),
          db.list('question_papers'), db.list('questions'), db.list('study_materials'),
        ])
        if (!alive) return
        setBranches(bs)
        setSemesters(sems)
        const list = subs.filter((s) => (!branch || s.branch_id === branch) && (!sem || s.semester_id === `${branch}-sem${sem}`))
        setSubjects(list)
        const c = {}
        list.forEach((s) => {
          c[s.id] = {
            papers: papers.filter((p) => p.subject_id === s.id).length,
            questions: questions.filter((q) => q.subject_id === s.id).length,
            materials: materials.filter((m) => m.subject_id === s.id).length,
          }
        })
        setCounts(c)
      } catch (e) {
        if (alive) setError(e.message || 'Failed to load subjects')
      }
    })()
    return () => { alive = false }
  }, [branch, sem])

  const branchSemesters = useMemo(
    () => semesters.filter((s) => !branch || s.branch_id === branch).sort((a, b) => a.order_no - b.order_no),
    [semesters, branch]
  )

  const setFilter = (key, value) => {
    const p = new URLSearchParams(params)
    if (value) p.set(key, value)
    else p.delete(key)
    if (key === 'branch') p.delete('sem')
    setParams(p, { replace: true })
  }

  const selBranch = branches?.find((b) => b.id === branch)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionTitle
        icon={I.book}
        title="Browse Subjects"
        sub={selBranch ? `Showing ${selBranch.name} subjects${sem ? ` · ${semLabel(Number(sem))}` : ' · all semesters'}` : 'Pick a branch and semester to see its subjects.'}
      />

      {/* Branch chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button className={cn('rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors', !branch ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300')}
          onClick={() => setFilter('branch', '')}>
          All branches
        </button>
        {(branches || []).map((b) => (
          <button key={b.id} className={cn('rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors', branch === b.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300')}
            onClick={() => setFilter('branch', b.id)}>
            {b.code} · {b.name.split(' & ')[0]}
          </button>
        ))}
      </div>

      {/* Semester pills */}
      {branch && branchSemesters.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button className={cn('rounded-xl border px-3.5 py-1.5 text-xs font-semibold', !sem ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : 'border-slate-300 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400')}
            onClick={() => setFilter('sem', '')}>
            All semesters
          </button>
          {branchSemesters.map((s) => (
            <button key={s.id} className={cn('rounded-xl border px-3.5 py-1.5 text-xs font-semibold', sem === String(s.order_no) ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : 'border-slate-300 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400')}
              onClick={() => setFilter('sem', s.order_no)}>
              {s.label}
            </button>
          ))}
        </div>
      )}

      {error ? (
        <EmptyState icon={I.alert} title="Could not load subjects" hint={error} />
      ) : !branches ? (
        <CardSkeletons n={8} />
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={I.book}
          title="No subjects found here yet"
          hint={branch ? `Subjects for ${branch.toUpperCase()} / ${sem ? semLabel(Number(sem)) : 'this selection'} are being added. An admin can add them from the admin panel.` : 'Choose a branch to see its subjects.'}
          action={<button className="btn-outline" onClick={() => setFilter('branch', '')}>Show all branches</button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {subjects.map((s) => (
            <SubjectCard
              key={s.id}
              subject={s}
              branch={branches.find((b) => b.id === s.branch_id)}
              semester={semesters.find((x) => x.id === s.semester_id)}
              counts={counts[s.id]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
