/**
 * Deterministic dataset generator for Backlog Buddy.
 * Used by the app at runtime AND by scripts/make-pdfs.mjs — keep it dependency-free
 * plain JS so Node can import it directly.
 */

export const QUESTION_LABELS = [
  'Very Important',
  'Frequently Asked',
  'Repeated Question',
  'Important Topic',
  'Practice Question',
];

const LABEL_POOL = [
  'Very Important',
  'Very Important',
  'Frequently Asked',
  'Frequently Asked',
  'Repeated Question',
  'Repeated Question',
  'Important Topic',
  'Important Topic',
  'Practice Question',
  'Practice Question',
];

const QUESTION_TEMPLATES = [
  'Define {topic}. Explain its significance in {subject} with a suitable example.',
  'Explain {topic} with a neat diagram/sketch and a suitable example.',
  'Discuss the engineering applications of {topic}.',
  'Write short notes on {topic}.',
  'Compare and contrast the key concepts involved in {topic}.',
  'Describe the working principle of {topic} with necessary equations.',
  'Solve a problem related to {topic}. Show all the steps clearly.',
  'List the advantages and limitations of {topic}. Explain any two in detail.',
  'How is {topic} implemented? Give an algorithm / procedure and explain.',
  'Derive the expression related to {topic} and explain each term.',
];

export function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function pick(rand, arr) {
  return arr[Math.floor(rand() * arr.length) % arr.length];
}

function uploadedOn(year, examType) {
  if (examType === 'Regular') return `${year}-06-12`;
  if (examType === 'Supplementary') return year >= 2026 ? '2026-09-05' : `${year}-11-24`;
  if (examType === 'Mid-Term') return `${year}-03-18`;
  return `${year}-12-10`;
}

/**
 * @param {object} seed  parsed src/data/seed.json
 * @returns {object} full dataset
 */
export function buildDataset(seed) {
  const semesters = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    label: `${i + 1}${['st', 'nd', 'rd'][i] || 'th'} Semester`,
  }));

  const papers = [];
  const questions = [];
  const materials = [];

  for (const subject of seed.subjects) {
    const rand = rng(hashStr(subject.id + '::papers'));
    const subjectHash = hashStr(subject.id);
    const regulation = seed.regulations[subjectHash % seed.regulations.length];
    const university = seed.universities[subjectHash % seed.universities.length];

    /* ---------- previous year question papers ---------- */
    const plan = [
      { year: 2023, examType: 'Regular', keep: true },
      { year: 2024, examType: 'Regular', keep: true },
      { year: 2024, examType: 'Supplementary', keep: rand() > 0.35 },
      { year: 2025, examType: 'Regular', keep: true },
      { year: 2025, examType: 'Supplementary', keep: rand() > 0.3 },
      { year: 2025, examType: 'Mid-Term', keep: rand() > 0.65 },
      { year: 2026, examType: 'Regular', keep: true },
      { year: 2026, examType: 'Supplementary', keep: rand() > 0.45 },
      { year: 2026, examType: 'Mid-Term', keep: rand() > 0.75 },
    ];
    for (const p of plan) {
      if (!p.keep) continue;
      const id = `${subject.id}-${p.year}-${slug(p.examType)}`;
      papers.push({
        id,
        subjectId: subject.id,
        title: `${subject.name} — ${p.examType} Examination, ${p.year}`,
        year: p.year,
        examType: p.examType,
        regulation,
        university,
        duration: p.examType === 'Mid-Term' ? '90 Minutes' : '3 Hours',
        maxMarks: p.examType === 'Mid-Term' ? 30 : 70,
        pages: p.examType === 'Mid-Term' ? 1 : 2,
        pdfUrl: `/papers/${id}.pdf`,
        uploadedAt: uploadedOn(p.year, p.examType),
      });
    }

    /* ---------- model question papers ---------- */
    for (let m = 1; m <= 2; m++) {
      const id = `${subject.id}-model-${m}`;
      papers.push({
        id,
        subjectId: subject.id,
        title: `Model Question Paper ${m} — ${subject.name} (Latest Pattern)`,
        year: 2026,
        examType: 'Model',
        regulation,
        university,
        duration: '3 Hours',
        maxMarks: 70,
        pages: 2,
        pdfUrl: `/papers/${id}.pdf`,
        uploadedAt: '2026-07-15',
      });
    }

    /* ---------- questions (unit-wise, labelled) ---------- */
    const authored = (seed.flagshipQuestions && seed.flagshipQuestions[subject.id]) || [];
    subject.topics.forEach((topic, idx) => {
      const unit = idx + 1;
      const authoredHere = authored.filter((q) => q.unit === unit);
      for (const q of authoredHere) {
        questions.push({
          id: `${subject.id}-q${questions.filter((x) => x.subjectId === subject.id).length + 1}`,
          subjectId: subject.id,
          unit,
          topic: q.topic || topic,
          text: q.text,
          label: q.label,
          appearances: q.appearances,
        });
      }
      const fill = 3 - authoredHere.length;
      for (let k = 0; k < fill; k++) {
        const qrand = rng(hashStr(`${subject.id}::${unit}::${k}`));
        const template = pick(qrand, QUESTION_TEMPLATES);
        const text = template.replace(/\{topic\}/g, topic).replace(/\{subject\}/g, subject.name);
        const label = pick(qrand, LABEL_POOL);
        let count = 1 + Math.floor(qrand() * 4); // 1..4 appearances
        if (label === 'Very Important' && count < 3) count = 3 + Math.floor(qrand() * 2);
        const years = [2023, 2024, 2025, 2026];
        const appearances = [];
        for (const y of years) {
          if (appearances.length < count && qrand() > 0.45) appearances.push(y);
        }
        while (appearances.length < count) {
          const y = years[appearances.length % years.length];
          if (!appearances.includes(y)) appearances.push(y);
          else break;
        }
        appearances.sort();
        questions.push({
          id: `${subject.id}-q${questions.filter((x) => x.subjectId === subject.id).length + 1}`,
          subjectId: subject.id,
          unit,
          topic,
          text,
          label,
          appearances,
        });
      }
    });

    /* ---------- study materials ---------- */
    materials.push(
      {
        id: `${subject.id}-m-notes`,
        subjectId: subject.id,
        title: `${subject.name} — Unit-wise Lecture Notes`,
        type: 'notes',
        description: `Condensed notes covering all five units: ${subject.topics.join(', ')}.`,
        pdfUrl: `/papers/${subject.id}-notes.pdf`,
        uploadedAt: '2026-07-01',
      },
      {
        id: `${subject.id}-m-revision`,
        subjectId: subject.id,
        title: `${subject.name} — Quick Revision & Formula Sheet`,
        type: 'guide',
        description: 'Last-day revision guide with key definitions, formulas and diagrams checklist.',
        pdfUrl: `/papers/${subject.id}-revision.pdf`,
        uploadedAt: '2026-07-01',
      },
      {
        id: `${subject.id}-m-syllabus`,
        subjectId: subject.id,
        title: `${subject.name} — Syllabus & Reference Books`,
        type: 'syllabus',
        description: 'Unit-wise syllabus, recommended reference books and question paper pattern.',
        pdfUrl: `/papers/${subject.id}-syllabus.pdf`,
        uploadedAt: '2026-07-01',
      },
    );
  }

  return {
    branches: seed.branches,
    semesters,
    subjects: seed.subjects,
    papers,
    questions,
    materials,
    tips: seed.prepTips,
  };
}

