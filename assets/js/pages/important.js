/* ==========================================================================
   Backlog Buddy — important questions hub
   ========================================================================== */
(function () {
  'use strict';
  var U = window.BBUI, BB = window.BB;

  U.renderHeader('important.html');
  U.renderFooter();

  var state = { q: '', branch: '', sem: '', subject: '', tag: '', bm: false, limit: 60 };

  BB.ready(function () {
    var p = U.params();
    state.branch = p.branch || '';
    state.subject = p.subject || '';
    buildFilters();
    wire();
    render();
  });

  function buildFilters() {
    var b = U.qs('#f-branch');
    BB.branches().forEach(function (x) { var o = document.createElement('option'); o.value = x.id; o.textContent = x.code + ' - ' + x.name; b.appendChild(o); });
    b.value = state.branch;
    var s = U.qs('#f-sem');
    BB.semesters().forEach(function (x) { var o = document.createElement('option'); o.value = x.n; o.textContent = x.label; s.appendChild(o); });
    var sub = U.qs('#f-subject');
    BB.subjects({ branch: state.branch || undefined }).forEach(function (x) { var o = document.createElement('option'); o.value = x.id; o.textContent = x.code + ' - ' + x.name; sub.appendChild(o); });
    sub.value = state.subject;
    U.qs('#q').value = state.q;
  }

  function wire() {
    var t;
    U.qs('#q').addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { state.q = this.value; state.limit = 60; render(); }, 150); });
    U.qs('#f-branch').addEventListener('change', function () {
      state.branch = this.value; state.subject = '';
      var sub = U.qs('#f-subject');
      sub.innerHTML = '<option value="">All subjects</option>';
      BB.subjects({ branch: state.branch || undefined }).forEach(function (x) { var o = document.createElement('option'); o.value = x.id; o.textContent = x.code + ' - ' + x.name; sub.appendChild(o); });
      render();
    });
    ['#f-sem', '#f-subject', '#f-tag'].forEach(function (sel) {
      U.qs(sel).addEventListener('change', function () {
        state[sel === '#f-sem' ? 'sem' : sel === '#f-subject' ? 'subject' : 'tag'] = this.value;
        state.limit = 60; render();
      });
    });
    U.qs('#f-bm').addEventListener('change', function () { state.bm = this.checked; render(); });
    U.qs('#reset').addEventListener('click', function () {
      state = { q: '', branch: '', sem: '', subject: '', tag: '', bm: false, limit: 60 };
      ['#q', '#f-branch', '#f-sem', '#f-subject', '#f-tag'].forEach(function (s) { U.qs(s).value = ''; });
      U.qs('#f-bm').checked = false;
      var sub = U.qs('#f-subject');
      sub.innerHTML = '<option value="">All subjects</option>';
      BB.subjects().forEach(function (x) { var o = document.createElement('option'); o.value = x.id; o.textContent = x.code + ' - ' + x.name; sub.appendChild(o); });
      render();
    });
  }

  function list() {
    var term = state.q.trim().toLowerCase();
    return BB.db.questions.filter(function (q) {
      var s = BB.subject(q.subject);
      if (!s) return false;
      if (state.branch && s.branch !== state.branch) return false;
      if (state.sem && s.sem !== +state.sem) return false;
      if (state.subject && q.subject !== state.subject) return false;
      if (state.tag && q.tags.indexOf(state.tag) === -1) return false;
      if (state.bm && !BB.isBookmark(q.id)) return false;
      if (term && (q.text + ' ' + (q.topic || '')).toLowerCase().indexOf(term) === -1) return false;
      return true;
    }).sort(function (a, b) {
      var w = { vi: 0, fa: 1, rq: 2, it: 3, pq: 4 };
      var wa = w[a.tags[0]] != null ? w[a.tags[0]] : 9, wb = w[b.tags[0]] != null ? w[b.tags[0]] : 9;
      return wa - wb || b.years.length - a.years.length;
    });
  }

  function render() {
    var all = list();
    U.qs('#count-badge').textContent = all.length + ' question' + (all.length === 1 ? '' : 's');

    /* summary tiles */
    var tiles = [
      { k: 'vi', label: 'Very Important', tone: 'red', icon: 'flame' },
      { k: 'fa', label: 'Frequently Asked', tone: 'blue', icon: 'activity' },
      { k: 'rq', label: 'Repeated Question', tone: 'purple', icon: 'repeat' },
      { k: 'it', label: 'Important Topic', tone: 'green', icon: 'target' },
      { k: 'pq', label: 'Practice Question', tone: '', icon: 'bulb' },
      { k: 'bm', label: 'Your bookmarks', tone: 'amber', icon: 'bookmark' },
      { k: 'papers', label: 'Papers available', tone: 'cyan', icon: 'file' },
      { k: 'subjects', label: 'Subjects with questions', tone: '', icon: 'book' }
    ];
    U.qs('#summary-grid').innerHTML = tiles.map(function (t) {
      var v;
      if (t.k === 'bm') v = BB.user.bookmarks.length;
      else if (t.k === 'papers') v = BB.db.papers.length;
      else if (t.k === 'subjects') v = BB.db.subjects.filter(function (s) { return s.questionCount > 0; }).length;
      else v = BB.db.questions.filter(function (q) { return q.tags.indexOf(t.k) !== -1; }).length;
      return '<div class="stat"><div class="v">' + U.fmtNum(v) + '</div><div class="k">' + t.label + '</div></div>';
    }).join('');

    var host = U.qs('#q-list');
    if (!all.length) {
      host.innerHTML = U.emptyState({
        icon: 'flame', title: 'No questions match these filters',
        text: 'Try a different label, branch or semester - or clear the search box.',
        action: '<button class="btn btn-soft btn-sm" onclick="document.getElementById(\'reset\').click()">Reset filters</button>'
      });
      return;
    }

    var shown = all.slice(0, state.limit);
    host.innerHTML = shown.map(function (q) {
      var s = BB.subject(q.subject);
      var b = BB.branch(s.branch) || {};
      return '<div class="q-item"><span class="q-num">' + q.unit + '</span>' +
        '<div style="min-width:0;flex:1"><div class="q-text">' + U.esc(q.text) + '</div>' +
        '<div class="q-meta">' + U.tagBadges(q.tags, q.years) +
        '<span class="badge badge-gray">' + U.icon('target', 12) + U.esc(q.topic || 'General') + '</span></div>' +
        '<div class="q-meta"><a class="badge badge-blue" href="subject.html?id=' + encodeURIComponent(s.id) + '">' + U.esc(s.code) + ' ' + U.esc(s.name) + '</a>' +
        '<span class="badge badge-gray">' + U.esc(b.code) + ' Sem ' + s.sem + ' | Unit ' + q.unit + '</span></div></div>' +
        '<div class="q-actions">' +
        '<button class="icon-btn' + (BB.isBookmark(q.id) ? ' on' : '') + '" data-bm="' + q.id + '" title="Bookmark">' + U.icon('bookmark', 16) + '</button>' +
        '</div></div>';
    }).join('') + (all.length > shown.length ? '<div class="center mt-3"><button class="btn btn-outline" id="more">Load more questions</button></div>' : '');

    U.qa('[data-bm]', host).forEach(function (btn) {
      var id = btn.getAttribute('data-bm');
      function sync() { btn.classList.toggle('on', BB.isBookmark(id)); }
      sync(); BB.onChange(sync);
      btn.addEventListener('click', function () {
        var on = BB.toggleBookmark(id);
        U.toast(on ? 'Question bookmarked' : 'Bookmark removed', '', on ? 'success' : 'info');
      });
    });
    var more = U.qs('#more', host);
    if (more) more.addEventListener('click', function () { state.limit += 60; render(); });
  }
})();
