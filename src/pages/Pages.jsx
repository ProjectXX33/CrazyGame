/* Secondary pages: Wishlist, Digital codes, Blog */
import Icon from '../components/Icon.jsx'
import { ProductCard } from '../components/UI.jsx'
import { useShop, EGP } from '../context.js'
import { useSeo, blogPostingJsonLd, breadcrumbJsonLd, plainText, SITE } from '../seo.js'

export function Wishlist() {
  const shop = useShop()
  useSeo({ title: 'Your wishlist', path: '/wishlist', noindex: true })
  const items = shop.products.filter(p => shop.wish.includes(p.id))
  return (
    <div className="page wrap" style={{ paddingTop: 32, paddingBottom: 70 }}>
      <div className="crumb"><a onClick={() => shop.goHome()}>Home</a> <Icon name="chevR" /> <span>Wishlist</span></div>
      <div className="section-head" style={{ marginBottom: 28 }}>
        <div><h1 style={{ fontSize: 'clamp(28px,4vw,44px)' }}>Your wishlist</h1><div className="sub">{items.length} saved {items.length === 1 ? 'game' : 'games'}</div></div>
      </div>
      {items.length ? (
        <div className="product-grid">{items.map(p => <ProductCard key={p.id} p={p} w="100%" />)}</div>
      ) : (
        <div style={{ textAlign: 'center', padding: '70px 0', color: 'var(--text-faint)' }}>
          <div style={{ marginBottom: 14, opacity: .6 }}><Icon name="heart" size={54} /></div>
          <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>No saved games yet</h3>
          <p style={{ marginBottom: 20 }}>Tap the heart on any game to save it here.</p>
          <button className="btn btn-primary" onClick={() => shop.goShop({})}>Discover games</button>
        </div>
      )}
    </div>
  )
}

export function DigitalPage() {
  const shop = useShop()
  useSeo({
    title: 'Digital codes & memberships',
    description: 'Instant digital codes, top-ups, subscriptions and gift cards — delivered to your inbox within minutes. PSN, Xbox, Nintendo eShop and more.',
    path: '/digital',
  })
  return (
    <div className="page wrap" style={{ paddingTop: 32, paddingBottom: 70 }}>
      <div className="crumb"><a onClick={() => shop.goHome()}>Home</a> <Icon name="chevR" /> <span>Digital codes</span></div>
      <div className="section-head" style={{ marginBottom: 28 }}>
        <div>
          <div className="eyebrow accent"><Icon name="code" size={15} /> Instant email delivery</div>
          <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', marginTop: 10 }}>Digital codes &amp; memberships</h1>
          <div className="sub">Top-ups, subscriptions and gift cards — codes land in your inbox within minutes.</div>
        </div>
      </div>
      <div className="digital-grid">
        {shop.digital.map(d => (
          <div className="gift-card" key={d.id}>
            <div style={{ position: 'absolute', inset: 0, zIndex: -1, opacity: .18, background: `radial-gradient(120% 120% at 100% 0%, ${d.accent}, transparent 70%)` }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="gift-chip"></div>
              <span className="badge" style={{ background: 'var(--surface-3)', color: 'var(--text-dim)' }}>{d.kind}</span>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>{d.title}</div>
              <div className="muted" style={{ fontSize: 14, marginTop: 3 }}>{d.tier}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--accent-bright)' }}>{EGP(d.price)}</span>
                <button className="btn btn-primary btn-sm" onClick={() => shop.addToCart(d.id, true)}><Icon name="cart" size={15} /> Add</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ContactPage() {
  const shop = useShop()
  useSeo({
    title: 'Contact us',
    description: 'Get in touch with Crazy Game — questions about orders, delivery, digital codes or anything else. We reply fast.',
    path: '/contact',
  })
  return (
    <div className="page wrap" style={{ paddingTop: 32, paddingBottom: 70 }}>
      <div className="crumb"><a onClick={() => shop.goHome()}>Home</a> <Icon name="chevR" /> <span>Contact</span></div>
      <div className="section-head" style={{ marginBottom: 28 }}>
        <div>
          <div className="eyebrow">Talk to us</div>
          <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', marginTop: 10 }}>Get in touch</h1>
          <div className="sub">We reply to every message within 24 hours, usually faster.</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, marginBottom: 36 }}>
        {[
          { icon: 'bolt', label: 'WhatsApp', value: '+20 100 000 0000', href: 'https://wa.me/201000000000' },
          { icon: 'code', label: 'Email',    value: 'hello@crazygame-eg.com', href: 'mailto:hello@crazygame-eg.com' },
          { icon: 'check', label: 'Hours',   value: 'Sat – Thu · 11 AM – 10 PM' },
          { icon: 'truck', label: 'Address', value: 'Nasr City, Cairo, Egypt' },
        ].map((c, i) => (
          <a key={i} href={c.href || undefined} target={c.href ? '_blank' : undefined} rel="noreferrer"
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, padding: 22, textDecoration: 'none', color: 'inherit',
              display: 'block', cursor: c.href ? 'pointer' : 'default',
            }}>
            <div style={{ color: 'var(--accent-bright)', marginBottom: 10 }}>
              <Icon name={c.icon} size={20} />
            </div>
            <div className="muted" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{c.value}</div>
          </a>
        ))}
      </div>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 28, maxWidth: 680,
      }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>Need help with an order?</h3>
        <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.7, marginBottom: 16 }}>
          Have your order number handy and message us on WhatsApp — that's the fastest way to get a same-day reply. For pre-order or pre-owned questions, email works just as well.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a className="btn btn-primary" href="https://wa.me/201000000000" target="_blank" rel="noreferrer">
            <Icon name="bolt" size={16} /> WhatsApp us
          </a>
          <button className="btn btn-line" onClick={() => shop.goRequest()}>Request a game</button>
        </div>
      </div>
    </div>
  )
}

