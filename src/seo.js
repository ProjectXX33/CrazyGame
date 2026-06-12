/* SEO head manager — dependency-free.
 *
 * `setSeo()` imperatively writes the document <title> and a managed set of
 * <meta> / <link rel=canonical> / Open Graph / Twitter tags plus a JSON-LD
 * <script> block. Every managed node carries a `data-seo` attribute so repeated
 * route changes REPLACE the previous set instead of stacking duplicates.
 *
 * This runs in the live SPA on every navigation, and — because the pre-render
 * step (scripts/prerender.mjs) snapshots the DOM *after* React has run — these
 * exact tags get frozen into the static HTML that crawlers and social link
 * previews read.
 */
import { useEffect } from 'react'

// ── Site-wide constants ──────────────────────────────────────────────────────
export const SITE = {
  origin: 'https://crazygame-eg.com',
  name: 'Crazy Game',
  // Default <title> for routes that don't set their own
  defaultTitle: 'Crazy Game — Games, Consoles & Digital Codes in Egypt',
  titleSuffix: ' | Crazy Game',
  description:
    "Egypt's trusted store for video games, consoles, memberships and digital cards. " +
    'Fast delivery, genuine sealed copies, instant code delivery, cash on delivery.',
  // Absolute default share image (1200×630 recommended). Uses the logo for now.
  defaultImage: 'https://crazygame-eg.com/favicon.png',
  locale: 'en_US',
  twitter: '@crazygame_eg',
}

// Build an absolute URL from a site path (e.g. "/shop" → origin + "/shop").
export function absUrl(pathOrUrl) {
  if (!pathOrUrl) return SITE.origin + '/'
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return SITE.origin + (pathOrUrl.startsWith('/') ? pathOrUrl : '/' + pathOrUrl)
}

// Strip HTML and collapse whitespace, then clamp for meta descriptions.
export function plainText(html, max = 160) {
  const text = String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= max) return text
  return text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…'
}

// ── DOM helpers ──────────────────────────────────────────────────────────────
function upsertMeta(attr, key, content) {
  if (content == null || content === '') return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    el.setAttribute('data-seo', '')
    document.head.appendChild(el)
  } else {
    el.setAttribute('data-seo', '')
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  if (!href) return
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    el.setAttribute('data-seo', '')
    document.head.appendChild(el)
  } else {
    el.setAttribute('data-seo', '')
  }
  el.setAttribute('href', href)
}

function setJsonLd(jsonLd) {
  // Remove previously-managed JSON-LD blocks
  document.head
    .querySelectorAll('script[type="application/ld+json"][data-seo]')
    .forEach((n) => n.remove())
  if (!jsonLd) return
  const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd]
  for (const block of blocks) {
    if (!block) continue
    const s = document.createElement('script')
    s.type = 'application/ld+json'
    s.setAttribute('data-seo', '')
    s.textContent = JSON.stringify(block)
    document.head.appendChild(s)
  }
}

// ── Public API ───────────────────────────────────────────────────────────────
export function setSeo({
  title,
  description = SITE.description,
  path = typeof window !== 'undefined' ? window.location.pathname : '/',
  image = SITE.defaultImage,
  type = 'website',
  noindex = false,
  jsonLd = null,
} = {}) {
  if (typeof document === 'undefined') return

  const fullTitle = title
    ? (title.includes(SITE.name) ? title : title + SITE.titleSuffix)
    : SITE.defaultTitle
  document.title = fullTitle

  const canonical = absUrl(path)
  const img = absUrl(image)

  upsertMeta('name', 'description', description)
  upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
  upsertLink('canonical', canonical)

  // Open Graph
  upsertMeta('property', 'og:type', type)
  upsertMeta('property', 'og:site_name', SITE.name)
  upsertMeta('property', 'og:title', fullTitle)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:url', canonical)
  upsertMeta('property', 'og:image', img)
  upsertMeta('property', 'og:locale', SITE.locale)

  // Twitter
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', fullTitle)
  upsertMeta('name', 'twitter:description', description)
  upsertMeta('name', 'twitter:image', img)
  if (SITE.twitter) upsertMeta('name', 'twitter:site', SITE.twitter)

  setJsonLd(jsonLd)
}

// Declarative hook for page components. Re-runs whenever a dependency changes.
export function useSeo(opts, deps = []) {
  useEffect(() => {
    setSeo(typeof opts === 'function' ? opts() : opts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

// ── JSON-LD builders ─────────────────────────────────────────────────────────
export function orgJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.origin + '/',
    logo: SITE.defaultImage,
    areaServed: 'EG',
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.origin + '/',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: SITE.origin + '/shop?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbJsonLd(items) {
  // items: [{ name, path }]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absUrl(it.path),
    })),
  }
}

export function productJsonLd(p, path) {
  if (!p) return null
  const inStock =
    p.productType === 'digital_code' ||
    p.inStock === true ||
    (p.stock == null ? p.inStock !== false : Number(p.stock) > 0)
  const offer = {
    '@type': 'Offer',
    url: absUrl(path),
    priceCurrency: 'EGP',
    price: Number(p.price) || 0,
    availability: inStock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    itemCondition: p.preowned
      ? 'https://schema.org/UsedCondition'
      : 'https://schema.org/NewCondition',
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    image: p.img ? [absUrl(p.img)] : undefined,
    description: plainText(p.blurb || p.description || p.title, 300),
    sku: String(p.id),
    brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined,
    category: p.genre || p.productType,
    offers: offer,
  }
}

export function blogPostingJsonLd(post, path) {
  if (!post) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.image ? [absUrl(post.image)] : undefined,
    description: plainText(post.excerpt || post.body || post.title, 200),
    author: post.author
      ? { '@type': 'Person', name: post.author }
      : { '@type': 'Organization', name: SITE.name },
    publisher: orgJsonLd(),
    mainEntityOfPage: absUrl(path),
    articleSection: post.cat,
  }
}
