/* ==========================================================================
   Backlog Buddy — question paper viewer
   ========================================================================== */
(function () {
  'use strict';
  var U = window.BBUI, BB = window.BB;
  var paper = null, subject = null;

  U.renderHeader('papers.html');
  U.renderFooter();

  BB.ready(function () {
    var id = U.param('id');
    var raw = BB.idx.paper[id];
    if (!raw) { renderMissing(); return; }
    paper = BB.paper(id);
    subject = BB.subject(paper.subject);
    BB.markViewed(id);
    document.title = paper.subjectName + ' ' + paper.year + ' ' + paper.examType + ' - Backlog Buddy';
    renderHead();
    renderSheet();
    renderMeta();
    renderRelated();
    renderMaterials();
    wire();
  });

  function renderHead() {
    var b = BB.branch(paper.branch) || {};
    U.qs('#crumbs').innerHTML = '<a href="index.html">Home</a><span class="sep">/</span>' +
      '<a href="papers.html">Question Papers</a><span class="sep">/</span>' +
      '<a href="papers.html?branch=' + b.id + '&sem=' + paper.sem + '">' + U.esc(b.code) + ' Sem ' + paper.sem + '</a><span class="sep">/</span>' +
      '<span>' + U.esc(paper.code) + '</span>';
    U.qs('#paper-head').innerHTML = '<span class="eyebrow">' + U.esc(b.name || '') + ' | Semester ' + paper.sem + ' | ' + U.esc(paper.examType) + '</span>' +
      '<h1 class="mt-2">' + U.esc(paper.subjectName) + ' - ' + paper.year + ' question paper</h1>' +
      '<div class="codes mt-2">' +
      '<span class="badge badge-blue">' + U.esc(paper.code) + '</span>' +
      '<span class="badge badge-gray">' + U.esc(paper.regulation) + '</span>' +
      '<span class="badge badge-gray">' + U.esc(paper.university) + '</span>' +
      '<span class="badge badge-gray">' + (paper.marks || 60) + ' marks</span>' +
      '<span class="badge badge-gray">' + U.esc(paper.duration || '3 hours') + '</span>' +
      '</div>';
  }

  function renderSheet() {
    var qs = BB.paperQuestions(BB.idx.paper[paper.id]);
    var byUnit = {};
    qs.forEach(function (q) { (byUnit[q.unit] = byUnit[q.unit] || []).push(q); });
    var html = '<div class="ps-head"><div class="inst">' + U.esc(paper.university) + '</div>' +
      '<h2>B.Tech. Semester ' + paper.sem + ' Examination, ' + paper.year + '</h2>' +
      '<div class="sub">' + U.esc(paper.subjectName) + ' (' + U.esc(paper.code) + ')</div></div>' +
      '<div class="ps-meta"><span>Regulation: ' + U.esc(paper.regulation) + '</span><span>Max. Marks: ' + (paper.marks || 60) + '</span><span>Time: ' + U.esc(paper.duration || '3 hours') + '</span></div>' +
      '<div class="ps-instr">Instructions: Answer one question from each unit. All questions carry equal marks. ' + paper.examType + ' examination.</div>';
    if (!qs.length) {
      html += '<div class="ps-q">No questions have been recorded for this paper yet. Use the admin panel to add questions to this subject.</div>';
    }
    Object.keys(byUnit).sort(function (a, b) { return a - b; }).forEach(function (u) {
      var unit = subject && subject.units[+u - 1];
      html += '<div class="ps-unit">Unit ' + u + (unit ? ' - ' + U.esc(unit.title) : '') + '</div>';
      byUnit[u].forEach(function (q, i) {
        html += '<div class="ps-q"><b>' + (byUnit[u].length > 1 ? (i === 0 ? 'a)' : 'b)') : '') + '</b>' + U.esc(q.text) + '</div>';
      });
    });
    html += '<div class="ps-foot">Backlog Buddy - previous question paper library. Uploaded ' + U.fmtDate(paper.uploadedAt) + '. This paper is provided for practice and preparation only.</div>';
    U.qs('#sheet').innerHTML = html;

    if (paper.file) {
      var emb = U.qs('#pdf-embed');
      emb.innerHTML = '<div class="field-label">Embedded PDF - ' + U.esc(paper.file.split('/').pop()) + '</div>' +
        '<iframe class="pdf-frame" src="' + U.esc(paper.file) + '" title="Question paper PDF"></iframe>';
    }
  }

  function renderMeta() {
    var rows = [
      ['Subject', paper.subjectName],
      ['Subject code', paper.code],
      ['Branch', (BB.branch(paper.branch) || {}).name],
      ['Semester', 'Semester ' + paper.sem],
      ['Academic year', paper.year],
      ['Exam type', paper.examType],
      ['Regulation', paper.regulation],
      ['University', paper.university],
      ['Uploaded', U.fmtDate(paper.uploadedAt)],
      ['Downloads', U.fmtNum(paper.downloads)]
    ];
    U.qs('#paper-meta').innerHTML = rows.map(function (r) {
      return '<div class="kv"><span class="k">' + r[0] + '</span><span class="v">' + U.esc(r[1]) + '</span></div>';
    }).join('');
  }

  function renderRelated() {
    var others = BB.papersOf(paper.subject).filter(function (p) { return p.id !== paper.id; });
    var host = U.qs('#related');
    if (!others.length) {
      host.innerHTML = '<div class="tiny muted">No other papers for this subject yet.</div>';
      return;
    }
    host.innerHTML = others.map(function (p) {
      return '<a class="mini-row" href="paper.html?id=' + encodeURIComponent(p.id) + '"><span class="mr-ico">' + U.icon('file', 15) + '</span>' +
        '<span class="mr-t"><b>' + p.year + ' ' + U.esc(p.examType) + '</b><span>' + U.esc(p.examType) + ' paper</span></span></a>';
    }).join('');
  }

  function renderMaterials() {
    var mats = BB.materialsOf(paper.subject).slice(0, 4);
    var host = U.qs('#mat-links');
    host.innerHTML = mats.length ? mats.map(function (m) {
      return '<a class="mini-row" href="subject.html?id=' + encodeURIComponent(paper.subject) + '#materials"><span class="mr-ico">' + U.icon('folder', 15) + '</span>' +
        '<span class="mr-t"><b>' + U.esc(m.title) + '</b><span>' + U.esc(m.type) + '</span></span></a>';
    }).join('') : '<div class="tiny muted">No study material uploaded yet.</div>';
    U.qs('#subject-link').href = 'subject.html?id=' + encodeURIComponent(paper.subject);
  }

  function wire() {
    var saveBtn = U.qs('#save-btn');
    function syncSave() {
      var on = BB.isSavedPaper(paper.id);
      saveBtn.classList.toggle('btn-primary', on);
      saveBtn.classList.toggle('btn-soft', !on);
      saveBtn.textContent = on ? 'Saved' : 'Save paper';
    }
    syncSave(); BB.onChange(syncSave);
    saveBtn.addEventListener('click', function () {
      var on = BB.toggleSavedPaper(paper.id);
      U.toast(on ? 'Paper saved' : 'Paper removed', 'Find saved papers on your dashboard.', on ? 'success' : 'info');
    });

    U.qs('#dl-btn').addEventListener('click', function () { download(); });
    U.qs('#print-btn').addEventListener('click', function () { window.print(); });
    U.qs('#fs-btn').addEventListener('click', function () {
      var emb = U.qs('#pdf-embed');
      if (emb.classList.contains('hidden')) {
        if (!paper.file) { U.toast('No PDF file attached', 'This paper uses the reconstructed view. Download generates a PDF instantly.', 'info'); return; }
        emb.classList.remove('hidden');
      } else emb.classList.add('hidden');
    });
  }

  function download() {
    if (paper.file) {
      var a = document.createElement('a');
      a.href = paper.file; a.download = paper.file.split('/').pop();
      document.body.appendChild(a); a.click(); a.remove();
      U.toast('Download started', paper.subjectName + ' ' + paper.year, 'success');
      return;
    }
    var qs = BB.paperQuestions(BB.idx.paper[paper.id]);
    var b = new BBPdf.Builder({ title: paper.code + ' ' + paper.year });
    b.h1(paper.university);
    b.text('B.Tech. Semester ' + paper.sem + ' Examination, ' + paper.year + '  (' + paper.examType + ')', { size: 11.5, bold: true, align: 'center' });
    b.text('Regulation: ' + paper.regulation + '   |   Max. Marks: ' + (paper.marks || 60) + '   |   Time: ' + (paper.duration || '3 hours'), { size: 9.5, align: 'center', gap: 8 });
    b.h2(paper.subjectName + '  (' + paper.code + ')');
    b.text('Instructions: Answer one question from each unit. All questions carry equal marks.', { size: 9.5, gap: 8 });
    var byUnit = {};
    qs.forEach(function (q) { (byUnit[q.unit] = byUnit[q.unit] || []).push(q); });
    Object.keys(byUnit).sort(function (x, y) { return x - y; }).forEach(function (u) {
      var unit = subject && subject.units[+u - 1];
      b.need(60);
      b.h2('UNIT - ' + u + (unit ? '   [' + unit.title + ']' : ''));
      byUnit[u].forEach(function (q, i) { b.p((byUnit[u].length > 1 ? (i === 0 ? 'a) ' : 'b) ') : '') + q.text); });
      b.space(6);
    });
    b.rule();
    b.small('Backlog Buddy - previous question paper library. Uploaded ' + paper.uploadedAt + '.');
    U.download(paper.code + '-' + paper.year + '-' + paper.examType.toLowerCase() + '.pdf', new Blob([b.toBytes()], { type: 'application/pdf' }));
    U.toast('Download started', paper.subjectName + ' ' + paper.year, 'success');
  }

  function renderMissing() {
    U.qs('#viewer').innerHTML = '<div style="grid-column:1/-1">' + U.emptyState({
      icon: 'file', title: 'Paper not found',
      text: 'This question paper does not exist or has been removed by an administrator.',
      action: '<a class="btn btn-primary" href="papers.html">Back to the library</a>'
    }) + '</div>';
  }
})();
