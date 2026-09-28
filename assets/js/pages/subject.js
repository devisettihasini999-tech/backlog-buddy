/* ==========================================================================
   Backlog Buddy — subject detail page
   ========================================================================== */
(function () {
  'use strict';
  var U = window.BBUI, BB = window.BB;
  var subject = null;

  U.renderHeader('');
  U.renderFooter();

  BB.ready(function () {
    var id = U.param('id');
    subject = BB.subject(id);
    if (!subject) { renderMissing(); return; }
    document.title = subject.name + ' (' + subject.code + ') - Backlog Buddy';
    renderHead();
    renderTabs();
    renderPapers();
    renderImportant();
    renderFaq();
    renderRepeated();
    renderUnits();
    renderModel();
    renderDownloads();
    renderMaterials();
    renderTips();
    U.reveal();
  });

  /* ------------------------- head ------------------------- */
  function renderHead() {
    var b = BB.branch(subject.branch) || {};
    U.qs('#crumbs').innerHTML = '<a href="index.html">Home</a><span class="sep">/</span>' +
      '<a href="subjects.html?branch=' + b.id + '">' + U.esc(b.code) + '</a><span class="sep">/</span>' +
      '<a href="subjects.html?branch=' + b.id + '&sem=' + subject.sem + '">Semester ' + subject.sem + '</a><span class="sep">/</span>' +
      '<span>' + U.esc(subject.code) + '</span>';

    U.qs('#subject-head').innerHTML =
      '<div class="row row-wrap" style="align-items:flex-start">' +
      '<span class="card-ico" style="width:52px;height:52px">' + U.icon(b.icon || 'book', 26) + '</span>' +
      '<div style="min-width:240px"><span class="eyebrow">' + U.esc(b.name || '') + ' | Semester ' + subject.sem + '</span>' +
      '<h1 class="mt-2">' + U.esc(subject.name) + '</h1>' +
      '<div class="codes mt-2">' +
      '<span class="badge badge-blue">' + U.icon('grid', 12) + U.esc(subject.code) + '</span>' +
      '<span class="badge badge-gray">' + U.esc(subject.regulation) + '</span>' +
      '<span class="badge badge-gray">' + U.esc(subject.university) + '</span>' +
      '<span class="badge badge-gray">' + subject.credits + ' credits</span>' +
      '<span class="badge ' + (subject.paperCount ? 'badge-green' : 'badge-gray') + '">' + subject.paperCount + ' papers</span>' +
      '<span class="badge ' + (subject.questionCount ? 'badge-fa' : 'badge-gray') + '">' + subject.questionCount + ' questions</span>' +
      '</div></div>' +
      '<span class="spacer"></span>' +
      '<div class="row row-wrap">' +
      '<button class="btn btn-soft btn-sm" id="fav-btn">' + U.icon('star', 15) + '<span>Save subject</span></button>' +
      '<button class="btn btn-outline btn-sm" id="done-btn">' + U.icon('circleCheck', 15) + '<span>Mark completed</span></button>' +
      '<button class="btn btn-outline btn-sm" id="checklist-btn">' + U.icon('plus', 15) + '<span>Add to checklist</span></button>' +
      '</div></div>' +
      '<p class="lead mt-3">' + U.esc(subject.desc) + '</p>';

    var favBtn = U.qs('#fav-btn'), doneBtn = U.qs('#done-btn');
    function syncFav() {
      var on = BB.isFavorite(subject.id);
      favBtn.classList.toggle('btn-primary', on);
      favBtn.classList.toggle('btn-soft', !on);
      favBtn.querySelector('span').textContent = on ? 'Saved' : 'Save subject';
    }
    function syncDone() {
      var on = BB.isCompleted(subject.id);
      doneBtn.classList.toggle('btn-primary', on);
      doneBtn.classList.toggle('btn-outline', !on);
      doneBtn.querySelector('span').textContent = on ? 'Completed' : 'Mark completed';
    }
    syncFav(); syncDone();
    BB.onChange(function () { syncFav(); syncDone(); });
    favBtn.addEventListener('click', function () {
      var on = BB.toggleFavorite(subject.id);
      U.toast(on ? 'Subject saved' : 'Removed from favourites', subject.name, on ? 'success' : 'info');
    });
    doneBtn.addEventListener('click', function () {
      var on = BB.toggleCompleted(subject.id);
      U.toast(on ? 'Marked as completed' : 'Marked as pending', subject.name, on ? 'success' : 'info');
    });
    U.qs('#checklist-btn').addEventListener('click', function () {
      BB.addChecklist('Revise ' + subject.name + ' (' + subject.code + ') - unit wise important questions', subject.id);
      U.toast('Added to your checklist', 'Open the dashboard to track it.', 'success');
    });
  }

  function renderTabs() {
    var tabs = [
      ['papers', 'Previous Papers', 'file'],
      ['important', 'Important Questions', 'flame'],
      ['faq', 'FAQ', 'activity'],
      ['repeated', 'Repeated Topics', 'repeat'],
      ['units', 'Unit-wise', 'layers'],
      ['model', 'Model Papers', 'book'],
      ['downloads', 'Downloads', 'download'],
      ['materials', 'Study Materials', 'folder'],
      ['tips', 'Exam Tips', 'bulb']
    ];
    U.qs('#section-tabs').innerHTML = tabs.map(function (t) {
      return '<a class="tab" href="#' + t[0] + '">' + U.icon(t[2], 15) + t[1] + '</a>';
    }).join('');
  }

  /* ------------------------- 1. papers ------------------------- */
  function renderPapers() {
    var host = U.qs('#paper-grid');
    var papers = BB.papersOf(subject.id);
    if (!papers.length) {
      host.innerHTML = '<div style="grid-column:1/-1">' + U.emptyState({
        icon: 'file', title: 'No question papers uploaded yet',
        text: 'Papers for ' + subject.name + ' have not been added yet. An administrator can upload them from the admin panel, or you can request this subject.',
        action: '<a class="btn btn-soft btn-sm" href="contact.html?subject=' + encodeURIComponent(subject.code) + '">Request this paper</a>'
      }) + '</div>';
      U.qs('#download-all').style.display = 'none';
      return;
    }
    host.innerHTML = papers.map(function (p) {
      var d = BB.paper(p.id);
      var latest = p.year === Math.max.apply(null, papers.map(function (x) { return x.year; }));
      return '<div class="card card-hover paper-card reveal">' +
        '<div class="pc-top"><span class="pc-year"><b>' + p.year + '</b><span>' + (p.examType === 'Regular' ? 'REG' : p.examType === 'Supplementary' ? 'SUPP' : p.examType === 'Backlog' ? 'BKLG' : 'MKUP') + '</span></span>' +
        '<div class="pc-body"><div class="pc-title">' + U.esc(p.examType) + ' examination</div>' +
        '<div class="pc-meta">' +
        '<span class="badge badge-blue">' + U.esc(subject.code) + '</span>' +
        '<span class="badge badge-gray">Sem ' + subject.sem + '</span>' +
        '<span class="badge badge-gray">' + U.esc(subject.regulation) + '</span>' +
        (latest ? '<span class="badge badge-green">Latest</span>' : '') +
        '</div></div></div>' +
        '<div class="tiny muted">Uploaded ' + U.fmtDate(p.uploadedAt) + ' | ' + U.fmtNum(p.downloads) + ' downloads' + (p.file ? ' | PDF file attached' : '') + '</div>' +
        '<div class="pc-foot">' +
        '<a class="btn btn-primary btn-sm" href="paper.html?id=' + encodeURIComponent(p.id) + '">' + U.icon('eye', 15) + 'View paper</a>' +
        '<button class="btn btn-outline btn-sm" data-dl="' + p.id + '">' + U.icon('download', 15) + 'Download</button>' +
        '<button class="btn btn-ghost btn-sm" data-save="' + p.id + '" title="Save paper">' + U.icon('bookmark', 15) + '</button>' +
        '</div></div>';
    }).join('');

    U.qa('[data-dl]', host).forEach(function (btn) {
      btn.addEventListener('click', function () { downloadPaper(btn.getAttribute('data-dl')); });
    });
    U.qa('[data-save]', host).forEach(function (btn) {
      var id = btn.getAttribute('data-save');
      function sync() { btn.classList.toggle('btn-primary', BB.isSavedPaper(id)); btn.classList.toggle('btn-outline', !BB.isSavedPaper(id)); }
      sync(); BB.onChange(sync);
      btn.addEventListener('click', function () {
        var on = BB.toggleSavedPaper(id);
        U.toast(on ? 'Paper saved' : 'Paper removed', 'Find it on your dashboard.', on ? 'success' : 'info');
      });
    });

    U.qs('#download-all').addEventListener('click', function () {
      papers.forEach(function (p, i) { setTimeout(function () { downloadPaper(p.id, true); }, i * 350); });
      U.toast('Downloading ' + papers.length + ' papers', 'Check your browser downloads.', 'success');
    });
  }

  /* ------------------------- 2. important questions ------------------------- */
  var impFilter = '';
  function renderImportant() {
    var filters = [
      { k: '', label: 'All' }, { k: 'vi', label: 'Very Important' }, { k: 'fa', label: 'Frequently Asked' },
      { k: 'rq', label: 'Repeated Question' }, { k: 'it', label: 'Important Topic' }, { k: 'pq', label: 'Practice' }
    ];
    var host = U.qs('#imp-filters');
    host.innerHTML = filters.map(function (f) {
      var n = f.k ? BB.questionsOf(subject.id).filter(function (q) { return q.tags.indexOf(f.k) !== -1; }).length : BB.questionsOf(subject.id).length;
      return '<button class="chip' + (impFilter === f.k ? ' active' : '') + '" data-imp="' + f.k + '">' + f.label + ' <span class="tiny">(' + n + ')</span></button>';
    }).join('');
    U.qa('[data-imp]', host).forEach(function (btn) {
      btn.addEventListener('click', function () { impFilter = btn.getAttribute('data-imp'); renderImportant(); });
    });
    renderImpList();
  }

  function questionRow(q, showUnit) {
    var aiBtn = (window.BBAPI && BBAPI.aiEnabled())
      ? '<button class="icon-btn" data-ai="' + q.id + '" title="Explain this question with AI">' + U.icon('sparkles', 16) + '</button>'
      : '';
    return '<div class="q-item" data-q="' + q.id + '"><span class="q-num">' + q.unit + '</span>' +
      '<div style="min-width:0;flex:1"><div class="q-text">' + U.esc(q.text) + '</div>' +
      '<div class="q-meta">' + U.tagBadges(q.tags, q.years) +
      '<span class="badge badge-gray">' + U.icon('target', 12) + U.esc(q.topic || 'General') + '</span>' +
      (showUnit ? '<span class="badge badge-gray">Unit ' + q.unit + '</span>' : '') +
      '</div></div>' +
      '<div class="q-actions">' + aiBtn +
      '<button class="icon-btn' + (BB.isBookmark(q.id) ? ' on' : '') + '" data-bm="' + q.id + '" title="Bookmark question">' + U.icon('bookmark', 16) + '</button>' +
      '<button class="icon-btn" data-copy="' + q.id + '" title="Copy question">' + U.icon('clipboard', 16) + '</button>' +
      '</div></div>';
  }

  function bindQuestionActions(host) {
    U.qa('[data-bm]', host).forEach(function (btn) {
      var id = btn.getAttribute('data-bm');
      function sync() { btn.classList.toggle('on', BB.isBookmark(id)); }
      sync(); BB.onChange(sync);
      btn.addEventListener('click', function () {
        var on = BB.toggleBookmark(id);
        U.toast(on ? 'Question bookmarked' : 'Bookmark removed', 'See bookmarks on your dashboard.', on ? 'success' : 'info');
      });
    });
    U.qa('[data-copy]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var q = BB.idx.question[btn.getAttribute('data-copy')];
        var text = q.text + '\n[' + subject.code + ' - Unit ' + q.unit + ']';
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { U.toast('Copied to clipboard', '', 'success'); });
        else U.toast('Copy not supported', 'Select the text manually.', 'error');
      });
    });
    U.qa('[data-ai]', host).forEach(function (btn) {
      btn.addEventListener('click', function () { askAI(BB.idx.question[btn.getAttribute('data-ai')]); });
    });
  }

  /* ------------------------- AI assistant ------------------------- */
  function askAI(q) {
    if (!q) return;
    var modes = [
      { k: 'explain', label: 'Explain' },
      { k: 'answer', label: 'Model answer' },
      { k: 'summarise', label: 'Summarise topic' },
      { k: 'plan', label: 'Revision plan' }
    ];
    var m = U.modal({
      title: 'AI study assistant', icon: 'sparkles',
      body: '<div class="callout warn" style="margin-bottom:14px">' +
        U.icon('alert', 20) + '<div><b>Guidance only</b><p>The assistant explains and summarises from the question you give it. It never predicts exam questions.</p></div></div>' +
        '<div class="card" style="background:var(--surface-2)"><div class="tiny muted">' + U.esc(subject.code) + ' | Unit ' + q.unit + '</div>' +
        '<div style="font-weight:650;margin-top:4px">' + U.esc(q.text) + '</div></div>' +
        '<div class="row row-wrap mt-3">' + modes.map(function (x) {
          return '<button class="chip' + (x.k === 'explain' ? ' active' : '') + '" data-mode="' + x.k + '">' + x.label + '</button>';
        }).join('') + '</div>' +
        '<div id="ai-out" class="card mt-3" style="white-space:pre-wrap;font-size:0.93rem;min-height:120px">' +
        '<div class="loading-block"><span class="spinner"></span><span>Thinking...</span></div></div>',
      actions: '<button class="btn btn-outline btn-sm" data-close>Close</button>' +
        '<button class="btn btn-primary btn-sm" id="ai-copy">' + U.icon('clipboard', 15) + 'Copy answer</button>',
      onMount: function (el, close) {
        var mode = 'explain';
        var out = U.qs('#ai-out', el);
        function run() {
          out.innerHTML = '<div class="loading-block"><span class="spinner"></span><span>Thinking...</span></div>';
          BBAPI.ai(q.text + '\n\nSubject: ' + subject.name + ' (' + subject.code + '), Unit ' + q.unit +
            (subject.units[q.unit - 1] ? ' - ' + subject.units[q.unit - 1].title : ''), mode)
            .then(function (res) {
              out.textContent = res.answer;
              out.setAttribute('data-src', res.source || '');
              if (res.source === 'fallback') {
                out.innerHTML += '<div class="tiny muted mt-2">Answered by the built in fallback - add GEMINI_API_KEY on the server for full AI answers.</div>';
              }
            })
            .catch(function (e) {
              out.innerHTML = '<div class="callout warn">' + U.icon('alert', 20) +
                '<div><b>AI request failed</b><p>' + U.esc(e.message || 'Unknown error') + '</p></div></div>';
            });
        }
        U.qa('[data-mode]', el).forEach(function (b) {
          b.addEventListener('click', function () {
            U.qa('[data-mode]', el).forEach(function (x) { x.classList.remove('active'); });
            b.classList.add('active');
            mode = b.getAttribute('data-mode');
            run();
          });
        });
        U.qs('#ai-copy', el).addEventListener('click', function () {
          if (navigator.clipboard && out.textContent.trim()) {
            navigator.clipboard.writeText(out.textContent).then(function () { U.toast('Copied', '', 'success'); });
          } else U.toast('Nothing to copy', '', 'error');
        });
        run();
      }
    });
    return m;
  }

  function renderImpList() {
    var host = U.qs('#imp-list');
    var list = BB.questionsOf(subject.id).filter(function (q) { return !impFilter || q.tags.indexOf(impFilter) !== -1; });
    if (!list.length) {
      host.innerHTML = U.emptyState({ icon: 'flame', title: 'No questions in this category yet', text: 'Choose another filter or check back after the next paper is uploaded.' });
      return;
    }
    host.innerHTML = list.map(function (q) { return questionRow(q, false); }).join('');
    bindQuestionActions(host);
  }

  /* ------------------------- 3. FAQ ------------------------- */
  function renderFaq() {
    var host = U.qs('#faq-list');
    var list = BB.questionsOf(subject.id).filter(function (q) { return q.tags.indexOf('fa') !== -1; });
    if (!list.length) {
      host.innerHTML = U.emptyState({ icon: 'activity', title: 'No frequently asked questions recorded yet', text: 'Once papers are uploaded for this subject, frequently asked questions are identified automatically.' });
      return;
    }
    host.innerHTML = list.slice(0, 12).map(function (q) { return questionRow(q, false); }).join('');
    bindQuestionActions(host);
  }

  /* ------------------------- 4. repeated ------------------------- */
  function renderRepeated() {
    var host = U.qs('#repeated-body');
    var list = BB.repeatedOf(subject.id);
    if (!list.length) {
      host.innerHTML = U.emptyState({ icon: 'repeat', title: 'Not enough papers for pattern analysis', text: 'At least two previous papers are needed before repeated topics can be counted. Upload more papers from the admin panel.' });
      return;
    }
    host.innerHTML = '<div class="table-wrap table-scroll"><table><thead><tr>' +
      '<th>Topic / question</th><th>Unit</th><th>Appeared in</th><th>Questions</th><th>Years seen</th></tr></thead><tbody>' +
      list.map(function (t) {
        return '<tr><td><b>' + U.esc(t.topic) + '</b></td><td>Unit ' + t.unit + '</td>' +
          '<td><span class="badge badge-rq">' + U.icon('repeat', 12) + 'Appeared in ' + t.papers + ' previous paper' + (t.papers > 1 ? 's' : '') + '</span></td>' +
          '<td>' + t.questions + '</td><td class="tiny muted">' + t.years.join(', ') + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<div class="callout mt-3"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>' +
      '<div><b>Counts come from uploaded papers only</b><p>The number of appearances is calculated from the previous papers available on Backlog Buddy. This is study guidance based on history, not a prediction of your exam paper.</p></div></div>';
  }

  /* ------------------------- 5. unit wise ------------------------- */
  function renderUnits() {
    var host = U.qs('#unit-acc');
    host.innerHTML = subject.units.map(function (u) {
      var qs = BB.questionsOf(subject.id, u.n);
      var topics = u.topics.length ? u.topics : [];
      return '<div class="acc-item' + (u.n === 1 ? ' open' : '') + '">' +
        '<button class="acc-head"><span class="acc-ico">U' + u.n + '</span>' +
        '<span>Unit ' + u.n + ' - ' + U.esc(u.title) + '<span class="tiny muted" style="display:block;font-weight:600">' + qs.length + ' important questions' + (topics.length ? ' | ' + topics.length + ' key topics' : '') + '</span></span>' +
        '<span class="chev">' + U.icon('chevDown', 18) + '</span></button>' +
        '<div class="acc-body">' +
        (topics.length ? '<div class="tag-cloud" style="margin-bottom:12px">' + topics.map(function (t) { return '<span class="chip" style="cursor:default">' + U.icon('target', 13) + U.esc(t) + '</span>'; }).join('') + '</div>' : '') +
        (qs.length ? '<div class="stack">' + qs.map(function (q) { return questionRow(q, false); }).join('') + '</div>'
          : U.emptyState({ icon: 'layers', title: 'No questions recorded for this unit', text: 'Questions will appear here once papers for this subject are uploaded.' })) +
        '</div></div>';
    }).join('');
    U.qa('.acc-head', host).forEach(function (h) {
      h.addEventListener('click', function () { h.parentElement.classList.toggle('open'); });
    });
    bindQuestionActions(host);
  }

  /* ------------------------- 6. model papers ------------------------- */
  function renderModel() {
    var host = U.qs('#model-grid');
    var variants = ['Model Paper A', 'Model Paper B'];
    host.innerHTML = variants.map(function (name, vi) {
      return '<div class="card card-hover reveal">' +
        '<div class="card-ico green">' + U.icon('book', 21) + '</div>' +
        '<h3 class="card-title mt-2">' + name + '</h3>' +
        '<p class="small">A full length practice paper built from the questions available for ' + U.esc(subject.name) + '. ' +
        'Two questions per unit, matching the usual ' + subject.regulation + ' pattern.</p>' +
        '<div class="codes mt-2"><span class="badge badge-gray">60 marks</span><span class="badge badge-gray">3 hours</span>' +
        '<span class="badge badge-gray">5 units</span></div>' +
        '<div class="pc-foot">' +
        '<button class="btn btn-primary btn-sm" data-model="' + vi + '">' + U.icon('eye', 15) + 'View model paper</button>' +
        '<button class="btn btn-outline btn-sm" data-model-dl="' + vi + '">' + U.icon('download', 15) + 'Download PDF</button>' +
        '</div></div>';
    }).join('');
    U.qa('[data-model]', host).forEach(function (b) {
      b.addEventListener('click', function () { openModelPaper(+b.getAttribute('data-model')); });
    });
    U.qa('[data-model-dl]', host).forEach(function (b) {
      b.addEventListener('click', function () { downloadModelPaper(+b.getAttribute('data-model-dl')); });
    });
  }

  function modelQuestions(variant) {
    var all = BB.questionsOf(subject.id);
    var byUnit = {};
    all.forEach(function (q) { (byUnit[q.unit] = byUnit[q.unit] || []).push(q); });
    var out = [];
    subject.units.forEach(function (u) {
      var arr = byUnit[u.n] || [];
      var a = arr[0], b = arr[(1 + variant) % Math.max(1, arr.length)];
      if (a) out.push(a);
      if (b && b !== a) out.push(b);
    });
    return out;
  }

  function openModelPaper(variant) {
    var qs = modelQuestions(variant);
    if (!qs.length) { U.toast('Model paper unavailable', 'No questions are available for this subject yet.', 'error'); return; }
    var body = '<div class="paper-sheet" style="box-shadow:none;border:none;padding:0">' +
      '<div class="ps-head"><div class="inst">' + U.esc(subject.university) + '</div>' +
      '<h2>B.Tech. Semester ' + subject.sem + ' Examination - Model Paper ' + (variant === 0 ? 'A' : 'B') + '</h2>' +
      '<div class="sub">' + U.esc(subject.name) + ' (' + U.esc(subject.code) + ')</div></div>' +
      '<div class="ps-meta"><span>Regulation: ' + U.esc(subject.regulation) + '</span><span>Max. Marks: 60</span><span>Time: 3 hours</span></div>' +
      '<div class="ps-instr">Answer one question from each unit. All questions carry equal marks.</div>';
    subject.units.forEach(function (u) {
      var uq = qs.filter(function (q) { return q.unit === u.n; });
      if (!uq.length) return;
      body += '<div class="ps-unit">Unit ' + u.n + ' - ' + U.esc(u.title) + '</div>';
      uq.forEach(function (q, i) { body += '<div class="ps-q"><b>' + (uq.length > 1 ? (i === 0 ? 'a)' : 'b)') : '') + '</b>' + U.esc(q.text) + '</div>'; });
    });
    body += '<div class="ps-foot">Generated by Backlog Buddy from the previous papers available on the platform. For practice only.</div></div>';
    U.modal({
      title: 'Model paper - ' + subject.name,
      icon: 'book',
      body: '<div class="scroll-y">' + body + '</div>',
      actions: '<button class="btn btn-outline btn-sm" data-close>Close</button>' +
        '<button class="btn btn-primary btn-sm" id="m-print">' + U.icon('printer', 15) + 'Print</button>'
    });
    U.qs('#m-print').addEventListener('click', function () {
      var w = window.open('', '_blank');
      if (!w) { U.toast('Popup blocked', 'Allow popups to print.', 'error'); return; }
      w.document.write('<html><head><title>Model paper</title><style>body{font-family:"Times New Roman",serif;padding:32px;color:#111} h2{margin:4px 0} .ps-unit{font-weight:700;margin:14px 0 6px;text-decoration:underline} .ps-head{text-align:center;border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:14px}</style></head><body>' + U.qs('.modal-body').innerHTML + '</body></html>');
      w.document.close(); w.focus(); w.print();
    });
  }

  function downloadModelPaper(variant) {
    var qs = modelQuestions(variant);
    if (!qs.length) { U.toast('Nothing to download', 'No questions available yet.', 'error'); return; }
    var b = new BBPdf.Builder({ title: subject.code + ' model paper' });
    b.h1(subject.university);
    b.text('B.Tech. Semester ' + subject.sem + ' Examination - Model Paper ' + (variant === 0 ? 'A' : 'B'), { size: 11.5, bold: true, align: 'center' });
    b.text('Regulation: ' + subject.regulation + '   |   Max. Marks: 60   |   Time: 3 hours', { size: 9.5, align: 'center', gap: 8 });
    b.h2(subject.name + '  (' + subject.code + ')');
    b.text('Answer one question from each unit. All questions carry equal marks.', { size: 9.5, gap: 8 });
    subject.units.forEach(function (u) {
      var uq = qs.filter(function (q) { return q.unit === u.n; });
      if (!uq.length) return;
      b.need(60); b.h2('UNIT - ' + u.n + '   [' + u.title + ']');
      uq.forEach(function (q, i) { b.p((uq.length > 1 ? (i === 0 ? 'a) ' : 'b) ') : '') + q.text); });
      b.space(6);
    });
    b.rule();
    b.small('Generated by Backlog Buddy from previous papers available on the platform. For practice only.');
    U.download(subject.code + '-model-paper-' + (variant === 0 ? 'A' : 'B') + '.pdf', new Blob([b.toBytes()], { type: 'application/pdf' }));
    U.toast('Model paper downloaded', '', 'success');
  }

  /* ------------------------- 7. downloads ------------------------- */
  function renderDownloads() {
    var host = U.qs('#download-table');
    var papers = BB.papersOf(subject.id);
    if (!papers.length) {
      host.innerHTML = U.emptyState({ icon: 'download', title: 'No papers available to download', text: 'This subject has no uploaded papers yet. You can request it from the contact page.' });
      return;
    }
    host.innerHTML = '<table><thead><tr><th>Year</th><th>Exam type</th><th>Semester</th><th>Regulation</th><th>File</th><th>Action</th></tr></thead><tbody>' +
      papers.map(function (p) {
        return '<tr><td><b>' + p.year + '</b></td><td>' + U.esc(p.examType) + '</td><td>Sem ' + subject.sem + '</td><td>' + U.esc(subject.regulation) + '</td>' +
          '<td class="tiny muted">' + (p.file ? U.esc(p.file.split('/').pop()) : 'Generated PDF') + '</td>' +
          '<td><div class="row" style="gap:6px">' +
          '<a class="btn btn-soft btn-sm" href="paper.html?id=' + encodeURIComponent(p.id) + '">View</a>' +
          '<button class="btn btn-outline btn-sm" data-dl2="' + p.id + '">Download</button>' +
          '</div></td></tr>';
      }).join('') + '</tbody></table>';
    U.qa('[data-dl2]', host).forEach(function (b) {
      b.addEventListener('click', function () { downloadPaper(b.getAttribute('data-dl2')); });
    });
  }

  /* ------------------------- 8. materials ------------------------- */
  function renderMaterials() {
    var host = U.qs('#material-grid');
    var mats = BB.materialsOf(subject.id);
    if (!mats.length) {
      host.innerHTML = '<div style="grid-column:1/-1">' + U.emptyState({
        icon: 'folder', title: 'No study materials uploaded yet',
        text: 'Notes, syllabus and formula sheets for this subject will appear here once an administrator adds them.',
        action: '<a class="btn btn-soft btn-sm" href="contact.html">Suggest a resource</a>'
      }) + '</div>';
      return;
    }
    var tone = { 'Syllabus': 'cyan', 'Notes': 'green', 'Important Questions': 'amber', 'Formula Sheet': 'purple', 'Question Papers': 'blue', 'Video': 'red' };
    host.innerHTML = mats.map(function (m) {
      var t = tone[m.type] || 'blue';
      var external = m.url && /^https?:/i.test(m.url);
      return '<div class="card card-hover reveal">' +
        '<div class="card-ico ' + t + '">' + U.icon(external ? 'external' : m.type === 'Video' ? 'youtube' : 'folder', 21) + '</div>' +
        '<h3 class="card-title mt-2">' + U.esc(m.title) + '</h3>' +
        '<div class="codes mt-2"><span class="badge badge-gray">' + U.esc(m.type) + '</span><span class="badge badge-gray">' + U.esc(m.size) + '</span></div>' +
        '<div class="pc-foot">' +
        (external ? '<a class="btn btn-primary btn-sm" href="' + U.esc(m.url) + '" target="_blank" rel="noopener">Open link</a>'
          : '<button class="btn btn-primary btn-sm" data-mat="' + m.id + '">Download</button>') +
        '<span class="tiny muted">Added ' + U.fmtDate(m.addedAt) + '</span>' +
        '</div></div>';
    }).join('');
    U.qa('[data-mat]', host).forEach(function (b) {
      b.addEventListener('click', function () { downloadMaterial(b.getAttribute('data-mat')); });
    });
  }

  function downloadMaterial(id) {
    var m = BB.idx.material[id];
    if (!m) return;
    var lines = [
      'Backlog Buddy - study material',
      '===============================================',
      'Subject   : ' + subject.name + ' (' + subject.code + ')',
      'Branch    : ' + (BB.branch(subject.branch) || {}).name,
      'Semester  : ' + subject.sem,
      'Resource  : ' + m.title,
      'Type      : ' + m.type,
      '',
      'CONTENTS',
      '-----------------------------------------------'
    ];
    subject.units.forEach(function (u) {
      lines.push('', 'Unit ' + u.n + ' - ' + u.title);
      (u.topics.length ? u.topics : ['Key concepts of this unit']).forEach(function (t) { lines.push('  * ' + t); });
      BB.questionsOf(subject.id, u.n).slice(0, 4).forEach(function (q) { lines.push('  ? ' + q.text); });
    });
    lines.push('', '-----------------------------------------------',
      'Backlog Buddy - Prepare Smart. Clear Your Backlogs.',
      'This material is generated from the previous papers available on the platform.');
    U.download(subject.code + '-' + m.type.toLowerCase().replace(/\s+/g, '-') + '.txt', lines.join('\n'));
    U.toast('Download started', m.title, 'success');
  }

  /* ------------------------- 9. tips ------------------------- */
  function renderTips() {
    var tips = [
      { icon: 'target', t: 'Start from the latest paper', d: 'Solve the most recent previous paper first to understand the current question pattern and marks distribution.' },
      { icon: 'layers', t: 'Prepare unit by unit', d: 'Cover the important questions of each unit rather than reading the whole syllabus randomly. Use the unit-wise list above.' },
      { icon: 'repeat', t: 'Revise repeated topics daily', d: 'Topics that appear in multiple papers are the safest revision targets. Give them the first slot of every study session.' },
      { icon: 'clock', t: 'Use timed practice', d: 'Write answers within the exam time limit. Speed with accuracy matters more than reading in a backlog exam.' },
      { icon: 'book', t: 'Diagrams and derivations', d: 'For theory subjects, practise neat diagrams and derivations - they usually carry more marks than long paragraphs.' },
      { icon: 'clipboard', t: 'Keep a formula sheet', d: 'Maintain a single page of formulas and definitions and revise it the night before the exam.' },
      { icon: 'users', t: 'Discuss with classmates', d: 'Explaining a topic to a friend is the fastest way to find the gaps in your understanding.' },
      { icon: 'shield', t: 'Check the regulation', d: 'Always confirm your regulation and syllabus code before solving a paper, since units and marks can differ.' }
    ];
    U.qs('#tips-grid').innerHTML = tips.map(function (x) {
      return '<div class="card card-hover reveal"><div class="row" style="align-items:flex-start">' +
        '<span class="card-ico amber">' + U.icon(x.icon, 20) + '</span>' +
        '<div><h4>' + U.esc(x.t) + '</h4><p class="small">' + U.esc(x.d) + '</p></div></div></div>';
    }).join('');
  }

  /* ------------------------- shared: paper download ------------------------- */
  function downloadPaper(paperId, silent) {
    var p = BB.paper(paperId);
    if (!p) return;
    if (p.file) {
      var a = document.createElement('a');
      a.href = p.file; a.download = p.file.split('/').pop();
      document.body.appendChild(a); a.click(); a.remove();
      if (!silent) U.toast('Download started', p.subjectName + ' ' + p.year, 'success');
      return;
    }
    var qs = BB.paperQuestions(BB.idx.paper[paperId]);
    var b = new BBPdf.Builder({ title: p.code + ' ' + p.year });
    b.h1(p.university);
    b.text('B.Tech. Semester ' + p.sem + ' Examination, ' + p.year + '  (' + p.examType + ')', { size: 11.5, bold: true, align: 'center' });
    b.text('Regulation: ' + p.regulation + '   |   Max. Marks: ' + (p.marks || 60) + '   |   Time: ' + (p.duration || '3 hours'), { size: 9.5, align: 'center', gap: 8 });
    b.h2(p.subjectName + '  (' + p.code + ')');
    b.text('Answer one question from each unit. All questions carry equal marks.', { size: 9.5, gap: 8 });
    var byUnit = {};
    qs.forEach(function (q) { (byUnit[q.unit] = byUnit[q.unit] || []).push(q); });
    Object.keys(byUnit).sort(function (x, y) { return x - y; }).forEach(function (u) {
      var unit = subject.units[+u - 1];
      b.need(60);
      b.h2('UNIT - ' + u + (unit ? '   [' + unit.title + ']' : ''));
      byUnit[u].forEach(function (q, i) { b.p((byUnit[u].length > 1 ? (i === 0 ? 'a) ' : 'b) ') : '') + q.text); });
      b.space(6);
    });
    b.rule();
    b.small('Backlog Buddy - previous question paper library. Reconstructed from previous papers available on the platform; intended for practice only.');
    U.download(p.code + '-' + p.year + '-' + p.examType.toLowerCase() + '.pdf', new Blob([b.toBytes()], { type: 'application/pdf' }));
    if (!silent) U.toast('Download started', p.subjectName + ' ' + p.year, 'success');
  }

  /* ------------------------- missing subject ------------------------- */
  function renderMissing() {
    U.qs('#page').innerHTML = '<div class="section"><div style="max-width:640px;margin:0 auto">' +
      U.emptyState({
        icon: 'search', title: 'Subject not found',
        text: 'The subject you are looking for does not exist or has been removed. Browse the subject list to find it.',
        action: '<a class="btn btn-primary" href="subjects.html">Browse subjects</a>'
      }) + '</div></div>';
  }
})();
