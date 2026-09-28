/* ==========================================================================
   Backlog Buddy — home page
   ========================================================================== */
(function () {
  'use strict';
  var U = window.BBUI, BB = window.BB;

  U.renderHeader('index.html');
  U.renderFooter();
  U.reveal();

  BB.ready(function () {
    initSearch();
    initStats();
    initMode();
    initRecent();
    initTrending();
    initFeatures();
    initBranches();
    initSemesters();
    initPopular();
    initRepeated();
  });

  function initSearch() {
    var input = U.qs('#hero-search'), dd = U.qs('#hero-suggest');
    if (input && dd) {
      U.attachSearch(input, dd, function (v) { location.href = 'papers.html?q=' + encodeURIComponent(v); });
      U.qs('#hero-search-btn').addEventListener('click', function () {
        var v = input.value.trim();
        location.href = v ? 'papers.html?q=' + encodeURIComponent(v) : 'papers.html';
      });
    }
  }

  function initStats() {
    var st = BB.stats();
    U.qa('[data-count]').forEach(function (el) {
      U.countUp(el, st[el.getAttribute('data-count') === '9' ? 'branches' : ({ '391': 'subjects', '1608': 'papers', '3914': 'questions' })[el.getAttribute('data-count')]] || 0);
    });
  }

  function initMode() {
    var badge = U.qs('#data-mode-badge');
    BB.checkSupabase().then(function (s) {
      if (!badge) return;
      if (s.enabled) {
        badge.className = 'badge badge-green';
        badge.textContent = 'Supabase connected';
        badge.title = s.message;
      } else {
        badge.textContent = 'Demo data';
        badge.title = s.message;
      }
    });
  }

  function initRecent() {
    var host = U.qs('#recent-list');
    var recent = BB.recentPapers();
    if (!recent.length) {
      host.innerHTML = U.emptyState({
        icon: 'clock', title: 'No papers opened yet',
        text: 'Open any previous question paper and it will show up here so you can continue in one tap.',
        action: '<a class="btn btn-soft btn-sm" href="papers.html">Browse the paper library</a>'
      });
      return;
    }
    host.innerHTML = recent.slice(0, 4).map(function (p) {
      return '<a class="mini-row" href="paper.html?id=' + encodeURIComponent(p.id) + '"><span class="mr-ico">' + U.icon('file', 15) + '</span>' +
        '<span class="mr-t"><b>' + U.esc(p.subjectName) + '</b><span>' + U.esc(p.code) + ' | ' + p.year + ' ' + U.esc(p.examType) + '</span></span>' +
        '<span class="badge badge-gray">' + U.icon('arrowRight', 12) + '</span></a>';
    }).join('');
  }

  function initTrending() {
    var host = U.qs('#trending-list');
    var subs = BB.db.subjects.filter(function (s) { return s.featured; }).slice(0, 4);
    host.innerHTML = subs.map(function (s) {
      return '<a class="mini-row" href="subject.html?id=' + encodeURIComponent(s.id) + '"><span class="mr-ico">' + U.icon('book', 15) + '</span>' +
        '<span class="mr-t"><b>' + U.esc(s.name) + '</b><span>' + U.esc(s.code) + ' | ' + U.esc(BB.branch(s.branch).code) + ' Sem ' + s.sem + ' | ' + s.paperCount + ' papers</span></span>' +
        '<span class="badge badge-blue">' + s.questionCount + ' Q</span></a>';
    }).join('');
  }

  function initFeatures() {
    var features = [
      { icon: 'file', tone: '', title: 'Previous year question papers', text: 'Papers from 2023 to 2026 with regular, supplementary and makeup variants - filterable by branch, semester, subject, year, exam type and regulation.' },
      { icon: 'flame', tone: 'amber', title: 'Important questions', text: 'Labelled Very Important, Frequently Asked, Repeated Question, Important Topic and Practice Question so you know what to study first.' },
      { icon: 'repeat', tone: 'purple', title: 'Frequently repeated topics', text: 'See how many available papers contain a topic, for example "Stack operations - appeared in 5 previous papers". Analysis only, never a prediction.' },
      { icon: 'layers', tone: 'green', title: 'Unit-wise important questions', text: 'Every subject is split into five units with the questions that keep appearing in each unit, so nothing is missed.' },
      { icon: 'folder', tone: 'cyan', title: 'Model papers &amp; study material', text: 'Model question papers, unit notes, formula sheets, syllabi and video lectures for quick revision before the exam.' },
      { icon: 'clipboard', tone: 'red', title: 'Personal preparation tracker', text: 'Save favourite subjects, bookmark questions, store papers and maintain a personal backlog checklist on your dashboard.' }
    ];
    U.qs('#feature-grid').innerHTML = features.map(function (f) {
      return '<div class="card card-hover reveal"><div class="card-ico ' + f.tone + '">' + U.icon(f.icon, 21) + '</div>' +
        '<h3 class="card-title mt-2">' + U.esc(f.title) + '</h3><p class="small">' + U.esc(f.text) + '</p></div>';
    }).join('');
  }

  function initBranches() {
    var host = U.qs('#branch-grid');
    host.innerHTML = BB.branches().map(function (b) {
      var count = BB.subjects({ branch: b.id }).length;
      var papers = BB.filterPapers({ branch: b.id }).length;
      return '<a class="tile reveal" href="subjects.html?branch=' + b.id + '">' +
        '<span class="t-ico">' + U.icon(b.icon, 22) + '</span>' +
        '<span style="min-width:0"><b>' + U.esc(b.name) + '</b><span>' + count + ' subjects | ' + papers + ' papers</span></span>' +
        '<span class="spacer"></span>' + U.icon('chevRight', 18) + '</a>';
    }).join('');
  }

  function initSemesters() {
    var host = U.qs('#sem-cloud');
    host.innerHTML = BB.semesters().map(function (s) {
      return '<a class="chip reveal" href="subjects.html?sem=' + s.n + '">' + U.icon('calendar', 14) + U.esc(s.label) + '</a>';
    }).join('');
  }

  function initPopular() {
    var host = U.qs('#popular-grid');
    var subs = BB.db.subjects.filter(function (s) { return s.featured; });
    host.innerHTML = subs.map(function (s) {
      var b = BB.branch(s.branch);
      var rep = BB.repeatedOf(s.id);
      return '<a class="card card-hover subject-card reveal" href="subject.html?id=' + encodeURIComponent(s.id) + '">' +
        '<div class="card-head"><span class="card-ico">' + U.icon(b ? b.icon : 'book', 21) + '</span>' +
        '<div style="min-width:0"><div class="card-title">' + U.esc(s.name) + '</div>' +
        '<div class="tiny muted">' + U.esc(s.code) + ' | ' + U.esc(b ? b.code : '') + ' | Semester ' + s.sem + '</div></div></div>' +
        '<p>' + U.esc(s.desc.slice(0, 108)) + '...</p>' +
        '<div class="codes">' +
        '<span class="badge badge-blue">' + s.paperCount + ' papers</span>' +
        '<span class="badge badge-fa">' + s.questionCount + ' questions</span>' +
        (rep.length ? '<span class="badge badge-rq">' + rep.length + ' repeated topics</span>' : '') +
        '</div>' +
        '<div class="card-foot"><span class="tiny muted">Unit-wise topics, model papers &amp; notes</span><span class="spacer"></span>' +
        '<span class="btn btn-soft btn-sm">Open' + U.icon('arrowRight', 14) + '</span></div></a>';
    }).join('');
  }

  function initRepeated() {
    var host = U.qs('#repeated-grid');
    var rows = [];
    BB.db.subjects.filter(function (s) { return s.featured; }).forEach(function (s) {
      BB.repeatedOf(s.id).slice(0, 2).forEach(function (t) {
        rows.push({ sub: s, topic: t });
      });
    });
    rows.sort(function (a, b) { return b.topic.papers - a.topic.papers; });
    host.innerHTML = rows.slice(0, 6).map(function (r) {
      return '<div class="q-item reveal"><span class="q-num">' + r.topic.papers + 'x</span>' +
        '<div style="min-width:0"><div class="q-text">' + U.esc(r.topic.topic) + '</div>' +
        '<div class="q-meta"><span class="badge badge-rq">' + U.icon('repeat', 12) + 'Appeared in ' + r.topic.papers + ' previous papers</span>' +
        '<span class="badge badge-gray">' + U.esc(r.sub.code) + ' Unit ' + r.topic.unit + '</span></div></div></div>';
    }).join('');
  }
})();
