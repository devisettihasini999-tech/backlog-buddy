// Optional helper: verifies the Supabase connection and creates the
// "papers" storage bucket if it does not exist yet.
// Usage:  VITE_SUPABASE_SERVICE_KEY=... node scripts/setup-supabase.js
//
// NOTE: creating the database TABLES requires running supabase/schema.sql
// in the Supabase SQL editor — the REST API cannot execute DDL.
const { createClient } = await import('@supabase/supabase-js')

const url = process.env.VITE_SUPABASE_URL || 'https://jcltcmildaclwjkxgrgu.supabase.co'
const serviceKey = process.env.VITE_SUPABASE_SERVICE_KEY

if (!serviceKey) {
  console.log('No VITE_SUPABASE_SERVICE_KEY set — skipping bucket setup (create it via supabase/schema.sql).')
  process.exit(0)
}

const sb = createClient(url, serviceKey)

const { data: tables } = await sb.from('branches').select('id', { count: 'exact', head: true })
console.log(`branches table reachable: ${!tables?.error ? 'yes' : 'NO — run supabase/schema.sql in the SQL editor first'}`)

const { data: buckets } = await sb.storage.listBuckets()
console.log('buckets:', buckets?.map((b) => b.name).join(', ') || '(none)')
if (!buckets?.some((b) => b.id === 'papers')) {
  const { error } = await sb.storage.createBucket('papers', { public: true })
  console.log(error ? `bucket create error: ${error.message}` : 'created public bucket "papers"')
} else {
  console.log('bucket "papers" already exists')
}
console.log('Done.')