/** Per-subject preparation tips, built from analysis of available papers. */
export function subjectTips(dataset, subjectId) {
  const base = dataset.tips.default || [];
  const qs = dataset.questions.filter((q) => q.subjectId === subjectId);
  const topicScore = {};
  for (const q of qs) {
    topicScore[q.topic] = (topicScore[q.topic] || 0) + q.appearances.length;
  }
  const top = Object.entries(topicScore)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const extra = top.map(
    ([topic, score]) =>
      `Prioritise "${topic}" — its related questions appeared ${score} times across the available papers for this subject.`,
  );
  return [...extra, ...base];
}

/** Lines for generated PDFs — consumed by scripts/generate_pdfs.py via manifest. */
export function buildPdfManifest(seed) {
  const dataset = buildDataset(seed);
  const manifest = [];

  for (const paper of dataset.papers) {
    const subject = dataset.subjects.find((s) => s.id === paper.subjectId);
    const qs = dataset.questions.filter((q) => q.subjectId === paper.subjectId);
    const isModel = paper.examType === 'Model';
    const header = [
      paper.university,
      isModel
        ? `MODEL QUESTION PAPER (${paper.regulation} PATTERN)`
        : `${String(paper.examType).toUpperCase()} EXAMINATION — ${paper.year}`,
      paper.title,
      `Subject Code: ${subject.code}    Semester: ${subject.semester}    Regulation: ${paper.regulation}`,
      `Time: ${paper.duration}    Max. Marks: ${paper.maxMarks}`,
      '..............................................................................',
      'Note: This is a demo question paper generated for Backlog Buddy.',
      'Answer all questions. Assume suitable data wherever necessary.',
      '..............................................................................',
    ];
    const body = [];
    let qn = 1;
    for (let unit = 1; unit <= 5; unit++) {
      body.push(`SECTION ${String.fromCharCode(64 + unit)}  (Unit ${unit}: ${subject.topics[unit - 1]})`);
      const unitQs = qs.filter((q) => q.unit === unit).slice(0, 3);
      for (const q of unitQs) {
        body.push(`${qn}. ${q.text}   [${q.label === 'Practice Question' ? 8 : 12} Marks]`);
        qn++;
      }
      body.push('');
    }
    body.push('*** End of Question Paper ***');
    manifest.push({ file: paper.id + '.pdf', title: paper.title, lines: [...header, ...body] });
  }

  for (const m of dataset.materials) {
    const subject = dataset.subjects.find((s) => s.id === m.subjectId);
    const lines = [
      'BACKLOG BUDDY — STUDY MATERIAL',
      m.title,
      `Subject Code: ${subject.code}    Semester: ${subject.semester}`,
      '..............................................................................',
      m.description,
      '',
    ];
    subject.topics.forEach((topic, i) => {
      lines.push(`Unit ${i + 1}: ${topic}`);
      lines.push(`  - Definition, key concepts and significance of ${topic}`);
      lines.push(`  - Important diagrams / derivations / algorithms for ${topic}`);
      lines.push(`  - Solved examples and previous-year questions on ${topic}`);
      lines.push('');
    });
    lines.push('Exam Tips:');
    for (const t of dataset.tips.default.slice(0, 5)) lines.push(`  * ${t}`);
    lines.push('');
    lines.push('Disclaimer: Sample study material for preparation support only.');
    lines.push('Appearance counts are based on available papers and are not exam predictions.');
    manifest.push({ file: m.id.replace(/-m-/, '-') + '.pdf', title: m.title, lines });
  }

  return manifest;
}
