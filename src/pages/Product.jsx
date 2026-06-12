/* Product detail page (PDP) */
import { useState, useEffect } from 'react'
import Icon from '../components/Icon.jsx'
import { CoverArt, Stars, Rail } from '../components/UI.jsx'
import { useShop, EGP } from '../context.js'
import { isYouTube, youtubeThumb, youtubeEmbed } from '../upload.js'
import { fetchProductDescription } from '../supabase.js'
import { useSeo, productJsonLd, breadcrumbJsonLd, plainText, SITE } from '../seo.js'
import { getPlatformLogo, getPlatformChipStyle } from '../components/Hero.jsx'

// Normalize legacy descriptions: imported rows often contain literal "\n"
// instead of real newlines. Replace with <br/> so they render as line breaks.
function normalizeHtml(s) {
  return (s || '').replace(/\\n/g, '<br/>')
}

function ScreenArt({ hue, seed, label }) {
  const h = hue, h2 = (hue + (seed * 30) % 90) % 360
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(120% 100% at ${20 + seed * 25}% 30%, oklch(0.55 0.19 ${h}), oklch(0.18 0.05 ${h2}))` }}></div>
      <div className="cover-grain"></div>
      <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(115deg, transparent 0 26px, oklch(1 0 0 / 0.03) 26px 27px)` }}></div>
      <div style={{ position: 'absolute', bottom: 14, left: 16, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)' }}>{label}</div>
    </div>
  )
}

