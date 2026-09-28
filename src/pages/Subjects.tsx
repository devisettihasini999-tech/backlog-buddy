import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, SearchX } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CardSkeletonGrid, EmptyState, SearchBar, SectionHeader, SubjectCard } from '../components/ui';

export function SubjectsPage() {
  const { dataset, loading } = useApp();
  const [params, setParams] = useSearchParams();
  const branch = params.get('branch') ?? 'all';
  const semester = params.get('semester') ?? 'all';
  const [query, setQuery] = useState('');

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const subjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dataset.subjects
      .filter((s) => (branch === 'all' ? true : s.branchIds.includes(branch)))
      .filter((s) => (semester === 'all' ? true : String(s.semester) === semester))
      .filter((s) =>
        q
          ? s.name.toLowerCase().includes(q) ||
            s.code.toLowerCase().includes(q) ||
            s.topics.some((t) => t.toLowerCase().includes(q))
          : true,
      )
      .sort((a, b) => a.semester - b.semester || a.name.localeCompare(b.name));
  }, [dataset, branch, semester, query]);

  const bySemester = useMemo(() => {
    const map = new Map<number, typeof subjects>();
    for (const s of subjects) {
      const list = map.get(s.semester) ?? [];
      list.push(s);
      map.set(s.semester, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [subjects]);

  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Branch & semester selection"
          title="Browse subjects"
          subtitle="Select your branch and semester — we will show the relevant subjects with papers, important questions and study material for each one."
        />

        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <div className="field" style={{ marginBottom: '1.15rem' }}>
            <label htmlFor="branch-filter">Branch</label>
            <div className="tag-select" id="branch-filter" role="group" aria-label="Filter by branch">
              <button className={`chip${branch === 'all' ? ' active' : ''}`} onClick={() => setParam('branch', 'all')}>
                All Branches
              </button>
              {dataset.branches.map((b) => (
                <button
                  key={b.id}
                  className={`chip${branch === b.id ? ' active' : ''}`}
                  onClick={() => setParam('branch', b.id)}
                >
                  {b.short}
                </button>
              ))}
            </div>
          </div>

          <div className="field" style={{ marginBottom: '1.15rem' }}>
            <label>Semester</label>
            <div className="tag-select" role="group" aria-label="Filter by semester">
              <button className={`chip${semester === 'all' ? ' active' : ''}`} onClick={() => setParam('semester', 'all')}>
                All Semesters
              </button>
              {dataset.semesters.map((s) => (
                <button
                  key={s.id}
                  className={`chip${semester === String(s.id) ? ' active' : ''}`}
                  onClick={() => setParam('semester', String(s.id))}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={() => undefined}
            placeholder="Search subject name, code or topic..."
          />
        </div>

        <div className="row-between" style={{ marginBottom: '1.15rem' }}>
          <div className="small muted" style={{ fontWeight: 650 }}>
            {loading ? 'Loading subjects…' : `${subjects.length} subject${subjects.length === 1 ? '' : 's'} found`}
          </div>
        </div>

        {loading ? (
          <CardSkeletonGrid count={6} />
        ) : subjects.length === 0 ? (
          <EmptyState
            icon={<SearchX size={26} />}
            title="No subjects match these filters"
            message="Try a different branch or semester, or clear the search box. New subjects are added regularly through the admin panel."
            action={
              <button
                className="btn btn-primary"
                onClick={() => {
                  setParams({}, { replace: true });
                  setQuery('');
                }}
              >
                Clear all filters
              </button>
            }
          />
        ) : (
          <div className="stack" style={{ gap: '2.1rem' }}>
            {bySemester.map(([sem, list]) => (
              <div key={sem}>
                <div className="row" style={{ marginBottom: '1rem', gap: '0.65rem' }}>
                  <BookOpen size={19} color="var(--primary)" />
                  <h3 style={{ margin: 0 }}>
                    {dataset.semesters.find((x) => x.id === sem)?.label ?? `${sem} Semester`}
                  </h3>
                  <span className="badge badge-slate">{list.length} subjects</span>
                </div>
                <div className="grid grid-3">
                  {list.map((s) => (
                    <SubjectCard key={s.id} subject={s} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
