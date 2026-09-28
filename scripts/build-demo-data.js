#!/usr/bin/env node
/* ==========================================================================
   Backlog Buddy — demo data builder
   Generates assets/js/data.js (demo dataset) and static sample PDFs.
   Run: node scripts/build-demo-data.js
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const PDF = require('../assets/js/pdf.js');
const C = require('./catalog.js');

const ROOT = path.join(__dirname, '..');
const OUT_JS = path.join(ROOT, 'assets', 'js', 'data.js');
const PAPERS_DIR = path.join(ROOT, 'papers');

const YEARS = [2026, 2025, 2024, 2023];
const EXAM_TYPES = ['Regular', 'Supplementary', 'Backlog', 'Makeup'];
const UNIVERSITY = {
  cse: 'JNTUK', aiml: 'JNTUK', ds: 'JNTUK', it: 'JNTUK',
  ece: 'Andhra University', eee: 'JNTUK', mech: 'JNTUK', civil: 'JNTUK', other: 'JNTUK'
};

/* ---------- helpers ---------- */
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const pick = (arr, i) => arr[i % arr.length];
const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };

const POOL_MATCH = [
  [/data warehous|big data|time series|recommender|data engineer/i, 'bigdata'],
  [/data structure/i, 'ds'],
  [/database|dbms|sql/i, 'dbms'],
  [/operating system/i, 'os'],
  [/network|wireless|communication|antenna|microwave|optical|satellite|radar/i, 'networks'],
  [/machine learning|reinforcement/i, 'ml'],
  [/artificial intelligence|nlp|computer vision|deep learning/i, 'ai'],
  [/web technolog|full stack|html/i, 'web'],
  [/cloud|devops|virtualization/i, 'cloud'],
  [/secur|cryptography|ethical|hacking/i, 'security'],
  [/signal/i, 'signals'],
  [/control system/i, 'control'],
  [/digital design|digital logic|pulse|digital signal|vlsi|embedded/i, 'digital'],
  [/computer organization|microprocessor|microcontroller/i, 'co'],
  [/analog|electronic device|amplifier/i, 'analog'],
  [/design & analysis of algorithm|algorithm/i, 'algorithms'],
  [/software engineering|software testing|software process/i, 'se'],
  [/theory of computation|automata|formal language/i, 'toc'],
  [/electromagnetic|antenna|transmission line|waveguide/i, 'emt'],
  [/power electronics|drives|rectifier|inverter/i, 'pe'],
  [/power system|switchgear|protection|high voltage|smart grid|energy/i, 'power'],
  [/electrical machine|machines/i, 'machines'],
  [/measurement|instrumentation|metrology|transducer/i, 'measurements'],
  [/thermodynamic|refrigeration|air condition|hvac/i, 'thermo'],
  [/heat transfer/i, 'heat'],
  [/fluid|hydraulic|hydrolog|turbomach/i, 'fluids'],
  [/material science|metallurgy/i, 'materials'],
  [/manufacturing|machine drawing|cad|cam|welding|casting|forging/i, 'mfg'],
  [/kinematics|dynamics of machinery|mechanism/i, 'dom'],
  [/design of machine/i, 'dme'],
  [/strength of material|mechanics of solid|solid mechanic/i, 'civil_solids'],
  [/structural analysis|structural/i, 'structures'],
  [/geotechnical|soil|foundation/i, 'geo'],
  [/reinforced|rc structure|prestress|concrete technology/i, 'rcc'],
  [/steel structure/i, 'steel'],
  [/survey/i, 'surveying'],
  [/environmental|pollution|sewage|water treatment|solid waste/i, 'env'],
  [/transportation|highway|railway|airport|pavement/i, 'transport'],
  [/building material|construction management|masonry|estimation|costing/i, 'construction'],
  [/mathematic|linear algebra|discrete|statistic|probability|transform|calculus/i, 'math'],
  [/physics/i, 'physics'],
  [/chemistr/i, 'chemistry'],
  [/programming|python|java|c programming/i, 'programming'],
  [/english|communication skill|human values|technical writing|presentation|seminar/i, 'human'],
  [/ethic|professional|intellectual|rights|safety/i, 'ethics'],
  [/management|entrepreneur|operation|quality|project|economics|economics & management|total quality/i, 'management'],
  [/object oriented/i, 'oop'],
  [/engineering mechanic|engineering graphic|basic electrical|basic electronic|elements of civil/i, 'misc']
];

