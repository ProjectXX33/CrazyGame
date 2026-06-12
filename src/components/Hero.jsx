/* Hero — cinematic featured-game carousel with parallax */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Icon from './Icon.jsx'
import { useShop, EGP } from '../context.js'
import { CoverArt } from './UI.jsx'
import heroImgDark from '../assets/herosection.png'
import heroImgLight from '../assets/herosectionwhite.png'

function CustomImageHero({ ci }) {
  const shop = useShop()
  const handleClick = () => {
    if (ci.linkType === 'product' && ci.linkValue) shop.goProduct(ci.linkValue)
    else if (ci.linkType === 'shop') shop.goShop({})
    else if (ci.linkType === 'url' && ci.linkValue) window.open(ci.linkValue, '_blank', 'noopener')
  }
  const clickable = ci.linkType !== 'none' && (ci.linkValue || ci.linkType === 'shop')
  return (
    <section className="hero" style={{
      position: 'relative', minHeight: 560, overflow: 'hidden',
      cursor: clickable && !ci.ctaText ? 'pointer' : 'default',
    }} onClick={clickable && !ci.ctaText ? handleClick : undefined}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${ci.url})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }} />
      {(ci.headline || ci.subtext || ci.ctaText) && (
        <>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.15) 55%, transparent 80%)',
          }} />
          <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>
            <div className="wrap">
              <div style={{ maxWidth: 620, color: '#fff', padding: '60px 0' }}>
                {ci.headline && (
                  <h1 className="rise" style={{ color: '#fff', textShadow: '0 2px 20px rgba(0,0,0,.5)' }}>{ci.headline}</h1>
                )}
                {ci.subtext && (
                  <p className="hero-blurb rise" style={{ color: 'rgba(255,255,255,.9)', animationDelay: '.15s' }}>{ci.subtext}</p>
                )}
                {ci.ctaText && clickable && (
                  <div className="hero-cta rise" style={{ animationDelay: '.25s' }}>
                    <button className="btn btn-primary btn-lg" onClick={handleClick}>{ci.ctaText}</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default function Hero({ slides: featuredSlides }) {
  const shop = useShop()
  const heroSettings = shop.siteSettings?.hero
  const heroMode = heroSettings?.mode || 'carousel'

  if (heroMode === 'custom-image' && heroSettings?.customImage?.url) {
    return <CustomImageHero ci={heroSettings.customImage} />
  }
  // 'carousel' or 'mixed' both render through CarouselHero — mixed adds the
  // custom image as the first slide alongside the product slides.
  return <CarouselHero featuredSlides={featuredSlides} heroSettings={heroSettings} />
}

function CarouselHero({ featuredSlides, heroSettings }) {
  const shop = useShop()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const wrapRef = useRef(null)

  // Pick slides: admin-picked IDs > passed-in featured > random with images
  const slides = useMemo(() => {
    let productSlides = []
    const adminIds = heroSettings?.featuredProductIds || []
    if (adminIds.length > 0) {
      const picked = adminIds.map(id => shop.products.find(p => p.id === id)).filter(Boolean)
      if (picked.length > 0) productSlides = picked.slice(0, 8)
    }
    if (productSlides.length === 0 && featuredSlides && featuredSlides.length > 0) {
      productSlides = featuredSlides.slice(0, 8)
    }
    if (productSlides.length === 0) {
      const withImg = shop.products.filter(p => p.img)
      if (withImg.length > 0) productSlides = [...withImg].sort(() => Math.random() - 0.5).slice(0, 8)
    }

    // Mixed mode → prepend a synthetic custom-image slide
    const mode = heroSettings?.mode || 'carousel'
    if (mode === 'mixed' && heroSettings?.customImage?.url) {
      const customSlide = { _custom: true, _ci: heroSettings.customImage, id: '__customImage__' }
      return [customSlide, ...productSlides].slice(0, 9)
    }
    return productSlides
  }, [featuredSlides, shop.products, heroSettings])

  const n = slides.length

  const next = useCallback(() => setI(v => (v + 1) % Math.max(n, 1)), [n])
  const prev = () => setI(v => (v - 1 + Math.max(n, 1)) % Math.max(n, 1))

  useEffect(() => {
    if (paused || n === 0) return
    const t = setTimeout(next, 6000)
    return () => clearTimeout(t)
  }, [i, paused, next, n])

  function onMove(e) {
    const el = wrapRef.current; if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--px', px)
    el.style.setProperty('--py', py)
  }

  // Loading state — show skeleton hero while products load
  if (n === 0) {
    const heroBg = shop.theme === 'light' ? heroImgLight : heroImgDark
    return (
      <section className="hero" style={{ minHeight: 560, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Background switches with theme */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.6,
        }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎮</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>Loading games…</div>
        </div>
      </section>
    )
  }

  return (
    <section className="hero" ref={wrapRef} onMouseMove={onMove}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false)
        if (wrapRef.current) {
          wrapRef.current.style.setProperty('--px', 0)
          wrapRef.current.style.setProperty('--py', 0)
        }
      }}>
      {slides.map((p, idx) => {
        const active = idx === i

        // Custom-image slide (only present in mixed mode)
        if (p._custom) {
          const ci = p._ci
          const clickable = ci.linkType !== 'none' && (ci.linkValue || ci.linkType === 'shop')
          const handleClick = () => {
            if (ci.linkType === 'product' && ci.linkValue) shop.goProduct(ci.linkValue)
            else if (ci.linkType === 'shop') shop.goShop({})
            else if (ci.linkType === 'url' && ci.linkValue) window.open(ci.linkValue, '_blank', 'noopener')
          }
          return (
            <div className={'hero-slide' + (active ? ' active' : '')} key={p.id} aria-hidden={!active}>
              <div className="hero-bg" style={{
                backgroundColor: '#000',
                backgroundImage: `url(${ci.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.15) 55%, transparent 80%)',
                }} />
              </div>
              <div className="hero-grain"></div>
              <div className="hero-vignette"></div>
              <div className="hero-content">
                <div className="wrap">
                  <div style={{ maxWidth: 620, color: '#fff', padding: '60px 0' }}>
                    {active ? <>
                      {ci.headline && <h1 className="rise" style={{ color: '#fff', textShadow: '0 2px 20px rgba(0,0,0,.5)', animationDelay: '.05s' }}>{ci.headline}</h1>}
                      {ci.subtext && <p className="hero-blurb rise" style={{ color: 'rgba(255,255,255,.9)', animationDelay: '.15s' }}>{ci.subtext}</p>}
                      {ci.ctaText && clickable && (
                        <div className="hero-cta rise" style={{ animationDelay: '.25s' }}>
                          <button className="btn btn-primary btn-lg" onClick={handleClick}>{ci.ctaText}</button>
                        </div>
                      )}
                    </> : null}
                  </div>
                </div>
              </div>
            </div>
          )
        }

        const h = p.hue ?? 230
        const h2 = (h + 42) % 360
        const tags = Array.isArray(p.tags) ? p.tags : []
        const isLight = shop.theme === 'light'
        const heroBg = isLight ? heroImgLight : heroImgDark
        return (
          <div className={'hero-slide' + (active ? ' active' : '')} key={p.id} aria-hidden={!active}>

            {/* ── Background image switches with theme ── */}
            <div className="hero-bg" style={{
              backgroundColor: 'var(--bg)',
              backgroundImage: `url(${heroBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}>
              {/* Per-slide color tint — subtle in light mode */}
              <div style={{
                position: 'absolute', inset: 0,
                background: isLight
                  ? `radial-gradient(ellipse 80% 100% at 60% 50%, oklch(0.85 0.06 ${h} / 0.25), oklch(0.95 0.01 ${h2} / 0.1))`
                  : `radial-gradient(ellipse 80% 100% at 60% 50%, oklch(0.3 0.18 ${h} / 0.55), oklch(0.08 0.05 ${h2} / 0.85))`,
              }} />
              {/* Left-side vignette for text readability — very light in light mode */}
              <div style={{
                position: 'absolute', inset: 0,
                background: isLight
                  ? 'linear-gradient(90deg, oklch(1 0 0 / 0.35) 0%, transparent 60%)'
                  : 'linear-gradient(90deg, oklch(0.06 0 0 / 0.75) 0%, transparent 55%)',
              }} />
            </div>
            <div className="hero-grain"></div>
            <div className="hero-vignette"></div>

            <div className="hero-content">
              <div className="wrap">
                <div className="hero-grid">
                  <div style={{ transform: 'translateX(calc(var(--px,0)*-14px))' }}>
                    {active ? <>
                      <div className="hero-eyebrow rise" style={{ animationDelay: '.05s' }}>
                        <span className="eyebrow">
                          {tags.includes('upcoming') ? 'Pre-order now'
                            : tags.includes('sale') ? 'Limited-time deal'
                            : tags.includes('new') ? 'Just landed'
                            : 'Featured'}
                        </span>
                        <span style={{ height: 14, width: 1, background: 'var(--border)' }}></span>
                        <span className="faint" style={{ fontSize: 13, fontWeight: 600 }}>{p.brand} · {p.year}</span>
                      </div>
                      <h1 className="rise" style={{ animationDelay: '.12s' }}>{p.title}</h1>
                      <p className="hero-blurb rise" style={{ animationDelay: '.2s' }}>{p.blurb || p.short || ''}</p>

                      <div className="hero-platchips rise" style={{ animationDelay: '.26s' }}>
                        <span className="faint" style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', alignSelf: 'center', whiteSpace: 'nowrap' }}>Available on</span>
                        {(p.platforms || [p.platform]).filter(Boolean).map(pl => <span key={pl} className="plat" style={{ background: 'oklch(1 0 0 / 0.12)' }}>{pl}</span>)}
                      </div>

                      {p.price ? (
                        <div className="hero-price rise" style={{ animationDelay: '.3s' }}>
                          <span className="now">{EGP(p.price)}</span>
                          {p.was && p.was > p.price ? <span className="was">{EGP(p.was)}</span> : null}
                          {p.was && p.was > p.price ? <span className="badge badge-sale" style={{ alignSelf: 'center' }}>Save {EGP(p.was - p.price)}</span> : null}
                        </div>
                      ) : null}

                      <div className="hero-cta rise" style={{ animationDelay: '.36s' }}>
                        <button className="btn btn-primary btn-lg" onClick={() => shop.addToCart(p.id)}>
                          <Icon name="cart" size={19} /> {tags.includes('upcoming') ? 'Pre-order' : 'Add to cart'}
                        </button>
                        <button className="btn btn-line btn-lg" onClick={() => shop.goProduct(p.id)}>View details</button>
                      </div>
                    </> : null}
                  </div>

                  <div className="hero-art">
                    <div className="hero-art-card" style={{ transform: `rotateY(calc(-12deg + var(--px,0)*16deg)) rotateX(calc(4deg + var(--py,0)*-12deg))` }}>
                      <CoverArt p={p} big />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      <div className="hero-dots">
        {slides.map((_, idx) => (
          <button key={idx} className={'hero-dot' + (idx === i ? ' active' : '')} onClick={() => setI(idx)} aria-label={'Slide ' + (idx + 1)}></button>
        ))}
      </div>
      <div className="hero-arrows">
        <button className="iconbtn" onClick={prev}><Icon name="chevL" /></button>
        <button className="iconbtn" onClick={next}><Icon name="chevR" /></button>
      </div>
    </section>
  )
}
