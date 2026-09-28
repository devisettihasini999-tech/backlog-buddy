/* ==========================================================================
   Backlog Buddy — runtime configuration
   Reads /api/config from the backend (same origin). When the site is served
   as plain static files (GitHub Pages, file://) the API features stay off and
   everything keeps working from the bundled data.
   ========================================================================== */
(function () {
  'use strict';

  window.BB_API_BASE = '';          // empty = same origin
  window.BB_API = {
    ready: false,
    authEnabled: false,
    aiEnabled: false,
    storage: null
  };

  function finish(cfg) {
    window.BB_API_BASE = (cfg && cfg.apiBase) || '';
    window.BB_API = {
      ready: true,
      authEnabled: !!(cfg && cfg.authEnabled),
      aiEnabled: !!(cfg && cfg.aiEnabled),
      storage: (cfg && cfg.storage) || null
    };
    document.dispatchEvent(new CustomEvent('bb:api-ready', { detail: window.BB_API }));
  }

  // Never block the page: if the API is missing we simply stay in offline mode.
  var timeout = setTimeout(function () {
    if (!window.BB_API.ready) finish({ authEnabled: false, aiEnabled: false });
  }, 2500);

  fetch('api/config', { headers: { Accept: 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (cfg) { clearTimeout(timeout); finish(cfg || { authEnabled: false, aiEnabled: false }); })
    .catch(function () { clearTimeout(timeout); finish({ authEnabled: false, aiEnabled: false }); });
})();