function poolFor(name) {
  for (const [re, key] of POOL_MATCH) if (re.test(name)) return key;
  return 'misc';
}

/* ---------- build subjects ---------- */
const branches = C.BRANCHES.map((b) => ({ ...b, regulation: b.id === 'aiml' || b.id === 'ds' ? 'R23' : 'R20', university: UNIVERSITY[b.id] || 'JNTUK' }));
const subjects = [];
const subjectById = new Map();

C.BRANCHES.forEach((b) => {
  const list = C.CATALOG[b.id] || {};
  for (let sem = 1; sem <= 8; sem++) {
    let rows = [];
    if (C.FIRST_YEAR[sem]) rows = C.FIRST_YEAR[sem].map((r) => [...r]);
    else if (list[sem]) rows = list[sem];
    rows.forEach(([code, name, credits]) => {
      const featured = C.FEATURED[code];
      const poolKey = featured ? null : poolFor(name);
      const pool = C.UNIT_POOLS[poolKey] || C.UNIT_POOLS.misc;
      const units = featured
        ? featured.units.map((u, i) => ({ n: i + 1, title: u.title, topics: u.topics }))
        : pool.slice(0, 5).map((t, i) => ({ n: i + 1, title: t, topics: [] }));
      const id = b.id + '-' + code.toLowerCase();
      const sub = {
        id,
        branch: b.id,
        branchCode: b.code,
        sem,
        code,
        name,
        credits: credits || 3,
        regulation: b.regulation || 'R20',
        university: UNIVERSITY[b.id] || 'JNTUK',
        desc: featured
          ? featured.desc
          : `${name} (${code}) is offered in the ${sem}th semester of ${b.name}. Unit-wise important topics, previous question papers and model papers are available below.`,
        units,
        featured: !!featured,
        paperCount: 0,
        questionCount: 0
      };
      subjects.push(sub);
      subjectById.set(id, sub);
    });
  }
});

/* ---------- questions ---------- */
const questions = [];
const TAG_POOL = ['vi', 'fa', 'it', 'pq', 'rq'];
let qSeq = 0;

subjects.forEach((sub) => {
  const featured = C.FEATURED[sub.code];
  if (featured) {
    featured.questions.forEach(([text, unit, tags, topic, years], i) => {
      questions.push({
        id: 'q' + (++qSeq),
        subject: sub.id,
        unit,
        text,
        topic,
        tags,
        years: years.slice().sort((a, b) => b - a),
        marks: tags.includes('vi') ? 10 : 5
      });
    });
    return;
  }
  // generated questions from unit topics / titles
  const templates = [
    (t) => `Explain ${t} with suitable examples.`,
    (t) => `Write short notes on ${t}.`,
    (t) => `Describe ${t} and discuss its applications.`,
    (t) => `Compare ${t} with closely related concepts.`,
    (t) => `Discuss the design and analysis aspects of ${t}.`,
    (t) => `Explain the working principle of ${t} with a neat diagram.`
  ];
  sub.units.forEach((u) => {
    const topics = u.topics.length ? u.topics : [u.title, u.title + ' - advanced concepts'];
    const n = 2;
    for (let i = 0; i < Math.min(n, topics.length + 1); i++) {
      const topic = topics[i % topics.length];
      const tpl = templates[(hash(sub.code + u.n + i) + i) % templates.length];
      const tags = [];
      if (i === 0) tags.push('vi');
      if (i === 1) tags.push('fa');
      if (hash(sub.code + u.n + i) % 4 === 0) tags.push('rq');
      if (!tags.length) tags.push('pq');
      const baseYears = YEARS.filter((y) => (hash(sub.code + u.n + i + y) % 3) !== 0);
      questions.push({
        id: 'q' + (++qSeq),
        subject: sub.id,
        unit: u.n,
        text: tpl(topic),
        topic,
        tags: Array.from(new Set(tags)),
        years: baseYears.length ? baseYears : [2025],
        marks: tags.includes('vi') ? 10 : 5
      });
    }
  });
});

/* ---------- papers ---------- */
const papers = [];
const materials = [];
let pSeq = 0, mSeq = 0;
const today = new Date('2026-09-20T10:00:00Z');

