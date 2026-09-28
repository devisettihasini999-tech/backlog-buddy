/* ==========================================================================
   Backlog Buddy — branch / semester subject browser
   ========================================================================== */
(function () {
  'use strict';
  var U = window.BBUI, BB = window.BB;

  U.renderHeader('subjects.html');
  U.renderFooter();

  var state = { branch: '', sem: '', q: '', sort: 'code', reg: '', withPapers: false };

  BB.ready(function () {
    var p = U.params();
    state.branch = p.branch || '';
    state.sem = p.sem || '';
    state.q = p.q || '';

    buildChips();
    buildRegOptions();
    wire();
    render();
  });

  function buildChips() {
    var bHost = U.qs('#branch-chips');
    bHost.innerHTML = '<button class="chip' + (state.branch ? '' : ' active') + '" data-branch="">All branches</button>' +
      BB.branches().map(function (b) {
        return '<button class="chip' + (state.branch === b.id ? ' active' : '') + '" data-branch="' + b.id + '">' + U.icon(b.icon, 14) + U.esc(b.code) + '</button>';
      }).join('');
    U.qa('[data-branch]', bHost).forEach(function (btn) {
      btn.addEventListener('click', function () { state.branch = btn.getAttribute('data-branch'); syncChips(); render(); });
    });

    var sHost = U.qs('#sem-chips');
    sHost.innerHTML = '<button class="chip' + (state.sem ? '' : ' active') + '" data-sem="">All semesters</button>' +
      BB.semesters().map(function (s) {
        return '<button class="chip' + (String(state.sem) === String(s.n) ? ' active' : '') + '" data-sem="' + s.n + '">' + U.esc(s.label) + '</button>';
      }).join('');
    U.qa('[data-sem]', sHost).forEach(function (btn) {
      btn.addEventListener('click', function () { state.sem = btn.getAttribute('data-sem'); syncChips(); render(); });
    });
  }

  function syncChips() {
    U.qa('[data-branch]').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-branch') === state.branch); });
    U.qa('[data-sem]').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-sem') === state.sem); });
  }

  function buildRegOptions() {
    var regs = {};
    BB.db.subjects.forEach(function (s) { regs[s.regulation] = 1; });
    var sel = U.qs('#reg');
    Object.keys(regs).sort().forEach(function (r) {
      var o = document.createElement('option'); o.value = r; o.textContent = r; sel.appendChild(o);
    });
  }

  function wire() {
    var q = U.qs('#q'), sort = U.qs('#sort'), reg = U.qs('#reg'), wp = U.qs('#with-papers');
    q.value = state.q;
    var t;
    q.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { state.q = q.value; render(); }, 160); });
    sort.addEventListener('change', function () { state.sort = sort.value; render(); });
    reg.addEventListener('change', function () { state.reg = reg.value; render(); });
    wp.addEventListener('change', function () { state.withPapers = wp.checked; render(); });
    U.qs('#reset').addEventListener('click', function () {
      state = { branch: '', sem: '', q: '', sort: 'code', reg: '', withPapers: false };
      q.value = ''; sort.value = 'code'; reg.value = ''; wp.checked = false;
      syncChips(); render();
      U.toast('Filters reset', 'Showing all subjects.', 'info');
    });
  }

  function currentList() {
    var term = state.q.trim().toLowerCase();
    var list = BB.subjects({ branch: state.branch, sem: state.sem }).filter(function (s) {
      if (state.reg && s.regulation !== state.reg) return false;
      if (state.withPapers && !s.paperCount) return false;
      if (term && (s.name + ' ' + s.code).toLowerCase().indexOf(term) === -1) return false;
      return true;
    });
    var sorters = {
      code: function (a, b) { return a.code.localeCompare(b.code); },
      name: function (a, b) { return a.name.localeCompare(b.name); },
      papers: function (a, b) { return b.paperCount - a.paperCount; },
      questions: function (a, b) { return b.questionCount - a.questionCount; }
    };
    return list.sort(sorters[state.sort] || sorters.code);
  }

  function render() {
    var host = U.qs('#subject-grid');
    var list = currentList();
    var badge = U.qs('#count-badge');
    badge.textContent = list.length + ' subject' + (list.length === 1 ? '' : 's') +
      (state.branch ? ' in ' + (BB.branch(state.branch) || {}).code : '') +
      (state.sem ? ' | Semester ' + state.sem : '');

    if (!list.length) {
      host.innerHTML = '<div style="grid-column:1/-1">' + U.emptyState({
        icon: 'search', title: 'No subjects match these filters',
        text: 'Try removing the search term, choosing another semester, or selecting "All branches".',
        action: '<button class="btn btn-soft btn-sm" onclick="document.getElementById(\'reset\').click()">Reset filters</button>'
      }) + '</div>';
      return;
    }

    host.innerHTML = list.map(function (s) {
      var b = BB.branch(s.branch);
      var rep = BB.repeatedOf(s.id);
      return '<a class="card card-hover subject-card" href="subject.html?id=' + encodeURIComponent(s.id) + '">' +
        '<div class="card-head"><span class="card-ico">' + U.icon(b ? b.icon : 'book', 21) + '</span>' +
        '<div style="min-width:0"><div class="card-title">' + U.esc(s.name) + '</div>' +
        '<div class="tiny muted">' + U.esc(s.code) + ' | ' + U.esc(b ? b.code : '') + ' | Sem ' + s.sem + ' | ' + s.credits + ' credits</div></div>' +
        (s.featured ? '<span class="badge badge-amber">Popular</span>' : '') + '</div>' +
        '<p class="small">' + U.esc(s.desc.slice(0, 96)) + '...</p>' +
        '<div class="codes">' +
        '<span class="badge ' + (s.paperCount ? 'badge-blue' : 'badge-gray') + '">' + U.icon('file', 12) + s.paperCount + ' papers</span>' +
        '<span class="badge ' + (s.questionCount ? 'badge-fa' : 'badge-gray') + '">' + U.icon('bulb', 12) + s.questionCount + ' questions</span>' +
        (rep.length ? '<span class="badge badge-rq">' + rep.length + ' repeated</span>' : '') +
        '</div>' +
        '<div class="card-foot"><span class="tiny muted">' + U.esc(s.regulation) + ' | ' + U.esc(s.university) + '</span><span class="spacer"></span>' +
        '<span class="btn btn-soft btn-sm">Open subject' + U.icon('arrowRight', 14) + '</span></div></a>';
    }).join('');
  }
})();
