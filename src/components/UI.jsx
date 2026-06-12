/* Core UI: procedural CoverArt, ProductCard (3D tilt), Stars, Price, Rail */
import { useState, useRef, useEffect } from 'react'
import Icon from './Icon.jsx'
import { useShop, EGP } from '../context.js'

// ---------- Procedural key-art cover ----------
export function CoverArt({ p, big }) {
  const h = p.hue
  const h2 = (h + 42) % 360
  const seed = p.id
  const bx = 20 + (seed * 17) % 50
  const by = 14 + (seed * 23) % 36
  const angle = 110 + (seed * 13) % 60

  let ar = '3/4'
  const isDigital = p.productType === 'digital_code' || p.kind === 'Digital'
  const isHardware = p.productType === 'accessory' || p.productType === 'console'

  if (isHardware) {
    ar = '1/1'
  }
  else if (isDigital) {
    const t = p.title.toLowerCase()
    if (t.includes('nintendo') || t.includes('eshop')) ar = '10/16'
    else if (t.includes('psn') || t.includes('playstation')) ar = '4/5'
    else ar = '4/5'
  }
  else if (p.platform === 'PS4' || p.platform === 'PS5') ar = '4/5'
  else if (p.platform === 'Switch' || p.platform === 'Switch 2') ar = '10/16'

  // Hardware images (consoles, accessories) come in various aspect ratios —
  // use `contain` so the whole product is visible inside a square frame.
  // Game/digital covers are designed for `cover` (box art fills the area).
  // On the PDP hero (big=true), inset hardware images so they breathe inside the panel.
  const containSize = isHardware
    ? (big ? 'min(88%, 88%)' : 'contain')
    : 'cover'
  const bg = p.img
    ? {
        background: `url(${p.img}) center / ${containSize} no-repeat`,
        backgroundColor: isHardware ? 'var(--surface-2)' : 'transparent',
      }
    : { background: `linear-gradient(${angle}deg, oklch(0.2 0.1 ${h}) 0%, var(--bg) 100%)` }

  const initials = p.short.replace(/[^A-Za-z0-9 ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('')
  return (
    <div className="cover" data-cover style={{ aspectRatio: ar }}>
      <div className="cover-bg" style={bg}></div>
      {p.img ? null : <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: `repeating-linear-gradient(${angle - 45}deg, transparent, transparent 15px, oklch(0.7 0.15 ${h} / 0.15) 15px, oklch(0.7 0.15 ${h} / 0.15) 16px)` }}></div>}
      {/* diagonal stripe accent */}
      {p.img ? null : <div style={{
        position: 'absolute', zIndex: 1, inset: 0,
        background: `repeating-linear-gradient(${angle - 90}deg, transparent 0 22px, oklch(1 0 0 / 0.03) 22px 23px)`,
      }}></div>}
      <div className="cover-grain"></div>
      <div className="cover-scrim"></div>
      <div className="cover-shine"></div>
      {/* badges */}
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {p.tags.includes('sale') && p.was ? <span className="badge badge-sale">-{Math.round((1 - p.price / p.was) * 100)}%</span> : null}
        {p.tags.includes('new') ? <span className="badge badge-new">New</span> : null}
        {p.tags.includes('upcoming') ? <span className="badge badge-soon">Pre-order</span> : null}
      </div>
    </div>
  )
}

// ---------- Stars ----------
export function Stars({ value, size }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--primary-bright)' }}>
      <Icon name="star" size={size || 14} />
      <b style={{ fontFamily: 'var(--font-display)', fontSize: (size || 14) - 1, color: 'var(--text)' }}>{value.toFixed(1)}</b>
    </span>
  )
}

