/**
 * Headless smoke test: boots the production bundle (dist/) inside JSDOM and
 * verifies each route actually renders without runtime crashes.
 *
 * JSDOM cannot execute <script type="module">, so the bundle is evaluated as a
 * classic script (it contains no top-level import/export statements).
 *
 * Usage: npm run build && npm run smoke
 */
import { readFileSync, readdirSync, mkdirSync, rmSync, cpSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

const DIST = join(process.cwd(), 'dist');
const OUT = join(process.cwd(), 'dist-smoke');

const ROUTES = [
  { path: '/', expect: 'Prepare Smart' },
  { path: '/subjects', expect: 'Browse subjects' },
  { path: '/subjects/cs301', expect: 'Data Structures' },
  { path: '/papers', expect: 'Previous question papers' },
  { path: '/papers/cs301-2023-regular', expect: 'Download PDF' },
  { path: '/important', expect: 'Prepare with a clear priority list' },
  { path: '/search?q=stack', expect: 'results' },
  { path: '/dashboard', expect: 'Your backlog preparation hub' },
  { path: '/admin', expect: 'Admin sign in' },
  { path: '/resources', expect: 'Notes, guides and preparation material' },
  { path: '/about', expect: 'Built to help every student' },
  { path: '/contact', expect: 'We would love to hear from you' },
  { path: '/no-such-page', expect: '404' },
];

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

const assets = readdirSync(join(DIST, 'assets'));
const bundleName = assets.find((f) => f.endsWith('.js'));
const cssName = assets.find((f) => f.endsWith('.css'));
const bundle = readFileSync(join(DIST, 'assets', bundleName), 'utf8');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function testRoute(route) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (e) => {
    const msg = String(e?.message ?? e);
    if (/Not implemented/i.test(msg)) return; // window.scrollTo etc.
    errors.push(msg);
  });
  virtualConsole.on('error', (...args) => errors.push(args.filter(Boolean).join(' ')));

  const dom = new JSDOM(`<!doctype html><html><head><title>Backlog Buddy</title></head><body><div id="root"></div></body></html>`, {
    url: 'http://localhost' + route.path,
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    virtualConsole,
  });

  // browser APIs JSDOM lacks but the app/SDK may touch
  const w = dom.window;
  w.fetch = globalThis.fetch;
  w.TextEncoder = globalThis.TextEncoder;
  w.TextDecoder = globalThis.TextDecoder;
  w.scrollTo = () => {};
  w.requestAnimationFrame = (cb) => setTimeout(cb, 16);
  w.cancelAnimationFrame = (id) => clearTimeout(id);

  try {
    w.eval(bundle);
  } catch (e) {
    errors.push('eval: ' + (e?.message ?? e));
  }

  let html = '';
  for (let i = 0; i < 40; i++) {
    await sleep(150);
    html = w.document.getElementById('root')?.innerHTML ?? '';
    if (html.includes(route.expect)) break;
  }
  const ok = html.includes(route.expect) && !html.includes('Something went wrong');
  w.close();
  return { route: route.path, ok, errors, size: html.length };
}

console.log(`Testing ${ROUTES.length} routes against dist/ bundle (${bundleName}, ${Math.round(bundle.length / 1024)} KB)...\n`);
let failed = 0;
for (const route of ROUTES) {
  const r = await testRoute(route);
  const status = r.ok ? 'PASS' : 'FAIL';
  if (!r.ok) failed++;
  console.log(
    `${status}  ${r.route.padEnd(32)} rendered ${String(r.size).padStart(6)} chars` +
      (r.errors.length ? `\n      js errors: ${r.errors.slice(0, 2).join(' | ')}` : ''),
  );
}
console.log(failed === 0 ? '\nAll routes rendered successfully ✅' : `\n${failed} route(s) failed ❌`);
process.exitCode = failed === 0 ? 0 : 1;
