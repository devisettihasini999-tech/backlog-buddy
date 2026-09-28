/* ============================================================================
   Backlog Buddy — Express API
   Serves /api/* and (optionally) the static frontend from the repository root,
   so the browser and the API share one origin and no CORS setup is needed.
   ============================================================================ */
'use strict';

require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const db = require('./lib/db');
const ai = require('./lib/ai');

const app = express();
const PORT = Number(process.env.PORT || 4000);
const CLIENT_URL = process.env.CLIENT_URL || '';
const STATIC_DIR = process.env.STATIC_DIR !== ''
  ? path.resolve(process.env.STATIC_DIR || path.join(__dirname, '..'))
  : null;

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

/* CORS - only needed when the frontend is served from another origin */
app.use(cors({
  origin: function (origin, cb) {
    if (!origin) return cb(null, true);                       // curl / same origin
    if (origin === CLIENT_URL) return cb(null, true);
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
    if (/\.onrender\.com$/.test(new URL(origin).hostname)) return cb(null, true);
    if (/\.vercel\.app$/.test(new URL(origin).hostname)) return cb(null, true);
    if (/\.github\.io$/.test(new URL(origin).hostname)) return cb(null, true);
    return cb(null, true);                                    // public catalog data
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/* ------------------------- health & config ------------------------- */
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'backlog-buddy-api',
    time: new Date().toISOString(),
    supabase: db.status(),
    ai: { configured: ai.isConfigured(), model: ai.model }
  });
});

app.get('/api/config', async (req, res) => {
  try {
    const ready = await db.tablesReady();
    res.json({
      apiBase: '',                       // same origin
      authEnabled: !!(db.status().supabaseConfigured && ready),
      aiEnabled: ai.isConfigured(),
      storage: db.status()
    });
  } catch (e) {
    res.json({ apiBase: '', authEnabled: false, aiEnabled: ai.isConfigured(), storage: db.status() });
  }
});

/* ------------------------- routes ------------------------- */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/catalog', require('./routes/catalog'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/feedback', require('./routes/feedback'));

/* ------------------------- static frontend ------------------------- */
if (STATIC_DIR && fs.existsSync(STATIC_DIR)) {
  app.use(express.static(STATIC_DIR, {
    index: 'index.html',
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
    }
  }));

  /* pretty urls: /subjects -> /subjects.html */
  app.get(/^\/(?!api\/).*/, (req, res, next) => {
    if (req.path.indexOf('.') !== -1) return next();
    const candidate = path.join(STATIC_DIR, req.path + '.html');
    if (fs.existsSync(candidate)) return res.sendFile(candidate);
    const notFound = path.join(STATIC_DIR, '404.html');
    if (fs.existsSync(notFound)) return res.status(404).sendFile(notFound);
    next();
  });
} else {
  app.get('/', (req, res) => res.json({ service: 'backlog-buddy-api', docs: '/api/health' }));
}

/* ------------------------- errors ------------------------- */
app.use('/api', (req, res) => res.status(404).json({ error: 'Unknown API route', path: req.originalUrl }));

app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error('[error]', err);
  res.status(status).json({ error: status >= 500 ? 'Server error' : err.message, detail: status >= 500 ? undefined : err.message });
});

/* ------------------------- boot ------------------------- */
async function boot() {
  const schema = await db.ensureSchema();
  const ready = await db.tablesReady(true);
  app.listen(PORT, '0.0.0.0', () => {
    console.log('Backlog Buddy API listening on port ' + PORT);
    console.log('  supabase configured : ' + db.status().supabaseConfigured);
    console.log('  tables ready        : ' + ready + (ready ? '' : ' (' + (db.status().detail || 'using bundled demo data') + ')'));
    console.log('  schema bootstrap    : ' + JSON.stringify(schema));
    console.log('  gemini configured   : ' + ai.isConfigured());
    console.log('  static frontend     : ' + (STATIC_DIR || 'disabled'));
  });
}

if (require.main === module) boot();

module.exports = app;
