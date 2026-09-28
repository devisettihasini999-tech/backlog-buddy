import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Bookmark,
  CheckCircle2,
  ClipboardList,
  FileText,
  History,
  LayoutDashboard,
  Plus,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cx, pluralize } from '../lib/format';
import { Badge, EmptyState, PaperCard, QuestionCard, SectionHeader, SubjectCard } from '../components/ui';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { id: 'favorites', label: 'Favourite Subjects', icon: <Star size={16} /> },
  { id: 'bookmarks', label: 'Bookmarked Questions', icon: <Bookmark size={16} /> },
  { id: 'saved', label: 'Saved Papers', icon: <FileText size={16} /> },
  { id: 'recent', label: 'Recently Viewed', icon: <History size={16} /> },
  { id: 'checklist', label: 'Prep Checklist', icon: <ClipboardList size={16} /> },
];

export function DashboardPage() {
  const { dataset, student, toggleChecklistItem, addChecklistItem, removeChecklistItem, toggleCompletedSubject } =
    useApp();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'overview';
  const [newItem, setNewItem] = useState('');

  const setTab = (id: string) => {
    const next = new URLSearchParams(params);
    next.set('tab', id);
    setParams(next, { replace: true });
  };

  const favSubjects = dataset.subjects.filter((s) => student.favoriteSubjects.includes(s.id));
  const bookmarked = dataset.questions.filter((q) => student.bookmarkedQuestions.includes(q.id));
  const savedPapers = dataset.papers.filter((p) => student.savedPapers.includes(p.id));
  const recentPapers = student.recentPapers
    .map((id) => dataset.papers.find((p) => p.id === id))
    .filter(Boolean) as typeof dataset.papers;
  const completed = dataset.subjects.filter((s) => student.completedSubjects.includes(s.id));

  const progress = useMemo(() => {
    const total = student.checklist.length || 1;
    const done = student.checklist.filter((c) => c.done).length;
    return { done, total, pct: Math.round((done / total) * 100) };
  }, [student.checklist]);

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim().length < 3) return;
    addChecklistItem(newItem.trim());
    setNewItem('');
  };

  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Student dashboard"
          title="Your backlog preparation hub"
          subtitle="Everything you save — subjects, questions, papers and your personal checklist — stays organised here on this device."
          action={
            <div className="row">
              <Badge color="blue">{pluralize(student.favoriteSubjects.length, 'favourite')}</Badge>
              <Badge color="violet">{pluralize(student.bookmarkedQuestions.length, 'bookmark')}</Badge>
              <Badge color="green">
                {progress.done}/{progress.total} checklist
              </Badge>
            </div>
          }
        />

        <div className="dash-layout">
          <nav className="side-nav card" style={{ padding: '0.65rem' }} aria-label="Dashboard sections">
            {TABS.map((t) => (
              <button key={t.id} className={cx(tab === t.id && 'active')} onClick={() => setTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </nav>

          <div>
            {tab === 'overview' && (
              <div className="stack" style={{ gap: '1.35rem' }}>
                <div className="grid grid-4">
                  {[
                    { icon: <Star size={20} />, v: favSubjects.length, l: 'Favourite subjects', bg: 'var(--amber-soft)', c: 'var(--amber)' },
                    { icon: <Bookmark size={20} />, v: bookmarked.length, l: 'Bookmarked questions', bg: 'var(--primary-soft)', c: 'var(--primary)' },
                    { icon: <FileText size={20} />, v: savedPapers.length, l: 'Saved papers', bg: 'var(--violet-soft)', c: 'var(--violet)' },
                    { icon: <CheckCircle2 size={20} />, v: completed.length, l: 'Completed subjects', bg: 'var(--green-soft)', c: 'var(--green)' },
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

                <div className="card">
                  <div className="row-between">
                    <h3 style={{ margin: 0 }}>Preparation checklist progress</h3>
                    <Badge color={progress.pct >= 100 ? 'green' : 'blue'}>{progress.pct}% complete</Badge>
                  </div>
                  <div className="progress-track" style={{ margin: '1.05rem 0 1.25rem' }}>
                    <span style={{ width: `${progress.pct}%` }} />
                  </div>
                  {student.checklist.slice(0, 3).map((c) => (
                    <div className={cx('checklist-item', c.done && 'done')} key={c.id} style={{ marginBottom: '0.65rem' }}>
                      <button className="check" onClick={() => toggleChecklistItem(c.id)} aria-label="Toggle item">
                        <CheckCircle2 size={14} />
                      </button>
                      <span className="check-text" style={{ flex: 1, fontSize: '0.93rem' }}>
                        {c.text}
                      </span>
                    </div>
                  ))}
                  <button className="btn btn-soft btn-sm" onClick={() => setTab('checklist')}>
                    Open full checklist
                  </button>
                </div>

                <div className="card">
                  <div className="row-between">
                    <h3 style={{ margin: 0 }}>Continue where you left off</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setTab('recent')}>
                      View history
                    </button>
                  </div>
                  {recentPapers.length === 0 ? (
                    <p className="small muted" style={{ margin: '1rem 0 0' }}>
                      Papers you view will appear here. Open the{' '}
                      <Link to="/papers">question paper library</Link> to get started.
                    </p>
                  ) : (
                    <div className="grid grid-3" style={{ marginTop: '1.15rem' }}>
                      {recentPapers.slice(0, 3).map((p) => (
                        <PaperCard key={p.id} paper={p} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'favorites' && (
              <>
                {favSubjects.length === 0 ? (
                  <EmptyState
                    icon={<Star size={26} />}
                    title="No favourite subjects yet"
                    message="Tap the star on any subject card to keep it here for quick access during revision."
                    action={
                      <Link className="btn btn-primary" to="/subjects">
                        Browse subjects
                      </Link>
                    }
                  />
                ) : (
                  <div className="grid grid-2">
                    {favSubjects.map((s) => (
                      <div key={s.id} style={{ position: 'relative' }}>
                        <SubjectCard subject={s} />
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ position: 'absolute', top: 8, right: 48 }}
                          onClick={() => toggleCompletedSubject(s.id)}
                        >
                          {student.completedSubjects.includes(s.id) ? (
                            <span className="badge badge-green">Completed</span>
                          ) : (
                            <span className="badge badge-slate">Mark complete</span>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {completed.length > 0 && (
                  <div className="card" style={{ marginTop: '1.35rem' }}>
                    <h3>Completed subjects</h3>
                    <div className="row" style={{ marginTop: '0.85rem' }}>
                      {completed.map((s) => (
                        <Link key={s.id} to={`/subjects/${s.id}`} className="chip">
                          <CheckCircle2 size={15} color="var(--green)" /> {s.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {tab === 'bookmarks' && (
              <>
                {bookmarked.length === 0 ? (
                  <EmptyState
                    icon={<Bookmark size={26} />}
                    title="No bookmarked questions"
                    message="Bookmark important questions from any subject page or the Important Questions section — they will collect here for last-minute revision."
                    action={
                      <Link className="btn btn-primary" to="/important">
                        Open important questions
                      </Link>
                    }
                  />
                ) : (
                  <div className="grid grid-2">
                    {bookmarked.map((q) => (
                      <QuestionCard key={q.id} question={q} />
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'saved' && (
              <>
                {savedPapers.length === 0 ? (
                  <EmptyState
                    icon={<FileText size={26} />}
                    title="No saved papers"
                    message="Save question papers from the library to build your personal exam-practice set."
                    action={
                      <Link className="btn btn-primary" to="/papers">
                        Open paper library
                      </Link>
                    }
                  />
                ) : (
                  <div className="grid grid-2">
                    {savedPapers.map((p) => (
                      <PaperCard key={p.id} paper={p} />
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'recent' && (
              <>
                {recentPapers.length === 0 ? (
                  <EmptyState
                    icon={<History size={26} />}
                    title="Nothing viewed yet"
                    message="Question papers you open will be listed here so you can jump back to them quickly."
                    action={
                      <Link className="btn btn-primary" to="/papers">
                        Find previous papers
                      </Link>
                    }
                  />
                ) : (
                  <div className="grid grid-2">
                    {recentPapers.map((p) => (
                      <PaperCard key={p.id} paper={p} />
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'checklist' && (
              <div className="card">
                <div className="row-between">
                  <div>
                    <h3 style={{ margin: 0 }}>Personal backlog preparation checklist</h3>
                    <p className="small" style={{ margin: '0.35rem 0 0' }}>
                      Tick items as you finish them. Add your own goals — e.g. “Finish Unit 3 of DBMS by Friday”.
                    </p>
                  </div>
                  <Badge color={progress.pct >= 100 ? 'green' : 'blue'}>
                    {progress.done}/{progress.total} done
                  </Badge>
                </div>
                <div className="progress-track" style={{ margin: '1.25rem 0' }}>
                  <span style={{ width: `${progress.pct}%` }} />
                </div>

                <form onSubmit={addItem} className="row" style={{ marginBottom: '1.15rem' }}>
                  <input
                    className="input"
                    style={{ flex: 1, minWidth: 220 }}
                    placeholder="Add a new preparation task..."
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                  />
                  <button className="btn btn-primary" type="submit">
                    <Plus size={16} /> Add task
                  </button>
                </form>

                <div className="stack" style={{ gap: '0.65rem' }}>
                  {student.checklist.map((c) => (
                    <div className={cx('checklist-item', c.done && 'done')} key={c.id}>
                      <button className="check" onClick={() => toggleChecklistItem(c.id)} aria-label="Toggle task">
                        <CheckCircle2 size={14} />
                      </button>
                      <span className="check-text" style={{ flex: 1 }}>
                        {c.text}
                      </span>
                      <button
                        className="icon-btn"
                        style={{ width: 32, height: 32, border: 'none', background: 'transparent' }}
                        onClick={() => removeChecklistItem(c.id)}
                        aria-label="Delete task"
                      >
                        <Trash2 size={15} color="var(--text-3)" />
                      </button>
                    </div>
                  ))}
                </div>

                {student.checklist.length === 0 && (
                  <div className="row" style={{ justifyContent: 'center', padding: '2rem 0', color: 'var(--text-3)' }}>
                    <X size={18} /> No tasks yet — add your first one above.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
