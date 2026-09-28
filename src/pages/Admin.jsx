import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { db, detectSource, resetOverlay } from '../lib/db.js'
import { useStore } from '../lib/store.jsx'
import { SectionTitle, Field, EmptyState, Loading, Stat, Badge, Modal } from '../components/ui.jsx'
import { I } from '../components/Icons.jsx'
import { cn, uid, ordinal, IMPORTANCE_META, EXAM_TYPES, REGULATIONS } from '../lib/utils.js'
import { ADMIN_PASSCODE } from '../lib/config.js'

const SESSION_KEY = 'bb_admin_ok'
const TABS = [
  { id: 'overview', label: 'Overview', icon: I.dashboard },
  { id: 'branches', label: 'Branches', icon: I.layers },
  { id: 'semesters', label: 'Semesters', icon: I.grid },
  { id: 'subjects', label: 'Subjects', icon: I.book },
  { id: 'papers', label: 'Papers', icon: I.file },
  { id: 'questions', label: 'Questions', icon: I.list },
  { id: 'materials', label: 'Materials', icon: I.bookmark },
]

function AdminGate({ onOk }) {
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const submit = (e) => {
    e.preventDefault()
    if (pass === ADMIN_PASSCODE) {
      sessionStorage.setItem(SESSION_KEY, '1')
      onOk()
    } else setErr('Wrong passcode. (Demo passcode: ' + ADMIN_PASSCODE + ')')
  }
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="card p-7">
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-xl bg-blue-600/10 p-2.5 text-blue-600 dark:text-blue-400"><I.dashboard size={22} /></span>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Admin Panel</h1>
            <p className="text-xs text-slate-400">Authorized administrators only</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Passcode">
            <input className="input" type="password" value={pass} onChange={(e) => { setPass(e.target.value); setErr('') }} placeholder="Enter admin passcode" autoFocus />
          </Field>
          {err && <p className="text-sm font-medium text-rose-500">{err}</p>}
          <button className="btn-primary w-full" type="submit">Unlock</button>
          <p className="text-xs text-slate-400">
            Demo build: the passcode is <b>{ADMIN_PASSCODE}</b>. Replace with Supabase Auth + a role check before production.
          </p>
        </form>
      </div>
    </div>
  )
}

