/* Tiny localStorage cache with TTL + version stamping.
   Used to drastically cut Supabase egress on repeat visits.

   How it pairs with Realtime:
     1. First visit ever:   network fetch → store in cache → render
     2. Repeat visits:      load cache instantly → render (zero egress)
     3. Realtime change:    clearCache(key) → refetch → re-cache → render

   So an admin write is the ONLY thing that costs egress for repeat visitors.
*/

const VERSION = 'v1'
const PREFIX  = 'cg_cache_'

// Default TTLs (ms). Realtime invalidates immediately on writes, so we can
// be aggressive — a 24-hour TTL is mostly belt-and-braces.
const TTL = {
  products: 24 * 60 * 60 * 1000,
  posts:    24 * 60 * 60 * 1000,
  settings:  6 * 60 * 60 * 1000,
}

function safeParse(raw) {
  try { return JSON.parse(raw) } catch { return null }
}

export function cacheGet(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const parsed = safeParse(raw)
    if (!parsed || parsed.v !== VERSION) return null
    const age = Date.now() - (parsed.ts || 0)
    const ttl = TTL[key] ?? 60 * 60 * 1000
    return { data: parsed.data, stale: age > ttl, age }
  } catch { return null }
}

export function cacheSet(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({
      v: VERSION, ts: Date.now(), data,
    }))
  } catch (e) {
    // Quota exceeded or disabled — silently skip. Network fetches will still work.
  }
}

export function cacheClear(key) {
  try { localStorage.removeItem(PREFIX + key) } catch {}
}

export function cacheClearAll() {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX))
    keys.forEach(k => localStorage.removeItem(k))
  } catch {}
}
