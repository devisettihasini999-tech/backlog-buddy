// One-shot seeder: pushes the bundled demo dataset into Supabase.
//
//   1. Run supabase/schema.sql once in the Supabase SQL editor (creates tables + RLS).
//   2. VITE_SUPABASE_SERVICE_KEY=*** npm run seed:demo
//
// The script is idempotent (upserts by id) and also uploads the generated
// demo PDFs to the public "papers" storage bucket, wiring each paper record
// to its public URL so the live site shows real PDFs in the viewer.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const url = process.env.VITE_SUPABASE_URL || 'https://jcltcmildaclwjkxgrgu.supabase.co'
const serviceKey = process.env.VITE_SUPABASE_SERVICE_KEY

if (!serviceKey) {
  console.error('Set VITE_SUPABASE_SERVICE_KEY (service-role key) and re-run. It must never be committed.')
  process.exit(1)
}

// --- bundle the demo data module (it uses Vite-style JSON imports) ---
const esbuild = await import('esbuild')
await esbuild.build({
  entryPoints: [path.join(ROOT, 'src', 'lib', 'demoData.js')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: path.join(ROOT, '.tmp', 'demo-data.mjs'),
  logLevel: 'warning',
})
const { DEMO } = await import(pathToFileURL(path.join(ROOT, '.tmp/demo-data.mjs')).href)

// --- supabase client with service key (bypasses RLS) ---
// Node 20 lacks a native WebSocket; the seeder never opens realtime channels,
// so a stub constructor satisfies the client's constructor-time check.
class WebSocketStub {
  constructor() {
    throw new Error('Realtime WebSocket is not used by the seed script')
  }
  static get CONNECTING() { return 0 }
  static get OPEN() { return 1 }
  static get CLOSING() { return 2 }
  static get CLOSED() { return 3 }
}
const { createClient } = await import('@supabase/supabase-js')
const sb = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: globalThis.WebSocket || WebSocketStub },
})

const { error: probeErr } = await sb.from('branches').select('id', { limit: 1 })
if (probeErr) {
  console.error('\n✗ Supabase tables not found yet.')
  console.error('  First run: open Supabase Dashboard → SQL Editor → paste supabase/schema.sql → Run.\n  Then re-run this script.')
  process.exit(1)
}
console.log('✓ Connected. Seeding demo data…')

// --- upload demo PDFs to storage (idempotent upsert) ---
const papersDir = path.join(ROOT, 'public', 'papers')
const files = fs.readdirSync(papersDir).filter((f) => f.endsWith('.pdf'))
let uploaded = 0
for (const f of files) {
  const buf = fs.readFileSync(path.join(papersDir, f))
  const { error } = await sb.storage.from('papers').upload(f, buf, { upsert: true, contentType: 'application/pdf' })
  if (error) {
    console.error(`  ! upload failed for ${f}: ${error.message}`)
  } else {
    uploaded++
  }
}
console.log(`✓ Uploaded ${uploaded}/${files.length} demo PDFs to public bucket "papers"`)

// --- upsert rows in FK order ---
const up = async (table, rows) => {
  const { error } = await sb.from(table).upsert(rows, { onConflict: 'id' })
  if (error) throw new Error(`${table}: ${error.message}`)
  console.log(`✓ ${table}: ${rows.length} rows`)
}

await up('branches', DEMO.branches)
await up('semesters', DEMO.semesters)
await up('subjects', DEMO.subjects)

const papers = DEMO.question_papers.map((p) => {
  const { data } = sb.storage.from('papers').getPublicUrl(p.file_name)
  return { ...p, file_url: data.publicUrl }
})
await up('question_papers', papers)
await up('questions', DEMO.questions)
await up('study_materials', DEMO.study_materials)

console.log('\n✓ Done! The site now runs in live Supabase mode (header badge switches to "Supabase").')
console.log('  Tip: you can now add real papers/questions via the Admin panel (/admin) — they are stored in Supabase for all visitors.')
