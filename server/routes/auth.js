/* ============================================================================
   Backlog Buddy — auth routes (bcrypt + JWT, session token in the client)
   ============================================================================ */
'use strict';

const express = require('express');
const auth = require('../lib/auth');
const db = require('../lib/db');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const fullName = String(req.body.fullName || req.body.full_name || '').trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const st = db.status();
    if (!st.supabaseConfigured) return res.status(503).json({ error: 'Supabase is not configured on the server' });
    if (!st.tablesReady) return res.status(503).json({ error: 'Database tables are not ready yet. Create them with SUPABASE_DB_URL or supabase/schema.sql.' });
    const existing = await db.findProfileByEmail(email);
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

    const hash = await auth.hashPassword(password);
    const profile = await db.createProfile(email, fullName || email.split('@')[0], hash);
    const token = auth.signToken(profile);
    res.status(201).json({ token, user: profile });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Sign up failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const st = db.status();
    if (!st.supabaseConfigured) return res.status(503).json({ error: 'Supabase is not configured on the server' });
    if (!st.tablesReady) return res.status(503).json({ error: 'Database tables are not ready yet. Create them with SUPABASE_DB_URL or supabase/schema.sql.' });

    const profile = await db.findProfileByEmail(email);
    if (!profile) return res.status(401).json({ error: 'Incorrect email or password' });
    const ok = await auth.verifyPassword(password, profile.password_hash);
    if (!ok) return res.status(401).json({ error: 'Incorrect email or password' });

    const token = auth.signToken(profile);
    res.json({ token, user: { id: profile.id, email: profile.email, full_name: profile.full_name, created_at: profile.created_at } });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Log in failed' });
  }
});

router.get('/me', auth.requireUser, async (req, res) => {
  res.json({ user: req.user });
});

/* Personal backlog items: full CRUD, scoped to the signed in user */
router.get('/items', auth.requireUser, async (req, res) => {
  try { res.json({ items: await db.listItems(req.user.id) }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/items', auth.requireUser, async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const item = await db.createItem(req.user.id, title, String(req.body.description || '').trim());
    res.status(201).json({ item });
  } catch (e) { res.status(e.status || 500).json({ error: e.message }); }
});

router.put('/items/:id', auth.requireUser, async (req, res) => {
  try {
    const patch = {};
    if (req.body.title != null) patch.title = String(req.body.title).trim();
    if (req.body.description != null) patch.description = String(req.body.description).trim();
    if (req.body.ai_summary != null) patch.ai_summary = String(req.body.ai_summary);
    res.json({ item: await db.updateItem(req.user.id, req.params.id, patch) });
  } catch (e) { res.status(e.status || 500).json({ error: e.message }); }
});

router.delete('/items/:id', auth.requireUser, async (req, res) => {
  try { res.json(await db.deleteItem(req.user.id, req.params.id)); }
  catch (e) { res.status(e.status || 500).json({ error: e.message }); }
});

/* Cross device dashboard sync */
router.get('/progress', auth.requireUser, async (req, res) => {
  try { res.json(await db.getProgress(req.user.id)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/progress/:kind/:refId', auth.requireUser, async (req, res) => {
  try { res.json(await db.putProgress(req.user.id, req.params.kind, req.params.refId, req.body.payload || null)); }
  catch (e) { res.status(e.status || 500).json({ error: e.message }); }
});

router.delete('/progress/:kind/:refId', auth.requireUser, async (req, res) => {
  try { res.json(await db.deleteProgress(req.user.id, req.params.kind, req.params.refId)); }
  catch (e) { res.status(e.status || 500).json({ error: e.message }); }
});

module.exports = router;
