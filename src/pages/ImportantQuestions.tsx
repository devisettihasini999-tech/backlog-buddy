import { useMemo, useState } from 'react';
import { Flame, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { QuestionLabel } from '../data/types';
import { CardSkeletonGrid, DisclaimerBanner, EmptyState, QuestionCard, SectionHeader } from '../components/ui';

const LABELS: Array<QuestionLabel | 'all'> = [
  'all',
  'Very Important',
  'Frequently Asked',
  'Repeated Question',
  'Important Topic',
  'Practice Question',
];

export function ImportantQuestionsPage() {
  const { dataset, loading } = useApp();
  const [branch, setBranch] = useState('all');
  const [semester, setSemester] = useState('all');
  const [subject, setSubject] = useState('all');
  const [label, setLabel] = useState<QuestionLabel | 'all'>('all');
  const [query, setQuery] = useState('');

  const subjects = useMemo(
    () =>
      dataset.subjects
        .filter((s) => (branch === 'all' ? true : s.branchIds.includes(branch)))
        .filter((s) => (semester === 'all' ? true : String(s.semester) === semester))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [dataset, branch, semester],
  );

  const questions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dataset.questions
      .filter((qu) => {
        const s = dataset.subjects.find((x) => x.id === qu.subjectId);
        if (!s) return false;
        if (branch !== 'all' && !s.branchIds.includes(branch)) return false;
        if (semester !== 'all' && String(s.semester) !== semester) return false;
        if (subject !== 'all' && s.id !== subject) return false;
        if (label !== 'all' && qu.label !== label) return false;
        if (q && !(qu.text.toLowerCase().includes(q) || qu.topic.toLowerCase().includes(q))) return false;
        return true;
      })
      .sort((a, b) => b.appearances.length - a.appearances.length)
      .slice(0, 60);
  }, [dataset, branch, semester, subject, label, query]);

  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Important questions"
          title="Prepare with a clear priority list"
          subtitle="Questions are labelled using an analysis of the available previous papers: how often a question or topic has appeared, and how important it is for revision."
        />

        <div style={{ marginBottom: '1.55rem' }}>
          <DisclaimerBanner />
        </div>

        <div className="card" style={{ marginBottom: '1.65rem' }}>
          <div className="row" style={{ gap: '0.55rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.05rem' }}>
            <SlidersHorizontal size={17} color="var(--primary)" /> Refine the list
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '0.95rem' }}>
            <div className="field">
              <label htmlFor="iq-branch">Branch</label>
              <select id="iq-branch" className="select" value={branch} onChange={(e) => {
                setBranch(e.target.value);
                setSubject('all');
              }}>
                <option value="all">All branches</option>
                {dataset.branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="iq-sem">Semester</label>
              <select id="iq-sem" className="select" value={semester} onChange={(e) => {
                setSemester(e.target.value);
                setSubject('all');
              }}>
                <option value="all">All semesters</option>
                {dataset.semesters.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="iq-sub">Subject</label>
              <select id="iq-sub" className="select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="all">All subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="iq-label">Label</label>
              <select
                id="iq-label"
                className="select"
                value={label}
                onChange={(e) => setLabel(e.target.value as QuestionLabel | 'all')}
              >
                {LABELS.map((l) => (
                  <option key={l} value={l}>
                    {l === 'all' ? 'All labels' : l}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="iq-q">Search question / topic</label>
              <input
                id="iq-q"
                className="input"
                placeholder="e.g. stack, normalization..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="row" style={{ gap: '0.55rem', marginTop: '1.15rem' }}>
            {LABELS.map((l) => (
              <button
                key={l}
                className={`chip${label === l ? ' active' : ''}`}
                onClick={() => setLabel(l)}
              >
                {l === 'all' ? 'All' : l}
              </button>
            ))}
          </div>
        </div>

        <div className="row-between" style={{ marginBottom: '1.15rem' }}>
          <div className="small muted" style={{ fontWeight: 650 }}>
            {loading ? 'Loading questions…' : `Showing ${questions.length} prioritised questions`}
          </div>
          <div className="row small muted" style={{ gap: '0.45rem' }}>
            <Flame size={15} color="var(--amber)" /> Sorted by number of past appearances
          </div>
        </div>

        {loading ? (
          <CardSkeletonGrid count={4} />
        ) : questions.length === 0 ? (
          <EmptyState
            icon={<Flame size={26} />}
            title="No questions match these filters"
            message="Try a different subject or label, or clear the search box to see the full prioritised list."
            action={
              <button
                className="btn btn-primary"
                onClick={() => {
                  setBranch('all');
                  setSemester('all');
                  setSubject('all');
                  setLabel('all');
                  setQuery('');
                }}
              >
                Reset filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-2">
            {questions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
