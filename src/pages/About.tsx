import { Link } from 'react-router-dom';
import { CheckCircle2, HeartHandshake, ShieldCheck, Sparkles, Target } from 'lucide-react';
import { DisclaimerBanner, SectionHeader } from '../components/ui';

export function AboutPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        <SectionHeader
          eyebrow="About Backlog Buddy"
          title="Built to help every student clear their backlogs"
          subtitle="Backlog Buddy is a free study platform created for engineering students preparing for supplementary (backlog) exams — with the material organised exactly the way students search for it."
        />

        <div className="grid grid-2" style={{ marginBottom: '2.15rem' }}>
          {[
            {
              icon: <Target size={21} />,
              bg: 'var(--primary-soft)',
              c: 'var(--primary)',
              t: 'Our mission',
              d: 'Turn scattered question papers and notes into one organised, searchable library so that no student wastes exam-prep time hunting for material.',
            },
            {
              icon: <Sparkles size={21} />,
              bg: 'var(--violet-soft)',
              c: 'var(--violet)',
              t: 'Smart analysis',
              d: 'We analyse available previous papers to highlight frequently repeated questions and topics — as preparation guidance, never as predictions.',
            },
            {
              icon: <ShieldCheck size={21} />,
              bg: 'var(--green-soft)',
              c: 'var(--green)',
              t: 'Honest labels',
              d: '“Very Important”, “Frequently Asked”, “Repeated Question” — labels reflect history from our library. We never claim a question will appear in an exam.',
            },
            {
              icon: <HeartHandshake size={21} />,
              bg: 'var(--amber-soft)',
              c: 'var(--amber)',
              t: 'Student-first',
              d: 'Fast pages, mobile-friendly design, light & dark mode, bookmarks and checklists — everything is designed for stress-free revision.',
            },
          ].map((f) => (
            <div className="card" key={f.t}>
              <div className="feature-icon" style={{ background: f.bg, color: f.c }}>
                {f.icon}
              </div>
              <h3>{f.t}</h3>
              <p className="small" style={{ margin: 0 }}>
                {f.d}
              </p>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: '1.85rem' }}>
          <h3>What you can find here</h3>
          <ul className="list-check" style={{ marginTop: '1.15rem' }}>
            {[
              'Subject-wise previous year question papers (regular, supplementary and mid-term)',
              'Important and frequently repeated questions with appearance counts',
              'Unit-wise important topics and questions for focused revision',
              'Model question papers based on the latest pattern',
              'Downloadable study material: notes, revision sheets and syllabus',
              'A personal dashboard with bookmarks, recently viewed papers and a preparation checklist',
              'An admin panel through which colleges can add real papers and content over time',
            ].map((t) => (
              <li key={t}>
                <CheckCircle2 size={17} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ marginBottom: '1.85rem' }}>
          <DisclaimerBanner />
        </div>

        <div className="card">
          <h3>How the repeat analysis works</h3>
          <p style={{ marginTop: '0.85rem' }}>
            Every question in the library is linked to the years it appeared in the available papers. We
            count those appearances and group them by topic and label, so you can see statements like
            “Stack Operations — appeared in 4 previous papers”. This reflects{' '}
            <strong>history from our current library only</strong>. Exam patterns change, and no one can
            guarantee future questions — so use the analysis to prioritise, but cover the full syllabus.
          </p>
          <p style={{ margin: 0 }}>
            Ready to start? <Link to="/subjects">Browse your branch subjects</Link> or{' '}
            <Link to="/papers">open the question paper library</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
