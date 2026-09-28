/* ============================================================================
   Backlog Buddy — data layer
   Reads from Supabase (PostgREST) when the tables exist, otherwise from the
   bundled demo dataset. Writes (auth, items, progress, feedback) go to Supabase
   using the service role key, which only ever lives on the server.
   ============================================================================ */
'use strict';

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

/* ------------------------------------------------------------------ *
 * Minimal PostgREST client (fetch based, no realtime dependency)
 * ------------------------------------------------------------------ */
class PgError extends Error {
  constructor(message, status) { super(message); this.status = status || 400; this.name = 'PgError'; }
}

async function request(table, method, options) {
  options = options || {};
  if (!SUPABASE_URL || !SERVICE_KEY) throw new PgError('Supabase is not configured on the server', 503);

  const params = new URLSearchParams();
  if (options.select) params.set('select', options.select);
  (options.filters || []).forEach(([col, op, value]) => {
    if (value === undefined || value === null) return;
    params.set(col, op + '.' + value);
  });
  if (options.order) params.set('order', options.order);
  if (options.limit) params.set('limit', String(options.limit));

  const url = SUPABASE_URL + '/rest/v1/' + table + (params.toString() ? '?' + params.toString() : '');
  const headers = {
    apikey: SERVICE_KEY,
    Authorization: 'Bearer ' + SERVICE_KEY,
    'Content-Type': 'application/json'
  };
  if (method === 'POST') headers.Prefer = options.upsert ? 'resolution=merge-duplicates,return=representation' : 'return=representation';
  if (method === 'PATCH' || method === 'DELETE') headers.Prefer = 'return=representation';

  const res = await fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await res.text();
  let json = null;
  if (text) { try { json = JSON.parse(text); } catch (e) { json = null; } }

  if (!res.ok) {
    const message = (json && (json.message || json.error || json.hint)) || ('Request failed with status ' + res.status);
    throw new PgError(message, res.status);
  }
  if (options.head) return { count: Number(res.headers.get('content-range') ? res.headers.get('content-range').split('/')[1] : 0) };
  return json;
}

async function select(table, options) {
  options = options || {};
  const data = await request(table, 'GET', options);
  return Array.isArray(data) ? data : [];
}
async function selectOne(table, options) {
  const rows = await select(table, Object.assign({}, options, { limit: 1 }));
  return rows[0] || null;
}
async function insert(table, rows, upsert) {
  return request(table, 'POST', { body: rows, upsert: !!upsert });
}
async function update(table, patch, filters) {
  return request(table, 'PATCH', { body: patch, filters: filters });
}
async function remove(table, filters) {
  return request(table, 'DELETE', { filters: filters });
}

/* ------------------------------------------------------------------ *
 * Bundled demo dataset (used until the Supabase tables exist)
 * ------------------------------------------------------------------ */
let demo = null;
function loadDemo() {
  if (demo) return demo;
  const file = path.join(__dirname, '..', 'data', 'demo-data.json');
  try {
    demo = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    demo = { branches: [], semesters: [], subjects: [], questions: [], papers: [], materials: [], repeated: {}, stats: {} };
  }
  return demo;
}

/* ------------------------------------------------------------------ *
 * Table detection
 * ------------------------------------------------------------------ */
let cache = { checkedAt: 0, ok: false, error: null };

async function tablesReady(force) {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    cache = { checkedAt: Date.now(), ok: false, error: 'Supabase service role key not configured' };
    return false;
  }
  if (!force && cache.checkedAt && Date.now() - cache.checkedAt < 60000) return cache.ok;
  try {
    await selectOne('subjects', { select: 'id' });
    cache = { checkedAt: Date.now(), ok: true, error: null };
  } catch (e) {
    cache = { checkedAt: Date.now(), ok: false, error: e.message };
  }
  return cache.ok;
}

function status() {
  return {
    supabaseConfigured: !!(SUPABASE_URL && SERVICE_KEY),
    anonKeyPresent: !!ANON_KEY,
    tablesReady: cache.ok,
    detail: cache.error,
    demoSubjects: loadDemo().subjects.length
  };
}

/* ------------------------------------------------------------------ *
 * Catalog reads
 * ------------------------------------------------------------------ */
function decorate(paper, subjectMap) {
  const s = subjectMap[paper.subject] || {};
  return {
    id: paper.id,
    subject: paper.subject,
    subjectName: s.name || '-',
    code: s.code || '-',
    branch: s.branch || '-',
    branchCode: s.branchCode || (s.branch || '').toUpperCase(),
    sem: s.sem || null,
    year: paper.year,
    examType: paper.exam_type || paper.examType,
    regulation: paper.regulation || s.regulation || '-',
    university: paper.university || s.university || '-',
    marks: paper.marks || 60,
    duration: paper.duration || '3 hours',
    file: paper.file_url || paper.file || null,
    uploadedAt: paper.uploaded_at || paper.uploadedAt,
    downloads: paper.downloads || 0,
    qids: paper.qids || []
  };
}