function paperQuestions(sub, year, examType) {
  const pool = questions.filter((q) => q.subject === sub.id);
  const prefer = pool.filter((q) => q.years.includes(year));
  const use = prefer.length >= 8 ? prefer : pool;
  const byUnit = {};
  use.forEach((q) => { (byUnit[q.unit] = byUnit[q.unit] || []).push(q); });
  const chosen = [];
  Object.keys(byUnit).sort().forEach((u) => {
    const arr = byUnit[u];
    chosen.push(arr[0], arr[1 % arr.length]);
  });
  return chosen.slice(0, 10);
}

subjects.forEach((sub) => {
  const featured = !!C.FEATURED[sub.code];
  const yrs = featured ? YEARS : [2025, 2024, 2023];
  const types = featured ? ['Regular', 'Supplementary'] : ['Regular', 'Supplementary'];
  const branchObj = branches.find((b) => b.id === sub.branch);

  yrs.forEach((year) => {
    types.forEach((examType) => {
      if (!featured && examType === 'Supplementary' && year !== 2025) return;
      const qids = paperQuestions(sub, year, examType).map((q) => q.id);
      if (!qids.length) return;
      const id = 'p' + (++pSeq);
      const daysAgo = hash(sub.code + year + examType) % 500;
      const uploaded = new Date(today.getTime() - daysAgo * 86400000).toISOString();
      const staticFile = featured && examType === 'Regular' && year >= 2024
        ? `papers/${sub.branch}-${sub.code.toLowerCase()}-${year}-regular.pdf`
        : null;
      papers.push({
        id,
        title: `${sub.name} - ${year} ${examType} Examination`,
        subject: sub.id,
        subjectName: sub.name,
        code: sub.code,
        branch: sub.branch,
        branchCode: sub.branchCode,
        branchName: branchObj.name,
        sem: sub.sem,
        year,
        examType,
        regulation: sub.regulation,
        university: sub.university,
        marks: 60,
        duration: '3 hours',
        file: staticFile,
        uploadedAt: uploaded,
        downloads: hash(id) % 900,
        views: hash(id + 'v') % 2400,
        qids
      });
    });
  });

  /* study materials */
  const mk = (title, type, extra) => {
    materials.push(Object.assign({
      id: 'm' + (++mSeq), subject: sub.id, subjectName: sub.name, code: sub.code,
      branch: sub.branch, sem: sub.sem, title, type, size: (60 + (mSeq % 240)) + ' KB',
      addedAt: new Date(today.getTime() - (mSeq % 200) * 86400000).toISOString(),
      url: null, content: null
    }, extra || {}));
  };
  mk(`${sub.code} Syllabus (${sub.regulation})`, 'Syllabus');
  mk(`${sub.name} - Unit wise notes`, 'Notes');
  mk(featured ? `${sub.name} - Important questions with answers` : `${sub.name} - Model question paper`, 'Important Questions');
  mk(`${sub.name} - Formula sheet & key definitions`, 'Formula Sheet');
  mk(`${sub.name} - Previous question papers bundle`, 'Question Papers');
  if (featured) mk(`${sub.name} - NPTEL video lectures`, 'Video', { url: 'https://nptel.ac.in/courses' });
});

/* ---------- repeated topic analysis ---------- */
const repeatedBySubject = {};
subjects.forEach((sub) => {
  const qs = questions.filter((q) => q.subject === sub.id);
  const byTopic = {};
  qs.forEach((q) => {
    const key = (q.topic || q.text).toLowerCase();
    byTopic[key] = byTopic[key] || { topic: q.topic || q.text, unit: q.unit, papers: new Set(), questions: 0, years: new Set() };
    q.years.forEach((y) => byTopic[key].years.add(y));
    byTopic[key].papers.add(q.subject + '-' + q.years.join(','));
    byTopic[key].questions += 1;
  });
  repeatedBySubject[sub.id] = Object.values(byTopic)
    .map((t) => ({ topic: t.topic, unit: t.unit, papers: t.years.size, questions: t.questions, years: Array.from(t.years).sort((a, b) => b - a) }))
    .filter((t) => t.papers >= 2)
    .sort((a, b) => b.papers - a.papers || b.questions - a.questions);
});

/* ---------- index stats ---------- */
const stats = {
  branches: branches.length,
  semesters: C.SEMESTERS.length,
  subjects: subjects.length,
  papers: papers.length,
  questions: questions.length,
  materials: materials.length,
  years: YEARS,
  examTypes: EXAM_TYPES
};

