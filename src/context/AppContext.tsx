import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import seedData from '../data/seed.json';
import { buildDataset, subjectTips } from '../data/generator';
import type {
  AdminOverrides,
  Branch,
  Dataset,
  FeedbackEntry,
  Question,
  QuestionPaper,
  StudyMaterial,
  Subject,
  StudentState,
} from '../data/types';
import {
  EMPTY_OVERRIDES,
  STUDENT_DEFAULTS,
  loadAdminOverrides,
  loadFeedback,
  loadStudentState,
  loadTheme,
  saveAdminOverrides,
  saveFeedback,
  saveStudentState,
  saveTheme,
} from '../lib/storage';
import { fetchRemoteDataset, type RemoteStatus } from '../lib/supabase';
import { uid } from '../lib/format';

type Collection = 'branches' | 'subjects' | 'papers' | 'questions' | 'materials';
type Entity = Branch | Subject | QuestionPaper | Question | StudyMaterial;

interface Toast {
  id: string;
  message: string;
  kind: 'info' | 'success' | 'error';
}

interface AppContextValue {
  dataset: Dataset;
  loading: boolean;
  remoteStatus: RemoteStatus;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  student: StudentState;
  toggleFavoriteSubject: (id: string) => void;
  toggleBookmarkQuestion: (id: string) => void;
  toggleSavedPaper: (id: string) => void;
  toggleCompletedSubject: (id: string) => void;
  addRecentPaper: (id: string) => void;
  addChecklistItem: (text: string) => void;
  toggleChecklistItem: (id: string) => void;
  removeChecklistItem: (id: string) => void;
  toasts: Toast[];
  toast: (message: string, kind?: Toast['kind']) => void;
  dismissToast: (id: string) => void;
  admin: {
    overrides: AdminOverrides;
    upsert: (collection: Collection, entity: Entity) => void;
    remove: (collection: Collection, id: string) => void;
    reset: () => void;
    exportJSON: () => string;
  };
  feedback: FeedbackEntry[];
  addFeedback: (entry: Omit<FeedbackEntry, 'id' | 'createdAt'>) => void;
  tipsFor: (subjectId: string) => string[];
}

const AppContext = createContext<AppContextValue | null>(null);

const seedTyped = seedData as unknown as {
  universities: string[];
  regulations: string[];
  branches: Branch[];
  subjects: Subject[];
  flagshipQuestions: Record<
    string,
    { unit: number; topic: string; text: string; label: Question['label']; appearances: number[] }[]
  >;
  prepTips: Record<string, string[]>;
};

const baseDataset = buildDataset(seedTyped as never) as Dataset;

function applyOverrides<T extends { id: string }>(base: T[], record: Record<string, T | null>): T[] {
  const out: T[] = [];
  for (const item of base) {
    const o = record[item.id];
    if (o === null) continue;
    out.push(o ?? item);
  }
  for (const [id, value] of Object.entries(record)) {
    if (value !== null && !base.some((b) => b.id === id)) out.push(value);
  }
  return out;
}