export default function Product({ slug }) {
  const shop = useShop()
  const key = String(slug ?? '')
  const matches = (x) => x.slug === key || String(x.id) === key
  const p = shop.allProducts.find(matches) || shop.digital.find(matches)
  const [view, setView] = useState(0)
  const [plat, setPlat] = useState(p?.platform)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [variantId, setVariantId] = useState(p?.variants?.[0]?.id ?? null)
  const [fullDesc, setFullDesc] = useState(p?.description || '')

  useEffect(() => {
    setView(0); setPlat(p?.platform); setQty(1); setAdded(false)
    setVariantId(p?.variants?.[0]?.id ?? null)
    setFullDesc(p?.description || '')
    window.scrollTo(0, 0)
  }, [key, p?.id])

  // Lazy-load the long description — kept out of the bulk product fetch to save egress.
  useEffect(() => {
    if (!p?.id || p.description) return
    fetchProductDescription(p.id).then(d => { if (d) setFullDesc(d) })
  }, [p?.id])

  // ── SEO ── (must run before the early returns below — rules of hooks)
  const productPath = '/product/' + encodeURIComponent(p?.slug || key)
  useSeo(
    () => {
      if (!p) {
        return { title: 'Product not found', path: productPath, noindex: true }
      }
      const desc = plainText(p.blurb || fullDesc || p.description || p.title, 160)
      return {
        title: `${p.title} — ${p.platform}`,
        description: desc || `Buy ${p.title} at ${SITE.name} — fast delivery across Egypt.`,
        path: productPath,
        image: p.img || SITE.defaultImage,
        type: 'product',
        jsonLd: [
          productJsonLd(p, productPath),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: p.title, path: productPath },
          ]),
        ],
      }
    },
    [p?.id, fullDesc],
  )

  // Products still loading
  if (!p && shop.allProducts.length === 0) {
    return (
      <div className="wrap" style={{ padding: 60, textAlign: 'center' }}>
        <div className="muted">Loading product…</div>
      </div>
    )
  }
  // Loaded but not found
  if (!p) {
    return (
      <div className="wrap" style={{ padding: 60, textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)' }}>Product not found</h2>
        <p className="muted">It may have been removed or the link is wrong.</p>
        <button className="btn btn-primary" onClick={() => shop.goShop({})}>Browse all products</button>
      </div>
    )
  }

  const isDigital = p.productType === 'digital_code' || p.kind === 'Digital'
  const wished = shop.wish.includes(p.id)
  
  // For related items, if digital, show other digital items. Otherwise, show games.
  const relatedList = isDigital ? shop.digital : shop.products
  const related = relatedList.filter(x => x.id !== p.id && (isDigital ? true : (x.genre === p.genre || x.platforms.some(pl => p.platforms.includes(pl))))).slice(0, 8)

  const isHardware = p.productType === 'accessory' || p.productType === 'console'
  let ar = '3/4'
  if (isHardware) ar = '1/1'
  else if (isDigital) {
    const t = p.title.toLowerCase()
    if (t.includes('nintendo') || t.includes('eshop')) ar = '10/16'
    else if (t.includes('psn') || t.includes('playstation')) ar = '4/5'
    else ar = '4/5'
  }
  else if (p.platform === 'PS4' || p.platform === 'PS5') ar = '4/5'
  else if (p.platform === 'Switch' || p.platform === 'Switch 2') ar = '10/16'

  const hasVariants = Array.isArray(p.variants) && p.variants.length > 0
  const selectedVariant = hasVariants ? p.variants.find(v => v.id === variantId) || p.variants[0] : null
  const displayPrice = selectedVariant ? selectedVariant.price : p.price
  // Physical item with no price set → "Coming soon", not purchasable yet.
  const isComingSoon = !isDigital && (!displayPrice || displayPrice <= 0)

  function add() {
    shop.addToCart(p.id, isDigital, qty, selectedVariant || null)
    setAdded(true); setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div className="page wrap pdp-page" style={{ paddingTop: 28, paddingBottom: 60 }}>
      <div className="crumb">
        <a onClick={() => shop.goHome()}>Home</a> <Icon name="chevR" />
        {isDigital ? (
          <><a onClick={() => shop.goShop({ type: 'digital_code' })}>Digital Codes</a> <Icon name="chevR" /></>
        ) : (
          <><a onClick={() => shop.goShop({ platform: p.platform })}>{p.platform}</a> <Icon name="chevR" />
          <a onClick={() => shop.goShop({ genre: p.genre })}>{p.genre}</a> <Icon name="chevR" /></>
        )}
        <span>{p.title}</span>
      </div>

      <div className={'pdp' + (isHardware ? ' pdp-hardware' : '')}>
        <div className="pdp-gallery">
          <div className="pdp-hero" style={{
            aspectRatio: ar, position: 'relative', overflow: 'hidden',
            background: isHardware ? 'var(--surface-2)' : 'transparent',
          }}>
            {hasVariants && selectedVariant?.img && view === 0 ? (
              <img src={selectedVariant.img} alt={selectedVariant.label}
                style={{
                  width: '100%', height: '100%',
                  objectFit: isHardware ? 'contain' : 'cover',
                  padding: isHardware ? '24px' : 0,
                  boxSizing: 'border-box',
                  display: 'block', borderRadius: 'inherit',
                }} />
            ) : Array.isArray(p.screenshots) && p.screenshots.length > 0 && view > 0 ? (
              (() => {
                const url = p.screenshots[view - 1]
                if (isYouTube(url)) {
                  return (
                    <iframe
                      src={youtubeEmbed(url) + '?autoplay=0&rel=0'}
                      title="Product video"
                      style={{ width: '100%', height: '100%', border: 0, borderRadius: 'inherit' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                }
                return <img src={url} alt="" style={{
                  width: '100%', height: '100%',
                  objectFit: isHardware ? 'contain' : 'cover',
                  padding: isHardware ? '24px' : 0,
                  boxSizing: 'border-box',
                  display: 'block', borderRadius: 'inherit',
                }} />
              })()
            ) : (
              <CoverArt p={p} big />
            )}
          </div>

        </div>

        <div className="pdp-info">
          <div className="pdp-badges">
            {isDigital && <span className="badge badge-new" style={{ background: 'var(--accent)', color: '#000' }}><Icon name="code" size={12} /> Instant Delivery</span>}
            {p.tags?.includes('new') ? <span className="badge badge-new">New</span> : null}
            {p.tags?.includes('preowned') ? <span className="badge" style={{ background: '#f59e0b', color: '#000' }}>Pre-Owned</span> : null}
            {p.tags?.includes('bestseller') ? <span className="badge badge-hot"><Icon name="fire" size={12} /> Bestseller</span> : null}
            {p.was && p.was > p.price ? <span className="badge badge-sale">Save {EGP(p.was - p.price)}</span> : null}
            {p.tags?.includes('upcoming') ? <span className="badge badge-soon">Pre-order</span> : null}
          </div>

          <div className="muted pdp-subtitle">
            {isDigital ? 'Digital Code / Top-Up' : `${p.publisher || p.brand || 'CrazyGame'} · ${p.genre}`}
          </div>
          <h1 className="pdp-title">{p.title}</h1>

          <div className="pdp-meta-row">
            <Stars value={p.rating} size={17} />
            <span className="muted" style={{ fontSize: 14 }}>{p.reviews} reviews</span>
            {(() => {
              // Stock-aware availability label
              const stockNum = p.stock == null ? null : Number(p.stock)
              if (!p.price && !isDigital) {
                return (
                  <span style={{ color: 'var(--accent-bright)', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="check" size={15} /> Available to pre-order
                  </span>
                )
              }
              if (stockNum === 0) {
                return (
                  <span style={{ color: '#ef4444', fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="close" size={15} /> Sold out
                  </span>
                )
              }
              if (stockNum != null && stockNum > 0 && stockNum <= 10) {
                return (
                  <span style={{ color: '#f59e0b', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="fire" size={15} /> Only {stockNum} left
                  </span>
                )
              }
              return (
                <span style={{ color: 'var(--accent-bright)', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="check" size={15} /> In stock
                </span>
              )
            })()}
          </div>

          <div className="pdp-price-row">
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 38, color: p.was ? 'var(--primary-bright)' : 'var(--text)' }}>
              {displayPrice ? EGP(displayPrice) : 'Coming soon'}
            </span>
            {p.was && p.was > p.price && !selectedVariant ? <span style={{ fontSize: 20, color: 'var(--text-faint)', textDecoration: 'line-through' }}>{EGP(p.was)}</span> : null}
          </div>

          {hasVariants && (
            <div className="pdp-option-group">
              <div className="muted pdp-option-label">Denomination</div>
              <div className="pdp-chips">
                {p.variants.map(v => {
                  const active = selectedVariant?.id === v.id
                  return (
                    <button key={v.id}
                      className={'chip' + (active ? ' active' : '')}
                      onClick={() => setVariantId(v.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 12px 6px 6px', minWidth: 90,
                      }}>
                      {v.img ? (
                        <span style={{
                          width: 36, height: 36, borderRadius: 6, flexShrink: 0,
                          background: `#000 url(${v.img}) center/cover no-repeat`,
                          border: '1px solid rgba(255,255,255,0.15)',
                        }} />
                      ) : null}
                      <span style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                        gap: 1, padding: v.img ? 0 : '2px 4px',
                      }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{v.label}</span>
                        <span style={{ fontSize: 11.5, opacity: 0.8 }}>{EGP(v.price)}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {(() => {
            const loyalty = shop.siteSettings?.loyalty || { enabled: true, multiplier: 0.2, label: 'Crazy Points' }
            const earnFrom = selectedVariant?.price ?? p.price
            if (!loyalty.enabled || !earnFrom) return <div style={{ marginBottom: 22 }}></div>
            const points = Math.round(Number(earnFrom) * Number(loyalty.multiplier || 0))
            if (points <= 0) return <div style={{ marginBottom: 22 }}></div>
            return (
              <div className="pdp-loyalty-row">
                <Icon name="star" size={15} /> Earn {points.toLocaleString()} {loyalty.label || 'Crazy Points'}
              </div>
            )
          })()}

          <div className="pdp-option-group" style={{ marginBottom: 20 }}>
            {isDigital ? (
              <div className="muted pdp-option-label">Region / Type</div>
            ) : (
              <div className="muted pdp-option-label">Platform</div>
            )}
            <div className="pdp-chips" style={{ gap: 9 }}>
              {isDigital ? (
                <button className="chip active">{p.tier || 'Standard'}</button>
              ) : (
                p.platforms?.map(pl => {
                  const active = plat === pl
                  const logo = getPlatformLogo(pl)
                  const chipStyle = getPlatformChipStyle(pl)
                  const inactiveFilter = shop.theme === 'dark' ? 'brightness(0) invert(1)' : 'brightness(0)'
                  
                  return (
                    <button key={pl}
                      className={'chip' + (active ? ' active' : '')}
                      onClick={() => setPlat(pl)}
                      style={active ? {
                        background: chipStyle.background,
                        color: chipStyle.color,
                        border: chipStyle.border || `1px solid ${chipStyle.background}`,
                      } : {
                        background: 'var(--surface-2)',
                        borderColor: 'var(--border-soft)',
                      }}>
                      {logo ? (
                        <img src={logo} alt={pl}
                          style={{
                            height: '16px',
                            width: 'auto',
                            objectFit: 'contain',
                            filter: active ? chipStyle.logoFilter : inactiveFilter,
                            opacity: active ? 0.95 : 0.6,
                            transition: 'all 0.2s',
                          }} />
                      ) : (
                        pl
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {(() => {
            // Stock-aware qty controls. Stock is null => unlimited. 0 => sold out.
            const stockLimit = p.stock == null ? Infinity : Math.max(0, Number(p.stock) || 0)
            const isSoldOut = stockLimit === 0 && p.stock != null
            const hardCap = isFinite(stockLimit) ? stockLimit : 99
            const safeQty = Math.min(Math.max(1, qty), hardCap)
            if (safeQty !== qty) setTimeout(() => setQty(safeQty), 0)
            const atMax = qty >= hardCap
            const blocked = isSoldOut || isComingSoon

            return (
              <>
                <div className="pdp-actions-row">
                  <div className="qty">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={blocked || qty <= 1}><Icon name="minus" size={15} /></button>
                    <span>{qty}</span>
                    <button onClick={() => setQty(q => Math.min(hardCap, q + 1))} disabled={blocked || atMax}><Icon name="plus" size={15} /></button>
                  </div>
                  <button className="btn btn-primary btn-lg" style={{ flex: 1, opacity: blocked ? 0.55 : 1 }} onClick={add} disabled={blocked}>
                    {added ? <><Icon name="check" size={19} /> Added!</> : <><Icon name="cart" size={19} /> {isSoldOut ? 'Sold out' : isComingSoon ? 'Coming soon' : 'Add to cart'}</>}
                  </button>
                  <button className="iconbtn" style={{ width: 52, height: 52, ...(wished ? { color: 'var(--primary-bright)', borderColor: 'var(--primary)' } : {}) }} onClick={() => shop.toggleWish(p.id)}>
                    <Icon name="heart" size={21} style={wished ? { fill: 'var(--primary)' } : null} />
                  </button>
                </div>
                <button className="btn btn-accent btn-lg btn-block" disabled={blocked}
                  style={{ marginBottom: 24, opacity: blocked ? 0.55 : 1 }}
                  onClick={() => { shop.addToCart(p.id, isDigital, qty, selectedVariant || null, { openDrawer: false }); shop.goCart() }}>
                  <Icon name="bolt" size={18} /> Buy it now
                </button>
              </>
            )
          })()}

          <div className="trust-row">
            {isDigital ? (
              <>
                <div className="trust-item"><Icon name="code" size={18} /> Instant Email Delivery</div>
                <div className="trust-item"><Icon name="shield" size={18} /> Official & Secure Code</div>
                <div className="trust-item"><Icon name="check" size={18} /> 24/7 Digital Support</div>
              </>
            ) : (
              <>
                <div className="trust-item"><Icon name="truck" size={18} /> Free delivery over EGP 1,500</div>
                <div className="trust-item"><Icon name="shield" size={18} /> Genuine sealed copy</div>
                <div className="trust-item"><Icon name="check" size={18} /> Cash on delivery</div>
              </>
            )}
          </div>

        </div>
      </div>

      <div className="about-section">
        <div className="about-content">
          <h2 style={{ marginBottom: 24 }}>{isDigital ? 'About this code' : 'About this game'}</h2>
          <div className="about-text">
            {isDigital ? (
              <>
                <p>{p.blurb || p.description || `Instantly top up your account with this official ${p.title}. Delivered directly to your email upon purchase.`}</p>
                <p>This code is verified and safe to redeem directly on the official store.</p>
                <h3 style={{ marginTop: 30, marginBottom: 12, fontSize: 18 }}>How to redeem:</h3>
                <ol style={{ paddingLeft: 20, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                  <li>Complete your purchase and receive the code via email.</li>
                  <li>Log in to your account on your console or official website.</li>
                  <li>Go to the "Redeem Code" section and enter your unique key.</li>
                  <li>Your funds or subscription will be activated instantly!</li>
                </ol>
              </>
            ) : (
              <>
                {p.blurb && <div className="rte-out" dangerouslySetInnerHTML={{ __html: normalizeHtml(p.blurb) }} />}
                {fullDesc ? (
                  <div className="rte-out" dangerouslySetInnerHTML={{ __html: normalizeHtml(fullDesc) }} />
                ) : !p.blurb ? (
                  <>
                    <p>Immerse yourself in the incredible world of {p.title}. Master your skills, explore stunning environments, and experience a gripping journey that will keep you on the edge of your seat from start to finish.</p>
                    <p>Featuring breathtaking visuals, advanced gameplay mechanics, and a compelling storyline, this title pushes the boundaries of modern gaming.</p>
                  </>
                ) : null}

                {(() => {
                  const shots = Array.isArray(p.screenshots) ? p.screenshots.slice(0, 3) : []
                  if (!shots.length) return null
                  return (
                    <>
                      <h3 style={{ marginTop: 40, marginBottom: 20 }}>Screenshots & Media</h3>
                      <div className="screenshots-grid">
                        {shots.map((url, idx) => {
                          const yt = isYouTube(url)
                          const thumb = yt ? youtubeThumb(url) : url
                          const isWide = idx === 2 && shots.length === 3
                          return (
                            <div key={url + idx} className={'sg-item' + (isWide ? ' sg-wide' : '')} style={{ aspectRatio: isWide ? '21/9' : '16/9', position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius)', background: '#000' }}>
                              {yt ? (
                                <iframe
                                  src={youtubeEmbed(url) + '?rel=0'}
                                  title={`Media ${idx + 1}`}
                                  style={{ width: '100%', height: '100%', border: 0 }}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : (
                                <img src={thumb} alt={`Screenshot ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )
                })()}
              </>
            )}
          </div>
        </div>

        <div className="details-box">
          <h4 style={{ margin: '0 0 16px', color: 'var(--primary-bright)' }}>{isDigital ? 'Code Details' : 'Game Details'}</h4>
          {isDigital ? (
            <>
              <div className="spec-row"><span className="k">Type</span><span className="v">Digital Code</span></div>
              <div className="spec-row"><span className="k">Delivery</span><span className="v">Instant Email</span></div>
              <div className="spec-row"><span className="k">Region</span><span className="v">{p.platform || 'Global'}</span></div>
            </>
          ) : (
            <>
              <div className="spec-row"><span className="k">Platform</span><span className="v">{p.platforms?.join(', ')}</span></div>
              <div className="spec-row"><span className="k">Genre</span><span className="v">{p.genre}</span></div>
              <div className="spec-row"><span className="k">Publisher</span><span className="v">{p.publisher || p.brand || '—'}</span></div>
              <div className="spec-row"><span className="k">Release Year</span><span className="v">{p.year}</span></div>
              <div className="spec-row"><span className="k">Edition</span><span className="v">Standard</span></div>
            </>
          )}
        </div>
      </div>

      {related.length ? <Rail eyebrow="You might also like" title="Related games" items={related} /> : null}

      {/* Mobile-only sticky buy bar */}
      {(() => {
        const stockLimit = p.stock == null ? Infinity : Math.max(0, Number(p.stock) || 0)
        const isSoldOut = stockLimit === 0 && p.stock != null
        const hardCap = isFinite(stockLimit) ? stockLimit : 99
        const blocked = isSoldOut || isComingSoon
        return (
          <div className="pdp-sticky-bar">
            <div className="qty">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={blocked || qty <= 1}><Icon name="minus" size={15} /></button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => Math.min(hardCap, q + 1))} disabled={blocked || qty >= hardCap}><Icon name="plus" size={15} /></button>
            </div>
            <button className="btn btn-primary" style={{ flex: 1, opacity: blocked ? 0.55 : 1 }} onClick={add} disabled={blocked}>
              {added ? <><Icon name="check" size={18} /> Added!</> : <><Icon name="cart" size={18} /> {isSoldOut ? 'Sold out' : isComingSoon ? 'Coming soon' : `Add · ${EGP(displayPrice)}`}</>}
            </button>
          </div>
        )
      })()}
    </div>
  )
}
