/* ==========================================================================
   Backlog Buddy — student dashboard
   ========================================================================== */
(function () {
  'use strict';
  var U = window.BBUI, BB = window.BB;

  U.renderHeader('dashboard.html');
  U.renderFooter();

  var SECTIONS = [
    { id: 'overview', label: 'Overview', icon: 'trending' },
    { id: 'favorites', label: 'Favourite subjects', icon: 'star' },
    { id: 'bookmarks', label: 'Bookmarked questions', icon: 'bookmark' },
    { id: 'saved', label: 'Saved papers', icon: 'download' },
    { id: 'completed', label: 'Completed subjects', icon: 'circleCheck' },
    { id: 'recent', label: 'Recently opened', icon: 'clock' },
    { id: 'checklist', label: 'Backlog checklist', icon: 'clipboard' }
  ];
  var active = 'overview';

  BB.ready(function () {
    renderNav();
    render();
    BB.onChange(render);
  });

  function renderNav() {
    var host = U.qs('#dash-nav');
    host.innerHTML = SECTIONS.map(function (s) {
      var n = count(s.id);
      return '<a data-sec="' + s.id + '" class="' + (active === s.id ? 'active' : '') + '">' + U.icon(s.icon, 17) + s.label +
        (n ? '<span class="badge badge-gray" style="margin-left:auto">' + n + '</span>' : '') + '</a>';
    }).join('');
    U.qa('[data-sec]', host).forEach(function (a) {
      a.addEventListener('click', function () { active = a.getAttribute('data-sec'); renderNav(); render(); });
    });
  }

  function count(id) {
    var u = BB.user;
    return { overview: 0, favorites: u.favorites.length, bookmarks: u.bookmarks.length, saved: u.savedPapers.length, completed: u.completed.length, recent: u.recent.length, checklist: u.checklist.filter(function (c) { return !c.done; }).length }[id];
  }

  function render() {
    var host = U.qs('#dash-main');
    host.innerHTML = ({
      overview: viewOverview, favorites: viewFavorites, bookmarks: viewBookmarks,
      saved: viewSaved, completed: viewCompleted, recent: viewRecent, checklist: viewChecklist
    })[active]();
    U.reveal();
    bindActions();
  }

  /* ---------------- overview ---------------- */
  function viewOverview() {
    var u = BB.user;
    var total = BB.subjects({}).length;
    var pct = total ? Math.round((u.completed.length / total) * 100) : 0;
    var kpis = [
      { v: u.favorites.length, k: 'Favourite subjects' },
      { v: u.bookmarks.length, k: 'Bookmarked questions' },
      { v: u.savedPapers.length, k: 'Saved papers' },
      { v: u.completed.length, k: 'Subjects completed' }
    ];
    return '<div class="kpi-row">' + kpis.map(function (x) {
      return '<div class="stat"><div class="v">' + x.v + '</div><div class="k">' + x.k + '</div></div>';
    }).join('') + '</div>' +

      '<div class="card" style="margin-bottom:18px">' +
      '<div class="row row-wrap"><div><div class="eyebrow">Preparation progress</div>' +
      '<h3 class="mt-2">' + pct + '% of the subject catalogue marked complete</h3></div>' +
      '<span class="spacer"></span><span class="badge badge-blue">' + u.completed.length + ' / ' + total + ' subjects</span></div>' +
      '<div class="progress mt-3"><span style="width:' + pct + '%"></span></div>' +
      '<p class="small muted mt-2">Mark a subject complete from its page once you have finished its papers, important questions and notes.</p></div>' +

      '<div class="grid grid-2">' +
      '<div class="card"><div class="eyebrow" style="margin-bottom:10px">Recently opened papers</div>' + recentList(3) + '</div>' +
      '<div class="card"><div class="eyebrow" style="margin-bottom:10px">Next on your checklist</div>' + checklistList(4) + '</div>' +
      '</div>' +

      '<div class="row row-wrap mt-3">' +
      '<a class="btn btn-primary btn-sm" href="papers.html">Find papers</a>' +
      '<a class="btn btn-outline btn-sm" href="important.html">Important questions</a>' +
      '<span class="spacer"></span>' +
      '<button class="btn btn-danger btn-sm" id="reset-user">Reset my saved data</button>' +
      '</div>';
  }

  /* ---------------- favourites ---------------- */
  function viewFavorites() {
    var subs = BB.user.favorites.map(function (id) { return BB.subject(id); }).filter(Boolean);
    if (!subs.length) return emptyCard('star', 'No favourite subjects yet', 'Open any subject and choose "Save subject" to keep it here for quick access.');
    return '<div class="grid grid-2">' + subs.map(function (s) {
      return '<div class="card card-hover"><div class="row" style="align-items:flex-start">' +
        '<span class="card-ico">' + U.icon(BB.branch(s.branch).icon, 20) + '</span>' +
        '<div style="min-width:0"><div class="card-title">' + U.esc(s.name) + '</div>' +
        '<div class="tiny muted">' + U.esc(s.code) + ' | ' + U.esc(BB.branch(s.branch).code) + ' Sem ' + s.sem + '</div></div>' +
        '<span class="spacer"></span>' +
        '<button class="icon-btn" data-unfav="' + s.id + '" title="Remove">' + U.icon('x', 16) + '</button></div>' +
        '<div class="codes mt-2"><span class="badge badge-blue">' + s.paperCount + ' papers</span>' +
        '<span class="badge badge-fa">' + s.questionCount + ' questions</span></div>' +
        '<div class="pc-foot"><a class="btn btn-soft btn-sm" href="subject.html?id=' + encodeURIComponent(s.id) + '">Open subject</a></div></div>';
    }).join('') + '</div>';
  }

  /* ---------------- bookmarks ---------------- */
  function viewBookmarks() {
    var qs = BB.user.bookmarks.map(function (id) { return BB.idx.question[id]; }).filter(Boolean);
    if (!qs.length) return emptyCard('bookmark', 'No bookmarked questions', 'Bookmark questions from any subject page or the important questions list to revise them later.');
    return '<div class="card" style="margin-bottom:14px"><div class="row"><span class="badge badge-fa">' + qs.length + ' bookmarked</span>' +
      '<span class="spacer"></span><button class="btn btn-outline btn-sm" id="export-bm">Export as text</button></div></div>' +
      '<div class="stack">' + qs.map(function (q) {
        var s = BB.subject(q.subject) || {};
        return '<div class="q-item"><span class="q-num">' + q.unit + '</span>' +
          '<div style="min-width:0;flex:1"><div class="q-text">' + U.esc(q.text) + '</div>' +
          '<div class="q-meta">' + U.tagBadges(q.tags, q.years) +
          '<a class="badge badge-blue" href="subject.html?id=' + encodeURIComponent(s.id) + '">' + U.esc(s.code) + ' ' + U.esc(s.name) + '</a></div></div>' +
          '<div class="q-actions"><button class="icon-btn on" data-unbm="' + q.id + '" title="Remove">' + U.icon('x', 16) + '</button></div></div>';
      }).join('') + '</div>';
  }

  /* ---------------- saved papers ---------------- */
  function viewSaved() {
    var papers = BB.user.savedPapers.map(function (id) { return BB.idx.paper[id]; }).filter(Boolean).map(function (p) { return BB.paper(p.id); });
    if (!papers.length) return emptyCard('download', 'No saved papers', 'Use the save button on any paper card to keep it here.');
    return '<div class="grid grid-2">' + papers.map(function (p) {
      return '<div class="card card-hover"><div class="pc-top"><span class="pc-year"><b>' + p.year + '</b><span>' + p.examType.slice(0, 4).toUpperCase() + '</span></span>' +
        '<div class="pc-body"><div class="pc-title">' + U.esc(p.subjectName) + '</div>' +
        '<div class="pc-meta"><span class="badge badge-blue">' + U.esc(p.code) + '</span>' +
        '<span class="badge badge-gray">Sem ' + p.sem + '</span><span class="badge badge-gray">' + U.esc(p.regulation) + '</span></div></div>' +
        '<span class="spacer"></span><button class="icon-btn" data-unsave="' + p.id + '" title="Remove">' + U.icon('x', 16) + '</button></div>' +
        '<div class="pc-foot"><a class="btn btn-primary btn-sm" href="paper.html?id=' + encodeURIComponent(p.id) + '">View</a>' +
        '<a class="btn btn-outline btn-sm" href="subject.html?id=' + encodeURIComponent(p.subject) + '">Subject</a></div></div>';
    }).join('') + '</div>';
  }

  /* ---------------- completed ---------------- */
  function viewCompleted() {
    var subs = BB.user.completed.map(function (id) { return BB.subject(id); }).filter(Boolean);
    var all = BB.subjects({});
    return '<div class="card" style="margin-bottom:18px"><div class="row row-wrap">' +
      '<div><div class="eyebrow">Completion tracker</div><h3 class="mt-2">' + subs.length + ' of ' + all.length + ' subjects completed</h3></div>' +
      '<span class="spacer"></span><span class="badge badge-green">' + (all.length ? Math.round(subs.length / all.length * 100) : 0) + '%</span></div>' +
      '<div class="progress mt-3"><span style="width:' + (all.length ? subs.length / all.length * 100 : 0) + '%"></span></div></div>' +
      (subs.length ? '<div class="grid grid-2">' + subs.map(function (s) {
        return '<div class="check-item done"><input type="checkbox" checked data-uncomplete="' + s.id + '">' +
          '<div style="min-width:0"><div class="ci-title">' + U.esc(s.name) + '</div>' +
          '<div class="ci-sub">' + U.esc(s.code) + ' | ' + U.esc(BB.branch(s.branch).code) + ' Sem ' + s.sem + '</div></div>' +
          '<span class="spacer"></span><a class="btn btn-ghost btn-sm" href="subject.html?id=' + encodeURIComponent(s.id) + '">Open</a></div>';
      }).join('') + '</div>'
        : emptyCard('circleCheck', 'No subjects marked complete yet', 'Open a subject and choose "Mark completed" once you have finished preparing it.'));
  }

  /* ---------------- recent ---------------- */
  function viewRecent() {
    var papers = BB.recentPapers();
    if (!papers.length) return emptyCard('clock', 'No papers opened yet', 'Papers you open appear here so you can jump straight back in.');
    return '<div class="stack">' + papers.map(function (p, i) {
      return '<a class="mini-row" href="paper.html?id=' + encodeURIComponent(p.id) + '"><span class="mr-ico">' + U.icon('file', 15) + '</span>' +
        '<span class="mr-t"><b>' + U.esc(p.subjectName) + ' - ' + p.year + '</b><span>' + U.esc(p.code) + ' | ' + U.esc(p.examType) + ' | opened #' + (i + 1) + '</span></span>' +
        '<span class="badge badge-gray">' + U.icon('arrowRight', 12) + '</span></a>';
    }).join('') + '</div>';
  }

  /* ---------------- checklist ---------------- */
  function viewChecklist() {
    var items = BB.checklist();
    var done = items.filter(function (c) { return c.done; }).length;
    return '<div class="card" style="margin-bottom:16px">' +
      '<div class="row row-wrap"><div><div class="eyebrow">Personal backlog checklist</div>' +
      '<h3 class="mt-2">' + done + ' of ' + items.length + ' tasks done</h3></div>' +
      '<span class="spacer"></span><span class="badge ' + (done === items.length && items.length ? 'badge-green' : 'badge-blue') + '">' + (items.length ? Math.round(done / items.length * 100) : 0) + '%</span></div>' +
      '<div class="progress mt-3"><span style="width:' + (items.length ? done / items.length * 100 : 0) + '%"></span></div>' +
      '<div class="row mt-3" style="gap:8px;flex-wrap:wrap">' +
      '<input type="text" id="new-task" placeholder="Add a task, e.g. Solve 2025 OS paper" style="flex:1;min-width:220px">' +
      '<button class="btn btn-primary btn-sm" id="add-task">Add task</button>' +
      '</div>' +
      '<div class="row row-wrap mt-2">' +
      '<button class="btn btn-ghost btn-sm" data-quick="Solve the latest previous paper for each backlog subject">Solve latest papers</button>' +
      '<button class="btn btn-ghost btn-sm" data-quick="Revise unit-wise important questions">Revise unit-wise questions</button>' +
      '<button class="btn btn-ghost btn-sm" data-quick="Practise one full model paper under exam timing">Practise a model paper</button>' +
      '</div></div>' +
      (items.length ? '<div class="stack">' + items.map(function (c) {
        var s = c.subject ? BB.subject(c.subject) : null;
        return '<div class="check-item' + (c.done ? ' done' : '') + '">' +
          '<input type="checkbox" ' + (c.done ? 'checked' : '') + ' data-toggle="' + c.id + '">' +
          '<div style="min-width:0;flex:1"><div class="ci-title">' + U.esc(c.text) + '</div>' +
          (s ? '<div class="ci-sub">' + U.esc(s.code) + ' | ' + U.esc(s.name) + '</div>' : '') + '</div>' +
          '<button class="icon-btn" data-deltask="' + c.id + '" title="Delete">' + U.icon('trash', 16) + '</button></div>';
      }).join('') + '</div>'
        : emptyCard('clipboard', 'Your checklist is empty', 'Add tasks above, or add a whole subject from its page with "Add to checklist".'));
  }

  /* ---------------- helpers ---------------- */
  function emptyCard(icon, title, text) {
    return '<div class="card">' + U.emptyState({ icon: icon, title: title, text: text,
      action: '<a class="btn btn-soft btn-sm" href="subjects.html">Browse subjects</a>' }) + '</div>';
  }
  function recentList(n) {
    var p = BB.recentPapers().slice(0, n);
    if (!p.length) return '<div class="tiny muted">Nothing opened yet.</div>';
    return p.map(function (x) {
      return '<a class="mini-row" href="paper.html?id=' + encodeURIComponent(x.id) + '"><span class="mr-ico">' + U.icon('file', 15) + '</span>' +
        '<span class="mr-t"><b>' + U.esc(x.subjectName) + '</b><span>' + x.year + ' ' + U.esc(x.examType) + '</span></span></a>';
    }).join('');
  }
  function checklistList(n) {
    var items = BB.checklist().filter(function (c) { return !c.done; }).slice(0, n);
    if (!items.length) return '<div class="tiny muted">No pending tasks. Add one below.</div>';
    return items.map(function (c) {
      return '<div class="mini-row"><span class="mr-ico">' + U.icon('clipboard', 15) + '</span>' +
        '<span class="mr-t"><b>' + U.esc(c.text) + '</b></span></div>';
    }).join('');
  }

  function bindActions() {
    U.qa('[data-unfav]').forEach(function (b) { b.addEventListener('click', function () { BB.toggleFavorite(b.getAttribute('data-unfav')); }); });
    U.qa('[data-unbm]').forEach(function (b) { b.addEventListener('click', function () { BB.toggleBookmark(b.getAttribute('data-unbm')); }); });
    U.qa('[data-unsave]').forEach(function (b) { b.addEventListener('click', function () { BB.toggleSavedPaper(b.getAttribute('data-unsave')); }); });
    U.qa('[data-uncomplete]').forEach(function (b) { b.addEventListener('change', function () { BB.toggleCompleted(b.getAttribute('data-uncomplete')); }); });
    U.qa('[data-deltask]').forEach(function (b) { b.addEventListener('click', function () { BB.removeChecklist(b.getAttribute('data-deltask')); }); });
    U.qa('[data-toggle]').forEach(function (b) { b.addEventListener('change', function () { BB.toggleChecklist(b.getAttribute('data-toggle')); }); });
    var add = U.qs('#add-task');
    if (add) add.addEventListener('click', function () {
      var inp = U.qs('#new-task');
      if (!inp.value.trim()) { U.toast('Enter a task first', '', 'error'); return; }
      BB.addChecklist(inp.value.trim());
      inp.value = '';
      U.toast('Task added', '', 'success');
    });
    U.qa('[data-quick]').forEach(function (b) {
      b.addEventListener('click', function () { BB.addChecklist(b.getAttribute('data-quick')); U.toast('Task added', '', 'success'); });
    });
    var exp = U.qs('#export-bm');
    if (exp) exp.addEventListener('click', function () {
      var qs = BB.user.bookmarks.map(function (id) { return BB.idx.question[id]; }).filter(Boolean);
      var lines = ['Backlog Buddy - bookmarked questions', ''];
      qs.forEach(function (q) {
        var s = BB.subject(q.subject) || {};
        lines.push('[' + (s.code || '') + ' | Unit ' + q.unit + '] ' + q.text);
      });
      U.download('backlog-buddy-bookmarks.txt', lines.join('\n'));
      U.toast('Bookmarks exported', qs.length + ' questions', 'success');
    });
    var reset = U.qs('#reset-user');
    if (reset) reset.addEventListener('click', function () {
      U.modal({
        title: 'Reset saved data?', icon: 'alert',
        body: '<p>This clears your favourite subjects, bookmarks, saved papers, completed subjects, recently opened papers and checklist on this device. Demo content is not affected.</p>',
        actions: '<button class="btn btn-outline btn-sm" data-close>Cancel</button><button class="btn btn-primary btn-sm" id="do-reset">Reset my data</button>',
        onMount: function (el, close) {
          U.qs('#do-reset', el).addEventListener('click', function () { BB.resetUser(); close(); U.toast('Saved data cleared', '', 'success'); });
        }
      });
    });
  }
})();
