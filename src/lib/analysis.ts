import type { Dataset, Question, Subject } from '../data/types';

/**
 * Repeat analysis over the available previous papers.
 * NOTE: these counts describe history only — they are preparation
 * recommendations, never predictions or guarantees of future exam questions.
 */

export const DISCLAIMER =
  'Preparation recommendation based on analysis of available previous papers. This is not a prediction — exam questions are never guaranteed.';

export interface TopicFrequency {
  topic: string;
  count: number; // total question-appearances across available papers
  questionCount: number;
}

export function topicFrequencies(dataset: Dataset, subjectId: string): TopicFrequency[] {
  const map = new Map<string, TopicFrequency>();
  for (const q of dataset.questions.filter((x) => x.subjectId === subjectId)) {
    const entry = map.get(q.topic) ?? { topic: q.topic, count: 0, questionCount: 0 };
    entry.count += q.appearances.length;
    entry.questionCount += 1;
    map.set(q.topic, entry);
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function topRepeatedQuestions(
  dataset: Dataset,
  subjectId: string | null,
  limit = 8,
): Question[] {
  let qs = dataset.questions;
  if (subjectId) qs = qs.filter((q) => q.subjectId === subjectId);
  return [...qs].sort((a, b) => b.appearances.length - a.appearances.length).slice(0, limit);
}

export function papersContainingQuestion(dataset: Dataset, question: Question): number {
  // appearance history is tracked by academic year in the demo dataset
  return question.appearances.length;
}

export function appearanceText(question: Question): string {
  const n = question.appearances.length;
  if (n === 0) return 'Suggested practice question';
  return `Appeared in ${n} previous paper${n === 1 ? '' : 's'} (${question.appearances.join(', ')})`;
}

export function subjectStats(dataset: Dataset, subject: Subject) {
  const papers = dataset.papers.filter((p) => p.subjectId === subject.id);
  const previous = papers.filter((p) => p.examType !== 'Model');
  const models = papers.filter((p) => p.examType === 'Model');
  const questions = dataset.questions.filter((q) => q.subjectId === subject.id);
  const materials = dataset.materials.filter((m) => m.subjectId === subject.id);
  const repeated = topRepeatedQuestions(dataset, subject.id, 3);
  const years = [...new Set(previous.map((p) => p.year))].sort((a, b) => b - a);
  return { papers, previous, models, questions, materials, repeated, years };
}
