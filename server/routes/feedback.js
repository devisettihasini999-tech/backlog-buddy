'use strict';
const express = require('express');
const db = require('../lib/db');
const router = express.Router();

router.post('/', async (req, res) => {
  const message = String(req.body.message || '').trim();
  const email = String(req.body.email || '').trim();
  if (!message) return res.status(400).json({ error: 'Message is required' });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: 'Invalid email' });
  const stored = await db.saveFeedback({
    name: String(req.body.name || '').slice(0, 120),
    email: email.slice(0, 160),
    branch: String(req.body.branch || '').slice(0, 40),
    topic: String(req.body.topic || '').slice(0, 80),
    code: String(req.body.code || '').slice(0, 40),
    message: message.slice(0, 4000)
  });
  res.status(201).json(Object.assign({ ok: true, id: 'f' + Date.now() }, stored));
});

module.exports = router;
