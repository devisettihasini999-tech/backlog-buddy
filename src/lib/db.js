// Data access layer.
// - If the Supabase tables exist (apply supabase/schema.sql once), the app
//   reads/writes Supabase live.
// - Otherwise it runs in demo mode: bundled demo data + a localStorage
//   overlay so admin-panel edits still work locally.
import { supabase } from './supabase.js'
import { DEMO } from './demoData.js'
import { uid } from './utils.js'

const LS_OVERLAY = 'bb_admin_overlay_v1'
const emptyOverlay = () => ({ added: {}, updated: {}, deleted: {} })

function readOverlay() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_OVERLAY))
    return raw ? { ...emptyOverlay(), ...raw } : emptyOverlay()
  } catch {
    return emptyOverlay()
  }
}
function writeOverlay(o) {
  localStorage.setItem(LS_OVERLAY, JSON.stringify(o))
}
export function resetOverlay() {
  localStorage.removeItem(LS_OVERLAY)
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

function demoTable(table) {
  const o = readOverlay()
  const del = new Set(o.deleted[table] || [])
  let rows = (DEMO[table] || []).filter((r) => !del.has(r.id))
  for (const [id, patch] of Object.entries(o.updated[table] || {})) {
    const i = rows.findIndex((r) => r.id === id)
    if (i >= 0) rows[i] = { ...rows[i], ...patch }
  }
  rows = rows.concat(o.added[table] || [])
  return rows
}

let cachedSource = null
export async function detectSource() {
  if (cachedSource) return cachedSource
  try {
    const { error } = await supabase.from('branches').select('id', { head: true, count: 'exact' })
    cachedSource = error ? 'demo' : 'supabase'
  } catch {
    cachedSource = 'demo'
  }
  return cachedSource
}
export function setDetectedSource(v) {
  cachedSource = v
}

async function list(table, filter = {}) {
  const src = await detectSource()
  if (src === 'demo') {
    await delay(180)
    let rows = demoTable(table)
    for (const [k, v] of Object.entries(filter)) {
      if (v != null && v !== '') rows = rows.filter((r) => String(r[k]) === String(v))
    }
    return rows
  }
  let q = supabase.from(table).select('*')
  for (const [k, v] of Object.entries(filter)) {
    if (v != null && v !== '') q = q.eq(k, v)
  }
  const { data, error } = await q
  if (error) throw error
  return data || []
}

async function get(table, id) {
  const rows = await list(table, { id })
  return rows[0] || null
}

async function insert(table, row) {
  const src = await detectSource()
  const record = { ...row, id: row.id || uid(table.slice(0, 3) + '-'), created_at: new Date().toISOString() }
  if (src === 'demo') {
    const o = readOverlay()
    o.added[table] = [...(o.added[table] || []), record]
    writeOverlay(o)
    return record
  }
  const { data, error } = await supabase.from(table).insert(record).select().single()
  if (error) throw error
  return data
}

async function update(table, id, row) {
  const src = await detectSource()
  if (src === 'demo') {
    const o = readOverlay()
    const existing = demoTable(table).find((r) => r.id === id)
    const merged = { ...(existing || { id }), ...row, id }
    if (existing) o.updated[table][id] = row
    else {
      // may be a row added in this overlay session
      const i = (o.added[table] || []).findIndex((r) => r.id === id)
      if (i >= 0) o.added[table][i] = merged
      else o.added[table] = [...(o.added[table] || []), merged]
    }
    writeOverlay(o)
    return merged
  }
  const { data, error } = await supabase.from(table).update(row).eq('id', id).select().single()
  if (error) throw error
  return data
}

async function remove(table, id) {
  const src = await detectSource()
  if (src === 'demo') {
    const o = readOverlay()
    const added = (o.added[table] || []).filter((r) => r.id !== id)
    if (added.length !== (o.added[table] || []).length) o.added[table] = added
    else o.deleted[table] = [...new Set([...(o.deleted[table] || []), id])]
    writeOverlay(o)
    return true
  }
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
  return true
}

/** Upload a file (PDF). Returns { url, name, size }. */
async function uploadFile(file) {
  const src = await detectSource()
  if (src === 'supabase') {
    const safe = file.name.replace(/[^\w.\-]/g, '_')
    const path = `${Date.now()}-${safe}`
    const { error } = await supabase.storage.from('papers').upload(path, file, { upsert: false })
    if (error) throw new Error(`Upload failed: ${error.message}`)
    const { data } = supabase.storage.from('papers').getPublicUrl(path)
    return { url: data.publicUrl, name: file.name, size: file.size }
  }
  if (file.size > 1.5 * 1024 * 1024) {
    throw new Error('Demo mode stores files in your browser only (max ~1.5 MB). Connect Supabase for full-size uploads — see README "Database setup".')
  }
  const dataUrl = await new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result)
    fr.onerror = () => reject(new Error('Could not read file'))
    fr.readAsDataURL(file)
  })
  return { url: dataUrl, name: file.name, size: file.size }
}

/**
 * "Paper analysis" helper — recompute how often each question appeared,
 * based on the papers the admin linked to it. Never a prediction:
 * counts reflect only the papers currently in the library.
 */
function analyzeQuestions(questionRows) {
  return questionRows.map((q) => {
    const years = (q.years || '').split(',').map((y) => y.trim()).filter(Boolean)
    return {
      ...q,
      times_appeared: q.times_appeared ?? years.length,
      years: years.join(', '),
    }
  })
}

export const db = {
  list,
  get,
  insert,
  update,
  remove,
  uploadFile,
  analyzeQuestions,
  demoTable,
}

export { DEMO }
