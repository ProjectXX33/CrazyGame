/* Home page — assembles hero, rails, shortcuts, feature banner, digital, blog */
import { useRef } from 'react'
import Icon from '../components/Icon.jsx'
import { Rail, CoverArt } from '../components/UI.jsx'
import Hero from '../components/Hero.jsx'
import { useShop, EGP } from '../context.js'
import { useSeo, orgJsonLd, websiteJsonLd } from '../seo.js'
import switchSvg from '../assets/background/nintendo-switch-svgrepo-com.svg'
import switch2Svg from '../assets/background/nintendo-switch2-svgrepo-com.svg'
import playstationSvg from '../assets/background/playstation-svgrepo-com.svg'

function Marquee() {
  const items = [
    ['truck', 'Free delivery over EGP 1,500'],
    ['shield', '100% genuine sealed copies'],
    ['bolt', 'Instant digital code delivery'],
    ['tag', 'Price-match on new releases'],
    ['gift', 'Gift wrapping available'],
    ['check', 'Cash on delivery across Egypt'],
  ]
  const row = [...items, ...items]
  return (
    <div className="marquee">
      <div className="marquee-track">
        {row.map((it, i) => (
          <span className="marquee-item" key={i}><Icon name={it[0]} size={17} /> {it[1]}</span>
        ))}
      </div>
    </div>
  )
}

