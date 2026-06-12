/**
 * Pre-render every public route to static HTML.
 *
 * Serves the built dist/ (SPA shell for every path), drives a headless browser
 * to each route, waits for the SPA to fetch from Supabase and apply its SEO
 * head tags, then snapshots the fully-rendered DOM into dist/<route>/index.html.
 * Crawlers and social link previews get real content; real users still boot the
 * SPA (React replaces #root on mount — no hydration mismatch).
 *
 * Run after `vite build`.  Usage: node scripts/prerender.mjs
 */
import fs from 'fs'
import path from 'path'
import http from 'http'
import { getAllRoutes, ROOT } from './seo-routes.mjs'

const DIST = path.join(ROOT, 'dist')
const PORT = 5055

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
}

// Static file server with SPA fallback to index.html.
function startServer() {
  const indexHtml = fs.readFileSync(path.join(DIST, 'index.html'))
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    const filePath = path.join(DIST, urlPath)
    if (
      filePath.startsWith(DIST) &&
      fs.existsSync(filePath) &&
      fs.statSync(filePath).isFile()
    ) {
      const ext = path.extname(filePath).toLowerCase()
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
      fs.createReadStream(filePath).pipe(res)
    } else {
      // SPA fallback — every route gets the shell so the client renders it.
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(indexHtml)
    }
  })
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)))
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error('[prerender] dist/index.html not found — run `vite build` first.')
    process.exit(1)
  }

  let puppeteer
  try {
    puppeteer = (await import('puppeteer')).default
  } catch {
    console.error('[prerender] puppeteer is not installed. Run: npm install')
    process.exit(1)
  }

  const routes = await getAllRoutes()
  const server = await startServer()
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  let ok = 0
  let failed = 0
  try {
    for (const route of routes) {
      const page = await browser.newPage()
      await page.setViewport({ width: 1280, height: 900 })
      const url = `http://localhost:${PORT}${route.path}`
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
        // Wait until the SPA has rendered content and the loading overlay is gone.
        await page.waitForFunction(
          () => {
            const root = document.querySelector('#root')
            if (!root || root.children.length === 0) return false
            const txt = document.body.innerText || ''
            if (txt.includes('Loading games') || txt.includes('Loading product')) return false
            return true
          },
          { timeout: 30000 },
        )
        // Settle: let images/JSON-LD/late renders flush.
        await sleep(700)

        const html = '<!doctype html>\n' + (await page.content()).replace(/^<!doctype html>/i, '')

        // Write to dist/<route>/index.html  ('/' → dist/index.html)
        const outDir =
          route.path === '/' ? DIST : path.join(DIST, route.path.replace(/^\//, ''))
        fs.mkdirSync(outDir, { recursive: true })
        fs.writeFileSync(path.join(outDir, 'index.html'), html)
        ok++
        console.log(`[prerender] ✓ ${route.path}`)
      } catch (e) {
        failed++
        console.warn(`[prerender] ✗ ${route.path} — ${e.message}`)
      } finally {
        await page.close()
      }
    }
  } finally {
    await browser.close()
    server.close()
  }

  console.log(`[prerender] Done — ${ok} rendered, ${failed} failed, ${routes.length} total.`)
  if (ok === 0) process.exit(1)
}

main().catch((e) => {
  console.error('[prerender] failed:', e)
  process.exit(1)
})