/* ---------- write data.js (compact wire format, decoded on the client) ---------- */
const payload = {
  meta: {
    name: 'Backlog Buddy',
    tagline: 'Prepare Smart. Clear Your Backlogs.',
    version: '1.0.0',
    mode: 'demo',
    generatedAt: new Date().toISOString(),
    disclaimer: 'Important questions, frequently asked questions and repeated topics are preparation recommendations derived from the previous question papers available on this platform. They are not a prediction or guarantee of questions that will appear in any examination.'
  },
  branches: branches.map((b) => [b.id, b.code, b.name, b.icon, b.tone, b.blurb, b.regulation, b.university]),
  semesters: C.SEMESTERS.map((s) => [s.n, s.label, s.note]),
  subjects: subjects.map((s) => [s.id, s.branch, s.sem, s.code, s.name, s.credits, s.regulation, s.university, s.desc,
    s.units.map((u) => [u.n, u.title, u.topics]), s.featured ? 1 : 0]),
  questions: questions.map((q) => [q.id, q.subject, q.unit, q.text, q.topic, q.tags, q.years, q.marks]),
  papers: papers.map((p) => [p.id, p.subject, p.year, p.examType, p.file, p.uploadedAt, p.downloads, p.qids]),
  materials: materials.map((m) => [m.id, m.subject, m.title, m.type, m.size, m.url, m.addedAt]),
  repeated: Object.keys(repeatedBySubject).map((k) => [k, repeatedBySubject[k].map((t) => [t.topic, t.unit, t.papers, t.questions, t.years])]),
  stats
};

const js = '/* Generated by scripts/build-demo-data.js - compact demo dataset for Backlog Buddy */\n' +
  'window.BB_DATA = ' + JSON.stringify(payload) + ';\n';
fs.writeFileSync(OUT_JS, js);

/* ---------- static sample PDFs ---------- */
if (!fs.existsSync(PAPERS_DIR)) fs.mkdirSync(PAPERS_DIR, { recursive: true });
const featuredSubs = subjects.filter((s) => s.featured);
let pdfCount = 0;
featuredSubs.forEach((sub) => {
  [2026, 2025, 2024].forEach((year) => {
    const paper = papers.find((p) => p.subject === sub.id && p.year === year && p.examType === 'Regular');
    if (!paper) return;
    const qs = paper.qids.map((id) => questions.find((q) => q.id === id)).filter(Boolean);
    const b = new PDF.Builder({ title: `${sub.code} ${sub.name} ${year}` });
    b.h1('Backlog Buddy');
    b.small('Demonstration question paper generated from available previous papers - for practice only').space(4);
    b.rule();
    b.text('B.Tech. ' + (sub.sem % 2 ? 'I' : 'II') + ' Semester Examination, ' + year, { size: 11.5, bold: true, align: 'center' });
    b.text('Regulation: ' + sub.regulation + '   |   University: ' + sub.university, { size: 9.5, align: 'center', gap: 8 });
    b.h2(sub.name + '  (' + sub.code + ')');
    b.text('Time: 3 hours                                                                 Max. Marks: 60', { size: 10, bold: true });
    b.text('Answer one question from each unit. All questions carry equal marks.', { size: 9.5, gap: 8 });
    const byUnit = {};
    qs.forEach((q) => { (byUnit[q.unit] = byUnit[q.unit] || []).push(q); });
    Object.keys(byUnit).sort((a, b2) => a - b2).forEach((u) => {
      b.need(60);
      b.h2('UNIT - ' + u + '   [' + (sub.units[+u - 1] ? sub.units[+u - 1].title : '') + ']');
      byUnit[u].forEach((q, i) => b.p((byUnit[u].length > 1 ? (i === 0 ? 'a) ' : 'b) ') : '') + q.text));
      b.space(6);
    });
    b.rule();
    b.small('Backlog Buddy - previous question paper library. This paper is reconstructed from previous examination papers available on the platform and is intended for practice only.');
    const file = path.join(PAPERS_DIR, `${sub.branch}-${sub.code.toLowerCase()}-${year}-regular.pdf`);
    fs.writeFileSync(file, Buffer.from(b.toBytes()));
    pdfCount++;
  });
});

console.log('subjects   :', subjects.length);
console.log('questions  :', questions.length);
console.log('papers     :', papers.length);
console.log('materials  :', materials.length);
console.log('static pdfs:', pdfCount);
console.log('output     :', path.relative(ROOT, OUT_JS), (fs.statSync(OUT_JS).size / 1024).toFixed(1) + ' KB');
