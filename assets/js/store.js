/* ==========================================================================
   Backlog Buddy — data store, user state, search, admin CRUD, Supabase adapter
   ========================================================================== */
(function () {
  'use strict';

  var LS_USER = 'bb_user_v1';
  var LS_OVERLAY = 'bb_admin_v1';
  var LS_THEME = 'bb_theme';
  var LS_ADMIN = 'bb_admin_session';

  /* ------------------------- config ------------------------- */
  var SUPABASE = {
    url: 'https://jcltcmildaclwjkxgrgu.supabase.co',
    anonKey: 'sb_publishable_oQ3QJgOLqZj6cWQ8oU_EYg_h6zayHTv'
  };

  var TAG_META = {
    vi: { label: 'Very Important', cls: 'badge-vi' },
    fa: { label: 'Frequently Asked', cls: 'badge-fa' },
    rq: { label: 'Repeated Question', cls: 'badge-rq' },
    it: { label: 'Important Topic', cls: 'badge-it' },
    pq: { label: 'Practice Question', cls: 'badge-pq' }
  };

  var db = {
    meta: {},
    branches: [], semesters: [], subjects: [], questions: [], papers: [], materials: [],
    repeated: {}, stats: {}
  };
  var idx = { subject: {}, paper: {}, question: {}, material: {}, branch: {} };
  var overlay = { upsert: { subjects: {}, papers: {}, questions: {}, materials: {}, branches: {} }, deleted: { subjects: [], papers: [], questions: [], materials: [], branches: [] } };
  var user = { favorites: [], bookmarks: [], savedPapers: [], completed: [], recent: [], checklist: [] };
  var supabaseState = { checked: false, enabled: false, message: '' };

  /* ------------------------- decode ------------------------- */
  function decode(raw) {
    db.meta = raw.meta || {};
    db.branches = (raw.branches || []).map(function (b) {
      return { id: b[0], code: b[1], name: b[2], icon: b[3], tone: b[4], blurb: b[5], regulation: b[6], university: b[7] };
    });
    db.semesters = (raw.semesters || []).map(function (s) { return { n: s[0], label: s[1], note: s[2] }; });
    db.subjects = (raw.subjects || []).map(function (s) {
      return {
        id: s[0], branch: s[1], sem: s[2], code: s[3], name: s[4], credits: s[5],
        regulation: s[6], university: s[7], desc: s[8], featured: !!s[10],
        units: (s[9] || []).map(function (u) { return { n: u[0], title: u[1], topics: u[2] || [] }; })
      };
    });
    db.questions = (raw.questions || []).map(function (q) {
      return { id: q[0], subject: q[1], unit: q[2], text: q[3], topic: q[4], tags: q[5] || [], years: q[6] || [], marks: q[7] || 5 };
    });
    db.papers = (raw.papers || []).map(function (p) {
      return {
        id: p[0], subject: p[1], year: p[2], examType: p[3], file: p[4], uploadedAt: p[5],
        downloads: p[6] || 0, qids: p[7] || []
      };
    });
    db.materials = (raw.materials || []).map(function (m) {
      return { id: m[0], subject: m[1], title: m[2], type: m[3], size: m[4], url: m[5], addedAt: m[6] };
    });
    db.repeated = {};
    (raw.repeated || []).forEach(function (r) {
      db.repeated[r[0]] = (r[1] || []).map(function (t) {
        return { topic: t[0], unit: t[1], papers: t[2], questions: t[3], years: t[4] || [] };
      });
    });
    db.stats = raw.stats || {};
  }

  /* ------------------------- overlay (local admin changes) ------------------------- */
  function loadOverlay() {
    try {
      var raw = JSON.parse(localStorage.getItem(LS_OVERLAY) || 'null');
      if (raw && raw.upsert) overlay = raw;
    } catch (e) { /* ignore corrupt storage */ }
  }
  function saveOverlay() {
    try { localStorage.setItem(LS_OVERLAY, JSON.stringify(overlay)); } catch (e) { }
  }

  function applyOverlay() {
    var kinds = ['branches', 'subjects', 'papers', 'questions', 'materials'];
    kinds.forEach(function (kind) {
      var up = overlay.upsert[kind] || {};
      Object.keys(up).forEach(function (id) {
        var existing = db[kind].find(function (x) { return x.id === id; });
        var rec = up[id];
        if (existing) Object.keys(rec).forEach(function (k) { existing[k] = rec[k]; });
        else db[kind].push(rec);
      });
      var del = overlay.deleted[kind] || [];
      if (del.length) db[kind] = db[kind].filter(function (x) { return del.indexOf(x.id) === -1; });
    });
  }

  /* ------------------------- user state ------------------------- */
  function loadUser() {
    try {
      var raw = JSON.parse(localStorage.getItem(LS_USER) || 'null');
      if (raw) user = Object.assign(user, raw);
    } catch (e) { }
  }
  function saveUser() {
    try { localStorage.setItem(LS_USER, JSON.stringify(user)); } catch (e) { }
  }
  function toggleIn(list, id) {
    var i = list.indexOf(id);
    if (i === -1) { list.push(id); return true; }
    list.splice(i, 1); return false;
  }
  function has(list, id) { return list.indexOf(id) !== -1; }

  /* ------------------------- indexes ------------------------- */
  function buildIndexes() {
    idx = { subject: {}, paper: {}, question: {}, material: {}, branch: {} };
    db.subjects.forEach(function (s) {
      idx.subject[s.id] = s;
      s.paperCount = db.papers.filter(function (p) { return p.subject === s.id; }).length;
      s.questionCount = db.questions.filter(function (q) { return q.subject === s.id; }).length;
      s.materialCount = db.materials.filter(function (m) { return m.subject === s.id; }).length;
    });
    db.papers.forEach(function (p) { idx.paper[p.id] = p; });
    db.questions.forEach(function (q) { idx.question[q.id] = q; });
    db.materials.forEach(function (m) { idx.material[m.id] = m; });
    db.branches.forEach(function (b) { idx.branch[b.id] = b; });
  }

  /* ------------------------- queries ------------------------- */
  function subjectsOf(branch, sem) {
    return db.subjects.filter(function (s) {
      return (!branch || s.branch === branch) && (!sem || s.sem === +sem);
    }).sort(function (a, b) { return a.code.localeCompare(b.code); });
  }

  function papersOf(subjectId) {
    return db.papers.filter(function (p) { return p.subject === subjectId; })
      .sort(function (a, b) { return b.year - a.year || a.examType.localeCompare(b.examType); });
  }

  function questionsOf(subjectId, unit) {
    return db.questions.filter(function (q) {
      return q.subject === subjectId && (!unit || q.unit === +unit);
    }).sort(function (a, b) { return b.years.length - a.years.length; });
  }

  function materialsOf(subjectId) {
    return db.materials.filter(function (m) { return m.subject === subjectId; });
  }

  function paperQuestions(paper) {
    var list = paper.qids.map(function (id) { return idx.question[id]; }).filter(Boolean);
    if (!list.length) {
      list = questionsOf(paper.subject).slice(0, 10);
    }
    return list.sort(function (a, b) { return a.unit - b.unit; });
  }

  function decoratePaper(p) {
    var s = idx.subject[p.subject] || {};
    return {
      id: p.id, title: s.name ? s.name + ' - ' + p.year + ' ' + p.examType + ' Examination' : p.id,
      subject: p.subject, subjectName: s.name || '-', code: s.code || '-',
      branch: s.branch || '-', branchCode: s.branchCode || '', sem: s.sem || null,
      year: p.year, examType: p.examType, regulation: s.regulation || '-', university: s.university || '-',
      file: p.file, uploadedAt: p.uploadedAt, downloads: p.downloads || 0, qids: p.qids
    };
  }

  function repeatedOf(subjectId) {
    if (db.repeated[subjectId] && db.repeated[subjectId].length) return db.repeated[subjectId];
    return recomputeRepeated(subjectId);
  }

  /* Live analysis: counts in how many available papers a topic appears */
  function recomputeRepeated(subjectId) {
    var qs = questionsOf(subjectId);
    var map = {};
    qs.forEach(function (q) {
      var key = (q.topic || q.text).toLowerCase();
      map[key] = map[key] || { topic: q.topic || q.text, unit: q.unit, years: {}, questions: 0 };
      (q.years || []).forEach(function (y) { map[key].years[y] = 1; });
      map[key].questions += 1;
    });
    var out = Object.keys(map).map(function (k) {
      var t = map[k];
      return { topic: t.topic, unit: t.unit, papers: Object.keys(t.years).length, questions: t.questions, years: Object.keys(t.years).map(Number).sort(function (a, b) { return b - a; }) };
    }).filter(function (t) { return t.papers >= 2; })
      .sort(function (a, b) { return b.papers - a.papers || b.questions - a.questions; });
    db.repeated[subjectId] = out;
    return out;
  }

  function recomputeAllRepeated() {
    db.subjects.forEach(function (s) { recomputeRepeated(s.id); });
  }

  /* ------------------------- search ------------------------- */
  var searchIndex = [];
  function buildSearchIndex() {
    searchIndex = [];
    db.subjects.forEach(function (s) {
      searchIndex.push({ type: 'subject', id: s.id, title: s.name, sub: s.code + ' | ' + (idx.branch[s.branch] ? idx.branch[s.branch].code : '') + ' | Sem ' + s.sem, href: 'subject.html?id=' + encodeURIComponent(s.id), subject: s.id, branch: s.branch, sem: s.sem, year: 0, regulation: s.regulation });
    });
    db.questions.forEach(function (q) {
      var s = idx.subject[q.subject];
      if (!s) return;
      searchIndex.push({ type: 'question', id: q.id, title: q.text, sub: s.name + ' (' + s.code + ') | Unit ' + q.unit, href: 'subject.html?id=' + encodeURIComponent(s.id) + '#important', subject: q.subject, branch: s.branch, sem: s.sem, year: 0, regulation: s.regulation });
    });
    db.papers.forEach(function (p) {
      var s = idx.subject[p.subject];
      if (!s) return;
      searchIndex.push({ type: 'paper', id: p.id, title: s.name + ' ' + p.year + ' ' + p.examType, sub: s.code + ' | ' + (idx.branch[s.branch] ? idx.branch[s.branch].code : '') + ' | Sem ' + s.sem, href: 'paper.html?id=' + encodeURIComponent(p.id), subject: p.subject, branch: s.branch, sem: s.sem, year: p.year, regulation: s.regulation });
    });
    db.materials.forEach(function (m) {
      var s = idx.subject[m.subject];
      if (!s) return;
      searchIndex.push({ type: 'material', id: m.id, title: m.title, sub: m.type + ' | ' + s.name, href: 'subject.html?id=' + encodeURIComponent(s.id) + '#materials', subject: m.subject, branch: s.branch, sem: s.sem, year: 0, regulation: s.regulation });
    });
  }

  function search(q, opts) {
    opts = opts || {};
    var term = (q || '').trim().toLowerCase();
    if (!term) return [];
    var words = term.split(/\s+/);
    var out = [];
    for (var i = 0; i < searchIndex.length && out.length < (opts.limit || 40); i++) {
      var e = searchIndex[i];
      var hay = (e.title + ' ' + e.sub).toLowerCase();
      var ok = words.every(function (w) { return hay.indexOf(w) !== -1; });
      if (!ok) continue;
      if (opts.branch && e.branch !== opts.branch) continue;
      if (opts.sem && e.sem !== +opts.sem) continue;
      if (opts.subject && e.subject !== opts.subject) continue;
      if (opts.year && e.year !== +opts.year) continue;
      if (opts.regulation && e.regulation !== opts.regulation) continue;
      out.push(e);
    }
    return out;
  }

  function filterPapers(f) {
    f = f || {};
    return db.papers.map(decoratePaper).filter(function (p) {
      if (f.branch && p.branch !== f.branch) return false;
      if (f.sem && p.sem !== +f.sem) return false;
      if (f.subject && p.subject !== f.subject) return false;
      if (f.code && p.code.toLowerCase().indexOf(String(f.code).toLowerCase()) === -1) return false;
      if (f.year && p.year !== +f.year) return false;
      if (f.examType && p.examType !== f.examType) return false;
      if (f.regulation && p.regulation !== f.regulation) return false;
      if (f.q) {
        var hay = (p.subjectName + ' ' + p.code + ' ' + p.year + ' ' + p.examType + ' ' + p.regulation + ' ' + p.branchCode).toLowerCase();
        if (hay.indexOf(String(f.q).toLowerCase()) === -1) return false;
      }
      return true;
    }).sort(function (a, b) { return b.year - a.year || a.subjectName.localeCompare(b.subjectName); });
  }

  /* ------------------------- user actions ------------------------- */
  var listeners = [];
  function onChange(fn) { listeners.push(fn); }
  function emit() { listeners.forEach(function (fn) { try { fn(); } catch (e) { } }); }

  var API = {
    TAG_META: TAG_META,
    SUPABASE: SUPABASE,
    db: db,
    idx: idx,
    user: user,
    supabase: supabaseState,
    meta: function () { return db.meta; },
    disclaimer: function () { return db.meta.disclaimer || ''; },

    /* lifecycle */
    init: function () {
      decode(window.BB_DATA || {});
      loadOverlay();
      applyOverlay();
      loadUser();
      buildIndexes();
      buildSearchIndex();
      recomputeAllRepeated();
    },

    /* queries */
    branches: function () { return db.branches; },
    branch: function (id) { return idx.branch[id]; },
    semesters: function () { return db.semesters; },
    subjects: function (filter) {
      return db.subjects.filter(function (s) {
        if (filter && filter.branch && s.branch !== filter.branch) return false;
        if (filter && filter.sem && s.sem !== +filter.sem) return false;
        return true;
      }).sort(function (a, b) { return a.code.localeCompare(b.code); });
    },
    subject: function (id) { return idx.subject[id]; },
    subjectsOf: subjectsOf,
    papersOf: papersOf,
    questionsOf: questionsOf,
    materialsOf: materialsOf,
    paper: function (id) { return idx.paper[id] ? decoratePaper(idx.paper[id]) : null; },
    paperQuestions: paperQuestions,
    repeatedOf: repeatedOf,
    filterPapers: filterPapers,
    search: search,
    stats: function () {
      return {
        branches: db.branches.length,
        subjects: db.subjects.length,
        papers: db.papers.length,
        questions: db.questions.length,
        materials: db.materials.length,
        years: [2026, 2025, 2024, 2023]
      };
    },

    /* user state */
    isFavorite: function (id) { return has(user.favorites, id); },
    toggleFavorite: function (id) { var on = toggleIn(user.favorites, id); saveUser(); emit(); return on; },
    isBookmark: function (id) { return has(user.bookmarks, id); },
    toggleBookmark: function (id) { var on = toggleIn(user.bookmarks, id); saveUser(); emit(); return on; },
    isSavedPaper: function (id) { return has(user.savedPapers, id); },
    toggleSavedPaper: function (id) { var on = toggleIn(user.savedPapers, id); saveUser(); emit(); return on; },
    isCompleted: function (id) { return has(user.completed, id); },
    toggleCompleted: function (id) { var on = toggleIn(user.completed, id); saveUser(); emit(); return on; },
    markViewed: function (paperId) {
      toggleIn(user.recent, paperId);
      user.recent.unshift(paperId);
      user.recent = user.recent.slice(0, 12);
      saveUser(); emit();
    },
    recentPapers: function () {
      return user.recent.map(function (id) { return idx.paper[id] ? decoratePaper(idx.paper[id]) : null; }).filter(Boolean);
    },
    checklist: function () {
      return user.checklist.slice().sort(function (a, b) {
        if (a.done === b.done) return b.createdAt - a.createdAt;
        return a.done ? 1 : -1;
      });
    },
    addChecklist: function (text, subjectId) {
      user.checklist.push({ id: 'c' + Date.now(), text: text, subject: subjectId || null, done: false, createdAt: Date.now() });
      saveUser(); emit();
    },
    toggleChecklist: function (id) {
      user.checklist.forEach(function (c) { if (c.id === id) c.done = !c.done; });
      saveUser(); emit();
    },
    removeChecklist: function (id) {
      user.checklist = user.checklist.filter(function (c) { return c.id !== id; });
      saveUser(); emit();
    },
    resetUser: function () {
      user = { favorites: [], bookmarks: [], savedPapers: [], completed: [], recent: [], checklist: [] };
      saveUser(); emit();
    },
    onChange: onChange,

    /* ---------------------- admin CRUD ---------------------- */
    admin: {
      isLoggedIn: function () {
        try { return sessionStorage.getItem(LS_ADMIN) === '1'; } catch (e) { return false; }
      },
      login: function (u, p) {
        var ok = (u === 'admin' && p === 'backlogbuddy') || (u === 'admin' && p === 'admin123');
        if (ok) { try { sessionStorage.setItem(LS_ADMIN, '1'); } catch (e) { } }
        return ok;
      },
      logout: function () { try { sessionStorage.removeItem(LS_ADMIN); } catch (e) { } },

      _upsert: function (kind, rec) {
        overlay.upsert[kind][rec.id] = rec;
        saveOverlay();
        var existing = db[kind].find(function (x) { return x.id === rec.id; });
        if (existing) Object.keys(rec).forEach(function (k) { existing[k] = rec[k]; });
        else db[kind].push(rec);
        buildIndexes(); buildSearchIndex();
        API.pushToSupabase(kind, rec);
        emit();
      },
      _delete: function (kind, id) {
        overlay.deleted[kind] = overlay.deleted[kind] || [];
        if (overlay.deleted[kind].indexOf(id) === -1) overlay.deleted[kind].push(id);
        saveOverlay();
        db[kind] = db[kind].filter(function (x) { return x.id !== id; });
        buildIndexes(); buildSearchIndex();
        emit();
      },

      saveBranch: function (rec) { API.admin._upsert('branches', rec); },
      deleteBranch: function (id) { API.admin._delete('branches', id); },
      saveSubject: function (rec) { API.admin._upsert('subjects', rec); recomputeAllRepeated(); },
      deleteSubject: function (id) { API.admin._delete('subjects', id); },
      savePaper: function (rec) { API.admin._upsert('papers', rec); },
      deletePaper: function (id) { API.admin._delete('papers', id); },
      saveQuestion: function (rec) { API.admin._upsert('questions', rec); recomputeAllRepeated(); },
      deleteQuestion: function (id) { API.admin._delete('questions', id); recomputeAllRepeated(); },
      saveMaterial: function (rec) { API.admin._upsert('materials', rec); },
      deleteMaterial: function (id) { API.admin._delete('materials', id); },
      resetDemo: function () {
        overlay = { upsert: { subjects: {}, papers: {}, questions: {}, materials: {}, branches: {} }, deleted: { subjects: [], papers: [], questions: [], materials: [], branches: [] } };
        saveOverlay();
        API.init();
        emit();
      },
      exportJSON: function () {
        return JSON.stringify({ branches: db.branches, subjects: db.subjects, papers: db.papers, questions: db.questions, materials: db.materials }, null, 2);
      },
      nextId: function (prefix) { return prefix + Date.now().toString(36) + Math.floor(Math.random() * 999); }
    },

    /* ---------------------- supabase ---------------------- */
    pushToSupabase: function (kind, rec) {
      if (!supabaseState.enabled) return;
      var table = { branches: 'branches', subjects: 'subjects', papers: 'question_papers', questions: 'questions', materials: 'study_materials' }[kind];
      if (!table) return;
      fetch(SUPABASE.url + '/rest/v1/' + table, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE.anonKey,
          Authorization: 'Bearer ' + SUPABASE.anonKey,
          Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify(rec)
      }).catch(function () { /* offline / not provisioned: local overlay remains the source of truth */ });
    },

    checkSupabase: function () {
      if (supabaseState.checked) return Promise.resolve(supabaseState);
      var request;
      try {
        request = fetch(SUPABASE.url + '/rest/v1/subjects?select=id&limit=1', {
          headers: { apikey: SUPABASE.anonKey, Authorization: 'Bearer ' + SUPABASE.anonKey }
        });
      } catch (e) {
        supabaseState.checked = true;
        supabaseState.enabled = false;
        supabaseState.message = 'Supabase unreachable from this browser - running on bundled demo data.';
        return Promise.resolve(supabaseState);
      }
      if (!request || typeof request.then !== 'function') {
        supabaseState.checked = true;
        supabaseState.enabled = false;
        supabaseState.message = 'Supabase unreachable from this browser - running on bundled demo data.';
        return Promise.resolve(supabaseState);
      }
      return request.then(function (res) {
        supabaseState.checked = true;
        if (res.ok) {
          supabaseState.enabled = true;
          supabaseState.message = 'Supabase connected - reading from the live database.';
        } else {
          supabaseState.enabled = false;
          supabaseState.message = 'Supabase tables not provisioned yet - running on bundled demo data.';
        }
        return supabaseState;
      }).catch(function () {
        supabaseState.checked = true;
        supabaseState.enabled = false;
        supabaseState.message = 'Supabase unreachable from this browser - running on bundled demo data.';
        return supabaseState;
      });
    }
  };

  window.BB = API;
  var initialized = false;
  var readyQueue = [];
  function runInit() {
    if (initialized) return;
    initialized = true;
    API.init();
    readyQueue.forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } });
    readyQueue = [];
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', runInit);
  else runInit();
  API.ready = function (fn) { if (initialized) { try { fn(); } catch (e) { console.error(e); } } else readyQueue.push(fn); };
})();
