import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Inbox,
  SearchX,
  Star,
  StarOff,
} from 'lucide-react';
import type { Question, QuestionPaper, Subject } from '../data/types';
import { appearanceText, DISCLAIMER } from '../lib/analysis';
import { cx, formatDate, pluralize } from '../lib/format';
import { useApp } from '../context/AppContext';

export function Badge({
  children,
  color = 'slate',
}: {
  children: React.ReactNode;
  color?: 'blue' | 'violet' | 'green' | 'amber' | 'red' | 'slate' | 'cyan';
}) {
  return <span className={`badge badge-${color}`}>{children}</span>;
}

export const LABEL_COLORS: Record<Question['label'], 'blue' | 'violet' | 'green' | 'amber' | 'cyan'> = {
  'Very Important': 'blue',
  'Frequently Asked': 'violet',
  'Repeated Question': 'amber',
  'Important Topic': 'green',
  'Practice Question': 'cyan',
};

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon ?? <Inbox size={26} />}</div>
      <h3 style={{ marginBottom: '0.4rem' }}>{title}</h3>
      <p style={{ maxWidth: '46ch', margin: '0 auto 1.15rem' }}>{message}</p>
      {action}
    </div>
  );
}

export function Skeleton({ height = 18, width = '100%', radius = 10 }: { height?: number; width?: string | number; radius?: number }) {
  return <div className="skeleton" style={{ height, width, borderRadius: radius }} />;
}

export function CardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-3">
      {Array.from({ length: count }).map((_, i) => (
        <div className="card" key={i}>
          <Skeleton height={34} width={70} />
          <div style={{ height: 12 }} />
          <Skeleton height={20} />
          <div style={{ height: 10 }} />
          <Skeleton height={14} width="80%" />
          <div style={{ height: 10 }} />
          <Skeleton height={14} width="60%" />
        </div>
      ))}
    </div>
  );
}

