/* Footer */
import { useState } from 'react'
import Icon from './Icon.jsx'
import { useShop } from '../context.js'
import logoImg from '../assets/Crazy Game No Background.png'

export default function Footer() {
  const shop = useShop()
  const [sub, setSub] = useState(false)
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="logo" style={{ marginBottom: 16 }}>
              <img src={logoImg} alt="CrazyGame" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
            </div>
            <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.6, maxWidth: '34ch' }}>
              Egypt's trusted store for games, consoles, memberships and digital cards. Fast, reliable, and made for every gamer.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              {['IG', 'X', 'YT', 'TT'].map(s => (
                <a key={s} className="iconbtn" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12 }}>{s}</a>
              ))}
            </div>
          </div>
          <div>
            <h6>Shop</h6>
            {shop.platforms.map(pl => <a key={pl.key} className="footer-link" onClick={() => shop.goShop({ platform: pl.key })}>{pl.name}</a>)}
          </div>
          <div>
            <h6>Genres</h6>
            {shop.genres.slice(0, 6).map(g => <a key={g} className="footer-link" onClick={() => shop.goShop({ genre: g })}>{g}</a>)}
          </div>
          <div>
            <h6>Company</h6>
            <a className="footer-link" onClick={() => shop.goBlog()}>Blog</a>
            <a className="footer-link">About us</a>
            <a className="footer-link">Contact</a>
            <a className="footer-link" onClick={() => shop.goShop({ sale: true })}>Today's deals</a>
            <a className="footer-link">Track order</a>
          </div>
          <div>
            <h6>Stay in the game</h6>
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>Drops, deals and pre-order alerts. No spam.</p>
            <div className="newsletter">
              <input placeholder="you@email.com" />
              <button className="btn btn-primary" onClick={() => setSub(true)}>{sub ? <Icon name="check" size={18} /> : 'Join'}</button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
              {['VISA', 'MASTERCARD', 'MEEZA', 'FAWRY', 'COD'].map(b => <span key={b} className="pay-badge">{b}</span>)}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 CrazyGame. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 22 }}>
            <a className="footer-link" style={{ padding: 0 }}>Privacy</a>
            <a className="footer-link" style={{ padding: 0 }}>Terms</a>
            <a className="footer-link" style={{ padding: 0 }}>Returns</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
