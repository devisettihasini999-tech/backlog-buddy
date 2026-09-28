/** Core data model: Branch → Semester → Subject → Question Papers → Questions → Study Materials */

export type QuestionLabel =
  | 'Very Important'
  | 'Frequently Asked'
  | 'Repeated Question'
  | 'Important Topic'
  | 'Practice Question';

export interface Branch {
  id: string;
  code: string;
  name: string;
  short: string;
  tagline: string;
  accent: string;
}

export interface Semester {
  id: number;
  label: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  branchIds: string[];
  semester: number;
  credits: number;
  topics: string[];
  flagship?: boolean;
}

export type ExamType = 'Regular' | 'Supplementary' | 'Mid-Term' | 'Model';

export interface QuestionPaper {
  id: string;
  subjectId: string;
  title: string;
  year: number;
  examType: ExamType;
  regulation: string;
  university: string;
  duration: string;
  maxMarks: number;
  pages: number;
  pdfUrl: string;
  uploadedAt: string;
}

export interface Question {
  id: string;
  subjectId: string;
  unit: number;
  topic: string;
  text: string;
  label: QuestionLabel;
  appearances: number[]; // academic years this question appeared in (from available papers)
}

export type MaterialType = 'notes' | 'guide' | 'syllabus' | 'lab';

export interface StudyMaterial {
  id: string;
  subjectId: string;
  title: string;
  type: MaterialType;
  description: string;
  pdfUrl: string;
  uploadedAt: string;
}

export interface Dataset {
  branches: Branch[];
  semesters: Semester[];
  subjects: Subject[];
  papers: QuestionPaper[];
  questions: Question[];
  materials: StudyMaterial[];
  tips: Record<string, string[]>;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

export interface StudentState {
  favoriteSubjects: string[];
  bookmarkedQuestions: string[];
  savedPapers: string[];
  completedSubjects: string[];
  recentPapers: string[];
  checklist: ChecklistItem[];
}

export interface FeedbackEntry {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  createdAt: string;
}

export interface AdminOverrides {
  branches: Record<string, Branch | null>;
  subjects: Record<string, Subject | null>;
  papers: Record<string, QuestionPaper | null>;
  questions: Record<string, Question | null>;
  materials: Record<string, StudyMaterial | null>;
}