async function getBranches() {
  if (await tablesReady()) {
    const rows = await select('branches', { select: '*', order: 'code.asc' });
    if (rows.length) return rows;
  }
  return loadDemo().branches;
}

async function getSemesters() {
  if (await tablesReady()) {
    const rows = await select('semesters', { select: '*', order: 'n.asc' });
    if (rows.length) return rows;
  }
  return loadDemo().semesters;
}

async function getSubjects(filter) {
  filter = filter || {};
  if (await tablesReady()) {
    const filters = [];
    if (filter.branch) filters.push(['branch', 'eq', filter.branch]);
    if (filter.sem) filters.push(['sem', 'eq', filter.sem]);
    const rows = await select('subjects', { select: '*', filters, order: 'code.asc' });
    if (rows.length) return rows;
  }
  return loadDemo().subjects.filter((s) => {
    if (filter.branch && s.branch !== filter.branch) return false;
    if (filter.sem && s.sem !== Number(filter.sem)) return false;
    return true;
  });
}

async function getSubject(id) {
  if (await tablesReady()) {
    const row = await selectOne('subjects', { select: '*', filters: [['id', 'eq', id]] });
    if (row) return row;
  }
  return loadDemo().subjects.find((s) => s.id === id) || null;
}

async function getPapers(filter) {
  filter = filter || {};
  const subjectMap = {};
  (await getSubjects({})).forEach((s) => { subjectMap[s.id] = s; });

  let rows = [];
  if (await tablesReady()) {
    const filters = [];
    if (filter.year) filters.push(['year', 'eq', filter.year]);
    if (filter.examType) filters.push(['exam_type', 'eq', filter.examType]);
    if (filter.subject) filters.push(['subject', 'eq', filter.subject]);
    rows = await select('question_papers', { select: '*', filters, order: 'year.desc', limit: 2000 });
  }
  if (!rows.length) rows = loadDemo().papers;

  return rows.map((p) => decorate(p, subjectMap)).filter((p) => {
    if (filter.branch && p.branch !== filter.branch) return false;
    if (filter.sem && p.sem !== Number(filter.sem)) return false;
    if (filter.subject && p.subject !== filter.subject) return false;
    if (filter.year && p.year !== Number(filter.year)) return false;
    if (filter.examType && p.examType !== filter.examType) return false;
    if (filter.regulation && p.regulation !== filter.regulation) return false;
    if (filter.q) {
      const hay = (p.subjectName + ' ' + p.code + ' ' + p.year + ' ' + p.examType + ' ' + p.regulation + ' ' + p.branchCode).toLowerCase();
      if (!hay.includes(String(filter.q).toLowerCase())) return false;
    }
    return true;
  });
}

async function getQuestions(filter) {
  filter = filter || {};
  if (await tablesReady()) {
    const filters = [];
    if (filter.subject) filters.push(['subject', 'eq', filter.subject]);
    if (filter.unit) filters.push(['unit', 'eq', filter.unit]);
    const rows = await select('questions', { select: '*', filters, limit: 5000 });
    if (rows.length) return rows;
  }
  return loadDemo().questions.filter((q) => {
    if (filter.subject && q.subject !== filter.subject) return false;
    if (filter.unit && q.unit !== Number(filter.unit)) return false;
    return true;
  });
}

async function getMaterials(subjectId) {
  if (await tablesReady()) {
    const rows = await select('study_materials', { select: '*', filters: [['subject', 'eq', subjectId]] });
    if (rows.length) return rows;
  }
  return loadDemo().materials.filter((m) => m.subject === subjectId);
}

/* Live analysis: in how many available papers does a topic appear */
async function getRepeated(subjectId) {
  const questions = await getQuestions({ subject: subjectId });
  const yearsByTopic = {};
  questions.forEach((q) => {
    const key = String(q.topic || q.text).toLowerCase();
    yearsByTopic[key] = yearsByTopic[key] || { topic: q.topic || q.text, unit: q.unit, years: {}, questions: 0 };
    (q.years || []).forEach((y) => { yearsByTopic[key].years[y] = 1; });
    yearsByTopic[key].questions += 1;
  });
  return Object.keys(yearsByTopic).map((k) => {
    const t = yearsByTopic[k];
    return {
      topic: t.topic,
      unit: t.unit,
      papers: Object.keys(t.years).length,
      questions: t.questions,
      years: Object.keys(t.years).map(Number).sort((a, b) => b - a)
    };
  }).filter((t) => t.papers >= 2).sort((a, b) => b.papers - a.papers || b.questions - a.questions);
}

