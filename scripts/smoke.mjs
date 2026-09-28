import { JSDOM } from 'jsdom'
import fs from 'node:fs'
import path from 'node:path'

const routes = process.argv.slice(2)
const html = fs.readFileSync(path.resolve('dist/index.html'), 'utf8')

// Extract the entry script + css refs
const scriptSrc = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1])[0]
const scriptFile = 'dist' + scriptSrc

let failed = 0
for (const route of routes) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost:5173' + route,
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })
  const { window } = dom
  const errors = []
  window.addEventListener('error', (e) => errors.push('window: ' + e.message))
  // stubs
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }))
  window.scrollTo = () => {}
  window.HTMLElement.prototype.scrollIntoView = window.HTMLElement.prototype.scrollIntoView || (() => {})
  // localStorage shim
  const store = {}
  window.localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => (store[k] = String(v)),
    removeItem: (k) => delete store[k],
    clear: () => Object.keys(store).forEach((k) => delete store[k]),
  }

  try {
    // load the bundle in this window context
    window.eval(fs.readFileSync(scriptFile, 'utf8'))
    // let React render + async effects settle
    await new Promise((r) => setTimeout(r, 1600))
    const root = window.document.getElementById('root')
    const len = (root?.innerHTML || '').length
    const ok = len > 200 && errors.length === 0
    if (!ok) failed++
    console.log(`${ok ? 'PASS' : 'FAIL'} ${route}  (html=${len}b, errors=${errors.length})`)
    if (!ok) {
      console.log('  first error:', errors[0] || '(no window error but empty root?)')
      if (len <= 200) console.log('  root:', (root?.innerHTML || '').slice(0, 300))
    }
  } catch (e) {
    failed++
    console.log(`FAIL ${route}  threw: ${e.message}`)
  } finally {
    window.close()
  }
}
console.log(failed === 0 ? 'ALL ROUTES OK' : `${failed} route(s) FAILED`)
process.exit(failed === 0 ? 0 : 1)
