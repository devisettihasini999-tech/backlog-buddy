import { useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Database,
  Download,
  FileText,
  Flame,
  FolderPlus,
  KeyRound,
  LayoutGrid,
  Library,
  Lock,
  MessageSquare,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Branch, Question, QuestionPaper, StudyMaterial, Subject } from '../data/types';
import { formatDate, uid } from '../lib/format';
import { Badge, EmptyState, Modal, SectionHeader } from '../components/ui';

const ADMIN_PASSWORD = 'admin123';
const SESSION_KEY = 'backlog-buddy:admin-session';

type Section = 'overview' | 'branches' | 'subjects' | 'papers' | 'questions' | 'materials' | 'feedback' | 'settings';

export function AdminPage() {
  const { dataset, admin, remoteStatus, feedback, toast } = useApp();
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [section, setSection] = useState<Section>('overview');
  const [editing, setEditing] = useState<{ kind: Section; entity: any } | null>(null);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setAuthed(true);
      toast('Welcome, administrator!', 'success');
    } else {
      setLoginError('Incorrect password. Demo password: admin123');
    }
  };

  if (!authed) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 460 }}>
          <form className="card" onSubmit={login} style={{ marginTop: '2.5rem' }}>
            <div className="feature-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', margin: '0 auto 1.15rem' }}>
              <Lock size={22} />
            </div>
            <h2 style={{ textAlign: 'center', fontSize: '1.45rem' }}>Admin sign in</h2>
            <p className="small center" style={{ marginBottom: '1.45rem' }}>
              Authorised administrators only. This gate is a demo layer — connect Supabase Auth for
              production-grade access control.
            </p>
            <div className="field">
              <label htmlFor="admin-pass">Password</label>
              <div className="row" style={{ gap: '0.65rem', flexWrap: 'nowrap' }}>
                <KeyRound size={17} color="var(--text-3)" style={{ flex: 'none' }} />
                <input
                  id="admin-pass"
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
              {loginError && <span className="field-error">{loginError}</span>}
            </div>
            <button className="btn btn-primary btn-block" type="submit" style={{ marginTop: '1.15rem' }}>
              <ShieldCheck size={17} /> Sign in
            </button>
            <p className="small muted center" style={{ margin: '1.15rem 0 0' }}>
              Demo password: <code>admin123</code>
            </p>
          </form>
        </div>
      </section>
    );
  }

  return (
    <AdminShell
      section={section}
      setSection={setSection}
      onEdit={(kind, entity) => setEditing({ kind, entity })}
      onCloseEditor={() => setEditing(null)}
      editing={editing}
    />
  );
}

