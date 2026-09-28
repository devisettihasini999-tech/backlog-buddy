import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileSearch, FilterX, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { filterPapers, type SearchFilters } from '../lib/search';
import { CardSkeletonGrid, EmptyState, PaperCard, SectionHeader } from '../components/ui';

export function PapersPage() {
  const { dataset, loading } = useApp();
  const [params, setParams] = useSearchParams();

  const filters: Required<SearchFilters> = {
    branch: params.get('branch') ?? 'all',
    semester: params.get('semester') ?? 'all',
    subject: params.get('subject') ?? 'all',
    year: params.get('year') ?? 'all',
    examType: params.get('examType') ?? 'all',
    regulation: params.get('regulation') ?? 'all',
  };
  const [query, setQuery] = useState(params.get('q') ?? '');

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    if (key === 'branch' || key === 'semester') next.delete('subject');
    setParams(next, { replace: true });
  };

  const clearAll = () => {
    setParams({}, { replace: true });
    setQuery('');
  };

  const filteredSubjects = useMemo(
    () =>
      dataset.subjects
        .filter((s) => (filters.branch === 'all' ? true : s.branchIds.includes(filters.branch)))
        .filter((s) => (filters.semester === 'all' ? true : String(s.semester) === filters.semester))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [dataset, filters.branch, filters.semester],
  );

  const papers = useMemo(() => filterPapers(dataset, filters, query), [dataset, filters, query]);
  const years = useMemo(
    () => [...new Set(dataset.papers.map((p) => String(p.year)))].sort((a, b) => Number(b) - Number(a)),
    [dataset],
  );
  const regulations = useMemo(() => [...new Set(dataset.papers.map((p) => p.regulation))].sort(), [dataset]);

  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Question paper library"
          title="Previous question papers"
          subtitle="A clean, filterable library of previous semester and supplementary exam papers. View papers in the browser or download the PDF."
        />

        <div className="card" style={{ marginBottom: '1.65rem' }}>
          <div className="row-between" style={{ marginBottom: '1.15rem' }}>
            <div className="row" style={{ gap: '0.55rem', fontWeight: 700, color: 'var(--text)' }}>
              <Search size={18} color="var(--primary)" /> Filters
            </div>
            <button className="btn btn-ghost btn-sm" onClick={clearAll}>
              <FilterX size={15} /> Clear all
            </button>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.95rem' }}>
            <div className="field">
              <label htmlFor="f-branch">Branch</label>
              <select id="f-branch" className="select" value={filters.branch} onChange={(e) => setParam('branch', e.target.value)}>
                <option value="all">All branches</option>
                {dataset.branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-sem">Semester</label>
              <select id="f-sem" className="select" value={filters.semester} onChange={(e) => setParam('semester', e.target.value)}>
                <option value="all">All semesters</option>
                {dataset.semesters.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-sub">Subject</label>
              <select id="f-sub" className="select" value={filters.subject} onChange={(e) => setParam('subject', e.target.value)}>
                <option value="all">All subjects</option>
                {filteredSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-year">Academic year</label>
              <select id="f-year" className="select" value={filters.year} onChange={(e) => setParam('year', e.target.value)}>
                <option value="all">All years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-type">Exam type</label>
              <select id="f-type" className="select" value={filters.examType} onChange={(e) => setParam('examType', e.target.value)}>
                <option value="all">All types</option>
                <option value="Regular">Regular</option>
                <option value="Supplementary">Supplementary / Supply</option>
                <option value="Mid-Term">Mid-Term</option>
                <option value="Model">Model Paper</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-reg">Regulation</label>
              <select id="f-reg" className="select" value={filters.regulation} onChange={(e) => setParam('regulation', e.target.value)}>
                <option value="all">All regulations</option>
                {regulations.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field" style={{ marginTop: '1.05rem' }}>
            <label htmlFor="f-q">Search within results</label>
            <input
              id="f-q"
              className="input"
              placeholder="Subject name, subject code, question, topic or year..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="row-between" style={{ marginBottom: '1.15rem' }}>
          <div className="small muted" style={{ fontWeight: 650 }}>
            {loading ? 'Loading papers…' : `${papers.length} paper${papers.length === 1 ? '' : 's'} found`}
          </div>
        </div>

        {loading ? (
          <CardSkeletonGrid count={6} />
        ) : papers.length === 0 ? (
          <EmptyState
            icon={<FileSearch size={26} />}
            title="No question papers found"
            message="No papers match these filters right now. Try broadening the year or exam type — or clear all filters to see the full library."
            action={
              <button className="btn btn-primary" onClick={clearAll}>
                Clear all filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-3">
            {papers.map((p) => (
              <PaperCard key={p.id} paper={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
