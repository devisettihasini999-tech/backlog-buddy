/* ============================================================================
   Backlog Buddy — Vercel serverless function: secure Supabase proxy
   The Supabase secret key stays on the server (environment variable) and is
   never shipped to the browser. Set SUPABASE_URL and SUPABASE_SECRET_KEY in
   the Vercel project environment variables.

   GET  /api/db?table=subjects            -> select rows
   POST /api/db            { table, rows } -> upsert rows
   DELETE /api/db?table=x&id=y            -> delete a row
   ========================================================================== */
const ALLOWED = ['branches', 'semesters', 'subjects', 'question_papers', 'questions', 'study_materials', 'feedback'];

module.exports = async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    res.status(503).json({ error: 'Supabase is not configured. Add SUPABASE_URL and SUPABASE_SECRET_KEY to the environment.' });
    return;
  }

  const table = (req.query && req.query.table) || (req.body && req.body.table);
  if (!table || ALLOWED.indexOf(table) === -1) {
    res.status(400).json({ error: 'Unknown table. Allowed: ' + ALLOWED.join(', ') });
    return;
  }

  const headers = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
  const target = url.replace(/\/$/, '') + '/rest/v1/' + table;

  try {
    if (req.method === 'GET') {
      const qs = req.url.indexOf('?') === -1 ? '' : req.url.slice(req.url.indexOf('?'));
      const r = await fetch(target + (qs || '?select=*'), { headers });
      const data = await r.json();
      res.status(r.status).json(data);
      return;
    }
    if (req.method === 'POST') {
      const rows = req.body && req.body.rows;
      if (!Array.isArray(rows) || !rows.length) { res.status(400).json({ error: 'Body must be { table, rows: [] }' }); return; }
      const r = await fetch(target, {
        method: 'POST',
        headers: Object.assign({ Prefer: 'resolution=merge-duplicates,return=minimal' }, headers),
        body: JSON.stringify(rows)
      });
      res.status(r.status).json({ ok: r.ok, upserted: rows.length });
      return;
    }
    if (req.method === 'DELETE') {
      const id = req.query && req.query.id;
      if (!id) { res.status(400).json({ error: 'Provide ?id=' }); return; }
      const r = await fetch(target + '?id=eq.' + encodeURIComponent(id), { method: 'DELETE', headers });
      res.status(r.status).json({ ok: r.ok });
      return;
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: 'Upstream request failed', detail: String(err && err.message ? err.message : err) });
  }
};
