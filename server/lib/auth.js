/* ============================================================================
   Backlog Buddy — auth helpers (bcrypt + JWT, sessions stored server side)
   ============================================================================ */
'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'backlog-buddy-dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch (e) { return null; }
}

function bearer(req) {
  const header = req.headers.authorization || '';
  if (header.toLowerCase().indexOf('bearer ') === 0) return header.slice(7).trim();
  return null;
}

/* Returns the signed in profile or null. */
async function currentUser(req) {
  const token = bearer(req);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || !payload.sub) return null;
  return db.findProfileById(payload.sub);
}

function requireUser(req, res, next) {
  currentUser(req).then((user) => {
    if (!user) { res.status(401).json({ error: 'Not signed in' }); return; }
    req.user = user;
    next();
  }).catch((e) => res.status(500).json({ error: 'Auth check failed', detail: String(e && e.message ? e.message : e) }));
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken, bearer, currentUser, requireUser };