export function AboutPage() {
  const shop = useShop()
  useSeo({
    title: 'About us',
    description: "Crazy Game is Egypt's trusted store for video games, consoles, memberships and digital cards — genuine stock, fast delivery, cash on delivery.",
    path: '/about',
  })
  return (
    <div className="page wrap" style={{ paddingTop: 32, paddingBottom: 70 }}>
      <div className="crumb"><a onClick={() => shop.goHome()}>Home</a> <Icon name="chevR" /> <span>About</span></div>
      <div className="section-head" style={{ marginBottom: 32 }}>
        <div>
          <div className="eyebrow">Our story</div>
          <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', marginTop: 10 }}>About CrazyGame</h1>
          <div className="sub">Egypt's trusted gaming store — for the players, by players.</div>
        </div>
      </div>

      <div style={{ maxWidth: 720, fontSize: 16, lineHeight: 1.75, color: 'var(--text)' }}>
        <p>CrazyGame started in 2018 as a small Cairo shop run by two friends who couldn't find a reliable, fairly-priced place to buy the games they wanted. We figured if we couldn't, neither could anyone else.</p>
        <p>Six years later, we're one of the largest independent game retailers in Egypt — but the philosophy hasn't changed: every disc is genuine and factory-sealed, every digital code is delivered within minutes, and every customer talks to a real human when they need help.</p>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginTop: 32, marginBottom: 12 }}>What we sell</h2>
        <ul style={{ marginBottom: 20, paddingLeft: 22, lineHeight: 1.85 }}>
          <li>New & pre-owned games for PS5, PS4, Switch 2, Switch and Xbox</li>
          <li>Official consoles, controllers, and accessories</li>
          <li>Digital codes and memberships — PSN, eShop, Switch Online, Xbox Game Pass</li>
          <li>Pre-orders for upcoming releases, locked in at launch price</li>
        </ul>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginTop: 32, marginBottom: 12 }}>How we deliver</h2>
        <ul style={{ marginBottom: 20, paddingLeft: 22, lineHeight: 1.85 }}>
          <li><strong>Free delivery</strong> across Egypt on orders over EGP 1,500</li>
          <li><strong>Cash on delivery</strong> available everywhere — no card required</li>
          <li><strong>Digital codes</strong> arrive in your inbox in minutes, not days</li>
          <li><strong>Price-match guarantee</strong> on new releases — see a lower price elsewhere, we match it</li>
        </ul>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginTop: 32, marginBottom: 12 }}>Why people trust us</h2>
        <p>We don't pad our catalogue with grey-market imports. Every console is region-correct, every game is sealed by the publisher, every digital code is from an official distributor. If something goes wrong, we fix it — fast — without making you fight for it.</p>
      </div>

      <div style={{ marginTop: 36, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => shop.goShop({})}>Browse the store</button>
        <button className="btn btn-line" onClick={() => shop.goContact()}>Contact us</button>
      </div>
    </div>
  )
}

