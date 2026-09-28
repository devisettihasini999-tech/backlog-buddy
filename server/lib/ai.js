/* ============================================================================
   Backlog Buddy — Gemini helper (backend only, key never reaches the client)
   ============================================================================ */
'use strict';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

const SYSTEM = `You are Backlog Buddy's study assistant for engineering students preparing for supplementary or backlog examinations.
You explain exam questions, summarise topics, suggest how to answer a question in an exam, and build short revision plans.
Rules:
- Never claim that a question will definitely appear in an examination.
- Keep answers concise, structured with short bullet points, and student friendly.
- If the student gives a subject code or unit, stay within that topic.`;

function isConfigured() {
  return !!GEMINI_API_KEY;
}

/* Deterministic fallback so the feature works before a key is added. */
function fallback(prompt, mode) {
  const text = String(prompt || '').trim();
  const bullets = [
    'Break the question into the keywords it is asking about.',
    'Write a one line definition, then a neat diagram or derivation if the unit needs one.',
    'Add two real world or numerical examples to support the answer.',
    'Finish with a short conclusion or comparison table - examiners reward structure.'
  ];
  return {
    source: 'fallback',
    mode: mode || 'explain',
    answer:
      'Gemini is not configured on this deployment yet, so here is a reliable way to answer this yourself:\n\n' +
      'Question / topic: ' + (text.slice(0, 220) || 'not provided') + '\n\n' +
      bullets.map((b) => '- ' + b).join('\n') +
      '\n\nAdd GEMINI_API_KEY to the server environment to get a full AI explanation.'
  };
}

async function generate(prompt, mode) {
  if (!isConfigured()) return fallback(prompt, mode);

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [{ role: 'user', parts: [{ text: String(prompt || '').slice(0, 4000) }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 700 }
  };

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
    encodeURIComponent(GEMINI_MODEL) + ':generateContent?key=' + encodeURIComponent(GEMINI_API_KEY);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const detail = await res.text();
    const err = new Error('Gemini request failed: ' + res.status);
    err.status = 502;
    err.detail = detail.slice(0, 300);
    throw err;
  }

  const json = await res.json();
  const parts = (((json.candidates || [])[0] || {}).content || {}).parts || [];
  const answer = parts.map((p) => p.text || '').join('\n').trim();
  if (!answer) {
    const err = new Error('Gemini returned an empty response');
    err.status = 502;
    throw err;
  }
  return { source: 'gemini', model: GEMINI_MODEL, mode: mode || 'explain', answer };
}

module.exports = { generate, isConfigured, model: GEMINI_MODEL };
