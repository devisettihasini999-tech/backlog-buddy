#!/usr/bin/env bash
# ============================================================================
# Backlog Buddy — one-command Render deploy (API + static site)
# ----------------------------------------------------------------------------
# Usage:
#   RENDER_TOKEN=rnd_xxx ./scripts/deploy-render.sh
#     or put RENDER_TOKEN=rnd_xxx in server/.env first.
#
# Requires a payment method on the Render account (Render asks for one even on
# the free plan): https://dashboard.render.com/billing
# ============================================================================
set -euo pipefail

cd "$(dirname "$0")/.."

RENDER_TOKEN="${RENDER_TOKEN:-}"
if [ -z "$RENDER_TOKEN" ] && [ -f server/.env ]; then
  RENDER_TOKEN="$(grep -E '^RENDER_TOKEN=' server/.env | head -1 | cut -d= -f2- | tr -d '"'"'"' ')"
fi
if [ -z "$RENDER_TOKEN" ]; then
  echo "Set RENDER_TOKEN=rnd_xxx before running this script." >&2
  exit 1
fi

OWNER_ID="${RENDER_OWNER_ID:-tea-dasv3bo473hc73e22aog}"
REPO="${REPO_URL:-https://github.com/devisettihasini999-tech/backlog-buddy}"
BRANCH="${DEPLOY_BRANCH:-static-app}"

echo "==> Creating/verifying Render services (owner $OWNER_ID, branch $BRANCH)"

node - "$RENDER_TOKEN" "$OWNER_ID" "$REPO" "$BRANCH" <<'JS'
const [token, ownerId, repo, branch] = process.argv.slice(2);
const API = 'https://api.render.com/v1';
const H = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
const crypto = require('crypto');

const api = {
  name: 'backlog-buddy-api', type: 'web_service', rootDir: 'server', plan: 'free',
  runtime: 'node', buildCommand: 'npm install', startCommand: 'npm start',
  healthCheckPath: '/api/health',
  envVars: [
    ['SUPABASE_URL', 'https://jcltcmildaclwjkxgrgu.supabase.co'],
    ['SUPABASE_ANON_KEY', process.env.SUPABASE_ANON_KEY || ''],
    ['SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY || ''],
    ['SUPABASE_DB_URL', process.env.SUPABASE_DB_URL || ''],
    ['GEMINI_API_KEY', process.env.GEMINI_API_KEY || ''],
    ['JWT_SECRET', crypto.randomBytes(40).toString('hex')],
    ['JWT_EXPIRES_IN', '7d'],
    ['STATIC_DIR', ''],
    ['NODE_VERSION', '20']
  ].map(([key, value]) => ({ key, value }))
};

const web = {
  name: 'backlog-buddy-web', type: 'static_site', rootDir: '', publishPath: '.',
  buildCommand: 'echo "Backlog Buddy - static site, no build step"',
  headers: [
    { path: '/assets/js/*', name: 'Cache-Control', value: 'public, max-age=3600' },
    { path: '/*', name: 'X-Content-Type-Options', value: 'nosniff' }
  ],
  routes: [{ type: 'rewrite', source: '/*', destination: '/404.html' }]
};

(async () => {
  const res = await fetch(API + '/services', { headers: H }).then(r => r.json());
  const existing = new Set((res || []).map(s => s.service && s.service.name).filter(Boolean));

  for (const cfg of [api, web]) {
    if (existing.has(cfg.name)) {
      console.log('  = ' + cfg.name + ' already exists - skipping (delete it first to recreate)');
      continue;
    }
    const body = {
      type: cfg.type,
      name: cfg.name,
      ownerId,
      repo,
      branch,
      rootDir: cfg.rootDir || '',
      autoDeploy: 'yes',
      serviceDetails: cfg.type === 'web_service'
        ? { runtime: 'node', envSpecificDetails: { buildCommand: cfg.buildCommand, startCommand: cfg.startCommand, envVars: cfg.envVars }, healthCheckPath: cfg.healthCheckPath }
        : { publishPath: cfg.publishPath, buildCommand: cfg.buildCommand, headers: cfg.headers, routes: cfg.routes }
    };
    const r = await fetch(API + '/services', { method: 'POST', headers: H, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error('  x ' + cfg.name + ' failed: ' + (j.message || r.status));
      if (r.status === 402) console.error('    Add a payment method: https://dashboard.render.com/billing');
      continue;
    }
    console.log('  + ' + cfg.name + ' -> ' + (j.service && j.service.serviceDetails.url));
    if (cfg.type === 'web_service') {
      // Kick off the first deploy immediately.
      const d = await fetch(API + '/services/' + j.service.id + '/deploys', {
        method: 'POST', headers: H, body: JSON.stringify({ clearCache: 'do_not_clear' })
      }).then(r => r.json());
      console.log('    deploy ' + d.id + ' (' + d.status + ')');
    }
  }
})();
JS

echo "==> Done. Render dashboard: https://dashboard.render.com"
