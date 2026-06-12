/* App: routing, cart/wishlist/theme state, context provider, toasts */
import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react'
import { ShopContext } from './context.js'
import { platforms, genres, posts as staticPosts } from './data.js'
import { fetchAllProducts, fetchBlogPosts, fetchReviewStats, supabase } from './supabase.js'
import { cacheGet, cacheSet, cacheClear } from './cache.js'
import { loadSettings, DEFAULT_SETTINGS } from './settings.js'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import { CartDrawer, CartPage } from './components/Cart.jsx'
import Icon from './components/Icon.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import Product from './pages/Product.jsx'
import { Wishlist, DigitalPage, BlogPage, ContactPage, AboutPage } from './pages/Pages.jsx'
import CrazyRequest from './pages/CrazyRequest.jsx'
// Lazy-loaded — MUI + admin code only ships when the admin opens /dashboard
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
import { BlogPostPage } from './pages/Pages.jsx'
import { LoginPage, SignupPage, AccountPage } from './pages/Account.jsx'
import { getCurrentUser, onAuthChange, isAdmin as checkIsAdmin } from './auth.js'
import BackgroundPattern from './components/BackgroundPattern.jsx'

function useToasts() {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)
  const push = useCallback((msg) => {
    const id = ++idRef.current
    setToasts(t => [...t, { id, msg }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600)
  }, [])
  return { toasts, push }
}

// ── URL routing ─────────────────────────────────────────────────────────────
// All site pages have shareable slugs. Shop filters serialize to ?query=string.
function routeToURL({ name, params = {} }) {
  switch (name) {
    case 'home': return '/'
    case 'shop': {
      const qs = new URLSearchParams()
      if (params.platform) qs.set('platform', params.platform)
      if (params.genre)    qs.set('genre', params.genre)
      if (params.sort)     qs.set('sort', params.sort)
      if (params.type)     qs.set('type', params.type)
      if (params.q)        qs.set('q', params.q)
      if (params.sale)     qs.set('sale', '1')
      if (params.preowned) qs.set('preowned', '1')
      const s = qs.toString()
      return '/shop' + (s ? '?' + s : '')
    }
    case 'product':  return '/product/' + encodeURIComponent(params.slug || params.id || '')
    case 'digital':  return '/digital'
    case 'blog':     return '/blog'
    case 'blogpost': return '/blog/' + encodeURIComponent(params.slug || '')
    case 'wishlist': return '/wishlist'
    case 'cart':     return '/cart'
    case 'request':  return '/request'
    case 'contact':  return '/contact'
    case 'about':    return '/about'
    case 'login':    return '/login'
    case 'signup':   return '/signup'
    case 'account':  return '/account'
    case 'dashboard':{
      const sub = params.sub || ''
      return '/dashboard' + (sub ? '/' + sub : '')
    }
    default:         return '/'
  }
}

function urlToRoute(pathname, search) {
  const path = pathname.replace(/\/+$/, '') || '/'
  // Product slug or id — Product page matches by slug first, then by id
  const pm = path.match(/^\/product\/(.+)$/)
  if (pm) {
    return { name: 'product', params: { slug: decodeURIComponent(pm[1]) } }
  }
  // Single blog post — /blog/:slug
  const bm = path.match(/^\/blog\/(.+)$/)
  if (bm) {
    return { name: 'blogpost', params: { slug: decodeURIComponent(bm[1]) } }
  }
  if (path === '/shop') {
    const qs = new URLSearchParams(search || '')
    const params = {}
    for (const k of ['platform', 'genre', 'sort', 'type', 'q']) {
      const v = qs.get(k); if (v) params[k] = v
    }
    if (qs.get('sale') === '1') params.sale = true
    if (qs.get('preowned') === '1') params.preowned = true
    return { name: 'shop', params }
  }
  // Dashboard sub-pages: /dashboard, /dashboard/products, etc.
  const dm = path.match(/^\/dashboard(?:\/(.+))?$/)
  if (dm) {
    return { name: 'dashboard', params: { sub: dm[1] || '' } }
  }
  const map = {
    '/': 'home', '/digital': 'digital', '/blog': 'blog', '/wishlist': 'wishlist',
    '/cart': 'cart', '/request': 'request', '/login': 'login', '/signup': 'signup',
    '/account': 'account',
    '/contact': 'contact', '/about': 'about',
  }
  return { name: map[path] || 'home', params: {} }
}

function initialRouteFromURL() {
  return urlToRoute(window.location.pathname, window.location.search)
}

