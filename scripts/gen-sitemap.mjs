/**
 * Generate dist/sitemap.xml and dist/robots.txt from the live route list.
 * Run after `vite build`.  Usage: node scripts/gen-sitemap.mjs
 */
import fs from 'fs'
import path from 'path'
import { getAllRoutes, ORIGIN, ROOT } from './seo-routes.mjs'

const DIST = path.join(ROOT, 'dist')

function isoDate(v) {
  const d = v ? new Date(v) : new Date()
  return (isNaN(d) ? new Date() : d).toISOString().slice(0, 10)
}

function xmlEscape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function main() {
  if (!fs.existsSync(DIST)) {
    console.error('[sitemap] dist/ not found — run `vite build` first.')
    process.exit(1)
  }
  const routes = await getAllRoutes()

  const urls = routes
    .map((r) => {
      const loc = ORIGIN + r.path
      return [
        '  <url>',
        `    <loc>${xmlEscape(loc)}</loc>`,
        `    <lastmod>${isoDate(r.lastmod)}</lastmod>`,
        r.changefreq ? `    <changefreq>${r.changefreq}</changefreq>` : '',
        r.priority != null ? `    <priority>${r.priority.toFixed(1)}</priority>` : '',
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const sitemap =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls +
    '\n</urlset>\n'

  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap)

  const robots =
    'User-agent: *\n' +
    'Allow: /\n' +
    'Disallow: /dashboard\n' +
    'Disallow: /account\n' +
    'Disallow: /cart\n' +
    'Disallow: /wishlist\n' +
    'Disallow: /login\n' +
    'Disallow: /signup\n' +
    '\n' +
    `Sitemap: ${ORIGIN}/sitemap.xml\n`

  fs.writeFileSync(path.join(DIST, 'robots.txt'), robots)

  console.log(`[sitemap] Wrote sitemap.xml (${routes.length} URLs) and robots.txt`)
}

main().catch((e) => {
  console.error('[sitemap] failed:', e)
  process.exit(1)
})