export function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div className="notice-banner" style={compact ? { padding: '0.75rem 1rem', fontSize: '0.85rem' } : undefined}>
      <AlertTriangle size={compact ? 17 : 20} style={{ color: 'var(--amber)', flex: 'none', marginTop: 2 }} />
      <div>
        {compact ? (
          <span>{DISCLAIMER}</span>
        ) : (
          <>
            <strong style={{ color: 'var(--text)' }}>How to read these labels:</strong>{' '}
            {DISCLAIMER} Use them to prioritise your preparation — never as a substitute for covering the full syllabus.
          </>
        )}
      </div>
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="row-between" style={{ marginBottom: '1.6rem', alignItems: 'flex-end' }}>
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2 style={{ marginBottom: subtitle ? '0.35rem' : 0 }}>{title}</h2>
        {subtitle && <p style={{ margin: 0, maxWidth: '64ch' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search subject, subject code, or question...',
  large = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  large?: boolean;
}) {
  return (
    <form
      className="search-bar"
      style={large ? { padding: '0.55rem 0.65rem 0.55rem 1.15rem' } : undefined}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      role="search"
    >
      <SearchIcon size={large ? 21 : 18} />
      <input
        aria-label="Search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button type="submit" className={cx('btn btn-primary', large ? 'btn-lg' : 'btn-sm')}>
        Search
      </button>
    </form>
  );
}

function SearchIcon(props: { size?: number }) {
  return (
    <svg width={props.size ?? 18} height={props.size ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

export function SubjectCard({ subject }: { subject: Subject }) {
  const { dataset, student, toggleFavoriteSubject } = useApp();
  const paperCount = dataset.papers.filter((p) => p.subjectId === subject.id && p.examType !== 'Model').length;
  const branches = dataset.branches.filter((b) => subject.branchIds.includes(b.id));
  const fav = student.favoriteSubjects.includes(subject.id);

  return (
    <div className="card card-hover subject-card">
      <div className="row-between">
        <span className="code-badge">{subject.code}</span>
        <button
          className="icon-btn"
          aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
          style={{ width: 34, height: 34, border: 'none', background: 'transparent' }}
          onClick={(e) => {
            e.preventDefault();
            toggleFavoriteSubject(subject.id);
          }}
        >
          {fav ? <Star size={18} color="var(--amber)" fill="var(--amber)" /> : <StarOff size={18} color="var(--text-3)" />}
        </button>
      </div>
      <Link to={`/subjects/${subject.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
        <h3>{subject.name}</h3>
      </Link>
      <div className="topic-tags">
        {subject.topics.slice(0, 3).map((t) => (
          <span className="topic-tag" key={t}>
            {t}
          </span>
        ))}
      </div>
      <div className="row" style={{ gap: '0.4rem', marginTop: 'auto' }}>
        <Badge color="blue">{subject.semester} Sem</Badge>
        <Badge color="slate">{pluralize(paperCount, 'paper')}</Badge>
        {branches.slice(0, 2).map((b) => (
          <Badge key={b.id} color="slate">
            {b.short}
          </Badge>
        ))}
      </div>
      <Link className="btn btn-soft btn-sm" to={`/subjects/${subject.id}`}>
        Open subject <ArrowRight size={15} />
      </Link>
    </div>
  );
}

export function PaperCard({ paper }: { paper: QuestionPaper }) {
  const { dataset, student, toggleSavedPaper } = useApp();
  const subject = dataset.subjects.find((s) => s.id === paper.subjectId);
  const saved = student.savedPapers.includes(paper.id);
  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="row-between">
        <Badge color={paper.examType === 'Model' ? 'violet' : paper.examType === 'Supplementary' ? 'amber' : 'blue'}>
          {paper.examType}
        </Badge>
        <span className="row" style={{ gap: '0.35rem', color: 'var(--text-3)', fontSize: '0.84rem', fontWeight: 650 }}>
          <Calendar size={14} /> {paper.year}
        </span>
      </div>
      <h3 style={{ fontSize: '1.02rem', margin: 0 }}>{paper.title}</h3>
      <div className="small muted">
        {subject ? `${subject.name} · ${subject.code}` : 'Unknown subject'} · {paper.regulation} · {paper.university}
      </div>
      <div className="row" style={{ marginTop: 'auto' }}>
        <Link className="btn btn-primary btn-sm" to={`/papers/${paper.id}`}>
          <FileText size={15} /> View Paper
        </Link>
        <a className="btn btn-secondary btn-sm" href={paper.pdfUrl} download>
          <Download size={15} /> Download
        </a>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => toggleSavedPaper(paper.id)}
          aria-label={saved ? 'Remove bookmark' : 'Bookmark paper'}
        >
          {saved ? <BookmarkCheck size={16} color="var(--green)" /> : <Bookmark size={16} />}
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
}

export function QuestionCard({
  question,
  showSubject = true,
}: {
  question: Question;
  showSubject?: boolean;
}) {
  const { dataset, student, toggleBookmarkQuestion } = useApp();
  const subject = dataset.subjects.find((s) => s.id === question.subjectId);
  const marked = student.bookmarkedQuestions.includes(question.id);
  return (
    <div className="card question-card card-hover">
      <div className="row-between">
        <div className="row" style={{ gap: '0.45rem' }}>
          <Badge color={LABEL_COLORS[question.label]}>{question.label}</Badge>
          <Badge color="slate">Unit {question.unit}</Badge>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => toggleBookmarkQuestion(question.id)}
          aria-label={marked ? 'Remove bookmark' : 'Bookmark question'}
        >
          {marked ? <BookmarkCheck size={16} color="var(--green)" /> : <Bookmark size={16} />}
          {marked ? 'Bookmarked' : 'Bookmark'}
        </button>
      </div>
      <p className="q-text">{question.text}</p>
      <div className="row-between">
        <div className="row" style={{ gap: '0.45rem' }}>
          {question.appearances.map((y) => (
            <span className="year-chip" key={y}>
              {y}
            </span>
          ))}
          <span className="small muted">{appearanceText(question)}</span>
        </div>
        {showSubject && subject && (
          <Link className="small" to={`/subjects/${subject.id}`} style={{ fontWeight: 650 }}>
            {subject.name} →
          </Link>
        )}
      </div>
    </div>
  );
}

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  if (toasts.length === 0) return null;
  return (
    <div className="toast-wrap" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={cx('toast', t.kind)} onClick={() => dismissToast(t.id)} role="status">
          {t.kind === 'success' ? (
            <CheckCircle2 size={18} color="var(--green)" style={{ flex: 'none', marginTop: 2 }} />
          ) : t.kind === 'error' ? (
            <AlertTriangle size={18} color="var(--red)" style={{ flex: 'none', marginTop: 2 }} />
          ) : (
            <ExternalLink size={17} style={{ flex: 'none', marginTop: 3 }} />
          )}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={cx('modal', wide && 'wide')} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="row-between" style={{ marginBottom: '1.15rem' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function NotFoundGraphic() {
  return <SearchX size={28} />;
}

export function formatDateSafe(iso: string) {
  return formatDate(iso);
}
