import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Flame,
  GraduationCap,
  Layers,
  Library,
  Star,
  Target,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { appearanceText, subjectStats, topicFrequencies, DISCLAIMER } from '../lib/analysis';
import { cx, pluralize } from '../lib/format';
import {
  Badge,
  CardSkeletonGrid,
  EmptyState,
  LABEL_COLORS,
  PaperCard,
  QuestionCard,
  SectionHeader,
} from '../components/ui';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <Layers size={16} /> },
  { id: 'papers', label: 'Previous Papers', icon: <FileText size={16} /> },
  { id: 'important', label: 'Important Questions', icon: <Flame size={16} /> },
  { id: 'units', label: 'Unit-wise Questions', icon: <BookOpen size={16} /> },
  { id: 'models', label: 'Model Papers', icon: <Target size={16} /> },
  { id: 'materials', label: 'Study Materials', icon: <Library size={16} /> },
  { id: 'tips', label: 'Preparation Tips', icon: <GraduationCap size={16} /> },
];

export function SubjectDetailPage() {
  const { subjectId } = useParams();
  const { dataset, loading, student, toggleFavoriteSubject, toggleCompletedSubject, tipsFor } = useApp();
  const [tab, setTab] = useState('overview');
  const [openUnits, setOpenUnits] = useState<Record<number, boolean>>({ 1: true });

  const subject = dataset.subjects.find((s) => s.id === subjectId);

  useEffect(() => {
    setTab('overview');
  }, [subjectId]);

  const stats = useMemo(
    () => (subject ? subjectStats(dataset, subject) : null),
    [dataset, subject],
  );
  const freq = useMemo(
    () => (subject ? topicFrequencies(dataset, subject.id) : []),
    [dataset, subject],
  );
  const tips = useMemo(() => (subject ? tipsFor(subject.id) : []), [subject, tipsFor]);

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <CardSkeletonGrid count={3} />
        </div>
      </section>
    );
  }

  if (!subject || !stats) {
    return (
      <section className="section">
        <div className="container">
          <EmptyState
            title="Subject not found"
            message="This subject may have been renamed or removed. Browse the full subject list to find what you need."
            action={
              <Link className="btn btn-primary" to="/subjects">
                Browse subjects
              </Link>
            }
          />
        </div>
      </section>
    );
  }

  const fav = student.favoriteSubjects.includes(subject.id);
  const completed = student.completedSubjects.includes(subject.id);
  const branches = dataset.branches.filter((b) => subject.branchIds.includes(b.id));

  return (
    <section className="section">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/subjects">Subjects</Link>
          <ChevronRight size={14} />
          <Link to={`/subjects?branch=${subject.branchIds[0] ?? 'all'}`}>
            {branches[0]?.short ?? 'Branch'}
          </Link>
          <ChevronRight size={14} />
          <span className="muted">{subject.name}</span>
        </nav>

        {/* Header card */}
        <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--hero-grad)' }}>
          <div className="row-between" style={{ alignItems: 'flex-start' }}>
            <div style={{ maxWidth: '720px' }}>
              <div className="row" style={{ gap: '0.55rem', marginBottom: '0.75rem' }}>
                <Badge color="blue">{subject.code}</Badge>
                <Badge color="slate">{subject.semester} Semester</Badge>
                <Badge color="slate">{subject.credits} Credits</Badge>
                {subject.flagship && <Badge color="amber">High demand</Badge>}
              </div>
              <h1 style={{ fontSize: 'clamp(1.55rem, 3.2vw, 2.3rem)', marginBottom: '0.55rem' }}>
                {subject.name}
              </h1>
              <p style={{ margin: 0 }}>
                {pluralize(stats.previous.length, 'previous paper')},{' '}
                {pluralize(stats.questions.length, 'important question')} and{' '}
                {pluralize(stats.materials.length, 'study material')} available for backlog preparation.
                {stats.years.length > 0 && ` Papers covered: ${stats.years.join(', ')}.`}
              </p>
            </div>
            <div className="stack" style={{ gap: '0.55rem', minWidth: 190 }}>
              <button className="btn btn-secondary" onClick={() => toggleFavoriteSubject(subject.id)}>
                <Star size={16} fill={fav ? 'var(--amber)' : 'none'} color={fav ? 'var(--amber)' : 'currentColor'} />
                {fav ? 'Saved to favourites' : 'Save to favourites'}
              </button>
              <button
                className={cx('btn', completed ? 'btn-soft' : 'btn-primary')}
                onClick={() => toggleCompletedSubject(subject.id)}
              >
                <CheckCircle2 size={16} />
                {completed ? 'Marked complete' : 'Mark subject complete'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" role="tablist" style={{ marginBottom: '1.55rem' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={cx('tab', tab === t.id && 'active')}
              onClick={() => setTab(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ---------- Overview ---------- */}
        {tab === 'overview' && (
          <div className="stack" style={{ gap: '1.35rem' }}>
            <div className="grid grid-4">
              {[
                { icon: <FileText size={20} />, v: stats.previous.length, l: 'Previous papers', bg: 'var(--primary-soft)', c: 'var(--primary)' },
                { icon: <Flame size={20} />, v: stats.questions.length, l: 'Important questions', bg: 'var(--amber-soft)', c: 'var(--amber)' },
                { icon: <Target size={20} />, v: stats.models.length, l: 'Model papers', bg: 'var(--violet-soft)', c: 'var(--violet)' },
                { icon: <Library size={20} />, v: stats.materials.length, l: 'Study materials', bg: 'var(--green-soft)', c: 'var(--green)' },
              ].map((s) => (
                <div className="stat-card" key={s.l}>
                  <div className="stat-icon" style={{ background: s.bg, color: s.c }}>
                    {s.icon}
                  </div>
                  <div>
                    <div className="stat-value">{s.v}</div>
                    <div className="stat-label">{s.l}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-2">
              <div className="card">
                <h3>Unit-wise important topics</h3>
                <p className="small">
                  Topics ordered by how often related questions appeared in the available papers.
                </p>
                <div className="stack" style={{ gap: '0.85rem' }}>
                  {freq.map((tf) => (
                    <div key={tf.topic}>
                      <div className="row-between" style={{ marginBottom: 5 }}>
                        <span className="small" style={{ fontWeight: 680, color: 'var(--text)' }}>
                          {tf.topic}
                        </span>
                        <span className="small muted">{tf.count} appearances</span>
                      </div>
                      <div className="freq-bar">
                        <span style={{ width: `${Math.min(100, (tf.count / Math.max(1, freq[0]?.count || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3>Frequently repeated questions</h3>
                <p className="small">Top questions from the repeat analysis for this subject.</p>
                <div className="stack" style={{ gap: '0.85rem' }}>
                  {stats.repeated.map((q) => (
                    <div key={q.id} style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '0.85rem' }}>
                      <div className="row" style={{ gap: '0.4rem', marginBottom: 4 }}>
                        <Badge color={LABEL_COLORS[q.label]}>{q.label}</Badge>
                        <span className="small muted">{appearanceText(q)}</span>
                      </div>
                      <div className="small" style={{ fontWeight: 600, color: 'var(--text)' }}>
                        {q.text}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-soft btn-sm" style={{ marginTop: '1.1rem' }} onClick={() => setTab('important')}>
                  View all important questions <ChevronRight size={15} />
                </button>
              </div>
            </div>

            <div className="card">
              <h3>Syllabus snapshot</h3>
              <div className="topic-tags" style={{ marginTop: '0.75rem' }}>
                {subject.topics.map((t, i) => (
                  <span className="topic-tag" key={t} style={{ fontSize: '0.86rem', padding: '0.42rem 0.85rem' }}>
                    Unit {i + 1} · {t}
                  </span>
                ))}
              </div>
              <div className="row" style={{ marginTop: '1.25rem' }}>
                {branches.map((b) => (
                  <Badge key={b.id} color="slate">
                    {b.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="alert alert-warning">
              <AlertTriangle size={19} />
              <div>
                <strong>Reminder:</strong> {DISCLAIMER}
              </div>
            </div>
          </div>
        )}

        {/* ---------- Previous papers ---------- */}
        {tab === 'papers' && (
          <>
            <div className="row-between" style={{ marginBottom: '1.15rem' }}>
              <p style={{ margin: 0 }}>
                {pluralize(stats.previous.length, 'previous year question paper')} for {subject.name} (
                {subject.code}).
              </p>
              <Link className="btn btn-secondary btn-sm" to={`/papers?subject=${subject.id}`}>
                Open in paper library
              </Link>
            </div>
            {stats.previous.length === 0 ? (
              <EmptyState
                icon={<FileText size={26} />}
                title="No previous papers uploaded yet"
                message="Papers for this subject have not been uploaded. Check back soon — administrators can add papers from the admin panel."
              />
            ) : (
              <div className="grid grid-3">
                {stats.previous.map((p) => (
                  <PaperCard key={p.id} paper={p} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ---------- Important questions ---------- */}
        {tab === 'important' && (
          <>
            <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
              <AlertTriangle size={19} />
              <div>{DISCLAIMER}</div>
            </div>
            <div className="grid grid-2">
              {[...stats.questions]
                .sort((a, b) => b.appearances.length - a.appearances.length)
                .map((q) => (
                  <QuestionCard key={q.id} question={q} showSubject={false} />
                ))}
            </div>
          </>
        )}

        {/* ---------- Unit-wise ---------- */}
        {tab === 'units' && (
          <div className="stack">
            {subject.topics.map((topic, idx) => {
              const unit = idx + 1;
              const qs = stats.questions.filter((q) => q.unit === unit);
              const open = openUnits[unit];
              return (
                <div className="card" key={topic} style={{ padding: 0, overflow: 'hidden' }}>
                  <button
                    className="row-between"
                    style={{
                      width: '100%',
                      padding: '1.15rem 1.35rem',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text)',
                      textAlign: 'left',
                    }}
                    onClick={() => setOpenUnits((o) => ({ ...o, [unit]: !o[unit] }))}
                    aria-expanded={open}
                  >
                    <div className="row" style={{ gap: '0.8rem' }}>
                      <div className="step-num" style={{ width: 38, height: 38, fontSize: '0.95rem' }}>
                        {unit}
                      </div>
                      <div>
                        <div style={{ fontWeight: 750 }}>
                          Unit {unit}: {topic}
                        </div>
                        <div className="small muted">{pluralize(qs.length, 'question')} · from previous papers</div>
                      </div>
                    </div>
                    <ChevronDown
                      size={19}
                      color="var(--text-3)"
                      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                    />
                  </button>
                  {open && (
                    <div style={{ padding: '0 1.35rem 1.35rem' }} className="stack">
                      {qs.length === 0 ? (
                        <p className="small muted" style={{ margin: 0 }}>
                          No curated questions for this unit yet. Use your class notes and the model papers
                          meanwhile.
                        </p>
                      ) : (
                        qs.map((q) => <QuestionCard key={q.id} question={q} showSubject={false} />)
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ---------- Model papers ---------- */}
        {tab === 'models' && (
          <>
            <p style={{ marginBottom: '1.15rem' }}>
              Model question papers follow the latest exam pattern — perfect for timed practice before your
              supplementary exam.
            </p>
            {stats.models.length === 0 ? (
              <EmptyState
                icon={<Target size={26} />}
                title="No model papers yet"
                message="Model papers for this subject will appear here once they are added."
              />
            ) : (
              <div className="grid grid-2">
                {stats.models.map((p) => (
                  <PaperCard key={p.id} paper={p} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ---------- Study materials ---------- */}
        {tab === 'materials' && (
          <>
            <p style={{ marginBottom: '1.15rem' }}>
              Downloadable study material curated for quick, exam-focused revision of {subject.name}.
            </p>
            {stats.materials.length === 0 ? (
              <EmptyState
                icon={<Library size={26} />}
                title="No study material yet"
                message="Notes and guides for this subject have not been uploaded. Check back soon."
              />
            ) : (
              <div className="grid grid-3">
                {stats.materials.map((m) => (
                  <div className="card card-hover" key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="row" style={{ gap: '0.55rem' }}>
                      <div
                        className="feature-icon"
                        style={{
                          margin: 0,
                          width: 42,
                          height: 42,
                          borderRadius: 11,
                          background:
                            m.type === 'notes'
                              ? 'var(--primary-soft)'
                              : m.type === 'guide'
                                ? 'var(--amber-soft)'
                                : 'var(--green-soft)',
                          color: m.type === 'notes' ? 'var(--primary)' : m.type === 'guide' ? 'var(--amber)' : 'var(--green)',
                        }}
                      >
                        <BookOpen size={19} />
                      </div>
                      <Badge color="slate">{m.type}</Badge>
                    </div>
                    <h3 style={{ fontSize: '1rem', margin: 0 }}>{m.title}</h3>
                    <p className="small" style={{ margin: 0, flex: 1 }}>
                      {m.description}
                    </p>
                    <a className="btn btn-primary btn-sm" href={m.pdfUrl} download>
                      <Download size={15} /> Download PDF
                    </a>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ---------- Tips ---------- */}
        {tab === 'tips' && (
          <div className="grid grid-2">
            <div className="card">
              <h3>Exam preparation tips for {subject.name}</h3>
              <ul className="list-check" style={{ marginTop: '1.15rem' }}>
                {tips.map((t) => (
                  <li key={t}>
                    <CheckCircle2 size={17} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="stack">
              <div className="card">
                <h3>Suggested 7-day sprint plan</h3>
                <ol className="stack" style={{ paddingLeft: '1.2rem', gap: '0.55rem', marginTop: '1rem' }}>
                  {[
                    'Day 1–2: Cover Unit 1 & 2 concepts and their repeated questions.',
                    'Day 3: Cover Unit 3, make a formula/definition sheet.',
                    'Day 4: Cover Unit 4 & 5 at exam speed.',
                    'Day 5: Solve a full previous paper in 3 hours.',
                    'Day 6: Attempt a model paper and evaluate honestly.',
                    'Day 7: Revise mistakes, diagrams and the quick revision sheet.',
                  ].map((d) => (
                    <li key={d} className="small" style={{ color: 'var(--text-2)' }}>
                      {d}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="alert alert-info">
                <Bookmark size={19} />
                <div>
                  Bookmark the toughest questions from the “Important Questions” tab — they will show up in
                  your dashboard for last-mile revision.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
