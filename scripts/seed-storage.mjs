/**
 * One-command Supabase Storage setup:
 *   1. Creates the public "papers" bucket (if missing)
 *   2. Uploads every PDF in public/papers/ to the bucket
 *
 * Storage CAN be provisioned over the REST API with the service key
 * (unlike SQL tables, which must be created via the Supabase SQL Editor).
 *
 * Usage:
 *   SUPABASE_SECRET_KEY=sb_secret_... node scripts/seed-storage.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const URL = process.env.VITE_SUPABASE_URL || 'https://jcltcmildaclwjkxgrgu.supabase.co';
const KEY = process.env.SUPABASE_SECRET_KEY;
const DIR = join(process.cwd(), 'public', 'papers');
const BUCKET = 'papers';

if (!KEY) {
  console.error('Set SUPABASE_SECRET_KEY (service role key) first.');
  process.exit(1);
}

const auth = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
};

// 1. bucket
const list = await fetch(`${URL}/storage/v1/bucket`, { headers: auth }).then((r) => r.json());
const exists = Array.isArray(list) && list.some((b) => b.id === BUCKET);
if (!exists) {
  const res = await fetch(`${URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  const body = await res.json();
  console.log(res.ok ? `created public bucket "${BUCKET}"` : `bucket error: ${JSON.stringify(body)}`);
} else {
  console.log(`bucket "${BUCKET}" already exists`);
}

// 2. upload PDFs with a small concurrency pool
const files = readdirSync(DIR).filter((f) => f.endsWith('.pdf'));
console.log(`uploading ${files.length} PDFs...`);
let done = 0;
let failed = 0;

async function upload(file) {
  const bytes = readFileSync(join(DIR, file));
  const res = await fetch(`${URL}/storage/v1/object/${BUCKET}/${file}`, {
    method: 'POST',
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/pdf',
      'x-upsert': 'true',
    },
    body: bytes,
  });
  if (!res.ok) failed++;
  done++;
  if (done % 100 === 0) console.log(`  ${done}/${files.length}`);
}

const POOL = 16;
for (let i = 0; i < files.length; i += POOL) {
  await Promise.all(files.slice(i, i + POOL).map(upload));
}

console.log(`Done. uploaded=${done - failed} failed=${failed}`);
console.log(`Public base URL: ${URL}/storage/v1/object/public/${BUCKET}/`);
