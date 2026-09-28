import type { AdminOverrides, FeedbackEntry, StudentState } from '../data/types';
import { uid } from './format';

const NS = 'backlog-buddy:';

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(NS + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — ignore */
  }
}

export const STUDENT_DEFAULTS: StudentState = {
  favoriteSubjects: [],
  bookmarkedQuestions: [],
  savedPapers: [],
  completedSubjects: [],
  recentPapers: [],
  checklist: [
    { id: uid('chk'), text: 'Pick your first backlog subject and open its previous papers', done: false, createdAt: new Date().toISOString() },
    { id: uid('chk'), text: 'Solve one full previous year paper under timed conditions', done: false, createdAt: new Date().toISOString() },
    { id: uid('chk'), text: 'Revise the top repeated topics shown on the subject page', done: false, createdAt: new Date().toISOString() },
    { id: uid('chk'), text: 'Download the quick revision sheet for each backlog subject', done: false, createdAt: new Date().toISOString() },
  ],
};

export const EMPTY_OVERRIDES: AdminOverrides = {
  branches: {},
  subjects: {},
  papers: {},
  questions: {},
  materials: {},
};

export function loadStudentState(): StudentState {
  return readJSON<StudentState>('student', STUDENT_DEFAULTS);
}

export function saveStudentState(state: StudentState): void {
  writeJSON('student', state);
}

export function loadAdminOverrides(): AdminOverrides {
  return readJSON<AdminOverrides>('admin', EMPTY_OVERRIDES);
}

export function saveAdminOverrides(o: AdminOverrides): void {
  writeJSON('admin', o);
}

export function loadFeedback(): FeedbackEntry[] {
  return readJSON<FeedbackEntry[]>('feedback', []);
}

export function saveFeedback(list: FeedbackEntry[]): void {
  writeJSON('feedback', list);
}

export function loadTheme(): 'light' | 'dark' {
  return readJSON<'light' | 'dark'>('theme', 'light');
}

export function saveTheme(t: 'light' | 'dark'): void {
  writeJSON('theme', t);
}
