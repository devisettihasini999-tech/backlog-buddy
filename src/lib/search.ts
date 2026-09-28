import type { Dataset, QuestionPaper, Subject, Question } from '../data/types';

export interface SearchFilters {
  branch?: string;
  semester?: string;
  year?: string;
  regulation?: string;
  examType?: string;
  subject?: string;
}

export interface SearchResults {
  subjects: Subject[];
  questions: Question[];
  papers: QuestionPaper[];
  total: number;
}

function subjectOf(dataset: Dataset, id: string): Subject | undefined {
  return dataset.subjects.find((s) => s.id === id);
}

function matchesFilters(
  dataset: Dataset,
  subjectId: string,
  paper: QuestionPaper | undefined,
  f: SearchFilters,
): boolean {
  const subject = subjectOf(dataset, subjectId);
  if (!subject) return false;
  if (f.branch && f.branch !== 'all' && !subject.branchIds.includes(f.branch)) return false;
  if (f.semester && f.semester !== 'all' && String(subject.semester) !== String(f.semester)) return false;
  if (f.subject && f.subject !== 'all' && subject.id !== f.subject) return false;
  if (f.regulation && f.regulation !== 'all') {
    const reg = paper?.regulation ?? 'R23';
    if (reg !== f.regulation) return false;
  }
  if (f.examType && f.examType !== 'all' && paper && paper.examType !== f.examType) return false;
  if (f.year && f.year !== 'all' && paper && String(paper.year) !== String(f.year)) return false;
  return true;
}

export function searchDataset(
  dataset: Dataset,
  rawQuery: string,
  filters: SearchFilters = {},
): SearchResults {
  const q = rawQuery.trim().toLowerCase();

  const subjects = dataset.subjects.filter((s) => {
    if (!matchesFilters(dataset, s.id, undefined, filters)) return false;
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.topics.some((t) => t.toLowerCase().includes(q))
    );
  });

  const questions = dataset.questions.filter((qu) => {
    if (!matchesFilters(dataset, qu.subjectId, undefined, filters)) return false;
    if (!q) return false;
    return qu.text.toLowerCase().includes(q) || qu.topic.toLowerCase().includes(q);
  });

  const papers = dataset.papers.filter((p) => {
    if (!matchesFilters(dataset, p.subjectId, p, filters)) return false;
    if (!q) return false;
    const subject = subjectOf(dataset, p.subjectId);
    return (
      p.title.toLowerCase().includes(q) ||
      String(p.year).includes(q) ||
      p.examType.toLowerCase().includes(q) ||
      p.regulation.toLowerCase().includes(q) ||
      (subject &&
        (subject.name.toLowerCase().includes(q) || subject.code.toLowerCase().includes(q)))
    );
  });

  return {
    subjects,
    questions,
    papers,
    total: subjects.length + questions.length + papers.length,
  };
}

export function filterPapers(
  dataset: Dataset,
  filters: SearchFilters,
  query = '',
): QuestionPaper[] {
  const q = query.trim().toLowerCase();
  return dataset.papers
    .filter((p) => {
      const subject = subjectOf(dataset, p.subjectId);
      if (!subject) return false;
      if (filters.branch && filters.branch !== 'all' && !subject.branchIds.includes(filters.branch))
        return false;
      if (filters.semester && filters.semester !== 'all' && String(subject.semester) !== String(filters.semester))
        return false;
      if (filters.subject && filters.subject !== 'all' && subject.id !== filters.subject) return false;
      if (filters.year && filters.year !== 'all' && String(p.year) !== String(filters.year)) return false;
      if (filters.examType && filters.examType !== 'all' && p.examType !== filters.examType) return false;
      if (filters.regulation && filters.regulation !== 'all' && p.regulation !== filters.regulation)
        return false;
      if (q) {
        const hay = `${p.title} ${subject.name} ${subject.code} ${p.year} ${p.examType} ${p.regulation} ${p.university}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}
