/* ==========================================================================
   Backlog Buddy — study resources & preparation guidance
   ========================================================================== */
(function () {
  'use strict';
  var U = window.BBUI, BB = window.BB;

  U.renderHeader('resources.html');
  U.renderFooter();

  var state = { q: '', branch: '', sem: '', subject: '', type: '' };

  BB.ready(function () {
    var p = U.params();
    state.branch = p.branch || '';
    state.subject = p.subject || '';
    buildFilters();
    wire();
    renderGuides();
    renderPlan();
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
  }

  function wire() {
    var t;
    U.qs('#q').addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { state.q = this.value; render(); }, 150); });
    U.qs('#f-branch').addEventListener('change', function () {
      state.branch = this.value; state.subject = '';
      var sub = U.qs('#f-subject');
      sub.innerHTML = '<option value="">All subjects</option>';
      BB.subjects({ branch: state.branch || undefined }).forEach(function (x) { var o = document.createElement('option'); o.value = x.id; o.textContent = x.code + ' - ' + x.name; sub.appendChild(o); });
      render();
    });
    ['#f-sem', '#f-subject', '#f-type'].forEach(function (sel) {
      U.qs(sel).addEventListener('change', function () {
        state[sel === '#f-sem' ? 'sem' : sel === '#f-subject' ? 'subject' : 'type'] = this.value;
        render();
      });
    });
    U.qs('#reset').addEventListener('click', function () {
      state = { q: '', branch: '', sem: '', subject: '', type: '' };
      ['#q', '#f-branch', '#f-sem', '#f-subject', '#f-type'].forEach(function (s) { U.qs(s).value = ''; });
      var sub = U.qs('#f-subject');
      sub.innerHTML = '<option value="">All subjects</option>';
      BB.subjects().forEach(function (x) { var o = document.createElement('option'); o.value = x.id; o.textContent = x.code + ' - ' + x.name; sub.appendChild(o); });
      render();
    });
  }

  function renderGuides() {
    var guides = [
      { icon: 'file', tone: '', t: 'Previous question papers', d: 'Start here. Solve the last two papers of your subject before reading notes - it shows exactly what is asked.', link: 'papers.html' },
      { icon: 'layers', tone: 'green', t: 'Unit-wise important questions', d: 'Work through the important questions of each unit in order. Two units a day is a realistic target.', link: 'important.html' },
      { icon: 'folder', tone: 'cyan', t: 'Notes, syllabi & formula sheets', d: 'Use notes only to fill gaps after attempting questions, not as the first step of revision.', link: '#resources' },
      { icon: 'clipboard', tone: 'red', t: 'Track your preparation', d: 'Maintain a personal checklist per subject on the dashboard so nothing is left for the last day.', link: 'dashboard.html' }
    ];
    U.qs('#guide-grid').innerHTML = guides.map(function (g) {
      return '<a class="card card-hover reveal" href="' + g.link + '">' +
        '<div class="card-ico ' + g.tone + '">' + U.icon(g.icon, 21) + '</div>' +
        '<h3 class="card-title mt-2">' + U.esc(g.t) + '</h3><p class="small">' + U.esc(g.d) + '</p>' +
        '<div class="pc-foot"><span class="btn btn-soft btn-sm">Open' + U.icon('arrowRight', 14) + '</span></div></a>';
    }).join('');
    U.reveal();
  }

  function renderPlan() {
    var weeks = [
      { w: 'Week 1', t: 'Pattern & gap analysis', d: 'List every backlog subject, open the latest paper for each, and mark the units you cannot answer at all.' },
      { w: 'Week 2', t: 'High weight units', d: 'Cover the units with the most repeated topics. Solve their important questions on paper, not just by reading.' },
      { w: 'Week 3', t: 'Full papers under time', d: 'Write at least two complete papers per subject in exam conditions and review them honestly.' },
      { w: 'Week 4', t: 'Revision & formulas', d: 'Revise formula sheets, definitions and diagrams. Solve one model paper the day before each exam.' }
    ];
    U.qs('#plan-grid').innerHTML = weeks.map(function (x) {
      return '<div class="card step reveal"><span class="n">' + x.w.replace('Week ', 'W') + '</span><h4>' + U.esc(x.t) + '</h4><p class="small">' + U.esc(x.d) + '</p></div>';
    }).join('');
  }

  function list() {
    var term = state.q.trim().toLowerCase();
    return BB.db.materials.filter(function (m) {
      var s = BB.subject(m.subject);
      if (!s) return false;
      if (state.branch && s.branch !== state.branch) return false;
      if (state.sem && s.sem !== +state.sem) return false;
      if (state.subject && m.subject !== state.subject) return false;
      if (state.type && m.type !== state.type) return false;
      if (term && (m.title + ' ' + m.type + ' ' + s.name).toLowerCase().indexOf(term) === -1) return false;
      return true;
    }).sort(function (a, b) { return a.title.localeCompare(b.title); }).slice(0, 60);
  }

  function render() {
    var all = list();
    U.qs('#count-badge').textContent = all.length + ' resource' + (all.length === 1 ? '' : 's');
    var host = U.qs('#res-grid');
    if (!all.length) {
      host.innerHTML = U.emptyState({
        icon: 'folder', title: 'No resources match these filters',
        text: 'Try a different subject or resource type.',
        action: '<button class="btn btn-soft btn-sm" onclick="document.getElementById(\'reset\').click()">Reset filters</button>'
      });
      return;
    }
    var tone = { 'Syllabus': 'cyan', 'Notes': 'green', 'Important Questions': 'amber', 'Formula Sheet': 'purple', 'Question Papers': 'blue', 'Video': 'red' };
    host.innerHTML = all.map(function (m) {
      var s = BB.subject(m.subject);
      var external = m.url && /^https?:/i.test(m.url);
      return '<div class="card card-hover reveal">' +
        '<div class="card-head"><span class="card-ico ' + (tone[m.type] || '') + '">' + U.icon(external ? 'external' : 'folder', 20) + '</span>' +
        '<div style="min-width:0"><div class="card-title">' + U.esc(m.title) + '</div>' +
        '<div class="tiny muted">' + U.esc(s.code) + ' | ' + U.esc(BB.branch(s.branch).code) + ' Sem ' + s.sem + '</div></div></div>' +
        '<div class="codes"><span class="badge badge-gray">' + U.esc(m.type) + '</span><span class="badge badge-gray">' + U.esc(m.size) + '</span></div>' +
        '<div class="pc-foot">' +
        (external ? '<a class="btn btn-primary btn-sm" href="' + U.esc(m.url) + '" target="_blank" rel="noopener">Open</a>'
          : '<a class="btn btn-primary btn-sm" href="subject.html?id=' + encodeURIComponent(s.id) + '#materials">Open in subject</a>') +
        '<a class="btn btn-ghost btn-sm" href="subject.html?id=' + encodeURIComponent(s.id) + '">Subject page</a>' +
        '</div></div>';
    }).join('');
    U.reveal();
  }
})();