function PlatformShortcuts() {
  const shop = useShop()
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow">Shop by platform</div>
            <h2 style={{ marginTop: 10 }}>Pick your console</h2>
          </div>
        </div>
        <div className="plat-grid">
          {shop.platforms.map(pl => {
            return (
              <div className="plat-card" key={pl.key} onClick={() => shop.goShop({ platform: pl.key })} style={{ padding: 0, border: 'none', background: 'transparent' }}>
                {pl.img && (
                  <img src={pl.img} alt={pl.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FeatureBanner({ p }) {
  const shop = useShop()
  if (!p) return null
  const h = p.hue, h2 = (h + 40) % 360
  const onSale = p.was && p.was > p.price
  return (
    <section className="section">
      <div className="wrap">
        <div className="feature-banner" onClick={() => shop.goProduct(p.id)}>
          {/* Ambient background: hue-matched gradient + soft glow toward the art */}
          <div className="fb-bg" style={{
            background: `radial-gradient(130% 130% at 82% 50%, oklch(0.42 0.17 ${h} / 0.55), transparent 58%), linear-gradient(120deg, oklch(0.14 0.06 ${h2}), oklch(0.08 0.035 ${h2}))`,
          }} />
          {/* Blurred copy of the art as an ambient backdrop (no hard crops) */}
          {p.img && (
            <div className="fb-bg" style={{
              backgroundImage: `url(${p.img})`, backgroundSize: 'cover', backgroundPosition: 'center',
              filter: 'blur(46px) saturate(1.3)', opacity: 0.3, transform: 'scale(1.25)',
            }} />
          )}
          <div className="fb-grain" />

          <div className="feature-body">
            <div className="fb-eyebrow">
              <Icon name="bolt" size={14} /> Deal of the week
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3.5vw,44px)', lineHeight: 1.05, marginBottom: 10 }}>{p.title}</h2>
            <div className="muted" style={{ fontSize: 14.5, marginBottom: 18 }}>{p.genre} · {p.platform}</div>
            {onSale && (
              <span className="badge badge-sale" style={{ fontSize: 13.5, padding: '5px 12px', marginBottom: 18, display: 'inline-block' }}>
                Save {EGP(p.was - p.price)} — Limited time
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: 'var(--primary-bright)' }}>{EGP(p.price)}</span>
              {p.was && <span style={{ fontSize: 17, color: 'var(--text-faint)', textDecoration: 'line-through' }}>{EGP(p.was)}</span>}
              <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); shop.addToCart(p.id) }}>
                <Icon name="cart" size={17} /> Add to cart
              </button>
            </div>
          </div>

          {/* Full box art — contained so it's never cropped */}
          {p.img && (
            <div className="fb-art">
              <img src={p.img} alt={p.title} loading="lazy" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Digital classification helpers ──────────────────────────────────────────
// PSN  = title or platform contains "psn" / "playstation"
function isPSNDigital(d) {
  const t = ((d?.title || '') + ' ' + (d?.platform || '') + ' ' + (d?.brand || '')).toLowerCase()
  return /\bpsn\b|playstation/.test(t)
}
// Nintendo = title contains "eshop", "nintendo", "switch online", or platform is Switch/Switch 2
function isNintendoDigital(d) {
  const t = ((d?.title || '') + ' ' + (d?.platform || '') + ' ' + (d?.brand || '')).toLowerCase()
  return /eshop|nintendo|switch\s*online|switch\s*2|^switch$/.test(t)
}

function DigitalSubsection({ items, eyebrow, title, sub, onSeeAll }) {
  if (!items || items.length === 0) return null
  return (
    <Rail
      eyebrow={eyebrow}
      title={title}
      sub={sub}
      items={items}
      onSeeAll={onSeeAll}
    />
  )
}

function PSNDigitalSection() {
  const shop = useShop()
  const items = (shop.digital || []).filter(isPSNDigital)
  return (
    <DigitalSubsection
      items={items}
      eyebrow={<span className="accent"><Icon name="code" size={15} /> Instant delivery</span>}
      title="PSN Cards"
      sub="PlayStation Network gift cards & memberships — delivered to your inbox."
      onSeeAll={() => shop.goShop({ type: 'digital_code', q: 'PSN' })}
    />
  )
}

function NintendoDigitalSection() {
  const shop = useShop()
  const items = (shop.digital || []).filter(isNintendoDigital)
  return (
    <DigitalSubsection
      items={items}
      eyebrow={<span className="accent"><Icon name="code" size={15} /> Instant delivery</span>}
      title="eShop Digital Codes & Memberships"
      sub="Nintendo eShop credit and Switch Online — top up, subscribe, play."
      onSeeAll={() => shop.goShop({ type: 'digital_code', q: 'eShop' })}
    />
  )
}

function BlogSection() {
  const shop = useShop()
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div><div className="eyebrow">From the blog</div><h2 style={{ marginTop: 10 }}>Latest in gaming</h2></div>
          <button className="btn btn-line btn-sm" onClick={() => shop.goBlog()}>More articles <Icon name="arrowR" size={15} /></button>
        </div>
        <div className="blog-grid">
          {shop.posts.map(post => {
            const h = post.hue, h2 = (h + 40) % 360
            return (
              <article className="blog-card" key={post.id} onClick={() => shop.goBlogPost(post.slug)}>
                <div className="blog-thumb">
                  <div style={{ position: 'absolute', inset: 0, transition: 'transform .6s var(--ease)',
                    background: post.image
                      ? `url(${post.image}) center/cover no-repeat`
                      : `linear-gradient(135deg, oklch(0.5 0.18 ${h}), oklch(0.25 0.08 ${h2}))` }}></div>
                  {!post.image && <div className="cover-grain"></div>}
                  <span className="badge" style={{ position: 'absolute', top: 12, left: 12, background: 'var(--scrim)', color: '#fff', backdropFilter: 'blur(6px)' }}>{post.cat}</span>
                </div>
                <div className="muted" style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '.04em' }}>{post.date} · {post.read} read</div>
                <h3 className="blog-title" style={{ marginTop: 7 }}>{post.title}</h3>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Platform section component ─────────────────────────────────────────────
const PLATFORM_STYLES = {
  PS5:       { gradientDark: 'linear-gradient(135deg, #e0e0e0 0%, #a0a0a0 100%)', gradientLight: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)', text: '#000000', logoFilter: 'none', btnBg: 'rgba(0,0,0,0.06)', btnBorder: 'rgba(0,0,0,0.15)', btnColor: '#000' },
  PS4:       { gradientDark: 'linear-gradient(135deg, #003087 0%, #000f3c 100%)', gradientLight: 'linear-gradient(135deg, #0040b3 0%, #001c6e 100%)', text: '#ffffff', logoFilter: 'brightness(0) invert(1)', btnBg: 'rgba(255,255,255,0.15)', btnBorder: 'rgba(255,255,255,0.25)', btnColor: '#fff' },
  'Switch 2':{ gradientDark: 'linear-gradient(135deg, #cc0000 0%, #7a0000 100%)', gradientLight: 'linear-gradient(135deg, #e4000f 0%, #990000 100%)', text: '#ffffff', logoFilter: 'brightness(0) invert(1)', btnBg: 'rgba(255,255,255,0.15)', btnBorder: 'rgba(255,255,255,0.25)', btnColor: '#fff' },
  Switch:    { gradientDark: 'linear-gradient(135deg, #e4000f 0%, #8b0000 100%)', gradientLight: 'linear-gradient(135deg, #ff1a26 0%, #cc0000 100%)', text: '#ffffff', logoFilter: 'brightness(0) invert(1)', btnBg: 'rgba(255,255,255,0.15)', btnBorder: 'rgba(255,255,255,0.25)', btnColor: '#fff' },
}

const PLATFORM_LOGOS = {
  PS5: playstationSvg,
  PS4: playstationSvg,
  'Switch 2': switch2Svg,
  Switch: switchSvg,
}

function PlatformSection({ platform, logo, eyebrow, items }) {
  const shop = useShop()
  const railRef = useRef(null)
  const style = PLATFORM_STYLES[platform] || {}
  const isLight = shop.theme === 'light'
  const gradient = isLight ? style.gradientLight : style.gradientDark

  if (!items || items.length === 0) return null

  function scroll(dir) {
    const el = railRef.current; if (!el) return
    el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: 'smooth' })
  }

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      {/* Branded platform header banner */}
      <div style={{
        background: gradient,
        borderRadius: 16,
        padding: '20px 28px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle sheen */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        {/* Left: logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative' }}>
          {logo && <img src={logo} alt={platform} style={{ height: 48, objectFit: 'contain', filter: style.logoFilter, opacity: 0.92 }} />}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: style.text, opacity: 0.6, marginBottom: 4 }}>{eyebrow}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: style.text, lineHeight: 1 }}>{items.length} titles available</div>
          </div>
        </div>
        {/* Right: Browse all + scroll arrows */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <button
            onClick={() => shop.goShop({ platform, type: 'game' })}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: style.btnBg, color: style.btnColor,
              border: `1px solid ${style.btnBorder}`, backdropFilter: 'blur(8px)',
              fontWeight: 700, fontSize: 14, padding: '8px 18px', borderRadius: 10, cursor: 'pointer',
            }}
          >
            Browse all <Icon name="arrowR" size={15} />
          </button>
          {/* Scroll arrows inside banner */}
          <button
            onClick={() => scroll(-1)}
            style={{
              width: 38, height: 38, borderRadius: 10, display: 'grid', placeItems: 'center',
              background: style.btnBg, color: style.btnColor,
              border: `1px solid ${style.btnBorder}`, cursor: 'pointer', flexShrink: 0,
            }}
          >
            <Icon name="chevL" size={18} />
          </button>
          <button
            onClick={() => scroll(1)}
            style={{
              width: 38, height: 38, borderRadius: 10, display: 'grid', placeItems: 'center',
              background: style.btnBg, color: style.btnColor,
              border: `1px solid ${style.btnBorder}`, cursor: 'pointer', flexShrink: 0,
            }}
          >
            <Icon name="chevR" size={18} />
          </button>
        </div>
      </div>
      {/* Games rail — headless, no header, arrows controlled by banner */}
      <Rail items={items.slice(0, 16)} scrollRef={railRef} headless />
    </section>
  )
}

function GenreStrip() {
  const shop = useShop()
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow">Explore</div>
            <h2 style={{ marginTop: 10 }}>Browse by genre</h2>
          </div>
        </div>
        <div className="genre-grid">
          {shop.genres.slice(0, 8).map(g => (
            <button key={g} className="genre-chip" onClick={() => shop.goShop({ genre: g })}>{g}</button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const shop = useShop()
  useSeo({
    path: '/',
    type: 'website',
    jsonLd: [orgJsonLd(), websiteJsonLd()],
  })
  const P = shop.products
  const featured = P.filter(p => p.tags && p.tags.includes('featured'))
  const newReleases = P.filter(p => p.tags && p.tags.includes('new') && !p.tags.includes('upcoming')).slice(0, 20)
  const bestsellers = P.filter(p => p.tags && p.tags.includes('bestseller')).slice(0, 20)
  const upcoming = P.filter(p => p.tags && (p.tags.includes('upcoming') || p.tags.includes('preorder'))).slice(0, 12)
  const onSale = P.filter(p => p.was && p.was > p.price)
  const sec = shop.siteSettings?.sections || {}
  const pickedBannerId = sec.featureBannerProductId
  const pickedBanner = pickedBannerId ? P.find(p => p.id === pickedBannerId) : null
  const fc = pickedBanner || onSale.find(p => p.img) || P.find(p => p.img) || P[0] || null

  // Platform-filtered lists
  const ps5Games    = P.filter(p => p.platform === 'PS5')
  const ps4Games    = P.filter(p => p.platform === 'PS4')
  const switch2Games = P.filter(p => p.platform === 'Switch 2')
  const switchGames  = P.filter(p => p.platform === 'Switch')

  const show = (k) => sec[k] !== false

  return (
    <div className="page">
      <Hero slides={featured} />
      {show('marquee') && <Marquee />}
      {show('platforms') && <PlatformShortcuts />}
      {show('newReleases') && newReleases.length > 0 && <Rail eyebrow="Fresh drops" title="New releases" sub="The latest titles, just added to the store." items={newReleases} onSeeAll={() => shop.goShop({ sort: 'new' })} />}
      {show('featureBanner') && <FeatureBanner p={fc} />}

      {/* ── Per-platform sections ── */}
      <div className="wrap">
        {show('ps5') && ps5Games.length > 0 && <PlatformSection platform="PS5" logo={PLATFORM_LOGOS['PS5']} eyebrow="PlayStation 5" items={ps5Games} />}
        {show('switch2') && switch2Games.length > 0 && <PlatformSection platform="Switch 2" logo={PLATFORM_LOGOS['Switch 2']} eyebrow="Nintendo Switch 2" items={switch2Games} />}
        {show('switch') && switchGames.length > 0 && <PlatformSection platform="Switch" logo={PLATFORM_LOGOS['Switch']} eyebrow="Nintendo Switch" items={switchGames} />}
        {show('ps4') && ps4Games.length > 0 && <PlatformSection platform="PS4" logo={PLATFORM_LOGOS['PS4']} eyebrow="PlayStation 4" items={ps4Games} />}
      </div>

      {show('genres') && <GenreStrip />}
      {show('upcoming') && upcoming.length > 0 && <Rail eyebrow="Coming soon" title="Upcoming & pre-orders" sub="Lock in the next big things before launch." items={upcoming} onSeeAll={() => shop.goShop({})} />}
      {show('psnDigital')      && <PSNDigitalSection />}
      {show('nintendoDigital') && <NintendoDigitalSection />}
      {show('sale') && onSale.length > 0 && <Rail eyebrow="Save big" title="On sale now" sub="Limited-time price cuts across every platform." items={onSale} onSeeAll={() => shop.goShop({ sale: true })} />}
      {show('blog') && <BlogSection />}
    </div>
  )
}
