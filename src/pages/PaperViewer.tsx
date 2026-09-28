import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../lib/format';
import { Badge, EmptyState, PaperCard, SectionHeader } from '../components/ui';

export function PaperViewerPage() {
  const { paperId } = useParams();
  const { dataset, student, toggleSavedPaper, addRecentPaper, toast } = useApp();

  const paper = dataset.papers.find((p) => p.id === paperId);
  const subject = paper ? dataset.subjects.find((s) => s.id === paper.subjectId) : undefined;

  useEffect(() => {
    if (paper) addRecentPaper(paper.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper?.id]);

  const related = useMemo(() => {
    if (!paper) return [];
    return dataset.papers
      .filter((p) => p.subjectId === paper.subjectId && p.id !== paper.id)
      .slice(0, 3);
  }, [dataset, paper]);

  if (!paper) {
    return (
      <section className="section">
        <div className="container">
          <EmptyState
            icon={<FileText size={26} />}
            title="Paper not found"
            message="This question paper is not available. It may have been removed — browse the library to find another paper."
            action={
              <Link className="btn btn-primary" to="/papers">
                Open paper library
              </Link>
            }
          />
        </div>
      </section>
    );
  }

  const saved = student.savedPapers.includes(paper.id);

  return (
    <section className="section">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/papers">Question Papers</Link>
          <ChevronRight size={14} />
          {subject && (
            <>
              <Link to={`/subjects/${subject.id}`}>{subject.name}</Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="muted">
            {paper.year} {paper.examType}
          </span>
        </nav>

        <div className="row-between" style={{ marginBottom: '1.35rem', alignItems: 'flex-start' }}>
          <div style={{ maxWidth: '720px' }}>
            <div className="row" style={{ gap: '0.5rem', marginBottom: '0.65rem' }}>
              <Badge color={paper.examType === 'Model' ? 'violet' : 'blue'}>{paper.examType}</Badge>
              <Badge color="slate">{paper.year}</Badge>
              <Badge color="slate">{paper.regulation}</Badge>
            </div>
            <h1 style={{ fontSize: 'clamp(1.45rem, 3vw, 2.15rem)' }}>{paper.title}</h1>
            <p style={{ margin: 0 }}>
              {subject ? `${subject.name} (${subject.code}) · ` : ''}
              {paper.university}
            </p>
          </div>
          <div className="row">
            <a
              className="btn btn-primary btn-lg"
              href={paper.pdfUrl}
              download
              onClick={() => toast('Download started', 'success')}
            >
              <Download size={18} /> Download PDF
            </a>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => toggleSavedPaper(paper.id)}
            >
              {saved ? <BookmarkCheck size={18} color="var(--green)" /> : <Bookmark size={18} />}
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.35rem' }}>
          <div className="paper-meta">
            {[
              { k: 'Year', v: String(paper.year) },
              { k: 'Exam type', v: paper.examType },
              { k: 'Duration', v: paper.duration },
              { k: 'Max marks', v: String(paper.maxMarks) },
              { k: 'Regulation', v: paper.regulation },
              { k: 'Uploaded on', v: formatDate(paper.uploadedAt) },
            ].map((m) => (
              <div className="meta-item" key={m.k}>
                <div className="k">{m.k}</div>
                <div className="v">{m.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.35rem', padding: '1rem' }}>
          <div className="row-between" style={{ marginBottom: '0.85rem' }}>
            <div className="row" style={{ gap: '0.55rem', fontWeight: 700, color: 'var(--text)' }}>
              <FileText size={18} color="var(--primary)" /> PDF preview
            </div>
            <a className="btn btn-secondary btn-sm" href={paper.pdfUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={15} /> Open in new tab
            </a>
          </div>
          <object
            className="pdf-frame"
            data={paper.pdfUrl}
            type="application/pdf"
            aria-label={`PDF preview of ${paper.title}`}
          >
            <div className="empty-state" style={{ padding: '2.25rem' }}>
              <p style={{ margin: 0 }}>
                PDF preview is not available in this browser. Use the Download button above to get the
                paper.
              </p>
            </div>
          </object>
        </div>

        <div className="alert alert-info" style={{ marginBottom: '1.75rem' }}>
          <Info size={19} />
          <div>
            This library ships with demo papers so the full experience can be tested. Real college papers
            can be uploaded through the <Link to="/admin">admin panel</Link> and will appear here
            automatically.
          </div>
        </div>

        {related.length > 0 && (
          <>
            <SectionHeader title={`More papers for ${subject?.name ?? 'this subject'}`} />
            <div className="grid grid-3">
              {related.map((p) => (
                <PaperCard key={p.id} paper={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
