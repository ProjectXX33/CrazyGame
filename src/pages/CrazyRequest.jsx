import { useState } from 'react'
import { useShop } from '../context.js'
import Icon from '../components/Icon.jsx'
import { supabase } from '../supabase.js'
import { uploadProductImage } from '../upload.js'
import { useSeo } from '../seo.js'

export default function CrazyRequest() {
  const shop = useShop()
  useSeo({
    title: "Request a game — can't find it? We'll get it",
    description: "Can't find a game, console or accessory? Send us a request and the Crazy Game team will source it for you.",
    path: '/request',
  })
  const [form, setForm] = useState({ name: '', phone: '', game: '' })
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!form.name || !form.phone || !form.game) return
    setBusy(true); setErr('')
    try {
      let imageUrl = null
      if (file) {
        try { imageUrl = (await uploadProductImage(file)).url }
        catch (uploadErr) { console.warn('Image upload failed (continuing without):', uploadErr.message) }
      }
      const { error } = await supabase.from('game_requests').insert({
        name: form.name.trim(),
        phone: form.phone.trim(),
        game_title: form.game.trim(),
        image_url: imageUrl,
        user_id: shop.user?.id || null,
      })
      if (error) throw error
      shop.pushToast(`Request for ${form.game} received!`)
      shop.goHome()
    } catch (ex) {
      setErr(ex.message || 'Failed to submit. Try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page wrap" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 640 }}>
      <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', marginBottom: 12, color: 'var(--accent)' }}>CrazyRequest</h1>
      <p style={{ color: 'var(--text-dim)', fontSize: 16, lineHeight: 1.6, marginBottom: 40 }}>
        Can't find the game you're looking for? Let us know what you want, and our team will hunt it down for you. Fast, reliable, and entirely for you.
      </p>

      <form className="request-form" onSubmit={submit}>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input type="tel" placeholder="+20 100 123 4567" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
        </div>

        <div className="form-group">
          <label>Requested Game Title</label>
          <input type="text" placeholder="e.g. Halo Infinite" value={form.game} onChange={e => setForm({...form, game: e.target.value})} required />
        </div>

        <div className="form-group">
          <label>Reference Image (Optional)</label>
          <label className="file-upload">
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
            <Icon name="image" size={24} />
            <span>{file ? file.name : 'Click to upload a cover or screenshot'}</span>
          </label>
        </div>

        {err && (
          <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 14 }}>
            {err}
          </div>
        )}

        <button type="submit" disabled={busy} className="btn btn-primary btn-lg btn-block" style={{ marginTop: 24, padding: 18, fontSize: 18 }}>
          <Icon name="bolt" size={20} /> {busy ? 'Submitting…' : 'Submit Request'}
        </button>
      </form>
    </div>
  )
}
