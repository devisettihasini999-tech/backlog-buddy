/* ==========================================================================
   Backlog Buddy — admin panel
   ========================================================================== */
(function () {
  'use strict';
  var U = window.BBUI, BB = window.BB;

  U.renderHeader('admin.html');
  U.renderFooter();

  var PANELS = [
    { id: 'overview', label: 'Overview', icon: 'trending' },
    { id: 'branches', label: 'Branches', icon: 'grid' },
    { id: 'semesters', label: 'Semesters', icon: 'calendar' },
    { id: 'subjects', label: 'Subjects', icon: 'book' },
    { id: 'papers', label: 'Question Papers', icon: 'file' },
    { id: 'questions', label: 'Important Questions', icon: 'flame' },
    { id: 'models', label: 'Model Papers', icon: 'layers' },
    { id: 'materials', label: 'Study Materials', icon: 'folder' },
    { id: 'settings', label: 'Settings & Data', icon: 'database' }
  ];
  var active = 'overview';

  BB.ready(function () {
    U.qs('#lock-ico').innerHTML = U.icon('lock', 21);
    if (BB.admin.isLoggedIn()) showApp();
    else showLogin();
  });

  /* ------------------------- auth ------------------------- */
  function showLogin() {
    U.qs('#login-gate').classList.remove('hidden');
    U.qs('#admin-app').classList.add('hidden');
    U.qs('#admin-login').addEventListener('click', function () {
      var u = U.qs('#admin-user').value.trim(), p = U.qs('#admin-pass').value;
      if (BB.admin.login(u, p)) { U.toast('Welcome back', 'Signed in as administrator.', 'success'); showApp(); }
      else U.toast('Sign in failed', 'Check the username and password.', 'error');
    });
    U.qs('#admin-pass').addEventListener('keydown', function (e) { if (e.key === 'Enter') U.qs('#admin-login').click(); });
  }

  function showApp() {
    U.qs('#login-gate').classList.add('hidden');
    U.qs('#admin-app').classList.remove('hidden');
    renderNav();
    renderPanels();
    BB.onChange(renderPanels);
  }

  function renderNav() {
    var host = U.qs('#admin-nav');
    host.innerHTML = PANELS.map(function (p) {
      return '<a data-panel="' + p.id + '" class="' + (active === p.id ? 'active' : '') + '">' + U.icon(p.icon, 17) + p.label + '</a>';
    }).join('') + '<div class="divider"></div>' +
      '<a id="admin-logout">' + U.icon('x', 17) + 'Sign out</a>' +
      '<a href="index.html">' + U.icon('external', 17) + 'View site</a>';
    U.qa('[data-panel]', host).forEach(function (a) {
      a.addEventListener('click', function () { active = a.getAttribute('data-panel'); renderNav(); renderPanels(); });
    });
    U.qs('#admin-logout').addEventListener('click', function () {
      BB.admin.logout(); U.toast('Signed out', '', 'info'); showLogin();
    });
  }

  function renderPanels() {
    var map = {
      overview: pOverview, branches: pBranches, semesters: pSemesters, subjects: pSubjects,
      papers: pPapers, questions: pQuestions, models: pModels, materials: pMaterials, settings: pSettings
    };
    U.qa('.admin-panel').forEach(function (el) { el.classList.remove('active'); });
    var host = U.qs('#panel-' + active);
    host.classList.add('active');
    host.innerHTML = map[active]();
    U.reveal();
  }

  /* ------------------------- shared bits ------------------------- */
  function bar(html) {
    return '<div class="admin-bar">' + html + '</div>';
  }
  function table(head, rows, emptyText) {
    if (!rows.length) return U.emptyState({ icon: 'database', title: emptyText || 'Nothing here yet', text: 'Use the button above to add your first record.' });
    return '<div class="table-wrap table-scroll"><table><thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join('') +
      '</tr></thead><tbody>' + rows.join('') + '</tbody></table></div>';
  }
  function subjectOptions(selected, onlyWithPapers) {
    return '<option value="">Select subject</option>' + BB.subjects({}).map(function (s) {
      if (onlyWithPapers && !s.paperCount) return '';
      return '<option value="' + s.id + '"' + (selected === s.id ? ' selected' : '') + '>' + U.esc(s.code) + ' - ' + U.esc(s.name) + ' (Sem ' + s.sem + ')</option>';
    }).join('');
  }
  function fileField(id) {
    return '<label class="field"><span>Attach PDF (optional - stored with the record)</span>' +
      '<input type="file" id="' + id + '" accept="application/pdf,.pdf"></label>' +
      '<p class="tiny muted mt-1">Leave empty to generate the paper PDF on demand. Attached files are kept in this browser for the demo.</p>';
  }

  /* ------------------------- overview ------------------------- */
  function pOverview() {
    var st = BB.stats();
    var kpis = [
      { v: st.branches, k: 'Branches' }, { v: st.subjects, k: 'Subjects' }, { v: st.papers, k: 'Question papers' },
      { v: st.questions, k: 'Important questions' }, { v: st.materials, k: 'Study materials' }
    ];
    var top = BB.db.subjects.filter(function (s) { return s.paperCount; }).sort(function (a, b) { return b.paperCount - a.paperCount; }).slice(0, 6);
    return '<div class="kpi-row">' + kpis.map(function (x) {
      return '<div class="stat"><div class="v">' + U.fmtNum(x.v) + '</div><div class="k">' + x.k + '</div></div>';
    }).join('') + '</div>' +

      bar('<a class="btn btn-primary btn-sm" data-goto="papers">' + U.icon('upload', 15) + 'Upload a question paper</a>' +
        '<a class="btn btn-soft btn-sm" data-goto="subjects">' + U.icon('plus', 15) + 'Add a subject</a>' +
        '<a class="btn btn-outline btn-sm" data-goto="questions">' + U.icon('flame', 15) + 'Add important questions</a>' +
        '<span class="spacer"></span>' +
        '<span class="badge ' + (BB.supabase.enabled ? 'badge-green' : 'badge-gray') + '" id="sb-badge">' + (BB.supabase.enabled ? 'Supabase connected' : 'Demo data') + '</span>') +

      '<div class="grid grid-2">' +
      '<div class="card"><div class="eyebrow" style="margin-bottom:10px">Subjects with the most papers</div>' +
      table(['Subject', 'Code', 'Papers', 'Questions'], top.map(function (s) {
        return '<tr><td><b>' + U.esc(s.name) + '</b></td><td>' + U.esc(s.code) + '</td><td>' + s.paperCount + '</td><td>' + s.questionCount + '</td></tr>';
      }), 'No papers uploaded yet') + '</div>' +

      '<div class="card"><div class="eyebrow" style="margin-bottom:10px">Recently uploaded papers</div>' +
      table(['Paper', 'Year', 'Type', 'Uploaded'], BB.db.papers.slice().sort(function (a, b) { return (b.uploadedAt || '').localeCompare(a.uploadedAt || ''); }).slice(0, 6).map(function (p) {
        var s = BB.subject(p.subject) || {};
        return '<tr><td><b>' + U.esc(s.name || '-') + '</b></td><td>' + p.year + '</td><td>' + U.esc(p.examType) + '</td><td class="tiny muted">' + U.fmtDate(p.uploadedAt) + '</td></tr>';
      }), 'No papers yet') + '</div></div>' +

      '<div class="callout mt-3"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>' +
      '<div><b>How storage works</b><p>Content added here is saved in this browser (local overlay) so you can test the full experience. When the Supabase tables from <span class="mono">supabase/schema.sql</span> are created, the same records are written to the database and the platform badge turns green.</p></div></div>';

    bindGoto();
  }

  function bindGoto() {
    U.qa('[data-goto]').forEach(function (a) {
      a.addEventListener('click', function () { active = a.getAttribute('data-goto'); renderNav(); renderPanels(); });
    });
  }

  /* ------------------------- branches ------------------------- */
  function pBranches() {
    return bar('<button class="btn btn-primary btn-sm" id="add-branch">' + U.icon('plus', 15) + 'Add branch</button>') +
      table(['Code', 'Name', 'Subjects', 'Papers', 'Icon', 'Actions'], BB.branches().map(function (b) {
        return '<tr><td><b>' + U.esc(b.code) + '</b></td><td>' + U.esc(b.name) + '</td>' +
          '<td>' + BB.subjects({ branch: b.id }).length + '</td><td>' + BB.filterPapers({ branch: b.id }).length + '</td>' +
          '<td class="tiny muted">' + U.esc(b.icon) + '</td>' +
          '<td><div class="row" style="gap:6px">' +
          '<button class="btn btn-outline btn-sm" data-ebranch="' + b.id + '">Edit</button>' +
          '<button class="btn btn-danger btn-sm" data-dbranch="' + b.id + '">Delete</button></div></td></tr>';
      }), 'No branches yet');

    bindBranch();
  }

  function bindBranch() {
    var add = U.qs('#add-branch');
    if (add) add.addEventListener('click', function () { branchForm(null); });
    U.qa('[data-ebranch]').forEach(function (b) {
      b.addEventListener('click', function () { branchForm(BB.branch(b.getAttribute('data-ebranch'))); });
    });
    U.qa('[data-dbranch]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-dbranch');
        confirmDelete('Delete branch?', 'Subjects and papers in this branch remain in the catalogue but the branch card will disappear.', function () {
          BB.admin.deleteBranch(id); U.toast('Branch deleted', '', 'success');
        });
      });
    });
  }

  function branchForm(b) {
    b = b || { id: '', code: '', name: '', icon: 'book', tone: 'blue', blurb: '', regulation: 'R20', university: 'JNTUK' };
    var icons = ['cpu', 'brain', 'chart', 'wave', 'bolt', 'gear', 'building', 'monitor', 'grid', 'book', 'database'];
    U.modal({
      title: b.id ? 'Edit branch' : 'Add branch', icon: 'grid',
      body: '<div class="stack">' +
        '<label class="field"><span>Branch name</span><input type="text" id="b-name" value="' + U.esc(b.name) + '" placeholder="Computer Science & Engineering"></label>' +
        '<div class="grid grid-2">' +
        '<label class="field"><span>Short code</span><input type="text" id="b-code" value="' + U.esc(b.code) + '" placeholder="CSE"></label>' +
        '<label class="field"><span>Icon</span><select id="b-icon">' + icons.map(function (i) { return '<option' + (b.icon === i ? ' selected' : '') + '>' + i + '</option>'; }).join('') + '</select></label>' +
        '</div>' +
        '<div class="grid grid-2">' +
        '<label class="field"><span>Regulation</span><input type="text" id="b-reg" value="' + U.esc(b.regulation) + '" placeholder="R20"></label>' +
        '<label class="field"><span>University</span><input type="text" id="b-uni" value="' + U.esc(b.university) + '" placeholder="JNTUK"></label>' +
        '</div>' +
        '<label class="field"><span>Short description</span><textarea id="b-blurb">' + U.esc(b.blurb) + '</textarea></label>' +
        '</div>',
      actions: '<button class="btn btn-outline btn-sm" data-close>Cancel</button><button class="btn btn-primary btn-sm" id="b-save">Save branch</button>',
      onMount: function (el, close) {
        U.qs('#b-save', el).addEventListener('click', function () {
          var name = U.qs('#b-name', el).value.trim();
          if (!name) { U.toast('Branch name is required', '', 'error'); return; }
          var rec = {
            id: b.id || BB.admin.nextId('br'),
            code: (U.qs('#b-code', el).value.trim() || name.slice(0, 4)).toUpperCase(),
            name: name,
            icon: U.qs('#b-icon', el).value,
            tone: 'blue',
            blurb: U.qs('#b-blurb', el).value.trim(),
            regulation: U.qs('#b-reg', el).value.trim() || 'R20',
            university: U.qs('#b-uni', el).value.trim() || 'JNTUK'
          };
          BB.admin.saveBranch(rec);
          close();
          U.toast('Branch saved', rec.name, 'success');
        });
      }
    });
  }

  /* ------------------------- semesters ------------------------- */
  function pSemesters() {
    return bar('<span class="badge badge-gray">' + BB.semesters().length + ' semesters configured</span>' +
      '<span class="spacer"></span><span class="tiny muted">Semesters follow the standard 1-8 engineering structure.</span>') +
      table(['#', 'Label', 'Note', 'Subjects', 'Papers'], BB.semesters().map(function (s) {
        return '<tr><td><b>' + s.n + '</b></td><td>' + U.esc(s.label) + '</td><td class="tiny muted">' + U.esc(s.note) + '</td>' +
          '<td>' + BB.subjects({ sem: s.n }).length + '</td><td>' + BB.filterPapers({ sem: s.n }).length + '</td></tr>';
      }), 'No semesters configured') +
      '<div class="callout mt-3"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>' +
      '<div><b>Extending the catalogue</b><p>To support more semesters, credit systems or academic years, add rows to the semester table in <span class="mono">supabase/schema.sql</span> and they appear here automatically.</p></div></div>';
  }

  /* ------------------------- subjects ------------------------- */
  var subFilter = { q: '', branch: '', sem: '' };
  function pSubjects() {
    var list = BB.subjects({ branch: subFilter.branch || undefined, sem: subFilter.sem || undefined }).filter(function (s) {
      return !subFilter.q || (s.name + ' ' + s.code).toLowerCase().indexOf(subFilter.q.toLowerCase()) !== -1;
    });
    return bar('<button class="btn btn-primary btn-sm" id="add-subject">' + U.icon('plus', 15) + 'Add subject</button>' +
      '<input type="search" id="sub-q" placeholder="Filter subjects..." value="' + U.esc(subFilter.q) + '" style="width:220px;padding:8px 12px">' +
      '<select id="sub-branch" style="width:auto;padding:8px 12px"><option value="">All branches</option>' +
      BB.branches().map(function (b) { return '<option value="' + b.id + '"' + (subFilter.branch === b.id ? ' selected' : '') + '>' + U.esc(b.code) + '</option>'; }).join('') + '</select>' +
      '<select id="sub-sem" style="width:auto;padding:8px 12px"><option value="">All semesters</option>' +
      BB.semesters().map(function (s) { return '<option value="' + s.n + '"' + (String(subFilter.sem) === String(s.n) ? ' selected' : '') + '>' + U.esc(s.label) + '</option>'; }).join('') + '</select>') +
      table(['Code', 'Name', 'Branch', 'Sem', 'Papers', 'Questions', 'Actions'], list.slice(0, 40).map(function (s) {
        return '<tr><td><b>' + U.esc(s.code) + '</b></td><td>' + U.esc(s.name) + '</td>' +
          '<td>' + U.esc(BB.branch(s.branch).code) + '</td><td>' + s.sem + '</td>' +
          '<td>' + s.paperCount + '</td><td>' + s.questionCount + '</td>' +
          '<td><div class="row" style="gap:6px">' +
          '<a class="btn btn-outline btn-sm" href="subject.html?id=' + encodeURIComponent(s.id) + '" target="_blank">View</a>' +
          '<button class="btn btn-outline btn-sm" data-esubject="' + s.id + '">Edit</button>' +
          '<button class="btn btn-danger btn-sm" data-dsubject="' + s.id + '">Delete</button></div></td></tr>';
      }), 'No subjects match') + (list.length > 40 ? '<p class="tiny muted mt-2">Showing the first 40 of ' + list.length + ' subjects. Use the filters above to narrow down.</p>' : '');

    bindSubjects();
  }

  function bindSubjects() {
    var q = U.qs('#sub-q'), b = U.qs('#sub-branch'), s = U.qs('#sub-sem'), t;
    if (q) q.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { subFilter.q = q.value; renderPanels(); }, 180); });
    if (b) b.addEventListener('change', function () { subFilter.branch = b.value; renderPanels(); });
    if (s) s.addEventListener('change', function () { subFilter.sem = s.value; renderPanels(); });
    var add = U.qs('#add-subject');
    if (add) add.addEventListener('click', function () { subjectForm(null); });
    U.qa('[data-esubject]').forEach(function (x) { x.addEventListener('click', function () { subjectForm(BB.subject(x.getAttribute('data-esubject'))); }); });
    U.qa('[data-dsubject]').forEach(function (x) {
      x.addEventListener('click', function () {
        var id = x.getAttribute('data-dsubject');
        confirmDelete('Delete subject?', 'Its papers, questions and study materials will also be hidden from the catalogue.', function () {
          BB.admin.deleteSubject(id); U.toast('Subject deleted', '', 'success');
        });
      });
    });
  }

  function subjectForm(s) {
    s = s || { id: '', branch: 'cse', sem: 3, code: '', name: '', credits: 3, regulation: 'R20', university: 'JNTUK', desc: '', units: [], featured: false };
    U.modal({
      title: s.id ? 'Edit subject' : 'Add subject', icon: 'book',
      body: '<div class="stack">' +
        '<div class="grid grid-2">' +
        '<label class="field"><span>Subject name</span><input type="text" id="s-name" value="' + U.esc(s.name) + '" placeholder="Data Structures"></label>' +
        '<label class="field"><span>Subject code</span><input type="text" id="s-code" value="' + U.esc(s.code) + '" placeholder="21CS32"></label>' +
        '</div>' +
        '<div class="grid grid-3">' +
        '<label class="field"><span>Branch</span><select id="s-branch">' + BB.branches().map(function (b) { return '<option value="' + b.id + '"' + (s.branch === b.id ? ' selected' : '') + '>' + U.esc(b.code) + '</option>'; }).join('') + '</select></label>' +
        '<label class="field"><span>Semester</span><select id="s-sem">' + BB.semesters().map(function (x) { return '<option value="' + x.n + '"' + (s.sem === x.n ? ' selected' : '') + '>' + U.esc(x.label) + '</option>'; }).join('') + '</select></label>' +
        '<label class="field"><span>Credits</span><input type="number" id="s-credits" step="0.5" value="' + s.credits + '"></label>' +
        '</div>' +
        '<div class="grid grid-2">' +
        '<label class="field"><span>Regulation</span><input type="text" id="s-reg" value="' + U.esc(s.regulation) + '"></label>' +
        '<label class="field"><span>University</span><input type="text" id="s-uni" value="' + U.esc(s.university) + '"></label>' +
        '</div>' +
        '<label class="field"><span>Description</span><textarea id="s-desc">' + U.esc(s.desc) + '</textarea></label>' +
        '<label class="field"><span>Unit titles (one per line)</span><textarea id="s-units" placeholder="Introduction &amp; Linear Structures&#10;Stacks, Queues &amp; Recursion">' +
        U.esc((s.units || []).map(function (u) { return u.title; }).join('\n')) + '</textarea></label>' +
        '<label class="checkbox"><input type="checkbox" id="s-featured"' + (s.featured ? ' checked' : '') + '><span>Feature on the home page</span></label>' +
        '</div>',
      actions: '<button class="btn btn-outline btn-sm" data-close>Cancel</button><button class="btn btn-primary btn-sm" id="s-save">Save subject</button>',
      onMount: function (el, close) {
        U.qs('#s-save', el).addEventListener('click', function () {
          var name = U.qs('#s-name', el).value.trim();
          if (!name) { U.toast('Subject name is required', '', 'error'); return; }
          var unitTitles = U.qs('#s-units', el).value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
          var units = unitTitles.length ? unitTitles.map(function (t, i) { return { n: i + 1, title: t, topics: [] }; })
            : (s.units || []).map(function (u) { return { n: u.n, title: u.title, topics: u.topics || [] }; });
          var rec = {
            id: s.id || BB.admin.nextId('sub'),
            branch: U.qs('#s-branch', el).value,
            sem: +U.qs('#s-sem', el).value,
            code: U.qs('#s-code', el).value.trim() || 'NEW',
            name: name,
            credits: parseFloat(U.qs('#s-credits', el).value) || 3,
            regulation: U.qs('#s-reg', el).value.trim() || 'R20',
            university: U.qs('#s-uni', el).value.trim() || 'JNTUK',
            desc: U.qs('#s-desc', el).value.trim() || name + ' is available on Backlog Buddy.',
            units: units,
            featured: U.qs('#s-featured', el).checked
          };
          BB.admin.saveSubject(rec);
          close();
          U.toast('Subject saved', rec.name, 'success');
        });
      }
    });
  }

  /* ------------------------- papers ------------------------- */
  var paperFilter = { q: '', subject: '' };
  function pPapers() {
    var list = BB.db.papers.filter(function (p) {
      var s = BB.subject(p.subject) || {};
      if (paperFilter.subject && p.subject !== paperFilter.subject) return false;
      if (paperFilter.q && (s.name + ' ' + s.code + ' ' + p.year + ' ' + p.examType).toLowerCase().indexOf(paperFilter.q.toLowerCase()) === -1) return false;
      return true;
    }).sort(function (a, b) { return (b.uploadedAt || '').localeCompare(a.uploadedAt || ''); });
    return bar('<button class="btn btn-primary btn-sm" id="add-paper">' + U.icon('upload', 15) + 'Upload question paper</button>' +
      '<input type="search" id="pap-q" placeholder="Filter papers..." value="' + U.esc(paperFilter.q) + '" style="width:220px;padding:8px 12px">' +
      '<select id="pap-subject" style="width:auto;padding:8px 12px"><option value="">All subjects</option>' +
      BB.subjects({}).map(function (s) { return '<option value="' + s.id + '"' + (paperFilter.subject === s.id ? ' selected' : '') + '>' + U.esc(s.code) + ' - ' + U.esc(s.name) + '</option>'; }).join('') + '</select>' +
      '<span class="spacer"></span><span class="badge badge-gray">' + list.length + ' papers</span>') +
      table(['Year', 'Subject', 'Code', 'Branch', 'Sem', 'Type', 'Reg', 'File', 'Uploaded', 'Actions'], list.slice(0, 30).map(function (p) {
        var s = BB.subject(p.subject) || {};
        return '<tr><td><b>' + p.year + '</b></td><td>' + U.esc(s.name || '-') + '</td><td>' + U.esc(s.code || '-') + '</td>' +
          '<td>' + U.esc(BB.branch(s.branch) ? BB.branch(s.branch).code : '-') + '</td><td>' + (s.sem || '-') + '</td>' +
          '<td>' + U.esc(p.examType) + '</td><td>' + U.esc(s.regulation || '-') + '</td>' +
          '<td class="tiny muted">' + (p.file ? (p.file.length > 40 ? 'Attached PDF' : U.esc(p.file.split('/').pop())) : 'Generated') + '</td>' +
          '<td class="tiny muted">' + U.fmtDate(p.uploadedAt) + '</td>' +
          '<td><div class="row" style="gap:6px">' +
          '<a class="btn btn-outline btn-sm" href="paper.html?id=' + encodeURIComponent(p.id) + '" target="_blank">View</a>' +
          '<button class="btn btn-outline btn-sm" data-epaper="' + p.id + '">Edit</button>' +
          '<button class="btn btn-danger btn-sm" data-dpaper="' + p.id + '">Delete</button></div></td></tr>';
      }), 'No papers uploaded yet');

    bindPapers();
  }

  function bindPapers() {
    var q = U.qs('#pap-q'), s = U.qs('#pap-subject'), t;
    if (q) q.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { paperFilter.q = q.value; renderPanels(); }, 180); });
    if (s) s.addEventListener('change', function () { paperFilter.subject = s.value; renderPanels(); });
    var add = U.qs('#add-paper');
    if (add) add.addEventListener('click', function () { paperForm(null); });
    U.qa('[data-epaper]').forEach(function (x) { x.addEventListener('click', function () { paperForm(BB.idx.paper[x.getAttribute('data-epaper')]); }); });
    U.qa('[data-dpaper]').forEach(function (x) {
      x.addEventListener('click', function () {
        var id = x.getAttribute('data-dpaper');
        confirmDelete('Delete paper?', 'The paper will be removed from the library and from student dashboards.', function () {
          BB.admin.deletePaper(id); U.toast('Paper deleted', '', 'success');
        });
      });
    });
  }

  function paperForm(p) {
    p = p || { id: '', subject: '', year: 2026, examType: 'Regular', file: '', uploadedAt: new Date().toISOString(), downloads: 0 };
    U.modal({
      title: p.id ? 'Edit question paper' : 'Upload question paper', icon: 'upload',
      body: '<div class="stack">' +
        '<label class="field"><span>Subject</span><select id="p-subject">' + subjectOptions(p.subject) + '</select></label>' +
        '<div class="grid grid-3">' +
        '<label class="field"><span>Academic year</span><input type="number" id="p-year" value="' + p.year + '" min="2015" max="2030"></label>' +
        '<label class="field"><span>Exam type</span><select id="p-type">' +
        ['Regular', 'Supplementary', 'Backlog', 'Makeup'].map(function (t) { return '<option' + (p.examType === t ? ' selected' : '') + '>' + t + '</option>'; }).join('') + '</select></label>' +
        '<label class="field"><span>Max marks</span><input type="number" id="p-marks" value="' + (p.marks || 60) + '"></label>' +
        '</div>' +
        '<div class="grid grid-2">' +
        '<label class="field"><span>Duration</span><input type="text" id="p-duration" value="' + U.esc(p.duration || '3 hours') + '"></label>' +
        '<label class="field"><span>File path or URL (optional)</span><input type="text" id="p-file" value="' + (p.file && p.file.indexOf('data:') === 0 ? '' : U.esc(p.file || '')) + '" placeholder="papers/cse-21cs32-2025-regular.pdf"></label>' +
        '</div>' +
        fileField('p-upload') +
        (p.file && p.file.indexOf('data:') === 0 ? '<p class="tiny muted">A PDF file is already attached to this record.</p>' : '') +
        '</div>',
      actions: '<button class="btn btn-outline btn-sm" data-close>Cancel</button><button class="btn btn-primary btn-sm" id="p-save">Save paper</button>',
      onMount: function (el, close) {
        U.qs('#p-save', el).addEventListener('click', function () {
          var subj = BB.subject(U.qs('#p-subject', el).value);
          if (!subj) { U.toast('Choose a subject', '', 'error'); return; }
          var fileInput = U.qs('#p-upload', el);
          var finish = function (fileVal) {
            var rec = {
              id: p.id || BB.admin.nextId('p'),
              subject: subj.id,
              year: +U.qs('#p-year', el).value || 2026,
              examType: U.qs('#p-type', el).value,
              marks: +U.qs('#p-marks', el).value || 60,
              duration: U.qs('#p-duration', el).value.trim() || '3 hours',
              file: fileVal || null,
              uploadedAt: p.uploadedAt || new Date().toISOString(),
              downloads: p.downloads || 0,
              qids: p.qids || []
            };
            BB.admin.savePaper(rec);
            close();
            U.toast('Paper saved', subj.name + ' ' + rec.year, 'success');
          };
          if (fileInput && fileInput.files && fileInput.files[0]) {
            var f = fileInput.files[0];
            if (f.size > 1500000) { U.toast('File too large for demo storage', 'Keep PDFs under 1.5 MB or use a file path.', 'error'); return; }
            var r = new FileReader();
            r.onload = function () { finish(r.result); };
            r.readAsDataURL(f);
          } else finish(U.qs('#p-file', el).value.trim() || (p.file && p.file.indexOf('data:') === 0 ? p.file : ''));
        });
      }
    });
  }

  /* ------------------------- questions ------------------------- */
  var qFilter = { q: '', subject: '', tag: '' };
  function pQuestions() {
    var list = BB.db.questions.filter(function (q) {
      var s = BB.subject(q.subject) || {};
      if (qFilter.subject && q.subject !== qFilter.subject) return false;
      if (qFilter.tag && q.tags.indexOf(qFilter.tag) === -1) return false;
      if (qFilter.q && (q.text + ' ' + (q.topic || '')).toLowerCase().indexOf(qFilter.q.toLowerCase()) === -1) return false;
      return true;
    });
    return bar('<button class="btn btn-primary btn-sm" id="add-q">' + U.icon('plus', 15) + 'Add question</button>' +
      '<input type="search" id="q-q" placeholder="Filter questions..." value="' + U.esc(qFilter.q) + '" style="width:220px;padding:8px 12px">' +
      '<select id="q-subject" style="width:auto;padding:8px 12px"><option value="">All subjects</option>' +
      BB.subjects({}).map(function (s) { return '<option value="' + s.id + '"' + (qFilter.subject === s.id ? ' selected' : '') + '>' + U.esc(s.code) + ' - ' + U.esc(s.name) + '</option>'; }).join('') + '</select>' +
      '<select id="q-tag" style="width:auto;padding:8px 12px"><option value="">All labels</option>' +
      ['vi', 'fa', 'rq', 'it', 'pq'].map(function (t) { return '<option value="' + t + '"' + (qFilter.tag === t ? ' selected' : '') + '>' + BB.TAG_META[t].label + '</option>'; }).join('') + '</select>' +
      '<span class="spacer"></span><span class="badge badge-gray">' + list.length + ' questions</span>') +
      table(['Question', 'Subject', 'Unit', 'Labels', 'Years', 'Actions'], list.slice(0, 30).map(function (q) {
        var s = BB.subject(q.subject) || {};
        return '<tr><td style="max-width:380px">' + U.esc(q.text) + '</td><td class="tiny">' + U.esc(s.code || '-') + '</td>' +
          '<td>' + q.unit + '</td><td>' + q.tags.map(function (t) { return '<span class="badge ' + BB.TAG_META[t].cls + '">' + BB.TAG_META[t].label + '</span>'; }).join(' ') + '</td>' +
          '<td class="tiny muted">' + (q.years || []).join(', ') + '</td>' +
          '<td><div class="row" style="gap:6px">' +
          '<button class="btn btn-outline btn-sm" data-eq="' + q.id + '">Edit</button>' +
          '<button class="btn btn-danger btn-sm" data-dq="' + q.id + '">Delete</button></div></td></tr>';
      }), 'No questions match');

    bindQuestions();
  }

  function bindQuestions() {
    var q = U.qs('#q-q'), s = U.qs('#q-subject'), t2 = U.qs('#q-tag'), t;
    if (q) q.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { qFilter.q = q.value; renderPanels(); }, 180); });
    if (s) s.addEventListener('change', function () { qFilter.subject = s.value; renderPanels(); });
    if (t2) t2.addEventListener('change', function () { qFilter.tag = t2.value; renderPanels(); });
    var add = U.qs('#add-q');
    if (add) add.addEventListener('click', function () { questionForm(null); });
    U.qa('[data-eq]').forEach(function (x) { x.addEventListener('click', function () { questionForm(BB.idx.question[x.getAttribute('data-eq')]); }); });
    U.qa('[data-dq]').forEach(function (x) {
      x.addEventListener('click', function () {
        var id = x.getAttribute('data-dq');
        confirmDelete('Delete question?', 'It will no longer appear in important questions or repeated topic analysis.', function () {
          BB.admin.deleteQuestion(id); U.toast('Question deleted', '', 'success');
        });
      });
    });
  }

  function questionForm(q) {
    q = q || { id: '', subject: '', unit: 1, text: '', topic: '', tags: ['pq'], years: [2026], marks: 5 };
    U.modal({
      title: q.id ? 'Edit question' : 'Add important question', icon: 'flame',
      body: '<div class="stack">' +
        '<div class="grid grid-2">' +
        '<label class="field"><span>Subject</span><select id="q2-subject">' + subjectOptions(q.subject) + '</select></label>' +
        '<label class="field"><span>Unit</span><select id="q2-unit">' + [1, 2, 3, 4, 5].map(function (n) { return '<option' + (q.unit === n ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></label>' +
        '</div>' +
        '<label class="field"><span>Question text</span><textarea id="q2-text">' + U.esc(q.text) + '</textarea></label>' +
        '<label class="field"><span>Topic (used for repeated question analysis)</span><input type="text" id="q2-topic" value="' + U.esc(q.topic || '') + '" placeholder="Stack operations"></label>' +
        '<label class="field"><span>Labels</span><select id="q2-tags" multiple size="5">' +
        ['vi', 'fa', 'rq', 'it', 'pq'].map(function (t) {
          return '<option value="' + t + '"' + ((q.tags || []).indexOf(t) !== -1 ? ' selected' : '') + '>' + BB.TAG_META[t].label + '</option>';
        }).join('') + '</select></label>' +
        '<label class="field"><span>Years seen in previous papers (comma separated)</span><input type="text" id="q2-years" value="' + U.esc((q.years || []).join(', ')) + '"></label>' +
        '<div class="callout warn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg>' +
        '<div><b>Label honestly</b><p>Only mark a question as repeated if it actually appears in the papers you have uploaded. Labels are preparation guidance for students, never a guarantee.</p></div></div>' +
        '</div>',
      actions: '<button class="btn btn-outline btn-sm" data-close>Cancel</button><button class="btn btn-primary btn-sm" id="q2-save">Save question</button>',
      onMount: function (el, close) {
        U.qs('#q2-save', el).addEventListener('click', function () {
          var text = U.qs('#q2-text', el).value.trim();
          if (!text) { U.toast('Question text is required', '', 'error'); return; }
          var tags = Array.prototype.slice.call(U.qs('#q2-tags', el).selectedOptions).map(function (o) { return o.value; });
          var years = U.qs('#q2-years', el).value.split(',').map(function (x) { return parseInt(x.trim(), 10); }).filter(function (n) { return !isNaN(n); });
          var rec = {
            id: q.id || BB.admin.nextId('q'),
            subject: U.qs('#q2-subject', el).value,
            unit: +U.qs('#q2-unit', el).value,
            text: text,
            topic: U.qs('#q2-topic', el).value.trim() || text.slice(0, 48),
            tags: tags.length ? tags : ['pq'],
            years: years.length ? years : [new Date().getFullYear()],
            marks: q.marks || 5
          };
          BB.admin.saveQuestion(rec);
          close();
          U.toast('Question saved', '', 'success');
        });
      }
    });
  }

  /* ------------------------- model papers ------------------------- */
  function pModels() {
    var models = BB.db.materials.filter(function (m) { return m.type === 'Model Paper'; });
    return bar('<button class="btn btn-primary btn-sm" id="add-model">' + U.icon('plus', 15) + 'Add model paper</button>' +
      '<span class="spacer"></span><span class="badge badge-gray">' + models.length + ' model papers</span>') +
      '<p class="small muted mb-2">Model papers are also generated automatically for every subject that has questions (see the subject page). Records added here appear in the study materials list.</p>' +
      table(['Title', 'Subject', 'Size', 'Link', 'Added', 'Actions'], models.map(function (m) {
        var s = BB.subject(m.subject) || {};
        return '<tr><td><b>' + U.esc(m.title) + '</b></td><td>' + U.esc(s.code || '-') + ' ' + U.esc(s.name || '') + '</td>' +
          '<td>' + U.esc(m.size) + '</td><td class="tiny muted">' + (m.url ? U.esc(m.url.slice(0, 40)) : 'Generated file') + '</td>' +
          '<td class="tiny muted">' + U.fmtDate(m.addedAt) + '</td>' +
          '<td><div class="row" style="gap:6px">' +
          '<button class="btn btn-outline btn-sm" data-emodel="' + m.id + '">Edit</button>' +
          '<button class="btn btn-danger btn-sm" data-dmodel="' + m.id + '">Delete</button></div></td></tr>';
      }), 'No model papers added yet');

    bindModels();
  }

  function bindModels() {
    var add = U.qs('#add-model');
    if (add) add.addEventListener('click', function () { materialForm(null, 'Model Paper'); });
    U.qa('[data-emodel]').forEach(function (x) { x.addEventListener('click', function () { materialForm(BB.idx.material[x.getAttribute('data-emodel')], 'Model Paper'); }); });
    U.qa('[data-dmodel]').forEach(function (x) {
      x.addEventListener('click', function () {
        var id = x.getAttribute('data-dmodel');
        confirmDelete('Delete model paper?', '', function () { BB.admin.deleteMaterial(id); U.toast('Model paper deleted', '', 'success'); });
      });
    });
  }

  /* ------------------------- materials ------------------------- */
  var matFilter = { q: '', type: '' };
  function pMaterials() {
    var list = BB.db.materials.filter(function (m) {
      if (matFilter.type && m.type !== matFilter.type) return false;
      if (matFilter.q && (m.title + ' ' + m.type).toLowerCase().indexOf(matFilter.q.toLowerCase()) === -1) return false;
      return true;
    });
    return bar('<button class="btn btn-primary btn-sm" id="add-mat">' + U.icon('plus', 15) + 'Add study material</button>' +
      '<input type="search" id="mat-q" placeholder="Filter materials..." value="' + U.esc(matFilter.q) + '" style="width:220px;padding:8px 12px">' +
      '<select id="mat-type" style="width:auto;padding:8px 12px"><option value="">All types</option>' +
      ['Syllabus', 'Notes', 'Important Questions', 'Formula Sheet', 'Question Papers', 'Video', 'Model Paper'].map(function (t) {
        return '<option' + (matFilter.type === t ? ' selected' : '') + '>' + t + '</option>';
      }).join('') + '</select>' +
      '<span class="spacer"></span><span class="badge badge-gray">' + list.length + ' resources</span>') +
      table(['Title', 'Type', 'Subject', 'Size', 'Link', 'Actions'], list.slice(0, 30).map(function (m) {
        var s = BB.subject(m.subject) || {};
        return '<tr><td><b>' + U.esc(m.title) + '</b></td><td>' + U.esc(m.type) + '</td>' +
          '<td class="tiny">' + U.esc(s.code || '-') + '</td><td>' + U.esc(m.size) + '</td>' +
          '<td class="tiny muted">' + (m.url ? U.esc(m.url.slice(0, 34)) : 'Generated') + '</td>' +
          '<td><div class="row" style="gap:6px">' +
          '<button class="btn btn-outline btn-sm" data-emat="' + m.id + '">Edit</button>' +
          '<button class="btn btn-danger btn-sm" data-dmat="' + m.id + '">Delete</button></div></td></tr>';
      }), 'No study materials match');

    bindMaterials();
  }

  function bindMaterials() {
    var q = U.qs('#mat-q'), t = U.qs('#mat-type'), tmr;
    if (q) q.addEventListener('input', function () { clearTimeout(tmr); tmr = setTimeout(function () { matFilter.q = q.value; renderPanels(); }, 180); });
    if (t) t.addEventListener('change', function () { matFilter.type = t.value; renderPanels(); });
    var add = U.qs('#add-mat');
    if (add) add.addEventListener('click', function () { materialForm(null, 'Notes'); });
    U.qa('[data-emat]').forEach(function (x) { x.addEventListener('click', function () { materialForm(BB.idx.material[x.getAttribute('data-emat')]); }); });
    U.qa('[data-dmat]').forEach(function (x) {
      x.addEventListener('click', function () {
        var id = x.getAttribute('data-dmat');
        confirmDelete('Delete study material?', '', function () { BB.admin.deleteMaterial(id); U.toast('Material deleted', '', 'success'); });
      });
    });
  }

  function materialForm(m, defaultType) {
    m = m || { id: '', subject: '', title: '', type: defaultType || 'Notes', size: '', url: '' };
    U.modal({
      title: m.id ? 'Edit resource' : 'Add study material', icon: 'folder',
      body: '<div class="stack">' +
        '<label class="field"><span>Subject</span><select id="m-subject">' + subjectOptions(m.subject) + '</select></label>' +
        '<label class="field"><span>Title</span><input type="text" id="m-title" value="' + U.esc(m.title) + '" placeholder="Unit wise notes"></label>' +
        '<div class="grid grid-2">' +
        '<label class="field"><span>Type</span><select id="m-type">' +
        ['Syllabus', 'Notes', 'Important Questions', 'Formula Sheet', 'Question Papers', 'Video', 'Model Paper'].map(function (t) {
          return '<option' + (m.type === t ? ' selected' : '') + '>' + t + '</option>';
        }).join('') + '</select></label>' +
        '<label class="field"><span>Size</span><input type="text" id="m-size" value="' + U.esc(m.size || '') + '" placeholder="240 KB"></label>' +
        '</div>' +
        '<label class="field"><span>External link (optional)</span><input type="url" id="m-url" value="' + U.esc(m.url || '') + '" placeholder="https://nptel.ac.in/..."></label>' +
        '<p class="tiny muted">Without a link the resource is generated from the subject content when a student downloads it.</p>' +
        '</div>',
      actions: '<button class="btn btn-outline btn-sm" data-close>Cancel</button><button class="btn btn-primary btn-sm" id="m-save">Save resource</button>',
      onMount: function (el, close) {
        U.qs('#m-save', el).addEventListener('click', function () {
          var subj = BB.subject(U.qs('#m-subject', el).value);
          var title = U.qs('#m-title', el).value.trim();
          if (!subj || !title) { U.toast('Subject and title are required', '', 'error'); return; }
          var rec = {
            id: m.id || BB.admin.nextId('m'),
            subject: subj.id,
            title: title,
            type: U.qs('#m-type', el).value,
            size: U.qs('#m-size', el).value.trim() || '120 KB',
            url: U.qs('#m-url', el).value.trim() || null,
            addedAt: m.addedAt || new Date().toISOString()
          };
          BB.admin.saveMaterial(rec);
          close();
          U.toast('Resource saved', title, 'success');
        });
      }
    });
  }

  /* ------------------------- settings ------------------------- */
  function pSettings() {
    var st = BB.stats();
    return '<div class="grid grid-2">' +
      '<div class="card"><div class="eyebrow" style="margin-bottom:10px">Database connection</div>' +
      '<div class="kv"><span class="k">Project URL</span><span class="v mono tiny">' + U.esc(BB.SUPABASE.url) + '</span></div>' +
      '<div class="kv"><span class="k">Status</span><span class="v"><span class="badge ' + (BB.supabase.enabled ? 'badge-green' : 'badge-gray') + '">' + (BB.supabase.enabled ? 'Connected' : 'Not provisioned') + '</span></span></div>' +
      '<div class="kv"><span class="k">Message</span><span class="v tiny">' + U.esc(BB.supabase.message || 'Not checked yet') + '</span></div>' +
      '<div class="kv"><span class="k">Schema file</span><span class="v mono tiny">supabase/schema.sql</span></div>' +
      '<p class="small muted mt-2">Run <span class="mono">supabase/schema.sql</span> in the Supabase SQL editor to create the branches, semesters, subjects, question_papers, questions and study_materials tables. The site switches to the live database automatically once the tables exist.</p>' +
      '<button class="btn btn-soft btn-sm mt-2" id="recheck">Re-check connection</button></div>' +

      '<div class="card"><div class="eyebrow" style="margin-bottom:10px">Content summary</div>' +
      '<div class="kv"><span class="k">Branches</span><span class="v">' + st.branches + '</span></div>' +
      '<div class="kv"><span class="k">Semesters</span><span class="v">' + BB.semesters().length + '</span></div>' +
      '<div class="kv"><span class="k">Subjects</span><span class="v">' + st.subjects + '</span></div>' +
      '<div class="kv"><span class="k">Question papers</span><span class="v">' + st.papers + '</span></div>' +
      '<div class="kv"><span class="k">Questions</span><span class="v">' + st.questions + '</span></div>' +
      '<div class="kv"><span class="k">Study materials</span><span class="v">' + st.materials + '</span></div>' +
      '</div></div>' +

      '<div class="card mt-3"><div class="eyebrow" style="margin-bottom:10px">Data tools</div>' +
      '<div class="row row-wrap">' +
      '<button class="btn btn-outline btn-sm" id="export-json">Export all content as JSON</button>' +
      '<button class="btn btn-danger btn-sm" id="reset-demo">Reset to bundled demo data</button>' +
      '</div>' +
      '<p class="small muted mt-2">Export is useful when migrating local content into Supabase or another college database. Resetting clears every local admin change and restores the bundled demo dataset.</p>' +
      '</div>' +

      '<div class="callout warn mt-3"><svg viewBox="0.0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg>' +
      '<div><b>Security note</b><p>This demo panel uses a fixed username and password so the flow can be tested. For production, enable Supabase Auth, keep the secret key on the server only, and protect every table with row level security policies.</p></div></div>';

    bindSettings();
  }

  function bindSettings() {
    var re = U.qs('#recheck');
    if (re) re.addEventListener('click', function () {
      BB.supabase.checked = false;
      BB.checkSupabase().then(function () { renderPanels(); U.toast('Connection checked', BB.supabase.message, BB.supabase.enabled ? 'success' : 'info'); });
    });
    var ex = U.qs('#export-json');
    if (ex) ex.addEventListener('click', function () {
      U.download('backlog-buddy-content.json', BB.admin.exportJSON(), 'application/json');
      U.toast('Export started', 'backlog-buddy-content.json', 'success');
    });
    var rs = U.qs('#reset-demo');
    if (rs) rs.addEventListener('click', function () {
      confirmDelete('Reset all local content?', 'Every branch, subject, paper, question and material added in this browser is removed and the bundled demo dataset is restored.', function () {
        BB.admin.resetDemo(); U.toast('Demo data restored', '', 'success');
      });
    });
  }

  /* ------------------------- confirm helper ------------------------- */
  function confirmDelete(title, text, onYes) {
    U.modal({
      title: title, icon: 'alert',
      body: '<p>' + U.esc(text || 'This action cannot be undone.') + '</p>',
      actions: '<button class="btn btn-outline btn-sm" data-close>Cancel</button><button class="btn btn-primary btn-sm" id="cf-yes">Yes, delete</button>',
      onMount: function (el, close) {
        U.qs('#cf-yes', el).addEventListener('click', function () { onYes(); close(); });
      }
    });
  }
})();