function AdminShell({
  section,
  setSection,
  onEdit,
  editing,
  onCloseEditor,
}: {
  section: Section;
  setSection: (s: Section) => void;
  onEdit: (kind: Section, entity: any) => void;
  editing: { kind: Section; entity: any } | null;
  onCloseEditor: () => void;
}) {
  const { dataset, admin, remoteStatus, feedback, toast } = useApp();

  const nav: Array<{ id: Section; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutGrid size={16} /> },
    { id: 'branches', label: 'Branches', icon: <FolderPlus size={16} /> },
    { id: 'subjects', label: 'Subjects', icon: <BookOpen size={16} /> },
    { id: 'papers', label: 'Question Papers', icon: <FileText size={16} /> },
    { id: 'questions', label: 'Important Questions', icon: <Flame size={16} /> },
    { id: 'materials', label: 'Study Materials', icon: <Library size={16} /> },
    { id: 'feedback', label: 'Feedback Inbox', icon: <MessageSquare size={16} /> },
    { id: 'settings', label: 'Data & Settings', icon: <Database size={16} /> },
  ];

  const exportJSON = () => {
    const blob = new Blob([admin.exportJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backlog-buddy-data.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('Dataset exported as JSON', 'success');
  };

  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Admin panel"
          title="Manage content for Backlog Buddy"
          subtitle="Add branches, semesters, subjects, question papers, questions and study material. In demo mode, changes are stored in this browser — wire up Supabase (schema included) for shared persistent data."
          action={
            <button className="btn btn-secondary btn-sm" onClick={() => { sessionStorage.removeItem('backlog-buddy:admin-session'); location.reload(); }}>
              Sign out
            </button>
          }
        />

        <div className="dash-layout">
          <nav className="side-nav card" style={{ padding: '0.65rem' }} aria-label="Admin sections">
            {nav.map((n) => (
              <button key={n.id} className={section === n.id ? 'active' : ''} onClick={() => setSection(n.id)}>
                {n.icon} {n.label}
              </button>
            ))}
          </nav>

          <div>
            {section === 'overview' && (
              <div className="stack" style={{ gap: '1.35rem' }}>
                <div className="grid grid-4">
                  {[
                    { icon: <FolderPlus size={20} />, v: dataset.branches.length, l: 'Branches', bg: 'var(--primary-soft)', c: 'var(--primary)' },
                    { icon: <BookOpen size={20} />, v: dataset.subjects.length, l: 'Subjects', bg: 'var(--violet-soft)', c: 'var(--violet)' },
                    { icon: <FileText size={20} />, v: dataset.papers.length, l: 'Question papers', bg: 'var(--amber-soft)', c: 'var(--amber)' },
                    { icon: <Flame size={20} />, v: dataset.questions.length, l: 'Questions', bg: 'var(--green-soft)', c: 'var(--green)' },
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
                  <h3>Quick actions</h3>
                  <div className="row" style={{ marginTop: '1.05rem' }}>
                    <button className="btn btn-primary" onClick={() => onEdit('papers', newPaper(dataset.subjects[0]?.id ?? ''))}>
                      <Upload size={16} /> Upload question paper
                    </button>
                    <button className="btn btn-secondary" onClick={() => onEdit('subjects', newSubject())}>
                      <Plus size={16} /> Add subject
                    </button>
                    <button className="btn btn-secondary" onClick={() => onEdit('questions', newQuestion(dataset.subjects[0]?.id ?? ''))}>
                      <Plus size={16} /> Add important question
                    </button>
                    <button className="btn btn-secondary" onClick={() => onEdit('materials', newMaterial(dataset.subjects[0]?.id ?? ''))}>
                      <Plus size={16} /> Add study material
                    </button>
                    <button className="btn btn-ghost" onClick={exportJSON}>
                      <Download size={16} /> Export data
                    </button>
                  </div>
                </div>

                <div className="card">
                  <h3>Connection status</h3>
                  <div className="row" style={{ marginTop: '0.95rem' }}>
                    <Badge color={remoteStatus === 'connected' ? 'green' : 'blue'}>
                      {remoteStatus === 'connected' ? 'Supabase connected' : 'Demo data mode'}
                    </Badge>
                    <span className="small muted">
                      {remoteStatus === 'connected'
                        ? 'Live data is being served from your Supabase tables.'
                        : 'Running on the built-in sample dataset. Paste supabase/schema.sql into the Supabase SQL Editor to go live.'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {section === 'branches' && (
              <CollectionTable
                title="Branches"
                rows={dataset.branches}
                columns={[
                  { key: 'code', label: 'Code' },
                  { key: 'name', label: 'Name' },
                  { key: 'short', label: 'Short' },
                  { key: 'tagline', label: 'Tagline' },
                ]}
                onAdd={() => onEdit('branches', newBranch())}
                onEdit={(row) => onEdit('branches', row)}
                onDelete={(row) => admin.remove('branches', row.id)}
              />
            )}

            {section === 'subjects' && (
              <CollectionTable
                title="Subjects"
                rows={dataset.subjects}
                columns={[
                  { key: 'code', label: 'Code' },
                  { key: 'name', label: 'Name' },
                  { key: 'semester', label: 'Sem' },
                  { key: 'branchIds', label: 'Branches', render: (v: string[]) => v.join(', ') },
                  { key: 'topics', label: 'Topics', render: (v: string[]) => `${v.length} units` },
                ]}
                onAdd={() => onEdit('subjects', newSubject())}
                onEdit={(row) => onEdit('subjects', row)}
                onDelete={(row) => admin.remove('subjects', row.id)}
              />
            )}

            {section === 'papers' && (
              <CollectionTable
                title="Question papers"
                rows={dataset.papers}
                columns={[
                  { key: 'title', label: 'Title' },
                  { key: 'year', label: 'Year' },
                  { key: 'examType', label: 'Exam type' },
                  { key: 'regulation', label: 'Regulation' },
                  { key: 'uploadedAt', label: 'Uploaded', render: (v: string) => formatDate(v) },
                ]}
                onAdd={() => onEdit('papers', newPaper(dataset.subjects[0]?.id ?? ''))}
                onEdit={(row) => onEdit('papers', row)}
                onDelete={(row) => admin.remove('papers', row.id)}
              />
            )}

            {section === 'questions' && (
              <CollectionTable
                title="Important questions"
                rows={dataset.questions.slice(0, 200)}
                columns={[
                  { key: 'text', label: 'Question', render: (v: string) => (v.length > 70 ? v.slice(0, 70) + '…' : v) },
                  { key: 'label', label: 'Label' },
                  { key: 'unit', label: 'Unit' },
                  { key: 'appearances', label: 'Appeared', render: (v: number[]) => `${v.length}×` },
                ]}
                onAdd={() => onEdit('questions', newQuestion(dataset.subjects[0]?.id ?? ''))}
                onEdit={(row) => onEdit('questions', row)}
                onDelete={(row) => admin.remove('questions', row.id)}
              />
            )}

            {section === 'materials' && (
              <CollectionTable
                title="Study materials"
                rows={dataset.materials.slice(0, 200)}
                columns={[
                  { key: 'title', label: 'Title' },
                  { key: 'type', label: 'Type' },
                  { key: 'subjectId', label: 'Subject' },
                  { key: 'uploadedAt', label: 'Uploaded', render: (v: string) => formatDate(v) },
                ]}
                onAdd={() => onEdit('materials', newMaterial(dataset.subjects[0]?.id ?? ''))}
                onEdit={(row) => onEdit('materials', row)}
                onDelete={(row) => admin.remove('materials', row.id)}
              />
            )}

            {section === 'feedback' && (
              <div className="card">
                <h3>Student feedback & messages ({feedback.length})</h3>
                {feedback.length === 0 ? (
                  <EmptyState
                    icon={<MessageSquare size={26} />}
                    title="Inbox is empty"
                    message="Messages sent through the contact page will appear here."
                  />
                ) : (
                  <div className="stack" style={{ marginTop: '1.15rem' }}>
                    {feedback.map((f) => (
                      <div key={f.id} className="card" style={{ background: 'var(--surface-2)' }}>
                        <div className="row-between">
                          <strong>{f.name}</strong>
                          <Badge color="slate">{formatDate(f.createdAt)}</Badge>
                        </div>
                        <div className="small muted" style={{ margin: '0.25rem 0 0.6rem' }}>
                          {f.email} · {f.topic}
                        </div>
                        <div className="small" style={{ color: 'var(--text-2)' }}>
                          {f.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {section === 'settings' && (
              <div className="stack">
                <div className="card">
                  <h3>Supabase connection</h3>
                  <div className="row" style={{ margin: '0.95rem 0' }}>
                    <Badge color={remoteStatus === 'connected' ? 'green' : 'blue'}>
                      {remoteStatus === 'connected' ? 'Connected' : 'Demo mode'}
                    </Badge>
                    <code className="small muted">jcltcmildaclwjkxgrgu.supabase.co</code>
                  </div>
                  <p className="small">
                    1. Open the Supabase SQL Editor for this project. 2. Paste the contents of{' '}
                    <code>supabase/schema.sql</code> (from the repository) and run it once. 3. Reload this
                    page — the app will automatically start serving live data and the admin panel becomes
                    multi-user.
                  </p>
                </div>
                <div className="card">
                  <h3>Dataset tools</h3>
                  <div className="row" style={{ marginTop: '1.05rem' }}>
                    <button className="btn btn-primary" onClick={exportJSON}>
                      <Download size={16} /> Export current dataset (JSON)
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        if (confirm('Reset all demo edits and restore the sample dataset?')) admin.reset();
                      }}
                    >
                      <RotateCcw size={16} /> Reset demo data
                    </button>
                  </div>
                  <p className="small muted" style={{ margin: '1.05rem 0 0' }}>
                    Demo edits are stored in this browser (localStorage). Export regularly if you have added
                    content you want to keep.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <EntityEditor
          kind={editing.kind}
          entity={editing.entity}
          onClose={onCloseEditor}
        />
      )}
    </section>
  );
}

/* ---------------- table ---------------- */

function CollectionTable({
  title,
  rows,
  columns,
  onAdd,
  onEdit,
  onDelete,
}: {
  title: string;
  rows: any[];
  columns: Array<{ key: string; label: string; render?: (v: any) => React.ReactNode }>;
  onAdd: () => void;
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
}) {
  return (
    <div className="card">
      <div className="row-between" style={{ marginBottom: '1.15rem' }}>
        <h3 style={{ margin: 0 }}>
          {title} <span className="muted small">({rows.length})</span>
        </h3>
        <button className="btn btn-primary btn-sm" onClick={onAdd}>
          <Plus size={15} /> Add new
        </button>
      </div>
      {rows.length === 0 ? (
        <EmptyState title={`No ${title.toLowerCase()} yet`} message="Use the “Add new” button to create the first entry." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(row[c.key]) : String(row[c.key] ?? '')}</td>
                  ))}
                  <td>
                    <div className="row" style={{ gap: '0.35rem', flexWrap: 'nowrap' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => onEdit(row)}>
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (confirm('Delete this entry? This cannot be undone in demo mode.')) onDelete(row);
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------- entity factories ---------------- */

function newBranch(): Branch {
  return { id: uid('br'), code: '', name: '', short: '', tagline: '', accent: 'blue' };
}
function newSubject(): Subject {
  return {
    id: uid('sub'),
    code: '',
    name: '',
    branchIds: [],
    semester: 1,
    credits: 3,
    topics: ['', '', '', '', ''],
  };
}
function newPaper(subjectId: string): QuestionPaper {
  return {
    id: uid('paper'),
    subjectId,
    title: '',
    year: 2026,
    examType: 'Regular',
    regulation: 'R23',
    university: '',
    duration: '3 Hours',
    maxMarks: 70,
    pages: 2,
    pdfUrl: '',
    uploadedAt: new Date().toISOString().slice(0, 10),
  };
}
function newQuestion(subjectId: string): Question {
  return {
    id: uid('q'),
    subjectId,
    unit: 1,
    topic: '',
    text: '',
    label: 'Important Topic',
    appearances: [],
  };
}
function newMaterial(subjectId: string): StudyMaterial {
  return {
    id: uid('m'),
    subjectId,
    title: '',
    type: 'notes',
    description: '',
    pdfUrl: '',
    uploadedAt: new Date().toISOString().slice(0, 10),
  };
}

/* ---------------- editor ---------------- */

function EntityEditor({
  kind,
  entity,
  onClose,
}: {
  kind: Section;
  entity: any;
  onClose: () => void;
}) {
  const { dataset, admin } = useApp();
  const [draft, setDraft] = useState<any>({ ...entity });
  const [uploadName, setUploadName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (patch: Record<string, unknown>) => setDraft((d: any) => ({ ...d, ...patch }));

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }
    const url = URL.createObjectURL(file);
    set({ pdfUrl: url });
    setUploadName(file.name);
  };

  const save = () => {
    if (kind === 'subjects' || kind === 'branches') {
      if (!draft.name || !draft.id) {
        alert('Please fill the required fields (id and name).');
        return;
      }
    }
    if ((kind === 'papers' || kind === 'questions' || kind === 'materials') && !draft.subjectId) {
      alert('Please choose a subject.');
      return;
    }
    const collection =
      kind === 'branches'
        ? 'branches'
        : kind === 'subjects'
          ? 'subjects'
          : kind === 'papers'
            ? 'papers'
            : kind === 'questions'
              ? 'questions'
              : 'materials';
    admin.upsert(collection as never, draft);
    onClose();
  };

  const field = (label: string, key: string, type = 'text', required = false) => (
    <div className="field">
      <label>
        {label} {required && '*'}
      </label>
      <input
        className="input"
        type={type}
        value={draft[key] ?? ''}
        onChange={(e) => set({ [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
      />
    </div>
  );

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title={
        kind === 'branches'
          ? 'Branch'
          : kind === 'subjects'
            ? 'Subject'
            : kind === 'papers'
              ? 'Question paper'
              : kind === 'questions'
                ? 'Important question'
                : 'Study material'
      }
    >
      <div className="stack" style={{ gap: '1rem' }}>
        {(kind === 'papers' || kind === 'questions' || kind === 'materials') && (
          <div className="field">
            <label>Subject *</label>
            <select
              className="select"
              value={draft.subjectId}
              onChange={(e) => set({ subjectId: e.target.value })}
            >
              <option value="">Choose a subject…</option>
              {[...dataset.subjects]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {kind === 'branches' && (
          <>
            <div className="grid grid-2">
              {field('ID (unique)', 'id', 'text', true)}
              {field('Code', 'code')}
            </div>
            {field('Name', 'name', 'text', true)}
            <div className="grid grid-2">
              {field('Short name', 'short')}
              {field('Accent colour', 'accent')}
            </div>
            {field('Tagline', 'tagline')}
          </>
        )}

        {kind === 'subjects' && (
          <>
            <div className="grid grid-2">
              {field('ID (unique)', 'id', 'text', true)}
              {field('Subject code', 'code', 'text', true)}
            </div>
            {field('Subject name', 'name', 'text', true)}
            <div className="grid grid-2">
              <div className="field">
                <label>Semester *</label>
                <select
                  className="select"
                  value={draft.semester}
                  onChange={(e) => set({ semester: Number(e.target.value) })}
                >
                  {dataset.semesters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              {field('Credits', 'credits', 'number')}
            </div>
            <div className="field">
              <label>Branches</label>
              <div className="tag-select">
                {dataset.branches.map((b) => {
                  const active: boolean = (draft.branchIds as string[]).includes(b.id);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      className={`chip${active ? ' active' : ''}`}
                      onClick={() =>
                        set({
                          branchIds: active
                            ? draft.branchIds.filter((x: string) => x !== b.id)
                            : [...draft.branchIds, b.id],
                        })
                      }
                    >
                      {b.short}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="field">
              <label>Unit topics (5 units)</label>
              {[0, 1, 2, 3, 4].map((i) => (
                <input
                  key={i}
                  className="input"
                  style={{ marginBottom: 6 }}
                  placeholder={`Unit ${i + 1} topic`}
                  value={draft.topics[i] ?? ''}
                  onChange={(e) => {
                    const topics = [...draft.topics];
                    topics[i] = e.target.value;
                    set({ topics });
                  }}
                />
              ))}
            </div>
          </>
        )}

        {kind === 'papers' && (
          <>
            {field('Paper title', 'title', 'text', true)}
            <div className="grid grid-3">
              {field('Year', 'year', 'number')}
              <div className="field">
                <label>Exam type</label>
                <select className="select" value={draft.examType} onChange={(e) => set({ examType: e.target.value })}>
                  <option>Regular</option>
                  <option>Supplementary</option>
                  <option>Mid-Term</option>
                  <option>Model</option>
                </select>
              </div>
              {field('Regulation', 'regulation')}
            </div>
            <div className="grid grid-3">
              {field('University', 'university')}
              {field('Duration', 'duration')}
              {field('Max marks', 'maxMarks', 'number')}
            </div>
            <div className="grid grid-2">
              {field('Upload date', 'uploadedAt', 'date')}
              {field('Pages', 'pages', 'number')}
            </div>
            <div className="field">
              <label>Question paper PDF</label>
              <div className="row">
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <button className="btn btn-secondary" type="button" onClick={() => fileRef.current?.click()}>
                  <Upload size={16} /> {uploadName || 'Choose PDF…'}
                </button>
                {draft.pdfUrl && <Badge color="green">PDF attached</Badge>}
              </div>
              <input
                className="input"
                style={{ marginTop: 8 }}
                placeholder="…or paste a PDF URL (https://...)"
                value={draft.pdfUrl.startsWith('blob:') ? '' : draft.pdfUrl}
                onChange={(e) => set({ pdfUrl: e.target.value })}
              />
            </div>
          </>
        )}

        {kind === 'questions' && (
          <>
            <div className="field">
              <label>Question text *</label>
              <textarea className="textarea" value={draft.text} onChange={(e) => set({ text: e.target.value })} />
            </div>
            <div className="grid grid-3">
              <div className="field">
                <label>Unit</label>
                <select className="select" value={draft.unit} onChange={(e) => set({ unit: Number(e.target.value) })}>
                  {[1, 2, 3, 4, 5].map((u) => (
                    <option key={u} value={u}>
                      Unit {u}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Label</label>
                <select className="select" value={draft.label} onChange={(e) => set({ label: e.target.value })}>
                  <option>Very Important</option>
                  <option>Frequently Asked</option>
                  <option>Repeated Question</option>
                  <option>Important Topic</option>
                  <option>Practice Question</option>
                </select>
              </div>
              {field('Topic', 'topic')}
            </div>
            <div className="field">
              <label>Years this question appeared in (comma-separated)</label>
              <input
                className="input"
                placeholder="e.g. 2023, 2025, 2026"
                value={draft.appearances.join(', ')}
                onChange={(e) =>
                  set({
                    appearances: e.target.value
                      .split(',')
                      .map((x: string) => parseInt(x.trim(), 10))
                      .filter((x: number) => !Number.isNaN(x)),
                  })
                }
              />
            </div>
          </>
        )}

        {kind === 'materials' && (
          <>
            {field('Title', 'title', 'text', true)}
            <div className="field">
              <label>Type</label>
              <select className="select" value={draft.type} onChange={(e) => set({ type: e.target.value })}>
                <option value="notes">Notes</option>
                <option value="guide">Revision guide</option>
                <option value="syllabus">Syllabus</option>
                <option value="lab">Lab manual</option>
              </select>
            </div>
            <div className="field">
              <label>Description</label>
              <textarea
                className="textarea"
                value={draft.description}
                onChange={(e) => set({ description: e.target.value })}
              />
            </div>
            {field('PDF URL', 'pdfUrl')}
            {field('Upload date', 'uploadedAt', 'date')}
          </>
        )}

        <div className="row" style={{ justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save}>
            Save changes
          </button>
        </div>
      </div>
    </Modal>
  );
}
