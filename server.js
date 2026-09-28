#!/usr/bin/env node
/* ==========================================================================
   Backlog Buddy — zero dependency static server (local dev / preview)
   Usage: node server.js [port]     (default 3000)
   ========================================================================== */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || process.argv[2] || 3000);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.map': 'application/json'
};

function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({ 'Cache-Control': 'no-cache' }, headers || {}));
  res.end(body);
}

const server = http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch (e) {
    return send(res, 400, 'Bad request', { 'Content-Type': 'text/plain' });
  }
  if (urlPath.endsWith('/')) urlPath += 'index.html';

  // health check used by the deployment smoke test
  if (urlPath === '/healthz') return send(res, 200, 'ok', { 'Content-Type': 'text/plain' });

  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) return send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain' });

  fs.stat(filePath, (err, stat) => {
    let target = filePath;
    if (err || !stat.isFile()) {
      // pretty urls: /subjects -> /subjects.html
      const alt = filePath + '.html';
      if (fs.existsSync(alt)) target = alt;
      else {
        const notFound = path.join(ROOT, '404.html');
        return send(res, 404, fs.readFileSync(notFound), { 'Content-Type': MIME['.html'] });
      }
    }
    const ext = path.extname(target).toLowerCase();
    fs.readFile(target, (err2, data) => {
      if (err2) return send(res, 500, 'Server error', { 'Content-Type': 'text/plain' });
      send(res, 200, data, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Backlog Buddy running at http://localhost:' + PORT);
  console.log('Serving ' + ROOT);
});
