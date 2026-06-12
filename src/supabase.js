import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase env vars. Check your .env file.')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Hue maps ───────────────────────────────────────────────────────────────
const PLATFORM_HUE = { PS5: 230, PS4: 220, 'Switch 2': 6, Switch: 350, Xbox: 140 }
const GENRE_HUE = {
  Action: 18, Adventure: 145, RPG: 280, Horror: 350, Racing: 32,
  Shooter: 210, Sports: 95, Casual: 50, Strategy: 255, Fighting: 6,
  Indie: 320,
}

const GENRE_LIST = ['RPG', 'Horror', 'Shooter', 'Racing', 'Fighting', 'Sports',
  'Strategy', 'Indie', 'Action', 'Adventure', 'Casual']

function getGenre(categories = []) {
  for (const g of GENRE_LIST) {
    if (categories.includes(g)) return g
  }
  return categories[0] || 'Action'
}

// Detect product type from categories
function detectType(categories = []) {
  const joined = categories.join(' ').toLowerCase()
  if (joined.includes('accessori')) return 'accessory'
  if (joined.includes('console')) return 'console'
  if (joined.includes('digital code') || joined.includes('psn digital') ||
      joined.includes('eshop') || joined.includes('membership')) return 'digital_code'
  return 'game'
}

export function shapeProduct(row) {
  const cats = Array.isArray(row.categories) ? row.categories : []
  const genre = getGenre(cats)
  const productType = row.product_type || detectType(cats)

  const variants = Array.isArray(row.product_variants)
    ? [...row.product_variants].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map(v => ({
          id: v.id,
          label: v.label,
          price: Number(v.price) || 0,
          img: v.image_url || null,
        }))
    : []

  return {
    id: row.id,
    slug: row.slug || null,
    title: row.name,
    short: row.name,
    variants,
    img: row.image_url || null,
    platform: row.platform || 'Other',
    platforms: [row.platform || 'Other'],
    genre,
    price: row.price || 0,
    was: row.was || null,
    rating: null,   // real average merged in from product_review_stats (App.jsx)
    reviews: 0,     // real approved-review count
    tags: Array.isArray(row.tags) ? row.tags : [],
    hue: GENRE_HUE[genre] ?? PLATFORM_HUE[row.platform] ?? 230,
    blurb: row.short_description || '',
    description: row.description || '',
    screenshots: Array.isArray(row.screenshots) ? row.screenshots : [],
    inStock: row.in_stock,
    stock: row.stock ?? null,
    categories: Array.isArray(row.categories) ? row.categories : [],
    brand: row.brand || '',
    year: row.created_at ? new Date(row.created_at).getFullYear() : 2025,
    productType,
    // digital card fields
    tier: row.short_description || '',
    accent: PLATFORM_HUE[row.platform] ? `oklch(0.55 0.2 ${PLATFORM_HUE[row.platform]})` : '#8b00ff',
    kind: productType === 'digital_code' ? 'Digital' : productType,
  }
}

// ── Fetch blog posts ───────────────────────────────────────────────────────
export async function fetchBlogPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(200)
  if (error) {
    // Table missing — caller falls back to static
    if (/blog_posts/.test(error.message || '')) return null
    throw error
  }
  return (data || []).map(r => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    cat: r.category || 'News',
    excerpt: r.excerpt || '',
    body: r.body || '',
    author: r.author || '',
    image: r.image_url || null,
    hue: r.hue ?? 230,
    read: r.read_time || '5 min',
    date: r.published_at
      ? new Date(r.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '',
  }))
}

// ── Fetch all products (with variants) ─────────────────────────────────────
// Egress saver — only select the columns the customer site actually renders.
// Heavy fields like `description` are fetched per-product on the PDP page only.
const PRODUCT_LIST_COLUMNS = [
  'id', 'name', 'slug', 'short_description', 'image_url',
  'platform', 'product_type', 'categories', 'tags', 'brand',
  'price', 'was', 'stock', 'in_stock', 'screenshots', 'created_at',
].join(', ')

export async function fetchAllProducts() {
  // Try fetching with variants joined. If the table doesn't exist yet, fall back.
  let { data, error } = await supabase
    .from('products')
    .select(`${PRODUCT_LIST_COLUMNS}, product_variants(*)`)
    .order('id', { ascending: true })
    .limit(1000)

  if (error && /product_variants/.test(error.message || '')) {
    // Variants table missing — fetch without it
    const fallback = await supabase
      .from('products')
      .select(PRODUCT_LIST_COLUMNS)
      .order('id', { ascending: true })
      .limit(1000)
    if (fallback.error) throw fallback.error
    data = fallback.data
    error = null
  }
  if (error) throw error
  return data.map(shapeProduct)
}

// Fetch the full `description` (and any other heavy fields) for a single product
// on the PDP. Tiny payload compared to fetching descriptions for every product.
export async function fetchProductDescription(productId) {
  const { data, error } = await supabase
    .from('products')
    .select('description')
    .eq('id', productId)
    .maybeSingle()
  if (error) return null
  return data?.description || null
}

// ── Reviews ──────────────────────────────────────────────────────────────────
// Approved-review averages + counts, keyed by product id. Powers the stars.
export async function fetchReviewStats() {
  const { data, error } = await supabase.from('product_review_stats').select('*')
  if (error) return {}
  const map = {}
  for (const r of data || []) {
    map[r.product_id] = { rating: Number(r.avg_rating) || null, count: r.review_count || 0 }
  }
  return map
}

// Reviews visible to the current viewer for one product:
// everyone sees approved; a logged-in user also sees their own pending one (RLS).
export async function fetchReviews(productId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, product_id, author_name, rating, title, body, approved, created_at, user_id')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  if (error) { console.warn('[reviews] fetch error:', error.message); return [] }
  return data || []
}

// Submit a review (logged-in only). Always starts unapproved.
export async function submitReview({ product_id, rating, title, body }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in to write a review.')
  const author_name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    (user.email ? user.email.split('@')[0] : 'Customer')
  const { error } = await supabase.from('reviews').insert({
    product_id, user_id: user.id, author_name,
    rating: Math.max(1, Math.min(5, Number(rating) || 0)),
    title: title?.trim() || null,
    body: body?.trim() || null,
    approved: false,
  })
  if (error) {
    if (/duplicate key/i.test(error.message)) throw new Error('You already reviewed this product.')
    throw error
  }
  return true
}

// ── Admin moderation ─────────────────────────────────────────────────────────
export async function fetchAllReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(2000)
  if (error) throw error
  return data || []
}

export async function setReviewApproved(id, approved) {
  const { error } = await supabase.from('reviews').update({ approved }).eq('id', id)
  if (error) throw error
}

export async function deleteReview(id) {
  const { error } = await supabase.from('reviews').delete().eq('id', id)
  if (error) throw error
}
