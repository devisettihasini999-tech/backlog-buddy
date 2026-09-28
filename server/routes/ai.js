/* ============================================================================
   Backlog Buddy — AI route (Gemini is called here, never from the browser)
   ============================================================================ */
'use strict';

const express = require('express');
const ai = require('../lib/ai');
const auth = require('../lib/auth');

const router = express.Router();

const PRESETS = {
  explain: (text) => 'Explain this engineering exam question and show how to answer it well:\n\n' + text,
  summarise: (text) => 'Summarise the following topic into short revision bullet points:\n\n' + text,
  plan: (text) => 'Create a 3 day revision plan for a student who has a backlog exam on this subject:\n\n' + text,
  answer: (text) => 'Write a model exam answer (about 150 words) for:\n\n' + text
};

router.post('/generate', async (req, res) => {
  try {
    const mode = String(req.body.mode || 'explain');
    const raw = String(req.body.prompt || req.body.text || '').trim();
    if (!raw) return res.status(400).json({ error: 'Prompt is required' });
    const prompt = (PRESETS[mode] || PRESETS.explain)(raw);
    const result = await ai.generate(prompt, mode);
    res.json(result);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'AI request failed', detail: e.detail });
  }
});

/* Optional: keep a generated summary on a personal backlog item */
router.post('/items/:id/summarise', auth.requireUser, async (req, res) => {
  try {
    const db = require('../lib/db');
    const items = await db.listItems(req.user.id);
    const item = items.find((i) => String(i.id) === String(req.params.id));
    if (!item) return res.status(404).json({ error: 'Item not found' });
    const result = await ai.generate(PRESETS.summarise(item.title + '\n' + (item.description || '')), 'summarise');
    const updated = await db.updateItem(req.user.id, item.id, { ai_summary: result.answer });
    res.json({ item: updated, source: result.source });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'AI request failed' });
  }
});

module.exports = router;
