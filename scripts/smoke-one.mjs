// Smoke-test ONE route of the built app in a jsdom environment.
// Usage: node scripts/smoke-one.mjs /subjects
import { JSDOM } from 'jsdom'
import fs from 'node:fs'
import path from 'node:path'

const route = process.argv[2] || '/'
const html = fs.readFileSync(path.resolve('dist/index.html'), 'utf8')
const scriptSrc = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1])[0]
const scriptFile = path.resolve('dist' + scriptSrc)

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:5173' + route,
  pretendToBeVisual: true,
})
const w = dom.window
const errors = []
w.addEventListener('error', (e) => errors.push(e.message))

Object.defineProperty(globalThis, 'window', { value: w, configurable: true })
Object.defineProperty(globalThis, 'document', { value: w.document, configurable: true })
Object.defineProperty(globalThis, 'navigator', { value: w.navigator, configurable: true })
Object.defineProperty(globalThis, 'localStorage', { value: w.localStorage, configurable: true })
Object.defineProperty(globalThis, 'location', { value: w.location, configurable: true })
Object.defineProperty(globalThis, 'history', { value: w.history, configurable: true })
globalThis.matchMedia = globalThis.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }))
w.scrollTo = () => {}
// supabase realtime needs a WebSocket global (Node 20 here lacks the native one)
if (globalThis.WebSocket === undefined) {
  globalThis.WebSocket = class WebSocket {
    constructor() {
      throw new Error('WebSocket not available in smoke test')
    }
    static get CONNECTING() { return 0 }
    static get OPEN() { return 1 }
    static get CLOSING() { return 2 }
    static get CLOSED() { return 3 }
  }
}
// expose jsdom DOM globals the bundle may reference as free variables
for (const k of ['MutationObserver', 'Element', 'HTMLElement', 'SVGElement', 'Node', 'CustomEvent', 'Event', 'EventTarget', 'DocumentFragment', 'KeyboardEvent', 'MouseEvent', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', 'DOMParser', 'CSS', 'Image', 'Blob', 'FileReader', 'URL', 'URLSearchParams']) {
  if (w[k] !== undefined && globalThis[k] === undefined) globalThis[k] = w[k]
}

process.on('unhandledRejection', (e) => errors.push('unhandled: ' + (e?.message || String(e))))

try {
  await import(scriptFile)
  await new Promise((r) => setTimeout(r, 2200))
  const root = w.document.getElementById('root')
  const len = (root?.innerHTML || '').length
  const bodyText = (w.document.body.textContent || '').replace(/\s+/g, ' ').slice(0, 120)
  const ok = len > 200 && errors.length === 0
  console.log(`${ok ? 'PASS' : 'FAIL'} ${route} (html=${len}b errors=${errors.length}) :: ${bodyText}`)
  if (!ok) {
    if (errors.length) console.log('  error:', errors[0])
    else console.log('  root:', (root?.innerHTML || '').slice(0, 300))
  }
  process.exit(ok ? 0 : 1)
} catch (e) {
  console.log(`FAIL ${route} threw: ${e.message}`)
  console.log(e.stack)
  process.exit(1)
}
