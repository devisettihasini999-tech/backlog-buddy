/* ============================================================================
   Backlog Buddy — catalog routes (public read)
   ============================================================================ */
'use strict';

const express = require('express');
const db = require('../lib/db');

const router = express.Router();

router.get('/branches', async (req, res) => {
  try { res.json({ branches: await db.getBranches() }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/semesters', async (req, res) => {
  try { res.json({ semesters: await db.getSemesters() }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/subjects', async (req, res) => {
  try {
    const subjects = await db.getSubjects(req.query);
    const papers = await db.getPapers({});
    const questions = await db.getQuestions({});
    const withCounts = subjects.map((s) => ({
      ...s,
      paperCount: papers.filter((p) => p.subject === s.id).length,
      questionCount: questions.filter((q) => q.subject === s.id).length
    }));
    res.json({ subjects: withCounts, total: withCounts.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/subjects/:id', async (req, res) => {
  try {
    const subject = await db.getSubject(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    const [papers, questions, materials, repeated] = await Promise.all([
      db.getPapers({ subject: subject.id }),
      db.getQuestions({ subject: subject.id }),
      db.getMaterials(subject.id),
      db.getRepeated(subject.id)
    ]);
    res.json({ subject, papers, questions, materials, repeated });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/papers', async (req, res) => {
  try {
    const papers = await db.getPapers(req.query);
    res.json({ papers, total: papers.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/papers/:id', async (req, res) => {
  try {
    const all = await db.getPapers({});
    const paper = all.find((p) => p.id === req.params.id);
    if (!paper) return res.status(404).json({ error: 'Paper not found' });
    const [subject, questions] = await Promise.all([
      db.getSubject(paper.subject),
      db.getQuestions({ subject: paper.subject })
    ]);
    const ordered = (paper.qids || []).map((id) => questions.find((q) => q.id === id)).filter(Boolean);
    res.json({ paper, subject, questions: ordered.length ? ordered : questions.slice(0, 10) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/important', async (req, res) => {
  try {
    const subjects = await db.getSubjects(req.query);
    const allowed = new Set(subjects.map((s) => s.id));
    const questions = await db.getQuestions({});
    res.json({
      questions: questions.filter((q) => allowed.has(q.subject)),
      total: questions.length
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/search', async (req, res) => {
  try { res.json({ results: await db.search(req.query.q, 40) }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
