import React, { useEffect, useState } from 'react'
import { db } from '../lib/db.js'
import { SectionTitle, Field } from '../components/ui.jsx'
import { I } from '../components/Icons.jsx'
import { useStore } from '../lib/store.jsx'
import { uid } from '../lib/utils.js'

export default function Contact() {
  const [branches, setBranches] = useState([])
  const [form, setForm] = useState({ name: '', email: '', branch: '', message: '' })
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useStore()

  useEffect(() => {
    db.list('branches').then(setBranches).catch(() => {})
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.message.trim()) {
      toast('Please fill your name and message', 'error')
      return
    }
    setBusy(true)
    try {
      await db.insert('feedback', { id: uid('fb'), ...form })
      setSent(true)
      toast('Feedback submitted — thank you!')
      setForm({ name: '', email: '', branch: '', message: '' })
    } catch (err) {
      toast(`Could not send feedback: ${err.message}`, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <SectionTitle icon={I.message} title="Contact & Feedback"
        sub="Report a wrong paper, request a missing one, or suggest a subject. Feedback is stored in the platform's database." />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4">
          <div className="card p-5">
            <I.file size={22} className="mb-3 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Request a paper</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Tell us subject code + year + exam type (e.g. "CS302, 2023 End Semester"). We'll add it when available.
            </p>
          </div>
          <div className="card p-5">
            <I.alert size={22} className="mb-3 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Report an issue</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Wrong question, broken PDF, wrong subject code — tell us the page URL and what you saw.
            </p>
          </div>
          <div className="card p-5">
            <I.sparkles size={22} className="mb-3 text-violet-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Suggest content</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              New branch, regulation or university? Suggest it and we'll extend the library.
            </p>
          </div>
        </div>

        <div className="card p-6 md:col-span-2">
          {sent && (
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              <I.check size={18} /> Thank you! Your feedback has been recorded.
            </div>
          )}
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name *">
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ravi Kumar" />
            </Field>
            <Field label="Email">
              <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </Field>
            <Field label="Branch">
              <select className="input" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
                <option value="">Select branch (optional)</option>
                {branches.map((b) => <option key={b.id} value={b.code}>{b.name}</option>)}
              </select>
            </Field>
            <Field label="Subject / Paper (if applicable)">
              <input className="input" value={form.subject || ''} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. CS301 2024" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Message *">
                <textarea className="input min-h-32" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your request or feedback…" />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <button className="btn-primary !px-6" disabled={busy}>
                {busy ? 'Sending…' : 'Send feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
