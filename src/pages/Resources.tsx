import { useMemo, useState } from 'react';
import { Download, Library, NotebookPen, ScrollText, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Badge, EmptyState, SectionHeader } from '../components/ui';

export function ResourcesPage() {
  const { dataset } = useApp();
  const [branch, setBranch] = useState('all');
  const [semester, setSemester] = useState('all');

  const materials = useMemo(
    () =>
      dataset.materials
        .map((m) => ({ m, s: dataset.subjects.find((x) => x.id === m.subjectId) }))
        .filter((x) => x.s)
        .filter((x) => (branch === 'all' ? true : x.s!.branchIds.includes(branch)))
        .filter((x) => (semester === 'all' ? true : String(x.s!.semester) === semester))
        .slice(0, 24),
    [dataset, branch, semester],
  );

  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Study resources"
          title="Notes, guides and preparation material"
          subtitle="Unit-wise notes, quick revision sheets and syllabus copies — plus guidance on how to prepare for backlog exams smartly."
        />

        <div className="grid grid-4" style={{ marginBottom: '2.15rem' }}>
          {[
            {
              icon: <NotebookPen size={21} />,
              bg: 'var(--primary-soft)',
              c: 'var(--primary)',
              t: 'Unit-wise notes',
              d: 'Condensed notes for every unit of every subject — built for last-month revision.',
            },
            {
              icon: <ScrollText size={21} />,
              bg: 'var(--amber-soft)',
              c: 'var(--amber)',
              t: 'Formula & revision sheets',
              d: 'One-page quick revision guides with definitions, formulas and diagrams checklist.',
            },
            {
              icon: <Library size={21} />,
              bg: 'var(--green-soft)',
              c: 'var(--green)',
              t: 'Syllabus & books',
              d: 'Unit-wise syllabus and recommended reference books for deeper study.',
            },
            {
              icon: <Wrench size={21} />,
              bg: 'var(--violet-soft)',
              c: 'var(--violet)',
              t: 'Preparation guidance',
              d: 'Exam strategies, 7-day sprint plans and checklists for backlog subjects.',
            },
          ].map((f) => (
            <div className="card" key={f.t}>
              <div className="feature-icon" style={{ background: f.bg, color: f.c }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.02rem' }}>{f.t}</h3>
              <p className="small" style={{ margin: 0 }}>
                {f.d}
              </p>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: '1.85rem' }}>
          <div className="row" style={{ gap: '0.85rem' }}>
            <div className="field" style={{ flex: 1, minWidth: 180 }}>
              <label htmlFor="r-branch">Branch</label>
              <select id="r-branch" className="select" value={branch} onChange={(e) => setBranch(e.target.value)}>
                <option value="all">All branches</option>
                {dataset.branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ flex: 1, minWidth: 180 }}>
              <label htmlFor="r-sem">Semester</label>
              <select id="r-sem" className="select" value={semester} onChange={(e) => setSemester(e.target.value)}>
                <option value="all">All semesters</option>
                {dataset.semesters.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {materials.length === 0 ? (
          <EmptyState
            icon={<Library size={26} />}
            title="No study material for these filters"
            message="Try a different branch or semester. New material is added regularly through the admin panel."
          />
        ) : (
          <div className="grid grid-3">
            {materials.map(({ m, s }) => (
              <div className="card card-hover" key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <div className="row-between">
                  <Badge color={m.type === 'notes' ? 'blue' : m.type === 'guide' ? 'amber' : 'green'}>{m.type}</Badge>
                  <Badge color="slate">
                    {s!.code} · Sem {s!.semester}
                  </Badge>
                </div>
                <h3 style={{ fontSize: '1rem', margin: 0 }}>{m.title}</h3>
                <p className="small" style={{ margin: 0, flex: 1 }}>
                  {m.description}
                </p>
                <div className="row">
                  <a className="btn btn-primary btn-sm" href={m.pdfUrl} download>
                    <Download size={15} /> Download PDF
                  </a>
                  <Link className="btn btn-ghost btn-sm" to={`/subjects/${s!.id}`}>
                    Subject page
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="cta-band" style={{ marginTop: '2.75rem' }}>
          <h2>Smart preparation beats hard preparation</h2>
          <p>
            Combine these resources with previous paper practice and the repeat analysis on each subject
            page. Open the dashboard to track what you finish.
          </p>
          <div className="row" style={{ justifyContent: 'center', marginTop: '1.35rem' }}>
            <Link className="btn btn-primary btn-lg" to="/dashboard">
              Open Dashboard
            </Link>
            <Link className="btn btn-secondary btn-lg" to="/important">
              Important Questions
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
