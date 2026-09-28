import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Download,
  FileText,
  Flame,
  GraduationCap,
  Layers,
  Library,
  SearchCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { topRepeatedQuestions, topicFrequencies, appearanceText } from '../lib/analysis';
import { pluralize } from '../lib/format';
import { Badge, DisclaimerBanner, PaperCard, SearchBar, SectionHeader, SubjectCard } from '../components/ui';

export function HomePage() {
  const { dataset } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const stats = useMemo(
    () => ({
      subjects: dataset.subjects.length,
      papers: dataset.papers.filter((p) => p.examType !== 'Model').length,
      questions: dataset.questions.length,
      branches: dataset.branches.length,
    }),
    [dataset],
  );

  const hotQuestions = useMemo(() => topRepeatedQuestions(dataset, null, 3), [dataset]);
  const flagship = useMemo(
    () => dataset.subjects.filter((s) => s.flagship).slice(0, 6),
    [dataset],
  );
  const recentPapers = useMemo(
    () =>
      [...dataset.papers]
        .filter((p) => p.examType !== 'Model')
        .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1))
        .slice(0, 3),
    [dataset],
  );
  const topTopics = useMemo(() => {
    const merged = new Map<string, number>();
    for (const s of dataset.subjects.slice(0, 30)) {
      for (const tf of topicFrequencies(dataset, s.id)) {
        merged.set(tf.topic, (merged.get(tf.topic) ?? 0) + tf.count);
      }
    }
    return [...merged.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [dataset]);

  const search = () => navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search');

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">
              <Sparkles size={14} /> For engineering students with backlogs
            </div>
            <h1>
              Welcome to <span className="grad-text">Backlog Buddy</span>
            </h1>
            <p style={{ fontSize: '1.28rem', fontWeight: 650, color: 'var(--text)', margin: '0 0 0.65rem' }}>
              Prepare Smart. Clear Your Backlogs.
            </p>
            <p className="lead">
              Your one-stop study platform for engineering backlog preparation. Find previous question
              papers, important questions, repeated topics, model papers and study resources — organized
              subject by subject.
            </p>

            <div className="hero-search">
              <SearchBar
                large
                value={query}
                onChange={setQuery}
                onSubmit={search}
                placeholder="Search subject, subject code, or question..."
              />
            </div>
            <div className="hero-hints">
              <span>Try:</span>
              {['Data Structures', 'CS401', 'Operating Systems', '2025 papers'].map((h) => (
                <button key={h} className="chip" onClick={() => navigate(`/search?q=${encodeURIComponent(h)}`)}>
                  {h}
                </button>
              ))}
            </div>

            <div className="row" style={{ marginTop: '1.65rem' }}>
              <Link className="btn btn-primary btn-lg" to="/subjects">
                <BookOpen size={18} /> Explore Subjects
              </Link>
              <Link className="btn btn-secondary btn-lg" to="/papers">
                <FileText size={18} /> Find Previous Papers
              </Link>
              <Link className="btn btn-ghost btn-lg" to="/important">
                <Flame size={18} /> Important Questions
              </Link>
              <Link className="btn btn-ghost btn-lg" to="/resources">
                <Library size={18} /> Study Resources
              </Link>
            </div>

            <div className="row" style={{ marginTop: '1.85rem', gap: '1.4rem' }}>
              {[
                { v: stats.papers, l: 'Previous papers' },
                { v: stats.subjects, l: 'Subjects' },
                { v: stats.questions, l: 'Important questions' },
                { v: `${stats.branches}×8`, l: 'Branches × semesters' },
              ].map((s) => (
                <div key={s.l}>
                  <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>
                    {s.v}
                  </div>
                  <div className="small muted" style={{ fontWeight: 600 }}>
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-panel">
              <div className="row-between" style={{ marginBottom: '1rem' }}>
                <div className="row" style={{ gap: '0.55rem' }}>
                  <span className="mini-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', width: 38, height: 38, borderRadius: 10, display: 'grid', placeItems: 'center' }}>
                    <TrendingUp size={19} />
                  </span>
                  <div>
                    <div style={{ fontWeight: 750, color: 'var(--text)', fontSize: '0.95rem' }}>
                      Repeated-topic analysis
                    </div>
                    <div className="small muted">Based on available papers</div>
                  </div>
                </div>
                <Badge color="amber">Live</Badge>
              </div>
              {hotQuestions.map((q, i) => {
                const subject = dataset.subjects.find((s) => s.id === q.subjectId);
                return (
                  <div className="hero-mini" key={q.id}>
                    <div
                      className="mini-icon"
                      style={{
                        background: i === 0 ? 'var(--amber-soft)' : 'var(--primary-soft)',
                        color: i === 0 ? 'var(--amber)' : 'var(--primary)',
                      }}
                    >
                      <Flame size={17} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 680, fontSize: '0.87rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {q.topic} — appeared in {q.appearances.length} papers
                      </div>
                      <div className="small muted">{subject?.name}</div>
                      <div className="freq-bar" style={{ marginTop: 6 }}>
                        <span style={{ width: `${Math.min(100, q.appearances.length * 25)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="small muted" style={{ marginTop: '0.95rem', textAlign: 'center' }}>
                Preparation guidance only — never a prediction of future papers.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Quick actions ---------------- */}
      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Quick actions"
            title="Everything you need to clear a backlog"
            subtitle="Jump straight into the section you need — no clutter, no confusion."
          />
          <div className="grid grid-4">
            {[
              {
                icon: <BookOpen size={22} />,
                color: 'var(--primary)',
                bg: 'var(--primary-soft)',
                title: 'Browse Subjects',
                text: 'Pick your branch and semester to find every subject with papers and questions.',
                to: '/subjects',
              },
              {
                icon: <FileText size={22} />,
                color: 'var(--accent)',
                bg: 'var(--primary-soft)',
                title: 'Previous Question Papers',
                text: 'Filter by year, exam type, regulation and university. View or download instantly.',
                to: '/papers',
              },
              {
                icon: <Flame size={22} />,
                color: 'var(--amber)',
                bg: 'var(--amber-soft)',
                title: 'Important Questions',
                text: 'Prioritised questions with labels and repeat counts from previous papers.',
                to: '/important',
              },
              {
                icon: <Library size={22} />,
                color: 'var(--violet)',
                bg: 'var(--violet-soft)',
                title: 'Study Resources',
                text: 'Notes, formula sheets, syllabus copies and preparation guidance.',
                to: '/resources',
              },
            ].map((c) => (
              <Link key={c.title} to={c.to} className="card card-hover card-link">
                <div className="feature-icon" style={{ background: c.bg, color: c.color }}>
                  {c.icon}
                </div>
                <h3>{c.title}</h3>
                <p className="small" style={{ margin: 0 }}>
                  {c.text}
                </p>
                <div className="row" style={{ marginTop: '1rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                  Open <ArrowRight size={15} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Branches ---------------- */}
      <section className="section section-alt">
        <div className="container">
          <SectionHeader
            eyebrow="Branch selection"
            title="Select your branch"
            subtitle="Every branch is mapped to its semester-wise subjects, papers and study material."
            action={
              <Link className="btn btn-secondary" to="/subjects">
                View all subjects <ArrowRight size={16} />
              </Link>
            }
          />
          <div className="grid grid-3">
            {dataset.branches.map((b) => {
              const count = dataset.subjects.filter((s) => s.branchIds.includes(b.id)).length;
              return (
                <Link key={b.id} to={`/subjects?branch=${b.id}`} className="card card-hover card-link branch-card">
                  <div className="row-between">
                    <div
                      className="branch-code"
                      style={{
                        background:
                          b.accent === 'violet'
                            ? 'var(--violet)'
                            : b.accent === 'cyan'
                              ? 'var(--accent)'
                              : b.accent === 'amber'
                                ? 'var(--amber)'
                                : b.accent === 'orange'
                                  ? '#e2711d'
                                  : b.accent === 'green'
                                    ? 'var(--green)'
                                    : b.accent === 'teal'
                                      ? '#0f766e'
                                      : b.accent === 'indigo'
                                        ? '#4f46e5'
                                        : b.accent === 'slate'
                                          ? '#475569'
                                          : 'var(--primary)',
                      }}
                    >
                      {b.code}
                    </div>
                    <ArrowRight size={18} className="arrow" color="var(--primary)" />
                  </div>
                  <h3 style={{ marginTop: '0.85rem', marginBottom: '0.3rem' }}>{b.name}</h3>
                  <p className="small" style={{ margin: 0 }}>
                    {b.tagline}
                  </p>
                  <div className="row" style={{ marginTop: '0.95rem' }}>
                    <Badge color="slate">{pluralize(count, 'subject')}</Badge>
                    <Badge color="blue">8 semesters</Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="section">
        <div className="container">
          <SectionHeader eyebrow="How it works" title="From backlog to cleared — in 4 steps" />
          <div className="grid grid-4">
            {[
              { t: 'Select branch & semester', d: 'Open the subject list filtered for your branch and the semester you have a backlog in.' },
              { t: 'Study the repeat analysis', d: 'See which topics and questions appeared most often across the available previous papers.' },
              { t: 'Practise previous papers', d: 'View or download papers year-wise and attempt them like a real exam.' },
              { t: 'Track your preparation', d: 'Use the dashboard checklist to finish topics and mark subjects complete.' },
            ].map((s, i) => (
              <div className="card" key={s.t}>
                <div className="step-num">{i + 1}</div>
                <h3 style={{ marginTop: '1rem' }}>{s.t}</h3>
                <p className="small" style={{ margin: 0 }}>
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Popular subjects ---------------- */}
      <section className="section section-alt">
        <div className="container">
          <SectionHeader
            eyebrow="Most used"
            title="Popular subjects for backlog preparation"
            subtitle="High-traffic subjects across branches — start here if you are not sure."
            action={
              <Link className="btn btn-secondary" to="/subjects">
                Browse all <ArrowRight size={16} />
              </Link>
            }
          />
          <div className="grid grid-3">
            {flagship.map((s) => (
              <SubjectCard key={s.id} subject={s} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Repeated topics spotlight ---------------- */}
      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Repeat analysis"
            title="Frequently repeated topics across papers"
            subtitle="Counts are computed from the available previous papers in our library."
          />
          <div className="card">
            <div className="stack">
              {topTopics.map(([topic, count]) => (
                <div key={topic} className="row-between" style={{ gap: '1rem' }}>
                  <div className="row" style={{ gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    <SearchCheck size={19} color="var(--primary)" style={{ flex: 'none' }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 680, color: 'var(--text)' }}>
                        {topic} — appeared in {count} previous paper question{count === 1 ? '' : 's'}
                      </div>
                      <div className="freq-bar" style={{ marginTop: 6 }}>
                        <span style={{ width: `${Math.min(100, count * 6)}%` }} />
                      </div>
                    </div>
                  </div>
                  <Badge color="amber">{count}× seen</Badge>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.35rem' }}>
              <DisclaimerBanner />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Recent papers ---------------- */}
      <section className="section section-alt">
        <div className="container">
          <SectionHeader
            eyebrow="Question paper library"
            title="Recently added papers"
            action={
              <Link className="btn btn-secondary" to="/papers">
                Full library <ArrowRight size={16} />
              </Link>
            }
          />
          <div className="grid grid-3">
            {recentPapers.map((p) => (
              <PaperCard key={p.id} paper={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="section">
        <div className="container">
          <div className="cta-band">
            <h2>Ready to clear your backlogs?</h2>
            <p>
              Create your personal dashboard to bookmark questions, save papers, track completed
              subjects and follow a preparation checklist built for backlog exams.
            </p>
            <div className="row" style={{ justifyContent: 'center', marginTop: '1.55rem' }}>
              <Link className="btn btn-primary btn-lg" to="/dashboard">
                <GraduationCap size={19} /> Open Student Dashboard
              </Link>
              <Link className="btn btn-secondary btn-lg" to="/papers">
                <Download size={19} /> Download Previous Papers
              </Link>
            </div>
            <div className="row" style={{ justifyContent: 'center', marginTop: '1.35rem', gap: '1.25rem', opacity: 0.92 }}>
              {[
                { icon: <Bookmark size={15} />, t: 'Bookmark system' },
                { icon: <CheckCircle2 size={15} />, t: 'Progress tracking' },
                { icon: <Layers size={15} />, t: 'Unit-wise topics' },
              ].map((f) => (
                <span key={f.t} className="row" style={{ gap: '0.45rem', color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                  {f.icon} {f.t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export { appearanceText };
