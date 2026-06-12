/* Header: logo, nav + mega menu, live search, theme toggle, wishlist, cart */
import { useState, useRef, useEffect } from 'react'
import Icon from './Icon.jsx'
import { useShop, EGP } from '../context.js'
import { CoverArt } from './UI.jsx'

import logoImg from '../assets/Crazy Game No Background.png'

function Logo({ onClick }) {
  return (
    <div className="logo" onClick={onClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
      <img src={logoImg} alt="CrazyGame" style={{ height: 64, width: 'auto', objectFit: 'contain' }} />
    </div>
  )
}

function Search({ onClose, isOpen }) {
  const shop = useShop()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      inputRef.current?.blur()
      setOpen(false)
      setQ('')
    }
  }, [isOpen])

  const results = q.length > 1
    ? shop.products.filter(p => (p.title + ' ' + p.genre + ' ' + p.platform).toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : []

  useEffect(() => {
    function onDoc(e) { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  function submit() {
    if (q.trim()) { shop.goShop({ q: q.trim() }); setOpen(false); if(onClose) onClose() }
  }

  return (
    <div ref={boxRef} style={{ flex: 1, position: 'relative', width: '100%' }} className="search-wrap">
      <div className="search-box" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <Icon name="search" size={19} />
        <input ref={inputRef} value={q} placeholder="Search 500+ games, consoles & codes…"
          onChange={(e) => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
            if (e.key === 'Escape' && onClose) onClose()
          }} />
        {q ? <button onClick={() => { setQ('') }} style={{ color: 'var(--text-faint)', display: 'grid' }}><Icon name="close" size={16} /></button> : null}
      </div>
      {open && results.length > 0 ? (
        <div className="search-results">
          {results.map(p => (
            <div key={p.id} className="sr-item" onClick={() => { shop.goProduct(p.id); setOpen(false); setQ('') }}>
              <div className="sr-thumb"><CoverArt p={p} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-display)' }}>{p.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>{p.genre} · {p.platform}</div>
              </div>
              <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--primary-bright)' }}>
                {p.price ? EGP(p.price) : 'Soon'}
              </div>
            </div>
          ))}
          <div style={{ padding: '10px 9px 4px' }}>
            <button className="btn btn-ghost btn-sm btn-block" onClick={submit}>See all results for "{q}"</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function Header() {
  const shop = useShop()
  const { platforms, genres } = shop
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="header">
      <div className="wrap header-inner">
        <Logo onClick={() => shop.goHome()} />
        <nav className="nav">
          <a className={'nav-item' + (shop.route.name === 'home' ? ' active' : '')} onClick={() => shop.goHome()}>Home</a>

          <div className="nav-item has-mega" style={{ position: 'relative' }}>
            Games <Icon name="chevD" size={15} />
            <div className="mega">
              <div>
                <h5>By platform</h5>
                {platforms.map(pl => (
                  <a key={pl.key} className="mega-link" onClick={() => shop.goShop({ platform: pl.key, type: 'game' })}>
                    {pl.name}
                  </a>
                ))}
              </div>
              <div>
                <h5>Pre-Owned</h5>
                {platforms.map(pl => (
                  <a key={pl.key} className="mega-link" onClick={() => shop.goShop({ platform: pl.key, type: 'game', preowned: true })}>
                    {pl.name}
                  </a>
                ))}
              </div>
              <div>
                <h5>By genre</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                  {genres.slice(0, 8).map(g => (
                    <a key={g} className="mega-link" onClick={() => shop.goShop({ genre: g, type: 'game' })}>{g}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="nav-item has-mega" style={{ position: 'relative' }}>
            Consoles & Accessories <Icon name="chevD" size={15} />
            <div className="mega">
              <div>
                <h5>Shop consoles</h5>
                {platforms.map(pl => (
                  <a key={pl.key} className="mega-link" onClick={() => shop.goShop({ platform: pl.key, type: 'console' })}>
                    {pl.name} Consoles
                  </a>
                ))}
                <a className="mega-link" onClick={() => shop.goShop({ type: 'console' })}>All Consoles</a>
              </div>
              <div>
                <h5>Shop accessories</h5>
                {platforms.map(pl => (
                  <a key={pl.key} className="mega-link" onClick={() => shop.goShop({ platform: pl.key, type: 'accessory' })}>
                    {pl.name} Accessories
                  </a>
                ))}
                <a className="mega-link" onClick={() => shop.goShop({ type: 'accessory' })}>All Accessories</a>
              </div>
            </div>
          </div>

          <div className="nav-item has-mega" style={{ position: 'relative' }}>
            Digital Codes <Icon name="chevD" size={15} />
            <div className="mega" style={{ width: 340, padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <a onClick={() => shop.goShop({ type: 'digital_code', q: 'PSN' })} style={{ display: 'block', position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', aspectRatio: '3/4', boxShadow: 'var(--shadow-card)' }}>
                  <img src="https://jbggnkegzwzvnkeaumii.supabase.co/storage/v1/object/public/product-images/psn-lebnan-store.webp" alt="PSN" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="hover-zoom" />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 60%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: 12, left: 12, color: '#fff', fontWeight: 800, fontSize: 15, lineHeight: 1.1, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>PlayStation<br/>Network</div>
                </a>
                <a onClick={() => shop.goShop({ type: 'digital_code', q: 'eShop' })} style={{ display: 'block', position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', aspectRatio: '3/4', boxShadow: 'var(--shadow-card)' }}>
                  <img src="https://jbggnkegzwzvnkeaumii.supabase.co/storage/v1/object/public/product-images/nintendo-eshop-10.webp" alt="Eshop" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="hover-zoom" />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 60%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: 12, left: 12, color: '#fff', fontWeight: 800, fontSize: 15, lineHeight: 1.1, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Nintendo<br/>eShop</div>
                </a>
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-soft)' }}>
                <button className="btn btn-ghost btn-sm btn-block" onClick={() => shop.goShop({ type: 'digital_code' })}>View all digital codes</button>
              </div>
            </div>
          </div>
          <a className="nav-item" onClick={() => shop.goBlog()}>Blog</a>
        </nav>

        <div className="header-actions">
          <button className="iconbtn" onClick={() => setSearchOpen(!searchOpen)} title="Search">
            <Icon name="search" />
          </button>
          <button className="iconbtn" onClick={shop.toggleTheme} title="Toggle theme">
            <Icon name={shop.theme === 'dark' ? 'sun' : 'moon'} />
          </button>
          <button className="iconbtn" onClick={() => shop.goWishlist()} title="Wishlist">
            <Icon name="heart" />
            {shop.wish.length ? <span className="bubble accent">{shop.wish.length}</span> : null}
          </button>
          <button className="iconbtn" onClick={() => shop.openCart()} title="Cart">
            <Icon name="cart" />
            {shop.cartCount ? <span className="bubble">{shop.cartCount}</span> : null}
          </button>
          {shop.isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={() => shop.goDashboard()}
              title="Admin dashboard"
              style={{ padding: '8px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              <Icon name="bolt" size={14} /> Admin
            </button>
          )}
          {shop.user ? (
            <button className="iconbtn" onClick={() => shop.goAccount()} title="My account"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', width: 'auto' }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-bright)',
                color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13,
              }}>{(shop.user.email || '?')[0].toUpperCase()}</span>
            </button>
          ) : (
            <button className="iconbtn" onClick={() => shop.goLogin()} title="Sign in">
              <Icon name="user" />
            </button>
          )}
          <button className="iconbtn mobile-only" onClick={() => shop.goShop({})} title="Menu" style={{ display: 'none' }}>
            <Icon name="menu" />
          </button>
        </div>
      </div>

      <div className="sub-header" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-sunken)', padding: '8px 0' }}>
        <div className="wrap" style={{ display: 'flex', gap: 24, fontSize: 13, fontWeight: 700, alignItems: 'center' }}>
          <a onClick={() => shop.goShop({ sale: true })} style={{ cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
            <Icon name="tag" size={14} /> Sale
          </a>
          <a onClick={() => shop.goRequest()} style={{ cursor: 'pointer', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
            <Icon name="bolt" size={14} /> Request Game
          </a>
          <a onClick={() => shop.goContact()} style={{ cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
            <Icon name="code" size={14} /> Contact us
          </a>
          <a onClick={() => shop.goAbout()} style={{ cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
            <Icon name="check" size={14} /> About us
          </a>
          {shop.isAdmin && (
            <a onClick={() => shop.goDashboard()} style={{ cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '.05em', marginLeft: 'auto' }}>
              <Icon name="bolt" size={14} /> Admin Dashboard
            </a>
          )}
        </div>
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateRows: searchOpen ? '1fr' : '0fr',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: searchOpen ? 1 : 0,
        pointerEvents: searchOpen ? 'auto' : 'none',
        background: 'var(--surface)', 
        boxShadow: searchOpen ? 'var(--shadow-pop)' : 'none',
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ padding: '12px 0', borderTop: '1px solid var(--border)' }}>
            <div className="wrap">
              <Search isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
