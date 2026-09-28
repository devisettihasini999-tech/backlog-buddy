import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { BookOpen, FileText, Flame, SearchX, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { searchDataset } from '../lib/search';
import { Badge, EmptyState, PaperCard, QuestionCard, SearchBar, SectionHeader, SubjectCard } from '../components/ui';

export function SearchPage() {
  const { dataset } = useApp();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [input, setInput] = useState(q);
  const [branch, setBranch] = useState('all');
  const [semester, setSemester] = useState('all');
  const [year, setYear] = useState('all');
  const [regulation, setRegulation] = useState('all');

  useEffect(() => {
    setInput(q);
  }, [q]);

  const runSearch = (value: string) => {
    const next = new URLSearchParams(params);
    if (value.trim()) next.set('q', value.trim());
    else next.delete('q');
    setParams(next, { replace: true });
  };

  const results = useMemo(
    () =>
      searchDataset(dataset, q, {
        branch,
        semester,
        year,
        regulation,
      }),
    [dataset, q, branch, semester, year, regulation],
  );

  const years = useMemo(
    () => [...new Set(dataset.papers.map((p) => String(p.year)))].sort((a, b) => Number(b) - Number(a)),
    [dataset],
  );
  const regulations = useMemo(() => [...new Set(dataset.papers.map((p) => p.regulation))].sort(), [dataset]);

  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Search"
          title="Search subjects, questions, papers and topics"
          subtitle="One search box for the entire platform — try a subject name, subject code (like CS401), a question keyword, a topic or a year."
        />

        <SearchBar large value={input} onChange={setInput} onSubmit={() => runSearch(input)} />

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.95rem', margin: '1.25rem 0 1.75rem' }}>
          <select className="select" aria-label="Filter by branch" value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option value="all">All branches</option>
            {dataset.branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.short}
              </option>
            ))}
          </select>
          <select className="select" aria-label="Filter by semester" value={semester} onChange={(e) => setSemester(e.target.value)}>
            <option value="all">All semesters</option>
            {dataset.semesters.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.label}
              </option>
            ))}
          </select>
          <select className="select" aria-label="Filter by year" value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="all">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select className="select" aria-label="Filter by regulation" value={regulation} onChange={(e) => setRegulation(e.target.value)}>
            <option value="all">All regulations</option>
            {regulations.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {(branch !== 'all' || semester !== 'all' || year !== 'all' || regulation !== 'all' || q) && (
            <button
              className="btn btn-ghost"
              onClick={() => {
                setBranch('all');
                setSemester('all');
                setYear('all');
                setRegulation('all');
                runSearch('');
              }}
            >
              <X size={15} /> Clear
            </button>
          )}
        </div>

        {!q && branch === 'all' && semester === 'all' && year === 'all' && regulation === 'all' ? (
          <EmptyState
            icon={<SearchX size={26} />}
            title="What are you looking for?"
            message="Type a subject name, subject code, question keyword, topic or year. Use the filters above to narrow results to your branch and semester."
            action={
              <div className="row" style={{ justifyContent: 'center' }}>
                {['Data Structures', 'CS401', 'Normalization', '2025'].map((s) => (
                  <button key={s} className="chip" onClick={() => runSearch(s)}>
                    {s}
                  </button>
                ))}
              </div>
            }
          />
        ) : results.total === 0 ? (
          <EmptyState
            icon={<SearchX size={26} />}
            title={`No results for “${q || 'these filters'}”`}
            message="Check the spelling, try fewer keywords, or remove a filter. You can also browse subjects by branch from the Subjects page."
            action={
              <Link className="btn btn-primary" to="/subjects">
                Browse subjects
              </Link>
            }
          />
        ) : (
          <div className="stack" style={{ gap: '2.35rem' }}>
            <div className="row-between">
              <div className="row" style={{ gap: '0.55rem' }}>
                <Badge color="blue">{results.total} results</Badge>
                {q && <Badge color="slate">for “{q}”</Badge>}
              </div>
            </div>

            {results.subjects.length > 0 && (
              <div>
                <div className="row" style={{ gap: '0.55rem', marginBottom: '1rem' }}>
                  <BookOpen size={19} color="var(--primary)" />
                  <h3 style={{ margin: 0 }}>Subjects ({results.subjects.length})</h3>
                </div>
                <div className="grid grid-3">
                  {results.subjects.slice(0, 9).map((s) => (
                    <SubjectCard key={s.id} subject={s} />
                  ))}
                </div>
              </div>
            )}

            {results.questions.length > 0 && (
              <div>
                <div className="row" style={{ gap: '0.55rem', marginBottom: '1rem' }}>
                  <Flame size={19} color="var(--amber)" />
                  <h3 style={{ margin: 0 }}>Questions & topics ({results.questions.length})</h3>
                </div>
                <div className="grid grid-2">
                  {results.questions.slice(0, 12).map((question) => (
                    <QuestionCard key={question.id} question={question} />
                  ))}
                </div>
              </div>
            )}

            {results.papers.length > 0 && (
              <div>
                <div className="row" style={{ gap: '0.55rem', marginBottom: '1rem' }}>
                  <FileText size={19} color="var(--accent)" />
                  <h3 style={{ margin: 0 }}>Question papers ({results.papers.length})</h3>
                </div>
                <div className="grid grid-3">
                  {results.papers.slice(0, 9).map((p) => (
                    <PaperCard key={p.id} paper={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
