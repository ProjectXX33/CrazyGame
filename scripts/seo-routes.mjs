/**
 * Shared route source for SEO build steps (prerender + sitemap).
 *
 * Reads Supabase credentials from .env and returns the full list of public
 * routes to pre-render / list in the sitemap: static pages + one route per
 * product slug + one route per blog post slug.
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

export const ORIGIN = 'https://crazygame-eg.com'

// Minimal .env parser (no dotenv dependency)
function loadEnv() {
  const env = {}
  try {
    const raw = fs.readFileSync(path.join(ROOT, '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {}
  return env
}

// Static, always-indexed routes
export const STATIC_ROUTES = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/shop', priority: 0.9, changefreq: 'daily' },
  { path: '/digital', priority: 0.8, changefreq: 'weekly' },
  { path: '/blog', priority: 0.6, changefreq: 'weekly' },
  { path: '/about', priority: 0.4, changefreq: 'monthly' },
  { path: '/contact', priority: 0.4, changefreq: 'monthly' },
  { path: '/request', priority: 0.4, changefreq: 'monthly' },
]

export async function getDynamicRoutes() {
  const env = loadEnv()
  const url = env.VITE_SUPABASE_URL
  const key = env.SUPABASE_SECRET_KEY || env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.warn('[seo-routes] Missing Supabase env — only static routes will be used.')
    return { products: [], posts: [] }
  }
  const supabase = createClient(url, key)

  const productsRes = await supabase
    .from('products')
    .select('slug, id, created_at')
    .order('id', { ascending: true })
    .limit(5000)
  if (productsRes.error) console.warn('[seo-routes] products query error:', productsRes.error.message)

  let posts = []
  const postsRes = await supabase
    .from('blog_posts')
    .select('slug, id, published_at')
    .order('published_at', { ascending: false })
    .limit(1000)
  if (postsRes.error) {
    console.warn('[seo-routes] blog_posts query error (ok if table missing):', postsRes.error.message)
  } else {
    posts = postsRes.data || []
  }

  const products = (productsRes.data || []).filter((p) => p.slug)
  return { products, posts: posts.filter((p) => p.slug) }
}

// Full list of { path, lastmod, priority, changefreq } for sitemap + prerender.
export async function getAllRoutes() {
  const { products, posts } = await getDynamicRoutes()
  const routes = [...STATIC_ROUTES.map((r) => ({ ...r, lastmod: null }))]

  for (const p of products) {
    routes.push({
      path: '/product/' + encodeURIComponent(p.slug),
      lastmod: p.created_at || null,
      priority: 0.8,
      changefreq: 'weekly',
    })
  }
  for (const post of posts) {
    routes.push({
      path: '/blog/' + encodeURIComponent(post.slug),
      lastmod: post.published_at || null,
      priority: 0.5,
      changefreq: 'monthly',
    })
  }
  return routes
}

export { ROOT }
