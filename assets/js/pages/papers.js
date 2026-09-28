/* ==========================================================================
   Backlog Buddy — question paper library with filters
   ========================================================================== */
(function () {
  'use strict';
  var U = window.BBUI, BB = window.BB;

  U.renderHeader('papers.html');
  U.renderFooter();

  var state = { q: '', branch: '', sem: '', subject: '', code: '', year: '', type: '', reg: '', saved: false, sort: 'new', page: 1, perPage: 24 };

  BB.ready(function () {
    var p = U.params();
    state.branch = p.branch || '';
    state.sem = p.sem || '';
    state.subject = p.subject || '';
    state.year = p.year || '';
    state.q = p.q || '';

    buildFilters();
    wire();
    render();
    BB.checkSupabase().then(function (s) {
      var b = U.qs('#mode-badge');
      b.textContent = s.enabled ? 'Supabase connected' : 'Demo data';
      b.className = 'badge ' + (s.enabled ? 'badge-green' : 'badge-gray');
    });
  });

  function opt(sel, value, label) {
    var o = document.createElement('option');
    o.value = value; o.textContent = label;
    sel.appendChild(o);
  }

  function buildFilters() {
    var b = U.qs('#f-branch');
    BB.branches().forEach(function (x) { opt(b, x.id, x.code + ' - ' + x.name); });
    b.value = state.branch;

    var s = U.qs('#f-sem');
    BB.semesters().forEach(function (x) { opt(s, x.n, x.label); });
    s.value = state.sem;

    var sub = U.qs('#f-subject');
    BB.subjects({ branch: state.branch || undefined }).forEach(function (x) { opt(sub, x.id, x.code + ' - ' + x.name); });
    sub.value = state.subject;

    var y = U.qs('#f-year');
    [2026, 2025, 2024, 2023].forEach(function (n) { opt(y, n, n + (n === 2026 ? ' (latest)' : '')); });
    y.value = state.year;

    var t = U.qs('#f-type');
    ['Regular', 'Supplementary', 'Backlog', 'Makeup'].forEach(function (n) { opt(t, n, n); });

    var r = U.qs('#f-reg');
    var regs = {};
    BB.db.subjects.forEach(function (x) { regs[x.regulation] = 1; });
    Object.keys(regs).sort().forEach(function (n) { opt(r, n, n + ' regulation'); });

    U.qs('#q').value = state.q;
    U.qs('#f-code').value = state.code;
  }

  function wire() {
    var map = { '#q': 'q', '#f-branch': 'branch', '#f-sem': 'sem', '#f-subject': 'subject', '#f-code': 'code', '#f-year': 'year', '#f-type': 'type', '#f-reg': 'reg' };
    Object.keys(map).forEach(function (sel) {
      var el = U.qs(sel);
      var ev = el.tagName === 'SELECT' ? 'change' : 'input';
      var t;
      el.addEventListener(ev, function () {
        clearTimeout(t);
        t = setTimeout(function () { state[map[sel]] = el.value; state.page = 1; render(); }, 120);
      });
    });
    U.qs('#f-branch').addEventListener('change', function () {
      var sub = U.qs('#f-subject');
      sub.innerHTML = '<option value="">All subjects</option>';
      BB.subjects({ branch: state.branch || undefined }).forEach(function (x) { opt(sub, x.id, x.code + ' - ' + x.name); });
      state.subject = '';
    });
    U.qs('#f-saved').addEventListener('change', function () { state.saved = this.checked; state.page = 1; render(); });
    U.qs('#reset').addEventListener('click', function () {
      state = { q: '', branch: '', sem: '', subject: '', code: '', year: '', type: '', reg: '', saved: false, sort: state.sort, page: 1, perPage: 24 };
      Object.keys(map).forEach(function (sel) { U.qs(sel).value = ''; });
      U.qs('#f-saved').checked = false;
      var sub = U.qs('#f-subject');
      sub.innerHTML = '<option value="">All subjects</option>';
      BB.subjects().forEach(function (x) { opt(sub, x.id, x.code + ' - ' + x.name); });
      render();
      U.toast('Filters reset', '', 'info');
    });
    U.qs('#sort-btn').addEventListener('click', function () {
      state.sort = state.sort === 'new' ? 'old' : state.sort === 'old' ? 'downloads' : 'new';
      this.textContent = 'Sort: ' + (state.sort === 'new' ? 'Newest first' : state.sort === 'old' ? 'Oldest first' : 'Most downloaded');
      render();
    });
    U.qs('#load-more').addEventListener('click', function () { state.page++; render(); });
  }

  function list() {
    var out = BB.filterPapers({
      q: state.q, branch: state.branch, sem: state.sem, subject: state.subject,
      code: state.code, year: state.year, examType: state.type, regulation: state.reg
    });
    if (state.saved) out = out.filter(function (p) { return BB.isSavedPaper(p.id); });
    if (state.sort === 'old') out.sort(function (a, b) { return a.year - b.year; });
    else if (state.sort === 'downloads') out.sort(function (a, b) { return (b.downloads || 0) - (a.downloads || 0); });
    return out;
  }

  function render() {
    var host = U.qs('#paper-grid');
    var all = list();
    U.qs('#count-badge').textContent = all.length + ' paper' + (all.length === 1 ? '' : 's') + ' found';
    var shown = all.slice(0, state.page * state.perPage);
    U.qs('#load-more-wrap').classList.toggle('hidden', shown.length >= all.length);

    if (!all.length) {
      host.innerHTML = '<div style="grid-column:1/-1">' + U.emptyState({
        icon: 'file', title: 'No papers match these filters',
        text: 'Try widening the year range, choosing a different semester, or clearing the search box.',
        action: '<button class="btn btn-soft btn-sm" onclick="document.getElementById(\'reset\').click()">Reset filters</button>'
      }) + '</div>';
      return;
    }

    host.innerHTML = shown.map(function (p) {
      var b = BB.branch(p.branch) || {};
      return '<div class="card card-hover paper-card">' +
        '<div class="pc-top"><span class="pc-year"><b>' + p.year + '</b><span>' + p.examType.slice(0, 4).toUpperCase() + '</span></span>' +
        '<div class="pc-body"><div class="pc-title">' + U.esc(p.subjectName) + '</div>' +
        '<div class="pc-meta">' +
        '<span class="badge badge-blue">' + U.esc(p.code) + '</span>' +
        '<span class="badge badge-gray">' + U.esc(b.code || '') + ' Sem ' + p.sem + '</span>' +
        '<span class="badge badge-gray">' + U.esc(p.examType) + '</span>' +
        '<span class="badge badge-gray">' + U.esc(p.regulation) + '</span>' +
        '</div></div></div>' +
        '<div class="tiny muted">' + U.esc(p.university) + ' | uploaded ' + U.fmtDate(p.uploadedAt) + ' | ' + U.fmtNum(p.downloads) + ' downloads</div>' +
        '<div class="pc-foot">' +
        '<a class="btn btn-primary btn-sm" href="paper.html?id=' + encodeURIComponent(p.id) + '">' + U.icon('eye', 15) + 'View paper</a>' +
        '<button class="btn btn-outline btn-sm" data-dl="' + p.id + '">' + U.icon('download', 15) + 'Download</button>' +
        '<button class="btn btn-ghost btn-sm" data-save="' + p.id + '" title="Save">' + U.icon('bookmark', 15) + '</button>' +
        '</div></div>';
    }).join('');

    U.qa('[data-dl]', host).forEach(function (btn) {
      btn.addEventListener('click', function () { downloadPaper(btn.getAttribute('data-dl')); });
    });
    U.qa('[data-save]', host).forEach(function (btn) {
      var id = btn.getAttribute('data-save');
      function sync() {
        var on = BB.isSavedPaper(id);
        btn.classList.toggle('btn-primary', on);
        btn.classList.toggle('btn-ghost', !on);
      }
      sync(); BB.onChange(sync);
      btn.addEventListener('click', function () {
        var on = BB.toggleSavedPaper(id);
        U.toast(on ? 'Paper saved' : 'Paper removed', '', on ? 'success' : 'info');
      });
    });
  }

  function downloadPaper(id) {
    var p = BB.paper(id);
    if (!p) return;
    if (p.file) {
      var a = document.createElement('a');
      a.href = p.file; a.download = p.file.split('/').pop();
      document.body.appendChild(a); a.click(); a.remove();
      U.toast('Download started', p.subjectName + ' ' + p.year, 'success');
      return;
    }
    var qs = BB.paperQuestions(BB.idx.paper[id]);
    var sub = BB.subject(p.subject) || { units: [] };
    var b = new BBPdf.Builder({ title: p.code + ' ' + p.year });
    b.h1(p.university);
    b.text('B.Tech. Semester ' + p.sem + ' Examination, ' + p.year + '  (' + p.examType + ')', { size: 11.5, bold: true, align: 'center' });
    b.text('Regulation: ' + p.regulation + '   |   Max. Marks: ' + (p.marks || 60) + '   |   Time: ' + (p.duration || '3 hours'), { size: 9.5, align: 'center', gap: 8 });
    b.h2(p.subjectName + '  (' + p.code + ')');
    b.text('Answer one question from each unit. All questions carry equal marks.', { size: 9.5, gap: 8 });
    var byUnit = {};
    qs.forEach(function (q) { (byUnit[q.unit] = byUnit[q.unit] || []).push(q); });
    Object.keys(byUnit).sort(function (x, y) { return x - y; }).forEach(function (u) {
      var unit = (sub.units || [])[+u - 1];
      b.need(60);
      b.h2('UNIT - ' + u + (unit ? '   [' + unit.title + ']' : ''));
      byUnit[u].forEach(function (q, i) { b.p((byUnit[u].length > 1 ? (i === 0 ? 'a) ' : 'b) ') : '') + q.text); });
      b.space(6);
    });
    b.rule();
    b.small('Backlog Buddy - previous question paper library. Reconstructed from previous papers available on the platform; intended for practice only.');
    U.download(p.code + '-' + p.year + '-' + p.examType.toLowerCase() + '.pdf', new Blob([b.toBytes()], { type: 'application/pdf' }));
    U.toast('Download started', p.subjectName + ' ' + p.year, 'success');
  }
})();