function normalizeRemote(rows: {
  branches?: Record<string, unknown>[];
  subjects?: Record<string, unknown>[];
  papers?: Record<string, unknown>[];
  questions?: Record<string, unknown>[];
  materials?: Record<string, unknown>[];
}): Partial<Dataset> {
  return {
    branches: (rows.branches ?? []).map((b) => ({
      id: String(b.id),
      code: String(b.code ?? ''),
      name: String(b.name ?? ''),
      short: String(b.short ?? b.name ?? ''),
      tagline: String(b.tagline ?? ''),
      accent: String(b.accent ?? 'blue'),
    })),
    subjects: (rows.subjects ?? []).map((s) => ({
      id: String(s.id),
      code: String(s.code ?? ''),
      name: String(s.name ?? ''),
      branchIds: (s.branch_ids as string[]) ?? [],
      semester: Number(s.semester ?? 1),
      credits: Number(s.credits ?? 3),
      topics: (s.topics as string[]) ?? [],
      flagship: Boolean(s.flagship),
    })),
    papers: (rows.papers ?? []).map((p) => ({
      id: String(p.id),
      subjectId: String(p.subject_id ?? ''),
      title: String(p.title ?? ''),
      year: Number(p.year ?? 2026),
      examType: (p.exam_type as QuestionPaper['examType']) ?? 'Regular',
      regulation: String(p.regulation ?? 'R23'),
      university: String(p.university ?? ''),
      duration: String(p.duration ?? '3 Hours'),
      maxMarks: Number(p.max_marks ?? 70),
      pages: Number(p.pages ?? 2),
      pdfUrl: String(p.pdf_url ?? ''),
      uploadedAt: String(p.uploaded_at ?? new Date().toISOString().slice(0, 10)),
    })),
    questions: (rows.questions ?? []).map((q) => ({
      id: String(q.id),
      subjectId: String(q.subject_id ?? ''),
      unit: Number(q.unit ?? 1),
      topic: String(q.topic ?? ''),
      text: String(q.text ?? ''),
      label: (q.label as Question['label']) ?? 'Practice Question',
      appearances: (q.appearances as number[]) ?? [],
    })),
    materials: (rows.materials ?? []).map((m) => ({
      id: String(m.id),
      subjectId: String(m.subject_id ?? ''),
      title: String(m.title ?? ''),
      type: (m.type as StudyMaterial['type']) ?? 'notes',
      description: String(m.description ?? ''),
      pdfUrl: String(m.pdf_url ?? ''),
      uploadedAt: String(m.uploaded_at ?? new Date().toISOString().slice(0, 10)),
    })),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadTheme());
  const [student, setStudent] = useState<StudentState>(() => loadStudentState());
  const [overrides, setOverrides] = useState<AdminOverrides>(() => loadAdminOverrides());
  const [feedback, setFeedback] = useState<FeedbackEntry[]>(() => loadFeedback());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [remote, setRemote] = useState<Partial<Dataset> | null>(null);
  const [loading, setLoading] = useState(true);
  const [remoteStatus, setRemoteStatus] = useState<RemoteStatus>('checking');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    let alive = true;
    fetchRemoteDataset()
      .then((data) => {
        if (!alive) return;
        if (data) {
          setRemote(normalizeRemote(data));
          setRemoteStatus('connected');
        } else {
          setRemoteStatus('demo');
        }
      })
      .catch(() => {
        if (alive) setRemoteStatus('demo');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => saveStudentState(student), [student]);
  useEffect(() => saveAdminOverrides(overrides), [overrides]);
  useEffect(() => saveFeedback(feedback), [feedback]);

  const toast = useCallback((message: string, kind: Toast['kind'] = 'info') => {
    const id = uid('toast');
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const dataset: Dataset = useMemo(() => {
    const base: Dataset = remote
      ? {
          branches: remote.branches?.length ? remote.branches : baseDataset.branches,
          semesters: baseDataset.semesters,
          subjects: remote.subjects?.length ? remote.subjects : baseDataset.subjects,
          papers: remote.papers?.length ? remote.papers : baseDataset.papers,
          questions: remote.questions?.length ? remote.questions : baseDataset.questions,
          materials: remote.materials?.length ? remote.materials : baseDataset.materials,
          tips: baseDataset.tips,
        }
      : baseDataset;
    return {
      branches: applyOverrides(base.branches, overrides.branches),
      semesters: base.semesters,
      subjects: applyOverrides(base.subjects, overrides.subjects),
      papers: applyOverrides(base.papers, overrides.papers),
      questions: applyOverrides(base.questions, overrides.questions),
      materials: applyOverrides(base.materials, overrides.materials),
      tips: base.tips,
    };
  }, [remote, overrides]);

  const toggleList = useCallback(
    (key: keyof StudentState, id: string, label: string, noun: string) => {
      setStudent((s) => {
        const list = s[key] as string[];
        const exists = list.includes(id);
        return { ...s, [key]: exists ? list.filter((x) => x !== id) : [...list, id] };
      });
      toast(`${label} ${noun}`, 'success');
    },
    [toast],
  );

  const value: AppContextValue = {
    dataset,
    loading,
    remoteStatus,
    theme,
    toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    student,
    toggleFavoriteSubject: (id) =>
      toggleList('favoriteSubjects', id, id, 'toggled in favourite subjects'),
    toggleBookmarkQuestion: (id) =>
      toggleList('bookmarkedQuestions', id, 'Question', 'bookmark updated'),
    toggleSavedPaper: (id) => toggleList('savedPapers', id, 'Paper', 'saved list updated'),
    toggleCompletedSubject: (id) =>
      toggleList('completedSubjects', id, 'Subject', 'completion updated'),
    addRecentPaper: (id) =>
      setStudent((s) => ({
        ...s,
        recentPapers: [id, ...s.recentPapers.filter((x) => x !== id)].slice(0, 12),
      })),
    addChecklistItem: (text) =>
      setStudent((s) => ({
        ...s,
        checklist: [
          { id: uid('chk'), text, done: false, createdAt: new Date().toISOString() },
          ...s.checklist,
        ],
      })),
    toggleChecklistItem: (id) =>
      setStudent((s) => ({
        ...s,
        checklist: s.checklist.map((c) => (c.id === id ? { ...c, done: !c.done } : c)),
      })),
    removeChecklistItem: (id) =>
      setStudent((s) => ({ ...s, checklist: s.checklist.filter((c) => c.id !== id) })),
    toasts,
    toast,
    dismissToast,
    admin: {
      overrides,
      upsert: (collection, entity) => {
        const key =
          collection === 'papers'
            ? 'papers'
            : collection === 'questions'
              ? 'questions'
              : collection === 'materials'
                ? 'materials'
                : collection === 'subjects'
                  ? 'subjects'
                  : 'branches';
        setOverrides((o) => ({ ...o, [key]: { ...o[key], [entity.id]: entity as never } }));
        toast('Saved successfully (demo data store)', 'success');
      },
      remove: (collection, id) => {
        const key =
          collection === 'papers'
            ? 'papers'
            : collection === 'questions'
              ? 'questions'
              : collection === 'materials'
                ? 'materials'
                : collection === 'subjects'
                  ? 'subjects'
                  : 'branches';
        setOverrides((o) => ({ ...o, [key]: { ...o[key], [id]: null } }));
        toast('Entry deleted', 'success');
      },
      reset: () => {
        setOverrides(EMPTY_OVERRIDES);
        toast('Demo data restored to defaults', 'success');
      },
      exportJSON: () => JSON.stringify(dataset, null, 2),
    },
    feedback,
    addFeedback: (entry) => {
      setFeedback((f) => [
        { ...entry, id: uid('fb'), createdAt: new Date().toISOString() },
        ...f,
      ]);
    },
    tipsFor: (subjectId) => subjectTips(dataset, subjectId),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

export { STUDENT_DEFAULTS };
