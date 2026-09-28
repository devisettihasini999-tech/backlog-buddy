/* ==========================================================================
   Backlog Buddy — shared UI kit (icons, header, footer, theme, toasts, search)
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------- icons (stroke, 24x24) ------------------------- */
  var P = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z"/><path d="M9 3v18"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
    download: '<path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M4 20h16"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z"/>',
    bookmark: '<path d="M6 3h12v18l-6-4.5L6 21z"/>',
    check: '<path d="M4 12.5l5 5L20 6.5"/>',
    circleCheck: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
    chevDown: '<path d="M6 9.5l6 6 6-6"/>',
    chevRight: '<path d="M9.5 6l6 6-6 6"/>',
    arrowRight: '<path d="M4 12h15"/><path d="M13 6l6 6-6 6"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M10 10h4v4h-4z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
    brain: '<path d="M12 5v14"/><path d="M9 5a3 3 0 0 0-3 3 3 3 0 0 0 0 6 3 3 0 0 0 3 3z"/><path d="M15 5a3 3 0 0 1 3 3 3 3 0 0 1 0 6 3 3 0 0 1-3 3z"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    wave: '<path d="M2 12c2.5 0 3-6 5.5-6S10 18 12.5 18 15 6 17.5 6 20 12 22 12"/>',
    bolt: '<path d="M13 2L4 14h6l-1 8 9-12h-6z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.6M12 18.9v2.6M4.6 7.2l2.2 1.3M17.2 15.5l2.2 1.3M4.6 16.8l2.2-1.3M17.2 8.5l2.2-1.3"/>',
    building: '<path d="M4 21V6l8-3 8 3v15"/><path d="M9 21v-6h6v6"/><path d="M8 9h2M14 9h2M8 12.5h2M14 12.5h2"/>',
    monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    external: '<path d="M14 4h6v6"/><path d="M20 4l-8 8"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
    upload: '<path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 20h16"/>',
    trash: '<path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
    edit: '<path d="M4 20h4l11-11-4-4L4 16z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    filter: '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2.5h6V4"/><path d="M9 10h6M9 14h6M9 18h3"/>',
    cap: '<path d="M3 9l9-4 9 4-9 4z"/><path d="M7 11v5c0 1.5 2.2 3 5 3s5-1.5 5-3v-5"/><path d="M21 9v5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
    bulb: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    repeat: '<path d="M17 2l3 3-3 3"/><path d="M4 12V9a3 3 0 0 1 3-3h13"/><path d="M7 22l-3-3 3-3"/><path d="M20 12v3a3 3 0 0 1-3 3H4"/>',
    flame: '<path d="M12 22c4 0 6-2.6 6-6 0-4-3-5-4-9-2 1.5-3 3-3 5-1-.5-2-2-2-4C7 9.5 6 12 6 16c0 3.4 2 6 6 6z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    github: '<path d="M9 19c-4 1.2-4-2.2-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.4-.3 4.5-1.2 4.5-5a4 4 0 0 0-1.1-2.8 3.7 3.7 0 0 0-.1-2.8s-1.2-.4-3.8 1.4a9.4 9.4 0 0 0-5 0C6.4 3.7 5.2 4.1 5.2 4.1a3.7 3.7 0 0 0-.1 2.8A4 4 0 0 0 4 9.7c0 3.8 2.1 4.7 4.5 5-.6.6-.6 1.2-.5 2V20"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4"/>',
    youtube: '<rect x="2.5" y="6" width="19" height="12" rx="3"/><path d="M11 9.5l4 2.5-4 2.5z"/>',
    twitter: '<path d="M22 6.5a8 8 0 0 1-2.3.6 4 4 0 0 0 1.7-2.2 8 8 0 0 1-2.5 1A4 4 0 0 0 12 8.3c0 .3 0 .6.1.9A11.4 11.4 0 0 1 3.5 5.5a4 4 0 0 0 1.2 5.3 4 4 0 0 1-1.8-.5 4 4 0 0 0 3.2 3.9 4 4 0 0 1-1.8.1 4 4 0 0 0 3.7 2.8A11.4 11.4 0 0 1 2 19.5a16 16 0 0 0 8.6 2.5c10.4 0 16-8.8 15.6-16.6A8 8 0 0 0 22 6.5z"/>',
    printer: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 17h10v4H7z"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    database: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    trending: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    award: '<circle cx="12" cy="9" r="5.5"/><path d="M9 13.5L7.5 21l4.5-2.5L16.5 21 15 13.5"/>',
    activity: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5"/><path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M17.5 14.8c2.4.7 4 2.4 4 5.2"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.4 5.7"/><path d="M20 5v6h-6"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    sparkles: '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>'
  };

  function icon(name, size, cls) {
    var d = P[name] || P.info;
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" width="' + (size || 18) + '" height="' + (size || 18) +
      '" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }

  /* ------------------------- helpers ------------------------- */
  function qs(s, r) { return (r || document).querySelector(s); }
  function qa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function fmtDate(iso) {
    if (!iso) return '-';
    var d = new Date(iso);
    if (isNaN(d)) return '-';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function fmtNum(n) { return (n || 0).toLocaleString('en-IN'); }
  function params() {
    var p = {};
    location.search.replace(/[?&]([^=]+)=([^&]*)/g, function (m, k, v) { p[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' ')); });
    return p;
  }
  function param(name, def) { var p = params(); return p[name] != null && p[name] !== '' ? p[name] : def; }
  function toast(title, msg, type) {
    var host = qs('#toasts') || (function () { var d = document.createElement('div'); d.id = 'toasts'; document.body.appendChild(d); return d; })();
    var t = document.createElement('div');
    t.className = 'toast ' + (type || 'info');
    t.innerHTML = '<span class="t-ico">' + icon(type === 'success' ? 'circleCheck' : type === 'error' ? 'alert' : 'info', 20) + '</span>' +
      '<div class="t-body"><b>' + esc(title) + '</b>' + (msg ? '<span>' + esc(msg) + '</span>' : '') + '</div>';
    host.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 220); }, 3600);
  }

  function modal(opts) {
    var back = document.createElement('div');
    back.className = 'modal-backdrop';
    back.innerHTML = '<div class="modal" role="dialog" aria-modal="true">' +
      '<div class="modal-head"><span style="color:var(--primary)">' + icon(opts.icon || 'info', 22) + '</span><h3>' + esc(opts.title || '') + '</h3>' +
      '<button class="icon-btn" data-close>' + icon('x', 18) + '</button></div>' +
      '<div class="modal-body">' + (opts.body || '') + '</div>' +
      (opts.foot !== false ? '<div class="modal-foot">' + (opts.actions || '<button class="btn btn-primary" data-close>Got it</button>') + '</div>' : '') +
      '</div>';
    document.body.appendChild(back);
    function close() { back.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    back.addEventListener('click', function (e) { if (e.target === back || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', onKey);
    if (opts.onMount) opts.onMount(back, close);
    return { el: back, close: close };
  }

  /* ------------------------- theme ------------------------- */
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem('bb_theme'); } catch (e) { }
    var theme = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }
  function toggleTheme() {
    var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', cur);
    try { localStorage.setItem('bb_theme', cur); } catch (e) { }
    qa('[data-theme-toggle]').forEach(function (b) { b.innerHTML = icon(cur === 'dark' ? 'sun' : 'moon', 18); b.setAttribute('aria-label', 'Switch to ' + (cur === 'dark' ? 'light' : 'dark') + ' mode'); });
    return cur;
  }

  /* ------------------------- header / footer ------------------------- */
  var NAV = [
    { href: 'index.html', label: 'Home', icon: 'sparkles' },
    { href: 'subjects.html', label: 'Subjects', icon: 'grid' },
    { href: 'papers.html', label: 'Question Papers', icon: 'file' },
    { href: 'important.html', label: 'Important Questions', icon: 'flame' },
    { href: 'resources.html', label: 'Study Resources', icon: 'folder' },
    { href: 'dashboard.html', label: 'Dashboard', icon: 'clipboard' },
    { href: 'admin.html', label: 'Admin', icon: 'lock' }
  ];

  function renderHeader(active) {
    var host = qs('#site-header');
    if (!host) return;
    var links = NAV.map(function (n) {
      return '<a href="' + n.href + '"' + (active === n.href ? ' class="active"' : '') + '>' + icon(n.icon, 16) + '<span>' + n.label + '</span></a>';
    }).join('');
    host.innerHTML = '<div class="container header-inner">' +
      '<a class="brand" href="index.html"><span class="brand-mark">' + icon('cap', 21) + '</span>' +
      '<span>Backlog Buddy<small>Prepare Smart. Clear Your Backlogs.</small></span></a>' +
      '<nav class="nav">' + links + '</nav>' +
      '<div class="header-actions">' +
      '<button class="icon-btn" data-search-open aria-label="Search">' + icon('search', 18) + '</button>' +
      '<button class="icon-btn" data-theme-toggle aria-label="Toggle theme"></button>' +
      '<span id="auth-area"></span>' +
      '<a class="btn btn-primary btn-sm" href="papers.html" style="margin-left:4px">' + icon('download', 15) + '<span>Get Papers</span></a>' +
      '<button class="icon-btn nav-toggle" data-nav-toggle aria-label="Menu">' + icon('menu', 18) + '</button>' +
      '</div></div>';

    var drawer = document.createElement('div');
    drawer.className = 'mobile-nav';
    drawer.id = 'mobile-nav';
    drawer.innerHTML = NAV.map(function (n) {
      return '<a href="' + n.href + '"' + (active === n.href ? ' class="active"' : '') + '>' + icon(n.icon, 18) + n.label + '</a>';
    }).join('') + '<div class="divider"></div>' +
      '<a href="about.html">' + icon('info', 18) + 'About</a>' +
      '<a href="contact.html">' + icon('mail', 18) + 'Contact & Feedback</a>';
    host.after(drawer);

    qa('[data-theme-toggle]').forEach(function (b) {
      b.innerHTML = icon(document.documentElement.getAttribute('data-theme') === 'dark' ? 'sun' : 'moon', 18);
      b.addEventListener('click', toggleTheme);
    });
    var navBtn = qs('[data-nav-toggle]');
    if (navBtn) navBtn.addEventListener('click', function () { drawer.classList.toggle('open'); });
    var sBtn = qs('[data-search-open]');
    if (sBtn) sBtn.addEventListener('click', openSearch);
    renderAuthArea();
    document.addEventListener('bb:api-ready', renderAuthArea);
    if (window.BBAPI) window.BBAPI.onChange(renderAuthArea);
  }

  /* ------------------------- auth area (header) ------------------------- */
  function renderAuthArea() {
    var host = qs('#auth-area');
    if (!host) return;
    var api = window.BBAPI;
    if (!api || !api.enabled()) { host.innerHTML = ''; return; }

    var u = api.user();
    if (u) {
      host.innerHTML = '<span class="badge badge-green" style="gap:7px;padding:7px 12px" title="' + esc(u.email) + '">' +
        icon('circleCheck', 14) + esc((u.full_name || u.email || '').split('@')[0]) + '</span>' +
        '<button class="btn btn-ghost btn-sm" id="signout-btn">Sign out</button>';
      var out = qs('#signout-btn');
      if (out) out.addEventListener('click', function () {
        api.logout();
        toast('Signed out', 'Your local data is untouched.', 'info');
      });
      return;
    }
    host.innerHTML = '<button class="btn btn-outline btn-sm" id="signin-btn">' + icon('lock', 15) + '<span>Sign in</span></button>';
    var btn = qs('#signin-btn');
    if (btn) btn.addEventListener('click', openAuthModal);
  }

  function openAuthModal() {
    modal({
      title: 'Backlog Buddy account', icon: 'lock',
      body: '<div class="tabs" style="margin-bottom:16px">' +
        '<button class="tab active" data-tab="login">Sign in</button>' +
        '<button class="tab" data-tab="signup">Create account</button>' +
        '</div>' +
        '<div class="stack">' +
        '<label class="field" id="f-name" style="display:none"><span>Full name</span><input type="text" id="a-name" placeholder="Your name" autocomplete="name"></label>' +
        '<label class="field"><span>Email</span><input type="email" id="a-email" placeholder="you@college.edu" autocomplete="email"></label>' +
        '<label class="field"><span>Password</span><input type="password" id="a-pass" placeholder="At least 8 characters" autocomplete="current-password"></label>' +
        '<div class="callout warn hidden" id="a-error"></div>' +
        '<button class="btn btn-primary btn-block" id="a-submit">Sign in</button>' +
        '<p class="tiny muted center">Your account, saved subjects and bookmarks then sync across devices through the Backlog Buddy API.</p>' +
        '</div>',
      actions: '<button class="btn btn-outline btn-sm" data-close>Close</button>',
      onMount: function (el, close) {
        var mode = 'login';
        function setMode(m) {
          mode = m;
          qa('[data-tab]', el).forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-tab') === m); });
          qs('#f-name', el).style.display = m === 'signup' ? 'block' : 'none';
          qs('#a-submit', el).textContent = m === 'signup' ? 'Create account' : 'Sign in';
          qs('#a-error', el).classList.add('hidden');
        }
        qa('[data-tab]', el).forEach(function (t) { t.addEventListener('click', function () { setMode(t.getAttribute('data-tab')); }); });

        function fail(msg) {
          var box = qs('#a-error', el);
          box.classList.remove('hidden');
          box.innerHTML = icon('alert', 20) + '<div><b>Could not continue</b><p>' + esc(msg) + '</p></div>';
        }
        qs('#a-submit', el).addEventListener('click', function () {
          var email = qs('#a-email', el).value.trim();
          var pass = qs('#a-pass', el).value;
          var name = qs('#a-name', el).value.trim();
          var btn = qs('#a-submit', el);
          if (!email || !pass) { fail('Enter your email and password.'); return; }
          btn.disabled = true;
          btn.innerHTML = '<span class="spinner"></span>';
          var p = mode === 'signup' ? window.BBAPI.signup(email, pass, name) : window.BBAPI.login(email, pass);
          p.then(function () {
            close();
            toast('Welcome' + (name ? ', ' + name.split(' ')[0] : '') + '!', 'You are signed in.', 'success');
          }).catch(function (e) {
            btn.disabled = false;
            btn.textContent = mode === 'signup' ? 'Create account' : 'Sign in';
            fail(e.message || 'Something went wrong.');
          });
        });
      }
    });
  }

  function renderFooter() {
    var host = qs('#site-footer');
    if (!host) return;
    var st = window.BB ? window.BB.stats() : {};
    host.innerHTML = '<div class="container"><div class="footer-grid">' +
      '<div><a class="brand" href="index.html"><span class="brand-mark">' + icon('cap', 21) + '</span><span>Backlog Buddy</span></a>' +
      '<p class="small mt-2" style="max-width:38ch">Your one-stop study platform for engineering backlog preparation. Find previous question papers, important questions, repeated topics, model papers and study resources - organised subject by subject.</p>' +
      '<div class="socials mt-3">' +
      '<a href="contact.html" aria-label="Contact">' + icon('mail', 17) + '</a>' +
      '<a href="https://github.com" target="_blank" rel="noopener" aria-label="GitHub">' + icon('github', 17) + '</a>' +
      '<a href="https://www.linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn">' + icon('linkedin', 17) + '</a>' +
      '<a href="https://www.youtube.com" target="_blank" rel="noopener" aria-label="YouTube">' + icon('youtube', 17) + '</a>' +
      '</div></div>' +
      '<div><h5>Explore</h5><ul>' +
      NAV.slice(0, 6).map(function (n) { return '<li><a href="' + n.href + '">' + n.label + '</a></li>'; }).join('') +
      '</ul></div>' +
      '<div><h5>Branches</h5><ul>' +
      (window.BB ? window.BB.branches().slice(0, 7) : []).map(function (b) {
        return '<li><a href="subjects.html?branch=' + b.id + '">' + esc(b.name) + '</a></li>';
      }).join('') + '</ul></div>' +
      '<div><h5>Platform</h5><ul>' +
      '<li><a href="about.html">About Backlog Buddy</a></li>' +
      '<li><a href="contact.html">Contact & Feedback</a></li>' +
      '<li><a href="admin.html">Admin Panel</a></li>' +
      '<li><a href="papers.html">Question Paper Library</a></li>' +
      '<li><a href="important.html">Important Questions</a></li>' +
      '</ul></div>' +
      '</div>' +
      '<div class="footer-bottom">' +
      '<span>(c) ' + new Date().getFullYear() + ' Backlog Buddy. Built for engineering students.</span>' +
      '<span class="spacer"></span>' +
      '<span class="tiny">' + fmtNum(st.subjects) + ' subjects | ' + fmtNum(st.papers) + ' papers | ' + fmtNum(st.questions) + ' questions indexed</span>' +
      '</div></div>';
  }

  /* ------------------------- search ------------------------- */
  function resultIcon(type) {
    return { subject: 'book', question: 'bulb', paper: 'file', material: 'folder' }[type] || 'search';
  }

  function openSearch() {
    var m = modal({
      title: 'Search Backlog Buddy',
      icon: 'search',
      body: '<div class="search-wrap"><div class="search-box">' + icon('search', 19, 'search-ico') +
        '<input type="search" id="gs-input" placeholder="Search subject, subject code, question or topic..." autocomplete="off">' +
        '<button class="btn btn-primary btn-sm" id="gs-go">Search</button></div>' +
        '<div class="search-suggest" id="gs-results"></div></div>' +
        '<p class="tiny muted mt-2">Tip: try "data structures", "21CS32", "quick sort", "2025 supplementary" or "R20".</p>',
      foot: false,
      onMount: function (el, close) {
        var input = qs('#gs-input', el), results = qs('#gs-results', el);
        input.focus();
        var render = function (list) {
          if (!list.length) {
            results.innerHTML = '<div class="suggest-empty">No matches. Try a different subject, code or topic.</div>';
            results.style.display = 'block';
            return;
          }
          var html = '';
          var lastType = '';
          list.slice(0, 25).forEach(function (r) {
            if (r.type !== lastType) {
              html += '<div class="suggest-group">' + esc(r.type === 'question' ? 'Questions & topics' : r.type === 'paper' ? 'Question papers' : r.type === 'material' ? 'Study materials' : 'Subjects') + '</div>';
              lastType = r.type;
            }
            html += '<a class="suggest-item" href="' + r.href + '"><span class="si-ico">' + icon(resultIcon(r.type), 16) + '</span>' +
              '<span class="si-body"><span class="si-title">' + esc(r.title) + '</span><span class="si-sub">' + esc(r.sub) + '</span></span></a>';
          });
          results.innerHTML = html;
          results.style.display = 'block';
        };
        var t;
        input.addEventListener('input', function () {
          clearTimeout(t);
          t = setTimeout(function () { render(window.BB.search(input.value, { limit: 25 })); }, 90);
        });
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { var first = qs('.suggest-item', results); if (first) location.href = first.getAttribute('href'); }
        });
        qs('#gs-go', el).addEventListener('click', function () {
          var first = qs('.suggest-item', results);
          if (first) location.href = first.getAttribute('href');
          else render(window.BB.search(input.value, { limit: 25 }));
        });
        document.addEventListener('click', function onDoc(e) {
          if (!el.contains(e.target)) { results.style.display = 'none'; document.removeEventListener('click', onDoc); }
        });
      }
    });
    return m;
  }

  /* inline search box (home page) */
  function attachSearch(input, dropdown, onSubmit) {
    var t;
    function render(list) {
      if (!list.length) {
        dropdown.innerHTML = '<div class="suggest-empty">No matches. Try "DBMS", "21CS32", "quick sort" or "2025".</div>';
        dropdown.style.display = 'block';
        return;
      }
      var html = '', lastType = '';
      list.slice(0, 12).forEach(function (r) {
        if (r.type !== lastType) {
          html += '<div class="suggest-group">' + esc(r.type === 'question' ? 'Questions & topics' : r.type === 'paper' ? 'Question papers' : r.type === 'material' ? 'Study materials' : 'Subjects') + '</div>';
          lastType = r.type;
        }
        html += '<a class="suggest-item" href="' + r.href + '"><span class="si-ico">' + icon(resultIcon(r.type), 16) + '</span>' +
          '<span class="si-body"><span class="si-title">' + esc(r.title) + '</span><span class="si-sub">' + esc(r.sub) + '</span></span></a>';
      });
      dropdown.innerHTML = html;
      dropdown.style.display = 'block';
    }
    input.addEventListener('input', function () {
      clearTimeout(t);
      var v = input.value;
      if (!v.trim()) { dropdown.style.display = 'none'; return; }
      t = setTimeout(function () { render(window.BB.search(v, { limit: 12 })); }, 100);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var first = qs('.suggest-item', dropdown);
        if (first) { e.preventDefault(); location.href = first.getAttribute('href'); }
        else if (onSubmit) { e.preventDefault(); onSubmit(input.value); }
      }
      if (e.key === 'Escape') dropdown.style.display = 'none';
    });
    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target) && e.target !== input) dropdown.style.display = 'none';
    });
  }

  /* ------------------------- misc components ------------------------- */
  function emptyState(opts) {
    return '<div class="empty">' + icon(opts.icon || 'folder', 78) +
      '<h3>' + esc(opts.title || 'Nothing here yet') + '</h3>' +
      '<p>' + esc(opts.text || '') + '</p>' +
      (opts.action || '') + '</div>';
  }
  function skeletons(n, cls) {
    var out = '';
    for (var i = 0; i < n; i++) out += '<div class="skeleton ' + (cls || 'sk-card') + '"></div>';
    return out;
  }
  function tagBadges(tags, extraYears) {
    var html = '';
    (tags || []).forEach(function (t) {
      var m = (window.BB && BB.TAG_META[t]) || { label: t, cls: 'badge-gray' };
      html += '<span class="badge ' + m.cls + '">' + icon(t === 'vi' ? 'flame' : t === 'fa' ? 'activity' : t === 'rq' ? 'repeat' : t === 'it' ? 'target' : 'bulb', 12) + m.label + '</span>';
    });
    if (extraYears && extraYears.length) {
      html += '<span class="badge badge-gray">' + icon('calendar', 12) + 'Seen in ' + extraYears.length + ' paper' + (extraYears.length > 1 ? 's' : '') + '</span>';
    }
    return html;
  }
  function reveal() {
    var els = qa('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    els.forEach(function (e) { io.observe(e); });
  }
  function countUp(el, target) {
    var start = 0, dur = 900, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      el.textContent = Math.floor(start + (target - start) * (1 - Math.pow(1 - p, 3))).toLocaleString('en-IN');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function download(filename, content, mime) {
    var blob = content instanceof Blob ? content : new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 800);
  }

  window.BBUI = {
    icon: icon, qs: qs, qa: qa, esc: esc, fmtDate: fmtDate, fmtNum: fmtNum, params: params, param: param,
    toast: toast, modal: modal, initTheme: initTheme, toggleTheme: toggleTheme,
    renderHeader: renderHeader, renderFooter: renderFooter, openSearch: openSearch, attachSearch: attachSearch,
    emptyState: emptyState, skeletons: skeletons, tagBadges: tagBadges, reveal: reveal, countUp: countUp, download: download,
    NAV: NAV
  };
})();
