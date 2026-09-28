/* ==========================================================================
   Backlog Buddy — backend client (auth, personal items, AI, cloud sync)
   Every request goes to our own Express API, so no secret key is ever exposed
   to the browser. Falls back silently when the API is unavailable.
   ============================================================================ */
(function () {
  'use strict';

  var TOKEN_KEY = 'bb_token_v1';
  var USER_KEY = 'bb_user_v1';
  var base = function () { return (window.BB_API_BASE || '').replace(/\/$/, ''); };
  var listeners = [];

  function token() { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } }
  function user() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch (e) { return null; }
  }

  function setSession(t, u) {
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY);
      if (u) localStorage.setItem(USER_KEY, JSON.stringify(u)); else localStorage.removeItem(USER_KEY);
    } catch (e) { /* private mode */ }
    emit();
  }

  function emit() { listeners.forEach(function (fn) { try { fn(user()); } catch (e) { } }); }

  function request(path, options) {
    options = options || {};
    var headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
    var t = token();
    if (t) headers.Authorization = 'Bearer ' + t;
    return fetch(base() + path, {
      method: options.method || 'GET',
      headers: headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (json) {
        if (!res.ok) {
          var err = new Error(json.error || ('Request failed (' + res.status + ')'));
          err.status = res.status;
          throw err;
        }
        return json;
      });
    });
  }

  var API = {
    enabled: function () { return !!window.BB_API && window.BB_API.ready && !!window.BB_API.authEnabled; },
    aiEnabled: function () { return !!window.BB_API && window.BB_API.aiEnabled; },
    isSignedIn: function () { return !!token(); },
    user: user,
    onChange: function (fn) { listeners.push(fn); },

    signup: function (email, password, fullName) {
      return request('/api/auth/signup', { method: 'POST', body: { email: email, password: password, fullName: fullName } })
        .then(function (json) { setSession(json.token, json.user); return json.user; });
    },
    login: function (email, password) {
      return request('/api/auth/login', { method: 'POST', body: { email: email, password: password } })
        .then(function (json) { setSession(json.token, json.user); return json.user; });
    },
    logout: function () { setSession(null, null); },
    me: function () {
      return request('/api/auth/me').then(function (json) { setSession(token(), json.user); return json.user; });
    },

    /* personal backlog items */
    items: function () { return request('/api/auth/items').then(function (j) { return j.items || []; }); },
    addItem: function (title, description) {
      return request('/api/auth/items', { method: 'POST', body: { title: title, description: description } })
        .then(function (j) { return j.item; });
    },
    updateItem: function (id, patch) {
      return request('/api/auth/items/' + encodeURIComponent(id), { method: 'PUT', body: patch }).then(function (j) { return j.item; });
    },
    deleteItem: function (id) {
      return request('/api/auth/items/' + encodeURIComponent(id), { method: 'DELETE' });
    },
    summariseItem: function (id) {
      return request('/api/ai/items/' + encodeURIComponent(id) + '/summarise', { method: 'POST', body: {} });
    },

    /* AI */
    ai: function (prompt, mode) {
      return request('/api/ai/generate', { method: 'POST', body: { prompt: prompt, mode: mode || 'explain' } });
    },

    /* cross device progress sync */
    progress: function () { return request('/api/auth/progress'); },
    saveProgress: function (kind, refId, payload) {
      return request('/api/auth/progress/' + encodeURIComponent(kind) + '/' + encodeURIComponent(refId), { method: 'PUT', body: { payload: payload || null } });
    },
    clearProgress: function (kind, refId) {
      return request('/api/auth/progress/' + encodeURIComponent(kind) + '/' + encodeURIComponent(refId), { method: 'DELETE' });
    },

    /* catalog reads through the API (used by the search page and admin tools) */
    search: function (q) { return request('/api/catalog/search?q=' + encodeURIComponent(q)).then(function (j) { return j.results || []; }); },
    subjects: function (branch, sem) {
      var q = [];
      if (branch) q.push('branch=' + encodeURIComponent(branch));
      if (sem) q.push('sem=' + encodeURIComponent(sem));
      return request('/api/catalog/subjects' + (q.length ? '?' + q.join('&') : '')).then(function (j) { return j.subjects || []; });
    },
    papers: function (filter) {
      var q = [];
      Object.keys(filter || {}).forEach(function (k) { if (filter[k]) q.push(k + '=' + encodeURIComponent(filter[k])); });
      return request('/api/catalog/papers' + (q.length ? '?' + q.join('&') : '')).then(function (j) { return j.papers || []; });
    },
    feedback: function (row) { return request('/api/feedback', { method: 'POST', body: row }); }
  };

  window.BBAPI = API;
  if (window.BB_API && window.BB_API.ready) API.enabled = function () { return !!window.BB_API.authEnabled; };
  document.addEventListener('bb:api-ready', function () { emit(); });
})();