/* ----------------------------- Overview ----------------------------- */
function OverviewTab() {
  const { toast, dataSource } = useStore()
  const [counts, setCounts] = useState(null)
  useEffect(() => {
    Promise.all(['branches', 'semesters', 'subjects', 'question_papers', 'questions', 'study_materials', 'feedback'].map((t) => db.list(t)))
      .then(([b, s, su, p, q, m, f]) => setCounts({ b: b.length, s: s.length, su: su.length, p: p.length, q: q.length, m: m.length, f: f.length }))
      .catch(() => setCounts({ b: '–', s: '–', su: '–', p: '–', q: '–', m: '–', f: '–' }))
  }, [])

  return (
    <div className="space-y-6">
      <div className="card border-blue-200 bg-blue-50/60 p-5 text-sm dark:border-blue-500/30 dark:bg-blue-500/10">
        <p className="font-semibold text-slate-800 dark:text-slate-100">
          Data source: {dataSource === 'supabase' ? 'Supabase (live)' : 'Demo mode (built-in data + browser storage)'}
        </p>
        {dataSource === 'demo' && (
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Everything you add below is saved in this browser. To make it live for all visitors, run <b>supabase/schema.sql</b>{' '}
            once in the Supabase SQL editor — the app switches automatically.
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={I.layers} label="Branches" value={counts?.b ?? '…'} />
        <Stat icon={I.grid} label="Semesters" value={counts?.s ?? '…'} tone="violet" />
        <Stat icon={I.book} label="Subjects" value={counts?.su ?? '…'} tone="amber" />
        <Stat icon={I.file} label="Question papers" value={counts?.p ?? '…'} tone="emerald" />
        <Stat icon={I.list} label="Questions" value={counts?.q ?? '…'} tone="rose" />
        <Stat icon={I.bookmark} label="Study materials" value={counts?.m ?? '…'} />
        <Stat icon={I.message} label="Feedback received" value={counts?.f ?? '…'} tone="violet" />
        <div className="card flex items-center justify-center p-4">
          {dataSource === 'demo' ? (
            <button
              className="btn-danger !py-2 text-xs"
              onClick={() => { resetOverlay(); toast('Local admin edits cleared — reloading'); setTimeout(() => window.location.reload(), 600) }}
            >
              Reset demo edits
            </button>
          ) : (
            <span className="text-xs font-semibold text-emerald-500">Connected & live</span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ----------------------------- Branches ----------------------------- */
const EMPTY_B = { name: '', code: '', description: '', icon: 'code', sort_order: 1 }
function BranchesTab() {
  const { toast } = useStore()
  const [rows, setRows] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [form, setForm] = useState(EMPTY_B)
  const [editing, setEditing] = useState(null)

  const load = () => Promise.all([db.list('branches'), db.list('subjects')]).then(([b, s]) => { setRows(b.sort((x, y) => x.sort_order - y.sort_order)); setSubjects(s) }).catch((e) => toast(e.message, 'error'))
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.code.trim()) return toast('Name and code are required', 'error')
    try {
      if (editing) { await db.update('branches', editing.id, form); toast('Branch updated') }
      else { await db.insert('branches', { ...form, id: editing || uid('br-'), code: form.code.toUpperCase() }); toast('Branch added') }
      setForm(EMPTY_B); setEditing(null); load()
    } catch (err) { toast(err.message, 'error') }
  }
  const del = async (r) => {
    if (!confirm(`Delete branch "${r.name}"? Its subjects, semesters, papers and questions will be removed too.`)) return
    try { await db.remove('branches', r.id); toast('Branch deleted'); load() } catch (err) { toast(err.message, 'error') }
  }

  const F = ({ k, v, set }) => <input className="input" value={v} onChange={(e) => set({ ...form, [k]: e.target.value })} />

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="card h-fit p-5 lg:col-span-2">
        <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">{editing ? `Edit branch — ${editing.code}` : 'Add a new branch'}</h3>
        <form onSubmit={save} className="space-y-3">
          <Field label="Branch name"><F k="name" v={form.name} set={setForm} placeholder="e.g. Biotechnology Engineering" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Code"><F k="code" v={form.code} set={setForm} placeholder="e.g. BT" /></Field>
            <Field label="Sort order"><input className="input" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></Field>
          </div>
          <Field label="Icon">
            <select className="input" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
              {['code', 'brain', 'chart', 'chip', 'bolt', 'gear', 'bridge', 'globe', 'box'].map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </Field>
          <Field label="Description"><textarea className="input min-h-20" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="flex gap-2">
            <button className="btn-primary flex-1">{editing ? 'Save changes' : 'Add branch'}</button>
            {editing && <button type="button" className="btn-outline" onClick={() => { setEditing(null); setForm(EMPTY_B) }}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="lg:col-span-3">
        {!rows ? <Loading /> : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="card flex items-center gap-3 p-4">
                <Badge cls="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">{r.code}</Badge>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{r.name}</div>
                  <div className="text-xs text-slate-400">{subjects.filter((s) => s.branch_id === r.id).length} subjects · icon: {r.icon}</div>
                </div>
                <button className="btn-ghost !p-2" title="Edit" onClick={() => { setEditing(r); setForm({ name: r.name, code: r.code, description: r.description || '', icon: r.icon || 'code', sort_order: r.sort_order || 1 }) }}><I.edit size={15} /></button>
                <button className="btn-ghost !p-2 text-rose-500" title="Delete" onClick={() => del(r)}><I.trash size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ----------------------------- Semesters ----------------------------- */
function SemestersTab() {
  const { toast } = useStore()
  const [branches, setBranches] = useState(null)
  const [sems, setSems] = useState([])
  const [branch, setBranch] = useState('')
  const [order, setOrder] = useState(1)

  const load = (b) => db.list('semesters', b ? { branch_id: b } : {}).then(setSems).catch((e) => toast(e.message, 'error'))
  useEffect(() => { db.list('branches').then((b) => { setBranches(b); if (b[0]) { setBranch(b[0].id); load(b[0].id) } }).catch(() => setBranches([])) }, [])
  useEffect(() => { if (branch) load(branch) }, [branch])

  const add = async (e) => {
    e.preventDefault()
    if (!branch) return toast('Pick a branch first', 'error')
    const n = Number(order)
    if (!n || n < 1 || n > 12) return toast('Order must be 1–12', 'error')
    try {
      await db.insert('semesters', { id: `${branch}-sem${n}`, branch_id: branch, order_no: n, label: `${ordinal(n)} Semester` })
      toast('Semester added')
      load(branch)
    } catch (err) { toast(err.message, 'error') }
  }
  const del = async (s) => {
    if (!confirm(`Delete ${s.label} for this branch? Subjects in it will be removed too.`)) return
    try { await db.remove('semesters', s.id); toast('Semester deleted'); load(branch) } catch (err) { toast(err.message, 'error') }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="card h-fit p-5 lg:col-span-2">
        <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">Add a semester</h3>
        <form onSubmit={add} className="space-y-3">
          <Field label="Branch">
            <select className="input" value={branch} onChange={(e) => setBranch(e.target.value)}>
              {(branches || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="Semester number (1–12)">
            <input className="input" type="number" min="1" max="12" value={order} onChange={(e) => setOrder(e.target.value)} />
          </Field>
          <button className="btn-primary w-full">Add {ordinal(Number(order) || 1)} semester</button>
          <p className="text-xs text-slate-400">Semesters are per-branch, so each branch can have its own count (e.g. CSE has 8).</p>
        </form>
      </div>
      <div className="lg:col-span-3">
        <div className="flex flex-wrap gap-2">
          {(sems || []).map((s) => (
            <span key={s.id} className="card flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {s.label}
              <button className="text-rose-400 hover:text-rose-600" onClick={() => del(s)} title="Delete"><I.trash size={14} /></button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ----------------------------- Subjects ----------------------------- */
const EMPTY_S = { code: '', name: '', description: '', unit1: '', unit2: '', unit3: '', unit4: '', unit5: '' }
function SubjectsTab() {
  const { toast } = useStore()
  const [branches, setBranches] = useState([])
  const [sems, setSems] = useState([])
  const [subs, setSubs] = useState(null)
  const [branch, setBranch] = useState('')
  const [sem, setSem] = useState('')
  const [form, setForm] = useState(EMPTY_S)
  const [editing, setEditing] = useState(null)

  const load = () => db.list('subjects', branch ? { branch_id: branch } : {}).then(setSubs).catch((e) => toast(e.message, 'error'))
  useEffect(() => { db.list('branches').then((b) => { setBranches(b); if (b[0]) { setBranch(b[0].id); db.list('semesters', { branch_id: b[0].id }).then(setSems) } }).catch(() => {}) }, [])
  useEffect(() => { if (branch) { db.list('semesters', { branch_id: branch }).then((s) => { setSems(s); setSem(s[0]?.order_no || ''); }); load() } }, [branch])

  const save = async (e) => {
    e.preventDefault()
    if (!branch) return toast('Select a branch', 'error')
    if (!sem) return toast('Select a semester', 'error')
    if (!form.code.trim() || !form.name.trim()) return toast('Code and name are required', 'error')
    try {
      const payload = {
        branch_id: branch,
        semester_id: `${branch}-sem${sem}`,
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description || null,
        unit1: form.unit1 || null, unit2: form.unit2 || null, unit3: form.unit3 || null, unit4: form.unit4 || null, unit5: form.unit5 || null,
      }
      if (editing) { await db.update('subjects', editing.id, payload); toast('Subject updated') }
      else { await db.insert('subjects', { ...payload, id: uid('sub-') }); toast('Subject added') }
      setForm(EMPTY_S); setEditing(null); load()
    } catch (err) { toast(err.message, 'error') }
  }
  const del = async (s) => {
    if (!confirm(`Delete subject "${s.code} ${s.name}"? Its questions, papers and materials will be removed too.`)) return
    try { await db.remove('subjects', s.id); toast('Subject deleted'); load() } catch (err) { toast(err.message, 'error') }
  }

  const U = (k) => (
    <input className="input" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={`Unit ${Number(k.slice(-1))} topics…`} />
  )

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="card h-fit p-5 lg:col-span-2">
        <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">{editing ? `Edit subject — ${editing.code}` : 'Add a subject'}</h3>
        <form onSubmit={save} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Branch">
              <select className="input" value={branch} onChange={(e) => setBranch(e.target.value)}>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.code}</option>)}
              </select>
            </Field>
            <Field label="Semester">
              <select className="input" value={sem} onChange={(e) => setSem(e.target.value)}>
                {sems.map((s) => <option key={s.id} value={s.order_no}>{s.label}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Subject code"><input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. CS301" /></Field>
            <Field label="Subject name"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Data Structures" /></Field>
          </div>
          <Field label="Description"><textarea className="input min-h-16" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="grid grid-cols-1 gap-2">
            {['unit1', 'unit2', 'unit3', 'unit4', 'unit5'].map((k) => <U key={k} k={k} />)}
          </div>
          <div className="flex gap-2">
            <button className="btn-primary flex-1">{editing ? 'Save changes' : 'Add subject'}</button>
            {editing && <button type="button" className="btn-outline" onClick={() => { setEditing(null); setForm(EMPTY_S) }}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="lg:col-span-3">
        {!subs ? <Loading /> : subs.length === 0 ? (
          <EmptyState icon={I.book} title="No subjects in this branch yet" hint="Add the first one on the left." />
        ) : (
          <div className="space-y-2">
            {subs.map((s) => (
              <div key={s.id} className="card flex items-center gap-3 p-4">
                <Badge cls="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">{s.code}</Badge>
                <div className="min-w-0 flex-1">
                  <Link to={`/subject/${s.id}`} className="block truncate text-sm font-semibold text-slate-800 hover:text-blue-600 dark:text-slate-100">{s.name}</Link>
                  <div className="truncate text-xs text-slate-400">{s.semester_id?.split('sem')[1]} · {(s.unit1 ? 'has units' : 'units not set')}</div>
                </div>
                <button className="btn-ghost !p-2" title="Edit" onClick={() => { setEditing(s); setForm({ code: s.code, name: s.name, description: s.description || '', unit1: s.unit1 || '', unit2: s.unit2 || '', unit3: s.unit3 || '', unit4: s.unit4 || '', unit5: s.unit5 || '' }) }}><I.edit size={15} /></button>
                <button className="btn-ghost !p-2 text-rose-500" title="Delete" onClick={() => del(s)}><I.trash size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ----------------------------- Papers ----------------------------- */
const EMPTY_P = { academic_year: new Date().getFullYear(), exam_type: 'End Semester', regulation: 'R20', university: 'JNTUH (sample)', title: '' }
function PapersTab() {
  const { toast } = useStore()
  const [subjects, setSubjects] = useState([])
  const [subject, setSubject] = useState('')
  const [rows, setRows] = useState(null)
  const [form, setForm] = useState(EMPTY_P)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = () => db.list('question_papers', subject ? { subject_id: subject } : {}).then((r) => setRows(r.sort((a, b) => b.academic_year - a.academic_year))).catch((e) => toast(e.message, 'error'))
  useEffect(() => {
    db.list('subjects').then((s) => { setSubjects(s); if (s[0]) setSubject(s[0].id) }).catch(() => {})
  }, [])
  useEffect(() => { if (subject) load() }, [subject])

  const subj = subjects.find((s) => s.id === subject)

  const save = async (e) => {
    e.preventDefault()
    if (!subject) return toast('Pick a subject', 'error')
    setBusy(true)
    try {
      const payload = {
        subject_id: subject,
        academic_year: Number(form.academic_year),
        exam_type: form.exam_type,
        regulation: form.regulation,
        university: form.university,
        title: form.title.trim() || `${subj?.name} — ${form.academic_year} ${form.exam_type} Paper`,
      }
      if (editing) {
        await db.update('question_papers', editing.id, payload)
        if (file) { const up = await db.uploadFile(file); await db.update('question_papers', editing.id, { file_url: up.url, file_name: up.name }) }
        toast('Paper updated')
      } else {
        let fileFields = {}
        if (file) {
          const up = await db.uploadFile(file)
          fileFields = { file_url: up.url, file_name: up.name }
        }
        await db.insert('question_papers', { ...payload, id: uid('p-'), ...fileFields })
        toast(file ? 'Paper uploaded' : 'Paper added (PDF can be attached later)')
      }
      setForm(EMPTY_P); setFile(null); setEditing(null); load()
    } catch (err) {
      toast(err.message, 'error')
    } finally { setBusy(false) }
  }
  const del = async (p) => {
    if (!confirm(`Delete paper "${p.title}"?`)) return
    try { await db.remove('question_papers', p.id); toast('Paper deleted'); load() } catch (err) { toast(err.message, 'error') }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="card h-fit p-5 lg:col-span-2">
        <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">{editing ? 'Edit paper' : 'Upload / add a question paper'}</h3>
        <form onSubmit={save} className="space-y-3">
          <Field label="Subject">
            <select className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Academic year"><input className="input" type="number" min="2000" max="2100" value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })} /></Field>
            <Field label="Exam type">
              <select className="input" value={form.exam_type} onChange={(e) => setForm({ ...form, exam_type: e.target.value })}>
                {EXAM_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Regulation">
              <select className="input" value={form.regulation} onChange={(e) => setForm({ ...form, regulation: e.target.value })}>
                {REGULATIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="University"><input className="input" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} /></Field>
          </div>
          <Field label="Title (optional — auto-generated if empty)">
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={`${subj?.name || 'Subject'} — ${form.academic_year} ${form.exam_type} Paper`} />
          </Field>
          <Field label={editing ? 'Replace PDF file (optional)' : 'PDF file'}>
            <input type="file" accept="application/pdf" className="input !py-2 text-xs" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </Field>
          <div className="flex gap-2">
            <button className="btn-primary flex-1" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add paper'}</button>
            {editing && <button type="button" className="btn-outline" onClick={() => { setEditing(null); setFile(null); setForm(EMPTY_P) }}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="lg:col-span-3">
        {!rows ? <Loading /> : rows.length === 0 ? (
          <EmptyState icon={I.file} title="No papers for this subject" hint="Upload the first one on the left." />
        ) : (
          <div className="space-y-2">
            {rows.map((p) => (
              <div key={p.id} className="card flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <Link to={`/papers/${p.id}`} className="block truncate text-sm font-semibold text-slate-800 hover:text-blue-600 dark:text-slate-100">{p.title}</Link>
                  <div className="text-xs text-slate-400">{p.academic_year} · {p.exam_type} · {p.regulation} · {p.file_url ? 'PDF attached' : 'no PDF yet'}</div>
                </div>
                {p.file_url && (
                  <a className="btn-outline !px-3 !py-1.5 text-xs" href={p.file_url} target="_blank" rel="noreferrer"><I.download size={13} /> PDF</a>
                )}
                <button className="btn-ghost !p-2" title="Edit" onClick={() => { setEditing(p); setForm({ academic_year: p.academic_year, exam_type: p.exam_type, regulation: p.regulation || '', university: p.university || '', title: p.title || '' }) }}><I.edit size={15} /></button>
                <button className="btn-ghost !p-2 text-rose-500" title="Delete" onClick={() => del(p)}><I.trash size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ----------------------------- Questions ----------------------------- */
const EMPTY_Q = { unit: 1, text: '', importance: 'frequently_asked', years: '', times_appeared: 0, notes: '' }
function QuestionsTab() {
  const { toast } = useStore()
  const [subjects, setSubjects] = useState([])
  const [subject, setSubject] = useState('')
  const [rows, setRows] = useState(null)
  const [form, setForm] = useState(EMPTY_Q)
  const [editing, setEditing] = useState(null)

  const load = () => db.list('questions', subject ? { subject_id: subject } : {}).then(setRows).catch((e) => toast(e.message, 'error'))
  useEffect(() => { db.list('subjects').then((s) => { setSubjects(s); if (s[0]) setSubject(s[0].id) }).catch(() => {}) }, [])
  useEffect(() => { if (subject) load() }, [subject])

  const save = async (e) => {
    e.preventDefault()
    if (!subject) return toast('Pick a subject', 'error')
    if (!form.text.trim()) return toast('Question text is required', 'error')
    try {
      const years = (form.years || '').split(',').map((y) => y.trim()).filter(Boolean)
      const payload = {
        subject_id: subject,
        unit: Number(form.unit),
        text: form.text.trim(),
        importance: form.importance,
        years: years.join(', '),
        times_appeared: Number(form.times_appeared) || years.length,
        notes: form.notes || null,
      }
      if (editing) { await db.update('questions', editing.id, payload); toast('Question updated') }
      else { await db.insert('questions', { ...payload, id: uid('q-') }); toast('Question added') }
      setForm(EMPTY_Q); setEditing(null); load()
    } catch (err) { toast(err.message, 'error') }
  }
  const del = async (q) => {
    if (!confirm('Delete this question?')) return
    try { await db.remove('questions', q.id); toast('Question deleted'); load() } catch (err) { toast(err.message, 'error') }
  }
  const analyze = async (q) => {
    const years = (q.years || '').split(',').map((y) => y.trim()).filter(Boolean)
    try {
      await db.update('questions', q.id, { times_appeared: years.length })
      toast(`Counted from year list → appeared in ${years.length} paper${years.length !== 1 ? 's' : ''}`)
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="card h-fit p-5 lg:col-span-2">
        <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">{editing ? 'Edit question' : 'Add an important question'}</h3>
        <form onSubmit={save} className="space-y-3">
          <Field label="Subject">
            <select className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
            </select>
          </Field>
          <Field label="Question">
            <textarea className="input min-h-20" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="e.g. Explain stack operations with algorithms." />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Unit">
              <select className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                {[1, 2, 3, 4, 5].map((u) => <option key={u} value={u}>Unit {u}</option>)}
              </select>
            </Field>
            <Field label="Label">
              <select className="input" value={form.importance} onChange={(e) => setForm({ ...form, importance: e.target.value })}>
                {Object.entries(IMPORTANCE_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
              </select>
            </Field>
            <Field label="Times asked">
              <input className="input" type="number" min="0" value={form.times_appeared} onChange={(e) => setForm({ ...form, times_appeared: e.target.value })} />
            </Field>
          </div>
          <Field label="Years it appeared (comma separated)" hint="e.g. 2023, 2024, 2025 — the 'appeared in N papers' count can be recomputed from this list.">
            <input className="input" value={form.years} onChange={(e) => setForm({ ...form, years: e.target.value })} />
          </Field>
          <Field label="Notes (optional)"><textarea className="input min-h-14" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          <div className="flex gap-2">
            <button className="btn-primary flex-1">{editing ? 'Save changes' : 'Add question'}</button>
            {editing && <button type="button" className="btn-outline" onClick={() => { setEditing(null); setForm(EMPTY_Q) }}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="lg:col-span-3">
        <p className="mb-3 text-xs text-slate-400">
          The "Analyze" action recomputes the frequency count from the years list — it reflects only the papers in the library, never a prediction.
        </p>
        {!rows ? <Loading /> : rows.length === 0 ? (
          <EmptyState icon={I.list} title="No questions for this subject yet" hint="Add the first one on the left." />
        ) : (
          <div className="space-y-2">
            {rows.map((q) => (
              <div key={q.id} className="card flex items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug text-slate-800 dark:text-slate-100">{q.text}</p>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 text-xs text-slate-400">
                    <span>Unit {q.unit}</span>
                    <span className="font-semibold text-violet-500">{q.times_appeared ?? 0} papers</span>
                    {q.years && <span>{q.years}</span>}
                  </div>
                </div>
                <button className="btn-ghost !px-2 !py-1 text-xs" title="Recompute count from years list" onClick={() => analyze(q)}><I.sparkles size={13} /> Analyze</button>
                <button className="btn-ghost !p-2" title="Edit" onClick={() => { setEditing(q); setForm({ unit: q.unit, text: q.text, importance: q.importance, years: q.years || '', times_appeared: q.times_appeared ?? 0, notes: q.notes || '' }) }}><I.edit size={15} /></button>
                <button className="btn-ghost !p-2 text-rose-500" title="Delete" onClick={() => del(q)}><I.trash size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ----------------------------- Materials ----------------------------- */
const EMPTY_M = { title: '', mtype: 'guide', description: '', content: '', url: '' }
function MaterialsTab() {
  const { toast } = useStore()
  const [subjects, setSubjects] = useState([])
  const [subject, setSubject] = useState('')
  const [rows, setRows] = useState(null)
  const [form, setForm] = useState(EMPTY_M)
  const [editing, setEditing] = useState(null)

  const load = () => db.list('study_materials').then(setRows).catch((e) => toast(e.message, 'error'))
  useEffect(() => {
    db.list('subjects').then(setSubjects).catch(() => {})
    load()
  }, [])

  const save = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast('Title is required', 'error')
    try {
      const payload = {
        subject_id: subject || null,
        title: form.title.trim(),
        mtype: form.mtype,
        description: form.description || null,
        content: form.content || null,
        url: form.url || null,
      }
      if (editing) { await db.update('study_materials', editing.id, payload); toast('Material updated') }
      else { await db.insert('study_materials', { ...payload, id: uid('m-') }); toast('Material added') }
      setForm(EMPTY_M); setEditing(null); load()
    } catch (err) { toast(err.message, 'error') }
  }
  const del = async (m) => {
    if (!confirm(`Delete material "${m.title}"?`)) return
    try { await db.remove('study_materials', m.id); toast('Material deleted'); load() } catch (err) { toast(err.message, 'error') }
  }
  const subjName = (id) => subjects.find((s) => s.id === id)?.code || 'Global'

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="card h-fit p-5 lg:col-span-2">
        <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">{editing ? 'Edit material' : 'Add a study material'}</h3>
        <form onSubmit={save} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Subject (empty = global)">
              <select className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="">Global</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
              </select>
            </Field>
            <Field label="Type">
              <select className="input" value={form.mtype} onChange={(e) => setForm({ ...form, mtype: e.target.value })}>
                {['guide', 'plan', 'sheet', 'notes', 'video'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Title"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Description"><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Content (paragraphs or list lines)"><textarea className="input min-h-32" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></Field>
          <Field label="External URL (optional)"><input className="input" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" /></Field>
          <div className="flex gap-2">
            <button className="btn-primary flex-1">{editing ? 'Save changes' : 'Add material'}</button>
            {editing && <button type="button" className="btn-outline" onClick={() => { setEditing(null); setForm(EMPTY_M) }}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="lg:col-span-3">
        {!rows ? <Loading /> : rows.length === 0 ? (
          <EmptyState icon={I.bookmark} title="No materials yet" hint="Add study resources on the left." />
        ) : (
          <div className="space-y-2">
            {rows.map((m) => (
              <div key={m.id} className="card flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge>{subjName(m.subject_id)}</Badge>
                    <Badge cls="bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">{m.mtype}</Badge>
                  </div>
                  <Link to={`/resource/${m.id}`} className="mt-1 block truncate text-sm font-semibold text-slate-800 hover:text-blue-600 dark:text-slate-100">{m.title}</Link>
                </div>
                <button className="btn-ghost !p-2" title="Edit" onClick={() => { setEditing(m); setSubject(m.subject_id || ''); setForm({ title: m.title, mtype: m.mtype, description: m.description || '', content: m.content || '', url: m.url || '' }) }}><I.edit size={15} /></button>
                <button className="btn-ghost !p-2 text-rose-500" title="Delete" onClick={() => del(m)}><I.trash size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [tab, setTab] = useState('overview')

  if (!authed) return <AdminGate onOk={() => setAuthed(true)} />

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionTitle icon={I.dashboard} title="Admin Panel"
        sub="Manage branches, semesters, subjects, question papers, important questions and study materials." />

      <div className="mb-6 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button key={t.id}
            className={cn('flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
              tab === t.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800')}
            onClick={() => setTab(t.id)}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
        <button className="btn-ghost ml-auto" onClick={() => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false) }}>Lock panel</button>
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'branches' && <BranchesTab />}
      {tab === 'semesters' && <SemestersTab />}
      {tab === 'subjects' && <SubjectsTab />}
      {tab === 'papers' && <PapersTab />}
      {tab === 'questions' && <QuestionsTab />}
      {tab === 'materials' && <MaterialsTab />}
    </div>
  )
}
