export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || 'th')
}

export function semLabel(order) {
  return `${ordinal(order)} Semester`
}

export function downloadFile(url, fileName) {
  return fetch(url, { mode: 'cors' })
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.blob()
    })
    .then((blob) => {
      const a = document.createElement('a')
      const objectUrl = URL.createObjectURL(blob)
      a.href = objectUrl
      a.download = fileName || (url.split('/').pop() || 'download')
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(objectUrl), 4000)
    })
}

export function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

export const IMPORTANCE_META = {
  very_important: { label: 'Very Important', short: 'VI', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400' },
  frequently_asked: { label: 'Frequently Asked', short: 'FA', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
  repeated: { label: 'Repeated Question', short: 'REP', cls: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400' },
  important_topic: { label: 'Important Topic', short: 'IT', cls: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400' },
  practice: { label: 'Practice Question', short: 'PR', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300' },
}

export const EXAM_TYPES = ['End Semester', 'Mid Semester', 'Supplementary', 'Model']
export const REGULATIONS = ['R20', 'R19', 'R16', 'JNTUH R23', 'VTU 2019', 'Other']

export function yearOptions() {
  const y = new Date().getFullYear()
  return [y, y - 1, y - 2, y - 3, y - 4]
}
