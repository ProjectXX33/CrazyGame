/* Mobile navigation drawer — slides in from the left on ≤760px.
   Reuses the .drawer-scrim / .drawer pattern (see components.css) with a
   left-variant. Gives phone users the full category navigation that the
   desktop mega-menus provide. */
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon.jsx'
import { useShop } from '../context.js'

function Section({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mnav-section">
      <button className="mnav-row mnav-toggle" onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        <Icon name="chevD" size={16} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>
      {open && <div className="mnav-sub">{children}</div>}
    </div>
  )
}

export default function MobileNav({ open, onClose }) {
  const shop = useShop()
  const { platforms, genres } = shop

  // Lock body scroll while the drawer is open + close on Escape.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  // Navigate then close the drawer.
  const go = (fn) => () => { fn(); onClose() }

  // Portal to body — the .header has backdrop-filter, which would otherwise
  // become the containing block for this position:fixed drawer and clip it.
  return createPortal(
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer drawer-left mnav" role="dialog" aria-label="Menu">
        <div className="drawer-head">
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>Menu</strong>
          <button className="iconbtn" onClick={onClose} aria-label="Close menu"><Icon name="close" /></button>
        </div>

        <div className="drawer-body" style={{ padding: '8px 0' }}>
          <button className="mnav-row" onClick={go(() => shop.goHome())}>Home</button>
          <button className="mnav-row" onClick={go(() => shop.goShop({}))}>Shop all</button>

          <Section title="Games">
            <div className="mnav-grouplabel">By platform</div>
            {platforms.map(pl => (
              <button key={pl.key} className="mnav-row sub" onClick={go(() => shop.goShop({ platform: pl.key, type: 'game' }))}>{pl.name}</button>
            ))}
            <div className="mnav-grouplabel">By genre</div>
            <div className="mnav-genres">
              {genres.slice(0, 10).map(g => (
                <button key={g} className="mnav-chip" onClick={go(() => shop.goShop({ genre: g, type: 'game' }))}>{g}</button>
              ))}
            </div>
          </Section>

          <Section title="Consoles & Accessories">
            <div className="mnav-grouplabel">Consoles</div>
            {platforms.map(pl => (
              <button key={pl.key} className="mnav-row sub" onClick={go(() => shop.goShop({ platform: pl.key, type: 'console' }))}>{pl.name} Consoles</button>
            ))}
            <button className="mnav-row sub" onClick={go(() => shop.goShop({ type: 'console' }))}>All Consoles</button>
            <div className="mnav-grouplabel">Accessories</div>
            <button className="mnav-row sub" onClick={go(() => shop.goShop({ type: 'accessory' }))}>All Accessories</button>
          </Section>

          <button className="mnav-row" onClick={go(() => shop.goShop({ type: 'digital_code' }))}>Digital Codes</button>
          <button className="mnav-row" onClick={go(() => shop.goBlog())}>Blog</button>

          <div className="mnav-divider" />

          <button className="mnav-row accent" onClick={go(() => shop.goShop({ sale: true }))}><Icon name="tag" size={16} /> Sale</button>
          <button className="mnav-row" onClick={go(() => shop.goRequest())}><Icon name="bolt" size={16} /> Request a game</button>
          <button className="mnav-row" onClick={go(() => shop.goContact())}>Contact us</button>
          <button className="mnav-row" onClick={go(() => shop.goAbout())}>About us</button>

          <div className="mnav-divider" />

          {shop.user
            ? <button className="mnav-row" onClick={go(() => shop.goAccount())}><Icon name="user" size={16} /> My account</button>
            : <button className="mnav-row" onClick={go(() => shop.goLogin())}><Icon name="user" size={16} /> Sign in</button>}
          <button className="mnav-row" onClick={go(() => shop.goWishlist())}>
            <Icon name="heart" size={16} /> Wishlist{shop.wish.length ? ` (${shop.wish.length})` : ''}
          </button>
          {shop.isAdmin && (
            <button className="mnav-row" onClick={go(() => shop.goDashboard())}><Icon name="bolt" size={16} /> Admin dashboard</button>
          )}
          <button className="mnav-row" onClick={() => shop.toggleTheme()}>
            <Icon name={shop.theme === 'dark' ? 'sun' : 'moon'} size={16} /> {shop.theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </aside>
    </>,
    document.body,
  )
}