export function BlogPage() {
  const shop = useShop()
  useSeo({
    title: 'The Crazy Game blog — news & guides',
    description: 'Gaming news, reviews, buying guides and tips from the Crazy Game team.',
    path: '/blog',
  })
  return (
    <div className="page wrap" style={{ paddingTop: 32, paddingBottom: 70 }}>
      <div className="crumb"><a onClick={() => shop.goHome()}>Home</a> <Icon name="chevR" /> <span>Blog</span></div>
      <div className="section-head" style={{ marginBottom: 28 }}>
        <div><div className="eyebrow">News &amp; guides</div><h1 style={{ fontSize: 'clamp(28px,4vw,44px)', marginTop: 10 }}>The CrazyGame blog</h1></div>
      </div>
      <div className="blog-grid">
        {shop.posts.map(post => {
          const h = post.hue, h2 = (h + 40) % 360
          return (
            <article className="blog-card" key={post.id} onClick={() => shop.goBlogPost(post.slug)}
              style={{ cursor: 'pointer' }}>
              <div className="blog-thumb">
                <div style={{ position: 'absolute', inset: 0, transition: 'transform .6s var(--ease)',
                  background: post.image
                    ? `url(${post.image}) center/cover no-repeat`
                    : `linear-gradient(135deg, oklch(0.5 0.18 ${h}), oklch(0.25 0.08 ${h2}))` }}></div>
                {!post.image && <div className="cover-grain"></div>}
                <span className="badge" style={{ position: 'absolute', top: 12, left: 12, background: 'var(--scrim)', color: '#fff', backdropFilter: 'blur(6px)' }}>{post.cat}</span>
              </div>
              <div className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>{post.date} · {post.read} read</div>
              <h3 className="blog-title" style={{ marginTop: 7 }}>{post.title}</h3>
              {post.excerpt && (
                <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55, marginTop: 8 }}>{post.excerpt}</p>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}

export function BlogPostPage({ slug }) {
  const shop = useShop()
  const post = shop.posts.find(p => p.slug === slug) || shop.posts.find(p => String(p.id) === String(slug))

  const postPath = '/blog/' + encodeURIComponent(post?.slug || slug)
  useSeo(
    () => post
      ? {
          title: post.title,
          description: plainText(post.excerpt || post.body || post.title, 160),
          path: postPath,
          image: post.image || SITE.defaultImage,
          type: 'article',
          jsonLd: [
            blogPostingJsonLd(post, postPath),
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Blog', path: '/blog' },
              { name: post.title, path: postPath },
            ]),
          ],
        }
      : { title: 'Article not found', path: postPath, noindex: true },
    [post?.id],
  )

  if (!post) {
    return (
      <div className="page wrap" style={{ paddingTop: 60, paddingBottom: 70, textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)' }}>Article not found</h2>
        <p className="muted">It may have been removed or the link is wrong.</p>
        <button className="btn btn-primary" onClick={() => shop.goBlog()}>Back to blog</button>
      </div>
    )
  }

  const h = post.hue, h2 = (h + 40) % 360
  const related = shop.posts.filter(p => p.slug !== post.slug).slice(0, 3)

  return (
    <div className="page" style={{ paddingBottom: 70 }}>
      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: post.image
            ? `url(${post.image}) center/cover no-repeat`
            : `linear-gradient(135deg, oklch(0.45 0.2 ${h}), oklch(0.2 0.08 ${h2}))`,
        }} />
        {!post.image && <div className="cover-grain" style={{ position: 'absolute', inset: 0 }} />}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 30%, var(--bg) 100%)',
        }} />
        <div className="wrap" style={{ position: 'relative', padding: '64px 0 48px' }}>
          <div className="crumb" style={{ color: 'rgba(255,255,255,0.85)' }}>
            <a onClick={() => shop.goHome()} style={{ color: 'inherit' }}>Home</a> <Icon name="chevR" />
            <a onClick={() => shop.goBlog()} style={{ color: 'inherit' }}>Blog</a> <Icon name="chevR" />
            <span>{post.cat}</span>
          </div>
          <div style={{ display: 'inline-block', marginTop: 18, marginBottom: 14,
            background: 'rgba(255,255,255,0.18)', color: '#fff', backdropFilter: 'blur(6px)',
            padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
          }}>{post.cat}</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 54px)',
            color: '#fff', lineHeight: 1.05, marginBottom: 18, maxWidth: '20ch',
          }}>{post.title}</h1>
          {post.excerpt && (
            <p style={{
              color: 'rgba(255,255,255,0.9)', fontSize: 18, lineHeight: 1.5,
              maxWidth: '60ch', marginBottom: 22,
            }}>{post.excerpt}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: 'rgba(255,255,255,0.9)', fontSize: 13.5, fontWeight: 600 }}>
            {post.author && (
              <>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.25)', color: '#fff',
                  display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14,
                }}>{post.author[0]}</div>
                <span>{post.author}</span>
                <span style={{ opacity: .5 }}>·</span>
              </>
            )}
            <span>{post.date}</span>
            <span style={{ opacity: .5 }}>·</span>
            <span>{post.read} read</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <article className="wrap" style={{ maxWidth: 720, padding: '40px 0 24px' }}>
        <div className="rte-out" dangerouslySetInnerHTML={{ __html: post.body || '' }} />
      </article>

      {/* Share & back-to-blog footer */}
      <div className="wrap" style={{ maxWidth: 720, padding: '8px 0 40px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
          flexWrap: 'wrap', gap: 12,
        }}>
          <button className="btn btn-line" onClick={() => shop.goBlog()}>
            <Icon name="chevL" size={16} /> All articles
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => {
              const url = window.location.href
              if (navigator.share) navigator.share({ title: post.title, url }).catch(() => {})
              else { navigator.clipboard?.writeText(url); shop.pushToast('Link copied') }
            }}>
              <Icon name="arrowR" size={15} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="wrap" style={{ paddingTop: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 16 }}>More from the blog</h2>
          <div className="blog-grid">
            {related.map(r => {
              const rh = r.hue, rh2 = (rh + 40) % 360
              return (
                <article className="blog-card" key={r.id} onClick={() => shop.goBlogPost(r.slug)}
                  style={{ cursor: 'pointer' }}>
                  <div className="blog-thumb">
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, oklch(0.5 0.18 ${rh}), oklch(0.25 0.08 ${rh2}))`, transition: 'transform .6s var(--ease)' }}></div>
                    <div className="cover-grain"></div>
                    <span className="badge" style={{ position: 'absolute', top: 12, left: 12, background: 'var(--scrim)', color: '#fff', backdropFilter: 'blur(6px)' }}>{r.cat}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>{r.date} · {r.read} read</div>
                  <h3 className="blog-title" style={{ marginTop: 7 }}>{r.title}</h3>
                </article>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