async function search(term, limit) {
  const needle = String(term || '').toLowerCase().trim();
  if (!needle) return [];
  const [subjects, questions, papers] = await Promise.all([getSubjects({}), getQuestions({}), getPapers({})]);
  const out = [];
  subjects.forEach((s) => {
    if ((s.name + ' ' + s.code).toLowerCase().includes(needle)) {
      out.push({ type: 'subject', id: s.id, title: s.name, sub: s.code + ' | ' + s.branch + ' | Sem ' + s.sem, subject: s.id, branch: s.branch, sem: s.sem, year: 0 });
    }
  });
  questions.forEach((q) => {
    if ((q.text + ' ' + (q.topic || '')).toLowerCase().includes(needle)) {
      const s = subjects.find((x) => x.id === q.subject) || {};
      out.push({ type: 'question', id: q.id, title: q.text, sub: (s.name || '') + ' (' + (s.code || '') + ') | Unit ' + q.unit, subject: q.subject, branch: s.branch, sem: s.sem, year: 0 });
    }
  });
  papers.forEach((p) => {
    if ((p.subjectName + ' ' + p.code + ' ' + p.year + ' ' + p.examType).toLowerCase().includes(needle)) {
      out.push({ type: 'paper', id: p.id, title: p.subjectName + ' ' + p.year + ' ' + p.examType, sub: p.code + ' | Sem ' + p.sem, subject: p.subject, branch: p.branch, sem: p.sem, year: p.year });
    }
  });
  return out.slice(0, limit || 30);
}

/* ------------------------------------------------------------------ *
 * Writes: profiles, items, progress, feedback
 * ------------------------------------------------------------------ */
async function createProfile(email, fullName, passwordHash) {
  const rows = await insert('profiles', [{ email, full_name: fullName, password_hash: passwordHash }]);
  const row = rows && rows[0];
  if (!row) throw new PgError('Could not create the account', 400);
  return { id: row.id, email: row.email, full_name: row.full_name, created_at: row.created_at };
}

async function findProfileByEmail(email) {
  return selectOne('profiles', { select: '*', filters: [['email', 'eq', email]] });
}

async function findProfileById(id) {
  return selectOne('profiles', { select: 'id, email, full_name, created_at', filters: [['id', 'eq', id]] });
}

async function listItems(userId) {
  return select('items', { select: '*', filters: [['user_id', 'eq', userId]], order: 'created_at.desc' });
}

async function createItem(userId, title, description) {
  const rows = await insert('items', [{ user_id: userId, title, description }]);
  return rows && rows[0];
}

async function updateItem(userId, id, patch) {
  const rows = await update('items', patch, [['id', 'eq', id], ['user_id', 'eq', userId]]);
  return rows && rows[0];
}

async function deleteItem(userId, id) {
  await remove('items', [['id', 'eq', id], ['user_id', 'eq', userId]]);
  return { ok: true };
}

async function getProgress(userId) {
  const rows = await select('user_progress', { select: 'kind, ref_id, payload', filters: [['user_id', 'eq', userId]] });
  const out = { favorites: [], bookmarks: [], savedPapers: [], completed: [], recent: [], checklist: [] };
  rows.forEach((row) => {
    if (!out[row.kind]) out[row.kind] = [];
    if (row.kind === 'checklist') out.checklist.push(Object.assign({ id: row.ref_id }, row.payload || {}));
    else out[row.kind].push(row.ref_id);
  });
  return out;
}

async function putProgress(userId, kind, refId, payload) {
  await insert('user_progress', [{
    user_id: userId, kind, ref_id: refId, payload: payload || null, updated_at: new Date().toISOString()
  }], true);
  return { ok: true };
}

async function deleteProgress(userId, kind, refId) {
  await remove('user_progress', [['user_id', 'eq', userId], ['kind', 'eq', kind], ['ref_id', 'eq', refId]]);
  return { ok: true };
}

async function saveFeedback(row) {
  try {
    await insert('feedback', [row]);
    return { ok: true, stored: 'supabase' };
  } catch (e) {
    return { ok: false, stored: 'error: ' + e.message };
  }
}

/* ------------------------------------------------------------------ *
 * Automatic table creation (runs when SUPABASE_DB_URL is provided)
 * ------------------------------------------------------------------ */
async function ensureSchema() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) return { attempted: false, reason: 'SUPABASE_DB_URL not set' };
  let pg;
  try { pg = require('pg'); } catch (e) { return { attempted: false, reason: 'pg module unavailable' }; }

  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  const { ALL } = require('./schema');
  const errors = [];
  try {
    await client.connect();
    for (const stmt of ALL) {
      try { await client.query(stmt); } catch (e) { errors.push(String(e && e.message ? e.message : e).slice(0, 120)); }
    }
  } catch (e) {
    return { attempted: true, ok: false, reason: String(e && e.message ? e.message : e) };
  } finally {
    try { await client.end(); } catch (e) { /* ignore */ }
  }
  cache = { checkedAt: 0, ok: false, error: null };
  await tablesReady(true);
  return { attempted: true, ok: cache.ok, errors: errors.slice(0, 5) };
}

module.exports = {
  request, select, selectOne, insert, update, remove,
  loadDemo, status, tablesReady,
  getBranches, getSemesters, getSubjects, getSubject, getPapers,
  getQuestions, getMaterials, getRepeated, search,
  createProfile, findProfileByEmail, findProfileById,
  listItems, createItem, updateItem, deleteItem,
  getProgress, putProgress, deleteProgress,
  saveFeedback, ensureSchema
};
