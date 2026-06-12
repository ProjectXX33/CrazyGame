/* Customer-facing pages: Login, Signup, My Account */
import { useState, useEffect } from 'react'
import { useShop } from '../context.js'
import { signUp, signIn, signOut, getProfile, updateProfile } from '../auth.js'
import Icon from '../components/Icon.jsx'
import { useSeo } from '../seo.js'

const inputStyle = {
  width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)',
  color: 'var(--text)', padding: '12px 14px', borderRadius: 10, fontSize: 14.5, boxSizing: 'border-box',
}

function AuthCard({ children }) {
  return (
    <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 32, width: 'min(440px, 100%)',
        boxShadow: 'var(--shadow-pop)', display: 'flex', flexDirection: 'column', gap: 14,
      }}>{children}</div>
    </div>
  )
}

export function LoginPage() {
  const shop = useShop()
  useSeo({ title: 'Log in', path: '/login', noindex: true })
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setErr('')
    const res = await signIn({ email, password: pw })
    setBusy(false)
    if (!res.ok) { setErr(res.error); return }
    shop.pushToast('Welcome back!')
    shop.goAccount()
  }

  return (
    <AuthCard>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36 }}>👋</div>
        <h2 style={{ fontFamily: 'var(--font-display)', margin: '10px 0 4px' }}>Welcome back</h2>
        <div className="muted" style={{ fontSize: 13.5 }}>Sign in to your account</div>
      </div>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={inputStyle} />
        <input type="password" required value={pw} onChange={e => setPw(e.target.value)} placeholder="Password" style={inputStyle} />
        {err && <div style={{ color: '#e44', fontSize: 13 }}>{err}</div>}
        <button type="submit" disabled={busy} className="btn btn-primary btn-lg">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <div style={{ textAlign: 'center', fontSize: 13.5 }} className="muted">
        New here? <a onClick={() => shop.goSignup()} style={{ color: 'var(--accent-bright)', cursor: 'pointer', fontWeight: 600 }}>Create an account</a>
      </div>
    </AuthCard>
  )
}

export function SignupPage() {
  const shop = useShop()
  useSeo({ title: 'Create account', path: '/signup', noindex: true })
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    if (form.password.length < 6) { setErr('Password must be at least 6 characters'); return }
    setBusy(true); setErr(''); setMsg('')
    const res = await signUp(form)
    setBusy(false)
    if (!res.ok) { setErr(res.error); return }
    if (res.needsConfirm) {
      setMsg('Check your email to confirm your account, then sign in.')
    } else {
      shop.pushToast('Account created!')
      shop.goAccount()
    }
  }

  return (
    <AuthCard>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36 }}>🎮</div>
        <h2 style={{ fontFamily: 'var(--font-display)', margin: '10px 0 4px' }}>Create account</h2>
        <div className="muted" style={{ fontSize: 13.5 }}>Join Crazy Game</div>
      </div>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input required value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Full name" style={inputStyle} />
        <input type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="Email" style={inputStyle} />
        <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Phone (optional)" style={inputStyle} />
        <input type="password" required value={form.password} onChange={e => set('password', e.target.value)} placeholder="Password (min 6 chars)" style={inputStyle} />
        {err && <div style={{ color: '#e44', fontSize: 13 }}>{err}</div>}
        {msg && <div style={{ color: 'var(--accent-bright)', fontSize: 13 }}>{msg}</div>}
        <button type="submit" disabled={busy} className="btn btn-primary btn-lg">
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <div style={{ textAlign: 'center', fontSize: 13.5 }} className="muted">
        Already a member? <a onClick={() => shop.goLogin()} style={{ color: 'var(--accent-bright)', cursor: 'pointer', fontWeight: 600 }}>Sign in</a>
      </div>
    </AuthCard>
  )
}

export function AccountPage() {
  const shop = useShop()
  useSeo({ title: 'My account', path: '/account', noindex: true })
  const user = shop.user
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', address: '' })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!user) return
    getProfile(user.id).then(p => {
      setProfile(p)
      if (p) setForm({ full_name: p.full_name || '', phone: p.phone || '', address: p.address || '' })
    })
  }, [user])

  if (!user) {
    return (
      <AuthCard>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36 }}>🔒</div>
          <h2 style={{ fontFamily: 'var(--font-display)', margin: '10px 0' }}>Sign in required</h2>
          <button className="btn btn-primary" onClick={() => shop.goLogin()}>Sign in</button>
        </div>
      </AuthCard>
    )
  }

  async function save() {
    setBusy(true); setMsg('')
    const res = await updateProfile(user.id, form)
    setBusy(false)
    if (res.ok) {
      setProfile({ ...profile, ...form })
      setEditing(false)
      setMsg('Profile updated')
      setTimeout(() => setMsg(''), 2500)
    } else {
      setMsg('Error: ' + res.error)
    }
  }

  return (
    <div className="wrap" style={{ paddingTop: 30, paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div className="eyebrow accent">My account</div>
          <h1 style={{ fontFamily: 'var(--font-display)', margin: '8px 0 0' }}>{profile?.full_name || user.email}</h1>
        </div>
        <button className="btn btn-line btn-sm" onClick={async () => { await signOut(); shop.goHome() }}>
          <Icon name="arrowR" size={14} /> Sign out
        </button>
      </div>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 24, maxWidth: 560,
      }}>
        {msg && <div style={{ padding: 10, marginBottom: 14, borderRadius: 8, background: 'var(--surface-2)', fontSize: 13.5 }}>{msg}</div>}

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 4 }}>Full name</div>
              <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 4 }}>Phone</div>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 4 }}>Address</div>
              <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={3} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save'}</button>
              <button className="btn btn-line" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Row label="Email" value={user.email} />
            <Row label="Full name" value={profile?.full_name || '—'} />
            <Row label="Phone" value={profile?.phone || '—'} />
            <Row label="Address" value={profile?.address || '—'} />
            <Row label="Member since" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'} />
            <button className="btn btn-line" style={{ alignSelf: 'flex-start', marginTop: 6 }} onClick={() => setEditing(true)}>
              Edit profile
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
      <div className="muted" style={{ fontSize: 13.5 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, textAlign: 'right' }}>{value}</div>
    </div>
  )
}