// ---------- Price ----------
export function Price({ p, size }) {
  const fs = size || 18
  const variants = Array.isArray(p.variants) ? p.variants : []
  const hasVariants = variants.length > 0

  // If the product has variants, show the variant price (range or single).
  if (hasVariants) {
    const prices = variants.map(v => Number(v.price) || 0).filter(x => x > 0)
    if (prices.length > 0) {
      const min = Math.min(...prices), max = Math.max(...prices)
      return (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: fs - 5, color: 'var(--text-dim)', fontWeight: 600 }}>From</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: fs, color: 'var(--text)' }}>
            {EGP(min)}
          </span>
          {max > min && (
            <span style={{ fontSize: fs - 5, color: 'var(--text-dim)' }}>– {EGP(max)}</span>
          )}
        </div>
      )
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: fs, color: p.was ? 'var(--primary-bright)' : 'var(--text)' }}>
        {p.price === 0 ? 'Coming soon' : EGP(p.price)}
      </span>
      {p.was && p.was > p.price ? (
        <span style={{ fontSize: fs - 4, color: 'var(--text-faint)', textDecoration: 'line-through' }}>{EGP(p.was)}</span>
      ) : null}
    </div>
  )
}

// ---------- Product card (3D tilt) ----------
export function ProductCard({ p, w }) {
  const shop = useShop()
  const ref = useRef(null)
  const [wished, setWished] = useState(shop?.wish?.includes(p.id))

  useEffect(() => { setWished(shop?.wish?.includes(p.id)) }, [shop?.wish, p.id])

  function onMove(e) {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', (-py * 9) + 'deg')
    el.style.setProperty('--ry', (px * 11) + 'deg')
    el.style.setProperty('--mx', (px * 16) + 'px')
    el.style.setProperty('--my', (py * 16) + 'px')
  }
  function onLeave() {
    const el = ref.current; if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--mx', '0px')
    el.style.setProperty('--my', '0px')
  }

  return (
    <div className="pcard" ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ width: w || 224 }} onClick={() => shop.goProduct(p.id)}>
      <div className="pcard-inner">
        <div className="pcard-cover">
          <CoverArt p={p} />
          <div className="pcard-actions">
            <button className="iconbtn pcard-wish" onClick={(e) => { e.stopPropagation(); shop.toggleWish(p.id) }}
              style={wished ? { color: 'var(--primary-bright)', borderColor: 'var(--primary)' } : null} title="Wishlist">
              <Icon name="heart" size={18} style={wished ? { fill: 'var(--primary)' } : null} />
            </button>
          </div>
          {(Array.isArray(p.variants) && p.variants.length > 0) ? (
            <button className="btn btn-primary btn-sm pcard-add" onClick={(e) => { e.stopPropagation(); shop.goProduct(p.id) }}>
              <Icon name="arrowR" size={16} /> Choose amount
            </button>
          ) : (
            <button className="btn btn-primary btn-sm pcard-add" onClick={(e) => { e.stopPropagation(); shop.addToCart(p.id) }}>
              <Icon name="cart" size={16} /> Add to cart
            </button>
          )}
        </div>
        <div className="pcard-meta">
          <div className="pcard-genre">{p.genre} · {p.platform}</div>
          <div className="pcard-title">{p.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
            <Price p={p} size={16} />
            <Stars value={p.rating} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------- Horizontal rail with arrow controls ----------
export function Rail({ title, sub, eyebrow, items, onSeeAll, cardW, scrollRef, headless }) {
  const internalRef = useRef(null)
  const ref = scrollRef || internalRef
  function scroll(dir) {
    const el = ref.current; if (!el) return
    el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: 'smooth' })
  }
  return (
    <section className="section">
      {!headless && (
        <div className="wrap">
          <div className="section-head">
            <div>
              {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
              <h2 style={{ marginTop: eyebrow ? 10 : 0 }}>{title}</h2>
              {sub ? <div className="sub">{sub}</div> : null}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {onSeeAll ? <button className="btn btn-line btn-sm" onClick={onSeeAll}>See all <Icon name="arrowR" size={15} /></button> : null}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="iconbtn" onClick={() => scroll(-1)}><Icon name="chevL" /></button>
                <button className="iconbtn" onClick={() => scroll(1)}><Icon name="chevR" /></button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="wrap" style={{ position: 'relative' }}>
        <div className="rail-track" ref={ref}>
          {items.map((p) => <ProductCard key={p.id} p={p} w={cardW} />)}
        </div>
      </div>
    </section>
  )
}
