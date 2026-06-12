/* Footer */
import { useState } from 'react'
import Icon from './Icon.jsx'
import { useShop } from '../context.js'
import logoImg from '../assets/Crazy Game No Background.png'

export default function Footer() {
  const shop = useShop()
  const [sub, setSub] = useState(false)
  const [activeTab, setActiveTab] = useState(null) // 'privacy' | 'terms' | 'returns' | null

  const getPolicyContent = () => {
    switch (activeTab) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          body: (
            <>
              <p>At CrazyGame, we respect your privacy and are committed to protecting your personal data.</p>
              <h5>1. Information We Collect</h5>
              <p>We collect your email address, phone number, and shipping address when you place an order. This information is used solely to process and deliver your purchases.</p>
              <h5>2. Secure Payments</h5>
              <p>All online transactions are processed through encrypted, industry-standard payment gateways. We never store your credit or debit card numbers on our servers.</p>
              <h5>3. Data Sharing</h5>
              <p>We do not sell, trade, or share your personal information with third parties, except as required to fulfill delivery services.</p>
            </>
          )
        }
      case 'terms':
        return {
          title: 'Terms of Service',
          body: (
            <>
              <p>Welcome to CrazyGame. By browsing or purchasing from our website, you agree to the following terms and conditions:</p>
              <h5>1. Ordering & Confirmations</h5>
              <p>Cash on delivery orders must be confirmed via a quick phone call or WhatsApp message from our team before we dispatch the items. If we cannot reach you within 48 hours, the order will be cancelled.</p>
              <h5>2. Digital Codes & Subscriptions</h5>
              <p>All digital products (gift cards, subscription keys, top-ups) are delivered instantly via email. Once a code is sent and redeemed, it is non-refundable and cannot be exchanged.</p>
              <h5>3. Pricing</h5>
              <p>While we make every effort to display accurate pricing, errors may occur. In the event of a pricing error, we reserve the right to cancel the order and issue a full refund.</p>
            </>
          )
        }
      case 'returns':
        return {
          title: 'Returns & Refund Policy',
          body: (
            <>
              <p>We want you to be completely satisfied with your purchase. Here is how our returns and refunds work:</p>
              <h5>1. Physical Games & Accessories</h5>
              <p>You can return any physical game, console, or accessory within 14 days of delivery. The item must be in its original, brand-new condition and the factory seal must be completely intact.</p>
              <h5>2. Digital Products</h5>
              <p>Due to the nature of digital keys and codes, all sales of digital gift cards, game codes, and subscriptions are final. No returns, refunds, or exchanges can be processed once the code has been issued.</p>
              <h5>3. Warranty</h5>
              <p>All brand-new gaming consoles and accessories sold through CrazyGame come with a 1-year local agent warranty in Egypt against manufacturing defects.</p>
            </>
          )
        }
      default:
        return null
    }
  }

  const policy = getPolicyContent()

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
              <a href="https://www.facebook.com/crazygame.egypt" target="_blank" rel="noopener noreferrer" className="iconbtn" title="Facebook" aria-label="Facebook">
                <Icon name="facebook" size={20} />
              </a>
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
            <a className="footer-link" onClick={() => shop.goAbout()}>About us</a>
            <a className="footer-link" onClick={() => shop.goContact()}>Contact</a>
            <a className="footer-link" onClick={() => shop.goShop({ sale: true })}>Today's deals</a>
            <a className="footer-link" onClick={() => shop.goAccount()}>Track order</a>
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
            <a className="footer-link" style={{ padding: 0 }} onClick={() => setActiveTab('privacy')}>Privacy</a>
            <a className="footer-link" style={{ padding: 0 }} onClick={() => setActiveTab('terms')}>Terms</a>
            <a className="footer-link" style={{ padding: 0 }} onClick={() => setActiveTab('returns')}>Returns</a>
          </div>
        </div>
      </div>

      {policy && (
        <div className="policy-modal-overlay" onClick={() => setActiveTab(null)}>
          <div className="policy-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setActiveTab(null)} aria-label="Close">
              <Icon name="close" size={16} />
            </button>
            <h4>{policy.title}</h4>
            <div className="content">
              {policy.body}
            </div>
            <button className="btn btn-primary btn-block" onClick={() => setActiveTab(null)}>Got it</button>
          </div>
        </div>
      )}
    </footer>
  )
}
