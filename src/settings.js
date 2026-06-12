/* Site settings — admin-controlled UI config.
   Stored in Supabase `site_settings` table (key/value JSON), cached in localStorage. */
import { supabase } from './supabase.js'

const LS_KEY = 'cg_site_settings'
const ROW_KEY = 'site'

export const DEFAULT_SETTINGS = {
  hero: {
    mode: 'carousel',           // 'carousel' | 'custom-image'
    featuredProductIds: [],     // ids used in carousel (empty = auto: tag 'featured' or random)
    customImage: {
      url: '',
      linkType: 'none',         // 'none' | 'product' | 'shop' | 'url'
      linkValue: '',            // product id, or external URL
      ctaText: '',              // optional CTA button text (empty = no button)
      headline: '',             // optional overlay headline
      subtext: '',              // optional overlay subtext
    },
  },
  sections: {
    marquee: true,
    platforms: true,
    newReleases: true,
    featureBanner: true,
    featureBannerProductId: null,
    ps5: true,
    switch2: true,
    switch: true,
    ps4: true,
    genres: true,
    upcoming: true,
    psnDigital: true,
    nintendoDigital: true,
    sale: true,
    blog: true,
  },
  loyalty: {
    enabled: true,
    multiplier: 0.2,
    label: 'Crazy Points',
  },
  // Scrolling "trust" strip under the hero. Editable from the dashboard.
  marqueeItems: [
    { icon: 'truck', text: 'Free delivery over EGP 1,500' },
    { icon: 'shield', text: '100% genuine sealed copies' },
    { icon: 'bolt', text: 'Instant digital code delivery' },
    { icon: 'tag', text: 'Price-match on new releases' },
    { icon: 'gift', text: 'Gift wrapping available' },
    { icon: 'check', text: 'Cash on delivery across Egypt' },
  ],
}

function deepMerge(base, override) {
  if (!override || typeof override !== 'object') return base
  const out = Array.isArray(base) ? [...base] : { ...base }
  for (const k of Object.keys(override)) {
    const bv = base?.[k], ov = override[k]
    if (bv && typeof bv === 'object' && !Array.isArray(bv) && ov && typeof ov === 'object' && !Array.isArray(ov)) {
      out[k] = deepMerge(bv, ov)
    } else if (ov !== undefined) {
      out[k] = ov
    }
  }
  return out
}

function readLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function writeLocal(s) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)) } catch {}
}

export async function loadSettings() {
  // Try DB
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', ROW_KEY)
      .maybeSingle()
    if (!error && data && data.value) {
      const merged = deepMerge(DEFAULT_SETTINGS, data.value)
      writeLocal(merged)
      return merged
    }
  } catch (e) {
    // table likely missing — fall back to local
  }
  const local = readLocal()
  return local ? deepMerge(DEFAULT_SETTINGS, local) : DEFAULT_SETTINGS
}

export async function saveSettings(settings) {
  writeLocal(settings)
  try {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: ROW_KEY, value: settings, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// Upload an image to Supabase Storage bucket `site-assets`. Returns public URL.
export async function uploadHeroImage(file) {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase()
  const path = `hero/hero-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('site-assets').upload(path, file, {
    cacheControl: '3600', upsert: true, contentType: file.type,
  })
  if (error) throw error
  const { data } = supabase.storage.from('site-assets').getPublicUrl(path)
  return data.publicUrl
}
