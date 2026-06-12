/* Cart drawer + cart/checkout page */
import { useState, useEffect } from 'react'
import Icon from './Icon.jsx'
import { useShop, EGP } from '../context.js'
import { CoverArt } from './UI.jsx'
import { supabase } from '../supabase.js'
import { useSeo } from '../seo.js'

function Thumb({ item }) {
  if (item.digital) {
    return <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${item.accent}, oklch(0.2 0.05 264))`, display: 'grid', placeItems: 'center' }}><Icon name="code" size={20} style={{ color: '#fff' }} /></div>
  }
  return <CoverArt p={item} />
}

function CartLine({ line, compact }) {
  const shop = useShop()
  const it = line.item
  const unitPrice = line.variant?.price ?? it.price
  return (
    <div className="cart-row">
      <div className="cart-thumb" style={compact ? null : { width: 84, height: 110 }}><Thumb item={it} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: compact ? 14.5 : 16, cursor: it.digital ? 'default' : 'pointer', lineHeight: 1.2 }}
              onClick={() => !it.digital && shop.goProduct(it.id)}>{it.title}</div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>
              {line.variant ? line.variant.label : (it.digital ? it.tier : it.platform + ' · ' + it.genre)}
            </div>
          </div>
          <button className="iconbtn" style={{ width: 32, height: 32, background: 'transparent', border: 'none' }} onClick={() => shop.removeFromCart(line.key)}><Icon name="trash" size={16} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <div className="qty">
            <button onClick={() => shop.setQty(line.key, line.qty - 1)}><Icon name="minus" size={14} /></button>
            <span>{line.qty}</span>
            <button onClick={() => shop.setQty(line.key, line.qty + 1)}><Icon name="plus" size={14} /></button>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: compact ? 15 : 17, color: 'var(--primary-bright)' }}>{EGP(unitPrice * line.qty)}</span>
        </div>
      </div>
    </div>
  )
}

function calcTotals(lines, shipping) {
  const sub = lines.reduce((s, l) => s + (l.variant?.price ?? l.item.price) * l.qty, 0)
  const ship = sub >= 1500 || sub === 0 ? 0 : 80
  return { sub, ship: shipping === false ? 0 : ship, total: sub + (shipping === false ? 0 : ship) }
}

function EmptyCart({ onShop }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-faint)' }}>
      <div style={{ marginBottom: 14, opacity: .6 }}><Icon name="cart" size={56} /></div>
      <h3 style={{ marginBottom: 6, color: 'var(--text)' }}>Your cart is empty</h3>
      <p style={{ marginBottom: 20, fontSize: 14.5 }}>Find your next adventure in the store.</p>
      <button className="btn btn-primary" onClick={onShop}>Browse games</button>
    </div>
  )
}

export function CartDrawer() {
  const shop = useShop()
  if (!shop.cartOpen) return null
  const lines = shop.cartLines
  const t = calcTotals(lines)
  return (
    <>
      <div className="drawer-scrim" onClick={shop.closeCart}></div>
      <div className="drawer">
        <div className="drawer-head">
          <h3 style={{ fontSize: 20, display: 'flex', alignItems: 'center', gap: 10 }}><Icon name="cart" /> Your cart {lines.length ? <span className="muted" style={{ fontSize: 15, fontWeight: 600 }}>({shop.cartCount})</span> : null}</h3>
          <button className="iconbtn" onClick={shop.closeCart}><Icon name="close" /></button>
        </div>
        <div className="drawer-body">
          {lines.length ? lines.map(l => <CartLine key={l.key} line={l} compact />) : <EmptyCart onShop={() => { shop.closeCart(); shop.goShop({}) }} />}
        </div>
        {lines.length ? (
          <div className="drawer-foot">
            {t.sub < 1500 ? (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, color: 'var(--text-dim)' }}>
                  <span>Add {EGP(1500 - t.sub)} for free delivery</span>
                </div>
                <div style={{ height: 6, borderRadius: 10, background: 'var(--surface-3)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: Math.min(100, (t.sub / 1500) * 100) + '%', background: 'linear-gradient(90deg, var(--primary), var(--primary-bright))', transition: 'width .4s' }}></div>
                </div>
              </div>
            ) : null}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'var(--text-dim)', fontSize: 14 }}><span>Subtotal</span><span>{EGP(t.sub)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, color: 'var(--text-dim)', fontSize: 14 }}><span>Delivery</span><span>{t.ship ? EGP(t.ship) : 'Free'}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19 }}><span>Total</span><span>{EGP(t.total)}</span></div>
            <button className="btn btn-primary btn-lg btn-block" onClick={() => { shop.closeCart(); shop.goCart() }}>Checkout <Icon name="arrowR" size={18} /></button>
          </div>
        ) : null}
      </div>
    </>
  )
}

const BLANK_CHECKOUT = {
  customer_name: '', phone: '', email: '',
  address: '', city: '', governorate: '',
  payment_method: 'cod',
}

export function CartPage() {
  const shop = useShop()
  useSeo({ title: 'Your cart', path: '/cart', noindex: true })
  const lines = shop.cartLines
  const [step, setStep] = useState(0)
  const [placing, setPlacing] = useState(false)
  const [orderErr, setOrderErr] = useState('')
  const [form, setForm] = useState(BLANK_CHECKOUT)
  const setF = (patch) => setForm(f => ({ ...f, ...patch }))
  const t = calcTotals(lines)

  // Load saved delivery details for logged-in users
  useEffect(() => {
    if (!shop.user) return
    ;(async () => {
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('customer_name, phone, email, address, city, governorate')
          .eq('user_id', shop.user.id)
          .maybeSingle()
        if (data) {
          setForm(f => ({
            ...f,
            customer_name: data.customer_name || f.customer_name,
            phone: data.phone || f.phone,
            email: data.email || f.email,
            address: data.address || f.address,
            city: data.city || f.city,
            governorate: data.governorate || f.governorate,
          }))
        }
      } catch (e) {
        // Table may not exist yet — silently fall back
        console.warn('Could not load saved delivery details:', e.message)
      }
    })()
  }, [shop.user])

  async function placeOrder() {
    setPlacing(true); setOrderErr('')
    try {
      // Basic validation — required delivery fields
      const missing = ['customer_name', 'phone', 'address', 'city'].filter(k => !form[k]?.trim())
      if (missing.length > 0) {
        throw new Error('Please fill: ' + missing.map(k => k.replace('_', ' ')).join(', '))
      }

      // Serialize cart lines into a snapshot for the order
      const itemsSnap = lines.map(l => ({
        product_id: l.id,
        title: l.item?.title || '',
        slug: l.item?.slug || null,
        img: l.item?.img || null,
        qty: l.qty,
        unit_price: l.variant?.price ?? l.item?.price ?? 0,
        digital: !!l.digital,
        variant_id: l.variant?.id || null,
        variant_label: l.variant?.label || null,
      }))

      // Insert the order
      const payload = {
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        governorate: form.governorate.trim() || null,
        payment_method: form.payment_method,
        items: itemsSnap,
        subtotal: t.sub,
        shipping: t.ship,
        total: t.total,
        item_count: lines.reduce((s, l) => s + l.qty, 0),
        user_id: shop.user?.id || null,
      }
      const { error: insErr } = await supabase.from('orders').insert(payload)
      if (insErr) throw insErr

      // Then decrement stock atomically (physical lines only)
      const stockItems = lines
        .filter(l => !l.digital && l.item?.stock != null)
        .map(l => ({ product_id: l.id, qty: l.qty }))
      if (stockItems.length > 0) {
        const { error: rpcErr } = await supabase.rpc('decrement_stock', { items: stockItems })
        if (rpcErr) console.warn('Stock decrement failed:', rpcErr.message)
      }

      await shop.refetchProducts?.()

      // Save delivery details for registered users (not guests)
      if (shop.user?.id) {
        const profile = {
          user_id: shop.user.id,
          customer_name: form.customer_name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || shop.user.email || null,
          address: form.address.trim() || null,
          city: form.city.trim() || null,
          governorate: form.governorate.trim() || null,
          updated_at: new Date().toISOString(),
        }
        // Upsert — insert if first order, update if returning
        await supabase
          .from('user_profiles')
          .upsert(profile, { onConflict: 'user_id' })
          .then(({ error }) => {
            if (error) console.warn('Could not save delivery profile:', error.message)
          })
      }

      shop.clearCart()
      setForm(BLANK_CHECKOUT)
      setStep(2)
      window.scrollTo(0, 0)
    } catch (e) {
      setOrderErr(e.message || 'Could not place order. Try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (!lines.length && step < 2) {
    return <div className="page wrap" style={{ paddingTop: 40, paddingBottom: 80 }}><EmptyCart onShop={() => shop.goShop({})} /></div>
  }

  if (step === 2) {
    return (
      <div className="page wrap" style={{ paddingTop: 60, paddingBottom: 100, textAlign: 'center', maxWidth: 560 }}>
        <div className="glow-accent" style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--surface)', display: 'grid', placeItems: 'center', margin: '0 auto 24px', color: 'var(--accent-bright)' }}><Icon name="check" size={40} /></div>
        <h1 style={{ fontSize: 36, marginBottom: 12 }}>Order confirmed!</h1>
        <p className="muted" style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 28 }}>Thanks for shopping with CrazyGame. A confirmation has been sent to your email and we'll text you when your order is on the way.</p>
        <button className="btn btn-primary btn-lg" onClick={() => shop.goHome()}>Back to store</button>
      </div>
    )
  }

  return (
    <div className="page wrap" style={{ paddingTop: 32, paddingBottom: 80 }}>
      <div className="crumb"><a onClick={() => shop.goHome()}>Home</a> <Icon name="chevR" /> <span>{step === 0 ? 'Cart' : 'Checkout'}</span></div>
      <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', marginBottom: 28 }}>{step === 0 ? 'Your cart' : 'Checkout'}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 36, alignItems: 'start' }} className="cart-grid">
        <div>
          {step === 0 ? (
            <div className="surface-card" style={{ padding: '4px 24px' }}>
              {lines.map(l => <CartLine key={l.key} line={l} />)}
            </div>
          ) : (
            <div className="surface-card" style={{ padding: 26 }}>
              <h3 style={{ marginBottom: 18 }}>Delivery details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  ['customer_name', 'Full name *', '1 / span 2'],
                  ['phone', 'Phone *', ''],
                  ['email', 'Email', ''],
                  ['address', 'Address *', '1 / span 2'],
                  ['city', 'City *', ''],
                  ['governorate', 'Governorate', ''],
                ].map(([key, label, span]) => (
                  <div key={key} style={{ gridColumn: span || 'auto' }}>
                    <label className="muted" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>{label}</label>
                    <input className="select"
                      type={key === 'email' ? 'email' : (key === 'phone' ? 'tel' : 'text')}
                      style={{ width: '100%', height: 46 }}
                      placeholder={label.replace(' *', '')}
                      value={form[key]} onChange={e => setF({ [key]: e.target.value })} />
                  </div>
                ))}
              </div>
              <h3 style={{ margin: '26px 0 14px' }}>Payment</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['cod',       'Cash on delivery'],
                  ['card',      'Credit / debit card'],
                  ['fawry',     'Fawry / Meeza'],
                  ['instapay',  'Instapay'],
                ].map(([val, m]) => (
                  <label key={val} className={'fopt' + (form.payment_method === val ? ' on' : '')}
                    style={{ border: '1px solid var(--border)', borderRadius: 11, padding: '12px 14px', margin: 0, cursor: 'pointer' }}
                    onClick={() => setF({ payment_method: val })}>
                    <span className="fbox"
                      style={form.payment_method === val
                        ? null
                        : { background: 'transparent', borderColor: 'var(--border)', color: 'transparent' }}>
                      {form.payment_method === val ? <Icon name="check" size={13} /> : null}
                    </span>
                    <span style={{ color: 'var(--text)' }}>{m}</span>
                  </label>
                ))}
              </div>
              {orderErr && (
                <div style={{
                  marginTop: 18, padding: 12, borderRadius: 10,
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#ef4444', fontSize: 14,
                }}>{orderErr}</div>
              )}
            </div>
          )}
        </div>

        <div className="surface-card" style={{ padding: 26, position: 'sticky', top: 'calc(var(--full-header-h) + 24px)' }}>
          <h3 style={{ marginBottom: 18 }}>Order summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, color: 'var(--text-dim)', fontSize: 14.5 }}><span>Subtotal ({shop.cartCount} items)</span><span>{EGP(t.sub)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, color: 'var(--text-dim)', fontSize: 14.5 }}><span>Delivery</span><span>{t.ship ? EGP(t.ship) : 'Free'}</span></div>
          <hr className="divider" style={{ margin: '14px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}><span>Total</span><span>{EGP(t.total)}</span></div>
          {step === 0 ? (
            <button className="btn btn-primary btn-lg btn-block" onClick={() => setStep(1)}>Continue to checkout <Icon name="arrowR" size={18} /></button>
          ) : (
            <>
              <button className="btn btn-primary btn-lg btn-block" disabled={placing} onClick={placeOrder}>
                {placing ? 'Placing order…' : <>Place order <Icon name="check" size={18} /></>}
              </button>
              <button className="btn btn-line btn-block" style={{ marginTop: 10 }} onClick={() => setStep(0)}>Back to cart</button>
            </>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 16, color: 'var(--text-faint)', fontSize: 12.5 }}>
            <Icon name="shield" size={15} /> Secure checkout
          </div>
        </div>
      </div>
    </div>
  )
}