export default function App() {
  const [route, setRoute] = useState(initialRouteFromURL)
  const [theme, setTheme] = useState('dark')
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SETTINGS)
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState(staticPosts)
  const [isAdmin, setIsAdmin] = useState(false)
  const [cart, setCart] = useState([])   // {key, id, digital, qty}
  const [wish, setWish] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const { toasts, push } = useToasts()

  // Supabase products state — split by type
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [dbError, setDbError] = useState(null)

  // Derived splits
  const products = allProducts.filter(p => p.productType === 'game')
  const accessories = allProducts.filter(p => p.productType === 'accessory')
  const consoles = allProducts.filter(p => p.productType === 'console')
  const digital = allProducts.filter(p => p.productType === 'digital_code')

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme) }, [theme])

  // Stale-while-revalidate: paint the cached list immediately so the customer
  // sees the store with ZERO egress, then revalidate from Supabase in the
  // background and swap the data in if it changed.
  const loadProducts = useCallback(({ force = false } = {}) => {
    // 1) Hydrate from cache instantly if we have it
    if (!force) {
      const cached = cacheGet('products')
      if (cached && Array.isArray(cached.data)) {
        setAllProducts(cached.data)
        setLoading(false)
        if (!cached.stale) {
          console.log('[Crazy Game] Products served from cache (' + cached.data.length + '). Egress saved.')
          return Promise.resolve(cached.data)
        }
      }
    }
    // 2) Fetch fresh — products + real review stats, merged so cards/PDP show
    //    the true average rating & count (no more fake numbers).
    return Promise.all([fetchAllProducts(), fetchReviewStats().catch(() => ({}))])
      .then(([rows, stats]) => {
        const data = rows.map(p => ({
          ...p,
          rating: stats[p.id]?.rating ?? null,
          reviews: stats[p.id]?.count ?? 0,
        }))
        console.log('[Crazy Game] Loaded', data.length, 'products from Supabase (network)')
        if (data.length === 0) console.warn('[Crazy Game] Products table returned 0 rows — likely RLS blocking reads.')
        setAllProducts(data)
        setDbError(null)
        setLoading(false)
        cacheSet('products', data)
        return data
      })
      .catch(err => {
        console.error('[Crazy Game] Supabase fetch error:', err)
        setDbError(err.message || String(err))
        setLoading(false)
      })
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  // Blog posts — same SWR pattern
  const loadPosts = useCallback(({ force = false } = {}) => {
    if (!force) {
      const cached = cacheGet('posts')
      if (cached?.data?.length) {
        setPosts(cached.data)
        if (!cached.stale) return Promise.resolve(cached.data)
      }
    }
    return fetchBlogPosts()
      .then(rows => {
        if (Array.isArray(rows) && rows.length > 0) { setPosts(rows); cacheSet('posts', rows) }
      })
      .catch(() => {})
  }, [])
  useEffect(() => { loadPosts() }, [loadPosts])

  // Load site settings — SWR cache
  useEffect(() => {
    const cached = cacheGet('settings')
    if (cached?.data) {
      setSiteSettings(cached.data)
      if (!cached.stale) return
    }
    loadSettings().then(s => { setSiteSettings(s); cacheSet('settings', s) }).catch(() => {})
  }, [])

  // ── Realtime sync ───────────────────────────────────────────────────────
  // Any dashboard write to products, variants, blog, or site settings is
  // broadcast by Postgres → we refetch the affected slice so every open tab
  // updates instantly without a refresh.
  useEffect(() => {
    let debounceProducts, debouncePosts, debounceSettings
    const scheduleProducts = () => {
      clearTimeout(debounceProducts)
      debounceProducts = setTimeout(() => {
        cacheClear('products')
        loadProducts({ force: true })
      }, 250)
    }
    const schedulePosts = () => {
      clearTimeout(debouncePosts)
      debouncePosts = setTimeout(() => {
        cacheClear('posts')
        loadPosts({ force: true })
      }, 250)
    }
    const scheduleSettings = () => {
      clearTimeout(debounceSettings)
      debounceSettings = setTimeout(() => {
        cacheClear('settings')
        loadSettings().then(s => { setSiteSettings(s); cacheSet('settings', s) }).catch(() => {})
      }, 250)
    }

    const channel = supabase
      .channel('cg-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, scheduleProducts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_variants' }, scheduleProducts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_posts' }, schedulePosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, scheduleSettings)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Crazy Game] Realtime channel live — live updates active.')
        }
      })

    return () => {
      clearTimeout(debounceProducts)
      clearTimeout(debouncePosts)
      clearTimeout(debounceSettings)
      supabase.removeChannel(channel)
    }
  }, [loadProducts, loadPosts])

  // Track logged-in customer
  useEffect(() => {
    getCurrentUser().then(setUser)
    return onAuthChange(setUser)
  }, [])

  // Check admin status whenever user changes
  useEffect(() => {
    if (!user) { setIsAdmin(false); return }
    let alive = true
    checkIsAdmin(user.id).then(ok => { if (alive) setIsAdmin(!!ok) })
    return () => { alive = false }
  }, [user])

  // Sync browser back/forward to route state
  useEffect(() => {
    const onPop = () => setRoute(initialRouteFromURL())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  // Push URL whenever the route changes (skip if it already matches)
  useEffect(() => {
    const wantedURL = routeToURL(route)
    const currentURL = window.location.pathname + window.location.search
    if (currentURL !== wantedURL) {
      window.history.pushState({}, '', wantedURL)
    }
  }, [route])

  // restore persisted state
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('cg_state') || '{}')
      if (s.cart) setCart(s.cart)
      if (s.wish) setWish(s.wish)
      if (s.theme) setTheme(s.theme)
    } catch (e) {}
  }, [])
  useEffect(() => {
    localStorage.setItem('cg_state', JSON.stringify({ cart, wish, theme }))
  }, [cart, wish, theme])

  const getItem = useCallback((id, isDigital) => {
    const sid = String(id)
    if (isDigital) return digital.find(d => String(d.id) === sid)
    return allProducts.find(p => String(p.id) === sid) || digital.find(d => String(d.id) === sid)
  }, [allProducts, digital])

  const nav = (name, params = {}) => {
    setRoute({ name, params })
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }

  const addToCart = useCallback((id, isDigital = false, qty = 1, variant = null, opts = {}) => {
    const digitalItem = digital.find(d => String(d.id) === String(id))
    const actuallyDigital = isDigital || !!digitalItem
    const item = getItem(id, actuallyDigital)
    if (!item) return
    // Block adding when explicitly out of stock (digital items have no stock concept)
    if (!actuallyDigital && item.stock != null && Number(item.stock) <= 0) {
      push((item.title || 'Item') + ' is sold out')
      return
    }
    // Block "coming soon" items (no price set) from being added — there's nothing
    // to charge for yet. Variants with their own price are still allowed.
    const effPrice = variant ? Number(variant.price) : Number(item.price)
    if (!actuallyDigital && (!effPrice || effPrice <= 0)) {
      push((item.title || 'This item') + ' is coming soon — not available to buy yet')
      return
    }
    setCart(c => {
      const key = (actuallyDigital ? 'd' : 'p') + id + (variant?.id ? ':v' + variant.id : '')
      const ex = c.find(l => l.key === key)
      const stockCap = !actuallyDigital && item.stock != null ? Math.max(0, Number(item.stock) || 0) : Infinity
      if (ex) {
        const next = Math.min(stockCap, ex.qty + qty)
        if (next === ex.qty) { push(`Only ${stockCap} in stock`); return c }
        return c.map(l => l.key === key ? { ...l, qty: next } : l)
      }
      const initialQty = Math.min(stockCap, qty)
      return [...c, { key, id, digital: actuallyDigital, qty: initialQty, variant: variant || null }]
    })
    push((item.title || 'Item') + (variant ? ' (' + variant.label + ')' : '') + ' added to cart')
    // Pop the cart drawer open on add (unless the caller opts out, e.g. Buy-it-now
    // which navigates straight to the cart page).
    if (opts.openDrawer !== false) setCartOpen(true)
  }, [getItem, push, digital])

  const removeFromCart = (key) => setCart(c => c.filter(l => l.key !== key))
  const setQty = (key, q) => setCart(c => {
    if (q <= 0) return c.filter(l => l.key !== key)
    return c.map(l => {
      if (l.key !== key) return l
      const item = getItem(l.id, l.digital)
      const cap = (!l.digital && item?.stock != null) ? Math.max(0, Number(item.stock) || 0) : Infinity
      const clamped = Math.min(cap, q)
      if (clamped < q) push(`Only ${cap} in stock`)
      return { ...l, qty: clamped }
    })
  })
  const clearCart = () => setCart([])

  const toggleWish = useCallback((id) => {
    setWish(w => {
      const has = w.includes(id)
      push(has ? 'Removed from wishlist' : 'Saved to wishlist')
      return has ? w.filter(x => x !== id) : [...w, id]
    })
  }, [push])

  const cartLines = useMemo(() => cart.map(l => ({ ...l, item: getItem(l.id, l.digital) })).filter(l => l.item), [cart, getItem])
  const cartCount = cartLines.reduce((s, l) => s + l.qty, 0)

  const ctx = {
    products, accessories, consoles, digital, platforms, genres, posts,
    refetchPosts: loadPosts,
    allProducts, loading, dbError, refetchProducts: loadProducts,
    route, theme,
    toggleTheme: () => setTheme(t => t === 'dark' ? 'light' : 'dark'),
    goHome: () => nav('home'), goShop: (params) => nav('shop', params),
    goProduct: (idOrSlug) => {
      const sid = String(idOrSlug)
      const found = allProducts.find(p => p.slug === sid || String(p.id) === sid)
        || digital.find(d => d.slug === sid || String(d.id) === sid)
      nav('product', { slug: found?.slug || sid })
    },
    goDigital: () => nav('digital'), goBlog: () => nav('blog'),
    goBlogPost: (slug) => nav('blogpost', { slug }),
    goWishlist: () => nav('wishlist'), goCart: () => nav('cart'), goRequest: () => nav('request'),
    goContact: () => nav('contact'), goAbout: () => nav('about'),
    goDashboard: (sub) => nav('dashboard', { sub: sub || '' }),
    goLogin: () => nav('login'), goSignup: () => nav('signup'), goAccount: () => nav('account'),
    user, isAdmin,
    siteSettings, setSiteSettings,
    pushToast: push,
    cart, cartLines, cartCount, addToCart, removeFromCart, setQty, clearCart,
    cartOpen, openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false),
    wish, toggleWish,
  }

  let Page
  switch (route.name) {
    case 'shop': Page = <Shop />; break
    case 'product': Page = <Product slug={route.params.slug} />; break
    case 'digital': Page = <DigitalPage />; break
    case 'blog': Page = <BlogPage />; break
    case 'blogpost': Page = <BlogPostPage slug={route.params.slug} />; break
    case 'wishlist': Page = <Wishlist />; break
    case 'cart': Page = <CartPage />; break
    case 'request': Page = <CrazyRequest />; break
    case 'contact': Page = <ContactPage />; break
    case 'about':   Page = <AboutPage />; break
    case 'dashboard': Page = <Dashboard initialPage={route.params.sub || 'overview'} />; break
    case 'login': Page = <LoginPage />; break
    case 'signup': Page = <SignupPage />; break
    case 'account': Page = <AccountPage />; break
    default: Page = <Home />
  }

  const isDashboard = route.name === 'dashboard'

  // Dashboard is a standalone page — no customer header, footer, marquee, or shop chrome.
  if (isDashboard) {
    return (
      <ShopContext.Provider value={ctx}>
        <Suspense fallback={
          <div style={{
            minHeight: '100vh', display: 'grid', placeItems: 'center',
            background: '#f0f2f5', fontFamily: 'Roboto, sans-serif', color: '#344767',
          }}>Loading dashboard…</div>
        }>
          <Dashboard initialPage={route.params.sub || 'overview'} />
        </Suspense>
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 300, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', pointerEvents: 'none' }}>
          {toasts.map(t => (
            <div key={t.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)',
              padding: '13px 20px', borderRadius: 12, boxShadow: 'var(--shadow-pop)', fontWeight: 600, fontSize: 14.5,
              display: 'flex', alignItems: 'center', gap: 10, animation: 'scaleIn .3s var(--ease)',
            }}>
              <span style={{ color: 'var(--accent-bright)', display: 'grid' }}><Icon name="check" size={18} /></span>
              {t.msg}
            </div>
          ))}
        </div>
      </ShopContext.Provider>
    )
  }

  return (
    <ShopContext.Provider value={ctx}>
      <BackgroundPattern />
      <Header />
      {loading && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: 'var(--bg)',
          gap: 20, pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 48 }}>🎮</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
            Loading games…
          </div>
          <div style={{
            width: 200, height: 4, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden'
          }}>
            <div style={{
              height: '100%', background: 'var(--accent-bright)',
              animation: 'loadingBar 1.4s ease-in-out infinite',
              borderRadius: 999,
            }} />
          </div>
        </div>
      )}
      {(dbError || (!loading && allProducts.length === 0)) && (
        <div style={{
          background: dbError ? '#7a1f1f' : '#7a5a1f', color: '#fff',
          padding: '12px 20px', textAlign: 'center', fontSize: 14, fontWeight: 600,
        }}>
          {dbError
            ? `❌ Supabase error: ${dbError}`
            : '⚠️ Supabase returned 0 products. Likely RLS is blocking reads — run scripts/fix-products-read.sql in Supabase.'}
        </div>
      )}
      <main style={{ flex: 1 }} key={route.name + JSON.stringify(route.params)}>{Page}</main>
      <Footer />
      <CartDrawer />
      {/* toasts */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 300, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)',
            padding: '13px 20px', borderRadius: 12, boxShadow: 'var(--shadow-pop)', fontWeight: 600, fontSize: 14.5,
            display: 'flex', alignItems: 'center', gap: 10, animation: 'scaleIn .3s var(--ease)',
          }}>
            <span style={{ color: 'var(--accent-bright)', display: 'grid' }}><Icon name="check" size={18} /></span>
            {t.msg}
          </div>
        ))}
      </div>
    </ShopContext.Provider>
  )
}
